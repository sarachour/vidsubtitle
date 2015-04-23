
var data = {};

var load_track = function(){
   var vid = data.vid;
   vid.attr('crossorigin','anonymous');
   console.log("loading subs");
   //create track
   var track = $("video")[0].addTextTrack("captions", "English","en");
   track.mode = "showing";

   $.get( "https://localhost:4443/media/sample_seg.raw", function( data ) {
      var lines = data.split(/\n/);
      lines.forEach(function(line){
         var fields = line.split(";");
         if(fields.length < 4) return;
         var speaker = fields[0];
         var start = fields[1];
         var end = fields[2];
         var text = fields[3];
         console.log(speaker,start,end,text)
         track.addCue(new VTTCue(start,end,text));
      })
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
   console.log("META_META_META_META");
   load_track();
});

