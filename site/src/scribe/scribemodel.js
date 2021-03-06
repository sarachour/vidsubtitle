/*
selections are identified by (location, not id)

*/

var ScribeModel = function(){
   this.init = function(){
      this.data = {};
      this.data.time = 0;
      this.data.idx = 0;
      this.data.select = null;
      this._id = 0;

      this.data.segments = new SortedArray(function(a,b){return a.start - b.start});
      this._evt = new Observer();
   }
   this.listen = function(ename, cbk){
      this._evt.listen(ename, cbk);
   }
   this.time = function(t){
      if(!isValue(t)){
         this.data.time = t;
      }
      return this.data.time;
   }
   this.from_json = function(arr){
      for(var i=0; i < arr.length; i++){
         var a = arr[i];
         var elem = {
            start: a.start,
            end: a.end,
            id: this._id,
            caption: {}
         };
         for(var speaker in a.caption){
            elem.caption[speaker] = a.caption[speaker];
         }
         this.data.segments.push(elem)
         this._id++;
      }
      this.data.select = this.data.segments.get(0);
      this._evt.trigger('caption',{obj:this});
      this._evt.trigger('index',{obj:this});
      this._evt.trigger('update',{obj:this});
   }
   this.to_json = function(){
      return this.data.segments.get_array();
   }
   this.get_data = function(){
      return this.data;
   }
   this.selected = function(){
      return this.data.select;
   }
   this.index = function(){
      return this.data.idx;
   }
   this.length = function(){
      return this.data.segments.length();
   }
   this.caption = function(c){
      if(c != undefined){
         this.data.segments.get(this.data.idx).caption.speaker = c;
         this._evt.trigger('caption',{obj:this});
         this._evt.trigger('update',{obj:this});
      }
      return this.data.segments.get(this.data.idx).caption.speaker;
   }
   this.peek = function(offset){
      var idx = this.data.idx + offset;
      if(idx < 0 || idx >= this.data.segments.length()) return null;
      return this.data.segments.get(idx);
   }
   this.prev = function(){
      if(this.data.idx > 0){
         this.data.idx--;
         this.data.select = this.data.segments.get(this.data.idx);
         this._evt.trigger('index',{obj:this});
         this._evt.trigger('update',{obj:this});
         return true;
      }
      return false;
   }
   this.next = function(){
      if(this.data.idx < this.data.segments.length()-1){
         this.data.idx++;
         this.data.select = this.data.segments.get(this.data.idx);
         this._evt.trigger('index',{obj:this});
         this._evt.trigger('update',{obj:this});
         return true;
      }
      else
         this._evt.trigger('end',{obj:this});
      return false;
   }
   this.select = function(t){
      this.data.time = t;
      this._evt.trigger('select',{obj:this});
      return this.data.time;
   }
   this.time = function(t){
      if(isValue(t)){
         this.data.time = t;
         this._evt.trigger('update',{obj:this});
      }
      return this.data.time;
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

