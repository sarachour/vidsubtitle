var Demo = function(root_id){
   this.init = function(){
      this.steps = {};
      this.order = [];
      this.root = $("#"+root_id);
      this.evt = new Observer();

      var that = this;
      this.panel = {};
      this.panel.title = $("<h5/>");
      this.panel.text = $("<div/>").css('margin-bottom',25);
      this.panel.bg = $("<div/>").addClass('overlay');
      this.panel.prev = $("<button/>").html("Back").click(function(){
         that.prev_step();
      }).css('position','absolute').css('bottom',0);
      this.panel.next = $("<button/>").html("Next").click(function(){
         that.next_step();
      }).css('right',10).css('position','absolute').css('bottom',0);
      this.panel.bg.append(this.panel.title, this.panel.text, this.panel.prev, this.panel.next).css('display','none');
      this.root.append(this.panel.bg);
   }
   this.set_splash = function(e){
      this.splash = e;
   }
   this.done = function(step_name){
      if(step_name == this.order[this.idx]){
         this.next_step();
      }
   }
   this.listen = function(tag, cbk){
      this.evt.listen(tag, cbk, "ondone");
   }
   this.add_step = function(step_name, html, highlights){
      var e = {};
      e.name = step_name;
      e.html = html;
      e.hl = highlights;

      this.steps[step_name] = e;
      this.order.push(step_name);
   } 
   this._exec_step = function(){
      if(this.idx == -1){
         // display splash
         var that = this;
         this.panel.title.html("Welcome");
         this.panel.text.html(this.splash);
         this.panel.prev.prop("disabled",true);
      }
      else{
         //display step
         var e = this.steps[this.order[this.idx]];
         this.panel.title.html(e.name);
         this.panel.text.html(e.html);
         this.panel.prev.prop("disabled",false);
         if(this.idx == this.order.length - 1){
            this.panel.next.html("Done");
         }
         else{
            this.panel.next.html("Next");
         }
         
         var e = this.steps[this.order[this.idx]];
         for(var i=0; i < e.hl.length; i++){
            e.hl[i].addClass('demo-highlight')
         }
         console.log(e);

      }
   }
   this.next_step = function(){
      if(this.idx >= 0){
         var e = this.steps[this.order[this.idx]];
         for(var i=0; i < e.hl.length; i++){
            e.hl[i].removeClass('demo-highlight')
         }
      }
      if(this.idx < this.order.length-1){
         this.idx += 1;
         this._exec_step();
      }
      else{
         this.panel.bg.css('display','none');
      }
   }
   this.prev_step = function(){
      if(this.idx < this.order.length){
         var e = this.steps[this.order[this.idx]];
         for(var i=0; i < e.hl.length; i++){
            e.hl[i].removeClass('demo-highlight')
         }
      }
      if(this.idx >= 0){
         this.idx -= 1;
         this._exec_step();
      }
   }
   this.start = function(){
      this.idx = -1;
      this.panel.bg.css('display','block');
      this._exec_step();
   }
   this.init();
}