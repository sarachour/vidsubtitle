var Sidebar = function(root){
   this.init = function(){
      this.root = root;
      this.width = 200;
      this.views = {};
      this.views.panel = $("<div/>");

      this.visibility = {};
      this.visibility.settings = false;
      var that = this;
      this.bg_color = '#1b1b1b';
      this.but_color = '#444444';
      this.text_color = "#eeeeee";
      //panel
      console.log(this.views.panel.width())
      this.views.panel.addClass('hidden-subtext hs-pane').
         css({
            width: this.width,
            height: this.root.height(),
            left:this.root.offset().left-this.width,
            top:this.root.offset().top
      })
      this.views.content = $("<div/>").css({
         padding:'1em'
      });

      this.views.request_button = $("<div/>")
         .addClass('hs-button request')
         .html("Request Captions");

      this.views.settings_button = $("<div/>")
         .addClass('hs-button settings')
         .html("Caption Settings");
      
      this.views.caption_list = $("<div/>").addClass('hs-list');
      this.views.title = $("<div/>").addClass('hs-title').html("Captions");
      this.views.captions = {};
      this.views.content.append(
         this.views.title,
         this.views.caption_list,
         this.views.request_button, 
         this.views.settings_button);
      this.views.panel.append(this.views.content);
      this.root.append(this.views.panel);
   }

   this.add_caption = function(name, cbk){
      this.views.captions[name] = $("<div/>").addClass('hs-caption');
      var cap = this.views.captions[name];
      cap.html(name)
         .click(function(){
            cbk();
            $('.hs-caption-selected').removeClass('hs-caption-selected');
            $(this).addClass('hs-caption-selected');
         });
      this.views.caption_list.append(cap);
   }
   this.bind_settings = function(cbk){
      var that = this;
      this.views.settings_button.click(function(){
         cbk(that.visibility.settings);
         that.visibility.settings = !that.visibility.settings;
      })
   }
   this.bind_request = function(cbk){
      this.views.request_button.click(function(){
         cbk();
      })
   }


   this.init();
}