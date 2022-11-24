/* voiptask.js */

function RadconVoipTask (socket, db, log) {
  const $this = this;
  const cron = require('node-cron');
  const uti = require('./mod/util.js')(db, log);

	this.voipTasks = [];

  this.doCreateNewTaskVoip = function (caseId, username, triggerParam, radioUsername, radioNameTH, cb) {
    return new Promise(async function(resolve, reject) {
      const startDate = new Date();
      const day = Number(triggerParam.dd) * 24 * 60 * 60 * 1000;
      const hour = Number(triggerParam.hh) * 60 * 60 * 1000;
      const minute = Number(triggerParam.mn) * 60 * 1000;
      let endDate = new Date(startDate.getTime() + day + hour + minute);
      let endMM = endDate.getMonth() + 1;
      let endDD = endDate.getDate();
      let endHH = endDate.getHours();
      let endMN = endDate.getMinutes();
      let endSS = endDate.getSeconds();
      let scheduleTrigger = endSS + ' ' + endMN + ' ' + endHH + ' ' + endDD + ' ' + endMM + ' *';

      let responseKEYs = [];
      let newTask = {caseId: Number(caseId), username: username, radioUsername: radioUsername, radioNameTH: radioNameTH, triggerAt: endDate, responseKEYs: responseKEYs};
      $this.voipTasks.push(newTask);

      resolve(newTask);

      log.info('VoIP scheduleTrigger => ' + scheduleTrigger);
      let task = cron.schedule(scheduleTrigger, function(){
        log.info('VoIP start trigger => ' + caseId);
        cb(caseId, socket, endDate);
      });

      newTask.task = task;

    });
  }

  this.removeTaskByCaseId = function (caseId) {
    return new Promise(async function(resolve, reject) {
      let anotherTasks = await $this.voipTasks.filter(async(task)=>{
        if (Number(task.caseId) !== Number(caseId)) {
          return task;
        } else {
          //doCall rwquest remove callFile from VOIP Server
          if ((task.callFile) && ((task.callFile) !== '')) {
            let callDeleteCallFileRes = await $this.doCallDeleteCallFile(task.callFile);
          }
          let nowcaseStatus = await db.cases.findAll({ attributes: ['casestatusId'], where: {id: caseId}});
          let currentCaseStatusId = nowcaseStatus[0].casestatusId;
          let systemId = 0;
          let remark = 'ระบบทำการยกเลิกสายเรียกของรังสีแพทย์ ' + task.radioNameTH;
          let newKeepLog = { caseId : caseId,	userId : systemId, from : currentCaseStatusId, to : currentCaseStatusId, remark : remark};
          await db.radkeeplogs.create(newKeepLog);
          if ((task) && (task.task)) {
            task.task.stop();
          }
          let curlData = JSON.stringify(newKeepLog);
          let notifyCaseEventCmdFmt = 'curl -X POST -H "Content-Type: application/json" https://radconnext.info/api/keeplog/case/event/nofify -d \'%s\'';
          let notifyCaseEventCmd = uti.fmtStr(notifyCaseEventCmdFmt, curlData);
          let keeplogReply = await uti.runcommand(notifyCaseEventCmd);
          log.info('keeplogReply on /case/event/nofify end point =>');
          log.info(JSON.stringify(keeplogReply))

          return;
        }
      });
      $this.voipTasks = anotherTasks;
      resolve(anotherTasks);
    });
  }

  this.selectTaskByCaseId = function (caseId) {
    return new Promise(async function(resolve, reject) {
      let theCase = await $this.voipTasks.find((task)=>{
        //log.info('Number(task.caseId)=>' + Number(task.caseId));
        //log.info('Number(caseId)=>' + Number(caseId));
        //log.info(Number(task.caseId) === Number(caseId));
        if (Number(task.caseId) === Number(caseId)) {
          return task;
        }
      });
      if (theCase){
        let thisTask = {caseId: theCase.caseId, username: theCase.username, radioUsername: theCase.radioUsername, triggerAt: theCase.triggerAt, responseKEYs: theCase.responseKEYs};
        resolve(thisTask);
      } else {
        resolve();
      }
    });
  }

  this.filterTaskByRadioUsername = function (radioUserName) {
    return new Promise(async function(resolve, reject) {
      let yourcases = await $this.voipTasks.filter((task)=>{
        if (task.radioUsername == radioUserName) {
          return task;
        }
      });
      let fmtTasks = [];
      await yourcases.forEach((task, i) => {
        let thisTask = {caseId: task.caseId, username: task.username, radioUsername: task.radioUsername, triggerAt: task.triggerAt, responseKEYs: task.responseKEYs};
        fmtTasks.push(thisTask);
      });
      resolve(fmtTasks);
    });
  }

  this.filterTaskByUsername = function (userName) {
    return new Promise(async function(resolve, reject) {
      let yourcases = await $this.voipTasks.filter((task)=>{
        if (task.username == userName) {
          return task;
        }
      });
      let fmtTasks = [];
      await yourcases.forEach((task, i) => {
        let thisTask = {caseId: task.caseId, username: task.username, radioUsername: task.radioUsername, triggerAt: task.triggerAt, responseKEYs: task.responseKEYs};
        fmtTasks.push(thisTask);
      });
      resolve(fmtTasks);
    });
  }

  this.getTasks = function(){
    return new Promise(async function(resolve, reject) {
      let finalTasks = [];
      await $this.voipTasks.forEach((item, i) => {
        let nwTask = {caseId: item.caseId, username: item.username, radioUsername: item.radioUsername, triggerAt: item.triggerAt, responseKEYs: item.responseKEYs};
        finalTasks.push(nwTask);
      });
      resolve(finalTasks);
    });
  }

  this.doAppendNewKEY = function(caseId, key){
    return new Promise(async function(resolve, reject) {
      let myTask = await $this.selectTaskByCaseId(caseId);
      if ((myTask) && (myTask.caseId)){
        myTask.responseKEYs.push(key);
      }
      resolve(myTask);
    });
  }

  this.getKEYs = function(caseId){
    return new Promise(async function(resolve, reject) {
      let myTask = await $this.selectTaskByCaseId(caseId);
      let key = [];
      if ((myTask) && (myTask.caseId)){
        key = myTask.responseKEYs;
      }
      resolve(key);
    });
  }

  this.doCallDeleteCallFile = function(callFile) {
    return new Promise(async function(resolve, reject) {
      const callDataFmt = 'callFile=%s'
      const reqCallURLFmt = 'https://202.28.68.6/callradio/deletecallfile.php?%s';
      //let callData = uti.fmtStr(callDataFmt, callFile);
      let callData = 'callFile=' + callFile;
      let reqCallURL = uti.fmtStr(reqCallURLFmt, callData);
      let rqParams = {
        method: 'GET',
        uri: reqCallURL,
        body: callData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      let callRes = await uti.voipRequest(rqParams);
      //log.info('voiceRes=> ' + JSON.stringify(voiceRes));
      resolve(callRes);
    });
  }

}

module.exports = ( websocket, db, monitor ) => {
	const taskvoip = new RadconVoipTask(websocket, db, monitor);
  return taskvoip;
}
