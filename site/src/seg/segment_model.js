
var SegmentModel  = function(){
   this.init = function(){
      var seg_cmp = function(a,b){
         return (a.start - b.start);
      }
      this._id = 0;
      this.data = {};
      this.data.segments = new SortedArray(seg_cmp);
      this.data.time = 0;
      this.data.hold = null;
      this.data.duration = 1;
      this.data.eps = 0.5;

      this.data.selection = null;

      this._evt = new Observer();
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
   }
   //gets normalized data for plotting, as well as scale
   this.get_data = function(){
      return this.data;
   }
   this.to_json = function(){
      return this.data.segments.get_array();
   }
   this.from_json = function(d){
      var that = this;
      this.data.selection = null;
      this.data.segments.clear();
      for(var i=0; i < d.length; i++){
         var seg = d[i];
         that.add_segment(seg.start, seg.end);
      }
   }
   this.select = function(idx){
      this.data.selection = this.get_selections().get(idx);
      this._evt.trigger('update',{obj:this});
      return this.data.selection;
   }
   this.get_selections = function(){
      var selections = new SortedArray(function(a,b){return a.start - b.start});
      var last = 0;
      var last_id = 0;
      this.data.segments.for_each(function(e){
         selections.push({start:last, end:e.start, type:'segment',sid:last_id,eid:e.id});
         last = e.end;
         last_id = e.id;

         if(e.type == "silence"){
            selections.push({start:e.start, end:e.start, type:'silence-start',id:e.id});
            selections.push({start:e.start, end:e.end, type:'silence',id:e.id});
            selections.push({start:e.end, end:e.end, type:'silence-end',id:e.id});
         }
         else if(e.type == "break"){
            selections.push({start:e.start, end:e.end, type:'break', id:e.id});
         }

      });
      selections.push({start:last, end:this.data.duration,type:'segment', id:last_id});
      return selections;
   }
   this.add_segment = function(start,end){
      var s = {};
      var len = end-start;
      var mode;
      s.start = start;
      s.end = end;
      s.length = end-start;
      s.id = this._id;
      this._id+=1;
      if(len < this.data.eps) { //pause
         s.type = "break";
      }
      else{
         s.type = "silence"
      }
      this.data.segments.push(s);

      this._evt.trigger('update',{obj:this});
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
      this.data.time = t;
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
   this.duration = function(d){
      if(isValue(d)){
         this.data.duration = d;
         this._evt.trigger('update',{obj:this});
      }
      return this.data.duration;
   }
   this.init();
}
