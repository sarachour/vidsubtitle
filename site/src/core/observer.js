var Observer = function(){
   this.init = function(){
      this.events = {};
   }
   this.listen = function(eventname, callback, nickname){
      var entry = {};
      entry.name = nickname;
      entry.cbk = callback;
      if(!this.events.hasOwnProperty(eventname)){
         this.events[eventname] = [];
      }
      this.events[eventname].push(entry);
   }
   this.trigger = function(eventname, args){
      if(this.events.hasOwnProperty(eventname)){
         for(var i=0; i < this.events[eventname].length; i++){
            this.events[eventname][i].cbk(args);
         }
      }
   }
   this.remove = function(eventname, nickname){
      var elst = this.events[eventname];
      if(isValue(elst)){
         for(var i=0; i < elst.length; i++){
            if(elst[i].name == nickname){
               elst.splice(i,1);
               return true;
            }
         }
      }
      return false;
   }
   this.remove_all = function(e,n){
      if(n == undefined)
         this.events[eventname] = undefined;
      else
         while(this.remove(e,n));

   }
   this.clear = function(){
      for(e in this.events){
         this.events[e] = [];
      }
   } 
   this.init();
}
