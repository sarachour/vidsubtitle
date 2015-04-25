
var HiddenSubtext = function(vid){
   this.init = function(){
      this.video = vid;
      this.video.attr('crossorigin','anonymous');
      this.track = null;
   }
   //convenience method to add track from file
   this._cue_from_str = function(data){
      var track = this.video[0].addTextTrack("captions", "English","en");
      this.track = track;
      var lines = data.split(/\n/);
      lines.forEach(function(line){
         var fields = line.split(";");
         if(fields.length < 4) return;
         var speaker = fields[0];
         var start = fields[1];
         var end = fields[2];
         var text = fields[3];
         track.addCue(new VTTCue(start,end,text));
      })
   }
   this.get_name = function(){
      return "English (Hidden Subtext)";
   }
   this.show_subs = function(){
      this.track.mode = "showing";
   }
   this.hide_subs = function(){     
      this.track.mode = "hidden";
   }
   this.load_subs  =function(id,cbk){
      var that = this;
      $.get("https://localhost:4443/media/sample_seg.raw", function( data ) {
         that._cue_from_str(data);
         cbk(that);
      });

   }
   this.init();

}
