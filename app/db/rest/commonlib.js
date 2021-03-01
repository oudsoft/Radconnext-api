const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');

var log, db, tasks, uti, lineApi;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const casestatusFlowTable = [
    /* acc = accept rej = reject upd = update */
    /* Update หมายถึงการแก้ไขข้อมูลที่เป็นเนื้อหาของเคส */
    /* Renew หมายถึงเปลี่ยนรังสีแพทย์ ซึ่งจะทำให้เคสมีสถานะเป็น new ใหม่อีกครั้ง แต่เป็นรังสีแพทย์คนใหม่(หรือคนเดมก็ได้)*/
    {now: 1, next: [2, 3, 7], actions: ['accR', 'rejR', 'updH', 'cancelH', 'changeH']},
    {now: 2, next: [8], actions: ['openR', 'updH']},
    {now: 3, next: [7], actions: ['cancelH', 'renewH', 'updH', 'changeH']},
    {now: 4, next: [7], actions: ['cancelH', 'renewH', 'updH', 'changeH']},
    {now: 5, next: [6, 10, 11, 12, 14], actions: ['viewH', 'printH', 'convertH', 'callzoomH', 'editR']},
    {now: 6, next: [12], actions: ['editR']},
    {now: 7, next: [1], actions: ['renewH', 'deleteH', 'updH', 'changeH']},
    {now: 8, next: [9, 5, 13], actions: ['draftR', 'replyR']},
    {now: 9, next: [5, 13], actions: ['replyR']},
    {now: 10, next: [11], actions: ['viewH', 'printH', 'convertH', 'callzoomH', 'editR']},
    {now: 11, next: [6, 12], actions: ['viewH', 'printH', 'convertH', 'closeH', 'editR', 'callzoomH']},
    {now: 12, next: [13, 14], actions: ['editR', 'viewH', 'printH', 'convertH', 'callzoomH', 'editR']},
    {now: 13, next: [12, 14], actions: ['editR', 'viewH', 'printH', 'convertH', 'callzoomH', 'editR']},
    {now: 14, next: [12, 13], actions: ['editR', 'viewH', 'printH', 'convertH', 'callzoomH', 'editR']}
];

const msgNewCaseRadioDetailFormat = 'เคสใหม่\nจากโรงพยาบาล %s\nผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\n';
const msgAccCaseRadioDetailPattern = 'เคสจากโรงพยาบาล %s\nผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\n';
const msgAccCaseHospitalDetailPattern = 'รังสีแพทย์ตอบรับเคสใหม่ของผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\nแล้ว และกำลังรอเปิดอ่านเคส';
const msgRejCaseHospitalDetailPattern = 'รังสีแพทย์ปฏิเสธเคสใหม่ของผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\nเสียใจด้วยตรับ แต่คุณยังสามารถส่งเคสนี้ไปหาหมอคนอื่นได้อีกนะครับ';
const msgExpCaseRadioDetailPattern = 'เคสจากโรงพยาบาล %s\nผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\nหมดเวลาแล้วครับ';
const msgExpCaseHospitalDetailPattern = 'เคสใหม่ของผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\nหมดเวลาแล้วตรับ แต่คุณยังสามารถส่งเคสนี้ไปหาหมอคนอื่นได้อีกครับ';
const msgSucCaseHospitalDetailPattern = 'รังสีแพทยส่งผลอ่านเคส่ของผู้ป่วยชื่อ %s\nStudyDescription %s\nProtocolName %s\nBodyPart %s\nModality %s\nแล้ว ยินดีด้วยตรับ';

const doCanNextStatus = function (from) {
  return new Promise(async function(resolve, reject) {
    let canDoNext = await casestatusFlowTable.find((item)=>{
      if (item.now == from) return item;
    });
    resolve(canDoNext);
  });
}

