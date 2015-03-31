var video;
var seg;

var SegmentController = function(ctrls,player,button){
  this.init = function(ctrls, player,button){
    var that = this;
    this.video = new YoutubeVideo(player);
    this.bar  =new SegmentBar(ctrls);
    this.but = $("#"+button);
    this.obs = new Observer();
    //initialize button
    this.but.html("Start");
    this.but.prop('disabled', true);
    this.segdata = {};
    this.segdata.start = null
    this.segdata.end = null
    this.segdata.eps = 0.5;

    this.but.click(function(){
      that.but.html("Break");
      that.video.play();
      that.but.unbind('click');

      that.but.mousedown(function(){
        that.segdata.start = that.video.time();
        that.bar.hold(that.segdata.start);
      })
      that.but.mouseup(function(){
        that.segdata.end = that.video.time();
        var s = that.segdata.start;
        var e = that.segdata.end;
        var eps = that.segdata.eps;
        console.log(s,e);
        that.bar.hold(null);
        that.bar.mark(s,e);

      })


    })

    //initialize video
    this.video.listen('load', function(evt){
      that.loaded = true;
      that.obs.trigger('loaded');
    }, "ctrlr-load");

    this.video.listen('ready', function(e){
      that.but.prop('disabled',false);
      that.ready = true;
      that.obs.trigger('ready');
      console.log("B");
    }, "ctrlr-ready");

    this.video.listen('play', function(e){
      console.log(e.obj.duration());
      that.bar.duration(e.obj.duration());
      e.obj.rate(0.75);
    })
    
    this.video.listen('update', function(){
      that.bar.progress(that.video.time());
    });

    this.started = false;
    this.loaded = false;
    this.ready = false;
  }
  this.load_video = function(url){
    var that = this;
    if(!this.loaded){
      this.obs.listen('loaded', function(){
        that.video.load(url);
      })
    }
    else {
      that.video.load(url);
    }
  }
  this.init(ctrls,player,button);
}
var ctrl;
$("document").ready(function() {
  ctrl = new SegmentController("controls","player1","break");
  ctrl.load_video("media/vid1.webm");
  /*
    seg = new SegmentBar("controls");
    video = new YoutubeVideo("player1");
    seg.pause(0.5);
    seg.pause(0.4);
    seg.silence(0.8,0.9);
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
  */
});