/*
selections are identified by (location, not id)

*/
var ScribeModel  = function(seg_data){
   this.init = function(){
      this._id = 0;
      this.data = {};

      seg_data.push({start: seg_data[seg_data.length - 1].end, end: 1000, caption: {}});
      this.data.segments = seg_data;
      this._evt = new Observer();
      //this._evt.trigger('update',{obj:this});
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
   }
   this.get_data = function(){
      return this.data;
   }
   this._get_by_id = function(id){
      var matches = this.data.segments.match(function(e){return e.id==id});
      if(matches.length() == 0) return null;
      var e = matches.get(0).elem;
      return e;
   }
   //gets normalized data for plotting, as well as scale
   this.export = function(){
      var last_time = 0;
      var data = [];
      this.data.segments.for_each(function(seg){
         data.push({start:last_time, end:seg.time, caption:{}});
         last_time = seg.time;
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
      if(s == null) return;
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
      for (i=0; i < this.data.segments.length; i++){
         if (this.data.segments[i].end > time){
            return(this.data.segments[i]);
         }
      }
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
   this.duration = function(d){
      if(isValue(d)){
         this.data.duration = d;
         if(this.data.selection != null && this.data.selection.subtype == "continue"){
            this.data.selection.end = this.data.duration;
         }
         this._evt.trigger('update',{obj:this});
      }
      return this.data.duration;
   }
   this.init();
}
