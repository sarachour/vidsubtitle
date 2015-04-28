
var SegmentBar = function(id, model){
   this.init = function(id, model){
      var that = this;
      this._id = id;
      this._model = model;
      this._view = {};
      this._view.canv = $("<canvas/>");
      this._view.ctx = this._view.canv[0].getContext('2d');


      this._view.gcanv = $("<canvas/>");
      this._view.gctx = this._view.gcanv[0].getContext('2d');

      that._state = {};
      that._state.x = null;
      that._state.y = null;
      this._state.selection = null;
      this._state.viewport = {};
       that._state.viewport.force_slide = false;
      that._state.viewport.width = 30;
      this._model.listen('update',function(){that._draw();})
      $("#"+id).html("").css('height',100);

      this._view.canv
         .css('width',"100%")
         .css('height',40);

      this._view.gcanv
         .css('width',"100%")
         .css('height',20);
      
      var norm = function(e){
         return {
            x:e.offsetX/that._view.canv.width(),
            y:e.offsetY/that._view.canv.height()
         };
      }
      var gnorm = function(e){
         return {
            x:e.offsetX/that._view.gcanv.width(),
            y:e.offsetY/that._view.gcanv.height()
         };
      }
      //segment canvas
      this._view.canv
         .mousemove(function(e){
            var c = norm(e);
            that._state.x = c.x;
            that._state.y = c.y;
            that._draw();
         })
         .click(function(e){
            console.log("click");
            that._select();
         })
         .mouseleave(function(e){
            that._state.x = null;
            that._state.y = null;
         })

      //global canvas
      this._view.gcanv
         .click(function(e){
            var d = that._model.get_data();
            var c = gnorm(e);
            that._model.select(c.x*d.duration);

         })
      this._view.times = $("<div/>");
      this._view.start = $("<span/>").css('float','left').html("Start Time");
      this._view.end = $("<span/>").css('float','right').html("End Time");
      this._view.times.append(this._view.start,this._view.end)
      $("#"+id).html("").append(this._view.canv,this._view.times,this._view.gcanv);
      this._draw();
   }
   this._resize = function(){
      this._view.canv.attr("width",this._view.canv[0].offsetWidth);
      this._view.canv.attr("height",this._view.canv[0].offsetHeight);

      this._view.gcanv.attr("width",this._view.gcanv[0].offsetWidth);
      this._view.gcanv.attr("height",this._view.gcanv[0].offsetHeight);
   }
   this._select = function(){
      if(this._state.selection != null){
         var v = this._get_viewport(this._model.get_data());
         this._model.select(this._state.x*(v.end-v.start)+v.start);
      }
   }
   this._get_viewport = function(d){
      var t = d.time;
      var sel = clone(d.selection);
      var range =  this._state.viewport.width/2; //10 seconds

      console.log(this._state.viewport,this._state.viewport.force_slide);
      if(sel.subtype != "continue"){
         if(this._state.viewport.start <= sel.start && 
            this._state.viewport.end >= sel.end)
         return this._state.viewport;

         this._state.viewport.start = Math.max(sel.start-range,0);
         this._state.viewport.end = Math.max(Math.min(sel.start + range,d.duration),range*2);
      }
      else{
         this._state.viewport.start = Math.max(d.time-range,0);
         this._state.viewport.end = Math.max(Math.min(d.time+range,d.duration),range*2); 
      }
      return this._state.viewport;
   }
   this._draw = function(){
      this._resize();

      var that = this;
      var ctx = this._view.ctx;
      var gctx = this._view.gctx;

      var d = this._model.get_data();
      var width = this._view.canv.width();
      var height = this._view.canv.height();


      var gwidth = this._view.gcanv.width();
      var gheight = this._view.gcanv.height();

      var viewport = this._get_viewport(d);

      var x = function(v){return (v-viewport.start)*width/(viewport.end - viewport.start);}
      var y = function(v){return v*height/1;}
      var w = function(v){return (v)*width/(viewport.end - viewport.start);}
      var h = function(v){return v*height/1;}

      var x_to_t = function(v){return v*(viewport.end - viewport.start)+viewport.start}
      var gx = function(v){return v*gwidth/d.duration}
      var gy = function(v){return v*gheight/1.0}

      var fixed = {};
      fixed.block_pad = 5;

      fixed.plumbob = {};
      fixed.plumbob.marker_width = 6;
      fixed.plumbob.stem_width = fixed.plumbob.marker_width/2;
      var prop = {};
      
      prop.markers = {};
      prop.markers.start = 0;
      prop.markers.end = 0.25;

      prop.prog = {};
      prop.prog.start = 0.25;
      prop.prog.end = 0.80;
      
      prop.footer = {};
      prop.footer.start = 0.90;
      prop.footer.end = 1.0;

      prop.global = {};
      prop.global.start = 0;
      prop.global.end = 1.0;

      var colors = {};
      // a pause marker
      colors.pause = {};
      colors.pause.marker = "#2980b9";
      colors.pause.stem = "#2980b9";
      
      //the cursor showing where you are currently
      colors.cursor = {};
      colors.cursor.marker = "#f39c12";
      colors.cursor.stem = "#f39c12";

      //the selected segment
      colors.selected = "#2ecc71";
      colors.hovered = "#f1c40f";
      colors.block = "black";

      colors.progbar = {};
      colors.progbar.elapsed = "#F5A9A9";
      colors.progbar.total = "#E0E0E0";
      colors.progbar.ignore = "#ecf0f1";

      colors.background = {};
      colors.background.all = "white";
      colors.background.markers = "white";
      colors.background.footer = "white";

      colors.global = {};
      colors.global.background = "black";
      colors.global.highlight = "lightgrey";
      colors.global.progress = "#2ecc71";
      colors.global.oobprogress = "#1A7540";

      this._view.start.html(viewport.start);
      this._view.end.html(viewport.end);
      if(d.duration == null || d.duration == 0) return;
      //fill in background
      ctx.fillStyle = colors.background.all;
      ctx.fillRect(x(viewport.start),y(0),w(viewport.end-viewport.start),y(1));

      //ignore
      ctx.fillStyle = colors.ignore;
      ctx.fillRect(x(viewport.start),y(prop.prog.start),w(viewport.end-viewport.start),h(prop.prog.end-prop.prog.start));

      ctx.fillStyle = colors.background.markers;
      ctx.fillRect(x(viewport.start),y(prop.markers.start),w(viewport.end-viewport.start),h(prop.markers.end-prop.markers.start));
      
      ctx.fillStyle = colors.background.footer;
      ctx.fillRect(x(viewport.start),y(prop.footer.start),w(viewport.end-viewport.start),h(prop.footer.end-prop.footer.start));

      //draw global bar
      gctx.fillStyle = colors.global.background;
      gctx.fillRect(gx(0),gy(prop.global.start),gx(d.duration),gy(prop.global.end));

      gctx.fillStyle = colors.global.highlight;
      gctx.fillRect(gx(viewport.start),gy(prop.global.start),gx(viewport.end-viewport.start),gy(prop.global.end-prop.global.start));
      
      if(d.selection != null){
         var sstart = d.selection.start;
         if(sstart < viewport.start){
            gctx.fillStyle = colors.global.progress;
            gctx.fillRect(gx(viewport.start),y(prop.global.start),gx(d.time-viewport.start),h(prop.global.end-prop.global.start));
            gctx.fillStyle = colors.global.oobprogress;
            gctx.fillRect(gx(sstart),y(prop.global.start),gx(viewport.start-sstart),h(prop.global.end-prop.global.start));
            
         }
         else{
            gctx.fillStyle = colors.global.progress;
            gctx.fillRect(gx(sstart),y(prop.global.start),gx(d.time-sstart),h(prop.global.end-prop.global.start));
          
         }
      }
      else{
         gctx.fillStyle = colors.global.progress;
         gctx.fillRect(gx(viewport.start),y(prop.global.start),gx(d.time-viewport.start),h(prop.global.end-prop.global.start));
      }
      
      

      var gmark_draw = function(x,c){
         gctx.fillStyle = ctx.strokeStyle = c.marker;
         gctx.fillRect(gx(x),y(prop.global.start),3,h(prop.global.end - prop.global.start));
      }
      var prog_block_draw = function(o,t,c){
         if(o.subtype == "continue") return;
         var s = o.start;
         var e = o.end;
         var f = Math.max(t-s,0)/(e-s);
         var pad = fixed.block_pad;
         ctx.fillStyle = c.bg;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            w(e-s)-pad*2-fixed.plumbob.stem_width,
            h((prop.prog.end - prop.prog.start)*0.5));

         ctx.fillStyle = c.fg;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            (w(e-s)-pad*2-fixed.plumbob.stem_width)*f,
            h((prop.prog.end - prop.prog.start)*0.5));
      }
      var block_draw = function(o,c){
         if(o.subtype == "continue") return;
         var s = o.start;
         var e = o.end;
         var pad = fixed.block_pad;
         ctx.fillStyle = c;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            w(e-s)-pad*2-fixed.plumbob.stem_width,
            h((prop.prog.end - prop.prog.start)*0.5));
      }
      var plumbob_draw = function(s,c){
         var ht = prop.markers.end - prop.markers.start;
         var wd = fixed.plumbob.marker_width;
         var lwd = fixed.plumbob.stem_width;
         ycoord = prop.markers.start;
         xcoord = s;

         ctx.fillStyle = ctx.strokeStyle = c.marker;
         ctx.fillRect(x(xcoord)-wd/2+lwd/2,y(ycoord),wd,h(ht));

         var ycoord = prop.prog.start;
         var ht = (prop.prog.end - prop.prog.start);
         ctx.fillStyle = ctx.strokeStyle = c.stem;
         ctx.fillRect(x(xcoord),y(ycoord),lwd,h(ht));

      }
      var sel_draw = function(o,color){
         var s = o.start;
         var e = o.end;
         ctx.fillStyle = color;
         ctx.fillRect(x(s), 
            y(prop.footer.start), 
            w(e-s)+fixed.plumbob.stem_width,
            h(prop.footer.end - prop.footer.start));
      }
      var prog_draw = function(s,e,t){
         ctx.fillStyle = colors.progbar.total;
         ctx.fillRect(x(s),y(prop.prog.start),w(e-s)+fixed.plumbob.stem_width,h(prop.prog.end-prop.prog.start));
         ctx.fillStyle = colors.progbar.elapsed;
         ctx.fillRect(x(s),y(prop.prog.start),w(t-s)+fixed.plumbob.stem_width,h(prop.prog.end-prop.prog.start));
      }
      var selected = false;
      
      
      //go through each selection  and hilight the selection you've selected
      this._model.get_selections().for_each(function(e){
         if(!selected && 
            that._state.x != null && 
            x_to_t(that._state.x) <= e.end && 
            x_to_t(that._state.x) >= e.start){


            block_draw(e,colors.hovered);
            sel_draw(e,colors.hovered);
            selected = true;
            that._state.selection = e;
         }
         else{
            block_draw(e,colors.block);
         }
      });

      if(d.selection != null){
         if(d.selection.subtype != "continue")
            prog_block_draw(d.selection,d.time,{fg:colors.selected,bg:colors.block});
         else{
            console.log("cont");
            block_draw({start:d.selection.start, end:d.time},'lightgrey');
         }
      }
      else{
         block_draw({start:viewport.start,end:d.time},'lightgrey');
      }

      
      
      d.segments.for_each(function(e){
         //if this selection is selected
         plumbob_draw(e.time,colors.pause);
         gmark_draw(e.time,colors.pause);
      })

      if(this._state.x != null){
         plumbob_draw(x_to_t(this._state.x),colors.cursor);
         gmark_draw(x_to_t(this._state.x),colors.cursor);
      }
      else{
         plumbob_draw((d.time),colors.cursor);
         gmark_draw((d.time),colors.cursor);
      }


      //draw some more of the global bar

   }

   this.init(id, model);
}