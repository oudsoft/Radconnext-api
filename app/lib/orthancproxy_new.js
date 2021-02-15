/* orthancproxy.js */
//require('dotenv').config();
const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const archiver = require('archiver');
const unzip = require('unzip');
const request = require('request-promise');
const exec = require('child_process').exec;
const express = require('express');
const app = express();

const { promisify } = require('util');
const { resolve } = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const getFiles = async function(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

const userpass = process.env.ORTHANC_USER + ':' + process.env.ORTHANC_PASSWORD;
const currentDir = __dirname;
const publicDir = path.normalize(currentDir + '/../..');
const usrPreviewDir = publicDir + process.env.USRPREVIEW_DIR;
const usrArchiveDir = publicDir + process.env.USRARCHIVE_DIR;
const usrUploadDir = publicDir + process.env.USRUPLOAD_DIR;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const runcommand = function (command) {
	return new Promise(function(resolve, reject) {
		log.info("Exec Command=>" + command);
		exec(command, (error, stdout, stderr) => {
			if(error === null) {
				resolve(`${stdout}`);
			} else {
				log.info('Error Exec => ' + error)
				reject(`${stderr}`);
			}
    });
		/*
		var proc = exec(command);

    var list = [];
    proc.stdout.setEncoding('utf8');

    proc.stdout.on('data', function (chunk) {
      list.push(chunk);
    });

    proc.stdout.on('end', function () {
      resolve(list.join());
    });
		*/
	});
}
/*
const doLoadOrthancTarget = function(hospitalId, hostname){
	return new Promise(async function(resolve, reject) {
		//log.info('hostname => ' + hostname);
		if ((hostname === 'localhost') || (hostname.indexOf('192.168') >= 0)){
			let myCloud = {os: "docker-linux", ip: "202.28.68.28", httpport: "8042", dicomport: "4242", user: "demo", pass: "demo", portex : "8042", ipex: "202.28.68.28"};
			let localOrthanc = [{id: 0, Orthanc_Local: {}, Orthanc_Cloud: JSON.stringify(myCloud)}];
			resolve(localOrthanc[0]);
		} else {
			const orthancs = await Orthanc.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
			if (orthancs.length > 0) {
				resolve(orthancs[0]);
			} else {
				reject({error: 'Not found your orthanc in database'});
			}
		}
	});
}
*/

const formatStr = function (str) {
  var args = [].slice.call(arguments, 1),
    i = 0;
  return str.replace(/%s/g, () => args[i++]);
}

const zipDirectory = function(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);
    stream.on('close', () => resolve());
    archive.finalize();
  });
}

var db, Orthanc, log, auth, uti, socket;

app.post('/find', function(req, res) {
	/*
	some bug never fixed
	hospitalId is undefinded
	*/
	let hospitalId = req.body.hospitalId;
	log.info('hospitalId =>' + hospitalId);
	if (hospitalId) {
		let rqBody = req.body.body;
		log.info('rqBody=>' + rqBody)
		uti.doLoadOrthancTarget(hospitalId, req.hostname).then((orthanc) => {
			let username = req.body.username;
			let method = req.body.method;
			let cloud = JSON.parse(orthanc.Orthanc_Cloud)
			let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
			/*
			var command;
			if (method.toLowerCase() == 'post') {
				command = 'curl -X POST --user ' + cloud.user + ':' + cloud.pass + ' -H "user: ' + cloud.user + '" -H "Content-Type: application/json" ' + orthancUrl + req.body.uri + ' -d \'' + rqBody + '\'';
			} else if (method.toLowerCase() == 'get') {
				command = 'curl -X GET --user ' + cloud.user + ':' + cloud.pass + ' ' + orthancUrl + req.body.uri + '?user=' + cloud.user;
			}

			log.info('Find Dicom with command >>', command);
			try {
				runcommand(command).then((stdout) => {
					let studyObj = JSON.parse(stdout);
					res.status(200).send(studyObj);
				});
			} catch (err) {
				log.error('Run command Error => '+ JSON.stringify(err));
				reject(err);
			}
			*/

			let rqParams = {
				method: method,
				auth:  {user: cloud.user, pass: cloud.pass},
				uri: orthancUrl + req.body.uri,
				body: JSON.parse(rqBody)
			}
			uti.proxyRequest(rqParams).then((proxyRes)=>{
				let orthancRes = JSON.parse(proxyRes.res.body);
				//log.info('orthancRes JSON => ' + JSON.stringify(orthancRes));
				res.status(200).send(orthancRes);
			});
		});
	} else {
		let orthancError = {error: 'Your hospitalId is incurrect. Please verify.'};
		log.error('Request Orthanc Error =>' + orthancError.error);
		res.status(500).send({status: {code: 500}, error:  + orthancError.error});
	}
});

