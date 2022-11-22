const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, Task, Warning, log, auth, common, uti;

const onNewCaseEvent = function(caseId, triggerParam){
  return new Promise(async function(resolve, reject) {
    const caseInclude = [ {model: db.patients, attributes: ['Patient_NameEN', 'Patient_LastNameEN', 'Patient_NameTH', 'Patient_LastNameTH']}, {model: db.hospitals, attributes: ['Hos_Name', 'Hos_Code']}];
    const targetCases = await db.cases.findAll({include: caseInclude, where: {id: caseId}});
    const newCase = targetCases[0];
    const userId = newCase.userId;
    const hospitalId = newCase.hospitalId;
    const radioId = newCase.Case_RadiologistId;
    const hospitalName = newCase.hospital.Hos_Name;
    const hospitalCode = newCase.hospital.Hos_Code;
    const patientNameEN = newCase.patient.Patient_NameEN + ' ' + newCase.patient.Patient_LastNameEN;
    const patientNameTH = newCase.patient.Patient_NameTH + ' ' + newCase.patient.Patient_LastNameTH;

    const caseCreateAt = newCase.updatedAt;

    let studyDescription = '';
    if ((newCase.Case_StudyDescription) && (newCase.Case_StudyDescription !== '')) {
      studyDescription = newCase.Case_StudyDescription;
    } else if ((newCase.Case_ProtocolName) && (newCase.Case_ProtocolName !== '')) {
      studyDescription = newCase.Case_ProtocolName;
    } else {
      studyDescription = 'N/A';
    }

    const caseMsgData = {hospitalName, hospitalCode, patientNameEN, patientNameTH, caseCreateAt, studyDescription};

    let radioProfile = await common.doLoadRadioProfile(radioId);
    let radioNameTH = radioProfile.User_NameTH + ' ' + radioProfile.User_LastNameTH;
    let userProfile = await common.doLoadUserProfile(userId);
    let lineCaseDetaileMsg = uti.fmtStr(common.msgNewCaseRadioDetailFormat, userProfile.hospitalName, patientNameEN, newCase.Case_StudyDescription, newCase.Case_ProtocolName, newCase.Case_BodyPart, newCase.Case_Modality);
    let caseTriggerParam = triggerParam;
    if (!caseTriggerParam) {
      let urgents = await uti.doLoadCaseUrgent(newCase.sumaseId);
      caseTriggerParam = urgents[0].UGType_AcceptStep;
    }

    let baseCaseStatusId = newCase.casestatusId;
    let newTransactionId = uti.doCreateTranctionId();

    let newTask = await Task.doCreateNewTaskCase(caseId, userProfile.username, caseTriggerParam, radioProfile.username, userProfile.hospitalName, baseCaseStatusId, newTransactionId, async (caseId, socket, endDateTime)=>{
      log.info('But No Idea to do this action, please look on next time update version.')
    });
    resolve(newTask);
  });
}

//List API
app.post('/list', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          Task.getTasks().then((tasks)=>{
            res.status(200).send({Result: "OK", Records: tasks});
          });
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

app.post('/select/(:caseId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let caseId = req.params.caseId;
          let thatCase = await Task.selectTaskByCaseId(caseId);
          //log.info('ThatTask=>' + JSON.stringify(thatCase));
          res.status(200).send({status: {code: 200}, Records: [thatCase]});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: 'expired'});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

app.post('/filter/radio/(:radioId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let radioId = req.params.radioId;
          let radioUsername = req.body.username;
          let theseCases = await Task.filterTaskByRadioUsername(radioUsername);
          //log.info('ThatTask=>' + JSON.stringify(thatCase));
          res.status(200).send({status: {code: 200}, Records: theseCases});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: 'expired'});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

app.post('/filter/user/(:userId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let userId = req.params.userId;
          let username = req.body.username;
          let theseCases = await Task.filterTaskByUsername(username);
          //log.info('ThatTask=>' + JSON.stringify(theseCases));
          res.status(200).send({status: {code: 200}, Records: theseCases});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: 'expired'});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

app.get('/task/list', (req, res) => {
  Task.getTasks().then((tasks)=>{
    res.status(200).send({Result: "OK", Records: tasks});
  });
});

app.get('/task/remove/(:caseId)', (req, res) => {
  let caseId = req.params.caseId;
  Task.removeTaskByCaseId(caseId).then((tasks)=>{
    res.status(200).send({status: "OK", result: tasks});
  });
});

app.get('/find/transaction/(:transactionId)', (req, res) => {
  let transactionId = req.params.transactionId;
  Task.filterTaskByTransactionId(transactionId).then(async(tasks)=>{
    if (tasks.length > 0) {
      let radioUsername = tasks[0].radioUsername;
      let radioUserData = await auth.doExistUser(radioUsername);
      if ((radioUserData) && (radioUserData.length > 0)) {
        let radioNewToken = auth.doEncodeToken(radioUsername);
        let caseId = tasks[0].caseId;
        let targetCases = await db.cases.findAll({ attributes: ['id', 'patientId', 'hospitalId', 'casestatusId', 'Case_Modality', 'Case_StudyDescription', 'Case_ProtocolName'], where: {id: caseId}});
        let caseItem = targetCases[0];
        let caseData = {caseId: caseItem.id, patientId: caseItem.patientId, hospitalId: caseItem.hospitalId};
        caseData.Modality = caseItem.Case_Modality;
        caseData.StudyDescription = caseItem.Case_StudyDescription;
        caseData.ProtocolName = caseItem.Case_ProtocolName;
        caseData.statusId = caseItem.casestatusId;
        res.status(200).send({Result: "OK", Records: tasks, token: radioNewToken, radioUserData: radioUserData[0], caseData: caseData});
      } else {
        res.status(200).send({Result: "OK"});
      }
    } else {
      res.status(200).send({Result: "OK"});
    }
  });
});

app.get('/warning/list', (req, res) => {
  Warning.getTasks().then((tasks)=>{
    res.status(200).send({Result: "OK", Records: tasks});
  });
});

app.get('/task/select/(:caseId)', (req, res) => {
  let caseId = req.params.caseId;
  Task.selectTaskByCaseId(caseId).then((thatCase)=>{
    //log.info('ThatTask=>' + JSON.stringify(thatCase));
    res.status(200).send({status: {code: 200}, Records: [thatCase]});
  });
});

app.post('/task/new/(:caseId)', (req, res) => {
  let caseId = req.params.caseId;
  let triggerParam = req.body.triggerParam;
  Task.selectTaskByCaseId(caseId).then(async(thatCase)=>{
    if (!thatCase) {
      let newTask = await onNewCaseEvent(caseId, triggerParam);
      res.status(200).send({status: {code: 200}, Records: [newCase]});
    } else {
      res.status(200).send({status: {code: 200}, Records: [thatCase]});
    }
  });
});

module.exports = ( taskCase, taskWarning, dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('../db/rest/auth.js')(db, log);
  common = require('../db/rest/commonlib.js')(db, log);
  uti = require('./mod/util.js')(db, log);
  Task = taskCase;
  Warning = taskWarning;
  return app;
}
