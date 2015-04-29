
var MEDIA = "media/movie1.mp4";

var Welcome = function(s){
   this.init = function(){
      this.root = $("#welcome");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      $("#continue",this.root).click(function(){
         that.steps.next();
      })
      this.root.fadeIn();
   }
   this.init();
}

var PressStart = function(s){
   this.init = function(){
      this.root = $("#starting");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      console.log($("#break",this.root));
      $("#break",this.root).click(function(){
         that.steps.next();
      })
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      this.root.fadeIn();
   }
   this.init();
}


var PressStartKey = function(s){
   this.init = function(){
      this.root = $("#starting-key");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      console.log($("#break",this.root));
      $("#break",this.root)
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      jwerty.key('space', function(){
         console.log("spacebar");
         that.steps.next();
         return false;
      })
      this.root.fadeIn();
   }
   this.init();
}

var InsertThreeBreaks = function(s){
   this.init = function(){
      this.root = $("#breaking");
      this.steps = s;
   }
   this.init_video = function(){
      var that = this;
      $("#player1", this.root).attr('id', "player1-breaking")
      $("#segmentbar", this.root).attr('id', "segmentbar-breaking")

      this.video = new YoutubeVideo('player1-breaking');
      this.model = new SegmentModel();
      this.bar = new SegmentBar('segmentbar-breaking', this.model);

      this.video.listen('update', function(t,u){
         that.model.duration(that.video.duration());
         that.model.time(that.video.time());
      })
      this.video.load(MEDIA);
   }
   this.go = function(){
      var that = this;
      this.is_start = true;
      var count = 0;
      var key_count = 0;
      $("#break",this.root)
         .click(function(){
            if(that.is_start){
               $(this).pulse("destroy").html("Break");
               that.init_video();
               that.video.play();
            }
            else {
               $(this).pulse({'background-color':'#d33434',color:'white'},{pulses:1,duration:200});
               that.model.add_segment(that.video.time());
               count++;
               if(count > 3 && key_count > 1){
                  setTimeout(function(){that.steps.next()},200);
               }
            }
            that.is_start = false;

         })
         .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      //if spacebar is pressed.
      jwerty.key('space', function(){
         key_count ++;
         $("#break",that.root).click();
         return false;
      })
      this.root.fadeIn();
   }
   this.init();
}
/*
Walks through all the nuances of the bar
*/
var AboutBar = function(s){
   this.init = function(){
      this.root = $("#aboutbar");
      this.steps = s;
      $("#segmentbar",this.root).attr('id','segmentbar-aboutbar');
      this.model = new SegmentModel();
      this.model.listen('update',function(e){
         console.log(e);
      })
      this.bar = new SegmentBar('segmentbar-aboutbar', this.model);

   }
   this.substep_text = function(){
      
   }
   this.go = function(){
      this.model.duration(30);
      this.model.add_segment(3);
      this.model.add_segment(7);
      this.model.add_segment(13);
      this.model.time(15);
      $("#macro",this.root).hide();
      this.root.fadeIn();
   }
   this.init();
}

var Steps = function(){
   this.init = function(){
      $(".step").hide();
      this.steps = {};
      this.steps.welcome = new Welcome(this);
      this.steps.press_start = new PressStart(this);
      this.steps.press_start_key = new PressStartKey(this);
      this.steps.insert_three_breaks = new InsertThreeBreaks(this);
      this.steps.about_bar = new AboutBar(this);
      this.index = -1; //-1
      this.order = ['welcome','press_start','press_start_key','insert_three_breaks','about_bar'];

      var that = this;
      $(".step").hide();
      setTimeout(function(){
         that.next();
      },500)
   }
   this.next = function(){
      $(".step").hide();
      if(this.index < this.order.length-1){
         this.index++;
      }
      this.steps[this.order[this.index]].go();
   }
   this.prev = function(){
      $(".step").hide();
      if(this.index > 0){
         this.index--;
      }
      this.steps[this.order[this.index]].go();
   }

   this.init();

}


$(document).ready(function(){
   var steps = new Steps();
   
   //copy view in each mock object
   $(".mock").each(function(){
      $(this).html($("#view").clone().removeClass('dummy'));
   })
})