app.get('/find', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then((orthanc) => {
		let rqBody = req.body.body;
		let username = req.body.username;
		let cloud = JSON.parse(orthanc.Orthanc_Cloud)
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		var command = 'curl -X GET --user ' + cloud.user + ':' + cloud.pass + ' -H "user: ' + cloud.user + ' ' + orthancUrl + req.body.uri;
		log.info('Find Dicom with command >>', command);
		runcommand(command).then((stdout) => {
			let studyObj = JSON.parse(stdout);
			res.status(200).send(studyObj);
		});
	});
});

app.post('/preview/(:instanceID)', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then((orthanc) => {
		var instanceID = req.params.instanceID;
		var username = req.body.username;
		var previewFileName = instanceID + '.png';
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		var command = 'curl --user ' + cloud.user + ':' + cloud.pass + ' -H "user: ' + cloud.user + '" ' + orthancUrl + '/instances/' + instanceID + '/preview > ' + usrPreviewDir + '/' + previewFileName;
		log.info('Open Dicom preview with command >>', command);
		runcommand(command).then((stdout) => {
			//res.redirect('/' + rootname + USRPREVIEW_PATH + '/' + previewFileName);
			let link = process.env.USRPREVIEW_PATH + '/' + previewFileName;
			res.status(200).send({preview: {link: link}});
		});
	});
});

app.post('/create/preview', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then(async(orthanc) => {
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		let seriesId = req.body.seriesId;
		let username = req.body.username;
		let instanceList = req.body.instanceList;

		var command = formatStr('rm -rf %s/%s', usrPreviewDir, seriesId);
		var stdout = await runcommand(command);

		command = formatStr('mkdir %s/%s', usrPreviewDir, seriesId);
		stdout = await runcommand(command);

		command = formatStr('chmod 0777 %s/%s', usrPreviewDir, seriesId);
		stdout = await runcommand(command);

		var targetDir = usrPreviewDir + '/' + seriesId;
		var stdouts = [];
		let	promiseList = new Promise(async function(resolve2, reject2){
			instanceList.forEach(async(item, i) => {
				var targetFilename = item + '.png';
				command = formatStr('curl --user %s:%s -H "user: %s" %s/instances/%s/preview > %s/%s', cloud.user, cloud.pass, cloud.user, orthancUrl, item, targetDir, targetFilename);
				stdout = await runcommand(command);
				stdouts.push({id: item, result: stdout});
			});
			setTimeout(()=>{
				resolve2(stdouts);
			}, 500);
		});
		Promise.all([promiseList]).then((ob)=>{
			res.status(200).send({result: ob[0]});
		});
	});
});

app.post('/create/zip/instance', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then(async(orthanc) => {
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		let seriesId = req.body.seriesId;
		let username = req.body.username;
		let instanceId = req.body.instanceId;

		var command = formatStr('rm -rf %s/%s/%s', usrPreviewDir, seriesId, instanceId);
		var stdout = await runcommand(command);

		command = formatStr('mkdir %s/%s/%s', usrPreviewDir, seriesId, instanceId);
		stdout = await runcommand(command);

		command = formatStr('chmod 0777 %s/%s/%s', usrPreviewDir, seriesId, instanceId);
		stdout = await runcommand(command);

		var targetDir = formatStr('%s/%s/%s', usrPreviewDir, seriesId, instanceId);
		let dcmTargetFilename = instanceId + '.dcm';
		command = formatStr('curl --user %s:%s -H "user: %s" %s/instances/%s/file > %s/%s', cloud.user, cloud.pass, cloud.user, orthancUrl, instanceId, targetDir, dcmTargetFilename);
		stdout = await runcommand(command);
		let zipTargetFilename = instanceId + '.zip';
		let zipPath = formatStr('%s/%s/%s', usrPreviewDir, seriesId, zipTargetFilename);
		/*
		command = formatStr('zip %s %s', zipPath, dcmPath);
		stdout = await runcommand(command);
		*/
		await zipDirectory(targetDir, zipPath);
		res.status(200).send({result: stdout, archive: {link: '/img/usr/preview/' + seriesId + '/' + zipTargetFilename}});
	});
});

