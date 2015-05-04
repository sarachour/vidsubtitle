

var DummySegmentationInterface = function(){
   this.init = function(){
      this.url = "media/movie1.mp4";
      this.data = JSON.parse(
         '[{"time":0.522496,"id":0,"type":"break"},{"time":1.044992,"id":1,"type":"break"},{"time":1.741562,"id":2,"type":"break"},{"time":3.204359,"id":3,"type":"break"},{"time":4.249214,"id":4,"type":"break"},{"time":4.945784,"id":5,"type":"break"},{"time":6.083515,"id":6,"type":"break"},{"time":7.821782178217822,"id":8,"type":"break"},{"time":9.643675,"id":7,"type":"break"},{"time":11.18811881188119,"id":9,"type":"break"},{"time":12.252475247524751,"id":10,"type":"break"}]'   
      );
      this.video = new YoutubeVideo("player1",$("#view"));
      this.model = new SegmentModel();
      this.bar = new SegmentBar($("#segmentbar"), this.model);
      this.obs = new Observer();

      var that = this;
      this.video.listen('update',function(){
         that.model.duration(that.video.duration());
         that.model.time(that.video.time());
      })
      this.first_time = true;
      this.enabled = {};

      this.video.load(this.url);
      this.video.time(1);
      this.initialized = false;
   }
   this.listen = function(t,c,n){
      this.obs.listen(t,c,n);
   }
   this.setup = function(){
      var that = this;
      var v = $("#view").removeClass('dummy').detach().appendTo('.mock.active');
      this.model.duration(300);


      var handle_break = function(){
         $("#break",v).pulse({'background-color':'#d33434',color:'white'},{pulses:1,duration:200});
         that.model.add(that.video.time());
      }
      var handle_start = function(){
         if(that.is_started){
            handle_break(); return;
         }
         $("#break",v).pulse('destroy').html('Break');
         $("#segmentbar",v).fadeIn();
         that.video.play();
         that.obs.trigger('start');
         that.is_started = true;
      }
      var handle_hover = function(n){
         if(that.enabled.hint){
            var text = HINTS[n];
            console.log(text);
            $("#hint",v).html("<span class='emph'>"+text.name + "</span>:"+text.desc);
            that.obs.trigger('hint',{name:n});
         }
      }
      this.model.listen('select', function(){
         that.video.time(that.model.time());
         that.obs.trigger('select');
      },"sel1");

      this.model.listen('update', function(e){
         console.log(e);
         if(e.type == "add")
               that.obs.trigger('break');
         if(e.type == "shift")
               that.obs.trigger('shift',e);
      },"sel1");

      $("#break",v).click(function(){
         if(that.enabled.start_button){
            that.obs.trigger('start-button');
            handle_start();
         }
      })
      .hover(function(){ handle_hover("break");});

      $("#undo",v).hover(function(){ handle_hover("undo");});
      $("#redo",v).hover(function(){ handle_hover("redo");});
      $("#next",v).hover(function(){ handle_hover("next");});
      $("#prev",v).hover(function(){ handle_hover("prev");});
      $("#replay",v).hover(function(){ handle_hover("replay");});
      $("#delete",v).hover(function(){ handle_hover("delete");});
      $("#en_sr",v).hover(function(){ handle_hover("rshift");});
      $("#en_sl",v).hover(function(){ handle_hover("lshift");});


      jwerty.key('space', function(){
         if(that.enabled.start_key){
            that.obs.trigger('start-key');
            handle_start();
         }
         return false;
      })
      jwerty.key('left', function(){
         if(that.enabled.prev_key){
            that.model.prev();
            var sel = that.model.select();
            that.video.segment(sel.start, sel.end);
            that.video.play();
            that.obs.trigger('prev');

         }
         return false;
      })
      jwerty.key('right', function(){
         if(that.enabled.next_key){
            that.model.next();
            var sel = that.model.select();
            that.video.segment(sel.start, sel.end);
            that.video.play();
            that.obs.trigger('next');
         }
         return false;
      })
      jwerty.key('up/down', function(){
         if(that.enabled.repeat_key){
            var sel = that.model.select();
            that.video.segment(sel.start, sel.end);
            that.video.play();
            that.obs.trigger('repeat');
         }
         return false;
      })
      jwerty.key('z/delete', function(){
         if(that.enabled.remove_key){
            that.model.remove();
            that.obs.trigger('remove');
         }
         return false;
      })
      jwerty.key('x', function(){
         if(that.enabled.lshift_key){
            that.model.shift(0,-0.25);
            that.obs.trigger('lshift_key');
         }
         return false;
      });
      jwerty.key('c', function(){
         if(that.enabled.rshift_key){
            that.model.shift(0,0.25);
            that.obs.trigger('rshift_key');
         }
         return false;
      })
      this.first_time = false;
   }
   this.load = function(parent, phase, enabled){
      var that = this;
      var v = $("#view").removeClass('dummy').detach().appendTo('.mock.active');
      this.obs.clear();
      this.model.clear();
      //only enable pertinent elements
      for(var key in this.enabled) this.enabled[key] = false;
      for(var i=0; i < enabled.length; i++){
         this.enabled[enabled[i]] = true;
      }

      if(phase == "start"){
         $("#segmentbar",v).hide();
         $("#break",v).pulse({'background-color':'#96E6B8'},{pulses:-1,duration:1000}).html('Start');
         this.is_started = false;
      }
      else if(phase == 'edit'){
         $("#segmentbar",v).show();
         $("#break",v).pulse('destroy').html('Break');
         this.is_started = true;
         this.model.from_json(this.data);
      }
      //start video at time=0
      this.video.time(0);

      if(this.first_time ){
         this.setup();
      }
      var bind_canvas = function(elem,prop){
         if(that.enabled[prop]){
            elem
               .removeClass('no-click')
               .css('opacity',1);
         }
         else{
            elem
               .addClass('no-click')
               .css('opacity',0.3);
         }
      }

      bind_canvas($("#macro",v), 'segmentbar-macro');
      bind_canvas($("#micro",v), 'segmentbar-micro');

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
      demo.success();

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
         demo.next();
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
         console.log("succ");
         demo.success();
         demo.next();
      },'1');
   }

   this.init();
}

