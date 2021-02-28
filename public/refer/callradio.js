const urlQueryToObject = function(url) {
  let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
    return paramPair.split(/=(.+)?/).slice(0, 2);
  }).reduce(function (obj, pairArray) {
    obj[pairArray[0]] = pairArray[1];
    return obj;
  }, {});
  return result;
}

const inputStyleClass = {"font-family": "THSarabunNew", "font-size": "24px"};

var wsm;

const doCallApi = function (apiurl, params) {
 var dfd = $.Deferred();
  $.post(apiurl, params, function(data){
    dfd.resolve(data);
  }).fail(function(error) {
    dfd.reject(error);
  });
  return dfd.promise();
}

function isIE () {
  var myUA = navigator.userAgent.toLowerCase();
  return (myUA.indexOf('msie') != -1) ? parseInt(myUA.split('msie')[1]) : false;
}

const browser = function() {
  const test = function(regexp) {return regexp.test(window.navigator.userAgent)}
  switch (true) {
    case test(/edg/i): return "Microsoft Edge";
    case test(/trident/i): return "Microsoft Internet Explorer";
    case test(/firefox|fxios/i): return "Mozilla Firefox";
    case test(/opr\//i): return "Opera";
    case test(/ucbrowser/i): return "UC Browser";
    case test(/samsungbrowser/i): return "Samsung Browser";
    case test(/chrome|chromium|crios/i): return "Google Chrome";
    case test(/safari/i): return "Apple Safari";
    default: return "Other";
  }
}

const browserSupport = function(ua){
  if ((ua === 'Google Chrome') || (ua === 'Microsoft Edge') || (ua === 'Mozilla Firefox')) {
    return true;
  } else if (ua === 'Microsoft Internet Explorer') {
    if (isIE() >= 11) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

const initPage = function() {
  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));
  $('body').loading({overlay: $("#overlay"), stoppable: true});

  let queryObj = urlQueryToObject(window.location.href);
  if (queryObj.caseId) {
    let ua = browser();
    let canSupport = browserSupport(ua);
    if (canSupport) {
      let yourToken = localStorage.getItem('token');
      if (yourToken) {
        //chat room
        $.ajaxSetup({
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', yourToken);
          }
        });

        doOpenChatRoom(queryObj.caseId);
      } else {
        //login
        window.location.replace('/index.html?action=callchat&caseId='+queryObj.caseId);
      }
    } else {
      alert('เว็บบราวส์เซอร์ของคุณไม่รองรับการติดต่อรังสีแพทย์ผ่านทางการส่งข้อความ\nโปรดใชเว็บบราวส์เซอร์ที่สนับสนุน ดังนี้\nGoogle Chrome, MS Edge, Firefox หรือ IE เวอร์ชั่น 11 ขึ้นไป');
    }
  } else {
    let yourCaseId = prompt('โปรดระบุรหัสเคส\nรหัสเคสจะปรากฎอยู่ด้านล่างรายงานผลอ่าน', '');
		if (yourCaseId){

    } else {
      alert('Sorry.');

    }
  }
}

$(document).ready(function() {
	initPage();
});

const doOpenChatRoom = async function(caseId){
  $('body').loading('start');
  let userdata = JSON.parse(localStorage.getItem('userdata'));
  //console.log(userdata);
  let username = userdata.username;
  let usertypeId = userdata.usertypeId;
  let hospitalId = userdata.hospitalId;

  wsm = doConnectWebsocketMaster(username, usertypeId, hospitalId, 'none');
  //console.log(wsm);

  let simpleChatBox = await doCreateChatBox(caseId);
  $('#app').append($(simpleChatBox));

  let gotomainpageCmd = doCreateGoToMainPageCmd();
  $('#app').append($(gotomainpageCmd));
  $('body').loading('stop');
}

const doConnectWebsocketMaster = function(username, usertypeId, hospitalId, connecttype){
  const hostname = window.location.hostname;
  const port = window.location.port;
  const paths = window.location.pathname.split('/');
  const rootname = paths[1];

  //const wsUrl = 'wss://' + hostname + ':' + port + '/' + rootname + '/' + username + '/' + hospitalId + '?type=' + type;
  const wsUrl = 'wss://' + hostname + ':' + port + '/' + username + '/' + hospitalId + '?type=' + connecttype;
  wsm = new WebSocket(wsUrl);
  wsm.onopen = function () {
    //console.log('Master Websocket is connected to the signaling server')
  };

  console.log(usertypeId);

  wsm.onmessage = onMessageEvt;

  wsm.onclose = function(event) {
    //console.log("Master WebSocket is closed now. with  event:=> ", event);
  };

  wsm.onerror = function (err) {
     console.log("Master WS Got error", err);
  };

  return wsm;
}

