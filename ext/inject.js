
var data = {};

var YoutubeHooks = function(){
   this.Accessors = function(){
      //get the button responsible for settings
      this.select_by_aria = function(prefix,name){
         return $(prefix+"[aria-labelledby='"+name+"']");
      }
      this.subtitles_options_button = function(){
         return $(".ytp-menu-more-options");
      }
      this.subtitles_exit_options_button = function(){
         return $(".ytp-dialog-button[aria-label='Done']");
      }
      this.settings_button = function(){
         return $(".ytp-settings-button");
      }
      this.subtitles_button = function(){
         return $(".ytp-subtitles-button")
      }
      this.subtitles_list = function(){
         return this.select_by_aria("",'ytp-menu-subtitles');
      }
      this.settings_menu_container = function(){
         return this.select_by_aria(".ytp-menu-container","settings_button");
      }
      this.subtitles_dropdown  =function(){
         var cont = this.settings_menu_container();
         var dropdown = $(".ytp-drop-down[aria-label='Subtitles/CC']", cont);
         return dropdown;
      }
      this.video_container = function(){
         return $(".html5-video-player");
      }
   }
   this.accessors = new this.Accessors();

   //public methods
   this.video_container = function(){
      return this.accessors.video_container();
   }
   this.get_subtitles = function(cbk){
      this.accessors.subtitles_list().each(function(idx){
         var name = this.outerText;
         cbk(name, $(this));
      });
   }
   //sets subtitles to enabled
   this.set_sub_enabled = function(isOn){
      var sbut = this.accessors.subtitles_button();
      var isActive = sbut.hasClass('ytp-subtitles-button-active');
      if((isOn && !isActive) || !isOn && isActive){
         sbut.click();
      }
   }
   this.hide_caption_settings = function(){
      this.accessors.subtitles_exit_options_button().click();
   }
   this.show_caption_settings = function(){
      this.accessors.subtitles_options_button().click();

   }
}


var add_buttons = function(){
   var yth = new YoutubeHooks();
   var sbar = new Sidebar(yth.video_container());
   var hsub = new HiddenSubtext($("video",yth.video_container()));

   //get elements
   sbar.bind_settings(function(isVisible){
      if(!isVisible){
         yth.show_caption_settings();
      }
      else {
         yth.hide_caption_settings();
      }
   })
   sbar.bind_request(function(){
      console.log("REQUEST");
   });


   yth.get_subtitles(function(name, data){
      console.log(name,data);
      if(name != "Translate captions"){
         sbar.add_caption(name, function(){
            yth.set_sub_enabled(name != 'Off');
            hsub.hide_subs();
            data.click();
         });
         
      }
   });
   hsub.load_subs("id here", function(hs){
      sbar.add_caption(hs.get_name(), function(){
         yth.set_sub_enabled(false);
         hs.show_subs();
      })
   })

}

$("document").ready(function(){
   add_buttons();
   console.log("tests");
})
