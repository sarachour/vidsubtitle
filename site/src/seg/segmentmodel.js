/*
selections are identified by (location, not id)

*/
var SegmentModel  = function(){
   this.init = function(){
      var seg_cmp = function(a,b){
         return (a.time - b.time);
      }
      this._id = 0;
      this.data = {};
      this.data.segments = new SortedArray(seg_cmp);
      this.data.time = 0;
      this.data.hold = null;
      this.data.duration = 0;

      this.data.selection = this._get_continuation();
      
      this._evt = new Observer();
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
      return this;
   }
   this.get_data = function(){
      return this.data;
   }
   //gets normalized data for plotting, as well as scale
   this.export = function(){
      var data = [];
      this.data.get_selections().for_each(function(e){
         data.push({start:e.start, end:e.end, caption:{}});
      })
      return data;
   }
   this.to_json = function(){
      return this.data.segments.get_array();
   }
   this.from_json = function(d){
      this.data.time = 0;
      this.data.segments.clear();
      for(var i=0; i < d.length; i++){
         console.log(d[i].time);
         this.add_segment(d[i].time);
      }
      this.data.selection = this._get_continuation();
   }
   this.get = function(id){
      return this._get_by_id(id);
   }
   this.next = function(){
      var sels = this.get_selections();
      var sel = this.select();
      if(sel != null){
         var res = sels.after(function(e){return e.id == sel.id});
         if(res != null){
            this.time(res.start);
         }
      }

   }
   this.prev = function(){
      var sels = this.get_selections();
      var sel = this.select();
      if(sel != null){
         var res = sels.before(function(e){return e.id == sel.id});
         console.log((res.start+res.end)/2);
         if(res != null){
            this.time(res.start);
         }
      }
      
   }
   this.select = function(time){
      if(time != undefined){
         this.data.selection = this._get_enclosing_selection(time);
         this.data.time = time;
         this._evt.trigger('select',{obj:this, sel:this.data.selection, time:this.data.time});
      }
      else {
         this.data.selection = this._get_enclosing_selection(this.data.time);
      }
      return this.data.selection;
   }
   this._get_continuation = function(){
      return this.get_selections() //update continuation
      .match(function(e){return e.subtype == "continue"})
      .get(0).elem;
   }
   this._get_enclosing_selection = function(time){
      var that = this;
      var enc = this.get_selections().match(function(e){
         return (time <= e.end && time >= e.start);
      });
      if(enc.length() == 0) return this.data.selection;
      else {
         var e = enc.get(0).elem;
         return e;
      }
   }
   this._get_by_id = function(id){
      var matches = this.data.segments.match(function(e){return e.id==id});
      if(matches.length() == 0) return null;
      var e = matches.get(0).elem;
      return e;
   }
   this.shift = function(id, left_amt,right_amt){
      if(right_amt == undefined){
         right_amt = left_amt;
         left_amt = id;
         id = null;
         var sel = this.data.selection;
      }
      else{
         var sel = this._get_by_id(id);
      }
      var shift_elem = function(e, left_amt, right_amt, is_left){
         if(e == null) return;
         var vamt = right_amt;
         if(is_left) vamt = left_amt;
         e.start += vamt;
         e.end += vamt;  
         e.time += vamt;
         
      }
      var that = this;
      if(sel == null) return;

      if(sel.type == "segment"){
         var es = this._get_by_id(sel.sid);
         var ee= this._get_by_id(sel.eid);
         shift_elem(es, left_amt,right_amt,true);
         shift_elem(ee, left_amt,right_amt,false);
      }
      if(id == null){
         sel.start += left_amt; 
         sel.end += right_amt;
      }
      this._evt.trigger('update',{obj:this,type:'shift',left:left_amt,right:right_amt});
   }
   this.remove = function(id,amt){
      if(amt == undefined){
         amt = id;
         var sel = this.data.selection;
      }
      else{
         var sel = this._get_by_id(id);
      }
      var that = this;
      if(sel == null) return;
      if(sel.type == 'segment'){
         if(sel.eid < 0) return;
         var e=this.data.segments.remove_all(function(e){return e.id == sel.eid});
      }
      var enc = this._get_enclosing_selection(sel.end);
      this.data.selection = enc;
      this._evt.trigger('update',{obj:this,type:'remove', time:sel.end});
      if(e.length() > 0)
         return e.get(0).elem;
      else
         return 0;
   }
   this.get_selections = function(){
      var selections = new SortedArray(function(a,b){
         return a.time - b.time;
      });
      var last = 0;
      var last_id = -1;
      this.data.segments.for_each(function(e){
         selections.push({
            time:(last+e.time)/2, 
            start:last, end:e.time, 
            type:'segment', subtype:"normal",
            sid:last_id, eid:e.id, id:last_id + "/"+e.id
         });
         last_id = e.id;
         last = e.time+0.0001;
      });
      var dur = this.data.duration;
      selections.push({
         time:(last+dur)/2, 
         start:last, end:dur, 
         type:'segment', subtype:"continue",
         sid:last_id, eid:-1, id:last_id + "/"+(-1)
      });
      return selections;
   }
   this.clear_segments = function(){
      this.data.segments.clear();
   }
   this.add_segment = function(time){
      var s = {};
      s.time = time;
      s.id = this._id;
      s.type = "break";
      this._id+=1;
      console.log(s);
      this.data.segments.push(s);

      //update selection if we're tracking the continuation

      if (this.data.selection.subtype == "continue"){
         this.data.selection = this._get_continuation();
      }
      this._evt.trigger('update',{obj:this, type:'add', time:time});
   }
   this.time = function(t){
      var that = this;
      if(isValue(t)){
         this.data.time = t;
         this.select();
         this._evt.trigger('time',{obj:this, time:this.data.time});
      }
      return this.data.time;
   }
   this.click = function(){
      this.data.click_time = this.data.time;
      this._evt.trigger('update',{obj:this});
   }
   this.duration = function(d){
      if(isValue(d)){
         this.data.duration = d;
         if(this.data.selection.subtype == "continue"){
            this.data.selection = this._get_continuation();
         }
         this._evt.trigger('update',{obj:this});
      }
      return this.data.duration;
   }
   this.init();
}
