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
  this.bind = function(view, c){
    var that = this;
    if(typeof(c) != "function")
      cbk = function(){return c;};
    else
      cbk = c;

    view.mouseleave(function(){
        var hint = HINTS["default"];
        that.set(hint.title,hint.desc);
    })
    .mouseenter((function(callback){ 
      return function(){
        var key = callback();
        var hint = HINTS[key];
        that.set(hint.name,hint.desc);
      }
    })(cbk));
  }
  this.init();
}

// mark this video
var MarkButton = function(button_name, hint){
  this.init = function(){
    var that = this;
    this.hint = hint;
    this.view = $("#"+button_name);
    this.obs = new Observer();

    this.hint.bind(this.view, function(){
      if(that.mode == "speech-start") 
        return "mark-start" 
      else 
        return "mark-end"
    });

    this.view.click(function(){
      that.obs.trigger('mark')
    });
  }
  this.listen = function(name, c){
    this.obs.listen(name, c);
  }
  this.set_mode = function(s){
    this.mode = s;
  }
  this.init();
}

var NavigateButton = function(button_name, type, hint){
  this.init = function(){
    var that = this;
    this.view = $("#"+button_name);
    this.hint = hint;
    this.obs = new Observer();

    this.params = {};
    this.params.eps = 0.25;
    this.params.dir = 1;
    if(type == "backward") 
      this.params.dir = -1;
    this.hint.bind(this.view, type);

    this.view.mousedown(function(e){
      $(this).data('md', new Date())
      that.obs.trigger('move-start', {type:type, eps: that.params.eps*that.params.dir});
      console.log(e);
    })
    this.view.mouseup(function(e){
      var mu = new Date();
      var msec = mu - $(this).data('md');
      that.obs.trigger('move-end', {type:type, eps: that.params.eps*that.params.dir});
      console.log(e);

    });
  }

  this.listen = function(name, c){
    this.obs.listen(name, c);
  }
  
  this.init();
}



var VideoPane = function(video_name){
  this._init = function(){
    var that = this;
    this.video = new YoutubeVideo(video_name);
    this.obs = new Observer;

    //initialize video
    this.video.listen('load', function(evt){
      that.obs.trigger('state-change', {state:'loaded', player:that.video});
    }, "vp-load");

    this.video.listen('ready', function(e){
      that.obs.trigger('state-change', {state:'ready', player:that.video});
    }, "vp-ready");

    this.video.listen('play', function(e){
      that.obs.trigger('state-change', {state:'playing', player:that.video});
      //e.obj.rate(0.75);
    }, 'vp-play');

    this.video.listen('done', function(e){
      that.obs.trigger('state-change', {state:'done', player:that.video});
      //e.obj.rate(0.75);
    }, 'vp-end');
    
    this.video.listen('update', function(){
      that.obs.trigger('update', {player:that.video});

    }, 'vp-update');
  }
  this.get_player = function(){
    return this.video;
  }
  this.listen = function(name, cbk){
    this.obs.listen(name,cbk);
  }
  this._init();
}

var VideoBar  =function(bar_name, model){
  this._init = function(){
    var that = this;
    this.model = model;
    this.root = $("#"+bar_name);
    this.view  =new SegmentBar(bar_name, this.model);

  }
  this._init();
}

var SegmentController = function(){
  this.init = function(){
    var that = this;
    

    this.buttons = {};
    this.model = new SegmentModel();
    this.views = {};
    this.views.player = new VideoPane("player1");
    this.views.vis = new VideoBar("controls", this.model);
    this.views.hint = new HintManager("hint");
    this.buttons.mark = new MarkButton("mark", this.views.hint);
    this.buttons.forward = new NavigateButton("forward",'forward', this.views.hint);
    this.buttons.backward = new NavigateButton("backward",'backward', this.views.hint);
    var amt = 0.20;
    
    this.buttons.done = new RedirectButton('done',"scribe");
    this.buttons.preview = new RedirectButton('preview','preview');
    this.buttons.demo = new RedirectButton('demo','demo');

    this.done_prompt = new DonePrompt('prompt',"done","preview");

    $("#title").html(INSTRUCTIONS);
    this.speech_start_mode();

    this.views.player.listen('state-change', function(e){
      that.model.duration(e.player.duration());
      that.model.time(e.player.time());
      console.log("player set: ", e);
    })
    this.views.player.listen('update', function(e){
      that.model.time(e.player.time());
      console.log("player update");
    })
    this.buttons.mark.listen('mark', function(){
      console.log("break-marked");
    })
    var move = function(eps){
      /*
      var player = that.views.player.get_player();
      var time = player.time();
      var duration = player.duration();
      time = Math.max(0, time+eps);
      player.play();
      player.segment(time-eps,time+eps, function(){
        console.log(seg);
      });
      */

    }
    this.buttons.forward.listen('move-start', function(e){
      that.views.player.get_player().play();
    })
    this.buttons.forward.listen('move-end', function(e){
      that.views.player.get_player().pause();
      move(e.eps);
    })
    this.buttons.backward.listen('move-start', function(e){
      that.views.player.get_player().reverse();
      move(e.eps);
    })
    this.buttons.backward.listen('move-end', function(e){
      that.views.player.get_player().pause();
      move(e.eps);
    })


    this.load('media/movie1.mp4')
  }
  
  this.speech_start_mode = function(){
    $("#prompt").html("Find the part of the video where the speech starts.");
    this.mode = "speech-start";
    this.buttons.mark.set_mode(this.mode);
  }
  this.speech_end_mode = function(){
    $("#prompt").html("Find the part of the video where the speech ends.");
    this.mode = "speech-end";
    this.buttons.mark.set_mode(this.mode);

  }
  this.load = function(v){
    this.views.player.get_player().load(v);
  }
  this.init();
}


var RedirectButton = function(id,to){
  var that = this;
  this.resolver = new Navigator();
  this.dest = to;
  this.src = "segment";


  this.root = $("#"+id).click(function(){
      that.redirect();
  });

  this.redirect = function(){
    var purl = this.resolver.portal(this.src,this.dest, null);
    this.resolver.redirect(purl);
  }

  
}

var DonePrompt = function(prompt_window,done_button, preview_button){
  var that = this;
  this.done = $("#"+done_button);
  this.preview = $("#"+preview_button);
  this.view = {};
  this.view.root = $("#"+prompt_window);

  this.view.edit = $(".prompt.close,.prompt.stay", this.view.root)
    .click(function(){
      that.view.root.fadeOut();
    });

  this.view.done = $(".prompt.continue", this.view.root)
    .click(function(){
      that.view.root.fadeOut();
      that.done.click();
    });

  this.view.preview = $(".prompt.preview", this.view.root)
    .click(function(){
      that.view.root.fadeOut();
      that.preview.click();
    });

  this.show = function(){
    this.view.root.fadeIn();
  }
}

var ctrl;

//video_player, video_bar, break_button, next_button, prev_button, delay_button, earlier_button, delete_button
$("document").ready(function() {
  var data = {};
  ctrl = new SegmentController();

});