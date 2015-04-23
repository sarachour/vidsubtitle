var static = require('node-static')
var http = require('http');
var https = require('https');
var fs = require('fs');

var file = new(static.Server)('../../site/');

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
   //key: fs.readFileSync('server.key'),
   //cert: fs.readFileSync('server.crt')
};

var process_file = function(req,res){
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
   file.serve(req, res);
}
console.log("starting https");
https.createServer(options, function (req, res) {
  process_file(req,res);
}).listen(4443);


console.log("starting http");
http.createServer(function (req, res) {
  process_file(req,res);
}).listen(8080);

