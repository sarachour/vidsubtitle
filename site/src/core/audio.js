var AudioFile = function(path){
   this.init = function(){
      this.audio = new Audio(path);
   }
   this.play = function(c){
      if(isValue(c)) this.audio.onended = c;
      this.audio.currentTime = 0;
      this.audio.play();
   }
   this.init();
}