/*
selections are identified by (location, not id)

*/
var SegmentModel = function(){
   this.init = function(){
      this.data  = {};
      this.data.segments = new SortedArray(function(a,b){return a.time - b.time});
      this.data.time = 0;
      this.data.duration = 0;
      this.data.last = {end:0, start:0};
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
   this.last = function(){
      return this.data.last.end;
   }
   this.add_segment = function(s,e,type){
      this.data.last = {};
      this.data.last.start = s;
      this.data.last.end = e;
      this.data.last.time = (this.data.last.start + this.data.last.end)/2;
      this.data.last.type = type;
      this.data.segments.push(this.data.last);

      this.obs.trigger('update');
      this.obs.trigger('state-change', {state:'start-speech'});
   }
   this.get_data = function(){
      return this.data;
   }
   this.listen = function(name,cbk, handle){
      this.obs.listen(name, cbk, handle);
   }

   this.init();
}
