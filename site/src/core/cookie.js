var UserCookie = function(){
    this.init = function(){
      this._load();
    }
    this._load = function(){
      var text=$.cookie('user_data');
      this.data = null;
      if(text != undefined)
         this.data = JSON.parse(text);

      if(this.data == null){
         this.data = {};
         this.data.tuts = {};
         this.data.tuts.segment = false;
         this.data.tuts.edit = false;
         this.data.tuts.scribe = false;
         this.data.work = {};
         this.data.work.type = "none";
         this.data.work.data = "";
      }
    }
    this._store = function(){
      $.cookie('user_data',JSON.stringify(this.data));
    }
    this.tutorial = function(key,val){
      if(val != undefined){
         this.data.tuts.segment = val;
         this._store();
      }
      return this.data.tuts[key];
    }
    this.cache = function(stage,data){
      if(stage != undefined && data != undefined){
         this.data.work.type = stage;
         this.data.work.data = data;
         this._store();
      }
      return this.data.work;
    }
    this.clear_cache = function(){
      this.data.work.type == "none";
      this._store();
    }

    this.init();
}