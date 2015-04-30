

var DummySegmentationInterface = function(){
   this.init = function(){
      this.url = "media/movie1.mp4";
      this.data = "";
      this.video = new YoutubeVideo("player1",$("#view"));
      this.model = new SegmentModel();
      this.bar = new SegmentBar($("#segmentbar"), this.model);
      this.obs = new Observer();

      var that = this;
      this.video.listen('update',function(){
         that.model.duration(that.video.duration());
         that.model.time(that.video.time());
      })
      this.enabled = {};

      this.video.load(this.url);
   }
   this.listen = function(t,c,n){
      this.obs.listen(t,c,n);
   }
   this.load = function(parent, phase, enabled){
      var that = this;
      var v = $("#view").removeClass('dummy').detach().appendTo('.mock.active');
      //only enable pertinent elements
      for(var key in this.enabled) this.enabled[key] = false;
      for(var i=0; i < enabled.length; i++){
         this.enabled[enabled[i]] = true;
      }

      if(phase == "start"){
         this.video.time(0);
         var is_started = false;
         var handle_break = function(){
            $("#break",v).pulse({'background-color':'#d33434',color:'white'},{pulses:1,duration:200});
            that.model.add_segment(that.video.time());
            obs.trigger('break');
         }
         var handle_start = function(){
            if(is_started){
               handle_break(); return;
            }
            $("#break",v).pulse('destroy').html('Break');
            $("#segmentbar",v).fadeIn();
            that.video.play();
            that.obs.trigger('start');
            is_started = true;
         }
         $("#segmentbar",v).hide();
         $("#break",v).pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000}).click(function(){
            if(that.enabled.start_button){
               that.obs.trigger('start-button');
               handle_start();
            }
         });
         jwerty.key('space', function(){
            if(that.enabled.start_key){
               that.obs.trigger('start-key');
               handle_start();
            }
            return false;
         })
      }
      if(phase == "edit"){

      }
   }
   this.unload = function(){
      var v = $("#view").addClass('dummy').detach().appendTo('body');  
   }
   this.init();
}

var Welcome = function(){
   this.init = function(){
      this.id = "welcome";
   }
   this.load = function(demo){

   }

   this.init();
}

var Start = function(){
   this.init = function(){
      this.id = "start";
   }
   this.load = function(demo){
      var iface = demo.get_iface();
      demo.disable_next();
      iface.load(this.id, "start", ['start_button']);
      iface.listen('start', function(){
         demo.success();
         demo.enable_next();
      },'1');
   }

   this.init();
}

var Hotkey = function(){
   this.init = function(){
      this.id = "hotkeys";
   }
   this.load = function(demo){
      var iface = demo.get_iface();
      demo.disable_next();
      iface.load(this.id, "start", ['start_key']);
      iface.listen('start', function(){
         demo.success();
         demo.enable_next();
      },'1');
   }

   this.init();
}

var Breaking = function(){
   this.init = function(){
      this.id = "breaking";
   }
   this.load = function(demo){

   }

   this.init();
}

var AboutBar = function(){
   this.init = function(){
      this.id = "aboutbar";
   }
   this.load = function(demo){

   }

   this.init();
}


var AboutBar2 = function(){
   this.init = function(){
      this.id = "aboutbar2";
   }
   this.load = function(demo){

   }

   this.init();
}

var AboutBar3 = function(){
   this.init = function(){
      this.id = "aboutbar3";
   }
   this.load = function(demo){

   }

   this.init();
}
var Navigating = function(){
   this.init = function(){
      this.id = "navigating";
   }
   this.load = function(demo){

   }

   this.init();
}

var AddBreak = function(){
   this.init = function(){
      this.id = "addbreak";
   }
   this.load = function(demo){

   }

   this.init();
}

var RemoveBreak = function(){
   this.init = function(){
      this.id = "removebreak";
   }
   this.load = function(demo){

   }

   this.init();
}

var ShortenSeg = function(){
   this.init = function(){
      this.id = "shortenseg";
   }
   this.load = function(demo){

   }

   this.init();
}
var LengthenSeg = function(){
   this.init = function(){
      this.id = "lengthenseg";
   }
   this.load = function(demo){

   }

   this.init();
}
var Undo = function(){
   this.init = function(){
      this.id = "undo";
   }
   this.load = function(demo){

   }

   this.init();
}

