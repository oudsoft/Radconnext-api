const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, Response, log, auth, uti, tasks, warnings, voips, socket, statusControl, common;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

//List API
app.post('/list', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const caseId = req.body.caseId;
          const caseres = await Response.findAll({attributes: excludeColumn, where: {caseId: caseId}});
          res.json({ status: {code: 200}, Records: caseres});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
				res.json({ status: {code: 210}, token: {expired: true}});
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

//select API
app.post('/select/(:caseId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const caseId = req.params.caseId;
          const caseres = await Response.findAll({ where: {caseId: caseId}});
          res.json({ status: {code: 200}, Record: caseres});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
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

//insert api
app.post('/add', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){

        let reqData = req.body;
        let newResponse = reqData.data;
        let caseId = reqData.caseId;
        let userId = reqData.userId;
        let radioNameTH = reqData.radioNameTH;
        let reporttype = reqData.reporttype;

        let adResponse = await db.caseresponses.create(newResponse);
        await db.caseresponses.update({caseId: caseId, userId: userId}, { where: { id: adResponse.id } });

        res.json({status: {code: 200}, result: {responseId: adResponse.id}});

        let remark = 'รังสีแพทย์ ' + radioNameTH + ' บันทึกผลอ่านสำเร็จ [api-caseresponse-add]';

        let reportLog = [{action: 'new', by: userId, at: new Date(), on: 'caseresponse-add'}];
        let newCaseReport = {Remark: remark, Report_Type: reporttype, Status: 'new', Log: reportLog};
        let adReport = await db.casereports.create(newCaseReport);
        await db.casereports.update({caseId: caseId, userId: userId, caseresponseId: adResponse.id}, { where: { id: adReport.id } });

        const targetCases = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
        const nowCaseStatus = targetCases[0].casestatusId;
        if (nowCaseStatus == 8) {
          const next = 9;
          const caseStatusChange = { casestatusId: next/*, Case_DESC: remark*/};
          await db.cases.update(caseStatusChange, { where: { id: caseId } });
          const from = 8;
          let newKeepLog = { caseId : caseId,	userId : userId, from : from, to : next, remark : remark};
          await common.doCaseChangeStatusKeepLog(newKeepLog);
        }

      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
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

//update api
app.post('/update', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let upResponse = req.body.data;
        await Response.update(upResponse, { where: { id: req.body.responseId } });
        res.json({status: {code: 200}, result: {responseId: req.body.responseId}});
        let userId = ur[0].id;
        let newReportLog = {action: 'update', by: userId, at: new Date(), on: 'caseresponse-update'};
        let casereports = await db.casereports.findAll({attributes: ['id', 'Log'], where: {caseresponseId: req.body.responseId}});
        if (casereports.length > 0) {
          let oldLog = casereports[0].Log;
          oldLog.push(newReportLog);
          await db.casereports.update({Log: oldLog}, { where: { id: casereports[0].id } });
        }

        let caseId = req.body.caseId;
        const targetCases = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
        const nowCaseStatus = targetCases[0].casestatusId;
        if (nowCaseStatus == 8) {
          const next = 9;
          let remark = 'รังสีแพทย์ ' + radioNameTH + ' บันทึกผลอ่านสำเร็จ [api-caseresponse-update]';
          const caseStatusChange = { casestatusId: next/*, Case_DESC: remark*/};
          await db.cases.update(caseStatusChange, { where: { id: caseId } });
          const from = 8;
          let radioNameTH = reqData.radioNameTH;
          let newKeepLog = { caseId : caseId,	userId : userId, from : from, to : next, remark : remark};
          await common.doCaseChangeStatusKeepLog(newKeepLog);
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
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

app.post('/save', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let userId = ur[0].id;
        let caseresponseId = req.body.responseId;
        if (caseresponseId) {
          //use update
          let updateData = req.body.data;
          await Response.update(updateData, { where: { id: caseresponseId} });

          res.json({status: {code: 200}, result: {responseId: req.body.responseId}});

          let caseId = req.body.caseId;
          let userId = req.body.userId;
          let radioNameTH = req.body.radioNameTH;
          let remark = 'รังสีแพทย์ ' + radioNameTH + ' บันทึกผลอ่านสำเร็จ [api-caseresponse-save-update]';
          let newReportLog = {action: 'update', by: userId, at: new Date(), on: 'caseresponse-save-update'};
          let casereports = await db.casereports.findAll({attributes: ['id', 'Log'], where: {caseresponseId: caseresponseId}});
          if (casereports.length > 0) {
            let oldLog = casereports[0].Log;
            oldLog.push(newReportLog);
            await db.casereports.update({Log: oldLog}, { where: { id: casereports[0].id } });
          } else {
            let reporttype = reqData.reporttype;
            if (!reporttype) {
              reporttype = 'normal';
            }
            let reportLog = [{action: 'new', by: userId, at: new Date(), on: 'caseresponse-save-update'}];
            let newCaseReport = {Remark: remark, Report_Type: reporttype, Status: 'update', Log: reportLog};
            let adReport = await db.casereports.create(newCaseReport);
            await db.casereports.update({caseId: caseId, userId: userId, caseresponseId: caseresponseId}, { where: { id: adReport.id } });
          }
          let targetCases = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
          let nowCaseStatus = targetCases[0].casestatusId;
          //let remark = 'รังสีแพทย์ ' + radioNameTH + ' บันทึกผลอ่านสำเร็จ [api-caseresponse-save-update]';
          if (nowCaseStatus == 8) {
            let next = 9;
            let caseStatusChange = { casestatusId: next/*, Case_DESC: remark*/};
            await db.cases.update(caseStatusChange, { where: { id: caseId } });
            let newKeepLog = { caseId : caseId,	userId : userId, from : nowCaseStatus, to : next, remark : remark};
            await db.radkeeplogs.create(newKeepLog);
          } else {
            let newKeepLog = { caseId : caseId,	userId : userId, from : nowCaseStatus, to : nowCaseStatus, remark : remark};
            await db.radkeeplogs.create(newKeepLog);
          }
        } else {
          //use add
          let reqData = req.body;
          let newResponse = reqData.data;
          let caseId = reqData.caseId;
          let userId = reqData.userId;
          let radioNameTH = reqData.radioNameTH;
          let reporttype = reqData.reporttype;

          let adResponse = await Response.create(newResponse);
          await db.caseresponses.update({caseId: caseId, userId: userId}, { where: { id: adResponse.id } });

          res.json({status: {code: 200}, result: {responseId: adResponse.id}});

          let remark = 'รังสีแพทย์ ' + radioNameTH + ' บันทึกผลอ่านใหม่สำเร็จ [api-caseresponse-save-add]';
          let reportLog = [{action: 'new', by: userId, at: new Date(), on: 'caseresponse-save-add'}];
          let newCaseReport = {Remark: remark, Report_Type: reporttype, Status: 'new', Log: reportLog};
          let adReport = await db.casereports.create(newCaseReport);
          await db.casereports.update({caseId: caseId, userId: userId, caseresponseId: adResponse.id}, { where: { id: adReport.id } });

          const targetCases = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
          const nowCaseStatus = targetCases[0].casestatusId;
          //log.info('nowCaseStatus on first save response => ' + nowCaseStatus);
          if (nowCaseStatus == 8) {
            const next = 9;
            const caseStatusChange = { casestatusId: next/*, Case_DESC: remark*/};
            await db.cases.update(caseStatusChange, { where: { id: caseId } });
            let newKeepLog = { caseId : caseId,	userId : userId, from : nowCaseStatus, to : next, remark : remark};
            await db.radkeeplogs.create(newKeepLog);
          }
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
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

//delete api
app.post('/delete', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        await Response.destroy({ where: { id: req.body.id } });
        res.json({status: {code: 200}});
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
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

module.exports = ( dbconn, caseTask, warningTask, voipTask, monitor, websocket ) => {
  db = dbconn;
  tasks = caseTask;
  warnings = warningTask;
  log = monitor;
  voips = voipTask;
  socket = websocket;
  auth = require('./auth.js')(db, log);
  uti = require('../../lib/mod/util.js')(db, log);
  common = require('./commonlib.js')(db, log);
  statusControl = require('./statuslib.js')(db, log, tasks, warnings, voips, socket);
  Response = db.caseresponses;
  return app;
}
