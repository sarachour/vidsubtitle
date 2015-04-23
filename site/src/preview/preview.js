
var PreviewController = function(){
   this.init = function(){
    this.video = new YoutubeVideo("player1");
    this.exp = new SubtitleExporter();
   }
   this.load_subtitles = function(){
      var dat = JSON.parse($("#output",$("#dev")).val());
      var url = dat.url;
      var str = this.exp.to_vtt(dat);
      var fn = this.exp.to_file(str);
      this.video.load(url);
      console.log(fn,url);
   }

   this.export = function(type){
    var dat = JSON.parse($("#output",$("#dev")).val());
    var url = dat.url;
    if(type == "vtt")
      var str = this.exp.to_vtt(dat);
    else if(type == "srt")
      var str = this.exp.to_srt(dat);
    else if(type == "raw")
      var str = this.exp.to_raw(dat);

    var fn = this.exp.to_file(str);
    this.video.load(url);
    console.log(fn,url);
   }
   this.init();
}
var pc;
$(document).ready(function(){
   pc = new PreviewController();
   $("#output",$("#dev"))
   .val('{"data":[{"start":0,"end":2.2143555,"caption":""},{"start":2.2143555,"end":4.101198,"caption":""},{"start":4.101198,"end":10.065308999999996,"caption":""},{"start":10.065308999999996,"end":11.502137,"caption":""},{"start":11.502137,"end":13.900550499999994,"caption":""},{"start":13.900550499999994,"end":16.1555385,"caption":""},{"start":16.1555385,"end":19.0988415,"caption":""},{"start":19.0988415,"end":20.31203,"caption":""},{"start":20.31203,"end":22.708771,"caption":""},{"start":22.708771,"end":25.031274000000003,"caption":""},{"start":25.031274000000003,"end":29.962547999999998,"caption":""},{"start":29.962547999999998,"end":31.4308385,"caption":""},{"start":31.4308385,"end":35.024271,"caption":""},{"start":35.024271,"end":39.0988845,"caption":""},{"start":39.0988845,"end":41.119236,"caption":""},{"start":41.119236,"end":44.091257,"caption":""},{"start":44.091257,"end":47.829502000000005,"caption":""},{"start":47.829502000000005,"end":52.333971000000005,"caption":""},{"start":52.333971000000005,"end":53.523940499999995,"caption":""},{"start":53.523940499999995,"end":56.6642985,"caption":""},{"start":56.6642985,"end":61.865335,"caption":""},{"start":61.865335,"end":64.001475,"caption":""},{"start":64.001475,"end":65.6848465,"caption":""},{"start":65.6848465,"end":67.992384,"caption":""},{"start":67.992384,"end":71.7654575,"caption":""},{"start":71.7654575,"end":73.3907815,"caption":""},{"start":73.3907815,"end":77.616318,"caption":""},{"start":77.616318,"end":79.218423,"caption":""},{"start":79.218423,"end":81.57016999999999,"caption":""},{"start":81.57016999999999,"end":84.603298,"caption":""},{"start":84.603298,"end":87.23284,"caption":""},{"start":87.23284,"end":89.694045,"caption":""},{"start":89.694045,"end":91.5863865,"caption":""},{"start":91.5863865,"end":92.48031499999999,"caption":""},{"start":92.48031499999999,"end":96.288217,"caption":""},{"start":96.288217,"end":98.981611,"caption":""},{"start":98.981611,"end":100.42371750000001,"caption":""},{"start":100.42371750000001,"end":102.81212,"caption":""},{"start":102.81212,"end":105.0035625,"caption":""},{"start":105.0035625,"end":112.49851899999999,"caption":""},{"start":112.49851899999999,"end":113.95826,"caption":""}],"url":"http://127.0.0.1:8080/media/movie1.mp4"}')
    
    pc.load_subtitles();
})