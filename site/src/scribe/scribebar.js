
var ScribeBar = function(id, model){
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

      this._view.gcanv = $("<canvas/>").attr('id','macro');
      this._view.gctx = this._view.gcanv[0].getContext('2d');

      that._state = {};
      this._state.viewport = {};
      that._state.viewport.force_slide = false;
      that._state.viewport.width = 30;

      this._model.listen('update',function(){that._draw();})
      this._root.html("");

      this._view.gcanv
         .css('width',"100%")
         .css('height',35);
      
      var gnorm = function(e){
         var f = e.offsetX/that._view.gcanv.width();
         var d = that._model.get_data();
         var time = f*d.duration;
         return { t:time };
      }
      var delta = function(t,c){ 
         var oc = $(t).data('coord');
         var delta = {};
         delta.t = c.t - oc.t;
         return delta;

      }

      //global canvas
      this._view.gcanv
         .data('drag', false)
         .data('coord', {x:null,y:null})
         .mousemove(function(e){
            var c = gnorm(e);
            if($(this).data('drag')){
               var del = delta(this,c); 
               that._model.shift(0,del.t);
            }
            $(this).data('coord',c);
            that._draw();

         })
         .click(function(e){
            var c = gnorm(e);
            that._model.select(c.t);

         })
         .mouseleave(function(e){
            $(this).data('coord',{x:null,y:null}).data('drag',false);
         })
         .mousedown(function(e){
            var c = gnorm(e);
            that._model.select(c.t);
            $(this).data('coord',c).data('drag',true);
         })
         .mouseup(function(e){
            $(this).data('drag',false);
            return false;
         })
         .bind("contextmenu",function(e){
            var c = gnorm(e);
            that._model.select(c.t);
            return false;
         })
         .css({
            'margin-bottom':'5px'
         })
         .mousemove(function(e){
            var c = gnorm(e);
            that._draw();
         });
      this._view.times = $("<div/>");
      this._view.start = $("<span/>").css('float','left').html("Start Time");
      this._view.end = $("<span/>").css('float','right').html("End Time");
      this._view.times.append(this._view.start,this._view.end)

      this._root.html("").append(this._view.gcanv,this._view.canv);
      this._draw();
   }
   this._resize = function(){

      this._view.gcanv.attr("width",this._view.gcanv[0].offsetWidth);
      this._view.gcanv.attr("height",this._view.gcanv[0].offsetHeight);
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

      var gwidth = this._view.gcanv.width();
      var gheight = this._view.gcanv.height();

      var viewport = this._get_viewport(d);

      var x = function(v){return (v-viewport.start)*gwidth/(viewport.end - viewport.start);}
      var y = function(v){return v*gheight/1;}
      var w = function(v){return (v)*gwidth/(viewport.end - viewport.start);}
      var h = function(v){return v*gheight/1;}

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
      colors.global.background = "#eeeeee";
      colors.global.progress = "darkgrey";
      colors.global.selected = "#2ecc71";

      this._view.start.html(viewport.start);
      this._view.end.html(viewport.end);
      if(d.duration == null || d.duration == 0) return;
      //fill in background

      //draw global bar
      gctx.fillStyle = colors.global.background;
      gctx.fillRect(gx(0),gy(prop.global.start),gx(d.duration),gy(prop.global.end));
      
      //draw segments bar
      gctx.fillStyle = colors.global.segments;
      gctx.fillRect(gx(0),gy(prop.global.seg.start),gx(d.time),gy(prop.global.seg.end-prop.global.seg.start));

      
      if(d.selection != null ){
         var sstart = d.selection.start;
         if(d.selection.subtype == 'continue')
            gctx.fillStyle = colors.global.progress;
         else
            gctx.fillStyle = colors.global.selected;
         gctx.fillRect(gx(sstart),gy(prop.global.seg.start),gx(d.time-sstart),gy(prop.global.seg.end-prop.global.seg.start));
          
      }
      else{
         gctx.fillStyle = colors.global.progress;
         gctx.fillRect(gx(viewport.start),gy(prop.global.seg.start),gx(d.time-viewport.start),gy(prop.global.seg.end-prop.global.seg.start));
      }
      
      var gmark_draw = function(x,c){
         gctx.fillStyle = c.marker;
         gctx.fillRect(gx(x),y(prop.global.start),1.5,h(prop.global.end - prop.global.start));
      }
      /*
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
      */
      /*
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
      */
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

      for (i=0; i < this._model.data.segments.length; i++) {
         gmark_draw(this._model.data.segments[i].end, colors.pause);
      }

      /*
      this._model.get_segments().for_each(function(e){
         //check hover
         if(!hovered && hover_t != null){
            console.log(hover_t);
            //hovering over a segment
            if (hover_t <= e.end && hover_t >= e.start){
               hovered = true; 
               sel_draw(e,colors.hovered);
            }   
         }else{
            if(d.selection != null && d.selection.sid == e.sid && d.selection.eid == e.eid ){
               //prog_block_draw(e,d.time,{fg:colors.progbar.elapsed,bg:colors.progbar.total});
               var br = that._model.get(e.eid);
               //plumbob_draw(br.time,{marker:colors.selected,stem:colors.selected});
               gmark_draw(br.time,{marker:colors.selected,stem:colors.selected}); 
            }
            else {
               //console.log(e);
               var br = that._model.get(e.eid);
               gmark_draw(br.time,colors.pause); 
            }
            return;
         }
      });

*/
      var hovered = false;
      var hover_t = null;
      if(this._view.gcanv.data('coord') != undefined){
         var hover_t = this._view.gcanv.data('coord').t;
      }

      if(hover_t != null){
         gmark_draw(hover_t,colors.cursor);
      }
      else{
         gmark_draw(d.time,colors.cursor);
      }

   }

   this.init(id, model);
}