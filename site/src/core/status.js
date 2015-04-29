var Status = function(msg, status,nparts,label){

   this.init = function(){   
      label = typeof label !== 'undefined' ? label : "Video";
      this.msg = $("#"+msg).addClass("med text");
      this.status = $("#"+status);
      this.n = nparts;
      this.i = 0;
      this.status_button = $("<button/>").html("In Progress").prop('disabled',true);
      this.status.html("").append(this.status_button);
      this._update();
   }
   this.next = function(){
      if(this.i < this.n)
         this.i += 1;
      this._update();
   }
   this.prev = function(){
      if(this.i > 0)
         this.i -= 1;
      this._update();
   }
   this._update = function(){
      if(this.i == this.n){
         this.status_button.html("Completed / View Ticket").prop('disabled',false);
      }
      else{
         this.status_button.html("In Progress").prop('disabled',true);
      }
      this.msg.html(label + " " + (this.i+1) + " of " + this.n);
   }
   this.init();
}