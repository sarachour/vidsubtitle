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


$("document").ready(function() {

  var data = {};
  ctrl = new SegmentController();

  $("#load", $("#dev")).click(function(){
    var data = $("#output", $("#dev")).val();
    ctrl.from_json(JSON.parse(data));
    $(".scribe.entry").css("visibility", "visible");
    $(".scribe.button.hotkey").css("visibility", "visible");
    document.getElementById('entry').select();
  });

  $("#output",$("#dev")).val('{"data":[{"start":2.972153,"end":3.006983,"length":0.03482999999999992,"id":1,"type":"break"},{"start":4.50467,"end":9.937368,"length":5.932697999999999,"id":9,"type":"silence"},{"start":11.771744,"end":11.853014,"length":0.08126999999999995,"id":10,"type":"break"},{"start":16.277185,"end":16.358455,"length":0.08126999999999995,"id":11,"type":"break"},{"start":16.477639,"end":16.558909,"length":0.08126999999999995,"id":5,"type":"break"},{"start":20.483081,"end":20.529521,"length":0.04644000000000048,"id":13,"type":"break"},{"start":24.906482,"end":24.952922,"length":0.04644000000000048,"id":15,"type":"break"},{"start":31.710699,"end":31.745529,"length":0.03482999999999947,"id":16,"type":"break"},{"start":35.496323,"end":35.577593,"length":0.0812700000000035,"id":17,"type":"break"},{"start":39.293556,"end":39.339996,"length":0.04643999999999693,"id":18,"type":"break"},{"start":41.464621,"end":41.511061,"length":0.04643999999999693,"id":19,"type":"break"},{"start":44.170517,"end":44.251787,"length":0.0812700000000035,"id":20,"type":"break"},{"start":48.17673,"end":48.257999,"length":0.08126899999999893,"id":21,"type":"break"},{"start":53.182172,"end":53.228612,"length":0.04643999999999693,"id":22,"type":"break"},{"start":62.021241,"end":62.067681,"length":0.04643999999999693,"id":24,"type":"break"},{"start":63.484868,"end":63.531308,"length":0.046440000000004034,"id":25,"type":"break"},{"start":65.981784,"end":66.028224,"length":0.04643999999998982,"id":26,"type":"break"},{"start":67.816932,"end":67.863372,"length":0.046440000000004034,"id":27,"type":"break"},{"start":73.450854,"end":73.497294,"length":0.04643999999998982,"id":28,"type":"break"},{"start":79.418382,"end":79.464822,"length":0.046440000000004034,"id":32,"type":"break"},{"start":84.840241,"end":84.909901,"length":0.06965999999999894,"id":30,"type":"break"},{"start":87.430037,"end":87.464866,"length":0.034829000000002,"id":31,"type":"break"},{"start":89.891351,"end":89.926181,"length":0.03482999999999947,"id":33,"type":"break"},{"start":92.597246,"end":92.643686,"length":0.046440000000004034,"id":34,"type":"break"},{"start":99.552393,"end":99.564003,"length":0.011610000000004561,"id":35,"type":"break"},{"start":104.940193,"end":105.021463,"length":0.0812700000000035,"id":36,"type":"break"},{"start":105.021463,"end":112.485884,"length":4.2144210000000015,"id":37,"type":"silence"},{"start":105.032302,"end":105.032302,"length":0,"id":39,"type":"break"},{"start":105.032302,"end":105.032302,"length":0,"id":41,"type":"break"},{"start":113.867494,"end":113.948764,"length":0.0812700000000035,"id":40,"type":"break"}],"url":"media/movie1.mp4"}')
  $("#load", $("#dev")).click();
  var enteredText = [];
  var textIndex = 0;

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

   updateText();

   document.getElementById("prev").click = function(e) {
      if (textIndex == (enteredText.length - 1)) {
         enteredText.push($('#entry').val());
         textIndex--;
      } else if (textIndex > 0) {
         enteredText[textIndex] = $('#entry').val();
         textIndex--;
      }
      updateText();
   }

   document.getElementById("next").click = function(e) {
      if (textIndex == enteredText.length) {
         enteredText.push($('#entry').val());
      } else {
         enteredText[textIndex] = $('#entry').val();
      }
      textIndex++;
      updateText();
   }

});