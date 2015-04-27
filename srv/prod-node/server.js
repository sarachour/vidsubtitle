var srv_static = require('node-static')
var fs = require('fs');
var mongo= {};
mongo.client = require('mongodb').MongoClient;
mongo.server = require('mongodb').Server;
mongo.db = require('mongodb').Db;


var file = new srv_static.Server('../../site/',
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

var process_file = function(req,res){
   req.addListener('end', function(){
      file.serve(req, res);
   });
    req.resume();
}
console.log("starting https");
require('https').createServer(options, function (req, res) {
  console.log(req);
  process_file(req,res);
}).listen(4443);


console.log("starting http");
require('http').createServer(function (req, res) {
  process_file(req,res);
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