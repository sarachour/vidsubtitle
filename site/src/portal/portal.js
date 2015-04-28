/*
stages: segment, scribe, edit
*/

$(document).ready(function(){
   console.log("ready");
   var s = new Navigator();
   var args = s.get();
   console.log("args:",args);
   s.start("https://www.youtube.com/watch?v=nqFq1jL_4V4",function(vid_url){
      var seg_url = s.segment(vid_url);
      s.redirect(seg_url);
   })
})