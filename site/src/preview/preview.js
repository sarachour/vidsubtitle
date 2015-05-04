
var PreviewController = function(){
   this.init = function(){
    this.video = new YoutubeVideo("player1",
      ['playpause','progress','current','duration','tracks','volume','fullscreen'],
      {enableAutosize: true, videoWidth:'100%', videoHeight:'100%'});

    this.exp = new SubtitleExporter();
    this.resolver = new Navigator();
    this.cookie = new UserCookie();
    this.video.controls(true);

    var that = this;
    this.views = {};
    this.views.play = $("#play").click(function(){
      that.video.play();
    });

    this.views.srt = $("#srt").click(function(){
      that.export('srt');
      window.location.assign(that.file_url); 
    });

    this.views.vtt = $("#vtt").click(function(){
      that.export('vtt');
      window.location.assign(that.file_url); 
    });

    this.views.vtt = $("#raw").click(function(){
      that.export('raw');
      window.location.assign(that.file_url); 
    });

    this.track = $("<track/>")
      .attr('kind', 'subtitles')
      .attr('srclang', 'en')
      .attr('label', 'English')

    this.load_from_cookie();

    $("video").append(this.track);
   }
   this.load_from_cookie = function(){
      var args = this.cookie.cache();
      if(args.data != undefined){
        this.video.load(args.data.url);
        this.data = args.data;
        this.export('vtt');
        this.track.attr('src', this.file_url);
      }

   }
   this.load_subtitles = function(){
      var dat = JSON.parse($("#output",$("#dev")).val());
      var url = dat.url;
      var str = this.exp.to_vtt(dat);
      var fn = this.exp.to_file(str);
      this.video.load(this.url);
      console.log(fn,url);
   }
   this.display_file = function(){

   }

   this.export = function(type){
    var dat = this.data;
    if(type == "vtt")
      var str = this.exp.to_vtt(dat);
    else if(type == "srt")
      var str = this.exp.to_srt(dat);
    else if(type == "raw")
      var str = this.exp.to_raw(dat);

    var fn = this.exp.to_file(str);

    this.file_url = fn;

   }
   this.init();
}
var pc;

$(document).ready(function(){
   pc = new PreviewController();

})