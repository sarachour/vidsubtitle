var seg = {
            "data":[
               {"start":38.379466,"end":38.51878,"length":0.13931399999999883,"id":12,"type":"break"},
               {"start":45.600575,"end":45.71667,"length":0.11609500000000139,"id":14,"type":"break"},
               {"start":34.896616,"end":35.03593,"length":0.13931399999999883,"id":10,"type":"break"},
               {"start":20.64015,"end":22.892393,"length":2.252243,"id":7,"type":"silence"},
               {"start":35.569967,"end":36.289756,"length":0.7197889999999987,"id":11,"type":"silence"},
               {"start":31.460204,"end":31.576299,"length":0.11609499999999784,"id":9,"type":"break"},
               {"start":26.073396,"end":28.093449,"length":2.0200530000000008,"id":8,"type":"silence"},
               {"start":42.23382,"end":42.373134,"length":0.13931399999999883,"id":13,"type":"break"},
               {"start":16.274978,"end":16.391073,"length":0.11609499999999784,"id":6,"type":"break"},
               {"start":14.208487,"end":14.324582,"length":0.11609499999999962,"id":5,"type":"break"},
               {"start":11.259674,"end":11.375769,"length":0.11609499999999962,"id":4,"type":"break"},
               {"start":9.425373,"end":9.541468,"length":0.11609499999999962,"id":3,"type":"break"},
               {"start":7.63751,"end":7.776824,"length":0.1393140000000006,"id":2,"type":"break"},
               {"start":5.338829,"end":5.431705,"length":0.0928760000000004,"id":1,"type":"break"},
               {"start":4.990544,"end":5.129858,"length":0.13931399999999972,"id":0,"type":"break"}
            ],
            "url":"media/vid1.mp4"
         };

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
    this._history = new History();
    this._player = new SelectionPlayer(this);
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
    this.view.data("button-title","Start");
    this.title = "Start Video Segmentation";
    that.view.unbind('click');
    this.view.click(function(){
      that.start();
    })
  }
  this.start = function(){
    var that = this;
    this.view.data("button-title","Break").trigger('changeData');
    this.title = "Break Button";
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

var NavigateButton = function(button_name, state, is_rev){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.state = state;
    this.view.click(function(){
      var sels = that.state.selections();
      var tmp = that.state.select(function(e){
        return e.type == "silence" || e.type == "segment";
      }, is_rev);
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
    return this.model.remove();
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
    this.buttons.replay = new ReplayButton("replay", this.prog);
    this.buttons.next = new NavigateButton("next", this.prog,false);
    this.buttons.prev = new NavigateButton("prev", this.prog,true);

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
  this.init();
}


var ctrl;

var highlightTextArea = function (){
    document.getElementById('entry').select();
}


$("document").ready(function() {
  var data = {};
  ctrl = new SegmentController();
  $("#load", $("#dev")).click( function(){
    var data = $("#output", $("#dev")).val();
    ctrl.from_json(JSON.parse(data));
  });

  var enteredText = [];
  var textIndex = -1;

  var updateText = function() {
      if (textIndex > 0) {
         $(".scribe.prev").css("background-color", "#D4876A");
         $("#prevText").css("background-color", "white");
         $("#prevText").text(enteredText[textIndex - 1]);
      } else {
         $(".scribe.prev").css("background-color", "#EEEEEE");
         $('#prevText').css("background-color", "#EEEEEE");
         $("#prevText").text('');
      }
      $("#entry").val(enteredText[textIndex]);
      if (textIndex == (enteredText.length - 1)) {
         $("nextText").text('');
      } else {
         $("#nextText").text(enteredText[textIndex + 1]);
      }
   }

   highlightTextArea();
   updateText();

   document.getElementById("prev").onclick = function(e) {
      if (textIndex == (enteredText.length - 1)) {
         enteredText.push($('#entry').val());
         textIndex--;
         updateText();
      } else if (textIndex > 0) {
         enteredText[textIndex] = $('#entry').val();
         textIndex--;
         updateText();
      }
   }

   document.getElementById("next").onclick = function(e) {
      if (textIndex == enteredText.length) {
         enteredText.push($('#entry').val());
         updateText();
      } else if (textIndex == -1) {
         $(".scribe.entry").css("visibility", "visible");
         $("#prev").css("visibility", "visible");
         $("#replay").css("visibility", "visible");
         // $("#buttonNext").title = "Next";
      } else {
         enteredText[textIndex] = $('#entry').val();
         updateText();
      }
      textIndex++;
   }

});