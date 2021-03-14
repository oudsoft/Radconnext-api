/*whomtask.js*/
function RadconWhomTask (socket, db, log) {
  const $this = this;
	this.whomTasks = [];

  const cron = require('node-cron');

  this.doCreateNewTaskWhom = function(caseId, username, triggerParam, radioUsername, hospitalName, baseCaseStatusId, cb){
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
      log.info('scheduleTrigger=> ' + scheduleTrigger);
  		let task = cron.schedule(scheduleTrigger, function(){
        cb(caseId, socket, endDate);
      });
      let newTask = {caseId: caseId, username: username, radioUsername: radioUsername, triggerAt: endDate/*, task: task*/};
      newTask.task = task;

      $this.whomTasks.push(newTask);

      log.info('All new Task ' + /*JSON.stringify($this.caseTasks)*/$this.caseTasks);
      let msg = 'You have a new Case on ' + hospitalName + '. This your case will be expire at ' + endDate.getFullYear() + '-' + endMM + '-' + endDD + ' : ' + endHH + '.' + endMN;
      let notify = {type: 'notify', message: msg, caseId: caseId, casestatusId: baseCaseStatusId};
      let canSend = await socket.sendMessage(notify, radioUsername);
      if (canSend) {
        msg = 'The Radiologist of your new case can recieve message of this your case, And this case will be expire at ' + endDate.getFullYear() + '-' + endMM + '-' + endDD + ' : ' + endHH + '.' + endMN;
      } else {
        msg = 'The Radiologist of your new case can not recieve message of this your case, And this case will be expire at ' + endDate.getFullYear() + '-' + endMM + '-' + endDD + ' : ' + endHH + '.' + endMN;
      }
      notify = {type: 'notify', message: msg, caseId: caseId, casestatusId: baseCaseStatusId};
      await socket.sendMessage(notify, username);
      resolve(newTask);
    });
  }

  this.removeWhomByCaseId = function (caseId) {
    return new Promise(async function(resolve, reject) {
      let anotherWhoms = await $this.whomTasks.filter((whom)=>{
        if (whom.caseId != caseId) {
          return whom;
        }
      });
      $this.whomTasks = anotherWhoms;
      resolve(anotherWhoms);
    });
  }

  this.getWhoms = function(){
    return $this.whomTasks;
  }
}

module.exports = ( websocket, db, monitor ) => {
	const taskwhom = new RadconWhomTask(websocket, db, monitor);
  return taskwhom;
}
