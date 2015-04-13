
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
      $("#"+id).html("").css('height',40);
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
      var colors = {
         pause:"#C22424", //red
         silence:"#6E92A1", //blue
         hilight:"#EEEE44",
         background:"#222222", //background color
         progress:"#404E56",
         hilight_seg:"#685757",
         selection_prog:"#D9EC9A",
         selection:"#ACC25E",
         cursor:"rgba(200,200,200,0.3)"
      }
      //fill in background
      ctx.fillStyle = colors['background'];
      ctx.fillRect(x(0),y(0),x(d.duration),y(1));

      //fill in elapsed time
      ctx.fillStyle = colors['progress'];
      ctx.fillRect(x(0),y(0),x(d.time),y(1));

      //draw the current hold
      if(d.hold != null){
         if(d.time-d.hold > d.eps) ctx.fillStyle = colors['silence'];
         else  ctx.fillStyle = colors['pause'];
         ctx.fillRect(x(d.hold),y(0),x(d.time-d.hold),y(1));
      }
      var line_draw = function(s,c){
         ctx.beginPath();
         ctx.moveTo(x(s), y(0));
         ctx.lineTo(x(s), y(1));
         ctx.fillStyle = ctx.strokeStyle = c;
         ctx.lineWidth = 2;
         ctx.stroke();
      }
      var seg_draw = function(o,segcolor,silcolor){
         var s = o.start;
         var e = o.end;
         var type = o.type;
         var subtype = o.subtype;
         if(type == "break"){
            line_draw(s,segcolor);
         }
         else if(type == "silence" || type == "segment"){
            ctx.fillStyle = silcolor;
            ctx.fillRect(x(s), y(0), x(e-s),y(1));
         }
      }
      var selected = false;
      d.segments.for_each(function(e){
         //if this selection is selected
         seg_draw(e,colors['pause'],colors['silence']);
      })
      this._model.get_selections().for_each(function(e){
         if(!selected && that._state.x != null && that._state.x <= e.end+1 && that._state.x >= e.start-1){
            seg_draw(e,colors['hilight_seg'],colors['hilight_seg']);
            selected = true;
            that._state.selection = e;
         }
      })
      if(d.selection != null){
         seg_draw(d.selection, colors['selection'],colors['selection']);
         if(d.selection.end > d.time && d.selection.start < d.time){
            ctx.fillStyle = colors['selection_prog'];
            ctx.fillRect(x(d.selection.start),y(0),x(d.time-d.selection.start),y(1));
         }
      }
      
      if(this._state.x != null){
         line_draw(this._state.x, colors['cursor']);
      }
   }

   this.init(id, model);
}