app.post('/sendai', function(req, res) {
	const { AIChest4allAsyncCall, downloadAIChestFile, checkStatus } = require('./mod/aichest4all_call.js');

	const printAIProps = async function(userId, caseId, seriesId, instanceId, data){
		//log.info('AI Data=>' + JSON.stringify(data.data));
	  //log.info('AI Result=>' + JSON.stringify(data.data.result));
		let newAILog = {seriesId: seriesId, instanceId: instanceId, ResultId: data.data.id, ResultJson: data.data.result};
		let adAILog = await db.radailogs.create(newAILog);
		await db.radailogs.update({userId: userId, caseId: caseId}, {where: {id: adAILog.id}});
	}
	let userId = req.body.userId;
	let caseId = req.body.caseId;
	let seriesId = req.body.seriesId;
	let instanceId = req.body.instanceId;

	let zipTargetFilename = instanceId + '.zip';
	let zipPath = formatStr('%s/%s/%s', usrPreviewDir, seriesId, zipTargetFilename);

	AIChest4allAsyncCall(zipPath, "zip").then(aiRes => {
		log.info("Upload done")
		if (!aiRes.ids) {
		  throw new Error("No have IDs")
		}
		return aiRes.ids.map(id => checkStatus(id, async (airesult) => {
			let resultLink = await downloadAIChestFile(airesult.data.id, 'pdf');
			printAIProps(userId, caseId, seriesId,instanceId, airesult, resultLink);
			res.status(200).send({result: {link: resultLink, id: airesult.data.id}});
		}, console.error))
	}).catch(error => {
		console.error("Error!!!", error.message);
		res.status(500).send({error: error.message});
	})
});

app.post('/convert/ai/report', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then(async(orthanc) => {
		const publicDir = path.normalize(__dirname + '/../..');
    const aiDownloadDir = publicDir + process.env.AIDOWNLOAD_DIR;

		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		let userPASS = cloud.user + ':' + cloud.pass;
		let studyId = req.body.studyId;
		let username = req.body.username;
		let reportFileCode = req.body.pdffilecode;
		let modality = req.body.modality;

		let pdfFileName = reportFileCode + '.pdf';

		let outterCommand = formatStr('curl --user %s %s/studies/%s', userPASS, orthancUrl, studyId);
		let stdout = await runcommand(outterCommand);

		let studyObj = JSON.parse(stdout);
		let mainTags = Object.keys(studyObj.MainDicomTags);
		let patientMainTags = Object.keys(studyObj.PatientMainDicomTags);
		let bpmFile = reportFileCode + '.bmp';
		let dcmFile = reportFileCode + '.dcm';
		let command = '';
		command += 'convert -verbose -density 150 -trim ' + aiDownloadDir + '/' + pdfFileName + '[0]';
		command += ' -define bmp:format=BMP3 -quality 100 -flatten -sharpen 0x1.0 ';
		command += ' ' + aiDownloadDir + '/' + bpmFile;
		command += ' && cd ' + aiDownloadDir;
		command += ' && img2dcm -i BMP ' + bpmFile + ' ' + dcmFile;
		await mainTags.forEach((tag, i) => {
			command += formatStr(' -k "%s=%s"', tag, Object.values(studyObj.MainDicomTags)[i]);
		});
		await patientMainTags.forEach((tag, i) => {
			if (tag !== 'OtherPatientIDs')	{
				command += formatStr(' -k "%s=%s"', tag, Object.values(studyObj.PatientMainDicomTags)[i]);
			}
		});

		command += formatStr(' -k "Modality=%s" -v', modality);

		command += ' && storescu';
		command += formatStr(' %s %s', cloud.ip, cloud.dicomport);
		command +=  ' ' + dcmFile;
		command +=  ' -v';

		stdout = await runcommand(command);

		res.status(200).send({result: {code: 200}});
	});
});

