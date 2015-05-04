
var ScribeBar = function(id, model){
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

      this._view.gcanv = $("<canvas/>").attr('id','macro');
      this._view.gctx = this._view.gcanv[0].getContext('2d');

      that._state = {};
      this._model.listen('update',function(){that._draw();})
      this._model.listen('select',function(){that._draw();})
      this._model.listen('time',function(){that._draw();})
      this._root.html("");

      this._view.gcanv
         .css('width',"100%")
         .css('height',20);
      
      var gnorm = function(e){
         var f = e.offsetX/that._view.gcanv.width();
         var d = that._model.get_data();
         var time = f*d.duration/(d.select.end-d.select.start)/2;
         return { t:time };
      }
      var delta = function(t,c){ 
         var oc = $(t).data('coord');
         var delta = {};
         delta.t = c.t - oc.t;
         return delta;
      }

      //global canvas
      this._view.gcanv
         .data('drag', false)
         .data('coord', {x:null,y:null})
         .mousemove(function(e){
            var c = gnorm(e);
            that._draw();
         })
         .click(function(e){
            var c = gnorm(e);
            $(this).data('coord',c);
            that._model.time(c.t);
         })
         .mouseleave(function(e){
            $(this).data('coord',{x:null,y:null}).data('drag',false);
         })
         .css({
            'margin-bottom':'5px'
         })
         .mousemove(function(e){
            var c = gnorm(e);
            that._draw();
         });
      this._view.times = $("<div/>");
      this._view.start = $("<span/>").css('float','left').html("Start Time");
      this._view.end = $("<span/>").css('float','right').html("End Time");
      this._view.times.append(this._view.start,this._view.end)

      this._root.html("").append(this._view.gcanv,this._view.canv);
      this._draw();
   }
   this._resize = function(){
      this._view.gcanv.attr("width",this._view.gcanv[0].offsetWidth);
      this._view.gcanv.attr("height",this._view.gcanv[0].offsetHeight);
   }
   this._draw = function(){

      var that = this;
      var sel_draw = function(seg,color){
         var s = seg.start;
         var e = seg.end;
         gctx.fillStyle = color;
         gctx.fillRect(
            gx(s)+1.5, 
            gy(0), 
            gw(e-s)-1.5,
            gh(1)
            );
         gctx.fill();
      }

      this._resize();

      var gctx = this._view.gctx;

      var d = that._model.get_data();
      var s = that._model.selected().start;
      var e = that._model.selected().end;

      var gwidth = this._view.gcanv.width();
      var gheight = this._view.gcanv.height();

      var gx = function(v){return v*gwidth/d.duration}
      var gy = function(v){return v*gheight}
      var gw = function(v){return v*gwidth/d.duration}
      var gh = function(v){return v*gheight}

      var fixed = {};
      fixed.block_pad = 5;

      fixed.plumbob = {};
      fixed.plumbob.marker_width = 6;
      fixed.plumbob.stem_width = fixed.plumbob.marker_width/2;
      var prop = {};
      
      prop.markers = {};
      prop.markers.start = 0;
      prop.markers.end = 0.25;

      prop.prog = {};
      prop.prog.start = 0.25;
      prop.prog.end = 0.80;

      prop.global = {};
      prop.global.start = 0;
      prop.global.end = 1.0;

      prop.global.seg = {};
      prop.global.seg.start = 0.4;
      prop.global.seg.end = 0.6;
      var colors = {};
      
      //the cursor showing where you are currently
      colors.cursor = {};
      colors.cursor.marker = "#f39c12";
      colors.cursor.stem = "#f39c12";

      //the selected segment
      colors.selected = "#2ecc71";
      colors.hovered = "#f1c40f";
      colors.block = "black";
      colors.continuation = "lightgrey";
      colors.progress = "#ABEBC6";

      colors.progbar = {};
      colors.progbar.elapsed = "#2ecc71";
      colors.progbar.total = "white";
      colors.progbar.ignore = "#ecf0f1";

      colors.background = {};
      colors.background.all = "white";
      colors.background.markers = "white";
      colors.background.footer = "white";

      colors.global = {};
      colors.global.segments = "black";
      colors.global.background = "#eeeeee";
      colors.global.progress = "darkgrey";
      colors.global.selected = "#2ecc71";

      this._view.start.html(this._model.selected.start);
      this._view.end.html(this._model.selected.end);
      if(d.duration == null || d.duration == 0) return;
      //fill in background

      //draw global bar
      gctx.fillStyle = colors.global.background;
      gctx.fillRect(gx(0),gy(prop.global.start),gx(d.duration),gy(prop.global.end));
      
      //draw segments bar
      gctx.fillStyle = colors.global.segments;
      gctx.fillRect(gx(0),gy(prop.global.seg.start),gx((d.time-s)/((e-s)/d.duration)),gy(prop.global.seg.end-prop.global.seg.start));


      
      var gmark_draw = function(x){
         gctx.fillStyle = '#806515'
         gctx.fillRect(
            gx((x-s)/((e-s)/d.duration)),
            gy(prop.global.start),
            1.5,
            gh(prop.global.end - prop.global.start)
            );
      }

      var hovered = false;
      var hover_t = null;

      if(!hovered && hover_t != null){
         hovered = true;
         sel_draw(d.select, colors.hovered);
      }

      if(hover_t != null){
         gmark_draw(hover_t);
      }
      else{
         gmark_draw(d.time);
      }


   }

   this.init(id, model);
}