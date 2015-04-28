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

      this.data.selection = {
         type:'segment',
         subtype:'continue',
         start:0,
         end:this.data.duration
      };
      this._evt = new Observer();
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
   }
   this.get_data = function(){
      return this.data;
   }
   //gets normalized data for plotting, as well as scale
   this.export = function(){
      var last_time = 0;
      var data = [];
      this.data.segments.for_each(function(seg){
         data.push({start:last_time, end:seg.time, caption:{}});
         last_time = t;
      })
      return data;
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
         that.add_segment(seg.time);
      }
   }
   this.select_nearby = function(filter, reverse){
      var s = this.select();
      var found = false;
      var matches = this.get_selections().match(function(e){
         if(e.id == s.id && e.sid == s.sid && e.eid == s.eid){
            found = true; 
            return false;
         }
         if(((reverse && found == false) || (!reverse && found == true)) 
            && filter(e)) return true;
         return false;
      });
      if(matches.length() == 0) return;
      if(reverse){
         var e = matches.get(matches.length() - 1).elem;
      }
      else{
         var e = matches.get(0).elem;
      }
      this.select((e.end+e.start)/2,false);
   }
   this.get = function(id){
      return this._get_by_id(id);
   }
   this.select = function(time,start_at){
      if(time != undefined){
         this.data.selection = this.get_enclosing_selection(time);
         if(start_at == undefined || start_at == true)
            this._evt.trigger('select',{obj:this, time:time});
         else
            this._evt.trigger('select',{obj:this});
      }
      else {
         var sel = this.data.selection;
         if(sel != null){
            this.data.selection = this.get_enclosing_selection(sel.time);
         }
         else
            this.data.selection = this.get_enclosing_selection(0);
      }
      this._evt.trigger('update',{obj:this});
      return this.data.selection;
   }
   this.get_enclosing_selection = function(time){
      var that = this;
      var enc = this.get_selections().match(function(e){
         return (e.type == "segment" && time <= e.end && time >= e.start);
      });
      if(enc.length() == 0) return null;
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
      this._evt.trigger('update',{obj:this});
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
      var enc = this.get_enclosing_selection(sel.end);
      this.data.selection = enc;
      this._evt.trigger('update',{obj:this});
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
         selections.push({time:(last+e.time)/2, start:last, end:e.time, type:'segment',sid:last_id,eid:e.id, subtype:"normal"});
         last_id = e.id;
         last = e.time;
      });
      selections.push({time:(last+this.data.duration)/2, start:last, end:this.data.duration,type:'segment', sid:last_id, eid:-1, subtype:"continue"});
      return selections;
   }
   this.add_segment = function(time){
      var s = {};
      s.time = time;
      s.id = this._id;
      s.type = "break";
      this._id+=1;
      this.data.segments.push(s);

      //update selection if we're tracking the continuation
      var sel = this.data.selection;
      if( sel != null && sel.subtype == "continue"){
         if(sel.start < time) sel.start = time;
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
   this.click = function(){
      this.data.click_time = this.data.time;
      this._evt.trigger('update',{obj:this});
   }
   this.duration = function(d){
      if(isValue(d)){
         this.data.duration = d;
         if(this.data.selection.subtype == "continue"){
            this.data.selection.end = this.data.duration;
         }
         this._evt.trigger('update',{obj:this});
      }
      return this.data.duration;
   }
   this.init();
}