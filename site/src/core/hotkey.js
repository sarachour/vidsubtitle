$(document).ready(function(){

   

   var handlekey = function(e){
      var that = $(this);
      var name = that.attr('hotkey-name');
      var code = that.attr('hotkey-code');
      var title = that.attr('button-title');

      $(this).data('isdown', false);
      
      $(document).bind("keyup", jwerty.event(code, function(){
         if(that.data('isdown')) that.mouseup();
         that.data('isdown', false);
       }))
      $(document).bind("keydown", jwerty.event(code, function(){
         if(that.data('isdown')) return;
         that.mousedown();
         that.data('isdown', true)
      }));
      //press
      jwerty.key(code, function(){
         that.click();
         return false;
      })

      that.on('changeData', function(e){
          var new_title = $(this).data('button-title');
          var new_hotkey = $(this).data('hotkey-name');
          $(".hotkey.title",this).html(new_title);
          $(".hotkey.shortcut",this).html(new_hotkey);
          console.log("WARNING: Does not support changing shortcut bindings dynamically.");
      });

      if(title != undefined && name != undefined){
        that.html("");
        var title_div = $("<div/>");
        var hotkey_div = $("<div/>");

        title_div.html(title);
        title_div.addClass('hotkey title');

        hotkey_div.html(name);
        hotkey_div.addClass("hotkey shortcut");

        that.append(title_div);
        that.append(hotkey_div);
      }


   };
   $(".hotkey.node").each(handlekey);
   $(".hotkey.button").each(handlekey);
})