var Navigator = function(){
   this.base_url = "http://localhost:8080";

   this._parse_query = function(e){
      var qlist = e.split("?")[1];
      var terms =qlist.split("&");
      var dict = {};
      for(var i=0; i < terms.length; i++){
         var args=  terms[i].split("=");
         var n = decodeURIComponent(args[0]);
         var v = decodeURIComponent(args[1]);
         dict[n] = v;
      }
      return dict;
   }

   this.redirect = function(url){
      window.location.href = url;
   }
   this._encode_data = function(url,data){
      var val = encodeURIComponent(JSON.stringify(data));
      url += "?data="+val;
      return url;
   }
   this.segment = function(url){
      return this._encode_data(this.base_url + "/segment.html",url);
   }
   //data to trans
   this.scribe = function(data){
      return this._encode_data(this.base_url + "/scribe.html",data);
   }
   this.edit = function(data){
      return this._encode_data(this.base_url + "/edit.html",data);
   }
   this.preview = function(data){
      return this._encode_data(this.base_url + "/preview.html",data);
   }
   this.portal = function(phase,data){
      var url = this._encode_data(this.base_url+"/portal.html",data);
      url + "&phase="+phase;
      return url;
   }
   this.start = function(youtube_url, cbk){
      qdat = JSON.stringify({url:youtube_url,type:'submit-video'});
      $.ajax({
         type:"POST",
         url:this.base_url+"/portal.html",
         data:qdat,
         success:function(e){
            cbk(e.url);
         },
         dataType:'json'
      });
   }
   this.get = function(){
      var query = window.location.search;
      var data = this._parse_query(query);
      return data;
   }
}