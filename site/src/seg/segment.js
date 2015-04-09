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
    this._select = {index:null, data:null};
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
  this.shift = function(lamt,ramt){
    this.video_bar().shift(lamt,ramt);
  }
  this.remove = function(){
    this.video_bar().remove();
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

var SelectionPlayer = function(state){
  this.init = function(){
    this.state = state;
    this.sfx = new AudioFile('media/click.mp3');
    this.timer = null;
    this.side = "both";
  }
  this.set_side = function(s){
    this.side = s;
  }
  this.play = function(){
    var sels = this.state.selections();
    var sel = this.state.select();
    if(sel == null || sel.data == null) return;
    var type = sel.data.type;
    var idx = sel.index;
    if(type == 'segment' || type == "silence"){
      var s = sel.data.start;
      var e = sel.data.end;
      console.log(s,e);
      if(this.side == "left"){
        e = s+Math.min(e-s,2);
      }
      else if(this.side == "right"){
        s = e-Math.min(e-s,2);
      }
      this.state.video_player().segment(s,e);
      this.state.video_player().play();
    }
    console.log("playing selection");

  }
  this.init();
}

var NavigateButton = function(button_name, state, is_fwd){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.player = new SelectionPlayer(state);

    this.view.click(function(){
      var sels = that.state.selections();
      var tmp = that.state.select();

      var idx = 0;
      if(tmp.index  == null)
        idx = sels.length()-1;
      else
      {
        var tmpd = tmp.data;
        var act=sels.match(function(e){
          return (e.id == tmpd.id)&&(e.sid == tmpd.sid)&&(e.eid == tmpd.eid);
        })
        console.log(tmpd,act,sels);
        if(act.length() == 0) return;
        idx = act.get(0).index;
        if(is_fwd){
          if(idx < sels.length()-1) idx+=1;
        }
        else{
          if(idx > 0) idx-=1;
        }
      }
      
     
      /*
      if(sel.index  == null)
        sel.index = sels.length()-1;
      else if(sel.index > 0)
        sel.index-=1;
      
      sel = 
      */
      that.state.select(idx);
      that.player.play();
    })
  }
  
  this.init();
}

var ReplayButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.player = new SelectionPlayer(state);

    this.view.click(function(){
      that.player.play();

      console.log('replay');
    })
  }

  this.init();
}
var DeleteButton = function(button_name, state){
  this.init = function(){
    this.view = $("#"+button_name);
    this.state = state;
    this.player = new SelectionPlayer(state);

    this.view.click(function(){
      console.log("delete");
      that.state.remove();
      that.player.play();
    })
  }

  this.init();
}
var ShiftButton = function(button_name, state, is_start, is_left, amt){
  this.init =function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.player = new SelectionPlayer(state);
    if(is_start) this.player.set_side('left');
    else this.player.set_side('right');
    this.amount = amt;

    this.view.click(function(){
      var amt = that.amount;
      if(is_left) amt *= -1;
      if(is_start) that.state.shift(amt,0);
      else  that.state.shift(0,amt);
      that.player.play();
    })
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
  this.segment = function(s,e,c){
    this.video.segment(s,e,c);
  }
  this.pause = function(){
    this.video.pause();
  }
  this.load = function(url){
    this.video.load(url);
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
  this.shift = function(l,r){
    this.model.shift(l,r);
  }
  this.remove = function(){
    this.model.remove();
  }
  this.hold = function(){
      this.start_time= this.state.video_player().get_model().time();
      this.model.hold();
  }
  this.unhold = function(){
      var e = this.state.video_player().get_model().time();
      var s = this.start_time;
      this.model.add_segment(s,e);
      this.model.unhold();
  }
  this._init();
}

var SegmentController = function(){
  this.init = function(){
    this.prog = new ProgramState("player1", "controls");
    this.buttons = {};
    this.buttons.mark = new MarkButton("break", this.prog);
    this.buttons.replay = new ReplayButton("replay", this.prog);
    this.buttons.next = new NavigateButton("next", this.prog,true);
    this.buttons.prev = new NavigateButton("prev", this.prog,false);
    this.buttons.remove = new DeleteButton("delete", this.prog);
    var amt = 0.25;
    this.buttons.stsl = new ShiftButton("st_sl", this.prog, true, true,amt);
    this.buttons.stsr = new ShiftButton("st_sr", this.prog, true, false,amt);
    this.buttons.ensl = new ShiftButton("en_sl", this.prog, false, true,amt);
    this.buttons.ensr = new ShiftButton("en_sr", this.prog, false,false,amt);
  }
  this.to_json = function(){
    var data = {};
    var segdata = this.prog.video_bar().model.to_json();
    data.data = segdata;
    data.url = this.prog.video_player().get_model().get_url();
    return data;
  }
  this.from_json = function(d){
    var url = d.url;
    var segdata = d.data;
    this.prog.video_player().load(url);
    this.prog.video_bar().model.from_json(segdata);
  }
  this.init();
}


var ctrl;

//video_player, video_bar, break_button, next_button, prev_button, delay_button, earlier_button, delete_button
$("document").ready(function() {
  var data = {};
  ctrl = new SegmentController();
  $("#save",$("#dev")).click(function(){
    var str = JSON.stringify(ctrl.to_json());
    $("#output", $("#dev")).val(str);
  })
  $("#load", $("#dev")).click(function(){
    var data = $("#output", $("#dev")).val();
    ctrl.from_json(JSON.parse(data));
  })

  $("#output", $("#dev")).val(
    '{"data":[{"start":38.379466,"end":38.51878,"length":0.13931399999999883,"id":12,"type":"break"},{"start":45.600575,"end":45.71667,"length":0.11609500000000139,"id":14,"type":"break"},{"start":34.896616,"end":35.03593,"length":0.13931399999999883,"id":10,"type":"break"},{"start":20.64015,"end":22.892393,"length":2.252243,"id":7,"type":"silence"},{"start":35.569967,"end":36.289756,"length":0.7197889999999987,"id":11,"type":"silence"},{"start":31.460204,"end":31.576299,"length":0.11609499999999784,"id":9,"type":"break"},{"start":26.073396,"end":28.093449,"length":2.0200530000000008,"id":8,"type":"silence"},{"start":42.23382,"end":42.373134,"length":0.13931399999999883,"id":13,"type":"break"},{"start":16.274978,"end":16.391073,"length":0.11609499999999784,"id":6,"type":"break"},{"start":14.208487,"end":14.324582,"length":0.11609499999999962,"id":5,"type":"break"},{"start":11.259674,"end":11.375769,"length":0.11609499999999962,"id":4,"type":"break"},{"start":9.425373,"end":9.541468,"length":0.11609499999999962,"id":3,"type":"break"},{"start":7.63751,"end":7.776824,"length":0.1393140000000006,"id":2,"type":"break"},{"start":5.338829,"end":5.431705,"length":0.0928760000000004,"id":1,"type":"break"},{"start":4.990544,"end":5.129858,"length":0.13931399999999972,"id":0,"type":"break"}],"url":"http://127.0.0.1:8080/media/vid1.mp4"}')
  $("#load",$("#dev")).click();
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