const doSearchRadioForHospital = function(hospitalId) {
  return new Promise(function(resolve, reject) {
    const promiseList = new Promise(async function(resolve, reject) {
      const userInclude = [{model: db.userinfoes, attributes: excludeColumn}];
      const radusers = await db.users.findAll({ attributes: excludeColumn, include: userInclude, where: {usertypeId: 4}});
      let rades = [];
      radusers.forEach(async (user, i) => {
        let userHospitals = JSON.parse(user.userinfo.User_Hospitals);
        let tempHos = await userHospitals.find((item)=> {
          return item.id === hospitalId;
        });
        if (tempHos) {
          let tempRdl = {Value: user.id, DisplayText: user.userinfo.User_NameTH + ' ' + user.userinfo.User_LastNameTH};
          rades.push(tempRdl);
        }
      });
      setTimeout(()=> {
        resolve(rades);
      },400);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    }).catch((err)=>{
      reject(err);
    });
  });
}

const doGenNewCaseOptions = function(hospitalId) {
  return new Promise(function(resolve, reject) {
    const promiseList = new Promise(async function(resolve, reject) {
      const userInclude = [{model: db.userinfoes, attributes: excludeColumn}];
      const clmes = await db.cliamerights.findAll({ attributes: ['id', 'CR_Name'] });
      const urges = await db.urgenttypes.findAll({ attributes: ['id', 'UGType_Name'], where: {hospitalId: hospitalId, UGType: 'standard'} });
      //const radusers = await db.users.findAll({ attributes: excludeColumn, include: userInclude, where: {hospitalId: hospitalId, usertypeId: 4}});
      const refusers = await db.users.findAll({ attributes: excludeColumn, include: userInclude, where: {hospitalId: hospitalId, usertypeId: 5}});
      let cliames = [];
      clmes.forEach((clm, i) => {
        let tempRad = {Value: clm.id, DisplayText: clm.CR_Name};
        cliames.push(tempRad);
      });
      let urgents = [];
      urges.forEach((urg, i) => {
        let tempUrg = {Value: urg.id, DisplayText: urg.UGType_Name};
        urgents.push(tempUrg);
      });
      /*
      let rades = [];
      radusers.forEach((user, i) => {
        let tempRdl = {Value: user.id, DisplayText: user.userinfo.User_NameTH + ' ' + user.userinfo.User_LastNameTH};
        rades.push(tempRdl);
      });
      */
      let refes = [];
      refusers.forEach((user, i) => {
        let tempRef = {Value: user.id, DisplayText: user.userinfo.User_NameTH + ' ' + user.userinfo.User_LastNameTH};
        refes.push(tempRef);
      });
      /*
      let rades = await doSearchRadioForHospital(hospitalId);
      */
      setTimeout(()=> {
        resolve({Result: "OK", Options: {cliames, urgents, /* rades,*/ refes}});
      },400);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    }).catch((err)=>{
      reject(err);
    });
  });
}

const doCallCaseStatusByName = function(Name) {
  return new Promise(async (resolve, reject) => {
    const casestatus = await db.casestatuses.findAll({ attributes: excludeColumn, where: {CS_Name_EN: Name} });
    resolve(casestatus);
  });
}

const doGetCaseDescription = function(caseId) {
  return new Promise(async (resolve, reject) => {
    const caseDesc = await db.cases.findAll({ attributes: ['id', 'Case_DESC'], where: {id: caseId} });
    resolve(caseDesc);
  });
}

const doLoadUserProfile = function(userId){
  return new Promise(async (resolve, reject) => {
    let userInclude = [{model: db.userinfoes, attributes: excludeColumn}, {model: db.hospitals, attributes: ['Hos_Name']}];
    let ownerCaseUsers = await db.users.findAll({attributes: excludeColumn, include: userInclude, where: {id: userId}});
    let ownerCaseUserLines = await db.lineusers.findAll({ attributes: ['id', 'UserId'], where: {userId: userId}});
    let ownerCaseUserProfile = {userId: userId, username: ownerCaseUsers[0].username, User_NameEN: ownerCaseUsers[0].User_NameEN, User_LastNameEN: ownerCaseUsers[0].User_LastNameEN, hospitalId: ownerCaseUsers[0].hospitalId, hospitalName: ownerCaseUsers[0].hospital.Hos_Name};
    if ((ownerCaseUserLines) && (ownerCaseUserLines.length > 0)) {
      ownerCaseUserProfile.lineUserId = ownerCaseUserLines[0].UserId;
    }
    resolve(ownerCaseUserProfile);
  });
}

