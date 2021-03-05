const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('request-promise');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

let sessionHandleStorages = [];
/*
  Object in sessionHandleStorages
  {userId, content: {mode, }}
*/
/*
  x401 + x402 ต้องมี Action ไปที่ Case ด้วย เพื่อ trigger webapp ทาง web socket
*/

var db, Task, log, auth, lineApi, uti, socket, statusControl;

const doFindSessionHandle = (userId)=>{
  return new Promise(async function(resolve, reject) {
    let session = [];
    session = await sessionHandleStorages.find((handle, index) => {
      if (handle.userId === userId) {
        return handle;
      }
    })
    resolve(session);
  });
}

const removeSessionHandle = (userId)=>{
  return new Promise(async function(resolve, reject) {
    let filterSession = await sessionHandleStorages.filter((handle, index) => {
      if (handle.userId !== userId) {
        return handle;
      }
    });
    sessionHandleStorages = filterSession;
    resolve(sessionHandleStorages);
  });
}

const replyAction = (token, msg) => {
	return new Promise(async function(resolve, reject) {
    try {
      let replyStatus = await lineApi.replyConnect(token, msg);
      resolve(replyStatus);
    } catch(error) {
      log.error('Line replyAcction Error => ' + JSON.stringify(error));
      reject(error);
    }
	});
}

const pushAction = (userId, msg) => {
	return new Promise(async function(resolve, reject) {
    try {
      let replyStatus = await lineApi.pushConnect(userId, msg);
      resolve(replyStatus);
    } catch(error) {
      log.error('Line pushAcction Error => ' + JSON.stringify(error));
      reject(error);
    }
	});
}

const doCreateRadconToken = (userId) => {
  return new Promise(async function(resolve, reject) {
    const userLines = await db.lineusers.findAll({ attributes: ['id', 'userId'], where: {	UserId: userId}});
    const users = await db.users.findAll({ attributes: ['id', 'username'], where: {	id: userLines[0].userId}});
    let yourToken = auth.doEncodeToken(users[0].username);
    resolve({userId: users[0].id, token: yourToken});
  });
}

