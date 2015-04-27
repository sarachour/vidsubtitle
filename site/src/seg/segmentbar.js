
var SegmentBar = function(id, model){
   this.init = function(id, model){
      var that = this;
      this._id = id;
      this._model = model;
      this._canv = $("<canvas/>");
      this._ctx = this._canv[0].getContext('2d');
      that._state = {};
      that._state.x = null;
      that._state.y = null;
      this._state.selection = null;
      this._state.viewport = null;
      this._model.listen('update',function(){that._draw();})
      $("#"+id).html("").css('height',30);
      this._canv
         .css('width',"100%")
         .css('height',"100%");

      this._canv
      .mousemove(function(e){
         var d = that._model.get_data();
         var x = e.offsetX/that._canv.width();
         var y = e.offsetY/that._canv.height();
         that._state.x = x;
         that._state.y = y;
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
      $("#"+id).html("").append(this._canv);
      this._draw();
   }
   this._resize = function(){
      this._canv.attr("width",this._canv[0].offsetWidth);
      this._canv.attr("height",this._canv[0].offsetHeight);
   }
   this._select = function(){
      if(this._state.selection != null){
         var v = this._get_viewport(this._model.get_data());
         this._model.select(this._state.x*(v.end-v.start)+v.start);
      }
   }
   this._get_viewport = function(d){
      var t = d.time;
      var sel = d.selection;

      var range = 10; //10 seconds
      console.log(d.selection);
      //if we're backtracking
      if(sel.subtype != "continue"){
         var vp = this._state.viewport;
         while(sel.start < vp.start){
            vp.start--;
            vp.end--;
         }
         while(sel.end > vp.end){
            vp.end++;
         }
         this._state.viewport = vp;
         return vp;
      }
      var s = d.time-range;
      var e = d.time+range;

      if(s < 0){
         s =0;
         e = range*2;
      }
      if(e > d.duration){
         e = d.duration;
         s = d.duration - range*2;
      }
      this._state.viewport ={start:s, end:e}; 
      return this._state.viewport;
   }
   this._draw = function(){
      this._resize();
      var that = this;
      var ctx = this._ctx;
      var d = this._model.get_data();
      var width = this._canv.width();
      var height = this._canv.height();
      var viewport = this._get_viewport(d);
      console.log(viewport,d.time);
      var x = function(v){return (v-viewport.start)*width/(viewport.end - viewport.start);}
      var y = function(v){return v*height/1;}
      var w = function(v){return (v)*width/(viewport.end - viewport.start);}
      var h = function(v){return v*height/1;}
      var x_to_t = function(v){return v*(viewport.end - viewport.start)+viewport.start}
      var fixed = {};
      fixed.plumbob = {};
      fixed.plumbob.marker_width = 12;
      fixed.plumbob.stem_width = fixed.plumbob.marker_width/3;
      var prop = {};
      
      prop.markers = {};
      prop.markers.start = 0;
      prop.markers.end = 0.25;

      prop.prog = {};
      prop.prog.start = 0.25;
      prop.prog.end = 0.75;
      
      prop.footer = {};
      prop.footer.start = 0.75;
      prop.footer.end = 1;

      var colors = {};
      // a pause marker
      colors.pause = {};
      colors.pause.marker = "#2980b9";
      colors.pause.stem = "#2980b9";
      
      //the cursor showing where you are currently
      colors.cursor = {};
      colors.cursor.marker = "#f1c40f";
      colors.cursor.stem = "#f39c12";

      //the selected segment
      colors.selected = "#2ecc71";
      colors.hovered = "#f1c40f";

      colors.progbar = {};
      colors.progbar.elapsed = "#F5A9A9";
      colors.progbar.total = "#E0E0E0";
      colors.progbar.ignore = "#ecf0f1";

      colors.background = {};
      colors.background.all = "white";
      colors.background.markers = "white";
      colors.background.footer = "white";

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
         console.log(s,e);
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
            sel_draw(e,colors.hovered);
            selected = true;
            that._state.selection = e;
         }
      })
      if(d.selection != null){
         sel_draw(d.selection,colors.selected);
         if(d.selection.end > d.time && d.selection.start < d.time){
            prog_draw(d.selection.start, d.selection.end, d.time);
         }
      }
      else{
            prog_draw(viewport.start, viewport.end, d.time);
      }
      d.segments.for_each(function(e){
         //if this selection is selected
         plumbob_draw((e.end+e.start)/2,colors.pause);
      })
      if(this._state.x != null){
         plumbob_draw(x_to_t(this._state.x),colors.cursor);
      }
   }

   this.init(id, model);
}