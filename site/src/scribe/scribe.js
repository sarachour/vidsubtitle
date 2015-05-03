var video;

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

var ProgramState = function(vp_name, vb_name, seg_data){
  this.init = function(){
    var that = this;
    this.state = "";
    this.obs = new Observer();
    this._model = new ScribeModel(seg_data);
    this._video_player = new VideoPane(vp_name,this);
    this._video_bar = new VideoBar(vb_name,this);
    this._player = new SelectionPlayer(this);

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
  /*
  this.select = function(time){
    var filter = time;
    //this.video_bar().model.select_nearby(filter,direction);
    this.obs.trigger('select');
    return this.video_bar().model.selectTime();;
  }
  */
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
  this.video_player = function(){
    return this._video_player;
  }
  this.video_bar = function(){
    return this._video_bar;
  }
  this.init();
}

var SelectionPlayer = function(state){
  this.init = function(){
    this.state = state;
    this.sfx = new AudioFile('media/click.mp3');
    this.timer = null;
  }
  this.play = function(time){
    var sel = this.state._model.get_enclosing_selection(time);
    var s = time;
    var e = sel.end;
    console.log(s,e);
    if(time == undefined) s = sel.start;
    this.state.video_player().segment(s,e);
    this.state.video_player().play();
  }
  this.init();
}

// mark a pause with this button

var DisplayField = function(field_name, state, relIndex){
  this.init = function(){
    var that = this;
    this.view = $("#"+field_name);
    this.state = state;

    this.state.statemgr().listen('update', function(){
      that._update_text();
    });
  }

  this._update_text = function(relIndex){
    this.view.innerHTML("<h4>" + this.model.get_caption(relIndex) + "<h4>");
  }
}

var EntryField = function(entry_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+entry_name);
    this.state = state;

    this.state.statemgr().listen('update', function(){
      that._update_text();
    });
  }

  this._update_text = function(relIndex){
    this.view.innerHTML("<h4>" + this.model.get_caption(relIndex) + "<h4>");
  }
}

var NavigateButton = function(button_name, state, is_rev){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.state.listen('play',function(){that.view.removeClass('disabled')});

    this.view.click(function(){
      src_pulse($("img",$(this)), 200);
      var sels = that.state.selections();
      var tmp = that.state.select(function(e){
        return e.type == "silence" || e.type == "segment";
      }, is_rev);
    })
  }
  
  this.init();
}

var ReplayButton = function(button_name, state){
  this._init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.playing = false;
    this.init();

    this.view
      .data("button-title","Start")
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});

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

    this.started = false;
  }
  this.init = function(){
    var that = this;
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
      src_pulse($("img",$(this)), 200);
      that.player.play();
    })
  }
  this._init();
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

var VideoBar = function(bar_name, state){
  this._init = function(){
    var that = this;
    this.root = $("#"+bar_name);
    this.model = state._model;
    this.view = new ScribeBar(bar_name, this.model);
    this.state = state;
    this.start_time = null;
    this.state.statemgr().listen('ready', function(){
      that._update_duration();
    })
    this.state.statemgr().listen('play', function(){
      that._update_duration();
      that.root.show();
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
  this._init();
}

var RedirectButton = function(id,to,state){
  var that = this;
  this.resolver = new Navigator();
  this.state = state;
  this.dest = to;
  this.src = "segment;";


  this.root = $("#"+id).click(function(){
    console.log("ttt");
      that.redirect();
  });

  this.redirect = function(){
    var data = {};
    data.go = this.dest;
    data.from = this.src;
    data.data = this.export();
    var purl = this.resolver.portal(this.src,data);
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

/*
  this.view.preview = $("<div/>").addClass('button')
    .css('display','block')
    .html('Preview the Video with Captions')
    .click(function(){
      that.view.root.fadeOut();
      that.compl_settings.fadeIn();
      that.preview.click();
    });
*/

  this.view.root.append(this.view.prompt,this.view.edit, this.view.done, this.view.preview);
  $("body").append(this.view.root);

  this.show = function(){
    this.view.root.fadeIn();
  }
}

var SegmentController = function(){
  this.init = function(){
    var that = this;
    
    this.queryResolver = new Navigator();
    var args = this.queryResolver.get();

    var san_data = args.data.substring(1,args.data.length-1).replace(/\\"/g, "\"");
    var data = JSON.parse(san_data);
    var seg_data = data['data'];

    this.prog = new ProgramState("player", "controls", seg_data);
    that.load(data['url']);

    this.prog.listen('ended', function(){
      that.done_prompt.show();
    });

    this.buttons = {};
    this.buttons.replay = new ReplayButton("replayButton", this.prog);
    this.buttons.next = new NavigateButton("nextButton", this.prog, false);
    this.buttons.prev = new NavigateButton("prevButton", this.prog, true);
    this.buttons.done = new RedirectButton('done',"scribe",this.prog);
    this.buttons.done_to_edit = new RedirectButton('done_to_edit',"edit",this.prog);
    this.buttons.preview = new RedirectButton('preview','preview',this.prog);
    this.done_prompt = new DonePrompt(this.prog,'completed-controls',"done","preview");

    this.fields = {};
    this.fields.prev2 = new DisplayField(prev2Text);
    this.fields.prev = new DisplayField(prevText);
    this.fields.next = new DisplayField(nextText);
    this.fields.next2 = new DisplayField(next2Text);

    this.entry = new EntryField();

    this.status = new Status("progress", "status", 1);
  }
  
  this.load = function(v){
    this.prog.video_player().load(v);
  }

  this.init();
}


var ctrl;

$("document").ready(function() {

  var data = {};
  ctrl = new SegmentController();

/* 
  //SARA:
  $("#next_step").click(function(){
    console.log("test");
    var data = ctrl.export();
    console.log(data.data.length, enteredText.length);
    for(var i=0; i < data.data.length; i++){
      data.data[i].caption['speaker'] = enteredText[i];
    }
    console.log(data);
    var url = resolver.portal('edit',data);
    console.log(url);
    resolver.redirect(url);
  });
*/
  
});