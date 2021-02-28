/*activateaccountapp.js*/
const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, Task, log, auth;

app.post('/new', (req, res) => {
  let accountData = req.body;
  const promiseList = new Promise(async function(resolve, reject) {
    let aTask = await Task.doCreateNewTask( accountData, (email, sendRes, triggerAt)=>{
      log.info('sendRes=>' + JSON.stringify(sendRes));
      log.info(email + '=>' + triggerAt);
    });
    resolve(aTask);
  });
  Promise.all([promiseList]).then((ob)=> {
    res.json({status: {code: 200}, Task: ob[0]});
  });
});

app.post('/activate', (req, res) => {
  let email = req.body.email;
  let username = req.body.username;
  let usertypeId = req.body.usertypeId;
  let hospitalId = req.body.hospitalId;
  const promiseList = new Promise(async function(resolve, reject) {
    let aTask = await Task.findTaskByEmail(email);
    if (aTask) {
      let newUserinfo = {
        User_NameEN: aTask.User_NameEN,
        User_LastNameEN: aTask.User_LastNameEN,
        User_NameTH: aTask.User_NameTH,
        User_LastNameTH: aTask.User_LastNameTH,
        User_Email: aTask.User_Email,
        User_Phone: aTask.User_Phone,
        User_LineID: aTask.User_LineID,
        User_PathRadiant: aTask.User_PathRadiant
      };
      let adUserinfo = await db.userinfoes.create(newUserinfo);
      let newUser = {username: aTask.username, password: aTask.password, usertypeId: usertypeId, hospitalId: hospitalId, userinfoId: adUserinfo.id};
      let adUser = await db.users.create(newUser);
      let userstatuses = await auth.doGetUserstatusActive();
      adUser.setUserstatus(userstatuses[0]);
      resolve({email: email});
    } else {
      resolve();
    }
  });
  Promise.all([promiseList]).then((ob)=> {
    res.json({status: {code: 200}, Task: ob[0]});
  });
});

module.exports = ( activateTask, dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  Task = activateTask;
  auth = require('../db/rest/auth.js')(db, log);
  return app;
}