const postbackMessageHandle = (userId, replyToken, cmds, radUser)=>{
  return new Promise(async function(resolve, reject) {
    /* ob.action.data = "action=" + action + "&itemid=" + item.id + "&data=" + item.id, */
    /* var cmds = userEvent.postback.data.split("&"); */
    var action = (cmds[0].split("="))[1];
  	var cmdCode = (cmds[1].split("="))[1];
  	var data = (cmds[2].split("="))[1];
    switch (action) {
      case 'quick':
        var action;
        var guideMsg;
        var lineMessage;
        var yourToken;
        var rqParams;
        var rqBody;
        var caseRes;
        var caseInclude;
        var actionReturnTextFmt, targetCases, targetCase, hospitalName, patientNameEN;
        var actionReturnText, userHandle;
        var targetProfile, userProfile;
        switch (cmdCode) {
          case 'x001':
            var backToMainMunuMsg = 'เชิญเลือกคำสั่งจากเมนูด้านล่างครับ';
            action = 'quick';
            if (radUser.usertypeId==2){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.techMainMenu));
            } else if (radUser.usertypeId==4){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.radioMainMenu));
            } else if (radUser.usertypeId==6){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.mainMenu));
            } else {
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.mainMenu));
            }
            resolve();
          break;
          case 'x002':
            guideMsg = 'โปรดป้อน username ที่ต้องการลงทะเบียนใช้งานคู่กับ LINE บัญชีนี้ครับ';
            await replyAction(replyToken, guideMsg);
            resolve();
          break;
          case 'x003':
            var backToMainMunuMsg = 'เชิญเลือกคำสั่งจากเมนูด้านล่างครับ';
            action = 'quick';
            if (radUser.usertypeId==2){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.techMainMenu));
            } else if (radUser.usertypeId==4){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.radioMainMenu));
            } else if (radUser.usertypeId==6){
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.mainMenu));
            } else {
              await replyAction(replyToken, lineApi.createBotMenu(backToMainMunuMsg, action, lineApi.mainMenu));
            }
            resolve();
          break;
          case 'x101':
            action = 'quick';
            let userRegs = await doCheckUserRegistered(userId);
            if (userRegs.length == 0){
              var regiterMunuMsg = 'เชิญเลือกลงทะเบียนตามประเภทผู้ใช้งานจากเมนูด้านล่างครับ';
              await replyAction(replyToken, lineApi.createBotMenu(regiterMunuMsg, action, lineApi.registerMenu));
            } else {
              var regiteredMunuMsg = 'คุณได้ลงทะเบียนใช้งานไปแล้ว\nใช้งานอื่นจากเมนูด้านล่างครับ';
              if (radUser.usertypeId==2){
                await replyAction(replyToken, lineApi.createBotMenu(regiteredMunuMsg, action, lineApi.techMainMenu));
              } else if (radUser.usertypeId==4){
                await replyAction(replyToken, lineApi.createBotMenu(regiteredMunuMsg, action, lineApi.radioMainMenu));
              } else if (radUser.usertypeId==6){
                await replyAction(replyToken, lineApi.createBotMenu(regiteredMunuMsg, action, lineApi.mainMenu));
              } else {
                await replyAction(replyToken, lineApi.createBotMenu(regiteredMunuMsg, action, lineApi.mainMenu));
              }
            }
            resolve();
          break;
          case 'x102':
            action = 'quick';
            targetProfile = await db.userprofiles.findAll({attributes: ['Profile'], where: { userId: radUser.id } });
            if (targetProfile.length > 0){
              userProfile = targetProfile[0];
              let readyState = userProfile.Profile.readyState;
              let toggleSettingMenu = [];
              if (readyState == 0) {
                toggleSettingMenu.push({id: 'x501', name: 'เปิดรับเคส'});
              } else {
                toggleSettingMenu.push({id: 'x502', name: 'ปิดรับเคส'});
              }
              await replyAction(replyToken, lineApi.createBotMenu('ตั้งค่ารับเคสใหม่โดยกดที่เมนูครับ', action, toggleSettingMenu));
            } else {
              await replyAction(replyToken, lineApi.createBotMenu('ระบบฯ ไม่พบข้อมูลการตั้งค่าของคุณ\nโปรดใช้งานอื่นจากเมนูด้านล่างก่อนครับ', action, lineApi.radioMainMenu));
            }
            resolve();
          break;
          case 'x103':
            var otherMunuMsg = 'เชิญเลือกใช้บริการอื่นๆ จากเมนูด้านล่างครับ';
            action = 'quick';
            await replyAction(replyToken, lineApi.createBotMenu(otherMunuMsg, action, lineApi.otherMenu));
            resolve();
          break;
          case 'x201':
            userHandle = {userId: userId, content: {mode: 'key', field: 'username', usertype: 4}};
            sessionHandleStorages.push(userHandle);
            guideMsg = 'โปรดป้อน username ของรังสีแพทย์ที่ต้องการลงทะเบียนครับ';
            lineMessage = { type: "text",	text: guideMsg };
            await replyAction(replyToken, lineMessage);
            resolve();
          break;
          case 'x202':
            userHandle = {userId: userId, content: {mode: 'key', field: 'username', usertype: 2}};
            sessionHandleStorages.push(userHandle);
            guideMsg = 'โปรดป้อน username ของเจ้าหน้าที่เทคนิคที่ต้องการลงทะเบียนครับ';
            lineMessage = { type: "text",	text: guideMsg };
            await replyAction(replyToken, lineMessage);
            resolve();
          break;
          case 'x203':
            userHandle = {userId: userId, content: {mode: 'key', field: 'username', usertype: 6}};
            sessionHandleStorages.push(userHandle);
            guideMsg = 'โปรดป้อน username ของผู้ดูแลระบบที่ต้องการลงทะเบียนครับ';
            lineMessage = { type: "text",	text: guideMsg };
            await replyAction(replyToken, lineMessage);
            resolve();
          break;
          case 'x301':
            /* วิธีใช้งาน */
            var hid = "h00";
    				var helper = require('./mod/userhelp.json');
            var userHelpText = 'วิธีใช้งานมีดังนี้ครับ\n\n'
    				userHelpText += helper[hid];
            userHelpText += '\n\nหากต้องการใช้บริการใดๆ ของผม โปรดเลือกจากเมนูครับ';
            action = 'quick';
            if (users[0].usertypeId==2){
              await replyAction(replyToken, lineApi.createBotMenu(userHelpText, action, lineApi.techMainMenu));
            } else if (users[0].usertypeId==4){
              await replyAction(replyToken, lineApi.createBotMenu(userHelpText, action, lineApi.radioMainMenu));
            } else if (users[0].usertypeId==6){
              await replyAction(replyToken, lineApi.createBotMenu(userHelpText, action, lineApi.mainMenu));
            } else {
              await replyAction(replyToken, lineApi.createBotMenu(userHelpText, action, lineApi.mainMenu));
            }
            resolve();
          break;
          case 'x302':
            /* แจ้งปัญหาการใช้าน*/
            var userHandle = {userId: userId, content: {mode: 'key', field: 'report'}};
            sessionHandleStorages.push(userHandle);
            guideMsg = 'ป้อนปัญหาการใช้งานระบบฯ ส่งเข้ามาได้เลยครับ';
            lineMessage = { type: "text",	text: guideMsg };
            await replyAction(replyToken, lineMessage);
            resolve();
          break;
          case 'x401':
            /* radio accept new cse*/
            caseInclude = [ {model: db.patients, attributes: ['Patient_NameEN', 'Patient_LastNameEN', 'Patient_NameTH', 'Patient_LastNameTH']}, {model: db.hospitals, attributes: ['Hos_Name']}];
            targetCases = await db.cases.findAll({include: caseInclude, where: {id: data}});
            targetCase = targetCases[0];
            hospitalName = targetCase.hospital.Hos_Name;
            patientNameEN = targetCase.patient.Patient_NameEN + ' ' + targetCase.patient.Patient_LastNameEN;
            actionReturnTextFmt = 'ดำเนินการตอบรับเคส\nชื่อ %s\nรพ. %s\nไปเรียบร้อยแล้ว\nอีกสักครู่ระบบฯ จะแจ้งกำหนดเวลาส่งผลอ่าน';
            actionReturnText = uti.parseStr(actionReturnTextFmt, patientNameEN, hospitalName);
            action = 'quick';
            await replyAction(replyToken, lineApi.createBotMenu(actionReturnText, action, lineApi.radioMainMenu));
            let changeRes = await statusControl.doChangeCaseStatus(1, 2, data, radUser.id, 'Accept by Line Bot');
            resolve(changeRes);
          break;
          case 'x402':
            /* radio not accept new cse*/
            caseInclude = [ {model: db.patients, attributes: ['Patient_NameEN', 'Patient_LastNameEN', 'Patient_NameTH', 'Patient_LastNameTH']}, {model: db.hospitals, attributes: ['Hos_Name']}];
            targetCases = await db.cases.findAll({include: caseInclude, where: {id: data}});
            targetCase = targetCases[0];
            hospitalName = targetCase.hospital.Hos_Name;
            patientNameEN = targetCase.patient.Patient_NameEN + ' ' + targetCase.patient.Patient_LastNameEN;
            actionReturnTextFmt = 'ดำเนินการปฏิเสธเคส\nชื่อ %s\nรพ. %s\nไปเรียบร้อยแล้ว\nหากต้องการใช้บริการอื่นๆ โปรดเลือกจากเมนูครับ';
            actionReturnText = uti.parseStr(actionReturnTextFmt, patientNameEN, hospitalName);
            action = 'quick';
            await replyAction(replyToken, lineApi.createBotMenu(actionReturnText, action, lineApi.radioMainMenu));
            let changeResNotAcc = await statusControl.doChangeCaseStatus(1, 3, data, radUser.id, 'Not Accept by Line Bot');
            resolve(changeResNotAcc);
          break;
          case 'x501':
            action = 'quick';
            targetProfile = await db.userprofiles.findAll({attributes: ['Profile'], where: { userId: radUser.id } });
            if (targetProfile.length > 0){
              userProfile = targetProfile[0];
              userProfile.Profile.readyState = 1;
              userProfile.Profile.readyBy = 'bot';
              await db.userprofiles.update({Profile: userProfile.Profile}, { where: { userId: radUser.id } });
              await replyAction(replyToken, lineApi.createBotMenu('ระบบฯ ดำเนินการตั้งค่ารับเคสใหม่ของคุณแล้ว\nใช้งานอื่นๆ จากเมนูด้านล่างครับ', action, lineApi.radioMainMenu));
              let updateProfileTrigger = {type: 'updateuserprofile', profile: userProfile};
              await socket.sendMessage(updateProfileTrigger, radUser.username);
            } else {
              await replyAction(replyToken, lineApi.createBotMenu('ระบบฯ ไม่พบข้อมูลการตั้งค่าของคุณ\nโปรดใช้งานอื่นจากเมนูด้านล่างก่อนครับ', action, lineApi.radioMainMenu));
            }
            resolve();
          break;
          case 'x502':
            action = 'quick';
            targetProfile = await db.userprofiles.findAll({attributes: ['Profile'], where: { userId: radUser.id } });
            if (targetProfile.length > 0){
              userProfile = targetProfile[0];
              userProfile.Profile.readyState = 0;
              userProfile.Profile.readyBy = 'bot';
              let result = await db.userprofiles.update({Profile: userProfile.Profile}, { where: { userId: radUser.id } });
              await replyAction(replyToken, lineApi.createBotMenu('ระบบฯ ดำเนินการตั้งค่ารับเคสใหม่ของคุณแล้ว\nใช้งานอื่นๆ จากเมนูด้านล่างครับ', action, lineApi.radioMainMenu));
              let updateProfileTrigger = {type: 'updateuserprofile', profile: userProfile};
              await socket.sendMessage(updateProfileTrigger, radUser.username);
            } else {
              await replyAction(replyToken, lineApi.createBotMenu('ระบบฯ ไม่พบข้อมูลการตั้งค่าของคุณ\nโปรดใช้งานอื่นจากเมนูด้านล่างก่อนครับ', action, lineApi.radioMainMenu));
            }
            resolve();
          break;
        }
      break;
    }
  });
}

