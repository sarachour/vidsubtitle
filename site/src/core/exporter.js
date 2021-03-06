var SubtitleExporter = function(){
   this.file = null;
   this.lorem = new Lorem();
   this.pad2 = function(n){
      n = Math.floor(n);
      if(n == 0) return "00";
      else if(n < 10) return "0"+n;
      else return n;
   }
   this.pad3 = function(n){
         n = Math.floor(n);
         if(n <= 0) return "000";
         else if(n < 10) return "00"+n;
         else if(n < 100) return "0"+n;
         else return n;
   }
   this.for_each = function(json, cbk){
      var elems = json.data;
      var str = "";
      for(var i=0; i < elems.length; i++){
         var e = elems[i];
         str += cbk(e,i, e.start, e.end);

      }
      return str;
   }
   this.to_raw = function(json){
      var delim = ";";
      var nline = "\n";
      var that = this;
      var str = this.for_each(json, function(n,i,s,e){
         var nub = "";
         
         var nspeakers = 0;
         if(n.caption != undefined){
            for(var speaker in n.caption){
               nub += speaker;
               nub += delim;
               nub += s;
               nub += delim;
               nub += e;
               nub += delim;
               nub += n.caption[speaker];
               nub += nline;
               nspeakers++;
            }
         }
         return nub;
      })
      return str;
   }
   this.to_vtt = function(json){
      var that = this;
      var tc = function(s){
         var ms =Math.floor(s*1000); //milliseconds
         ms -= s*1000;
         var mins=Math.floor(s/60);
         s -= mins*60;
         var str = that.pad2(mins)+":"+that.pad2(s)+"."+that.pad3(ms);
         return str;

      }
      str = "WEBVTT\n\n";
      str += this.for_each(json, function(n,i,s,e){
         var nub = "";
         nub += tc(s)+" --> "+tc(e)+"\n";
         var nspeakers = 0;
         if(n.caption != undefined){
            for(var speaker in n.caption){
               nub += "<v "+speaker+">";
               nub += n.caption[speaker] + "\n";
               nspeakers++;
            }
         }
         nub += "\n";
         if(nspeakers == 0) nub = "";
         return nub;
      })
      return str;
   }
   this.to_srt = function(json){
      var that = this;
      var tc = function(s){
         var ms =Math.floor(s*1000); //milliseconds
         var mins=Math.floor(s/60);
         var hours=Math.floor(mins/60);
         mins -= hours*60;
         s -= mins*60;
         ms -= s*1000;
         var str = that.pad2(hours)+":"+that.pad2(mins)+":"+that.pad2(s)+","+that.pad3(ms);
         return str;

      }
      var str = this.for_each(json, function(n,i,s,e){
         var nub = "";
         nub += (i+1)+"\n";
         nub += tc(s)+" --> "+tc(e)+"\n";

         var nspeakers = 0;
         if(n.caption != undefined){
            for(var speaker in n.caption){
               nub += speaker+":";
               nub += n.caption[speaker] + "\n";
               nspeakers++;
            }
         }
         nub += "\n";
         if(nspeakers == 0) nub = "";
         return nub;
      })
      return str;
   }
   this.to_file = function(data){
      window.URL = window.URL || window.webkitURL;
      var blob = new Blob([data], {type: 'text/plain'});
      if(this.file != null){
         window.URL.revokeObjectURL(this.file);
      }
      this.file = window.URL.createObjectURL(blob);
      console.log(this.file, blob)
      return this.file;
   }
}