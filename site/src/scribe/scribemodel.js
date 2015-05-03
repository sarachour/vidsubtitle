/*
selections are identified by (location, not id)

*/
var ScribeModel  = function(seg_data){
   this.init = function(){
      this.curIndex = 0;
      this.data = {};
      this.data.time = 0;

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
   this.get_caption = function(relIndex){
      return(this.data.segments[curIndex + relIndex].caption);
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
   this.get = function(id){
      return this._get_by_id(id);
   }
   this.selectTime = function(time){
      console.log(time);
      this.curIndex = this.get_enclosing_index(time);
      this.data.time = time;
      //console.log(this.data.segments);
      //console.log(this.data.time);
      this._evt.trigger('select',{obj:this, sel:this.data.segments[this.curIndex], time:this.data.time});
      this._evt.trigger('update',{obj:this});

      return this.data.segments[this.curIndex];
   }
   this.get_enclosing_selection = function(time){
      for (i=0; i < this.data.segments.length; i++){
         if (this.data.segments[i].end > time){
            return(this.data.segments[i]);
         }
      }
   }
   this.get_enclosing_index = function(time){
      for (i=0; i < this.data.segments.length; i++){
         if (this.data.segments[i].end > time){
            return(i);
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
