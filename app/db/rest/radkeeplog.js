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

var db, log, auth, websocket;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const doLoadUserProfile = function(userId){
  return new Promise(async (resolve, reject) => {
    let userInclude = [{model: db.userinfoes, attributes: excludeColumn}, {model: db.hospitals, attributes: ['Hos_Name']}];
    let ownerCaseUsers = await db.users.findAll({attributes: excludeColumn, include: userInclude, where: {id: userId}});
    let ownerCaseUserLines = await db.lineusers.findAll({ attributes: ['id', 'UserId'], where: {userId: userId}});
    let ownerCaseUserProfile = {userId: userId, username: ownerCaseUsers[0].username, User_NameEN: ownerCaseUsers[0].User_NameEN, User_LastNameEN: ownerCaseUsers[0].User_LastNameEN, hospitalId: ownerCaseUsers[0].hospitalId, hospitalName: ownerCaseUsers[0].hospital.Hos_Name, User_NameTH: ownerCaseUsers[0].userinfo.User_NameTH, User_LastNameTH: ownerCaseUsers[0].userinfo.User_LastNameTH};
    if ((ownerCaseUserLines) && (ownerCaseUserLines.length > 0)) {
      ownerCaseUserProfile.lineUserId = ownerCaseUserLines[0].UserId;
    }
    resolve(ownerCaseUserProfile);
  });
}

app.post('/select/(:caseId)', async (req, res) => {
  const orderby = [['id', 'ASC']];
  let caseId = req.params.caseId;
  let keepLogs = await db.radkeeplogs.findAll({ where: {	caseId: caseId}, order: orderby});
  let userProfiles = [];
  const promiseList = new Promise(async function(resolve, reject) {
    for (let i=0; i < keepLogs.length; i++){
      let keep = keepLogs[i];
      if ((keep.userId) && (keep.userId != 0)) {
        let userProfile = await doLoadUserProfile(keep.userId);
        userProfiles.push(userProfile);
      } else {
        userProfiles.push({userId: 0, username: 'system', User_NameEN: 'Radconnext', User_LastNameEN: 'System', User_NameTH: 'Radconnext', User_LastNameTH: 'System'});
      }
    }
    setTimeout(()=> {
      resolve(userProfiles);
    },400);
  });
  Promise.all([promiseList]).then((ob)=> {
    res.json({status: {code: 200}, Logs: keepLogs, UserProfiles: ob[0]});
  });
});

app.post('/case/event/nofify', async (req, res) => {
  log.info('caseEventNotify Call=> ' + JSON.stringify(req.body));
  let caseId = req.body.caseId;
  let userId = req.body.userId;
  let from = req.body.from;
  let to = req.body.to;
  let remark = req.body.remark;
  let triggerAt = req.body.triggerAt;
  let ownerCaseUsers = await db.cases.findAll({attributes: ['userId'], where: {id: caseId}});
  let ownerCaseUserId = ownerCaseUsers[0].userId;
  let eventCaseUsers = await db.users.findAll({attributes: ['username'], where: {id: ownerCaseUserId}});
  let eventCaseUsername = eventCaseUsers[0].username;
  let caseEventData = {caseId, userId, from, to, remark};
  if (triggerAt) {
    caseEventData.triggerAt = triggerAt;
  }
  let caseEventMsg = {type: 'caseeventlog', data: caseEventData};
  log.info('caseEventMsg=> ' + JSON.stringify(caseEventMsg));
  let canSent = await websocket.sendMessage(caseEventMsg, eventCaseUsername)
  res.json({status: {code: 200}, result: canSent});
});

/*
  when
  /add api
  /update api

  are work in file lib/websocket.js
*/

module.exports = ( dbconn, monitor, wsssocket ) => {
  db = dbconn;
  log = monitor;
  websocket = wsssocket;
  auth = require('./auth.js')(db, log);
  return app;
}
