var video;
var seg;

var SegmentController = function(ctrls,player,mark,repeat){
  this.init = function(ctrls, player,mark, repeat){
    var that = this;
    this.video = new YoutubeVideo(player);
    this.bar  =new SegmentBar(ctrls);
    this.mark = $("#"+mark);
    this.repeat = $("#"+repeat);
    this.obs = new Observer();
    //initialize button
    this.mark.html("Start");
    this.mark.prop('disabled', true);
    this.repeat.prop('disabled', true);
    this.segdata = {};
    this.segdata.start = null
    this.segdata.end = null
    this.segdata.eps = 0.5;

    this.mark.click(function(){
      that.mark.html("Break");
      that.repeat.prop('disabled',false);
      that.video.play();
      that.mark.unbind('click');

      that.mark.mousedown(function(){
        that.segdata.start = that.video.time();
        that.bar.hold(that.segdata.start);
      })
      that.mark.mouseup(function(){
        that.segdata.end = that.video.time();
        var s = that.segdata.start;
        var e = that.segdata.end;
        var eps = that.segdata.eps;
        console.log(s,e);
        that.bar.hold(null);
        that.bar.mark(s,e);

      })


    })
    this

    //initialize video
    this.video.listen('load', function(evt){
      that.loaded = true;
      that.obs.trigger('loaded');
    }, "ctrlr-load");

    this.video.listen('ready', function(e){
      that.mark.prop('disabled',false);
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
  this.init(ctrls,player,mark,repeat);
}
var ctrl;
$("document").ready(function() {
  ctrl = new SegmentController("controls","player1","break","repeat");
  ctrl.load_video("media/vid1.webm");
});