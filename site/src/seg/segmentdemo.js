

var DummySegmentationInterface = function(){
   this.init = function(){
      this.url = "media/movie1.mp4";
      this.data = "";
      this.video = new YoutubeVideo("#player1",$("#view"));
      this.model = new SegmentModel();
      this.bar = new SegmentBar();
      this.video.load(this.url);
   }
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

   }

   this.init();
}

var Hotkey = function(){
   this.init = function(){
      this.id = "hotkeys";
   }
   this.load = function(demo){

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
      this.idx = 0;
      //load initial step
      this.load(this.stages[this.order[this.idx]]);

      $("#next",this.root).click(function(){
         that.next();
      })
      $("#prev",this.root).click(function(){
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
   this.next = function(){
      if(this.idx < this.order.length-1){
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
      var par = $("#"+stage.id);
      var title = $("#title",par).clone();
      var cmd = $("#command",par).clone();
      var prompt = $("#prompt",par).clone();
      var content = $("#content",par).clone();

      //set fields
      $("#title",this.root).html(title);
      $("#prompt",this.root).html(prompt);
      $("#command",this.root).html(cmd);
      $("#content",this.root).html(content);

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