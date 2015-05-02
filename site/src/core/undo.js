

var History = function(){
   this.init = function(){
      this.undos = new Stack();
      this.redos = new Stack();
      this.evt = new Observer();

   }
   this.listen = function(evt, cbk){
      this.evt.listen(evt, cbk);
   }
   this.add = function(info){
      this.redos.clear();
      this.undos.push(info);
   }
   this.undo = function(){
      if(this.undos.length() > 0){
         var e = this.undos.pop();
         this.redos.push(e);
         this.evt.trigger('undo',e);
      }
   }
   this.redo = function(){
      if(this.redos.length() > 0){
         var e = this.redos.pop();
         this.undos.push(e);
         this.evt.trigger('redo',e);
      }
   }
   this.init();
}