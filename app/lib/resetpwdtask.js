/*resetpwdtask.js*/
//mechanic
function RadconResetTask (db, log) {
  const $this = this;
  const cron = require('node-cron');
  const nodemailer = require('nodemailer');

	this.resetTasks = [];

  this.doCreateNewTask = function(email, username, userId, callback){
    return new Promise(async function(resolve, reject) {
      let sendRes = await $this.sendResetPwdEmail(email, username, userId);
      const startDate = new Date();
      const day = 0 * 24 * 60 * 60 * 1000;
      const hour = 1 * 60 * 60 * 1000;
      const minute = 0 * 60 * 1000;
      let endDate = new Date(startDate.getTime() + day + hour + minute);
      let endMM = endDate.getMonth() + 1;
      let endDD = endDate.getDate();
      let endHH = endDate.getHours();
      let endMN = endDate.getMinutes();
      let endSS = endDate.getSeconds();
      let scheduleTrigger = endSS + ' ' + endMN + ' ' + endHH + ' ' + endDD + ' ' + endMM + ' *';
  		let task = cron.schedule(scheduleTrigger, function(){
        callback(email, sendRes, endDate);
      });
      let newTask = {email: email, username: username, userId: userId, endDate: endDate/*, task: task*/};
      $this.resetTasks.push(newTask);
      resolve(newTask);
    });
  }

  this.removeTaskByEmail = async function (email) {
    let anotherTasks = await $this.resetTasks.filter((task)=>{
      if (task.email != email) {
        return task;
      }
    });
    $this.resetTasks = anotherTasks;
  }

  this.getTasks = function(){
    return $this.resetTasks;
  }

  this.findTaskByEmail = function (email) {
    return new Promise(async function(resolve, reject) {
      let aTask = await $this.resetTasks.find((task)=>{
        if (task.email == email) {
          return task;
        }
      });
      resolve(aTask);
    });
  }

  this.sendResetPwdEmail = function(email, username, userId){
    return new Promise(async function(resolve, reject) {
      var transporter = nodemailer.createTransport({
        /*
        service: 'gmail',
        auth: {
          user: 'oudsoft@gmail.com',
          pass: 'oud@2515'
        }
        */
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'oudsoft@gmail.com',
            pass: 'oud@2515'
        }
      });

      var mailOptions = {
        from: 'no-reply@gmail.com',
        to: email,
        subject: 'Reset Password at Radconnext.info',
        //text: 'That was easy!'
        html: '<p><a href="https://radconnext.info/form/resettask.html?taskId=' + email + '&username=' + username + '">??????????????????????????????</a>??????????????????????????????????????????????????????????????????????????????????????????</p>'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          reject(error);
        } else {
          resolve(info.response);
        }
      });
    });
  }
}


module.exports = ( db, monitor ) => {
	const resetTask = new RadconResetTask(db, monitor);
  return resetTask;
}
