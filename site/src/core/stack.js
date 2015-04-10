var Stack = function(){
   this.array = [];
   this.evt = new Observer();
   this.push = function(e){
      this.array.push(e);
      this.evt.trigger("remove");
   }
   this.peek = function (e){
      if(this.array.length == 0) return null;
      return this.array[this.array.length - 1];
   }
   this.pop = function(){
      if(this.array.length == 0) return null;
      
      var e = this.peek();
      this.array.splice(this.array.length - 1);
      this.evt.trigger("remove");
      return e;
   }
   this.length = function(){
      return this.array.length;
   }
   this.listen = function(evtname,cbk){
      this.evts.listen(evtname,cbk);
   }
   this.clear = function(){
      this.array = [];
      this.evt.trigger("remove");
   }
};