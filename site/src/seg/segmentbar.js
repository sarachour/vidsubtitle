
var SegmentBar = function(id, model){
   this.init = function(id, model){
      var that = this;
      this._id = id;
      this._model = model;
      this._canv = $("<canvas/>");
      this._ctx = this._canv[0].getContext('2d');

      this._model.listen('update',function(){that._draw();})
      $("#"+id).html("").css('height',40);
      this._canv
         .css('width',"100%")
         .css('height',"100%");

      $("#"+id).html("").append(this._canv);
      this._draw();
   }
   this._resize = function(){
      this._canv.attr("width",this._canv[0].offsetWidth);
      this._canv.attr("height",this._canv[0].offsetHeight);
   }
   this._draw = function(){
      this._resize();
      var ctx = this._ctx;
      var d = this._model.get_data();
      var w = this._canv.width();
      var h = this._canv.height();
      var x = function(v){return v*w/d.duration;}
      var y = function(v){return v*h/1;}

      //fill in background
      ctx.fillStyle = "#444444"
      ctx.fillRect(x(0),y(0),x(d.duration),y(1));

      //fill in elapsed time
      ctx.fillStyle = "#666666"
      ctx.fillRect(x(0),y(0),x(d.time),y(1));

      //draw the current hold
      if(d.hold != null){
         if(d.time-d.hold > d.eps) ctx.fillStyle = "#4444DD" 
         else  ctx.fillStyle = "#DD4444"
         ctx.fillRect(x(d.hold),y(0),x(d.time-d.hold),y(1));
      }

      var seg_draw = function(o,segcolor,silcolor){
         var s = o.start;
         var e = o.end;
         var type = o.type;
         var subtype = o.subtype;
         if(type == "break"){
            ctx.beginPath();
            ctx.moveTo(x(s), y(0));
            ctx.lineTo(x(s), y(1));
            ctx.fillStyle = ctx.strokeStyle = segcolor;
            ctx.lineWidth = 2;
            ctx.stroke();
         }
         else if(type == "silence" || type == "segment"){
            ctx.fillStyle = silcolor;
            ctx.fillRect(x(s), y(0), x(e-s),y(1));
         }
      }
      d.segments.for_each(function(e){
         seg_draw(e,"#EE4444","#4466ff");
      })
      if(d.selection != null){
         seg_draw(d.selection, "rgba(200,200,100,0.5)", "rgba(200,200,100,0.5)");
      }
   }

   this.init(id, model);
}