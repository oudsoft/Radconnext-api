const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, tasks, Case, log, auth, socket, lineApi, uti, common, statusControl;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };


//List API
app.post('/list', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const hospitalId = req.query.hospitalId;
          const limit = req.query.jtPageSize;
          const startAt = req.query.jtStartIndex;
          //const count = await Case.count();
          const cases = await Case.findAll({offset: startAt, limit: limit, attributes: excludeColumn, where: {hospitalId: hospitalId}});
          //res.json({status: {code: 200}, types: types});
          //log.info('Result=> ' + JSON.stringify(types));
          res.json({Result: "OK", Records: cases, TotalRecordCount: cases.length});
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

//Filter By Hospital API
app.post('/filter/hospital', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        //log.info('ur[0]=> ' + JSON.stringify(ur[0]));
        try {
          const hospitalId = req.body.hospitalId;
          const userId = req.body.userId;
          const statusId = req.body.statusId;
          const filterDate = req.body.filterDate;
          let whereClous;
          if (filterDate) {
            let startDate = new Date(filterDate.from);
            if (ur[0].usertypeId !== 5) {
              whereClous = {hospitalId: hospitalId, userId: userId, casestatusId: { [db.Op.in]: statusId }, createdAt: { [db.Op.gte]: startDate}};
            } else {
              whereClous = {hospitalId: hospitalId, Case_RefferalId: userId, casestatusId: { [db.Op.in]: statusId }, createdAt: { [db.Op.gte]: startDate}};
            }
          } else {
            if (ur[0].usertypeId !== 5) {
              whereClous = {hospitalId: hospitalId, userId: userId, casestatusId: { [db.Op.in]: statusId }};
            } else {
              whereClous = {hospitalId: hospitalId, Case_RefferalId: userId, casestatusId: { [db.Op.in]: statusId }};
            }
          }
          const caseInclude = [{model: db.patients, attributes: excludeColumn}, {model: db.casestatuses, attributes: ['id', 'CS_Name_EN']}, {model: db.urgenttypes, attributes: ['id', 'UGType', 'UGType_Name']}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
          const orderby = [['id', 'DESC']];
          const cases = await Case.findAll({include: caseInclude, where: whereClous, order: orderby});
          const casesFormat = [];
          const promiseList = new Promise(async function(resolve, reject) {
            for (let i=0; i<cases.length; i++) {
              let item = cases[i];
              const radUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RadiologistId}});
              const rades = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: radUser[0].userinfoId}});
              const Radiologist = {id: item.Case_RadiologistId, User_NameTH: rades[0].User_NameTH, User_LastNameTH: rades[0].User_LastNameTH};
              const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
              const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
              const Refferal = {id: item.Case_RefferalId, User_NameTH: refes[0].User_NameTH, User_LastNameTH: refes[0].User_LastNameTH};
              casesFormat.push({case: item, Radiologist: Radiologist, Refferal: Refferal});
            }
            setTimeout(()=> {
              resolve(casesFormat);
            },500);
          });
          Promise.all([promiseList]).then((ob)=> {
            res.json({status: {code: 200}, Records: ob[0]});
          }).catch((err)=>{
            log.error(error);
            res.json({status: {code: 500}, error: err});
          });
        } catch(error) {
          log.error('Error=>' + JSON.stringify(err));
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

//Filter By radio API
app.post('/filter/radio', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const statusId = req.body.statusId;
          const radioId = req.body.userId;
          const caseInclude = [{model: db.hospitals, attributes: ['id', 'Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.casestatuses, attributes: ['id', 'CS_Name_EN']}, {model: db.urgenttypes, attributes: ['id', 'UGType', 'UGType_Name']}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
          const whereClous = {Case_RadiologistId: radioId, casestatusId: { [db.Op.in]: statusId } };
          const orderby = [['id', 'DESC']];
          const radioCases = await Case.findAll({include: caseInclude, where: whereClous, order: orderby});
          /*
          const promiseListRef = new Promise(async function(resolveRef, rejectRef) {
            const finalCases = [];
            await radioCases.forEach(async (item, i) => {
              const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
              const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
              const ownerUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.userId}});
              const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
              finalCases.push({case: item, reff: refes[0], owner: owners[0]});
            });
            setTimeout(()=> {
              resolveRef(finalCases);
            },1500);
          });
          Promise.all([promiseListRef]).then((ob)=> {
            res.json({status: {code: 200}, Records: ob[0]});
          });
          */
          res.json({status: {code: 200}, Records: radioCases});
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

//Filter By patient API
app.post('/filter/patient', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const statusId = req.body.statusId;
          const patientId = req.body.patientId;
          const hospitalId = req.body.hospitalId;
          const currentCaseId = req.body.currentCaseId;
          const limit = req.body.limit;

          const caseInclude = [{model: db.caseresponses, attributes: ['id', 'Response_Text']}];
          const whereClous = {patientId: patientId, hospitalId: hospitalId, casestatusId: { [db.Op.in]: statusId}, id: { [db.Op.ne]: currentCaseId} };
          const orderby = [['id', 'DESC']];
          let query = undefined;
          if ((limit) && (limit > 0)) {
            query = {limit: limit, attributes: ['id', 'createdAt', 'Case_BodyPart', 'Case_OrthancStudyID', 'Case_StudyInstanceUID', 'Case_PatientHRLink'], include: caseInclude, where: whereClous, order: orderby};
          } else {
            query = {attributes: ['id', 'createdAt', 'Case_BodyPart', 'Case_OrthancStudyID', 'Case_StudyInstanceUID', 'Case_PatientHRLink'], include: caseInclude, where: whereClous, order: orderby};
          }
          const patientCases = await Case.findAll(query);
          res.json({status: {code: 200}, Records: patientCases});
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

//Select API
app.post('/select/(:caseId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const caseId = req.params.caseId;
          const caseInclude = [{model: db.hospitals, attributes: ['Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.casestatuses, attributes: ['id', 'CS_Name_EN']}, {model: db.urgenttypes, attributes: ['id', 'UGType', 'UGType_Name']}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
          const cases = await Case.findAll({include: caseInclude, where: {id: caseId}});
          const casesFormat = [];
          const promiseList = new Promise(async function(resolve, reject) {
            cases.forEach(async (item, i) => {
              const radUser = await db.users.findAll({ attributes: ['username', 'userinfoId'], where: {id: item.Case_RadiologistId}});
              const rades = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: radUser[0].userinfoId}});
              const radioData = {id: rades[0].id, User_NameTH: rades[0].User_NameTH, User_LastNameTH: rades[0].User_LastNameTH, username: radUser[0].username};
              const refUser = await db.users.findAll({ attributes: ['username', 'userinfoId'], where: {id: item.Case_RefferalId}});
              const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
              const referData = {id: refes[0].id, User_NameTH: refes[0].User_NameTH, User_LastNameTH: refes[0].User_LastNameTH, username: refUser[0].username};
              const ownerUser = await db.users.findAll({ attributes: ['username', 'userinfoId'], where: {id: item.userId}});
              const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
              const ownerData = {id: owners[0].id, User_NameTH: owners[0].User_NameTH, User_LastNameTH: owners[0].User_LastNameTH, username: ownerUser[0].username};
              casesFormat.push({case: item, Radiologist: radioData, Refferal: referData, Owner: ownerData});
            });
            setTimeout(()=> {
              resolve(casesFormat);
            },500);
          });
          Promise.all([promiseList]).then((ob)=> {
            res.json({status: {code: 200}, Records: ob[0]});
          }).catch((err)=>{
            reject(err);
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

//update status
app.post('/status/(:caseId)', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const caseId = req.params.caseId;
        const reqCaseStatusId = req.body.casestatusId;
        const remark = req.body.caseDescription;
        //attributes = 'casestatusId'
        const targetCases = await Case.findAll({ attributes: ['id', 'casestatusId', 'userId'], where: {id: caseId}});

        const currentStatus = targetCases[0].casestatusId;
        const userId = targetCases[0].userId;

        let changeResult = await statusControl.doChangeCaseStatus(currentStatus, reqCaseStatusId, caseId, userId, remark)
        /*******


        *******/

        if (changeResult.change.status == true) {
          res.json({status: {code: 200}, actions: changeResult.change.actiohs});
        } else {
          res.json({status: {code: 203}, actions: []});
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

//Search By radio API
app.post('/search/radio', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const raduserId = req.body.userId;
          const statusId = req.body.condition.statusId;
          const hospitalId = req.body.condition.hospitalId;
          const key = req.body.condition.key;
          const value = req.body.condition.value;
          const caseInclude = [{model: db.hospitals, attributes: ['Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.casestatuses, attributes: ['id', 'CS_Name_EN']}, {model: db.urgenttypes, attributes: ['id', 'UGType', 'UGType_Name']}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
          const whereClous = {hospitalId: hospitalId, Case_RadiologistId: raduserId, casestatusId: { [db.Op.in]: statusId }};
          const cases = await Case.findAll({include: caseInclude, where: whereClous});
          let caseResults = [];
          const promiseList = new Promise(async function(resolve, reject) {
            cases.forEach(async (item, i) => {
              if (key === 'PatientName') {
                if (value.indexOf('*') == 0) {
                  let searchVal = value.substring(1);
                  if (item.patient.Patient_NameEN.indexOf(searchVal) >= 0) {
                    const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
                    const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
                    const ownerUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.userId}});
                    const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
                    caseResults.push({case: item, reff: refes[0], owner: owners[0]});
                  }
                } else if (value.indexOf('*') == (value.length-1)) {
                  let searchVal = value.substring(0, (value.length-1));
                  if (item.patient.Patient_NameEN.indexOf(searchVal) >= 0) {
                    const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
                    const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
                    const ownerUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.userId}});
                    const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
                    caseResults.push({case: item, reff: refes[0], owner: owners[0]});
                  }
                } else {
                  if (item.patient.Patient_NameEN === value) {
                    const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
                    const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
                    const ownerUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.userId}});
                    const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
                    caseResults.push({case: item, reff: refes[0], owner: owners[0]});
                  }
                }
              } else if (key === 'PatientHN') {
                if (item.patient.Patient_HN === value) {
                  const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
                  const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
                  const ownerUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.userId}});
                  const owners = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: ownerUser[0].userinfoId}});
                  caseResults.push({case: item, reff: refes[0], owner: owners[0]});
                }
              }
            });
            setTimeout(()=> {
              resolve(caseResults);
            },500);
          });
          Promise.all([promiseList]).then((ob)=> {
            res.json({status: {code: 200}, Records: ob[0]});
          }).catch((err)=>{
            reject(err);
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

//add insert API
app.post('/add', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        common.doCallCaseStatusByName('New').then(async (newcaseStatus) => {
          const newcaseStatusId = newcaseStatus[0].id;
          const newCase = req.body.data;
          const userId = req.body.userId;
          const hospitalId = req.body.hospitalId;
          const patientId = req.body.patientId;
          const urgenttypeId = req.body.urgenttypeId;
          const cliamerightId = req.body.cliamerightId;
          const setupCaseTo = { hospitalId: hospitalId, patientId: patientId, userId: userId, cliamerightId: cliamerightId, urgenttypeId: urgenttypeId};

          //Insert New Case
          const adCase = await Case.create(newCase);
          await Case.update(setupCaseTo, { where: { id: adCase.id } });
          await adCase.setCasestatus(newcaseStatus[0]);

          const optionScanPartSave = req.body.option.scanpart.save;
          if (optionScanPartSave == 1){
            let scanpartAuxData = {StudyDesc: newCase.Case_StudyDescription, ProtocolName: newCase.Case_ProtocolName,Scanparts: newCase.Case_ScanPart};
            let scanpartAux = await common.doSaveScanpartAux(scanpartAuxData, userId);
          }

          await statusControl.onNewCaseEvent(adCase.id);

          res.json({Result: "OK", status: {code: 200}, Record: adCase});
        });
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

//update API
app.post('/update', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let updateCase = req.body.data;
        await Case.update(updateCase, { where: { id: req.body.id } });
        let setupCaseTo = { cliamerightId: req.body.cliamerightId, urgenttypeId: req.body.urgenttypeId};
        await Case.update(setupCaseTo, { where: { id: req.body.id } });
        res.json({Result: "OK", status: {code: 200}});
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

//delete API
app.post('/delete', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        /* casestatusId = 7 ?????????????????????????????? */
        /* ????????????????????????????????????????????????????????? task ??????????????? task ???????????? */
        /* ????????? urgent ????????????????????? custom ??????????????? urgent ???????????? */
        let targetCaseId = req.body.id;
        const deleteCases = await Case.findAll({attributes: ['casestatusId'], include: {model: db.urgenttypes, attributes: ['id', 'UGType']}, where: {id: targetCaseId}});
        log.info('deleteCases=>' + JSON.stringify(deleteCases));
        if ((deleteCases[0].casestatusId == 7)) {
          await db.radkeeplogs.destroy({ where: { id:  targetCaseId} });
          await Case.destroy({ where: { id:  targetCaseId} });
          if (deleteCases[0].urgenttype.UGType === 'custom') {
            db.urgenttypes.destroy({ where: { id:  deleteCases[0].urgenttype.id} });
          }
          tasks.removeTaskByCaseId(targetCaseId);
          let refreshDeleteCase = {type: 'refresh', statusId: deleteCases[0].casestatusId, caseId: targetCaseId};
          await socket.sendMessage(refreshDeleteCase , ur[0].username);
          res.json({Result: "OK", status: {code: 200}});
        } else {
          res.json({Result: "Not OK", status: {code: 201}, notice: 'The is not on status condition for delete.'});
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

app.get('/options/(:hospitalId)', (req, res) => {
  const hospitalId = req.params.hospitalId;
  common.doGenNewCaseOptions(hospitalId).then((result) => {
    res.json(result);
  })
});

app.get('/description/(:caseId)', (req, res) => {
  const caseId = req.params.caseId;
  common.doGetCaseDescription(caseId).then((result) => {
    res.json(result);
  });
});

app.post('/radio/socket/(:radioId)', async (req, res) => {
  const radioId = req.params.radioId;
  const radUser = await db.users.findAll({ attributes: ['username'], where: {id: radioId}});
  const radioUsername = radUser[0].username;
  const radioSockets = await socket.filterUserSocket(radioUsername);
  res.json(radioSockets);
});

//Search closed case API
app.post('/search/key', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let hospitalId = req.body.hospitalId;
        let userId = req.body.userId;
        let usertypeId = req.body.usertypeId;

        let casewhereClous = undefined;
        if ((usertypeId == 2) || (usertypeId == 5)) {
          casewhereClous = {hospitalId: { [db.Op.eq]: hospitalId}, userId: { [db.Op.eq]: userId}};
        } else if (usertypeId == 4) {
          casewhereClous = { Case_RadiologistId: { [db.Op.eq]: userId}};
        }
        let patientwhereClous = {hospitalId: { [db.Op.eq]: hospitalId}};
        let key = req.body.key;

        if ((key.fromDateKeyValue) && (key.toDateKeyValue)) {
          let fromDateWithZ = new Date(key.fromDateKeyValue);
          let toDateWithZ = new Date(key.toDateKeyValue);
          casewhereClous.createdAt = { [db.Op.gte]: new Date(fromDateWithZ)};
          casewhereClous.createdAt = { [db.Op.lte]: new Date(toDateWithZ)};
        } else {
          if (key.fromDateKeyValue) {
            let fromDateWithZ = new Date(key.fromDateKeyValue);
            casewhereClous.createdAt = { [db.Op.gte]: new Date(fromDateWithZ)};
          }
          if (key.toDateKeyValue) {
            let toDateWithZ = new Date(key.toDateKeyValue);
            casewhereClous.createdAt = { [db.Op.gte]: new Date(toDateWithZ)};
          }
        }
        if ((key.bodypartKeyValue !== '') && (key.bodypartKeyValue !== '*')) {
          casewhereClous.Case_BodyPart = { [db.Op.iLike]: '%' + key.bodypartKeyValue + '%' };
          //casewhereClous.Case_StudyDescription = { [db.Op.iLike]: '%' + key.bodypartKeyValue + '%' };
          //casewhereClous.Case_ProtocolName = { [db.Op.iLike]: '%' + key.bodypartKeyValue + '%' };
        }
        if (key.caseStatusKeyValue > 0) {
          casewhereClous.casestatusId = { [db.Op.eq]: key.caseStatusKeyValue};
        }

        if ((key.patientNameENKeyValue !== '') && (key.patientNameENKeyValue !== '*')) {
          patientwhereClous.Patient_NameEN = { [db.Op.iLike]: '%' + key.patientNameENKeyValue + '%' };
        }
        if ((key.patientHNKeyValue !== '') && (key.patientHNKeyValue !== '*')) {
          patientwhereClous.Patient_HN = { [db.Op.iLike]: '%' + key.patientHNKeyValue + '%' };
        }

        let patients = undefined;
        if ((patientwhereClous.hasOwnProperty('Patient_NameEN')) || (patientwhereClous.hasOwnProperty('Patient_HN'))) {
          patients = await db.patients.findAll({attributes: ['id'], where: patientwhereClous });
        }
        if ((patients) && (patients.length > 0)) {
          let patientIds = [];
          await patients.forEach((item, i) => {
            patientIds.push(item.id);
          });
          casewhereClous.patientId = {[db.Op.in]: patientIds};
        }

        const caseInclude = [{model: db.hospitals, attributes: ['id', 'Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.casestatuses, attributes: ['id', 'CS_Name_EN']}, {model: db.urgenttypes, attributes: ['id', 'UGType', 'UGType_Name']}];
        const orderby = [['id', 'DESC']];
        const cases = await Case.findAll({include: caseInclude, where: [casewhereClous], order: orderby});

        const casesFormat = [];
        const promiseList = new Promise(async function(resolve, reject) {
          for (let i=0; i<cases.length; i++) {
            let item = cases[i];
            const radUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RadiologistId}});
            const rades = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: radUser[0].userinfoId}});
            const Radiologist = {id: item.Case_RadiologistId, User_NameTH: rades[0].User_NameTH, User_LastNameTH: rades[0].User_LastNameTH};
            /*
            const refUser = await db.users.findAll({ attributes: ['userinfoId'], where: {id: item.Case_RefferalId}});
            const refes = await db.userinfoes.findAll({ attributes: ['id', 'User_NameTH', 'User_LastNameTH'], where: {id: refUser[0].userinfoId}});
            const Refferal = {id: item.Case_RefferalId, User_NameTH: refes[0].User_NameTH, User_LastNameTH: refes[0].User_LastNameTH};
            */

            casesFormat.push({case: item, Radiologist: Radiologist/*, Refferal: Refferal*/ });
          }
          setTimeout(()=> {
            resolve(casesFormat);
          },500);
        });
        Promise.all([promiseList]).then((ob)=> {
          res.json({status: {code: 200}, Records: ob[0], key: key});
        }).catch((err)=>{
          reject(err);
        });
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

//Radio Load case by status API
app.post('/load/list/by/status/radio', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const casestatusIds = req.body.casestatusIds;
        const radioId = req.body.userId;
        const youCcases = await Case.findAll({attributes: ['id'], where: {Case_RadiologistId: radioId, casestatusId: { [db.Op.in]: casestatusIds }}});
        res.json({status: {code: 200}, Records: youCcases});
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

//Owner Load case by status API
app.post('/load/list/by/status/owner', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const casestatusIds = req.body.casestatusIds;
        const userId = req.body.userId;
        const youCcases = await Case.findAll({attributes: ['id'], where: {userId: userId, casestatusId: { [db.Op.in]: casestatusIds }}});
        res.json({status: {code: 200}, Records: youCcases});
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

//API for Reffer Calling Case Info
app.get('/status/by/dicom/(:dicomId)', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const dicomId = req.params.dicomId;
        const caseInclude = [{model: db.casestatuses, attributes: ['CS_Name_EN']}];
        const youCcases = await Case.findAll({attributes:['id', 'casestatusId'], include: caseInclude,  where: {Case_OrthancStudyID: dicomId}, order: [['id', 'DESC']], limit: 1});
        res.json({status: {code: 200}, Records: youCcases});
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

//API for Reffer Calling Case' Result
app.post('/result/(:caseId)', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const caseId = req.params.caseId;
        const youReports = await db.casereports.findAll({attributes:['id', 'Report_Type', 'PDF_Filename'],  where: {caseId: caseId}, order: [['id', 'DESC']]});
        res.json({status: {code: 200}, Records: youReports});
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

//get cando list API
app.get('/cando/list', async (req, res) => {
  res.json({status: {code: 200}, list: common.casestatusFlowTable});
});

//check cando API
app.get('/cando/(:from)', async (req, res) => {
  let from = req.params.from;
  let next = await common.doCanNextStatus(from);
  res.json({status: {code: 200}, next: next});
});

module.exports = ( dbconn, caseTask, monitor, websocket ) => {
  db = dbconn;
  tasks = caseTask;
  log = monitor;
  socket = websocket;
  auth = require('./auth.js')(db, log);
  lineApi = require('../../lib/mod/lineapi.js')(db, log);
  uti = require('../../lib/mod/util.js')(db, log);
  common = require('./commonlib.js')(db, log);
  statusControl = require('./statuslib.js')(db, log, tasks, socket);
  Case = db.cases;
  return app;
}
