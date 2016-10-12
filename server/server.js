
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.use(function (req, res, next) {
  console.log('middleware');
  console.log("Origin: " + req.origin);
  req.testing = 'testing';
  return next();
});

app.use('/', express.static('app'));

app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});

var aWss = expressWs.getWss('/a');


app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    aWss.clients.forEach(function (client) {
    client.send(msg);
  });
    //ws.send(msg);
  });
  console.log('socket', req.testing);
});

app.listen(3030, function(){
  console.log("Listening on port 3030");
});
