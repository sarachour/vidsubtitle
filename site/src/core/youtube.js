
var YoutubeVideo = function(id,features, params) {
   this.init = function(id, features,params){
      var that = this;
      this.loaded = false;
      this.events = new Observer();
      this.rev = null;
      if(typeof(id) == "string"){
         this.root = $("#"+id);
      }
      else{
         this.root = id;
      }

      var args = {}; 
      if(params != undefined){
         args = params;
      }   
      args.seekable = true;
      args.enableAutosize = true;
      args.success = function(me, d){
         that.media = me;
         that.loaded = true;
         //internally triggers event
         me.addEventListener('timeupdate', function(e){
            that.events.trigger('_update', {ev:e, obj:that});
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
      if(features != undefined)
         args.features = features;
      else
         args.features = [];
      
      args.enableKeyboard = false;
      //args.mode = "auto"
      args.mode = "native"
      this.player = this.root.mediaelementplayer(args);

      this.events.listen('_update', function(e){
            that.events.trigger('update', e);
      }, 'update-propagate');

      this.dummy = $("<div/>").attr('id','video-dummy').css({
         position:'absolute',
         width:'100%',
         height:'100%',
         top:0,
         left:0,
         'z-index':'100'
      });
      this.dummy.click(function(){return false;})
      console.log(this.id);
      this.root.parent().css('position','relative').append(this.dummy);
   }
   this.controls = function(e){
      if(e == true){
         this.dummy.remove();
      }
   }
   this.rate = function(e){
      this.media.playbackRate = e;
   }
   this.time = function(t){
      if(t != undefined){
         this.media.currentTime = t;
      }
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
   this.segment = function(starttime, endtime, onend){
      var that = this;
      if(!isValue(onend)) onend = function(){};
      //remove any lingering values
      that.events.remove_all('_update','update-propagate');
      
      if(starttime != null) 
         this.media.setCurrentTime(starttime);

      this.events.listen('_update', function(e){
         var ctime = that.time();
         if(ctime >= endtime){
            that.media.pause();
            that.media.setCurrentTime(endtime);

            //remove existing update handler and replace with generalized
            that.events.remove_all('_update','update-propagate');
            that.events.listen('_update', function(e){
               that.events.trigger('update', e);
            }, 'update-propagate');

            onend();
         }
         else{
            that.events.trigger('update', e);
         }
      }, "update-propagate");
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
   this.reverse = function(){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      if(this.rev != null) return;
      var that = this;
      this.rev = {};
      this.rev.frac = 0.75;
      this.rev.eps = 0.25;

      this.rev.bind= function(n){
         that.play();
         var eps = that.rev.eps;
         var f = that.rev.frac;
         var start = that.time() - n*eps;
         var end = start + eps*f;
         console.log("SEGMENT");
         that.segment(start, end, function(){that.rev.bind(2);});
      }
      this.rev.unbind = function(){
         that.rev = null;
         that.events.remove_all('_update','update-propagate');
         that.events.listen('_update', function(e){
            that.events.trigger('update', e);
         }, 'update-propagate');
      }

      this.rev.bind(1);

   }
   this.play = function(){
      if(!this.is_loaded()){
         console.log("ERROR: Not loaded.");
         return;
      }
      this.rate(1);
      this.media.play();
   }
   this.pause = function(){

      if(this.rev != null){
         this.rev.unbind();
      }
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
   this.init(id, features, params);
}