var Breaking = function(){
   this.init = function(){
      this.id = "breaking";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();
      demo.disable_next();
      iface.load(this.id, "start", ['start_key','start_button','break_key','break_button']);
      this.tcount = 0;
      this.keycount = -1;
      var nbreaks = 10;
      var nkeys = 1;
      iface.listen('break', function(){
         that.tcount++;
         $("#break_counter").removeClass("dummy").html(that.tcount);
         if(that.tcount >= nbreaks){
            $("#break_counter").addClass('success');
         }
         if(that.tcount >= nbreaks && that.keycount >= nkeys){
            demo.success();
            demo.next();
         }
      },'1');
      iface.listen('start-key', function(){
         that.keycount++; 
         if(that.keycount > 0){
            $("#break_key_counter").removeClass("dummy").html(that.keycount);
         }
         if(that.keycount >= nkeys){
            $("#break_key_counter").addClass('success');
         }
      },'1');
   }

   this.init();
}

var AboutBar = function(){
   this.init = function(){
      this.id = "aboutbar";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();
      iface.load(this.id, "edit", ['segmentbar-micro','segmentbar-macro']);
      demo.success();

   }

   this.init();
}


var AboutBar2 = function(){
   this.init = function(){
      this.id = "aboutbar2";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-macro']);
      var count = 0;
      iface.obs.listen('select', function(){
         count++;
         $("#region_counter").removeClass('pending').html(count);
         if(count>=3){
            $("#region_counter").addClass('success')
            demo.success();
            demo.next();
         }
      },'1');

   }

   this.init();
}

