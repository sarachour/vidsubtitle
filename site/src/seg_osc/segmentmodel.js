/*
selections are identified by (location, not id)

*/
var SegmentModel = function(){
   this.init = function(){
      this.data  = {};
      this.data.segments = new SortedArray(function(a,b){return a.time - b.time});
      this.data.time = 0;
      this.data.duration = 0;
      this.data.curr = null;
      this.data.last = null;
      this.data.eps = 0.25;
      this.obs = new Observer();
   }
   this.time = function(t){
      if(t != undefined){
         this.data.time = t;
         this.obs.trigger('update');
      }
      return t;
   }
   this.duration = function(t){
      if(t != undefined) this.data.duration = t;
      return t;
   }
   this.start_speech = function(t){
      if(t == undefined) var t = this.data.time;
      if(this.data.last != null){
         if(t - this.data.last.end > this.data.eps){
            var silence = {type:"silence"};
            silence.start = this.data.last.end;
            silence.end = t;
            this.data.segments.push(silence);
         }
      }
      this.data.curr = {};
      this.data.curr.start = t;
      this.data.curr.type = "speech";

      this.obs.trigger('state-change', {state:'start-speech'});
   }
   this.end_speech = function(t){
      if(t == undefined) var t = this.data.time;
      this.data.curr.end = t;
      this.data.curr.time = (this.data.curr.start + this.data.curr.end)/2;
      this.data.segments.push(this.data.curr);
      this.data.last = this.data.curr;

      this.obs.trigger('state-change', {state:'end-speech'});
   }
   this.get_data = function(){
      return this.data;
   }
   this.listen = function(name,cbk, handle){
      this.obs.listen(name, cbk, handle);
   }

   this.init();
}
