var srv_static = require('node-static')
var fs = require('fs');
var urlparser = require('url');
var process = require('child_process');
/*
var mongo= {};
mongo.client = require('mongodb').MongoClient;
mongo.server = require('mongodb').Server;
mongo.db = require('mongodb').Db;
*/

var web_root = '../../site/';
var media_root = web_root + "media/youtube/";

var file = new srv_static.Server(web_root,
{
   headers: {
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Headers":"X-Requested-With"
   }
});

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var submit_video = function(url,cbk){
  var id = urlparser.parse(url,true).query.v;
  var vid_url = media_root+id+".mp4";
  var extern_vid_url = "media/youtube/"+id+".mp4";

  stats = fs.stat(vid_url, function(err,stat){
    if(err == null){
      console.log("WARNING: already exists");
      cbk(extern_vid_url);
    }
    else{
      //debug
      var vid = process.spawn('youtube-dl',["-o",vid_url,url]);
      vid.on('close',function(){
        console.log("done loading");
        cbk(extern_vid_url);
      })
    }
  });
  

  
}


var handle_post = function(req,res){
  var reqstr = "";
  
  req.on('data', function(chunk) {
    reqstr += chunk.toString();
  });

  req.on('end',function(){
    var data = JSON.parse(decodeURI(reqstr));

    if(data.type == "submit-video"){
      var url = data.url;
      submit_video(url, function(url){
        res.end(JSON.stringify({url:url}));
      });
    }
    else{
      console.log("INVALID POST:", data);
    }
  })
}
var process_file = function(req,res){
   req.addListener('end', function(){
      file.serve(req, res);
   });
    req.resume();
}
console.log("starting https");
require('https').createServer(options, function (req, res) {
  process_file(req,res);
}).listen(4443);


console.log("starting http");
require('http').createServer(function (req, res) { 
  if(req.method == "POST"){
    handle_post(req,res);
  } 
  else{
    process_file(req,res);
  }
}).listen(8080);

/*
var db = new mongo.db('subs', new Server('localhost', 27017))
*/
/*
var mongo_base_url = 'mongodb://localhost:12345'
var mongo_sub_url = mongo_base_url + "/subs";
mongo_client.connect(mongo_sub_url, function(err,db){
   if(err == null){
      console.log("[MONGODB]: Failed to connect");
      return;
   }
   console.log("[MONGODB]: Connection success");
   db.close();
})
*/
