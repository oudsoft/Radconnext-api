const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.json({ limit: "50MB", type:'application/json', extended: true}));
app.use(bodyParser.urlencoded({limit: '50MB', type:'application/x-www-form-urlencoded', extended: true}));

var db, DicomTransferLog, log, websocket, auth, uti;

const excludeColumn = { exclude: ['updatedAt'] };

const doLoadOrthancStudies = function(orthancId, hostname, studyId) {
	return new Promise(function(resolve, reject) {
    const method = 'get';
    uti.doMyLoadOrthanc(orthancId, hostname).then((orthanc) => {
			//log.info('myorthanc=>' + JSON.stringify(orthanc));
      let cloud = JSON.parse(orthanc.Orthanc_Cloud);
      //let cloud = orthanc;
			let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;

      let rqParams = {
        method: method,
        auth:  {user: cloud.user, pass: cloud.pass},
        uri: orthancUrl + '/studies/' + studyId,
        body: {}
      };

      uti.proxyRequest(rqParams).then(async (proxyRes)=>{
        //log.info('study=>' + JSON.stringify(proxyRes.res.body));
				if (proxyRes.res.body){
	        let study = JSON.parse(proxyRes.res.body);

	        const promiseList = new Promise(async function(resolve2, reject2) {
	          let samplingSrs;
	          for (let i=0; i < study.Series.length; i++) {
	            let srsId = study.Series[i];
	            rqParams.uri = orthancUrl + '/series/' + srsId;
	            let proxySeriesRes = await uti.proxyRequest(rqParams);
	            //log.info('proxySeriesRes=>' + JSON.stringify(proxySeriesRes));
	            let proxySeries = JSON.parse(proxySeriesRes.res.body);
	            if ((proxySeries.MainDicomTags.SeriesDate) || (proxySeries.MainDicomTags.SeriesDescription)) {
	              samplingSrs = proxySeries;
	              break;
	            }
	          }
	          setTimeout(()=> {
	            resolve2(samplingSrs);
	          },500);
	        });
	        Promise.all([promiseList]).then(async(ob)=> {
	          let samplingSrs = ob[0];
	          //log.info('samplingSrs=>' + JSON.stringify(samplingSrs));
	          if (samplingSrs) {
	            study.SamplingSeries = samplingSrs;
	          } else {
	            rqParams.uri = orthancUrl + '/series/' + study.Series[0];
	            let firstSeriesRes = await uti.proxyRequest(rqParams);
	            let firstSeries = JSON.parse(firstSeriesRes.res.body);
	            study.SamplingSeries = firstSeries;
	          }
	          resolve(study);
	        }).catch((err)=>{
	          reject(err);
	        });
				} else {
					reject({error: 'not found response from orthanc'});
				}
      });
    });
  });
}
//List API
app.post('/list', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orthancId = req.query.orthancId;
          const limit = req.query.jtPageSize;
          const startAt = req.query.jtStartIndex;
          const count = await DicomTransferLog.count();
          const types = await DicomTransferLog.findAll({offset: startAt, limit: limit, attributes: excludeColumn, where: {orthancId: orthancId}});
          //res.json({status: {code: 200}, types: types});
          //log.info('Result=> ' + JSON.stringify(types));
          res.json({Result: "OK", Records: types, TotalRecordCount: count});
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
    log.info('dicomtransfer lis API => Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Select API
app.post('/select/(:resourceId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
					let resourceId = req.params.resourceId;
					const dicomRes = await DicomTransferLog.findAll({attributes: excludeColumn, where: {ResourceID: resourceId}});
					res.json({status: {code: 200}, dicom: dicomRes});
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

//callstudytag API
app.post('/callstudytag', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
					let hostname = req.hostname;
				  let hospitalId = req.body.hospitalId;
				  let username = req.body.username;
					let studyId = req.body.studyId;
					let orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
				  let yourOrthancId = orthancs[0].id;
				  let studyTags = await doLoadOrthancStudies(yourOrthancId, hostname, studyId);
					res.json({status: {code: 200}, studyTags: studyTags});
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

app.post('/add', async (req, res) => {
  let hostname = req.hostname;
  let hospitalId = req.body.hospitalId;
  let resourceType = req.body.resourceType;
  let resourceId = req.body.resourceId;
	let studyTags = req.body.StadyTags;
	let dicomTags = req.body.DicomTags;
  const orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
  let yourOrthancId = orthancs[0].id;
	const orthancRes = await DicomTransferLog.findAll({attributes: excludeColumn, where: {orthancId: yourOrthancId, ResourceID: resourceId}});

	if (orthancRes.length == 0){
		res.json({Result: "OK", result: 'add'});
	  let newDicomTransferLog = {DicomTags: JSON.stringify(dicomTags), StudyTags: studyTags, ResourceID: resourceId, ResourceType: resourceType, orthancId: yourOrthancId};
	  let adDicomTransferLog = await DicomTransferLog.create(newDicomTransferLog);
	  if (resourceType === 'study'){
			let socketTrigger = {type: 'newdicom', dicom: studyTags};
			let result = await websocket.sendLocalGateway(socketTrigger, hospitalId);
	  }
	} else {
		res.json({Result: "OK", result: 'update'});
		let logId = orthancRes[0].id;
	  let updateDicomTransferLog = {DicomTags: JSON.stringify(dicomTags), StudyTags: studyTags, ResourceID: resourceId, ResourceType: resourceType, orthancId: yourOrthancId};
	  let upDicomTransferLog = await DicomTransferLog.update(updateDicomTransferLog, { where: { id: logId } });
		let orthancUpdateRes = await DicomTransferLog.findAll({attributes: excludeColumn, where: {orthancId: yourOrthancId, ResourceID: resourceId}});
		if (resourceType === 'study'){
			let socketTrigger = {type: 'newdicom', dicom: studyTags};
			let result = await websocket.sendLocalGateway(socketTrigger, hospitalId);
	  }
	}
});
/*
  StudyID => ResourceID
  resourceType => {patient/study}
*/
app.post('/update', async (req, res) => {
	let id = req.body.id;
  let updateDicomTransferLog = req.body;
  await DicomTransferLog.update(updateDicomTransferLog, { where: { id: id } });
  res.json({Result: "OK"});
});

app.post('/delete', async (req, res) => {
	let id = req.body.id;
  await DicomTransferLog.destroy({ where: { id: id } });
  res.json({Result: "OK"});
});

//Study List API
app.post('/studies/list', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
					let hostname = req.hostname;
				  let hospitalId = req.body.hospitalId;
				  let modality = req.body.modality;
					let studyFromDate = req.body.studyFromDate;
					let studyToDate = req.body.studyToDate;
					let patientName = req.body.patientName;
					let patientID = req.body.patientID;
					let scanPart = req.body.scanPart
					let limit = req.body.limit;
					let offset = req.body.offset;
					let orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
				  let yourOrthancId = orthancs[0].id;
					//log.info('studyToDate=>' + studyToDate);
					let studyTags = {};
					if ((studyFromDate) && (studyFromDate !== '*')) {
						if ((studyToDate) && (studyToDate !== '*')) {
							studyTags.MainDicomTags = {StudyDate: {[db.Op.between]: [studyFromDate, studyToDate]}};
						} else {
							studyTags.MainDicomTags = {StudyDate: {[db.Op.gte]: studyFromDate}};
						}
					} else {
						if ((studyToDate) && (studyToDate !== '*')) {
							studyTags.MainDicomTags = {StudyDate: {[db.Op.eq]: studyToDate}};
						}
					}
					if ((modality) && (modality !== '*')) {
						studyTags.SamplingSeries = {MainDicomTags: {Modality: {[db.Op.eq]: modality}}};
					}
					if ((patientName) && (patientName !== '*')) {
						studyTags.PatientMainDicomTags = {PatientName: {[db.Op.like]: patientName.replace('*', '%')}};
					}
					if ((patientID) && (patientID !== '*')) {
						studyTags.PatientMainDicomTags = {PatientID: {[db.Op.like]: patientID.replace('*', '%')}};
					}
					if ((scanPart) && (scanPart !== '*')) {
						studyTags = {[db.Op.or]: [
							studyTags = {MainDicomTags: {StudyDescription: {[db.Op.like]: scanPart.replace('*', '%')}}},
							studyTags = {SamplingSeries: {MainDicomTags: {ProtocolName: {[db.Op.like]: scanPart.replace('*', '%')}}}}
						]};
					}
					whereClous = {
						orthancId: yourOrthancId,
						ResourceType: 'study',
						StudyTags: studyTags
					}
					log.info('whereClous=>' + JSON.stringify(whereClous));

					let studiesModelList = {attributes: ['StudyTags'], where: whereClous, order: [['StudyTags.MainDicomTags.StudyDate', 'DESC'], ['StudyTags.MainDicomTags.StudyTime', 'DESC']] };
					if ((limit) && (limit > 0)) {
						studiesModelList.limit = limit;
					}
					if (offset) {
						//offset: startAt
						studiesModelList.offset = offset;
					}
					const studiesRes = await DicomTransferLog.findAll(studiesModelList);
					res.json({status: {code: 200}, orthancRes: studiesRes});
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

app.get('/socket/clients', async(req, res) => {
  let allClients = await websocket.listClient();
  res.json({status: {code: 200}, Clients: allClients});
});

app.get('/socket/client/(:socketname)', async(req, res) => {
	let socketname = req.params.socketname;
  let userSocket = await websocket.findUserSocket(socketname);
	log.info('userSocket ' + socketname + ' ==> ' + JSON.stringify(userSocket));
	if (userSocket){
		userSocket.send(JSON.stringify({type: 'clientreconnect'}));
		res.json({status: {code: 200}, result: 'OK socket=>' + socketname});
	} else {
  	res.json({status: {code: 200}, result: 'Not found socket=>' + socketname});
	}
});

// /api/dicomtransferlog/3/21776058-56a21078-f5e147ef-03854de7-88c7f837
// http://202.28.68.28:8042/studies/929a9934-78066d77-49181fbd-05cad6c2-18e9114e

app.get('/test/:orthancId/:studyId', async (req, res) => {
  let orthancId = req.params.orthancId;
  let studyId = req.params.studyId;
  let hostname = req.hostname;
  let fullStudy = await doLoadOrthancStudies(orthancId, hostname, studyId);
  res.json({Result: "OK", Record: fullStudy});
});

app.get('/socket/test/newdicom/(:hospitalId)', async(req, res) => {
	let hospitalId = req.params.hospitalId;
	log.info('hospitalId=>' + hospitalId);
	let testDicom = require('../../lib/mod/dicom-test.json');
  let socketTrigger = {type: 'newdicom', dicom: testDicom};
  let sendResult = await websocket.sendLocalGateway(socketTrigger, hospitalId)
  res.json({status: {code: 200}, Result: sendResult});
});

module.exports = ( wsssocket, dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  websocket = wsssocket;
  auth = require('./auth.js')(db, log);
  uti = require('../../lib/mod/util.js')(db, log);
  DicomTransferLog = db.dicomtransferlogs;
  return app;
}