const doLoadRadioProfile = function(radioId){
  return new Promise(async (resolve, reject) => {
    let userInclude = [{model: db.userinfoes, attributes: excludeColumn}];
    let radioUsers = await db.users.findAll({attributes: excludeColumn, include: userInclude, where: {id: radioId}});
    let radioUserLines = await db.lineusers.findAll({ attributes: ['id', 'UserId'], where: {userId: radioId}});
    /*
    let radioConfigs = JSON.parse(radioUsers[0].userinfo.User_Hospitals);
    let configs = await radioConfigs.filter((item, i) => {
      if (Number(item.id) === hospitalId) {
        return item;
      }
    });
    */
    let radioUserProfiles = await db.userprofiles.findAll({ attributes: ['Profile'], where: {userId: radioId}});
    let radioConfig = radioUserProfiles[0].Profile.casenotify.line;
    let radioProfile = {userId: radioId, username: radioUsers[0].username, User_NameEN: radioUsers[0].userinfo.User_NameEN, User_LastNameEN: radioUsers[0].userinfo.User_LastNameEN, config: radioConfig};
    if ((radioUserLines) && (radioUserLines.length > 0)) {
      radioProfile.lineUserId = radioUserLines[0].UserId;
    }
    resolve(radioProfile);
  });
}

const doCaseExpireAction = function(caseId, socket, newcaseStatusId, radioProfile, userProfile, lineCaseDetaileMsg, hospitalName){
  return new Promise(async (resolve, reject) => {
    const expiredStatus = await doCallCaseStatusByName('Expired');
    const targetCases = await db.cases.findAll({ attributes: excludeColumn, where: {id: caseId}});
    const action = 'quick';

    // Update Case Status
    await targetCases[0].setCasestatus(expiredStatus[0]);
    //KeepLog
    let fromStusId = targetCases[0].casestatusId;
    let systemId = 0;
    let newKeepLog = { caseId : caseId,	userId : systemId, from : fromStusId, to : newcaseStatusId, remark : 'Expire by Case Task on System Cron Job.'};
    doCaseChangeStatusKeepLog(newKeepLog);

    tasks.removeTaskByCaseId(caseId);
    log.info('caseId ' + caseId + ' was expired by schedule.');

    let refreshExpCase = {type: 'refresh', statusId: newcaseStatusId, caseId: caseId};
    await socket.sendMessage(refreshExpCase, radioProfile.username);
    // Notify Case Owner Feedback
    let msg = 'Your a new Case on ' + hospitalName + '. was expired by schedule';
    let notify = {type: 'notify', message: msg, statusId: expiredStatus[0].id, caseId: caseId, casestatusId: newcaseStatusId};
    await socket.sendMessage(notify, radioProfile.username);
    // Notify Case Radio
    msg = 'Your a new Case was expired by schedule';
    notify = {type: 'notify', message: msg, statusId: expiredStatus[0].id, caseId: caseId, casestatudId: newcaseStatusId};
    await socket.sendMessage(refreshExpCase, userProfile.username);
    await socket.sendMessage(notify, userProfile.username);

    // Chatbot message to Radio
    if ((radioProfile.lineUserId) && (radioProfile.lineUserId !== '')) {
      let lineCaseMsg = lineCaseDetaileMsg + 'หมดเวลาในช่วงรอตอบรับ หากคุณต้องการใช้บริการอื่นเชิญเลือกจากเมนูครับ';
      let menuQuickReply = lineApi.createBotMenu(lineCaseMsg, action, lineApi.mainMenu);
      await lineApi.pushConnect(radioProfile.lineUserId, menuQuickReply);
    }

    // Chatbot message to Owner Case
    if ((userProfile.lineUserId) && (userProfile.lineUserId !== '')) {
      let lineCaseMsg = lineCaseDetaileMsg + 'ได้หมดเวลาในช่วงรอการตอบรับจากรังสีแพทยแล้วครับ\nคุณสามารถใช้บริการอื่นจากเมนูครับ';
      let lineMsg = lineApi.createBotMenu(lineCaseMsg, action, lineApi.mainMenu);
      await lineApi.pushConnect(userProfile.lineUserId, lineMsg);
    }

    resolve(targetCases);
  });
}

