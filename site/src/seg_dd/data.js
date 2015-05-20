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
   next: {
      name:"Next Segment", 
      desc:'Move to the next segment. Use the '+RES.key(KEYS.right)+" key or "+RES.next+" button"
   },
   prev: {
      name:"Previous Segment", 
      desc:'Move to the previous segment. Use the '+RES.key(KEYS.left)+" key or "+RES.prev+" button"
   },
   replay: {
      name:"Replay Segment", 
      desc:'Replay the selected segment. '+
      'Use the '+RES.key(KEYS.up)+" or "+RES.key(KEYS.down)+" key or "+RES.replay+" button"
   },
   start: {
      name:"Start Segmentation Process", 
      desc:'Start breaking up the video into segments. '+
      'Use the '+RES.key(KEYS.spacebar)+" key or "+RES.button('Start')+" button"
   },
   "break": {
      name:"Mark Break", 
      desc:'Mark the  '+RES.emph("beginning")+" or "+RES.emph("end")+" of natural "+
      "phrase or sentence."+
      'Use the '+RES.key(KEYS.spacebar)+" key or "+RES.button('Break')+" button"
   },
   "delete": {
      name:"Delete Mark", 
      desc:'Delete the mark at the end of the selected segment. '+
      'Use the '+RES.key(KEYS.delete)+" or "+RES.key(KEYS.z)+" key or "+RES.delete+" button"
   },
   "lshift": {
      name:"Shorten Segment", 
      desc:'Chop off the very end of the segment. '+
      'Use the '+RES.key(KEYS.x)+" key or "+RES.lshift+" button"
   },
   "rshift": {
      name:"Lengthen Segment", 
      desc:'Extend the very end of the segment. '+
      'Use the '+RES.key(KEYS.c)+" key or "+RES.rshift+" button"
   },
   "undo": {
      name:"Undo Change", 
      desc:'Undo the last change made. '+
      'Use the '+RES.key(KEYS.control)+"+"+RES.key(KEYS.z)+" key combination or "+RES.undo+" button"
   },
   "redo": {
      name:"Redo Change", 
      desc:'Redo the last change made. '+
      'Use the '+RES.key(KEYS.control)+"+"+RES.key(KEYS.y)+" key combination or "+RES.redo+" button"
   },
   "default": {
      name:null, 
      desc:'<span class="hint faint">Hover over an element to see it\'s description, hotkeys</faint>'
   }
}

INSTRUCTIONS=
   'Break up the video by pressing '+RES.button('Break')+" or "+RES.key(KEYS.spacebar)+" to mark "+
   'the  '+RES.emph("beginning")+" or "+RES.emph("end")+" of each natural phrase or sentence."+
   "Press "+RES.button('Start')+" or "+RES.key(KEYS.spacebar)+" to begin."


