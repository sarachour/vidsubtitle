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
      this.data.duration = 0;
      this.data.eps = 0.5;

      this.data.selection = null;

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
         var s = seg.start;
         var e = seg.end;
         if(seg.type == "break"){
            var t = (s+e)/2;
            data.push({start:last_time, end:t, caption:{}});
         }
         else if(seg.type == "silence"){
            var t = e;
            data.push({start:last_time, end:s, caption:{}});
            data.push({start:s, end:t, caption:""});
         }
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
         that.add_segment(seg.start, seg.end);
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
         if(sel != null)
            this.data.selection = this.get_enclosing_selection((sel.end + sel.start)/2);
         else
            this.data.selection = this.get_enclosing_selection(0);
      }
      this._evt.trigger('update',{obj:this});
      return this.data.selection;
   }
   this.get_enclosing_selection = function(time){
      var enc = this.get_selections().match(function(e){
         return (time <= e.end && time >= e.start);
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
         if(e.type == "silence"){
            console.log("silence",is_left, left_amt, right_amt);
            if(!is_left) e.start += right_amt;
            else e.end += left_amt;
         }
         else if(e.type == "break") {
            var vamt = right_amt;
            if(is_left) vamt = left_amt;
            e.start += vamt;
            e.end += vamt;
         }
      }
      var that = this;
      if(sel == null) return;

      if(sel.type == "silence"){
         var e= this._get_by_id(sel.id);
         shift_elem(e, right_amt+left_amt,right_amt+left_amt,true);
      }
      else if(sel.type == "segment"){
         var es = this._get_by_id(sel.sid);
         var ee= this._get_by_id(sel.eid);
         console.log(es,ee);
         shift_elem(es, left_amt,right_amt,true);
         shift_elem(ee, left_amt,right_amt,false);
      }
      else if(sel.type == "break"){
         var e = this._get_by_id(sel.id);
         shift_elem(e, left_amt,right_amt,true);
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
      else if(sel.type == "silence"){
         var e=this.data.segments.remove_all(function(e){return e.id == sel.id});
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
      var selections = new SortedArray(function(a,b){return a.start - b.start});
      var last = 0;
      var last_id = 0;
      this.data.segments.for_each(function(e){
         last_id = e.id;
         if(e.type == "silence"){
            selections.push({start:last, end:e.start, type:'segment',sid:last_id,eid:e.id, subtype:"normal"});
            selections.push({start:e.start, end:e.end, type:'silence',id:e.id});
            last = e.end;
         }
         else{
            var c = (e.start+e.end)/2;
            selections.push({start:last, end:c, type:'segment',sid:last_id,eid:e.id, subtype:"normal"});
            last = c;
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
