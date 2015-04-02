var video;
var seg;



var SegmentController = function(ctrls,player,mark,repeat){
  this.init = function(ctrls, player,mark, repeat){
    var that = this;
    this.video = new YoutubeVideo(player);
    this.segs = new SegmentModel();
    this.bar  =new SegmentBar(ctrls, this.segs);
    this.mark = $("#"+mark);
    this.repeat = $("#"+repeat);
    this.obs = new Observer();


    //initialize button
    this.mark.data("button-title","Start");
    this.mark.prop('disabled', true);
    this.repeat.prop('disabled', true);


    //initialize handlers
    this.mark.click(function(){
      that.mark.data("button-title","Break");
      that.repeat.prop('disabled',false);
      that.video.play();
      that.mark.unbind('click');

      that.mark.mousedown(function(){
        $(this).data('start', that.video.time());
        that.segs.hold();
      })
      that.mark.mouseup(function(){
        var e = that.video.time();
        var s = $(this).data('start');
        that.segs.unhold();
        that.segs.add_segment(s,e);

      })


    })
    this.repeat.click(function(){
        that.segs.redo();
        that.video.jump(that.segs.redo_start_time());
    })

    //initialize video
    this.video.listen('load', function(evt){
      that.loaded = true;
      that.obs.trigger('loaded');
    }, "ctrlr-load");

    this.video.listen('ready', function(e){
      that.mark.prop('disabled',false);
      that.ready = true;
      that.segs.duration(e.obj.duration());
      that.obs.trigger('ready');
    }, "ctrlr-ready");

    this.video.listen('play', function(e){
      that.segs.duration(e.obj.duration());
      e.obj.rate(0.75);
    })
    
    this.video.listen('update', function(){
      that.segs.time(that.video.time());
    });

    this.started = false;
    this.loaded = false;
    this.ready = false;
  }
  this.to_json = function(){
    var data = {};
    var segdata = this.segs.to_json();
    data.data = segdata;
    data.url = this.video.get_url();
    return data;
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
  var that = this;
  ctrl = new SegmentController("controls","player1","break","repeat");
  ctrl.load_video("media/vid1.webm");

  $("#save",$("#dev")).click(function(){
    var str = JSON.stringify(ctrl.to_json());
    $("#output", $("#dev")).val(str);
  })
});