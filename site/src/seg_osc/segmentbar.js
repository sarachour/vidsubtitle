
var SegmentBar = function(id, model){
   this.init = function(id, model){
      var that = this;
      if(typeof(id) == "string"){
         this._root = $("#"+id);
      }
      else{
         this._root = id;
      }
      this._model = model;
      this._view = {};
      this._view.canv = $("<canvas/>").attr('id','micro');
      this._view.ctx = this._view.canv[0].getContext('2d');


      this._view.gcanv = $("<canvas/>").attr('id','macro');
      this._view.gctx = this._view.gcanv[0].getContext('2d');

      that._state = {};
      this._state.viewport = {};
      this._state.viewport.width = 30;
      
      this._model.listen('update',function(){that._draw();})
      this._root.html("");

      this._view.canv
         .css('width',"100%")
         .css('height',30);

      this._view.gcanv
         .css('width',"100%")
         .css('height',20);
      
      this._root.html("").append(this._view.gcanv,this._view.canv);
      this._draw();
   }
   this._resize = function(){
      this._view.canv.attr("width",this._view.canv[0].offsetWidth);
      this._view.canv.attr("height",this._view.canv[0].offsetHeight);

      this._view.gcanv.attr("width",this._view.gcanv[0].offsetWidth);
      this._view.gcanv.attr("height",this._view.gcanv[0].offsetHeight);
   }
   this._get_viewport = function(d){
      var t = d.time;
      var range =  this._state.viewport.width/2; //10 seconds
      this._state.viewport.start = Math.max(0, t-range);
      this._state.viewport.end = Math.min(d.duration, t+range);
      return this._state.viewport;
   }
   this._draw = function(){
      this._resize();

      var that = this;
      var ctx = this._view.ctx;
      var gctx = this._view.gctx;

      var d = this._model.get_data();
      var width = this._view.canv.width();
      var height = this._view.canv.height();


      var gwidth = this._view.gcanv.width();
      var gheight = this._view.gcanv.height();

      var viewport = this._get_viewport(d);

      var x = function(v){return (v-viewport.start)*width/(viewport.end - viewport.start);}
      var y = function(v){return v*height/1;}
      var w = function(v){return (v)*width/(viewport.end - viewport.start);}
      var h = function(v){return v*height/1;}

      var gx = function(v){return v*gwidth/d.duration}
      var gy = function(v){return v*gheight/1.0}

      var prop = {};
      

      prop.global = {};
      prop.global.start = 0;
      prop.global.end = 1.0;

      prop.prog = {};
      prop.prog.start = 0.25;
      prop.prog.end = 0.80;

      var colors = {};
      colors.background = {};
      colors.background.all = "#fff";
      colors.background.progress = "#ddd";
      colors.background.speech = "#4f4";
      colors.background.silence = "#33a";

      if(d.duration == null || d.duration == 0) return;


      gctx.fillStyle = ctx.fillStyle = colors.background.all;
      ctx.fillRect(x(viewport.start),y(0),w(viewport.end-viewport.start),y(1));
      gctx.fillRect(gx(0),gy(0),gx(d.duration),y(1));
      
      gctx.fillStyle = ctx.fillStyle = colors.background.progress;
      ctx.fillRect(x(viewport.start),y(prop.prog.start),w(d.time-viewport.start),y(prop.prog.end - prop.prog.start));
      gctx.fillRect(gx(0),gy(prop.prog.start),gx(d.time),y(prop.prog.end - prop.prog.start));

      d.segments.for_each(function(elem){
         var s = elem.start;
         var e = elem.end;
         gctx.fillStyle = ctx.fillStyle = colors.background[elem.type];
         ctx.fillRect(x(s),y(prop.prog.start), w(e-s), y(prop.prog.end - prop.prog.start))
         gctx.fillRect(gx(s),gy(prop.prog.start), gx(e-s), gy(prop.prog.end - prop.prog.start))
      })
     
      //draw some more of the global bar

   }

   this.init(id, model);
}