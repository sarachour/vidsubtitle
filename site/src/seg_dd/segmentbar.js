
var SegmentBar = function(id, model){
   this.init = function(id, model){
      var that = this;
      if(typeof(id) == "string"){
         this._root = $("#"+id);
      }
      else{
         this._root = id;
      }
      this._model = model;
      this._view = {};
      this._view.canv = $("<canvas/>").attr('id','micro');
      this._view.ctx = this._view.canv[0].getContext('2d');

      that._state = {};
      this._state.viewport = {};
      that._state.viewport.force_slide = false;
      that._state.viewport.width = 80 ;

      this._model.listen('update',function(){that._draw();})
      this._model.listen('select',function(){that._draw();})
      this._model.listen('time',function(){that._draw();})
      this._root.html("");

      this._view.canv
         .css('width',"100%")
         .css('height',60);
      
      var norm = function(e){
         var v = that._get_viewport(that._model.get_data());
         var f = e.offsetX/that._view.canv.width();
         var time = f*(v.end - v.start)+v.start;
         return { t:time };
      }

      var delta = function(t,c){ 
         var oc = $(t).data('coord');
         var delta = {};
         delta.t = (c.t - oc.t)/5;
         return delta;
      }

      //segment canvas
      this._view.canv
         .data('drag', false)
         .data('coord', {x:null,y:null})
         .mousemove(function(e){
            var c = norm(e);
            if($(this).data('drag') && that._model.data.break_selection != null){
               var del = delta(this,c);
               that._model.select($(this).data('coord').t+del.t);
               that._model.shift(0,del.t);
            }else{
               that._model.select_break($(this).data('coord').t);
            }
            $(this).data('coord',c);
            that._draw();
         })
         .click(function(e){
            that._model.select($(this).data('coord').t);
         })
         .mouseleave(function(e){
            $(this).data('coord',{x:null,y:null}).data('drag',false);
         })
         .mousedown(function(e){
            var c = norm(e);
            $(this).data('coord',c).data('drag',true);
            that._model.select($(this).data('coord').t);
            that._model.select_break($(this).data('coord').t);
         })
         .mouseup(function(e){
            $(this).data('drag',false);
            return false;
         })
         .bind("contextmenu",function(e){
            var c = norm(e);
            that._model.add(c.t);
            that._model.select(c.t);
           return false;
         });

      this._view.times = $("<div/>");
      this._view.start = $("<span/>").css('float','left').html("Start Time");
      this._view.end = $("<span/>").css('float','right').html("End Time");
      this._view.times.append(this._view.start,this._view.end)

      this._root.html("").append(this._view.canv);
      this._draw();
   }
   this._resize = function(){
      this._view.canv.attr("width",this._view.canv[0].offsetWidth);
      this._view.canv.attr("height",this._view.canv[0].offsetHeight);
   }
   this._get_viewport = function(d){
      var t = d.time;
      var range =  this._state.viewport.width/2; //10 seconds
      var sel = d.selection;

      if(sel != null && sel.type == "segment" && sel.subtype != "continue"){
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
      var viewport = this._get_viewport(d);

      var x = function(v){return (v-viewport.start)*width/(viewport.end - viewport.start);}
      var y = function(v){return v*height/1;}
      var w = function(v){return (v)*width/(viewport.end - viewport.start);}
      var h = function(v){return v*height/1;}

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

      prop.global.seg = {};
      prop.global.seg.start = 0.4;
      prop.global.seg.end = 0.6;
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
      colors.highlighted = "#801515";
      colors.hovered = "#f1c40f";
      colors.block = "black";
      colors.continuation = "lightgrey";
      colors.progress = "#ABEBC6";

      colors.progbar = {};
      colors.progbar.elapsed = "#2ecc71";
      colors.progbar.total = "white";
      colors.progbar.ignore = "#ecf0f1";

      colors.background = {};
      colors.background.all = "white";
      colors.background.markers = "white";
      colors.background.footer = "white";

      colors.global = {};
      colors.global.segments = "black";
      colors.global.background = "white";
      colors.global.highlight = "#D3EAFA";
      colors.global.progress = "darkgrey";
      colors.global.selected = "#2ecc71";

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

      var prog_block_draw = function(o,t,c){
         if(o.subtype == "continue") return;
         var s = o.start;
         var e = o.end;
         var f = Math.min(1,Math.max(t-s,0)/(e-s));
         var pad = fixed.block_pad;
         ctx.fillStyle = c.bg;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            Math.max(0,w(e-s)-pad*2-fixed.plumbob.stem_width),
            h((prop.prog.end - prop.prog.start)*0.5));

         ctx.fillStyle = c.fg;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            Math.max(0,(w(e-s)-pad*2-fixed.plumbob.stem_width)*f),
            h((prop.prog.end - prop.prog.start)*0.5));
      }
      var block_draw = function(o,c){
         var s = o.start;
         var e = o.end;
         var pad = fixed.block_pad;
         ctx.fillStyle = c;
         ctx.fillRect(x(s)+pad+fixed.plumbob.stem_width, 
            y(prop.prog.start+(prop.prog.end - prop.prog.start)*0.25), 
            Math.max(0,w(e-s)-pad*2-fixed.plumbob.stem_width),
            h((prop.prog.end - prop.prog.start)*0.5));
      }
      var plumbob_draw = function(s,c){
         var ht = prop.markers.end - prop.markers.start;
         var wd = fixed.plumbob.marker_width;
         var lwd = fixed.plumbob.stem_width;
         ycoord = prop.markers.start;
         xcoord = s;

         ctx.fillStyle = ctx.strokeStyle = c.marker;
         ctx.fillRect(x(xcoord)-wd/2+lwd/2,y(ycoord),wd, h(ht));

         var ycoord = prop.prog.start;
         var ht = (prop.prog.end - prop.prog.start);
         ctx.fillStyle = ctx.strokeStyle = c.stem;
         ctx.fillRect(x(xcoord),y(ycoord),lwd,h(ht));

      }
      var sel_draw = function(o,color){
         var s = o.start;
         var e = o.end;
         if(o.type == "segment"){
            ctx.fillStyle = color;
            ctx.fillRect(x(s), 
               y(prop.footer.start), 
               w(e-s)+fixed.plumbob.stem_width,
               h(prop.footer.end - prop.footer.start));
         }
         else if(o.type == "break"){
            ctx.fillStyle = color;
            ctx.arc(
               x(o.time), 
               y((prop.footer.end + prop.footer.start)/2), 
               h((prop.footer.end - prop.footer.start)/2),
               0,
               Math.PI);
            ctx.fill();
         }
      }

      var hovered = false;
      var hover_t = null;
      if(this._view.canv.data('coord') != undefined){
         var hover_t = this._view.canv.data('coord').t;
      }

      //go through each selection and highlight the selection you've selected
      this._model.get_selections().for_each(function(e){

         //check hover
         if(!hovered && hover_t != null){
            //hovering over a segment
            if (e.type == "segment" && hover_t <= e.end && hover_t >= e.start)
            {
               hovered = true; 
               sel_draw(e,colors.hovered);
            }
            
         }
         //draw nonhover segment
         if(e.type == "segment" && e.subtype == "continue"){  
            if(d.selection == null || (d.selection.subtype == "continue")){
               block_draw({start:e.start,end:d.time},colors.continuation);
            }
            return;
         }
         //draw nonhover segment
         else if(e.type == "segment" && e.subtype != "continue"){
            if(d.selection != null && d.selection.sid == e.sid && d.selection.eid == e.eid ){
               prog_block_draw(e,d.time,{fg:colors.progbar.elapsed,bg:colors.progbar.total});
               var br = that._model.get(e.eid);
               plumbob_draw(br.time,{marker:colors.selected,stem:colors.selected});
            }
            else {
               block_draw(e,colors.block);
               var br = that._model.get(e.eid);
               if(br.id == that._model.data.break_selection){
                  plumbob_draw(br.time,colors.highlighted);
               }else{
                  plumbob_draw(br.time,colors.pause);
               }
            }
            return;
         }
      });

      if(hover_t != null){
         plumbob_draw(hover_t,colors.cursor);
      }
      else{
         plumbob_draw(d.time,colors.cursor);
      }

   }

   this.init(id, model);
}