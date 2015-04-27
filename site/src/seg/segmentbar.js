
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
      this._model.listen('update',function(){that._draw();})
      $("#"+id).html("").css('height',30);
      this._canv
         .css('width',"100%")
         .css('height',"100%");

      this._canv
      .mousemove(function(e){
         var d = that._model.get_data();
         var x = e.offsetX/that._canv.width()*d.duration;
         var y = e.offsetY/that._canv.height()*d.duration;
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
         this._model.select(this._state.x);
      }
   }
   this._draw = function(){
      this._resize();
      var that = this;
      var ctx = this._ctx;
      var d = this._model.get_data();
      var w = this._canv.width();
      var h = this._canv.height();
      var x = function(v){return v*w/d.duration;}
      var y = function(v){return v*h/1;}

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
      colors.cursor.stem = "#black";

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
      ctx.fillRect(x(0),y(0),x(d.duration),y(1));

      ctx.fillStyle = colors.ignore;
      ctx.fillRect(x(0),y(prop.prog.start),x(d.duration),y(prop.prog.end-prop.prog.start));

      ctx.fillStyle = colors.background.markers;
      ctx.fillRect(x(0),y(prop.markers.start),x(d.duration),y(prop.markers.end-prop.markers.start));
      
      ctx.fillStyle = colors.background.footer;
      ctx.fillRect(x(0),y(prop.footer.start),x(d.duration),y(prop.footer.end-prop.footer.start));

      var plumbob_draw = function(s,c){
         var ht = prop.markers.end - prop.markers.start;
         var wd = 1;
         ycoord = prop.markers.start;
         xcoord = s;
         ctx.fillStyle = ctx.strokeStyle = c.marker;
         ctx.fillRect(x(xcoord-wd/2),y(ycoord),x(wd),y(ht));

         var lwd = wd/3;
         var ycoord = prop.prog.start;
         var ht = (prop.prog.end - prop.prog.start);
         ctx.fillStyle = ctx.strokeStyle = c.stem;
         ctx.fillRect(x(xcoord-lwd/2),y(ycoord),x(lwd),y(ht));

      }
      var sel_draw = function(o,color){
         var s = o.start;
         var e = o.end;
         ctx.fillStyle = color;
         ctx.fillRect(x(s), y(prop.footer.start), x(e-s),y(prop.footer.end - prop.footer.start));
      }
      var prog_draw = function(s,e,t){
         ctx.fillStyle = colors.progbar.total;
         ctx.fillRect(x(s),y(prop.prog.start),x(e-s),y(prop.prog.end-prop.prog.start));
         ctx.fillStyle = colors.progbar.elapsed;
         ctx.fillRect(x(s),y(prop.prog.start),x(t-s),y(prop.prog.end-prop.prog.start));
      }
      var selected = false;
      
      //go through each selection  and hilight the selection you've selected
      this._model.get_selections().for_each(function(e){
         if(!selected && that._state.x != null && that._state.x <= e.end+1 && that._state.x >= e.start-1){
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
            prog_draw(0, d.duration, d.time);
      }
      d.segments.for_each(function(e){
         //if this selection is selected
         plumbob_draw(e.start,colors.pause);
      })
      if(this._state.x != null){
         plumbob_draw(this._state.x,colors.cursor);
      }
   }

   this.init(id, model);
}