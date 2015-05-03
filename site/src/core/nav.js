var Navigator = function(){
   this.base_url = "http://localhost:8080";
   this._strip = function(text){
      text=text.replace(/^["]+/g,"");
      text=text.replace(/["]+$/g,"");
      return text;
   }
   this._parse_query = function(e){
      var qlist = e.split("?")[1];
      if(qlist == undefined) return {};
      var terms =qlist.split("&");

      var dict = {};
      for(var i=0; i < terms.length; i++){
         var args=  terms[i].split("=");

            
         var n = this._strip(decodeURIComponent(args[0]));
         var v = this._strip(decodeURIComponent(args[1]));
         try{
              v=JSON.parse(v);
          }
          catch(e){}
         dict[n] = v;
      }
      return dict;
   }

   this.redirect = function(url){
      window.location.href = url;
   }
   this._encode_data = function(url,data){
      var text = this._strip(JSON.stringify(data));
      var val = encodeURIComponent(text);
      url += "?data="+val;
      return url;
   }
   this.segment = function(url, is_practice){
      return this._encode_data(this.base_url + "/segment.html",{url:url,data:[],practice:is_practice});
   }
   this.demo = function(type,url){
      return this._encode_data(this.base_url + "/"+type+"demo.html",{url:url,data:[]});
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