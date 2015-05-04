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

    var hint = HINTS["default"];
    that._hint.set(hint.title,hint.desc);

    var disable_record = false;
    this._history.listen('undo', function(e){
      disable_record = true;
      if(e.type == "shift"){
        that.video_bar().model.shift(-e.amt, 0, e.id);
      }
      else if(e.type == "remove"){
        that.video_bar().model.add(e.time,e.id);
      }
      else if(e.type == "add"){
        that.video_bar().model.remove(e.id);
      }
      disable_record = false;
    });
    this._history.listen('redo', function(e){
      disable_record = true;
      if(e.type == "shift"){
        that.video_bar().shift(e.amt, 0,e.id);
      }
      else if(e.type == "remove"){
        that.video_bar().model.remove(e.id);
      }
      else if(e.type == "add") 
        that.video_bar().model.add(e.time,e.id);
      disable_record = false;
    });

    this.video_bar().model
    .listen('select', function(e){
      that._player.play(e.time);
    })
    .listen('update', function(e){
      if(disable_record) return;
      var ctime = that.video_bar().model.time();
      if(e.type == "add" || e.type == "remove"){
        that._history.add({type:e.type, select:ctime, id:e.id, time:e.time})
      }
      else if(e.type == "shift"){
        that._history.add({type:'shift', select:ctime, id:e.id, amt:e.amt})
      }
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
  this.bind_hint = function(elem,c){
    var that = this;
    if(typeof(c) != "function")
      cbk = function(){return c;};
    else
      cbk = c;

    elem.mouseleave(function(){
        var hint = HINTS["default"];
        that._hint.set(hint.title,hint.desc);
    })
    .mouseenter((function(callback){ 
      return function(){
        var key = callback();
        var hint = HINTS[key];
        that._hint.set(hint.name,hint.desc);
      }
    })(cbk));
  }
  this.undo = function(){
    this._history.undo();
  }
  this.redo = function(){
    this._history.redo();
  }
  this.select = function(time, dir){
    if(dir == undefined && time != undefined){
      dir = time; 
    }
    if(isValue(time)){ //update selection
      if(dir == "prev") this.video_bar().model.prev();
      else if(dir == "next") this.video_bar().model.next();
      else if(dir == "goto"){
        time = Math.max(0,time);
        this.video_bar().model.select(time);
      }
      this._player.play(this.video_bar().model.time(), 'both');
      this.obs.trigger('select');
    }
    return this.video_bar().model.select();;
  }
  this.shift = function(lamt,ramt){
    this.video_bar().shift(lamt,ramt);
  }
  this.remove = function(){
    var e=this.video_bar().remove();
    if(e == null) return;
  }
  this.mark = function(){
    this.video_bar().mark();
  }
  this.pause = function(){
    this.video_player().pause();
  }
  this.play = function(s,e){
    if(s != undefined && e != undefined){
      this.video_player().segment(s,e);
    }
    this.video_player().play();
  }
  this.selections = function(){
    return this.video_bar().model.get_selections();
  }
  this.trigger = function(e,o){
    return this.obs.trigger(e,o);
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

var HintManager = function(id){
  this.init = function(){
    this._hinter = $("#"+id);
  }
  this.set = function(title,description){
    if(title != null && title != "")
      this._hinter.html(title+":");
    else
      this._hinter.html("");

    this._hinter.html(description);
  }
  this.init();
}

var SelectionPlayer = function(state, side){
  this.init = function(){
    this.state = state;
    //this.sfx = new AudioFile('media/click.mp3');
    this.timer = null;
    this.eps = 1;
    if(side == undefined) this.side = "both";
    else this.side = side;
  }
  this.pause = function(){
    this.state.pause();
  }
  this.play = function(time){
    var sel = this.state.select();
    if(sel == null) return;
    var s = time;
    var e = sel.end;
    if(time == undefined) s = sel.start;
    if(this.side == "left"){
      e = s+Math.min(e-s,this.eps);
    }
    else if(this.side == "right"){
      s = e-Math.min(e-s,this.eps);
    }
    this.state.play(s,e);
  

  }
  this.init();
}

// mark a pause with this button
var MarkButton = function(button_name, state){
  this._init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.state.bind_hint(this.view, function(){if(that.started) return 'break'; else return 'start'});
    this.playing = false;
    this.init();

    this.view.prop('disabled', true);
    this.state.listen('ready', function(){
      that.view.prop('disabled',false);
    })
    this.state.listen('playing', function(){
      that.playing = true;
    })
    this.state.listen('paused', function(){
      that.playing = false;
      that.init();
    })

    this.started = false;
  }
  this.init = function(){
    var that = this;
    this.view
      .data("button-title","Start")
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});

    that.view.unbind('click');
    this.view.click(function(){
      that.start();
    })
    this.started = false;
  }
  this.start = function(){
    var that = this;
    this.started = true;
    this.view.data("button-title","Break").trigger('changeData');
    this.state.play();
    this.is_down = false;
    this.view.unbind('click')
      .pulse('destroy');
    this.view.click(function(){
        if(that.playing) that.state.mark();
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
    var that = this;

    this.state.listen('playing',function(){that.view.removeClass('disabled')});
    this.state.bind_hint(this.view, function(){if(is_undo) return 'undo'; else return 'redo'});
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      if(is_undo){
        that.state.undo();
      }
      else{
        that.state.redo();
      }
    })
  }
  this.init();
}

