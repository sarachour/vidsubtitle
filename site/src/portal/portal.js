/*
stages: segment, scribe, edit
*/
var handle_redirects = function(s){
   var par_args = s.get();
   if(par_args.data == undefined) return false;
   var args = JSON.parse(par_args.data);

   var go = args.go;
   if(args.go != undefined && args.data != undefined){
      var g_url = "";
      var data = JSON.stringify(args.data);
      switch(args.go){
         case "preview":
            g_url = s.preview(data);
            break;
         case "segment":
            g_url = s.segment(data);
            break;
         case "edit":
            g_url = s.edit(data);
            break;
         case "scribe":
            g_url = s.scribe(data);
            break;
         case "portal":
            g_url = s.portal();
      }
      console.log(g_url);
      console.log(data);
      s.redirect(g_url);
      return true;
   }
   console.log("args:",args);
   return false;
}


$(document).ready(function(){
   console.log("ready");
   var s = new Navigator();
   var is_redirect = handle_redirects(s);
   //var input_url = document.getElementById("input_url").value;


   $("#begin").click(function() {
      /*
      Hey - i found the bug, you need to get the input value during the click
      otherwise it's just empty
      */
      //var input_url = document.getElementById("input_url").value;
      // This is shorthand for the line you had above :)
      var input_url = $("#input_url").val();
      if(!is_redirect){
         s.start(input_url,function(vid_url){
            var seg_url = s.segment(vid_url);
            s.redirect(seg_url);
         });
      }
   });
});



// if(!is_redirect){
   //    s.start("https://www.youtube.com/watch?v=bqzUI1ihfpk",function(vid_url){
   //       var seg_url = s.segment(vid_url);
   //       s.redirect(seg_url);
   //    });
