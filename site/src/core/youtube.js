
var YoutubeVideo = function(id) {
   this.init = function(id){
      var that = this;
      this.loaded = false;
      this.events = new Observer();
      this.id = id;

      var args = {};    
      args.seekable = true;
      args.enableAutosize = true;
      args.success = function(me, d){
         that.media = me;
         that.loaded = true;
         me.addEventListener('timeupdate', function(e){
            that.events.trigger('update', {ev:e, obj:that});
         },false);
         me.addEventListener('canplay', function(e){
            that.events.trigger('ready',{ev:e, obj:that});
         },false);
         me.addEventListener('ended', function(e){
            that.events.trigger('done',{ev:e, obj:that});
         },false);
         me.addEventListener('play', function(e){
            that.events.trigger('play',{obj:that})
         })
         me.addEventListener('loadedmetadata', function(e){

         })
         me.addEventListener('loadeddata', function(e){
            
         })

         that.events.trigger('load', {obj:that, ev:me});

      }
      args.error = function(){
         console.log("ERROR: Could not play");
      }
      args.features = [];
      args.enableKeyboard = false;
      //args.mode = "auto"
      args.mode = "native"
      this.player = $("#"+that.id).mediaelementplayer(args);
   }
   this.dims = function(w,h){
      this.media.seT
   }
   this.rate = function(e){
      this.media.playbackRate = e;
   }
   this.time = function(){
      return this.media.currentTime;
   }
   this.duration = function(){
      return this.media.duration;
   }
   this.stop = function(){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      this.media.stop();
   }
   this.jump = function(startTime){
      this.media.setCurrentTime(startTime);
   }
   this.segment = function(starttime, endtime){
      var that = this;
      //remove any lingering values
      that.events.remove_all('update','segment-end');
      
      this.media.setCurrentTime(starttime);
      this.events.listen('update', function(data){
         var ctime = that.time();
         console.log(ctime, endtime);
         if(ctime >= endtime){
            that.pause();
            that.events.remove('update','segment-end');
         }

      }, "segment-end");
   }
   this.is_loaded = function(){
      return this.loaded;
   }

   this.listen = function(name, callback, nick){
      if(name == "load" && this.is_loaded()){
         callback({obj:this});
      }
      else{
         this.events.listen(name,callback,nick);
      }
   }
   this.play = function(){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      this.media.play();
   }
   this.pause = function(){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      this.media.pause();
   }
   this.get_url = function(){
      return this.media.src;
   }
   this.load = function(url){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      this.url = url;
      this.media.setSrc(url);
      this.media.load();
   }
   this.init(id);
}