const textMessageHandle = (userId, replyToken, userText, radUser)=>{
  return new Promise(async (resolve, reject)=>{
    let action;
    let replyMsg;
    let sessionHanle = await doFindSessionHandle(userId);
    if (sessionHanle) {
      let userMode = sessionHanle.content.mode;
      switch (userMode) {
        case 'key':
          let field = sessionHanle.content.field;
          if (field === 'username') {
            let usertype = sessionHanle.content.usertype;
            //search username from db
            const users = await db.users.findAll({ attributes: ['id', 'username', 'usertypeId'], where: {	username: userText, usertypeId: usertype}});
            if (users.length > 0){
              const userLines = await db.lineusers.findAll({ attributes: ['id', 'UserId'], where: {	id: users[0].id}});
              if (userLines.length == 0) {
                let newLineUser = {UserId: userId};
                let adLineUser = await db.lineusers.create(newLineUser);
                await db.lineusers.update({userId: users[0].id}, { where: { id: adLineUser.id } });
              } else {
                await db.lineusers.update({UserId: userText}, { where: { id: users[0].id } });
              }
              action = 'quick';
              replyMsg = 'ระบบฯ ได้ทำการได้ทำการลงทะเบียน ' + userText + ' ใช้งานระบบฯ คู่กับ Line ของคุณเป็นที่เรียบร้อยแล้วครับ\nหากต้องการใช้บริการอย่างอื่นโปรดเลือกคำสั่งจากเมนูครับ'
              if (users[0].usertypeId==2){
                await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.techMainMenu));
              } else if (users[0].usertypeId==4){
                await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.radioMainMenu));
              } else if (users[0].usertypeId==6){
                await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
              } else {
                await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
              }
              await removeSessionHandle(userId);
            } else {
              action = 'quick';
              replyMsg = 'ระบบฯ ไม่พบ username=' + userText + '\nคุณต้องการลงทะเบียนใช้งานด้วย username อื่นหรือไม่ครับ'
              await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.confirmMenu));
            }
          } else if (field === 'report') {
            let userdata = await lineApi.getUserProfile(userId);
            let userProfile = JSON.parse(userdata);
            let displayName = userProfile.displayName;
            let reportMsg = displayName + ' แจ้งปัญหาเข้ามาว่า ' + userText;
            log.info(reportMsg);
            //LINE_ADMIN_USERID=U2ffb97f320994da8fb3593cd506f9c43
            let msgToAdmin = { type: "text",	text: reportMsg };
            await pushAction(process.env.LINE_ADMIN_USERID, msgToAdmin);
            action = 'quick';
            replyMsg = 'ระบบฯ ได้ทำการบันทึกปัญหาการใช้งานของคุณและแจ้งไปยังผู้รับผิดชอบเป็นที่เรียบร้อยแล้วครับ\nหากต้องการใช้บริการอย่างอื่นโปรดเลือกคำสั่งจากเมนูครับ'
            if (radUser.usertypeId==2){
              await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.techMainMenu));
            } else if (radUser.usertypeId==4){
              await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.radioMainMenu));
            } else if (radUser.usertypeId==6){
              await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
            } else {
              await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
            }
            await removeSessionHandle(userId);
          }
        break;
      }
    } else {
      action = 'quick';
      replyMsg = 'ต้องขออภัยด้วยจริงๆ ครับ ผมไมอาจ่เข้าใจในสิ่งที่คุณส่งเข้ามา โปรดเลือกใช้บริการของผมจากเมนูครับ';
      if (radUser.usertypeId==2){
        await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.techMainMenu));
      } else if (radUser.usertypeId==4){
        await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.radioMainMenu));
      } else if (radUser.usertypeId==6){
        await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
      } else {
        await replyAction(replyToken, lineApi.createBotMenu(replyMsg, action, lineApi.mainMenu));
      }
    }
  });
}

