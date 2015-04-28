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
var keys = {
  left: '&#9654;',
  right: '&#9664;',
  up: '&#9650;',
  down: '&#9660'
}

var ProgramState = function(vp_name, vb_name, hnt_name){
  this.init = function(){
    var that = this;
    this.state = "";
    this.obs = new Observer();
    this._video_player = new VideoPane(vp_name,this);
    this._video_bar = new VideoBar(vb_name,this);
    this._history = new History();
    this._player = new SelectionPlayer(this);
    this._hint = new HintManager(hnt_name, this);
    this._history.listen('undo', function(e){
      console.log(e);
      if(e.type == "shift"){
        that.select(e.selection);
        that.video_bar().shift(-e.left, -e.right);
      }
      else if(e.type == "remove"){
        that.video_bar().model.add_segment(e.start,e.end);
        that.select(e.selection);
      }
    });
    this._history.listen('redo', function(e){
      if(e.type == "shift"){
        that.select(e.selection);
        that.video_bar().shift(e.left, e.right);
      }
      else if(e.type == "remove"){
        that.select(e.selection);
        that.video_bar().model.remove();
      }
    });
    this.video_bar().model.listen('select', function(e){
      that._player.play(e.time);
    })
    //if a marker changes the state
    this.obs.listen('state-change', function(e){
      that.state = e.state;
      that.obs.trigger(that.state);
    }, "state_change_listener")
  }
  this.listen = function(name,cbk){
    this.obs.listen(name, cbk);
  }
  this.set_hint = function(title,desc){
    this._hint.set(title,desc);
  }
  this.undo = function(){
    this._history.undo();
  }
  this.redo = function(){
    this._history.redo();
  }
  this.select = function(time, direction){
    if(isValue(time)){ //update selection
      if(direction != undefined){
        var filter = time;
        this.video_bar().model.select_nearby(filter,direction);
      }
      else{
        if(time < 0) this.video_bar().model.select_nearby(function(){return true;},true);
        else this.video_bar().model.select(time);
      }
      this.obs.trigger('select');
    }
    return this.video_bar().model.select();;
  }
  this.shift = function(lamt,ramt){
    this.video_bar().shift(lamt,ramt);
    var d=this.select();
    this._history.add({type:"shift",left:lamt,right:ramt,selection:(d.start+d.end)/2});
    this.obs.trigger('shift');
  }
  this.remove = function(){
    var e=this.video_bar().remove();
    if(e == null) return;
    if(e.type == "silence"){
      this._history.add({type:"remove",start:e.start,end:e.end,selection:(e.start+e.end)/2});
    }
    else{
      this._history.add({type:"remove",start:e.end,end:e.end,selection:(e.start+e.end)/2});
    }
    this.select();
    this.obs.trigger('remove');
  }
  this.play = function(){
    this.obs.trigger('play')
    this._video_player.play();
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
  this.get_hint_mgr = function(){
    return this._hint;
  }
  this.video_player = function(){
    return this._video_player;
  }
  this.video_bar = function(){
    return this._video_bar;
  }
  this.init();
}

var HintManager = function(id){
  this.init = function(){
    this._hinter = $("#"+id);
  }
  this.set = function(title,description){
    if(title != "")
      $("#title",this._hinter).html(title+":");
    else
      $("#title",this._hinter).html("");
    $("#description",this._hinter).html(description);
  }
  this.image = function(name){
    return "<img src=res/"+name+".png class='hint icon'></img>";
  }
  this.button = function(b){
    return '<div class="hint but">'+b+"</div>";
  }
  this.key = function(k){
    return '<div class="hint key">' + k + "</div>"
  }
  this.init();
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
  this.play = function(time){
    var sel = this.state.select();
    if(sel == null) return;
    var type = sel.type;
    if(type == 'segment' || type == "silence"){
      var s = time;
      var e = sel.end;
      console.log(s,e);
      if(time == undefined) s = sel.start;
      if(this.side == "left"){
        e = s+Math.min(e-s,2);
      }
      else if(this.side == "right"){
        s = e-Math.min(e-s,2);
      }
      this.state.video_player().segment(s,e);
      this.state.video_player().play();
    }

  }
  this.init();
}

// mark a pause with this button
var MarkButton = function(button_name, state){
  this._init = function(){
    var that = this;
    this.view = $("#"+button_name)
      .mouseleave(function(){that.state.set_hint("","")})
      .mouseenter(function(){that.state.set_hint(that.title, that.description)});
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
    this.hmgr = this.state.get_hint_mgr();
    this.view
      .data("button-title","Start")
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});

    this.title = "Start Video Segmentation";
    this.description = "Press "+this.hmgr.button("Start")+" or "+this.hmgr.key("spacebar")+" to start marking the speech.";
    that.view.unbind('click');
    this.view.click(function(){
      that.start();
    })
  }
  this.start = function(){
    var that = this;
    this.view.data("button-title","Break").trigger('changeData');
    this.title = "Break Button";
    this.description = "Press "+this.hmgr.button("Break")+"or"+this.hmgr.key("spacebar")+
          "to mark a pause in the video. Hold while the speaker is silent to mark a silence."
    this.state.play();
    this.is_down = false;
    this.view.unbind('click')
      .pulse('destroy');
    this.view.click(function(){
        if(that.playing) that.state.statemgr().trigger('state-change',{state:'mark'});
        that.is_down = true;
        $(this)
          .pulse({'background-color':'#d33434',color:'white'},{pulses:1,duration:200});
    })
  }
  this._init();
}
var HistoryButton = function(button_name, world, is_undo){
  this.init = function(){
    this.view = $("#"+button_name).addClass('disabled');
    this.state = world;
    this.hmgr = this.state.get_hint_mgr();
    var that = this;

    this.state.listen('play',function(){that.view.removeClass('disabled')});
    if(is_undo){
      this.title = "Undo Action"
      this.description = "Tap "+this.hmgr.image('undo')+" or "+
      this.hmgr.key("Ctrl")+"+"+this.hmgr.key("Z")+" to undo the last modification or deletion of a marker."
    }
    else{
      this.title = "Redo Action"
      this.description =  "Tap "+this.hmgr.image('redo')+" or "+
      this.hmgr.key("Ctrl")+"+"+this.hmgr.key("Y")+" to redo the last modification or deletion of a marker."
    }
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      if(is_undo){
        that.state.undo();
      }
      else{
        that.state.redo();
      }
    })
    .mouseleave(function(){that.state.set_hint("","")})
    .mouseenter(function(){that.state.set_hint(that.title, that.description)})
  }
  this.init();
}

