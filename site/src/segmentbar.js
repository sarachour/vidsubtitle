var SegmentBar = function(id){
   this.init = function(id){
      this._duration = 1;
      this._id = id;
      this._pauses = [];
      this._silences = [];
      this._canv = $("<canvas/>");
      this._ctx = this._canv[0].getContext('2d');

      $("#"+id).html("").css('height',40);
      this._canv
         .css('width',"100%")
         .css('height',"100%");

      
      
      $("#"+id).html("").append(this._canv);
      this._conv = {x:0, y:80};
      this._duration = 1;
      this._progress = 0;
      this._hold = null;
      this._conv.x =this._canv.width()/ this._duration;
      this._conv.y = this._canv.height() / 1;
      this.eps = 1;
      this._draw();
   }
   this._resize = function(){
      this._canv.attr("width",this._canv[0].offsetWidth);
      this._canv.attr("height",this._canv[0].offsetHeight);
   }
   this.duration = function(d){
      if(isValue(d)){
         this._duration = d;
         this._conv.x = this._canv.width()/this._duration;
      }
      return this._duration;
   }
   this.progress = function(p){
      this._progress = p;
      this._draw();
   }
   this.hold = function(s){
      this._hold = s;
      this._draw();
   }
   this.to_x = function(x){ //duration to pixel
      return this._conv.x*x;
   }
   this.to_y = function(y){ //norm to pixel
      return this._conv.y*y;
   }
   this._draw = function(){
      var ctx = this._ctx;
      var prog = this._progress;
      var dur = this._duration;
      var hold = this._hold;
      this._resize();
      ctx.fillStyle = "#444444"
      ctx.fillRect(this.to_x(0),this.to_y(0),this.to_x(dur),this.to_y(1));
      ctx.fillStyle = "#666666"
      ctx.fillRect(this.to_x(0),this.to_y(0),this.to_x(prog),this.to_y(1));
      if(this._hold != null){
         if(prog-hold > this.eps) ctx.fillStyle = "#4444DD" 
         else  ctx.fillStyle = "#DD4444"
         ctx.fillRect(this.to_x(hold),this.to_y(0),this.to_x(prog-hold),this.to_y(1));
      }
      
      
      for(var i=0; i < this._pauses.length; i++){
         var t = this._pauses[i].time;
         ctx.beginPath();
         ctx.moveTo(this.to_x(t), this.to_y(0));
         ctx.lineTo(this.to_x(t), this.to_y(1));
         ctx.fillStyle = ctx.strokeStyle = "#EE4444";
         ctx.lineWidth = 3;
         ctx.stroke();
      }
      for(var i=0; i < this._silences.length; i++){
         var s = this._silences[i].start;
         var e = this._silences[i].end;
         ctx.fillStyle = "#4466ff";
         ctx.fillRect(this.to_x(s), this.to_y(0), this.to_x(e-s),this.to_y(1));
      }
   }
   this.pause = function(time){
      var m = {time: time};
      this._pauses.push(m);
      this._draw();
   }
   this.silence = function(start,end){
      var s = {start: start, end:end};
      this._silences.push(s);
      this._draw();
   }
   this.mark = function(start,end){
      if(end-start > this.eps){
         this.silence(start,end);
      }
      else{
         this.pause(start,end);
      }
   }
   this.init(id);
}