const doCheckUserRegistered = function(lineId) {
  return new Promise(async (resolve, reject)=>{
    const userLines = await db.lineusers.findAll({ attributes: ['id', 'UserId'], where: {	UserId: lineId}});
    resolve(userLines);
  });
}

const doCallUserType = function(lineId){
  return new Promise(async (resolve, reject)=>{
    const userLines = await db.lineusers.findAll({ attributes: ['id', 'UserId', 'userId'], where: {	UserId: lineId}});
    let userId = userLines[0].userId;
    const users = await db.users.findAll({ attributes: ['id', 'username', 'usertypeId'], where: {	id: userId}});
    if (users.length > 0){
      resolve(users[0]);
    } else {
      resolve();
    }
  });
}

app.get('/', function(req, res) {
	res.status(200).send("OK");
});

app.post('/', async function(req, res) {
  var replyMessage;
	var question;
  var userdata;
  var userProfile;
  var displayName;
  var username;
  var usertypeId;

  let userEvent = req.body.events[0];
  let replyToken = userEvent.replyToken;
	let userId = userEvent.source.userId;
	let destination = req.body.destination;
  let radUser = await doCallUserType(userId);
  if (radUser) {
    username = radUser.username;
  } else {
    usertypeId = radUser.usertypeId;
  }

  switch (userEvent.type) {
    case 'message':
      let userMessageType = userEvent.message.type;
      switch (userMessageType) {
        case 'text':
          var userText = userEvent.message.text;
          await textMessageHandle(userId, replyToken, userText, radUser);
        break;
        case 'image':
          var imageId = userEvent.message.id;
          var unSupportMsg = 'ต้องขออภัยระบบยังรองรับฟังก์ชั่นนี้ในขณะนี้\nโปรดใช้เมนูจากด้านล่างครับ';
          var action = 'quick';
          if (usertypeId==2){
            await replyAction(replyToken, lineApi.createBotMenu(unSupportMsg, action, lineApi.techMainMenu));
          } else if (usertypeId==4){
            await replyAction(replyToken, lineApi.createBotMenu(unSupportMsg, action, lineApi.radioMainMenu));
          } else if (usertypeId==6){
            await replyAction(replyToken, lineApi.createBotMenu(unSupportMsg, action, lineApi.mainMenu));
          } else {
            await replyAction(replyToken, lineApi.createBotMenu(unSupportMsg, action, lineApi.mainMenu));
          }
        break;
      }
    break;
    case 'postback':
      var cmds = userEvent.postback.data.split("&");
      await postbackMessageHandle(userId, replyToken, cmds, radUser);
    break;
    case 'follow':
      try {
        userdata = await lineApi.getUserProfile(userId);
        userProfile = JSON.parse(userdata);
        displayName = userProfile.displayName;
        var intro = "สวัสดีครับคุณ " + displayName + "\n" + "Radconnext เป็นเกียรติอย่างยิ่งที่ได้รับใช้คุณ\nโปรดเลือกทำรายการจากเมนูด้านล่างได้เลยครับ";
        var action = 'quick';
        await replyAction(replyToken, lineApi.createBotMenu(intro, action, lineApi.mainMenu));
      } catch (err) {
        log.info('User Follow Error => ' + JSON.stringify(err));
      }
    break;
    case 'unfollow':
      try {
        /*
        userdata = await lineApi.getUserProfile(userId);
        userProfile = JSON.parse(userdata);
        displayName = userProfile.displayName;
        var replyUnfollowMsg = "Radconnext ขอขอบพระคุณ คุณ " + displayName;
        replyUnfollowMsg += "\nเป็นอย่างสูงที่ไดมีโอกาส้รับใช้คุณ\nคุณสามารถกลับมาใช้บริการได้ใหม่ทุกเมื่อเลยครับ";
        await pushAction(userId, replyUnfollowMsg);
        */
      } catch (err) {
        log.info('User Unfollow Error => ' + JSON.stringify(err));
      }
    break;
  }
});

module.exports = ( taskCase, dbconn, monitor, webSocket ) => {
  db = dbconn;
  log = monitor;
  socket = webSocket;
  Task = taskCase;
  auth = require('../db/rest/auth.js')(db, log);
  lineApi = require('./mod/lineapi.js')(db, log);
  uti = require('./mod/util.js')(db, log);
  statusControl = require('../db/rest/statuslib.js')(db, log, Task, socket);

  return app;
}
