/*
stages: segment, scribe, edit
*/
var handle_redirects = function(s){
   var par_args = s.get();
   if(par_args.data == undefined) return false;
   var data = par_args.data;
   var to = par_args.to;
   var from = par_args.from;
   console.log(par_args);
   if(par_args.to != undefined && par_args.data != undefined){
      var g_url = "";
      switch(to){
         case "preview":
            g_url = s.preview(data, from); //from 
            break;
         case "segment":
            g_url = s.segment(data);
            break;
         case "demo":
            g_url = s.demo(from, data);
            break;
         case "edit":
            g_url = s.edit(data);
            break;
         case "scribe":
            g_url = s.scribe(data);
            break;
         case "portal":
            g_url = s.portal(to, from, data);
      }
      console.log(g_url);
      console.log(data);
      s.redirect(g_url);
      return true;
   }
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
            ck.cache('portal', {seg_data:[],url:vid_url})
            
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