var NavigateButton = function(button_name, state, is_rev){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.hmgr = this.state.get_hint_mgr();

    this.state.listen('play',function(){that.view.removeClass('disabled')});
    if(is_rev){
      this.title = "Previous Segment"
      this.description = "Tap "+this.hmgr.image('prev')+" or "+this.hmgr.key(keys.left)+" to move to the previous segment."
    }
    else{
      this.title = "Next Segment"
      this.description = "Tap "+this.hmgr.image('next')+" or "+this.hmgr.key(keys.right)+" to move to the next segment."
    }
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      var sels = that.state.selections();
      var tmp = that.state.select(function(e){
        return e.type == "silence" || e.type == "segment";
      }, is_rev);
    })
    .mouseleave(function(){that.state.set_hint("","")})
    .mouseenter(function(){that.state.set_hint(that.title, that.description)})
  }
  
  this.init();
}

var ReplayButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.hmgr = this.state.get_hint_mgr();
    this.player = new SelectionPlayer(state);
    this.title = "Replay Segment";
    this.description = "Tap "+this.hmgr.image('replay')+" or "
      +this.hmgr.key(keys.up)+"or "+this.hmgr.key(keys.down)+" to replay the selected segment."


    this.state.listen('play',function(){that.view.removeClass('disabled')});

    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      that.player.play();
    })
    .mouseleave(function(){that.state.set_hint("","")})
    .mouseenter(function(){that.state.set_hint(that.title, that.description)})
  }

  this.init();
}
var DeleteButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.hmgr = this.state.get_hint_mgr();
    this.player = new SelectionPlayer(state);

    this.state.listen('play',function(){that.view.removeClass('disabled')});

    this.title = "Delete Segment";
    this.description = "Tap "+this.hmgr.image('delete')+" or press "+
      this.hmgr.key("z")+" to merge two adjacent segments by removing the marker at the end of the current segment.";
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      that.state.remove();
      that.player.play();
    })
    .mouseleave(function(){that.state.set_hint("","")})
    .mouseenter(function(){that.state.set_hint(that.title, that.description)})
  }

  this.init();
}
var ShiftButton = function(button_name, state, is_start, is_left, amt){
  this.init =function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.hmgr = this.state.get_hint_mgr();
    this.player = new SelectionPlayer(state);

    this.state.listen('play',function(){that.view.removeClass('disabled')});

    if(is_start) this.player.set_side('left');
    else this.player.set_side('right');
    this.amount = amt;
    if(!is_left){  
      this.title = "Make Segment Longer";
      this.description = "Tap "+this.hmgr.image('rshift')+" or "+this.hmgr.key('c')+" to extend the end of the segment.";
    }
    else{
      this.title = "Make Segment Shorter";
      this.description = "Tap "+this.hmgr.image('lshift')+" or "+this.hmgr.key('x')+" to shorten the end of the segment.";
    }
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      var amt = that.amount;
      if(is_left) amt *= -1;
      if(is_start) that.state.shift(amt,0);
      else  that.state.shift(0,amt);
      that.player.play();
    })
    .mouseleave(function(){that.state.set_hint("","")})
    .mouseenter(function(){that.state.set_hint(that.title, that.description)})
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

    this.video.listen('done', function(e){
      //e.obj.rate(0.75);
      that.state.statemgr().trigger('state-change',{state:'ended'});
    }, 'vp-end');
    
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
    this.root = $("#"+bar_name);
    this.view  =new SegmentBar(bar_name, this.model);
    this.state = state;
    this.start_time = null;
    this.root.hide();
    this.state.statemgr().listen('ready', function(){
      that._update_duration();
    })
    this.state.statemgr().listen('play', function(){
      that._update_duration();
      that.root.show();
    })
    this.state.statemgr().listen('tick', function(){
      that._update_time();
    })
    //update bar for hold and unhold situations
    this.state.statemgr().listen('mark', function(){
      that.mark();
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
    return this.model.remove();
  }
  this.mark = function(){
      var t = this.state.video_player().get_model().time();
      this.model.add_segment(t);
      this.state.video_player().segment(t,this.model.duration(), function(){console.log("done")});
      this.state.video_player().play();
  }
  this._init();
}

