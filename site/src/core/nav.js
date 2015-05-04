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
   this._encode_data = function(url,data, from, to){
      var text = this._strip(JSON.stringify(data));
      var val = encodeURIComponent(text);
      url += "?data="+val+"&from="+from+"&to="+to;
      return url;
   }
   this.segment = function(data){
      //now we pass it in through cookies
      return this._encode_data(this.base_url + "/segment.html",null,null,'segment');
   }
   this.demo = function(from,data){
      return this._encode_data(this.base_url + "/"+from+"demo.html",data, from, 'demo');
   }
   //data to trans
   this.scribe = function(data){
      return this._encode_data(this.base_url + "/scribe.html",null, null, 'scribe');
   }
   this.edit = function(data){
      console.log(data);
      return this._encode_data(this.base_url + "/edit.html",null, null, 'edit');
   }
   this.preview = function(data, from){
      return this._encode_data(this.base_url + "/preview.html",null, from, 'preview');
   }
   this.portal = function(from,to,data){
      var url = this._encode_data(this.base_url+"/portal.html",null, from, to);
      url + "&from="+from+"&to="+to;
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