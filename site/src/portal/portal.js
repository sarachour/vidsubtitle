/*
stages: segment, scribe, edit
*/
var handle_redirects = function(s){
   var par_args = s.get();
   var data = par_args.data;
   var to = par_args.to;
   var from = par_args.from;
   console.log(to);
   if(par_args.to != undefined){
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
            console.log("data");
            g_url = s.edit(data);
            break;
         case "scribe":
            g_url = s.scribe(data);
            break;
         case "portal":
            g_url = s.portal(to, from, data);
            break;
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
   var args = nav.get();


   //$("#spinner").spin();
   // clicking button
   var handle_video = function(vid_url){
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
   }
   $("#begin").click(function() {
      if($(this).hasClass('disabled')) return;
      var input_url = $("#input_url").val();
      if(!is_redirect){
         $("#spinner").spin('medium');
         if(args.mock == true){
            handle_video('media/youtube/video.mp4');
         }
         else{
            nav.start(input_url,function(vid_url){
               handle_video(vid_url);
            });
         }
         
      }
   })
   .addClass('disabled');

   // pressing enter
   $("#input_url").keyup(function(event){
      if(event.keyCode == 13){
         $("#begin").click();
      }
   })
   .on('input propertychange paste',function(){
      if($(this).val() != ""){
         $("#begin").removeClass('disabled');
      }
      else{
         $("#begin").addClass('disabled');
      }
   });
   
});



// if(!is_redirect){
   //    s.start("https://www.youtube.com/watch?v=bqzUI1ihfpk",function(vid_url){
   //       var seg_url = s.segment(vid_url);
   //       s.redirect(seg_url);
   //    });
