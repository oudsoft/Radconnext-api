const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('request-promise');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

var db, log, auth, uti, Task;

app.post('/response', async function(req, res) {
  log.info('voip response => ' + JSON.stringify(req.body));
  /*
  let forwardCmdFmt = "curl -k -X POST -H \"Content-Type: application/json\" https://202.28.68.28:8443/api/voipapp/response  -d  '%s'";
  let forwardCmd = uti.fmtStr(forwardCmdFmt, JSON.stringify(req.body));
  log.info('forwardCmd => ' + forwardCmd);
  let forwardRes = await uti.runcommand(forwardCmd);
  log.info('forwardRes => ' + JSON.stringify(forwardRes));
  */

  let yourResponse = req.body;
  log.info('yourResponse=> ' + JSON.stringify(yourResponse));
  let caseId = req.body.inc_id;
  log.info('yourCaseId => ' + caseId);
  let yourTask = Task.selectTaskByCaseId(caseId);
  log.info('yourTask => ' + JSON.stringify(yourTask));
  if ((yourTask) && (yourTask.caseId)){
    let key = req.body.response_key;
    yourTask.doAppendNewKEY(key);
    if (yourTask.responseKEYs.length >= 2){
      yourTask.responseKEYs.forEach((item, i) => {
        log.info(i + '. => ' + JSON.stringify(item));
      });
    }
  }


  //await Task.removeTaskByCaseId(caseId);
  res.json({status: {code: 200}, ok: 'ok'});
});

module.exports = ( taskVoip, dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  Task = taskVoip;
  auth = require('../db/rest/auth.js')(db, log);
  uti = require('./mod/util.js')(db, log);
  return app;
}
