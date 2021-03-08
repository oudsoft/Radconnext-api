const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, auth;

app.get('/select/(:caseId)', (req, res) => {
  let caseId = req.params.caseId;
  let chatLog = await db.radchatlogs.findAll({ attributes: ['Log'], where: {	caseId: caseId}});
  res.json({status: {code: 200}, Log: chatLog});
});

/*
  when
  /add api
  /update api

  are work in file lib/websocket.js
*/

module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  return app;
}