var SegmentController = function(){
  this.init = function(){
    var that = this;
    this.prog = new ProgramState("player1", "controls", "hint");
    this.queryResolver = new Navigator();

    //load url
    var args = this.queryResolver.get();
    //load request
    if(isValue(args.data)){
      var url = args.data.replace(/\"/g,"");
      that.load(url);
    }

    this.prog.listen('ended', function(){
      var data = {};
      data.go = "preview";
      data.data = that.export();
      var purl = that.queryResolver.portal("segment",data);
      that.queryResolver.redirect(purl);

    });

    this.buttons = {};
    this.buttons.mark = new MarkButton("break", this.prog);
    this.buttons.replay = new ReplayButton("replay", this.prog);
    this.buttons.next = new NavigateButton("next", this.prog,false);
    this.buttons.prev = new NavigateButton("prev", this.prog,true);
    this.buttons.remove = new DeleteButton("delete", this.prog);
    var amt = 0.20;
    this.buttons.ensl = new ShiftButton("en_sl", this.prog, false, true,amt);
    this.buttons.ensr = new ShiftButton("en_sr", this.prog, false,false,amt);
    this.buttons.undo = new HistoryButton("undo",this.prog, true);
    this.buttons.redo = new HistoryButton("redo",this.prog, false);
    this.hmgr = this.prog.get_hint_mgr();
    
    this.demo = new Demo("demo");
    this.demo.set_splash("Welcome! In the following task, you will be breaking up videos "+
      "into small, easy-to-caption chunks by marking when speakers start and stop speaking in the video."+
      "In the following practice round, we will walk you through the process. Thank you!")

    this.demo.add_step("Start Segmentation Process",
      "Press "+this.hmgr.button('Start')+" or tap the "+this.hmgr.key('spacebar')+" key to begin.",
      [$("#break")]);

    this.demo.add_step("Mark in the Video",
      "Mark when a speaker starts or stops speaking by tapping the "+this.hmgr.key('spacebar') +" key or pressing the " +this.hmgr.button('Break')+" button.",
      [$("#break")]);

    this.demo.add_step("Review Video Segments created from Marking Speech Start/End",
      "Review previously made segments using the "+this.hmgr.image('prev')+" and "+ this.hmgr.image('next')+" buttons."+
      "you may also use the "+this.hmgr.key(keys.left)+" and "+this.hmgr.key(keys.right)+" keys or click on segments in the segment bar.",
      [$("#prev"),$("#next")]);

    this.demo.add_step("Replay a Segment from the Beginning",
      "Replay a segment by pressing "+this.hmgr.image('replay')+" or pressing the "
        +this.hmgr.key(keys.up)+" and "+this.hmgr.key(keys.down)+" keys.",
      [$("#replay")])


    this.demo.add_step("Adjust the length of the Selected Segment",
      "Shift the marker at the end of each segment to fix cut off words with "+this.hmgr.image('lshift')+" and "+this.hmgr.image('rshift')+
      " or use the "+this.hmgr.key('x')+" and "+this.hmgr.key('c')+ " keys",
      [$("#lshift"), $("#rshift")])

    this.demo.add_step("Merge Two Adjacent Segments by Deleting Speech Marker",
      "Delete the marker to the right of the selected segment using the "+this.hmgr.image('delete')+
      "button or "+this.hmgr.key('z')+" key.",
      [$("#delete")])

    this.demo.add_step("Undo/Redo changes",
      "Undo or redo any actions using the "+this.hmgr.image('undo')+" and "+this.hmgr.image('redo')+" buttons or the "+
      this.hmgr.key("Ctrl")+"+"+this.hmgr.key("Z")+" and "+this.hmgr.key("Ctrl")+"+"+this.hmgr.key("Y")+" keys.",
      [$("#undo"), $("#redo")]);

    $("#start_demo").click(function(){
      that.demo.start();
    })
    $("#title").html("Video Segmentation");

    this.status = new Status("progress","status",1);
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
  this.export = function(d){
    var data = {};
    var segdata = this.prog.video_bar().model.export();
    data.data = segdata;
    data.url = this.prog.video_player().get_model().get_url();
    return data;
  }
  this.load = function(v){
    this.prog.video_player().load(v);
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
  $("#export",$("#dev")).click(function(){
    var str = JSON.stringify(ctrl.export());
    $("#output", $("#dev")).val(str);
  })
  $("#load", $("#dev")).click(function(){
    var data = $("#output", $("#dev")).val();
    ctrl.from_json(JSON.parse(data));
  })

});