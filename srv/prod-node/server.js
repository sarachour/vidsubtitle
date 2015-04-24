var static = require('node-static')
var fs = require('fs');

var file = new static.Server('../../site/',
   {
      headers: {
         "Access-Control-Allow-Origin":"*",
         "Access-Control-Allow-Headers":"X-Requested-With"
      }
   });

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
   //key: fs.readFileSync('server.key'),
   //cert: fs.readFileSync('server.crt')
};

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
  process_file(req,res);
}).listen(8080);

