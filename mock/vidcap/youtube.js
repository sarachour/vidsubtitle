
var YoutubeVideo = function(id) {
	this.init = function(id){
		var that = this;
		this.loaded = false;
		this.events = new Observer();
		this.id = id;

		var args = {};		
		args.seekable = false;
		args.success = function(me, d){
			that.media = me;
			that.loaded = true;
			that.events.trigger('load', {obj:that, ev:me});
			me.addEventListener('timeupdate', function(e){
				that.events.trigger('update', {ev:e, obj:that});
			},false);
			me.addEventListener('canplay', function(e){
				that.events.trigger('ready',{ev:e, obj:that});
			},false);
			me.addEventListener('ended', function(e){
				that.events.trigger('done',{ev:e, obj:that});
			},false);

		}
		args.error = function(){
			console.log("ERROR: Could not play");
		}
		$("#"+that.id).mediaelementplayer(args);
	}
	this.stop = function(){
		if(!this.is_loaded()){
			console.log("ERROR: Not loaded.");
			return;
		}
		this.media.stop();
	}
	this.segment = function(starttime, endtime){
		var that = this;
		this.media.setCurrentTime(starttime);
		this.events.listen('update', function(data){
			var ctime = data.ev.currentTime;
			if(ctime >= endtime){
				that.stop();
				that.events.remove('segment-end');
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