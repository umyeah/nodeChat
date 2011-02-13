var http = require('http'),
    io = require('socket.io'),
    url = require('url'),
    fs = require('fs'),
    os = require('os'),

server = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  var index = fs.readFileSync(__dirname+'/index.html');
  var socket = fs.readFileSync(__dirname+'/js/socket.io.js');
 
  switch(uri){
    case "/":
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
      break;
    case "/js/socket.io.js":
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(socket);
      break;
  }
});
server.listen(80);

var socket = io.listen(server);
var buffer = [];

socket.on('connection', function(client){
    //client.send({buffer:buffer});
    client.broadcast({ type : "connect",
                       uid  : client.sessionId});
  
    client.on('disconnect', function(){
      client.broadcast({ type : "disconnect",
                         uid  : client.sessionId});
    });

    client.on('message', function(message){
      var msg = { type    : "message", 
                  uid     : client.sessionId,
                  content : message};
      buffer.push(msg);
      if (buffer.length > 15) buffer.shift();
      socket.broadcast(msg);
      console.log(process.memoryUsage());
      console.log("OS memory: " + os.totalmem()+ " of "+ os.freemem());
      console.log("load average: " + os.loadavg());
    });
});

console.log('Server running at http://127.0.0.1:8124/');
