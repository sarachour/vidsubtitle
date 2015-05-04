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
    this._model = new ScribeModel();
    this._model.from_json(seg_data);

    this._video_player = new VideoPane(vp_name,this);
    this._video_bar = new VideoBar(vb_name,this);
    this._player = new SelectionPlayer(this);

  
    this.video_bar().model.listen('select', function(e){
      that._player.play(e.time);
      that.obs.trigger("update");
    })
    this.obs.listen('state-change', function(e){
      that.state = e.state;
      that.obs.trigger(that.state);
    }, "state_change_listener")
  }
  this.listen = function(name,cbk){
    this.obs.listen(name, cbk);
  }
  this.play = function(){
    this.obs.trigger('play')
    this._video_player.play();
  }
  this.segment = function(){
    this._player.play();
  }
  this.caption = function(text){
    return this.video_bar().model.caption(text);
  }
  this.selected = function(){
    return this.video_bar().model.selected();
  }
  this.next = function(){
    return this.video_bar().model.next();
  }
  this.prev = function(){
    return this.video_bar().model.prev();
  }
  this.peek = function(offset){
    return this.video_bar().model.peek(offset);
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
    this.timer = null;
  }
  this.play = function(){
    var sel = this.state.selected();
    var s = sel.start;
    var e = sel.end;

    if(this.state.video_bar().model.time() == undefined) s = sel.start;
    this.state.video_player().segment(s,e);
    this.state.video_player().play();
  }
  this.init();
}

// mark a pause with this button

var DisplayField = function(field_name, relIndex, state){
  this.init = function(){
    var that = this;
    this.relIndex = relIndex;
    this.view = $("#"+field_name);
    this.state = state;
    this.state.statemgr().listen('caption-change', function(){
      console.log(this.state.peek);
      var entry = this.state.peek(this.relIndex);
      this.view.html(entry.caption); 
    });
  }

  this.init(field_name, relIndex, state);
}

var EntryField = function(entry_name,state){
  this.init = function(){
    var that = this;
    this.view = $("#"+entry_name);
    this.state = state;
    this.state.statemgr().listen('caption-change', function(){
      that.update_text();
    });
    this.view.on('input propertychange paste', function(){
      console.log("set",$(this).val())
      that.state.caption($(this).val());
    })
  }

  this.update_text = function(){
    var entry = this.state.peek(0);
    if(entry != null)
      this.view.val(entry.caption);
  }
  this.get_text = function(){
    return this.view.value;
  }

  this.init();
}


var NavigateButton = function(button_name, state, type){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name).addClass('disabled');
    this.state = state;
    this.state.listen('play',function(){that.view.removeClass('disabled')});

    this.view.click(function(){
      if(type == "next"){
        that.state.next();
      }
      else{
        that.state.prev();
      }
      that.state._player.play(that.state.selected().start);
      that.state.statemgr().trigger('state-change',{state:'caption-change'});
    })
  }
  
  this.init();
}

var MainButton = function(button_name, state){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.playing = false;

    this.view
      .data("button-title","Start")
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000})
      .click(function(){
        that.start();
      })
    this.view.prop('disabled', true);
    this.state.statemgr().listen('ready', function(){
      that.view.prop('disabled',false);
    });

    this.started = false;
  }
  this.start = function(){
    var that = this;

    var sel = this.state.selected();
    this.state.play();

    this.started = true;
    this.is_down = false;
    this.view.unbind('click')
      .pulse('destroy');

    this.view.click(function(){
      var sel = that.state.selected();
      that.state._player.play(sel.start);
      //state.prog._model.add_caption(state.entry.get_text());
      //state.prog._model.curIndex++;
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
    this.state.statemgr().listen('scrub', function(e){
      that.video.time(that.state.video_bar().model.time());
    })
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
    this.state.statemgr().listen('tick', function(){
      that._update_time();
    })
    this.model.listen('select', function(){
      that.state.statemgr().trigger('state-change', {'state':'scrub'})
    })
  }
  this._update_time = function(){
    var dur = this.state.video_player().get_model().time();
    //console.log(dur + ' -- ' + this.state._model.selected().end);
    if (dur >= this.state._model.selected().end) {
      this.model.time(this.state._model.selected().start);
      state._video_player.pause();
    }else{
      this.model.time(dur);
    }
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

var DonePrompt = function(state,other_settings,done_button,preview_button){
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
    var data = args.data;
    var seg_data = data['data'];

    this.prog = new ProgramState("player", "controls", seg_data);
    that.load(data['url']);

    this.prog.listen('ended', function(){
      that.done_prompt.show();
    });

    this.buttons = {};
    this.buttons.replay = new MainButton("mainButton", this.prog);
    this.buttons.next = new NavigateButton("nextButton", this.prog, 'next');
    this.buttons.prev = new NavigateButton("prevButton", this.prog, 'prev');

    //handline done
    this.buttons.done = new RedirectButton('done',"scribe",this.prog);
    this.buttons.preview = new RedirectButton('preview','preview',this.prog);
    this.done_prompt = new DonePrompt(this.prog,'completed-controls',"done","preview");

    this.fields = {};
    this.fields.prevText2 = new DisplayField('prevText2', -2,this.prog);
    this.fields.prevText = new DisplayField('prevText', -1,this.prog);
    this.fields.nextText = new DisplayField('nextText', 1,this.prog);
    this.fields.nextText2 = new DisplayField('nextText2', 2,this.prog);

    this.entry = new EntryField('entryArea',this.prog);

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