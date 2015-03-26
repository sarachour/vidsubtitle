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
		console.log("ERROR: Not Implemented")
	}

	this.init();
}
