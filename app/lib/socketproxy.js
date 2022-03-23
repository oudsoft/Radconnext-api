var express = require('express');
var app = express();
var http = require('http');
var httpProxy = require('http-proxy');

app.use(function (req, res, next) {
  httpProxy.createServer({
    target: 'ws://202.28.68.6:8088/ws',
    ws: true
  }).listen(8088);
});

http.createServer(app).listen(8080, function(){
    console.log('App running on port: 8080');
});
