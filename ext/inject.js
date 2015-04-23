
var data = {};

var load_track = function(){
   var vid = data.vid;
   vid.attr('crossorigin','anonymous');

   $.get( "https://127.0.0.1:8080/media/sample_seg.vtt", function( data ) {
      console.log(data);
      var track_data = new Blob([data]);
      var track_file = new File([track_data], "sub.vtt", {type:"text/vtt"});
      var track_url = URL.createObjectURL(track_file);
   });

   

/*
   var sub = $("<track/>")
      .attr('kind','subtitles')
      .attr('label','hidden subtext')
      .attr('srclang', 'en')
      .attr('src',track_url)
   
   sub[0].addEventListener('load', function(){
      this.mode = "showing";
   })
   $(vid).append(sub);

   data.track_data = track_data;
   data.track_file = track_file;
   data.track_url = track_url;
   data.sub = sub;
   data.vid = vid;
   console.log(data);
   */
}


data.vid = $("video");
data.vid[0].addEventListener('loadedmetadata', function(){
   load_track();
});