app.post('/importarchive', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then(async (orthanc) => {
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		let archiveCode = req.body.archivecode;
		let username = req.body.username;
    let pacsImportOption = req.body.pacsImportOption;
    log.info('option=>' + pacsImportOption);
		let archiveFileName = archiveCode + '.zip';
		let archiveParh = usrUploadDir + '/' + archiveFileName;
		let archiveDir = formatStr('%s/%s', usrUploadDir, archiveCode);
		let command = formatStr('mkdir %s', archiveDir);
		let stdout = await runcommand(command);
		fs.createReadStream(archiveParh).pipe(unzip.Extract({ path: archiveDir })).on('close', function () {
			log.info('Unzip Archive Success, and start import for you.');
			getFiles(archiveDir).then((files) => {
				const delay = 5000;
				const importDicom = function(dicomFile, pos){
					return new Promise(async function(resolve, reject){
						let command = formatStr('curl -X POST --user %s:%s %s/instances --data-binary @%s', cloud.user, cloud.pass, orthancUrl, dicomFile);
						let stdout = await runcommand(command);
						setTimeout(()=>{
							log.info('order => ' + pos);
							resolve(stdout);
						}, 415);
					});
				}

				let execResults = [];
				let	promiseList = new Promise(async function(resolve2, reject2){
					let i = 0;
					while (i < files.length) {
						let item = files[i];
						let pathFormat = item.split(' ').join('\\ ');
						let importRes = await importDicom(pathFormat, i);
            //socket
            if (pacsImportOption) {
              let startUrlAt = item.indexOf('/img');
              let internalUrl = item.substring(startUrlAt);
              var port = req.app.settings.port || process.env.SERVER_PORT;
              let downloadlink = req.protocol + '://' + req.hostname  + ( port == 80 || port == 443 ? '' : ':'+port )  + internalUrl;
              //let downloadlink = 'https://' + req.host + internalUrl;
              let socketTrigger = {type: 'import', message: 'Please sync new dicom to Pacs', download: {link: downloadlink} };
              await socket.sendMessage(socketTrigger, username);

              const workerFarm = require('worker-farm');
              const importService = workerFarm(require.resolve('./mod/import-worker.js'));
              let importData = {download: {link: downloadlink}};
              await importService(importData, function (err, output) {
                log.info('output=>' + JSON.stringify(output));
              });
            }
						execResults.push(importRes);
						i++;
					}
					setTimeout(()=>{
						resolve2(execResults);
					}, delay);
				});
				log.info('countt all Files => ' + files.length);
				if (files.length > 200) {
					log.info('test => ' + files.length);
					res.status(200).send({result: files});
				} else {
					Promise.all([promiseList]).then((ob)=>{
						res.status(200).send({result: ob[0]});
					});
				}
			}).catch((error) => {
				log.error('Error=>'+ JSON.stringify(error));
				res.status(500).send({error: error});
			});
		});
	});
});

app.post('/loadarchive/(:studyID)', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then((orthanc) => {
		var studyID = req.params.studyID;
		var username = req.body.username;
		var archiveFileName = studyID + '.zip';
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		var command = 'curl --user ' + cloud.user + ':' + cloud.pass + ' -H "user: ' + cloud.user + '" ' + orthancUrl + '/studies/' + studyID + '/archive > ' + usrArchiveDir + '/' + archiveFileName;
		log.info('Download Dicom achive with command >>', command);
		runcommand(command).then((stdout) => {
			let link = process.env.USRARCHIVE_PATH + '/' + archiveFileName;
			res.status(200).send({link: link});
		});
	});
});

app.post('/deletedicom/(:studyID)', function(req, res) {
	let hospitalId = req.body.hospitalId;
	uti.doLoadOrthancTarget(hospitalId, req.hostname).then((orthanc) => {
		var studyID = req.params.studyID;
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let orthancUrl = 'http://' + cloud.ip + ':' + cloud.httpport;
		var command = 'curl -X DELETE --user ' + cloud.user + ':' + cloud.pass + ' -H "user: ' + cloud.user + '" ' + orthancUrl + '/studies/' + studyID;
		log.info('Delete Dicom with command >>', command);
		runcommand(command).then((stdout) => {
			res.status(200).send({response: {message: stdout}});
		});
	});
});

app.get('/orthancexternalport', function(req, res) {
	let hospitalId = req.query.hospitalId;
	let hostname = req.hostname;
	uti.doLoadOrthancTarget(hospitalId, hostname).then((orthanc) => {
		let cloud = JSON.parse(orthanc.Orthanc_Cloud);
		res.status(200).send({ip: cloud.ipex, port: cloud.portex});
	});
});

module.exports = ( dbconn, monitor, websocket ) => {
  db = dbconn;
  log = monitor;
  socket = websocket;
  Orthanc = db.orthancs;
	uti = require('./mod/util.js')(db, log);
  return app;
}