const doCreatetaskAction = function(caseId, userProfile, radioProfile, triggerParam, baseCaseStatusId, lineCaseDetaileMsg){
  return new Promise(async function(resolve, reject) {
    const action = 'quick';
    let endTime = await tasks.doCreateNewTask(caseId, userProfile.username, triggerParam, radioProfile.username, userProfile.hospitalName, baseCaseStatusId, async (caseId, socket, endDateTime)=>{
      let nowcaseStatus = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
      if (nowcaseStatus[0].casestatusId === baseCaseStatusId) {
        await doCaseExpireAction(caseId, socket, baseCaseStatusId, radioProfile, userProfile, lineCaseDetaileMsg, userProfile.hospitalName);
      } else {
        log.info('caseId ' + caseId + ' was released by schedule.');
        tasks.removeTaskByCaseId(caseId);
      }
    });
    // Chatbot message to Radio
    if ((radioProfile.lineUserId) && (radioProfile.lineUserId !== '')) {
      let endDate = new Date(endTime);
      let endYY = endDate.getFullYear();
      let endMM = endDate.getMonth() + 1;
      if (endMM < 10){
         endMM = '0' + endMM;
      } else {
        endMM = '' + endMM;
      }
      let endDD = endDate.getDate();
      if (endDD < 10){
         endDD = '0' + endDD;
      } else {
        endDD = '' + endDD;
      }
      let endHH = endDate.getHours();
      if (endHH < 10){
         endHH = '0' + endHH;
      } else {
        endHH = '' + endHH;
      }
      let endMN = endDate.getMinutes();
      if (endMN < 10){
         endMN = '0' + endMN;
      } else {
        endMN = '' + endMN;
      }
      let endDateText = uti.parseStr('วันที่ %s-%s-%s เวลา %s:%s น. ', endYY, endMM, endDD, endHH, endMN);
      if (baseCaseStatusId == 1 ) {
        let lineCaseMsg = lineCaseDetaileMsg + 'เคสนี้จะหมดอายุภายใน ' + endDateText + '\nคุณสมารถตอบรับหรือปฏิเสธเคสนี้ได้โดยเลือกจากเมนูด้านล่างครับ';
        let acceptActionMenu =  [{id: 'x401', displayText: 'รับ', data: caseId}, {id: 'x402', displayText: 'ไม่รับ', data: caseId}];
        let bubbleMenu = lineApi.doCreateCaseAccBubbleReply(acceptActionMenu);
        //let menuQuickReply = lineApi.createBotMenu(lineCaseMsg, action, actionQuickReply);
        //await lineApi.pushConnect(radioProfile.lineUserId, menuQuickReply);
        await lineApi.pushConnect(radioProfile.lineUserId, bubbleMenu);
      } else if (baseCaseStatusId == 2 ) {
        let lineCaseMsg = lineCaseDetaileMsg  + 'ระบบฯ ได้ทำการตอบรับเคสให้คุณโดยอัตโนมัติตามที่คุณตั้งค่าโปรไฟล์ไว้เรียบร้อยแล้ว\nเคสนี้จะหมดอายุภายใน ' + endDateText + '\nหากคุณต้องการใช้บริการอื่นๆ เชิญเลือกจากเมนูด้านล่างครับ';
        let menuQuickReply = lineApi.createBotMenu(lineCaseMsg, action, lineApi.mainMenu);
        await lineApi.pushConnect(radioProfile.lineUserId, menuQuickReply);
        if ((userProfile.lineUserId) && (userProfile.lineUserId !== '')) {
          lineCaseMsg = lineCaseDetaileMsg  + 'ได้ถูกตอบรับโดยรังสีแพทย์เรียบร้อยแล้ว\nเคสนี้จะหมดอายุสำหรับส่งผลอ่านภายใน ' + endDateText + '\nหากคุณต้องการใช้บริการอื่นๆ เชิญเลือกจากเมนูด้านล่างครับ';
          let menuQuickReply = lineApi.createBotMenu(lineCaseMsg, action, lineApi.mainMenu);
          await lineApi.pushConnect(userProfile.lineUserId, menuQuickReply);
        }
      }
    }
    resolve(endTime);
  });
}

