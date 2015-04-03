var video;
var seg;

/*
Video States: 
ready: the video is ready to play
playing: the video is playing
tick: the video has taken a time step
paused: the video is paused

User Action States:
hold: the user began a marking
unhold: the user stopped a marking
select: the user selected something
modify: the user modified something
delete: the user deleted a marking


*/
var ProgramState = function(vp_name, vb_name){
  this.init = function(){
    var that = this;
    this.state = "";
    this.obs = new Observer();
    this._video_player = new VideoPane(vp_name,this);
    this._video_bar = new VideoBar(vb_name,this);

    //if a marker changes the state
    this.obs.listen('state-change', function(e){
      that.state = e.state;
      that.obs.trigger(that.state);
    }, "state_change_listener")
  }
  this.select = function(i){
    if(isValue(i)){ //update selection
      this._select.index = i;
      this._select.data = this.video_bar().model.select(i);
      this.obs.trigger('select');
    }
    return this._select;
  }
  this.selections = function(){
    return this.video_bar().model.get_selections();
  }
  this.statemgr = function(){
    return this.obs;
  }
  this.get_state = function(){
    return this.state;
  }
  this.video_player = function(){
    return this._video_player;
  }
  this.video_bar = function(){
    return this._video_bar;
  }
  this.init();
}

// mark a pause with this button
var MarkButton = function(button_name, state){
  this._init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.playing = false;
    this.init();

    this.view.prop('disabled', true);
    this.state.statemgr().listen('ready', function(){
      that.view.prop('disabled',false);
    })
    this.state.statemgr().listen('playing', function(){
      that.playing = true;
    })
    this.state.statemgr().listen('paused', function(){
      that.playing = false;
      that.init();
    })

    
  }
  this.init = function(){
    var that = this;
    this.view.data("button-title","Start");
    that.view.unbind('click');
    this.view.click(function(){
      that.start();
    })
  }
  this.start = function(){
    var that = this;
    this.view.data("button-title","Break");
    this.state.video_player().play();
    this.is_down = false;
    this.view.unbind('click');
    this.view.mousedown(function(){
        if(that.playing) that.state.statemgr().trigger('state-change',{state:'hold'});
        that.is_down = true;
    })
    this.view.mouseup(function(){
        if(that.playing && that.is_down) that.state.statemgr().trigger('state-change',{state:'unhold'});

    })
  }
  this._init();
}

var BackButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;

    this.view.click(function(){
      console.log('prev', that.state.selections());
    })
  }
  
  this.init();
}

var NextButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;

    this.view.click(function(){
      console.log('next', that.state.selections());
    })
  }

  this.init();
}
var DeleteButton = function(button_name, state){
  this.init = function(){
    this.view = $("#"+button_name);
    this.state = state;
    this.view.click(function(){
      console.log("delete");
    })
  }

  this.init();
}
var DelayButton = function(button_name, state){
  this.init =function(){
    this.view = $("#"+button_name);
    this.state = state;
    this.view.click(function(){
      console.log("delay");
    })
  }

  this.init();
}
var PreemptButton = function(button_name, state){
    this.init = function(){
      this.view = $("#"+button_name);
      this.state = state;
      this.view.click = function(){
        console.log("preempt");
      }
    }
    this.init();
}
var VideoPane = function(video_name, state){
  this._init = function(){
    var that = this;
    this.video = new YoutubeVideo(video_name);
    this.state = state;
    //initialize video
    this.video.listen('load', function(evt){
      that.state.statemgr().trigger('state-change',{state:'load'});
    }, "vp-load");

    this.video.listen('ready', function(e){
      that.state.statemgr().trigger('state-change',{state:'ready'});
    }, "vp-ready");

    this.video.listen('play', function(e){
      //e.obj.rate(0.75);
      that.state.statemgr().trigger('state-change',{state:'playing'});
    }, 'vp-play');
    
    this.video.listen('update', function(){
      that.state.statemgr().trigger('state-change',{state:'tick'});
    }, 'vp-update');
  }
  this.get_model = function(){
    return this.video;
  }
  this.play = function(){
    this.video.play();
  }
  this.pause = function(){
    this.video.pause();
  }
  this._init();
}

var VideoBar  =function(bar_name, state){
  this._init = function(){
    var that = this;
    this.model = new SegmentModel();
    this.view  =new SegmentBar(bar_name, this.model);
    this.state = state;
    this.start_time = null;
    this.state.statemgr().listen('ready', function(){
      that._update_duration();
    })
    this.state.statemgr().listen('play', function(){
      that._update_duration();
    })
    this.state.statemgr().listen('tick', function(){
      that._update_time();
    })

    //update bar for hold and unhold situations
    this.state.statemgr().listen('hold', function(){
      that.hold();
    })
    this.state.statemgr().listen('unhold', function(){
      that.unhold();
    })
  }
  this._update_time = function(){
    var dur = this.state.video_player().get_model().time();
    this.model.time(dur);
  }
  this._update_duration = function(){
    var dur = this.state.video_player().get_model().duration();
    this.model.duration(dur);
  }
  this.hold = function(){
      this.start_time= this.state.video_player().get_model().time();
  }
  this.unhold = function(){
      var e = this.state.video_player().get_model().time();
      var s = this.start_time;
      console.log(s,e);
      this.model.add_segment(s,e);
  }
  this._init();
}

var SegmentController = function(video_player, video_bar, break_button, next_button, prev_button, delay_button, earlier_button, delete_button){
  this.init = function(){
    this.prog = new ProgramState(video_player, video_bar);
    this.buttons = {};
    this.buttons.mark = new MarkButton(break_button, this.prog);
    this.buttons.next = new NextButton(next_button, this.prog);
    this.buttons.prev = new BackButton(prev_button, this.prog);
    this.buttons.remove = new DeleteButton(delete_button, this.prog);
    this.buttons.delay = new DelayButton(delay_button, this.prog);
    this.buttons.preempt = new PreemptButton(earlier_button, this.prog);
  }
  this.to_json = function(){
    var data = {};
    var segdata = this.segs.to_json();
    data.data = segdata;
    data.url = this.video.get_url();
    return data;
  }
  this.init();
}


var ctrl;

//video_player, video_bar, break_button, next_button, prev_button, delay_button, earlier_button, delete_button
$("document").ready(function() {
  var data = {};
  ctrl = new SegmentController("player1","controls","break","next","prev","delay","preempt","delete");

  /*
  var play_seg = function(){
    if(data.idx < 0) data.idx = 0;
      if(data.idx >= data.segs.length) data.idx = data.segs.length-1;

      var d = data.segs[data.idx]
      var e = d.start;
      var s;
      if(data.idx == 0) s = 0;
      else s = data.segs[data.idx-1].end;


      console.log(data.idx, s,e);
      ctrl.video.segment(s,e);
      ctrl.video.play();
  }

  $("#save",$("#dev")).click(function(){
    var str = JSON.stringify(ctrl.to_json());
    $("#output", $("#dev")).val(str);
  })
  $("#review",$("#dev")).click(function(){
    data.segs = ctrl.to_json().data;
    data.idx = 0;
    ctrl.video.pause();
    play_seg();
  })
  $("#next", $("#dev")).click(function(){
    data.idx+=1;
    play_seg();
  })
  $("#prev", $("#dev")).click(function(){
    data.idx-=1;
    play_seg();
  })
  */
});