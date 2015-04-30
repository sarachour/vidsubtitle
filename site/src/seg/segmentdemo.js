
var MEDIA = "media/movie1.mp4";

var Welcome = function(s){
   this.init = function(){
      this.root = $("#welcome");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      $(".continue.welcome").click(function(){
         that.steps.next();
      })
      this.root.fadeIn();
   }
   this.destroy = function(){};
   this.init();
}

var PressStart = function(s){
   this.init = function(){
      this.root = $("#starting");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      $(".break.starting").click(function(){
         that.steps.next();
      })
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      this.root.fadeIn();
   }
   this.destroy = function(){};
   this.init();
}


var PressStartKey = function(s){
   this.init = function(){
      this.root = $("#starting-key");
      this.steps = s;
   }
   this.go = function(){
      var that = this;
      $(".break.starting-key")
      .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      this.key = jwerty.key('space', function(){
         console.log("spacebar");
         that.steps.next();
         return false;
      })
      this.root.fadeIn();
   }
   this.destroy = function(){
      this.key.unbind();
   };
   this.init();
}

var InsertThreeBreaks = function(s){
   this.init = function(){
      this.root = $("#breaking");
      this.steps = s;
   }
   this.init_video = function(){
      var that = this;

      this.video = new YoutubeVideo($('.player1.breaking'));
      this.model = new SegmentModel();
      this.bar = new SegmentBar($('.segmentbar.breaking'), this.model);

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
      
      that.init_video();

      $(".break.breaking")
         .click(function(){
            if(that.is_start){
               $(this).pulse("destroy").html("Break");
               that.video.play();
            }
            else {
               $(this).pulse({'background-color':'#d33434',color:'white'},{pulses:1,duration:200});
               that.model.add_segment(that.video.time());
               count++;
               if(count > 10 && key_count > 1){
                  that.steps.next();
               }
            }
            that.is_start = false;

         })
         .pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000});
      
      //if spacebar is pressed.
      this.key = jwerty.key('space', function(){
         key_count ++;
         $(".break.breaking").click();
         return false;
      })
      this.root.fadeIn();
   }
   this.destroy = function(){
      this.video.pause();
      this.key.unbind();
   }
   this.init();
}
/*
Walks through all the nuances of the bar
*/
var AboutBar = function(s, step){
   this.init = function(){
      this.root = $("#aboutbar");
      this.steps = s;
      this.idx = step;
      this.model = new SegmentModel();
      this.model.listen('update',function(e){
         console.log(e);
      })
      this.bar = new SegmentBar($('.segmentbar.aboutbar'), this.model);

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

   this.destroy = function(){};
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
      this.steps.about_bar = new AboutBar(this,1);
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
      if(this.index >= 0 && this.index < this.order.length)
         this.steps[this.order[this.index]].destroy();

      if(this.index < this.order.length-1){
         this.index++;
      }
      this.steps[this.order[this.index]].go();
   }
   this.prev = function(){
      $(".step").hide();

      if(this.index >= 0 && this.index < this.order.length)
         this.steps[this.order[this.index]].destroy();

      if(this.index > 0){
         this.index--;
      }
      this.steps[this.order[this.index]].go();
   }

   this.init();

}


$(document).ready(function(){
   var steps = new Steps();
   $(".step").each(function(){
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
   
})