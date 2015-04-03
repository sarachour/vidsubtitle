var SortedArray = function(cmp){
   this.init = function(cmp){
      this.cmp = cmp;
      this.arr = [];
   }
   this._sort = function(){
      var cmp = this.cmp;
      this.arr.sort(function(a,b){
         return cmp(a,b);
      })
   }
   this.get_array = function(){
      return this.arr;
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
   this.push = function(e){
      this.arr.push(e);
      this._sort();
   }
   this.push_all = function(e){
      var that = this;
      if(e instanceof SortedArray){
         e.for_each(function(x,i){
            that.push(x);
         });
      }
      else{
         e.forEach(function(x,i){
            that.push(x);
         });
      }
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
   this.remove_at = function(i){
      this.arr.splice(i,1);
   }
   this.match = function(e){
      var idx_srt = function(a,b){return a.index < b.index;}
      var matches = new SortedArray(idx_srt);
      for(var i=0; i < this.arr.length; i++){
         if(e(this.arr[i],i)){
            matches.push({elem:this.arr[i], index:i});
         }
      }
      return matches;
   }
   //remove all whose dictionary matches this dictionary (in part)
   this.remove_all = function(e){
      var matches = this.match(e); //sorted by index
      //remove backwards
      for(var i=matches.length-1; i >= 0; i--){
         var idx = matches[i].index;
         this.remove_at(idx);
      }
      return matches;
   }
   this.init(cmp);
}