const doSaveScanpartAux = function(scanpartAuxData, userId){
  return new Promise(async function(resolve, reject) {
    ////let scanpartAuxData = {StudyDesc: newCase.Case_StudyDescription,ProtocolName: newCase.Case_ProtocolName,Scanparts: newCase.Case_ScanPart};
    const whereClous = {StudyDesc: scanpartAuxData.StudyDesc, ProtocolName: scanpartAuxData.ProtocolName};
    const scanPartAuxs = await db.scanpartauxs.findAll({ attributes: excludeColumn, where: whereClous});
    if (scanPartAuxs.length > 0) {
      let auxId = scanPartAuxs[0].id;
      let updateData = {Scanparts: scanpartAuxData.Scanparts};
      await db.scanpartauxs.update(updateData, { where: { id: auxId } });
      resolve(scanPartAuxs[0]);
    } else {
      let adAux = await db.scanpartauxs.create(scanpartAuxData);
      await db.scanpartauxs.update({userId: userId}, { where: { id: adAux.id } });
      resolve(adAux);
    }
  });
}

const doCaseChangeStatusKeepLog = function(data) {
  return new Promise(async function(resolve, reject) {
    let newKeepLog = { caseId : data.caseId,	userId : data.userId, from : data.from, to : data.to, remark : data.remark};
    let adLog = await db.radkeeplogs.create(newKeepLog);
    resolve(adLog);
  });
}

const doCollectRadioCurrentState = function(radioId, radioUsername, socket) {
  return new Promise(async function(resolve, reject) {
    const profiles = await db.userprofiles.findAll({attributes: ['Profile'], where: { userId: radioId } });
    const radioSocket = await socket.findUserSocket(radioUsername);
    let readyState = undefined;
    if ((profiles) && (profiles.length > 0)){
      readyState = profiles[0].Profile.readyState;
    } else {
      readyState = 0;
    }
    let screenState = undefined;
    if (radioSocket) {
      screenState = {online: 1, state: radioSocket.screenstate, minute: radioSocket.counterping};
    } else {
      screenState = {online: 0};
    }
    let currentState = {
      readyState: readyState,
      screenState: screenState
    }
    resolve(currentState);
  });
}

module.exports = (dbconn, monitor, casetask) => {
	db = dbconn;
	log = monitor;
  tasks = casetask;
  uti = require('../../lib/mod/util.js')(db, log);
  lineApi = require('../../lib/mod/lineapi.js')(db, log);
  return {
    casestatusFlowTable,
    msgNewCaseRadioDetailFormat,
    msgAccCaseRadioDetailPattern,
    msgAccCaseHospitalDetailPattern,
    msgRejCaseHospitalDetailPattern,
    msgSucCaseHospitalDetailPattern,

    doCanNextStatus,
    doSearchRadioForHospital,
    doGenNewCaseOptions,
    doCallCaseStatusByName,
    doGetCaseDescription,
    doLoadUserProfile,
    doLoadRadioProfile,
    doCaseExpireAction,
    doCreatetaskAction,
    doSaveScanpartAux,
    doCaseChangeStatusKeepLog,
    doCollectRadioCurrentState
  }
}
