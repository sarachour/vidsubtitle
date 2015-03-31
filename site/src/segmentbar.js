
var SegmentModel  = function(){
   this.init = function(){
      this.data = {};
      this.data.segments = new NumericalSortedArray('start');
      this.data.time = 0;
      this.data.hold = null;
      this.data.duration = 0;
      this.data.eps = 0.5;
      
      this.data.redo = {};
      this.data.redo.mode = false;

      this.data.redo.time = 0;
      this.data.redo.start_time = 0; // starting time of the redo
      this.data.redo.ghosts = new NumericalSortedArray('start'); //segments that are potentially invalidated
      this.data.redo.segments = new NumericalSortedArray('start'); //segments that we're redoing

      this._on_redo = false; // are we in redo mode where we're deciding 

      this._evt = new Observer();
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
   }
   //gets normalized data for plotting, as well as scale
   this.get_data = function(){
      return this.data;
   }
   this.add_segment = function(start,end){
      var s = {};
      var len = end-start;
      var mode;
      s.start = start;
      s.end = end;
      s.length = end-start;
      if(len < this.data.eps) { //pause
         s.type = "break";
      }
      else{
         s.type = "silence"
      }
      if(this.data.redo.mode){
         this.data.redo.segments.push(s);
      }
      else{
         this.data.segments.push(s);
      }

      this._evt.trigger('update',{obj:this});
   }
   this.redo_start_time = function(){
      return this.data.redo.start_time;
   }
   this.time = function(t){
      var that = this;
      if(!isValue(t)){
         if(this.data.redo.mode){
            return this.data.redo.time;
         }
         else{
            return this.data.time;
         }
      }
      if(this.data.redo.mode){
         this.data.redo.time = t;
      }
      else{
         this.data.time = t;
      }
      //reached end of redo mode, push redid fragments to data and clear all
      if(this.data.redo.mode && this.data.redo.time >= this.data.time){
         this.data.redo.mode = false;
         that.data.segments.push_all(that.data.redo.segments);
         that.data.redo.segments.clear();
         that.data.redo.ghosts.clear();
      }
      this._evt.trigger('update',{obj:this});

   }
   this.hold = function(){
      this.data.hold = this.data.time;
      this._evt.trigger('update',{obj:this});
   }
   this.unhold = function(){
      this.data.hold = null;
      this._evt.trigger('update',{obj:this});
   }
   this.redo = function(){
      if(!this.data.redo.mode){
         this.data.redo.mode = true;
      } 
      var last = this.data.segments.max(); // latest time element
      var segs = this.data.segments.remove_all(function(e,i){
         return e.start >= last.start;
      });
      //add fragments between to ghosted fragments
      if(last != null){
         this.data.redo.start_time = last.start;
      }
      else{
         this.data.redo.start_time = 0;
      }
      this.data.redo.time = this.data.redo.start_time;
      this.data.redo.ghosts.push_all(segs);

      this._evt.trigger('update',{obj:this});
   }
   this.duration = function(d){
      if(isValue(d)){
         this.data.duration = d;
         this._evt.trigger('update',{obj:this});
      }
      return this.data.duration;
   }
   this.init();
}

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

      //draw the time segment that is being redone
      if(d.redo.mode){
         ctx.fillStyle = "#66EE66";
         ctx.fillRect(x(d.redo.start_time),y(0),x(d.redo.time-d.redo.start_time),y(1));
         //draw the hold with respect of the redo time
         if(d.hold != null){
            if(d.redo.time-d.hold > d.eps) ctx.fillStyle = "#4444DD" 
            else  ctx.fillStyle = "#DD4444"
            ctx.fillRect(x(d.hold),y(0),x(d.redo.time-d.hold),y(1));
         }
      }
      //draw the current hold
      else if(d.hold != null){
         if(d.time-d.hold > d.eps) ctx.fillStyle = "#4444DD" 
         else  ctx.fillStyle = "#DD4444"
         ctx.fillRect(x(d.hold),y(0),x(d.time-d.hold),y(1));
      }
      
      var seg_draw = function(o,segcolor,silcolor){
         var s = o.start;
         var e = o.end;
         var type = o.type;
         if(type == "break"){
            ctx.beginPath();
            ctx.moveTo(x(s), y(0));
            ctx.lineTo(x(s), y(1));
            ctx.fillStyle = ctx.strokeStyle = segcolor;
            ctx.lineWidth = 2;
            ctx.stroke();
         }
         else if(type == "silence"){
            ctx.fillStyle = silcolor;
            ctx.fillRect(x(s), y(0), x(e-s),y(1));
         }
      }

      d.redo.ghosts.for_each(function(e){
         seg_draw(e,"#6644444","#444466");
      })
      d.redo.segments.for_each(function(e){
         seg_draw(e,"#EE4444","#4466ff");
      })
      d.segments.for_each(function(e){
         seg_draw(e,"#EE4444","#4466ff");
      })
      
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
   this.init(id, model);
}