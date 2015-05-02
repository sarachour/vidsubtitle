var SegmentArray = function(seg_data){
   this.init = function(seg_data){
      this.arr = seg_data;
   }
   this._sort = function(){
      var cmp = this.cmp;
      this.arr.sort(cmp)
   }
   this.get_array = function(){
      return this.arr;
   }
   this.addCaption = function(cap,i){
      this.arr[i].caption = cap;
   }
   this.filter = function(c){
      var res = [];
      this.for_each(function(e){
         if(c(e)) res.push(e);
      });
      return res;
   }
   this.clear = function(){
      this.arr = [];
   }
   this.min = function(){
      if(this.arr.length > 0)
         return this.arr[0];
      else return null;
   }
   this.max = function(){
      if(this.arr.length > 0)
         return this.arr[this.arr.length-1];
      else return null;
   }
   this.for_each = function(e){
      for(var i=0; i < this.arr.length; i++){
         e(this.arr[i],i);
      }
   }
   this.length = function(){
      return this.arr.length;
   }
   this.get = function(i){
      return this.arr[i];
   }
   this.match = function(e){
      var idx_srt = function(a,b){return a.index - b.index;}
      var matches = new SortedArray(idx_srt);
      for(var i=0; i < this.arr.length; i++){
         if(e(this.arr[i],i)){
            matches.push({elem:this.arr[i], index:i});
         }
      }
      return matches;
   }
   this.init(seg_data);
}