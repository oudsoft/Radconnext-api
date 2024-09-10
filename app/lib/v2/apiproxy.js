/* apiproxy.js */
//require('dotenv').config();
const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('node-request-promise');
const express = require('express');
const app = express();

const proxyRequest = function(rqParam) {
	return new Promise(async function(resolve, reject) {
		console.log(rqParam);
		/*
		request({
			method: rqParam.method,
			url: rqParam.url,
			body: JSON.stringify(rqParam.body)
		}, (err, res, body) => {
			if (!err) {
				resolve({status: {code: 200}, res: res});
			} else {
				reject({status: {code: 500}, err: err});
			}
		});
		*/
		let res = undefined;
		if (rqParam.method.toLowerCase() == 'get') {
			res = await request.get(rqParam.url);
			resolve({status: {code: 200}, res: res});
		} else if (rqParam.method.toLowerCase() == 'post') {
			res = await request.post(rqParam.url, rqParam.body, rqParam.options);
			resolve({status: {code: 200}, res: res});
		} else {
			reject({status: {code: 500, error: 'incurrect request method'}});
		}
	});
}

const proxyZoomRequest = function(rqParam) {
	return new Promise(async function(resolve, reject) {
		console.log(rqParam);
		/*
		request({
			method: rqParam.method,
			url: rqParam.url,
			body: rqParam.body,
			json: true
		}, (err, res, body) => {
			if (!err) {
				resolve({status: {code: 200}, res: res});
			} else {
				reject({status: {code: 500}, err: err});
			}
		});
		*/
		let res = undefined;
		if (rqParam.method.toLowerCase() == 'get') {
			res = await request.get(rqParam.url);
			resolve({status: {code: 200}, res: res});
		} else if (rqParam.method.toLowerCase() == 'post') {
			res = await request.post(rqParam.url, rqParam.body, rqParam.options);
			resolve({status: {code: 200}, res: res});
		} else {
			reject({status: {code: 500, error: 'incurrect request method'}});
		}		
	});
}

var db, log;

app.post('/callapi', async function(req, res) {
	let rqParam = {url: req.body.url, method: req.body.method, body: req.body.body};
	proxyRequest(rqParam).then((response) => {
		console.log('call success');
		//console.log(response);
		res.status(200).send(response);
	}).catch ((err) => {
		console.log('call error');
		//console.log(err);
		res.status(500).send(err);
	})
})

app.post('/callzoomapi', async function(req, res) {
	let rqParam = {url: req.body.url, method: req.body.method, body: req.body.body};
	proxyZoomRequest(rqParam).then((response) => {
		console.log('call success');
		//console.log(response);
		res.status(200).send(response);
	}).catch ((err) => {
		console.log('call error');
		//console.log(err);
		res.status(500).send(err);
	})
})

module.exports = ( dbcon, monitor ) => {
  db = dbcon;
  log = monitor;
	return app;
}
