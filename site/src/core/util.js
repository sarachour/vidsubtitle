var isValue = function(v){
   return !(v == undefined || v == null);
}

var clone = function(c){
   if(!(c instanceof Object)) return c;
   var x = {};
   for(var v in c){
      if(c.hasOwnProperty(v)){
         x[v] = clone(c[v]);
      }
   }
   return x;
}

var src_pulse = function(e,delay){
   var orig = e.attr('src');
   if(orig.indexOf('-active.png') >= 0) return;

   var base = orig.split('.png')[0];
   e.attr('src',base + "-active.png");

   setTimeout(function() { 
      var orig = e.attr('src');
      var base = orig.split('-active.png')[0];
     e.attr('src', base+".png");
   }, delay);
}