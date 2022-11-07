const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('request-promise');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

var db, log, auth, lineApi, uti, statusControl, common, socket, Task, Warning, Voip;

const doChangeCaseStatusMany = function(radioId, newStatusId, remark, triggerAt){
  return new Promise(async function(resolve, reject) {
    let allTargetCases = await db.cases.findAll({ attributes: ['id'], where: {casestatusId: 1, Case_RadiologistId: radioId}});
    let changeReses = [];
    const promiseList = new Promise(async function(resolve2, reject2) {
      await allTargetCases.forEach(async (item, i) => {
        let changeCaseRes = await statusControl.doChangeCaseStatus(1, newStatusId, item.id, radioId);
        let newKeepLog = { caseId : item.id,	userId : radioId, from : 1, to : newStatusId, remark : remark};
        if (triggerAt) {
          newKeepLog.triggerAt = triggerAt;
        }
        await common.doCaseChangeStatusKeepLog(newKeepLog);
        await Voip.removeTaskByCaseId(item.id);
        changeReses.push(changeCaseRes);
      });
      setTimeout(()=>{
        resolve2(changeReses);
      }, 1000);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

app.post('/response', async function(req, res) {
  log.info('voip response => ' + JSON.stringify(req.body));

  /*
  let forwardCmdFmt = "curl -k -X POST -H \"Content-Type: application/json\" https://202.28.68.28:8443/api/voipapp/response  -d  '%s'";
  let forwardCmd = uti.fmtStr(forwardCmdFmt, JSON.stringify(req.body));
  log.info('forwardCmd => ' + forwardCmd);
  let forwardRes = await uti.runcommand(forwardCmd);
  log.info('forwardRes => ' + JSON.stringify(forwardRes));
  res.json({status: {code: 200}, ok: 'me'});
  curl -X POST -k -H 'Content-Type: application/json' https://radconnext.info/api/voipapp/response -d '{\"inc_id\": \"4422\", \"response_key\": \"1\", \"transactionId\": \"20221030\"}'
  */
  let changeRes = {};
  let yourResponse = req.body;
  log.info('yourResponse=> ' + JSON.stringify(yourResponse));
  let caseId = req.body.inc_id;
  log.info('yourCaseId => ' + caseId);
  let key = req.body.response_key;
  log.info('yourKey => ' + key);
  let voipTasks = await Voip.getTasks();
  log.info('voipTasks => ' + JSON.stringify(voipTasks));
  let voip = await Voip.selectTaskByCaseId(caseId);
  log.info('yourVoip => ' + JSON.stringify(voip));
  if ((voip) && (voip.caseId)){
    voip.responseKEYs.push(key);
    let action = undefined;
    let targetCases = await db.cases.findAll({ attributes: ['Case_RadiologistId', 'casestatusId', 'urgenttypeId'], where: {id: caseId}});
    let urgents = await db.urgenttypes.findAll({ attributes: ['UGType_AcceptStep', 'UGType_WorkingStep'], where: {id: targetCases[0].urgenttypeId}});
    let radioId = targetCases[0].Case_RadiologistId;
    //let userinfos = await db.userinfoes.findAll({ attributes: ['User_NameTH', 'User_LaseNameTH'], where: {userId: radioId}});
    let userProfile = await common.doLoadRadioProfile(radioId);
    let radioNameTH = userProfile.User_NameTH + ' ' + userProfile.User_LastNameTH;

    let triggerParam = JSON.parse(urgents[0].UGType_WorkingStep);
    let dd = Number(triggerParam.dd);
    let hh = Number(triggerParam.hh);
    let mn = Number(triggerParam.mn);

    const offset = 7;
    let shiftMinut = (dd * 1440) + (hh * 60) + mn;
    let d = new Date();
    let utc = d.getTime();
    d = new Date(utc + (offset * 60 * 60 * 1000) + (shiftMinut * 60 *1000));
    let yymmddhhmnss = uti.doFormateDateTime(d);
    let yymmddhhmnText = uti.fmtStr('%s-%s-%s %s.%s', yymmddhhmnss.DD, yymmddhhmnss.MM, yymmddhhmnss.YY, yymmddhhmnss.HH, yymmddhhmnss.MN);
    let acceptRemark = uti.fmtStr('รังสีแพทย์ %s ตอบรับเคสผ่านทาง VOIP กำหนดส่งผลอ่าน ภายใน %s', radioNameTH, yymmddhhmnText);
    let rejectRemark = 'รังสีแพทย์ ' + radioNameTH + ' ปฏิเสธเคสโดย VOIP';
    if (voip.responseKEYs[0] == 1){
      //Accept Case by VoIP
      changeRes = await statusControl.doChangeCaseStatus(1, 2, caseId, radioId);
      let newKeepLog = { caseId : caseId,	userId : targetCases[0].Case_RadiologistId, from : 1, to : 2, remark : acceptRemark, triggerAt: yymmddhhmnss};
      await common.doCaseChangeStatusKeepLog(newKeepLog);
      await Voip.removeTaskByCaseId(caseId);
    } else if (voip.responseKEYs[0] == 3) {
      //Reject Case by VoIP
      changeRes = await statusControl.doChangeCaseStatus(1, 3, caseId, radioId);
      let newKeepLog = { caseId : caseId,	userId : targetCases[0].Case_RadiologistId, from : 1, to : 3, remark : rejectRemark};
      await common.doCaseChangeStatusKeepLog(newKeepLog);
      await Voip.removeTaskByCaseId(caseId);
    } else if (voip.responseKEYs[0] == 4) {
      changeRes = await doChangeCaseStatusMany(radioId, 2, acceptRemark, yymmddhhmnss);
    } else if (voip.responseKEYs[0] == 6) {
      changeRes = await doChangeCaseStatusMany(radioId, 3, rejectRemark);
    }
  }
  res.json({status: {code: 200}, voip: {response: {key: key}}, change: {result: changeRes}});
});

app.post('/callradio', async function(req, res) {
  log.info('call params => ' + JSON.stringify(req.body));
  let caseId = req.body.caseId;
  let hospitalCode = req.body.hospitalCode;
  let urgentCode = req.body.urgentCode;
  let msisdn = req.body.msisdn;
  let voiceTransactionId = uti.doCreateTranctionId();
  let retrytime = req.body.retrytime;
  let retrysecond = req.body.retrysecond;
  const voiceCallURLFmt = 'https://202.28.68.6/callradio/callradio.php?transactionid=%s&caseid=%s&urgentcode=%s&hospitalcode=%s&msisdn=%s&retrytime=%s&retrysecond=%s';
  let voiceCallURL = uti.fmtStr(voiceCallURLFmt, voiceTransactionId, caseId, urgentCode, hospitalCode, msisdn, retrytime, retrysecond);
  let voiceData = 'caseid=' + caseId + '&transaction_id=' + voiceTransactionId +'&phone_number=' + msisdn + '&hosp_code=' + hospitalCode + '&urgent_type=' + urgentCode + '&retrytime=' + retrytime + '&retrysecond=' + retrysecond;
  let rqParams = {
    method: 'GET',
    uri: voiceCallURL,
    body: voiceData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  let voiceRes = await uti.voipRequest(rqParams)

  log.info('voiceRes => ' + JSON.stringify(voiceRes));
  res.json({status: {code: 200}, result: voiceRes});
});

app.post('/calldeposition', async function(req, res) {
  let transactionId = req.body.transactionId;
  let msisdn = req.body.msisdn;
  const voiceCallURLFmt = 'https://202.28.68.6/callradio/get_last_diposition.php?transactionid=%s&msisdn=%s';
  let reqCallURL = uti.fmtStr(voiceCallURLFmt, transactionId, msisdn);
  let callData = 'transactionid='+ transactionId + '&msisdn=' + msisdn;
  let rqParams = {
    method: 'GET',
    uri: reqCallURL,
    body: callData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  let callRes = await uti.voipRequest(rqParams);
  res.json({status: {code: 200}, result: callRes});
});

app.post('/calldeletecallfile', async function(req, res) {
  let callFile = req.body.callFile;
  let callData = 'callFile=' + callFile;
  const reqCallURL = 'https://202.28.68.6/callradio/deletecallfile.php?' + callData;
  let rqParams = {
    method: 'GET',
    uri: reqCallURL,
    body: callData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  let callRes = await uti.voipRequest(rqParams);
  res.json({status: {code: 200}, result: callRes});
});

app.get('/task/list', async function(req, res) {
  let tasks = await Voip.getTasks();
  res.json({status: {code: 200}, tasks: tasks});
});

app.get('/get/deposition', async function(req, res) {
  let transactionId = req.query.transactionId;
  let msisdn = req.query.msisdn;
  let result = await common.doRequestCallDeposition(transactionId, msisdn);
  res.json({status: {code: 200}, result: result});
});

module.exports = ( taskCase, warningTask, voipTask, dbconn, monitor, webSocket ) => {
  db = dbconn;
  log = monitor;
  socket = webSocket;
  Task = taskCase;
  Warning = warningTask;
  Voip = voipTask;
  auth = require('../db/rest/auth.js')(db, log);
  lineApi = require('./mod/lineapi.js')(db, log);
  uti = require('./mod/util.js')(db, log);
  statusControl = require('../db/rest/statuslib.js')(db, log, Task, Warning, Voip, socket);
  common = require('../db/rest/commonlib.js')(db, log);
  return app;
}
