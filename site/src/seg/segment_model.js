/*
selections are identified by (location, not id)

*/
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
      if(idx != undefined){
         this.data.selection = this.get_selections().get(idx);
         this._evt.trigger('update',{obj:this});
      }
      if(this.data.selection != null){
         var sel = this.data.selection;
         this.data.selection = this.get_by_enclosing((sel.end + sel.start)/2);
      }
      return this.data.selection;
   }
   this.get_by_enclosing = function(time){
      var enc = this.get_selections().match(function(e){
         return (time <= e.end && time >= e.start);
      });
      if(enc.length() == 0) return null;
      else {
         var e = enc.get(0).elem;
         e.index = enc.get(0).index;
         return e;
      }
   }
   this.get_by_id = function(id){
      var matches = this.data.segments.match(function(e){return e.id==id});
      if(matches.length() == 0) return null;
      var e = matches.get(0).elem;
      e.index = matches.get(0).index
      return e;
   }
   this.shift = function(left_amt,right_amt){
      
      var shift_elem = function(e, left_amt, right_amt, is_left){
         if(e == null) return;
         if(e.type == "silence"){
            if(is_left) e.end += left_amt;
            else e.start += right_amt;
         }
         else if(e.type == "break") {
            var vamt = right_amt;
            if(is_left) vamt = left_amt;
            e.start += vamt;
            e.end += vamt;
         }
      }
      var sel = this.data.selection;
      var that = this;
      if(sel == null) return;

      if(sel.type == "silence"){
         var e= this.get_by_id(sel.id);
         shift_elem(e, left_amt,right_amt,true);
         shift_elem(e, left_amt,right_amt,false);
      }
      else if(sel.type == "segment"){
         var es = this.get_by_id(sel.sid);
         var ee= this.get_by_id(sel.eid);
         shift_elem(es, left_amt,right_amt,true);
         shift_elem(ee, left_amt,right_amt,false);
      }
      sel.start += left_amt; 
      sel.end += right_amt;
      this._evt.trigger('update',{obj:this});
   }
   this.remove = function(amt){
      var sel = this.data.selection;
      var that = this;
      if(sel == null) return;
      if(sel.type == 'segment'){
         if(sel.eid < 0) return;
         var ee = this.get_by_id(sel.eid); //get break
         this.data.segments.remove_at(ee.index);
      }
      else if(sel.type == "silence"){
         var ee = this.get_by_id(sel.id); //get break
         this.data.segments.remove_at(ee.index);
      }
      var enc = this.get_by_enclosing(sel.end);
      this.data.selection = enc;
      this._evt.trigger('update',{obj:this});
   }
   this.get_selections = function(){
      var selections = new SortedArray(function(a,b){return a.start - b.start});
      var last = 0;
      var last_id = 0;
      this.data.segments.for_each(function(e){
         selections.push({start:last, end:e.start, type:'segment',sid:last_id,eid:e.id, subtype:"normal"});
         last = e.end;
         last_id = e.id;

         if(e.type == "silence"){
            selections.push({start:e.start, end:e.end, type:'silence',id:e.id});
         }

      });
      selections.push({start:last, end:this.data.duration,type:'segment', sid:last_id, eid:-1, subtype:"continue"});
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
      var sel = this.data.selection;
      //update 
      if( sel != null && sel.subtype == "continue"){
         if(sel.start < end) sel.start = end;
         sel.sid = this.data.segments.length()-1;
      }

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