var NavigateButton = function(button_name, state, type){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;

    this.state.listen('playing',function(){that.view.removeClass('disabled')});

    this.state.bind_hint(this.view, function(){return type});

    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      var tmp = that.state.select(type);
    })
  }
  
  this.init();
}

var ReplayButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.player = new SelectionPlayer(state);

    this.state.bind_hint(this.view, "replay");
    this.state.listen('playing',function(){that.view.removeClass('disabled')});

    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      that.player.play();
    })
  }

  this.init();
}
var DeleteButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.player = new SelectionPlayer(state);

    this.state.bind_hint(this.view, "delete");
    this.state.listen('playing',function(){that.view.removeClass('disabled')});

    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      that.state.remove();
      that.player.play();
    })
  }

  this.init();
}
var ShiftButton = function(button_name, state, type, amt){
  this.init =function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.player = new SelectionPlayer(state,'right');
    this.type = type;
    this.state.listen('playing',function(){that.view.removeClass('disabled')});
    this.state.bind_hint(this.view, function(){return that.type;});

    this.amount = amt;
    
    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      var amt = that.amount;
      if(that.type == 'lshift') amt *= -1;
      that.player.pause();
      that.state.shift(0,amt);
      if(that.state.video_bar().model.select().subtype != "continue")
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
      that.state.trigger('state-change',{state:'load'});
    }, "vp-load");

    this.video.listen('ready', function(e){
      that.state.trigger('state-change',{state:'ready'});
    }, "vp-ready");

    this.video.listen('play', function(e){
      //e.obj.rate(0.75);
      that.state.trigger('state-change',{state:'playing'});
    }, 'vp-play');

    this.video.listen('done', function(e){
      //e.obj.rate(0.75);
      that.state.trigger('state-change',{state:'ended'});
    }, 'vp-end');
    
    this.video.listen('update', function(){
      that.state.trigger('state-change',{state:'tick'});
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
    this.state.listen('ready', function(){
      that._update_duration();
    })
    this.state.listen('playing', function(){
      that._update_duration();
      that.root.show();
    })
    this.state.listen('tick', function(){
      that._update_time();
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
      this.model.add(t);
      this.state.video_player().segment(t,this.model.duration());
      this.state.video_player().play();
  }
  this._init();
}

var RedirectButton = function(id,to,state){
  var that = this;
  this.resolver = new Navigator();
  this.state = state;
  this.dest = to;
  this.src = "segment";


  this.root = $("#"+id).click(function(){
      that.redirect();
  });

  this.redirect = function(){
    var data = {};
    data.data = this.export();
    var purl = this.resolver.portal(this.src,this.dest, data);
    this.resolver.redirect(purl);
  }

  this.export = function(d){
    var data = {};
    var segdata = this.state.video_bar().model.export();
    data.data = segdata;
    data.url = this.state.video_player().get_model().get_url();
    return data;
  }
  
}

var DonePrompt = function(state,other_settings,done_button, preview_button){
  var that = this;
  this.done = $("#"+done_button);
  this.preview = $("#"+preview_button);
  this.compl_settings = $("#"+other_settings);
  this.view = {};
  this.view.root = $("<div/>")
    .addClass('overlay')
    .hide();

  this.view.prompt = $("<div/>")
  .css('text-align','center')
  .html(
    "The video has finished! What do you want to do next?"
  )
  this.view.edit = $("<div/>").addClass('button')
    .css('display','block')
    .html('Continue Editing the Segments')
    .click(function(){
      that.view.root.fadeOut();
      that.compl_settings.fadeIn();
    });

  this.view.done = $("<div/>").addClass('button')
    .css('display','block')
    .html('I\'m Done')
    .click(function(){
      that.view.root.fadeOut();
      that.compl_settings.fadeIn();
      that.done.click();
    });

  this.view.preview = $("<div/>").addClass('button')
    .css('display','block')
    .html('Preview the Video with Segments')
    .click(function(){
      that.view.root.fadeOut();
      that.compl_settings.fadeIn();
      that.preview.click();
    });

  this.view.root.append(this.view.prompt,this.view.edit, this.view.done, this.view.preview);
  $("body").append(this.view.root);

  this.show = function(){
    this.view.root.fadeIn();
  }
}

var SegmentController = function(){
  this.init = function(){
    var that = this;
    this.prog = new ProgramState("player1", "controls", "hint");
    this.resolver = new Navigator();
    this.cookies = new UserCookie();
    

    this.prog.listen('ended', function(){
      that.done_prompt.show();
    });

    this.buttons = {};
    this.buttons.mark = new MarkButton("break", this.prog);
    this.buttons.replay = new ReplayButton("replay", this.prog);
    this.buttons.next = new NavigateButton("next", this.prog,'next');
    this.buttons.prev = new NavigateButton("prev", this.prog,'prev');
    this.buttons.remove = new DeleteButton("delete", this.prog);
    var amt = 0.20;
    this.buttons.ensl = new ShiftButton("en_sl", this.prog, "lshift",amt);
    this.buttons.ensr = new ShiftButton("en_sr", this.prog,"rshift",amt);
    this.buttons.undo = new HistoryButton("undo",this.prog, true);
    this.buttons.redo = new HistoryButton("redo",this.prog, false);

    this.buttons.done = new RedirectButton('done',"scribe",this.prog);
    this.buttons.preview = new RedirectButton('preview','preview',this.prog);
    this.buttons.demo = new RedirectButton('demo','demo',this.prog);

    this.done_prompt = new DonePrompt(this.prog,'completed-controls',"done","preview");

    //load url
    var args = this.cookies.cache();
    console.log(args);

    if(isValue(args.data) && args.data.data.length > 0){
      var url = args.data.url;
      console.log(args.data.data);
      this.prog.video_bar().model.from_json(args.data.data);
      that.load(url);
      that.prog.video_player().play();
    }

    $( window ).bind("beforeunload",function() {
      var data = {};
      data.tmp = that.prog.video_bar().model.to_json();
      data.data = that.prog.video_bar().model.export()
      data.url = that.prog.video_player().get_model().get_url();
      that.cookies.cache('segment', data);
    });

    $("#title").html(INSTRUCTIONS);

    this.status = new Status("progress","status",1);
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

});