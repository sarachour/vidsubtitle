var KEYS = {
  right: '&#9654;',
  left: '&#9664;',
  up: '&#9650;',
  down: '&#9660',
  x: 'X',
  z:'Z',
  c:'C',
  y:'Y',
  control:'ctrl',
  spacebar:'space',
  delete:'del',
  backspace:'bksp',
  check:'&#10004;'
}

var _RES = function(){
   this.wrap=function(e){return  '<img class="hint icon" src="res/'+e+'"></img>'}
   this.button=function(b){return '<div class="hint but">'+b+"</div>";}
   this.key=function(k){return '<div class="hint key">' + k + "</div>"}
   this.emph=function(k){return '<span class="hint emph">'+k+"</span>"}
   this.next=this.wrap('next.png')
   this.prev=this.wrap('prev.png')
   this.replay=this.wrap('replay.png')
   this.delete=this.wrap('delete.png')
   this.lshift=this.wrap('lshift.png')
   this.rshift=this.wrap('rshift.png')
};
var RES = new _RES();

console.log(RES);
var HINTS = {
   forward: {
      name:"Move Forward", 
      desc:'Move forward through the video. Use the '+RES.key(KEYS.right)+" key or "+RES.next+" button"
   },
   backward: {
      name:"Move Backward", 
      desc:'Move backward through the video. Use the '+RES.key(KEYS.left)+" key or "+RES.prev+" button"
   },
   "mark-start": {
      name:"Mark Speech Start", 
      desc:'Mark the  '+RES.emph("beginning")+" of a natural "+
      "phrase or sentence."+
      'Use the '+RES.key(KEYS.spacebar)+" key or "+RES.button('Break')+" button"
   },
   "mark-end": {
      name:"Mark Speech End", 
      desc:'Mark the  '+RES.emph("end")+" of natural "+
      "phrase or sentence."+
      'Use the '+RES.key(KEYS.spacebar)+" key or "+RES.button('Break')+" button"
   },
   "default": {
      name:null, 
      desc:'<span class="hint faint">Hover over an element to see it\'s description, hotkeys</faint>'
   }
}

INSTRUCTIONS="";


