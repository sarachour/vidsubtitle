var video;
$("document").ready(function() {
    video = new YoutubeVideo("player1");
    console.log("created video");
    video.listen('load', function(evt){
      var vid = evt.obj;
      console.log("updating", evt);
      vid.load("https://www.youtube.com/watch?v=kE75vRV9tos");
      
      vid.listen('ready', function(e){
        e.obj.segment(55, 59);
        e.obj.play();
      },'autoplay');
    }, "load-video");
});