
var PreviewController = function(){
   this.init = function(){
    this.video = new YoutubeVideo("player1");
    this.exp = new SubtitleExporter();
    this.resolver = new Navigator();
    this.cookie = new UserCookie();

    var that = this;
    this.views = {};
    this.views.play = $("#play").click(function(){
      that.video.play();
    });

    this.views.srt = $("#srt").click(function(){
      that.export('srt');
    });

    this.views.vtt = $("#vtt").click(function(){
      that.export('vtt');
    });

    this.views.vtt = $("#raw").click(function(){
      that.export('raw');
    });

    this.views.back = $("#back").click(function(){
      that.back();
    })
    this.track = $("<track/>")
      .attr('kind', 'subtitles')
      .attr('srclang', 'en')
      .attr('label', 'English')

    this.load_from_cookie();

    $("video").append(this.track);
   }
   this.back = function(){
    var args = this.resolver.get();
    var url = "";
    var from = args.from;
    if(from == 'segment')
      url = this.resolver.segment(this.data);
    else if(from == 'edit')
      url = this.resolver.edit(this.data);
    else if(from == 'scribe')
      url = this.resolver.scribe(this.data);

    this.resolver.redirect(url);
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
//http://localhost:8080/preview.html?data=%22%7B%5C%22data%5C%22%3A%5B%7B%5C%22start%5C%22%3A0%2C%5C%22end%5C%22%3A1.637008%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A1.637008%2C%5C%22end%5C%22%3A4.539383%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A4.539383%2C%5C%22end%5C%22%3A6.721969%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A6.721969%2C%5C%22end%5C%22%3A9.670782%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A9.670782%2C%5C%22end%5C%22%3A11.528302%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A11.528302%2C%5C%22end%5C%22%3A13.919859%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A13.919859%2C%5C%22end%5C%22%3A15.127247%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A15.127247%2C%5C%22end%5C%22%3A18.911944%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A18.911944%2C%5C%22end%5C%22%3A20.212208%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A20.212208%2C%5C%22end%5C%22%3A21.233844%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A21.233844%2C%5C%22end%5C%22%3A23.509306%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A23.509306%2C%5C%22end%5C%22%3A24.670256%2C%5C%22caption%5C%22%3A%7B%7D%7D%2C%7B%5C%22start%5C%22%3A24.670256%2C%5C%22end%5C%22%3A25.668673%2C%5C%22caption%5C%22%3A%7B%7D%7D%5D%2C%5C%22url%5C%22%3A%5C%22http%3A%2F%2Flocalhost%3A8080%2Fmedia%2Fyoutube%2FnqFq1jL_4V4.mp4%5C%22%7D%22
$(document).ready(function(){
   pc = new PreviewController();

})