var AboutBar3 = function(){
   this.init = function(){
      this.id = "aboutbar3";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();
      iface.load(this.id, "edit", ['segmentbar-micro','segmentbar-macro']);
      demo.success();

   }

   this.init();
}
var Navigating = function(){
   this.init = function(){
      this.id = "navigating";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-micro', 'prev_key', 'next_key','repeat_key']);
      var sel_item = false;
      var move_left = false;
      var move_right = false;
      var repeat = false;
      iface.obs.listen('select', function(){
         sel_item = true;
         $("#select_counter").removeClass('pending').addClass('success').html(KEYS['check']);
      },'1');
      iface.obs.listen('prev', function(){
         if(sel_item) move_left = true;
         $("#left_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         if(sel_item && move_right && move_left && repeat){
            demo.success();
            demo.next();
         }
      },'1');
      iface.obs.listen('next', function(){
         $("#right_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         if(sel_item) move_right = true;
         if(sel_item && move_right && move_left && repeat){
            demo.success();
            demo.next();
         }
      },'1');
      iface.obs.listen('repeat', function(){
         $("#repeat_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         if(sel_item) repeat = true;
         if(sel_item && move_right && move_left && repeat){
            demo.success();
            demo.next();
         }
      })

   }

   this.init();
}

var AddBreak = function(){
   this.init = function(){
      this.id = "addbreak";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-micro', 'start_key','start_button']);
      

      this.tcount = 0;
      this.keycount = 0;
      this.buttoncount = 0;
      iface.listen('break', function(){
         that.tcount++;
         console.log(that.tcount, that.keycount)
         if(that.tcount > that.keycount + that.buttoncount){
            $("#break_region_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         }
         if(that.tcount > that.keycount + that.buttoncount && 
            that.tcount > 0 && that.keycount>0 && that.buttoncount > 0){
            demo.success();
            demo.next();
         }

      },'1');
      iface.listen('start-key', function(){
         $("#break_key_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         that.keycount++; 
      },'1');
      iface.listen('start-button', function(){
         $("#break_mouse_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         that.buttoncount++; 
      },'1');

   }

   this.init();
}

var RemoveBreak = function(){
   this.init = function(){
      this.id = "removebreak";
   }
   this.load = function(demo){
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-micro', 'remove_key']);
      iface.listen('remove', function(){
         demo.success();
         $("#remove_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         demo.next();
      },'1');
   }

   this.init();
}

var ShortenSeg = function(){
   this.init = function(){
      this.id = "shortenseg";
   }
   this.load = function(demo){
      demo.disable_next();
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-micro', 'lshift_key']);
      var shifts = 0;
      var keyshifts=0;
      iface.listen('shift', function(e){
         console.log(e);
         if(e.amt < 0){
            shifts++;
         }
         if(shifts > 0){
            $("#shorten_counter").removeClass('pending').html(shifts);
         }
         if(shifts > 4){
            $("#shorten_counter").addClass('success');
         }
         if(shifts > keyshifts){
            $("#shorten_mouse_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         }
         if(keyshifts > 0 && shifts > 4 && shifts > keyshifts){
            demo.success();
            $("#shorten_counter").addClass('success');
            demo.next();
         }
      },'1');
      iface.listen('lshift_key', function(){
         keyshifts++;
         $("#shorten_key_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         if(keyshifts > 0 && shifts > 4 && shifts > keyshifts){
            demo.success();
            $("#shorten_counter").addClass('success');
            demo.next();
         }
      },'1');

   }

   this.init();
}
var LengthenSeg = function(){
   this.init = function(){
      this.id = "lengthenseg";
   }
   this.load = function(demo){
      demo.disable_next();
      var that = this;
      var iface = demo.get_iface();

      demo.disable_next();
      iface.load(this.id, "edit", ['segmentbar-micro', 'rshift_key']);
      var shifts = 0;
      var keyshifts=0;
      iface.listen('shift', function(e){
         if(e.amt > 0){
            shifts++;
         }
         console.log(shifts, keyshifts);
         if(shifts > 0){
            $("#lengthen_counter").removeClass('pending').html(shifts);
         }
         if(shifts > 4){
            $("#lengthen_counter").removeClass('pending').html(shifts);
         }
         if(shifts > keyshifts){
            $("#lengthen_mouse_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         }
         if(keyshifts > 0 && shifts > 4 && shifts > keyshifts){
            demo.success();
            $("#lengthen_counter").addClass('success');
            demo.next();
         }
      },'1');
      iface.listen('rshift_key', function(){
         keyshifts++;
         $("#lengthen_key_counter").removeClass('pending').addClass('success').html(KEYS['check']);
         if(keyshifts > 0 && shifts > 4 && shifts > keyshifts){
            demo.success();
            $("#lengthen_counter").addClass('success');
            demo.next();
         }
      },'1');
   }

   this.init();
}
var Undo = function(){
   this.init = function(){
      this.id = "undo";
   }
   this.load = function(demo){
      demo.success();
   }

   this.init();
}

var Buttons = function(){
   this.init = function(){
      this.id = "buttons";
   }
   this.load = function(demo){
      demo.disable_next();
      var that = this;
      var iface = demo.get_iface();
      var elems = ['next','prev','replay','break','undo','redo','lshift','rshift','delete'];
      var n = elems.length;
      var hovered = {};
      elems.forEach(function(e){hovered[e] = false;});

      iface.load(this.id, "edit", ['hint']);
      iface.listen('hint', function(e){
         var name = e.name;
         hovered[name] = true;
         var cnt = 0;
         for(var q in hovered){
            if(hovered[q]) cnt++;
         }
         $("#hints_counter").removeClass('pending').html(cnt+"/"+n);
         if(cnt == n){
            demo.success();
            $("#hints_counter").addClass('success');
            demo.next();
         }
         
      })
   }

   this.init();
}

var AllTogether = function(){
   this.init = function(){
      this.id = "alltogether";
   }
   this.load = function(demo){
      var resolver = new Navigator();
      var cookies = new UserCookie();

      var args = resolver.get();
      console.log(args);
      demo.success("Choose what you would like to do next.");
      cookies.tutorial('segment', true);
      $("#ready_segment").click(function(){
         var url = resolver.segment(args.data.url,false);
         resolver.redirect(url);
      });
      $("#practice_segment").click(function(){
         var url = resolver.segment(args.data.url, true);
         resolver.redirect(url);
      });
      $("#replay_tutorial").click(function(){
         var url = resolver.demo("segment",args.data.url);
         console.log(url);
         resolver.redirect(url);
      })
   }

   this.init();
}

var Demonstration = function(){
   this.init = function(){
      var resolver = new Navigator();
      var cookies = new UserCookie();


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

      $("#next-step",this.root).click(function(){
         that.next();
      }).mouseenter(function(){
         $(this).attr('src','res/dright-active.png');
      }).mouseleave(function(){
         $(this).attr('src','res/dright.png');
      })
      $("#prev-step",this.root).click(function(){
         that.prev(); 
      }).mouseenter(function(){
         $(this).attr('src','res/dleft-active.png');
      }).mouseleave(function(){
         $(this).attr('src','res/dleft.png');
      })
      $(".card").hide();

      $("#skip-step").click(function(){
         that.success();
         that.enable_next();
         that.next();
      })
      $("#exit-tutorial").click(function(){
         cookies.tutorial('segment', true);
         var url = resolver.segment();
         resolver.redirect(url);
      })
   }
   this.get_view = function(){
      return this.root;
   }
   this.get_iface = function(){
      return this.ds;
   }
   this.success = function(){
      $("#command",this.root).removeClass('command').addClass('success');
      this.enable_next();
   }
   this.disable_next = function(){
      console.log("disabling");
      this.stall = true;
      $("#next-step",this.root).css('display','none')
   }
   this.enable_next = function(){
      console.log("enabling");
      this.stall = false;
      $("#next-step",this.root).css('display','block')
   }
   this.next = function(){
      var that = this;
      if(this.idx < this.order.length-1 && !this.stall){
         this.idx ++;
         setTimeout(function(){
            that.load(that.stages[that.order[that.idx]])
         },200);
      }

   }
   this.prev = function(){
      if(this.idx > 0){
         this.idx --;
         console.log(this.idx, this.stages[this.order[this.idx]])
         this.load(this.stages[this.order[this.idx]]);
      }

   }
   this.load = function(stage, idx){
      this.ds.unload();
      this.enable_next();
      if(this.idx == 0)
         $("#prev-step",this.root).css('display','none')

      else
         $("#prev-step",this.root).css('display','block')

      if(this.idx == this.order.length-1)
         $("#next-step",this.root).css('display','none')

      else
         $("#next-step",this.root).css('display','block')

      var par = $("#"+stage.id);
      var title = $("#title",par).clone();
      var cmd = $("#command",par).clone();
      var prompt = $("#prompt",par).clone();
      var content = $("#content",par).clone();
   
      $("#stepid").html("Step "+(this.idx+1)+" of "+this.order.length);
      $("#title",this.root).html("").append(title);
      $("#prompt",this.root).html("").append(prompt);
      $("#command",this.root).html("").append(cmd).removeClass('success').addClass('command');
      $("#content",this.root).html("").append(content);
      $("*",this.root).addClass('active');
      $(".bubble",this.root).removeClass('success').addClass('pending').html('?');
      stage.load(this);
      
   }

   this.init();
}
var demo
$(document).ready(function(){
   demo = new Demonstration();
   $(".key").each(function(){
      var newk = KEYS[$(this).html()];
      if(newk != undefined){
         $(this).html(newk);
      }
   })
   
  
   
})