const onMessageEvt = function(msgEvt){
  let data = JSON.parse(msgEvt.data);
  console.log(data);
  if (data.type !== 'test') {
    let masterNotify = localStorage.getItem('masternotify');
    let MasterNotify = JSON.parse(masterNotify);
    if (MasterNotify) {
      MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
    } else {
      MasterNotify = [];
      MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
    }
    localStorage.setItem('masternotify', JSON.stringify(MasterNotify));
  }
  if (data.type == 'test') {
    $.notify(data.message, "success");
  } else if (data.type == 'notify') {
    $.notify(data.message, "info");
  } else if (data.type == 'callzoom') {
    let eventName = 'callzoominterrupt';
    let callData = {openurl: data.openurl, password: data.password, topic: data.topic, sender: data.sender};
    let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: callData}});
    document.dispatchEvent(event);
  } else if (data.type == 'callzoomback') {
    let eventName = 'stopzoominterrupt';
    let evtData = {result: data.result};
    let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
    document.dispatchEvent(event);
  } else if (data.type == 'message') {
    $.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
    doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
    let eventData = {msg: data.msg, from: data.from, context: data.context};
    $('#SimpleChatBox').trigger('messagedrive', [eventData]);
  }
};

const doSaveMessageToLocal = function(msg ,from, topicId, status){
  let localMessage = JSON.parse(localStorage.getItem('localmessage'));
  let localMessageJson = localMessage;
  if (localMessageJson) {
    localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
  } else {
    localMessageJson = [];
    localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
  }
  localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
}

const doCreateChatBox = async function(caseId){
  let dfd = $.Deferred();
  let userdata = JSON.parse(localStorage.getItem('userdata'));
  let caseRes = await $.post('/api/cases/select/'+ caseId, {});
  console.log(caseRes);
  if (caseRes){
    caseItem = caseRes.Records[0];
    let patentFullName, patientHN, patientSA, caseBodypart;
    patentFullName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
    patientHN = caseItem.case.patient.Patient_HN;
    patientSA = caseItem.case.patient.Patient_Age + '/' + caseItem.case.patient.Patient_Sex;
    caseBodypart = caseItem.case.Case_BodyPart;

    let simpleChatBoxOption = {
      topicId: caseId,
      topicName: patientHN + ' ' + patentFullName + ' ' + patientSA + ' ' + caseBodypart,
      topicStatusId: caseItem.case.casestatusId,
      myId: userdata.username,
      myName: userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH,
      myDisplayName: 'ฉัน',
      audienceId: caseItem.Radiologist.username,
      audienceName: caseItem.Radiologist.User_NameTH + ' ' + caseItem.Radiologist.User_LastNameTH,
      wantBackup: true,
      externalClassStyle: {},
      sendMessageCallback: doSendMessageCallback,
      resetUnReadMessageCallback: doResetUnReadMessageCallback
    };
    let callRadioView = $('<div style="width: 99%; padding: 2px;"></div>');
    let caseView = $('<div style="padding: 5px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');
    let caseTitleBox = doCreateCaseTitle();
    $(caseTitleBox).appendTo($(caseView));
    $(caseTitleBox).find('#PatientHN').text(patientHN);
		$(caseTitleBox).find('#PatentFullName').text(patentFullName);
		$(caseTitleBox).find('#PatientSA').text(patientSA);
		$(caseTitleBox).find('#CaseBodypart').text(caseBodypart);

    let caseResultInfoBox = await doCreateResulteSection(caseId);
		$(caseResultInfoBox).appendTo($(caseView));

    $(callRadioView).append($(caseView));

    let simpleChatBox = $('<div id="SimpleChatBox"></div>');
    let simpleChatBoxHandle = $(simpleChatBox).chatbox(simpleChatBoxOption);
    $(simpleChatBox).css({width: '100%'})
    await simpleChatBoxHandle.restoreLocal();
    $(callRadioView).append($(simpleChatBox));
    simpleChatBoxHandle.scrollDown();
    dfd.resolve($(callRadioView));
  } else {
    dfd.resolve();
  }
  return dfd.promise();
}

const doSendMessageCallback = async function(msg, sendto, from, context){
  let dfd = $.Deferred();
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  let msgSend = {type: 'message', msg: msg, sendto: sendto, from: from, context: context};
  wsm.send(JSON.stringify(msgSend));
  if (context.topicStatusId != 14) {
    let newStatus = 14;
    let newDescription = 'Case have Issue Message to Radio.';

		let hospitalId = userdata.hospitalId;
		let userId = userdata.userId;
		let rqParams = { hospitalId: hospitalId, userId: userId, caseId: context.topicId, casestatusId: newStatus, caseDescription: newDescription};

    let updateStatusRes = await $.post('/api/cases/status/' + context.topicId, rqParams);
    console.log(updateStatusRes);
    if (updateStatusRes.status.code == 200){
      let selector = '#'+sendto + ' .chatbox';
      let targetChatBox = $(selector);
      let eventData = {topicStatusId: 14};
      $(targetChatBox).trigger('updatetopicstatus', [eventData]);
    } else {
      $.notify('Now. can not update case status.', 'warn');
    }
  }
  dfd.resolve();
  return dfd.promise();
}

