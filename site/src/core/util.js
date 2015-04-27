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