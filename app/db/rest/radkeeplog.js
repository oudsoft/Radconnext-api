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
  await keepLogs.forEach(async(keep, i) => {
    log.info('keep=>' + JSON.stringify(keep))
    if (keep.userId != 0) {
      let userProfile = await doLoadUserProfile(keep.userId);
      userProfiles.push(userProfile);
    } else {
      userProfiles.push({userId: 0, username: 'system', User_NameEN: 'Radconnext', User_LastNameEN: 'System', User_NameTH: 'Radconnext', User_LastNameTH: 'System'});
    }
  });
  res.json({status: {code: 200}, Logs: keepLogs, UserProfiles: userProfiles});
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
