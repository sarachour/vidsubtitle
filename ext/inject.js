
var data = {};

var load_track = function(){
   var vid = $("video");
   vid.attr('crossorigin','anonymous');
   //create track
   var track = vid[0].addTextTrack("captions", "English","en");
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

}

var add_buttons = function(){
   var vid = $("video");
   var request = $("<button/>")
      .html("Request Video")
      .css('position','absolute')
      .css('right',vid.offset().left)
      .css('top',vid.offset().top)
      .css('width',200)
      .css('height',100)
      .css('background-color', 'blue');
   $("body").append(request);
}

$("document").ready(function(){
   load_track();
   add_buttons();
})
