/* websocket.js */

function RadconWebSocketServer (arg, db, log) {
	const $this = this;
	this.httpsServer = arg;
	const WebSocketServer = require('ws').Server;
	const wss = new WebSocketServer({server: this.httpsServer/*, path: '/' + roomname */});
	this.socket = wss;
	this.clients = [];
	this.db = db;

	wss.on('connection', async function (ws, req) {
		log.info(ws._socket.remoteAddress);
		log.info(ws._socket._peername);
		log.info(req.connection.remoteAddress);
		log.info(`WS Conn Url : ${req.url} Connected.`);
		let fullReqPaths = req.url.split('?');
		let wssPath = fullReqPaths[0];
		let wssQuery = fullReqPaths[1];
		log.info(wssPath);
		//wssPath = wssPath.substring(1);
		wssPath = wssPath.split('/');
		log.info(wssPath);
		let clientId = wssPath[(wssPath.length -2)];
		let anotherSockets = await $this.clients.filter((client) =>{
			if (client.id !== clientId) return ws;
		});
		anotherSockets.push(ws);
		$this.clients = anotherSockets;
		ws.id = clientId;
		ws.hospitalId = wssPath[(wssPath.length -1)];
		ws.counterping = 0;
		ws.screenstate = 0;
		let connectType;
		if (wssQuery) {
			let queries = wssQuery.split('&');
			connectType = queries[0].split('=');
			ws.connectType = connectType[1];
		}

		ws.send(JSON.stringify({type: 'test', message: ws.id + ', You have Connected master websocket success.'}));

		ws.on('message', async function (message) {
			var data;

			//accepting only JSON messages
			try {
				data = JSON.parse(message);
			} catch (e) {
				log.info("Invalid JSON of Socket data.");
				data = {};
			}

			log.info('socket data => ' + JSON.stringify(data));
			let hospitalId, owner;
			if (data.type) {
				switch (data.type) {
					case "trigger":
						let command = 'curl -X POST --user demo:demo http://localhost:8042/tools/execute-script -d "doLocalStore(\'' + data.dcmname + '\')"';
						$this.runCommand(command).then((result) => {
							ws.send(JSON.stringify({type: 'result', message: result}));
						});
          break;
					case "notify":
						if (data.sendto === ws.id) {
							ws.send(JSON.stringify({type: 'notify', message: data.notify, statusId: data.statusId, caseId: data.caseId}));
						}
					break;
					case "exec":
						if (data.data) {
							hospitalId = data.data.hospitalId;
							let localSocket = await $this.findHospitalLocalSocket(ws, hospitalId);
							if (localSocket) {
								if ((localSocket.readyState == 0) || (localSocket.readyState == 1)) {
									localSocket.send(JSON.stringify(data));
								} else {
									ws.send(JSON.stringify({type: 'notify', message: 'Local Socket is not on readyState!!'}));
								}
							} else {
								ws.send(JSON.stringify({type: 'notify', message: 'Local Socket have not Connected!!'}));
							}
						}
					break;
					case "cfindresult":
						owner = data.owner;
						hospitalId = data.hospitalId;
						queryPath = data.queryPath;
						let cfindResult = {type: "cfindresult", result: data.data, hospitalId: hospitalId, owner: owner, queryPath: queryPath};
						$this.selfSendMessage(ws, cfindResult, owner);
					break;
					case "move":
						if (data.data) {
							hospitalId = data.data.hospitalId;
							let localSocket = await $this.findHospitalLocalSocket(ws, hospitalId);
							if (localSocket) {
								if ((localSocket.readyState == 0) || (localSocket.readyState == 1)) {
									localSocket.send(JSON.stringify(data));
								} else {
									ws.send(JSON.stringify({type: 'notify', message: 'Local Socket is not on readyState!!'}));
								}
							} else {
								ws.send(JSON.stringify({type: 'notify', message: 'Local Socket have not Connected!!'}));
							}
						}
					break;
					case "cmoveresult":
						owner = data.owner;
						hospitalId = data.hospitalId;
						let patientID = data.PatientID;
						let cmoveResult = {type: "cmoveresult", result: data.data, patientID: patientID, owner: owner, hospitalId: hospitalId};
						$this.selfSendMessage(ws, cmoveResult, owner);
					break;
					case "run":
						if (data.data) {
							hospitalId = data.data.hospitalId;
							let localSocket = await $this.findHospitalLocalSocket(ws, hospitalId);
							if (localSocket) {
								if ((localSocket.readyState == 0) || (localSocket.readyState == 1)) {
									localSocket.send(JSON.stringify(data));
								} else {
									ws.send(JSON.stringify({type: 'notify', message: 'Local Socket is not on readyState!!'}));
								}
							} else {
								ws.send(JSON.stringify({type: 'notify', message: 'Local Socket have not Connected!!'}));
							}
						}
					break;
					case "runresult":
						owner = data.owner;
						let runResult = {type: "runresult", result: data.data, owner: owner};
						$this.selfSendMessage(ws, runResult, owner);
					break;
					case "callzoom":
						let sendTo = data.sendTo;
						let callData = {type: 'callzoom', openurl: data.openurl, password: data.password, topic: data.topic, sender: data.sender};
						$this.selfSendMessage(ws, callData, sendTo);
					break;
					case "callzoomback":
						let sendBackTo = data.sendTo;
						let resultData = {type: 'callzoomback', result: data.result};
						$this.selfSendMessage(ws, resultData, sendBackTo);
					break;
					case "reset":
						ws.counterping = 0;
					break;
					case "set":
						ws.screenstate = data.value;
					break;
					case "message":
						let sendto = data.sendto;
						let from = data.from;
						let msgSend = {type: 'message', msg: data.msg, from: from, context: data.context};
						$this.sendMessage(msgSend, sendto);
						if (data.context.topicId) {
							$this.saveChatLog(data.context.topicId, msgSend);
						}
					break;
					case "logout":
						let socketUsername = data.username;
						let anotherSockets = await $this.clients.filter((client) =>{
							if (client.id !== socketUsername) return ws;
						});
						$this.clients = anotherSockets
					break;
				}
			} else {
				ws.send(JSON.stringify({type: 'error', message: 'Your command invalid type.'}));
			}
		});

		ws.isAlive = true;

		ws.on('pong', () => {
			ws.counterping += 1;
			ws.isAlive = true;
			ws.send(JSON.stringify({type: 'ping', counterping: ws.counterping, datetime: new Date()}));
		});

		ws.on('close', async function(ws, req) {
			log.info(`WS Conn Url : ${ws.id} Close.`);
		});

	});

	setInterval(() => {
		wss.clients.forEach((ws) => {
			if (!ws.isAlive) return ws.terminate();
			ws.ping(null, false, true);
		});
	}, 60000);

	this.findUserSocket = function(username) {
		return new Promise(async function(resolve, reject) {
			let yourSocket = await $this.clients.find((ws) =>{
				if ((ws.id == username) && ((ws.readyState == 0) || (ws.readyState == 1))) return ws;
			});
			resolve(yourSocket);
		});
	}

	this.filterUserSocket = function(username) {
		return new Promise(async function(resolve, reject) {
			let targetSocket =await $this.clients.filter((ws) =>{
				if ((ws.id == username) && ((ws.readyState == 0) || (ws.readyState == 1))) {
					return ws;
				}
			});
			resolve(targetSocket);
		});
	}

	this.findHospitalLocalSocket = function(fromWs, hospitalId) {
		return new Promise(async function(resolve, reject) {
			let yourSocket = await $this.clients.find((ws) =>{
				if ((ws.hospitalId == hospitalId)  && (ws !== fromWs) && (ws.connectType === 'local') && ((ws.readyState == 0) || (ws.readyState == 1))) return ws;
			});
			resolve(yourSocket);
		});
	}

	this.selfSendMessage = async function(fromWs, message, sendto) {
		let userSocket = await $this.findUserSocket(sendto);
		if (userSocket) {
			userSocket.send(JSON.stringify(message));
			return true;
		} else {
			log.error('selfSendMessage::Can not find socket of ' + sendto);
			return false;
		}
	}

	this.sendMessage = function(message, sendto) {
		return new Promise(async function(resolve, reject) {
			let userSockets = await $this.filterUserSocket(sendto);
			if (userSockets.length > 0) {
				await userSockets.forEach((socket, i) => {
					socket.send(JSON.stringify(message));
					socket.counterping = 0;
				});
				resolve(true);
			} else {
				log.error('sendMessage::Can not find socket of ' + sendto);
				resolve(false);
			}
		});
	}

	this.sendLocalGateway = function(message, hospitalId) {
		return new Promise(async function(resolve, reject) {
			let gatewaySocket = await $this.clients.find((ws) =>{
				if ((ws.hospitalId == hospitalId)  && (ws.id == 'orthanc') && (ws.connectType === 'local') && ((ws.readyState == 0) || (ws.readyState == 1))) return ws;
			});
			if (gatewaySocket) {
				gatewaySocket.send(JSON.stringify(message));
				resolve(gatewaySocket);
			} else {
				resolve();
			}
		});
	}

	this.getPingCounter = function(username){
		return new Promise(async function(resolve, reject) {
			let userSockets = await $this.filterUserSocket(username);
			if (userSockets.length > 0) {
				resolve(userSockets[0].counterping);
			} else {
				log.error('getPingCounter::Can not find socket of ' + username);
				resolve(false);
			}
		});
	}

	this.getScreenState = function(username){
		return new Promise(async function(resolve, reject) {
			let userScreenState = await $this.filterUserSocket(username);
			if (userScreenState.length > 0) {
				resolve(userScreenState[0].screenstate);
			} else {
				log.error('getScreenState::Can not find socket of ' + username);
				resolve(false);
			}
		});
	}

	this.unlockScreenUser = function(username){
		return new Promise(async function(resolve, reject) {
			let userScreenStates = await $this.filterUserSocket(username);
			if (userScreenStates.length > 0) {
				let result = $this.sendMessage(JSON.stringify({type: 'unlockscreen'}), userScreenStates[0].id);
				resolve(result);
			} else {
				log.error('getScreenState::Can not find socket of ' + username);
				resolve(false);
			}
		});
	}
	//$this.db.radkeeplogs
	this.saveChatLog = function(caseId, msgSend){
		return new Promise(async function(resolve, reject) {
			$this.db.radchatlogs.findAll({
				where: {caseId: caseId}
			}).then(async (caseLog)=>{
				if (caseLog.length > 0) {
					let newCaseLog = caseLog;
					newCaseLog.push(msgSend);
					$this.db.radchatlogs.update({
				    Log: newCaseLog
				  },{
				    where: {
				      caseId: caseId
				    }
				  }).then((caseLog) => resolve(caseLog));
				} else {
					let newCaseLog = [msgSend];
					let newLog = await $this.db.radchatlogs.create({Log: newCaseLog});
					$this.db.radchatlogs.update({caseId: caseId}, {where: {id: newLog.id}});
					resolve(newLog);
				}
			});
		});
	}

	this.listClient = function(){
		return new Promise(async function(resolve, reject) {
			let clientConns = [];
			await $this.clients.forEach((item, i) => {
				clientConns.push(item.id);
			});
			resolve(clientConns);
		});
	}

	this.findOrthancLocalSocket = function(hospitalId) {
		return new Promise(async function(resolve, reject) {
			let orthancSocket = await $this.clients.find((ws) =>{
				if ((ws.hospitalId == hospitalId)  && (ws.id !== 'orthanc')) return ws;
			});
			resolve(orthancSocket);
		});
	}

	this.runCommand = function (command) {
		return new Promise(function(resolve, reject) {
			const exec = require('child_process').exec;
			exec(command, (error, stdout, stderr) => {
				if(error === null) {
					resolve(`${stdout}`);
				} else {
					reject(`${stderr}`);
				}
	    });
		});
	}

}

module.exports = ( arg, relation, monitor ) => {
	const webSocketServer = new RadconWebSocketServer(arg, relation, monitor);
	return webSocketServer;
}