const doResetUnReadMessageCallback = function(audienceId, value){
  let selector = '#'+audienceId + ' .reddot';
  let lastValue = $(selector).text();
  let newValue = Number(lastValue) + value;
  if (newValue > 0) {
    $(selector).text(newValue);
    $(selector).show()
  } else {
    $(selector).hide()
  }
}

const pageLineStyle = {'border': '2px solid blue', 'background-color': '#02069B', 'margin-top': '4px', 'padding': '2px'};

const doCreateCaseTitle = function(){
  let caseTitle = $('<div id="CaseTitle"></div>');
  let summaryLine = $('<div></div>');
  $(summaryLine).appendTo($(caseTitle));
  $(summaryLine).append($('<span><b>HN:</b> </span>'));
  $(summaryLine).append($('<span id="PatientHN" style="margin-left: 4px; color: white;"></span>'));
  $(summaryLine).append($('<span style="margin-left: 4px;"><b>Name:</b> </span>'));
  $(summaryLine).append($('<span id="PatentFullName" style="margin-left: 4px; color: white;"></span>'));
  $(summaryLine).append($('<span style="margin-left: 4px;"><b>Age/sex:</b> </span>'));
  $(summaryLine).append($('<span id="PatientSA" style="margin-left: 4px; color: white;"></span>'));
  $(summaryLine).append($('<span style="margin-left: 4px;"><b>Body Part:</b> </span>'));
  $(summaryLine).append($('<span id="CaseBodypart" style="margin-left: 4px; color: white;"></span>'));
  $(summaryLine).css(pageLineStyle);
  return $(caseTitle);
}

const doCreateResulteSection = async function(caseId) {
  let dfd = $.Deferred();
  let resultBox = $('<div></div>');
  let resultTitle = $('<div><span><b>ผลอ่าน</b></span></div>');
  $(resultTitle).appendTo($(resultBox));
  let resultContentBox = await doCreateCaseResult(caseId);
  let resultView = $('<div style="width: 99%; padding: 4px; border: 2px solid grey; background-color: white; min-height: 100px"></div>')
  $(resultView).append($(resultContentBox));
  $(resultView).appendTo($(resultBox));

  let hideShowToggleCmd = $('<span style="float: right; cursor: pointer;">ซ่อนผลอ่าน</span>');
  $(hideShowToggleCmd).on('click', function(evt){
    let state = $(resultView).css('display');
    if (state === 'block') {
      $(resultView).slideUp();
      $(hideShowToggleCmd).text('แสดงผลอ่าน');
    } else {
      $(resultView).slideDown();
      $(hideShowToggleCmd).text('ซ่อนผลอ่าน');
    }
  });
  $(hideShowToggleCmd).appendTo($(resultTitle));
  dfd.resolve($(resultBox));
  return dfd.promise();
}

const doCreateCaseResult = async function(caseId){
  let dfd = $.Deferred();
  let resultRes = await $.post('/api/cases/result/'+ caseId, {});
  let resultReport = resultRes.Records[0];
  let pdfStream = await doCreateDownloadPDF(resultReport.PDF_Filename);
  let resultBox = $('<div style="width: 97%; padding: 10px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');
  let embetObject = $('<object data="' + resultReport.PDF_Filename + '" type="application/pdf" width="100%" height="480"></object>');
  $(embetObject).appendTo($(resultBox));
  dfd.resolve($(resultBox));
  return dfd.promise();
}

const doCreateGoToMainPageCmd = function(){
  let cmdBox = $('<div style="position: relative; width: 100%; margin-top: 50px; text-align: center;"></div>');
  let gomainCmd = $('<span style="cursor: pointer; background-color: #02069B; color: white; min-width: 80px; min-height: 50px; border: 2px solid grey;">หน้าหลัก</span>');
  $(gomainCmd).appendTo($(cmdBox));
  $(gomainCmd).on('click', function(evt){
    window.location.replace('/refer/index.html');
  });
  return $(cmdBox);
}

const doCreateDownloadPDF = function(pdfLink){
  let dfd = $.Deferred();
  $.ajax({
    url: pdfLink,
    success: function(response){
			let stremLink = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
      dfd.resolve(stremLink);
		}
	});
  return dfd.promise();
}
