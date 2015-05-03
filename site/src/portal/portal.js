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
         case "demo":
            g_url = s.demo(args.demo_type, data);
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
   var nav = new Navigator();
   var ck = new UserCookie();
   var is_redirect = handle_redirects(nav); //spinner option
   var opt = {lines: 8, length:2, width:2, radius:3};

   var user_data = $.cookie('user_data');
   if(user_data == undefined){
      
   }
   //$("#spinner").spin();
   // clicking button
   $("#begin").click(function() {
      var input_url = $("#input_url").val();
      if(!is_redirect){
         $("#spinner").spin('medium');

         nav.start(input_url,function(vid_url){
            $("#spinner").spin(false);
            if(ck.tutorial('segment')){
               var seg_url = nav.segment(vid_url);
               nav.redirect(seg_url);
            }
            else{
               var seg_url = nav.demo('segment',vid_url);
               nav.redirect(seg_url);
            }
         });
      }
   });

   // pressing enter
   $("#input_url").keyup(function(event){
      if(event.keyCode == 13){
         $("#begin").click();
      }
   });
   
});



// if(!is_redirect){
   //    s.start("https://www.youtube.com/watch?v=bqzUI1ihfpk",function(vid_url){
   //       var seg_url = s.segment(vid_url);
   //       s.redirect(seg_url);
   //    });
