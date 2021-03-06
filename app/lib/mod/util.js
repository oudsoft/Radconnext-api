const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('request-promise');
const exec = require('child_process').exec;

var log, db;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const proxyRequest = function(rqParam) {
	return new Promise(function(resolve, reject) {
		let rqBody = JSON.stringify(rqParam.body);
		let proxyParams = {
			method: rqParam.method,
			url: rqParam.uri,
			auth: rqParam.auth,
			headers: {
				'Content-Type': 'application/json'
			},
			body: rqBody
		};
		if (rqParam.Authorization) {
			proxyParams.headers.Authorization = rqParam.Authorization;
		}
		log.info('proxyParams=>' + JSON.stringify(proxyParams));
		request(proxyParams, (err, res, body) => {
			if (!err) {
				resolve({status: {code: 200}, res: res});
			} else {
				log.error('your Request Error=>' + JSON.stringify(err));
				reject({status: {code: 500}, err: err});
			}
		});
	});
}

const runcommand = function (command) {
	return new Promise(function(resolve, reject) {
		logger().info(new Date()  + " Command " + command);
		exec(command, (error, stdout, stderr) => {
			if(error === null) {
				//logger().info(new Date()  + " Resolve " + `${stdout}`);
				resolve(`${stdout}`);
			} else {
				logger().error(new Date()  + " Reject " + `${stderr}`);
				reject(`${stderr}`);
			}
    });
	});
}

const parseStr = function (str) {
  var args = [].slice.call(arguments, 1);
  var i = 0;
  return str.replace(/%s/g, () => args[i++]);
}

const doLoadOrthancTarget = function(hospitalId, hostname){
	return new Promise(async function(resolve, reject) {
		//log.info('hostname => ' + hostname);
		if ((hostname === 'localhost') || (hostname.indexOf('192.168') >= 0)){
			const myCloud = {os: "docker-linux", ip: "202.28.68.28", httpport: "8042", dicomport: "4242", user: "demo", pass: "demo", portex : "8042", ipex: "202.28.68.28"};
			if (hospitalId == 2) {
				myCloud.httpport = "8043";
				myCloud.portex = "8043";
			} else if (hospitalId == 3) {
				myCloud.httpport = "8044";
				myCloud.portex = "8044"
			}
			const localOrthanc = [{id: 0, Orthanc_Local: {}, Orthanc_Cloud: JSON.stringify(myCloud)}];
			resolve(localOrthanc[0]);
		} else {
			const orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
			if (orthancs.length > 0) {
				resolve(orthancs[0]);
			} else {
				reject({error: 'Not found your orthanc in database'});
			}
		}
	});
}

const doMyLoadOrthanc = function(myOrthancId, hostname){
	return new Promise(async function(resolve, reject) {
		if ((hostname === 'localhost') || (hostname.indexOf('192.168') >= 0)){
			const myCloud = {os: "docker-linux", ip: "202.28.68.28", httpport: "8042", dicomport: "4242", user: "demo", pass: "demo", portex : "8042", ipex: "202.28.68.28"};
			if (myOrthancId == 2) {
				myCloud.portex = "8043"
			} else if (myOrthancId == 3) {
				myCloud.portex = "8044"
			}
			const localOrthanc = [{id: 0, Orthanc_Local: {}, Orthanc_Cloud: JSON.stringify(myCloud)}];
			resolve(localOrthanc[0]);
		} else {
			const orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {id: myOrthancId}});
			if (orthancs.length > 0) {
				resolve(orthancs[0]);
			} else {
				reject({error: 'Not found your orthanc in database'});
			}
		}
	});
}

const doFormateDateTime = function(dateIn){
	let date = undefined;
	if (dateIn) {
		date = new Date(dateIn);
	} else {
		date = new Date();
	}
	let YY = date.getFullYear();
	let MM = date.getMonth() + 1;
	if (MM < 10){
		 MM = '0' + MM;
	} else {
		MM = '' + MM;
	}
	let DD = date.getDate();
	if (DD < 10){
		 DD = '0' + DD;
	} else {
		DD = '' + DD;
	}
	let HH = date.getHours();
	if (HH < 10){
		 HH = '0' + HH;
	} else {
		HH = '' + HH;
	}
	let MN = date.getMinutes();
	if (MN < 10){
		 MN = '0' + MN;
	} else {
		MN = '' + MN;
	}

	return ({YY, MM, DD, HH, MN});
}

module.exports = (dbconn, monitor) => {
	db = dbconn;
	log = monitor;
  return {
    proxyRequest,
    runcommand,
    parseStr,
		doLoadOrthancTarget,
		doMyLoadOrthanc,
		doFormateDateTime
  }
}