var Buttons = function(){
   this.init = function(){
      this.id = "buttons";
   }
   this.load = function(demo){

   }

   this.init();
}

var AllTogether = function(){
   this.init = function(){
      this.id = "alltogether";
   }
   this.load = function(demo){

   }

   this.init();
}

var Demonstration = function(){
   this.init = function(){
      var that = this;

      this.ds = new DummySegmentationInterface();
      this.root = $("#demonstration");

      this.stages = {};
      this.stages.welcome = new Welcome();
      this.stages.start = new Start();
      this.stages.hotkey = new Hotkey();
      this.stages.breaking = new Breaking();
      this.stages.aboutbar = new AboutBar();
      this.stages.aboutbar2 = new AboutBar2();
      this.stages.aboutbar2 = new AboutBar2();
      this.stages.aboutbar3 = new AboutBar3();
      this.stages.navigating = new Navigating();
      this.stages.addbreak = new AddBreak();
      this.stages.removebreak = new RemoveBreak();
      this.stages.shortenseg = new ShortenSeg();
      this.stages.lengthenseg = new LengthenSeg();
      this.stages.undo = new Undo();
      this.stages.buttons = new Buttons();
      this.stages.alltogether = new AllTogether();

      this.order = [
         'welcome',
         'start',
         'hotkey',
         'breaking',
         'aboutbar',
         'aboutbar2',
         'aboutbar3',
         'navigating',
         'addbreak',
         'removebreak',
         'shortenseg',
         'lengthenseg',
         'undo',
         'buttons',
         'alltogether'
      ]
      this.idx = 1;
      //this.idx = 0;
      //load initial step
      this.load(this.stages[this.order[this.idx]]);

      $("#next-step",this.root).addClass('button-enabled').click(function(){
         that.next();
      })
      $("#prev-step",this.root).addClass('button-enabled').click(function(){
         that.prev(); 
      })
      $(".card").hide();
   }
   this.get_view = function(){
      return this.root;
   }
   this.get_iface = function(){
      return this.ds;
   }
   this.success = function(){
      $("#command",this.root).removeClass('command').addClass('success');
   }
   this.disable_next = function(){
      console.log("disabling");
      this.stall = true;
      $("#next-step",this.root).addClass('button-disabled').removeClass('button-enabled');
   }
   this.enable_next = function(){
      console.log("enabling");
      this.stall = false;
      $("#next-step",this.root).addClass('button-enabled').removeClass('button-disabled');
   }
   this.next = function(){
      if(this.idx < this.order.length-1 && !this.stall){
         this.idx ++;
         this.load(this.stages[this.order[this.idx]]);
      }

   }
   this.prev = function(){
      if(this.idx > 0){
         this.idx --;
         console.log(this.idx, this.stages[this.order[this.idx]])
         this.load(this.stages[this.order[this.idx]]);
      }

   }
   this.load = function(stage){
      this.ds.unload();
      this.enable_next();
      var par = $("#"+stage.id);
      var title = $("#title",par).clone();
      var cmd = $("#command",par).clone();
      var prompt = $("#prompt",par).clone();
      var content = $("#content",par).clone();

      //set fields
      $("#title",this.root).html("").append(title);
      $("#prompt",this.root).html("").append(prompt);
      $("#command",this.root).html("").append(cmd).removeClass('success').addClass('command');
      $("#content",this.root).html("").append(content);
      $("*",this.root).addClass('active');
      stage.load(this);
      
   }

   this.init();
}
$(document).ready(function(){
   var demo = new Demonstration();
   /*
   $(".card").each(function(){
      var name = $(this).attr('id');
      //copy view in each mock object in the step
      $(".mock", $(this)).each(function(){
         var view = $("#view.dummy").clone().removeClass('dummy');
         $(this).append(view);
      })
      $("*",$(this)).addClass(name).each(function(){
         var uname = $(this).attr('id');
         if(uname != undefined){
            $(this).addClass(uname);
         }
      });
   }) 
   */
   
})