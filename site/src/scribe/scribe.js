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
  //load and get data
  this.load = function(u){
    this.prog.video_player().load(u);
  }
  this.export = function(d){
    var data = {};
    var segdata = this.prog.video_bar().model.export();
    data.data = segdata;
    data.url = this.prog.video_player().get_model().get_url();
    return data;
  }
  this.init();
}


var ctrl;


$("document").ready(function() {

  var data = {};
  ctrl = new SegmentController();

  
  //load request

  //SARA: load url and get data url
  var resolver = new Navigator();
  var args = resolver.get();


  var test_data = null;

  if(isValue(args.data)){
    var san_data = args.data.substring(1,args.data.length-1).replace(/\\"/g, "\"");
    var data = JSON.parse(san_data);
    console.log(san_data);

    $("#output", $("#dev")).val(san_data);
    var test_data = [san_data];
    var test_index = 0;
  }
  if(test_data == null){
    var test_data = ['{"data":[{"start":3.939453,"end":4.00911,"length":0.06965699999999986,"id":0,"type":"break"},{"start":17.798030000000008,"end":17.867687000000007,"length":0.06965699999999941,"id":1,"type":"break"},{"start":19.752259,"end":19.821916,"length":0.06965700000000297,"id":3,"type":"break"},{"start":27.12918,"end":27.198837000000005,"length":0.06965700000000297,"id":4,"type":"break"},{"start":29.224944,"end":29.271382,"length":0.046437999999998425,"id":2,"type":"break"},{"start":35.134845999999975,"end":35.204502999999974,"length":0.06965699999999941,"id":5,"type":"break"},{"start":36.764008,"end":36.856884,"length":0.09287600000000396,"id":6,"type":"break"},{"start":45.26954999999998,"end":45.33920699999998,"length":0.06965699999999941,"id":7,"type":"break"},{"start":46.94515,"end":47.014807,"length":0.06965699999999941,"id":8,"type":"break"},{"start":53.327208999999975,"end":53.396865999999974,"length":0.06965699999999941,"id":9,"type":"break"},{"start":55.118904,"end":55.188561,"length":0.06965699999999941,"id":10,"type":"break"},{"start":59.028667,"end":59.075105,"length":0.04643800000000198,"id":11,"type":"break"},{"start":61.141596,"end":61.188033999999995,"length":0.04643799999999487,"id":12,"type":"break"},{"start":63.834999999999994,"end":63.881438,"length":0.04643800000000908,"id":13,"type":"break"},{"start":66.09621399999999,"end":66.165871,"length":0.06965700000000652,"id":14,"type":"break"},{"start":69.164954,"end":69.234611,"length":0.06965700000000652,"id":15,"type":"break"},{"start":71.69054799999999,"end":71.73698599999999,"length":0.04643799999999487,"id":16,"type":"break"},{"start":75.935931,"end":76.005588,"length":0.06965700000000652,"id":17,"type":"break"},{"start":79.167205,"end":79.213643,"length":0.04643800000000908,"id":18,"type":"break"},{"start":84.90718599999998,"end":84.97684299999999,"length":0.06965700000000652,"id":19,"type":"break"}],"url":"media/movie2.mp4"}', '{"data":[{"start":3.126788,"end":3.196445,"length":0.0696570000000003,"id":0,"type":"break"},{"start":4.659242,"end":4.728899,"length":0.0696570000000003,"id":1,"type":"break"},{"start":9.305292000000003,"end":9.374949000000004,"length":0.06965700000000119,"id":3,"type":"break"},{"start":11.700682,"end":11.770339,"length":0.06965699999999941,"id":4,"type":"break"},{"start":16.483796,"end":16.553453,"length":0.06965699999999941,"id":5,"type":"break"},{"start":20.302265999999996,"end":20.371923,"length":0.06965700000000297,"id":6,"type":"break"},{"start":25.080242,"end":25.149898999999998,"length":0.06965699999999941,"id":7,"type":"break"},{"start":31.276158999999996,"end":31.369034999999997,"length":0.0928760000000004,"id":8,"type":"break"},{"start":35.26205,"end":35.354926,"length":0.09287599999999685,"id":9,"type":"break"},{"start":39.000309,"end":39.046747,"length":0.04643800000000198,"id":10,"type":"break"},{"start":41.391866,"end":41.461523,"length":0.06965699999999941,"id":11,"type":"break"},{"start":44.201365,"end":44.247803,"length":0.04643799999999487,"id":12,"type":"break"},{"start":48.125376,"end":48.195033,"length":0.06965699999999941,"id":13,"type":"break"},{"start":53.26732900000001,"end":53.33698600000001,"length":0.06965699999999941,"id":14,"type":"break"},{"start":61.978287,"end":62.047944,"length":0.06965699999999941,"id":15,"type":"break"},{"start":65.975788,"end":66.045445,"length":0.06965700000000652,"id":16,"type":"break"},{"start":68.344126,"end":68.390564,"length":0.04643799999999487,"id":17,"type":"break"},{"start":73.18423200000001,"end":73.25388900000002,"length":0.06965700000000652,"id":18,"type":"break"},{"start":79.503633,"end":79.57329,"length":0.06965700000000652,"id":19,"type":"break"},{"start":85.122631,"end":85.192288,"length":0.06965700000000652,"id":20,"type":"break"},{"start":89.882526,"end":89.952183,"length":0.06965700000000652,"id":21,"type":"break"},{"start":93.086748,"end":93.156405,"length":0.06965700000000652,"id":22,"type":"break"},{"start":99.239783,"end":99.30944,"length":0.06965699999999231,"id":23,"type":"break"},{"start":102.73740899999997,"end":102.80706599999996,"length":0.06965699999999231,"id":24,"type":"break"},{"start":105.411426,"end":105.481083,"length":0.06965699999999231,"id":25,"type":"break"},{"start":111.81670399999997,"end":111.88636099999997,"length":0.06965699999999231,"id":26,"type":"break"},{"start":114.699692,"end":114.74613,"length":0.04643799999999487,"id":27,"type":"break"},{"start":131.9314950000001,"end":132.0011520000001,"length":0.06965700000000652,"id":28,"type":"break"}],"url":"media/movie1.mp4"}'];
    var test_index = Math.floor(Math.random() * test_data.length);
  }
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


  $("#save",$("#dev")).click(function(){
    str = JSON.stringify({"captions":enteredText, "video":JSON.parse(test_data[test_index])['url']});
    $("#output", $("#dev")).val(str);
  });
  $("#load", $("#dev")).click(function(){
                data = $("#output", $("#dev")).val();
                ctrl.from_json(JSON.parse(data));
                $(".scribe.entry").css("visibility", "visible");
                $(".scribe.button.hotkey").css("visibility", "visible");
                document.getElementById('entry').select();
                });
  //do not use test data
  $("#output", $("#dev")).val(test_data[test_index]);
  $("#load", $("#dev")).click();
  var seg_count = JSON.parse(test_data[test_index])['data'].length;
  
  var status = new Status("Status", "Progress", seg_count+1, "Segment");
  var enteredText = [];
  for (i = 0; i <= seg_count; i++) enteredText.push('');
  var textIndex = 0;

  var updateText = function() {
      if (textIndex == 0) {
        $(".scribe.prev").css("background-color", "#EEEEEE");
        $('#prevText').css("background-color", "#EEEEEE");
        $("#prevText").text('');
        $("#nextText").text(enteredText[textIndex + 1]);
      } else if (textIndex == seg_count) {
        $(".scribe.next").css("background-color", "#EEEEEE");
        $('#nextText').css("background-color", "#EEEEEE");
         $("#nextText").text('');
      } else {
        $(".scribe.prev").css("background-color", "#D4876A");
        $("#prevText").css("background-color", "white");
        $(".scribe.next").css("background-color", "#64B058");
        $("#nextText").css("background-color", "white");
        $("#prevText").text(enteredText[textIndex - 1]);
        $("#nextText").text(enteredText[textIndex + 1]);
      }
      $("#entry").val(enteredText[textIndex]);
   }

   updateText();

   document.getElementById("prev").click = function(e) {
      if (textIndex > 0) {
         enteredText[textIndex] = $('#entry').val();
         textIndex--;
         status.prev();
      }
      updateText();
   }

   document.getElementById("next").click = function(e) {
      if (textIndex < seg_count) {
        enteredText[textIndex] = $('#entry').val();
        textIndex++;
        status.next();
      }
      updateText();
   }

});