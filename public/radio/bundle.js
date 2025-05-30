(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* apiconnect.js */

const proxyRootUri = '/api';
const proxyApi = '/apiproxy';
const proxyEndPoint = "/callapi";

const adminEmailAddress = 'oudsoft@yahoo.com';

const orthancProxyApi = '/orthancproxy';

const arrFilterValue = (arr, key, value)=> arr.filter(v => v[key] === value);


module.exports = function ( jq ) {
	const $ = jq;

	const doTestAjaxCallApi = function () {
		return new Promise(function(resolve, reject) {
			let testURL = "../api/chk_login.php";
			$.ajax({
				type: 'POST',
				url: testURL ,
				dataType: 'json',
				data: JSON.stringify({ username: "limparty", password: "Limparty" }) /*,
				headers: {
					authorization: localStorage.getItem('token')
				}
				*/
			}).then(function(httpdata) {
				resolve(httpdata);
			});
		});
	}

  const doCallApiByAjax = function(url, payload){
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        type: 'post',
        data: payload,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          xhr.onprogress = function(e) {
            // For downloads
            console.log('down prog=>', e);
            if (e.lengthComputable) {
              console.log(e.loaded / e.total);
            }
          };
          xhr.upload.onprogress = function (e) {
            // For uploads
            console.log('up prog=>', e);
            if (e.lengthComputable) {
              console.log(e.loaded / e.total);
            }
          };
          return xhr;
        }
      }).done(function (e) {
        resolve(e)
      }).fail(function (e) {
        reject(e)
      });
    });
  }

	const doCallApiDirect = function (apiUrl, params) {
		return new Promise(function(resolve, reject) {
			$.post(apiUrl, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

	const doCallApiByProxy = function (proxyUrl, params) {
		return new Promise(function(resolve, reject) {
			$.post(proxyUrl, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

  const doCallApi = function (apiurl, params) {
		return new Promise(function(resolve, reject) {
      let apiname = apiurl;
      const progBar = $('body').radprogress({value: 0, apiname: apiname});
      $(progBar.progressBox).screencenter({offset: {x: 50, y: 50}});
      let apiURL = apiurl;
      if (window.location.hostname == 'localhost') {
        apiURL = 'https://radconnext.tech' + apiurl;
      }
      $.ajax({
        url: apiURL,
        type: 'post',
        data: params,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          xhr.onprogress = function(evt) {
            if (evt.lengthComputable) {
              // For Download
              /*
              var event = new CustomEvent('response-progress', {detail: {event: evt, resfrom: apiurl}});
              document.dispatchEvent(event);
              */

							/*
              let loaded = evt.loaded;
              let total = evt.total;
              let prog = (loaded / total) * 100;
              let perc = prog.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              $('body').find('#ProgressValueBox').text(perc + '%');
							*/
            }
          };
          xhr.upload.onprogress = function (evt) {
            // For uploads
          };
          return xhr;
        }
      }).done(function (res) {
        progBar.doUpdateProgressValue(100);
        setTimeout(()=>{
  				progBar.doCloseProgress();

          let apiItem = {api: apiurl};
          console.log(apiItem);
					/*
          let logWin = $('body').find('#LogBox');
          $(logWin).simplelog(apiItem);
					*/
          resolve(res)
        }, 1000);
      }).fail(function (err) {
        reject(err);
      });
		});
	}

  const doGetApi = function (apiurl, params) {
		return new Promise(function(resolve, reject) {
      let apiURL = apiurl;
      if (window.location.hostname == 'localhost') {
        apiURL = 'https://radconnext.tech' + apiurl;
      }
			$.get(apiURL, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

	const doGetResourceByProxy = function(params) {
		return new Promise(function(resolve, reject) {
			let proxyEndPoint = proxyRootUri + proxyApi + '/getresource';
			$.post(proxyEndPoint, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

	const doCallOrthancApiByProxy = function(params) {
		return new Promise(function(resolve, reject) {
			let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/find';
			$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

  const doCallReportBug = function(params){
    return new Promise(function(resolve, reject) {
			let reportBugEndPoint = proxyRootUri + '/bug/report/email';
			$.post(reportBugEndPoint, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
  }

	const doCallDicomPreview = function(instanceID, username){
		return new Promise(function(resolve, reject) {
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/preview/' + instanceID;
  		let params = {username: username};
  		$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
  	});
	}

	const doCallDownloadDicom = function(studyID, hospitalId){
		return new Promise(function(resolve, reject) {
      const progBar = $('body').radprogress({value: 0, apiname: 'Preparing Zip File'});
      $(progBar.progressBox).screencenter({offset: {x: 50, y: 50}});
      $(progBar.progressValueBox).remove();
      $(progBar.progressBox).css({'font-size': '50px'});
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/loadarchive/' + studyID;
  		let params = {hospitalId: hospitalId};
      //doCallApi(orthancProxyEndPoint, params).then((data)=>{
  		$.post(orthancProxyEndPoint, params, function(data){
        progBar.doCloseProgress();
				resolve(data);
      }).fail(function(error) {
        progBar.doCloseProgress();
				reject(error);
			});
  	});
	}

  const doCrateDicomAdvance = function(studyID, hospitalId){
		return new Promise(function(resolve, reject) {
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/create/archive/advance/' + studyID;
  		let params = {hospitalId: hospitalId};
      doCallApi(orthancProxyEndPoint, params).then((data)=>{
  		//$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			});
  	});
	}

	const doCallTransferDicom = function(studyID, username){
		return new Promise(function(resolve, reject) {
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/transferdicom/' + studyID;
  		let params = {username: username};
  		$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
  	});
	}

	const doCallTransferHistory = function(filename){
		return new Promise(function(resolve, reject) {
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/transferhistory';
  		let params = {filename: filename};
  		$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
		});
	}

	const doCallDeleteDicom = function (studyID, hospitalId) {
		return new Promise(function(resolve, reject) {
  		let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/deletedicom/' + studyID;
  		let params = {hospitalId: hospitalId};
  		$.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
  	});
	}

  const doGetOrthancPort = function(hospitalId) {
    return new Promise(function(resolve, reject) {
      let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/orthancexternalport';
      let params = {hospitalId: hospitalId};
      $.get(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
    });
  }

  const doCallDicomArchiveExist = function(archiveFilename){
    return new Promise(function(resolve, reject) {
      let orthancProxyEndPoint = proxyRootUri + orthancProxyApi + '/archivefile/exist';
      let params = {filename: archiveFilename};
      $.post(orthancProxyEndPoint, params, function(data){
				resolve(data);
			})
    });
  }

  const doConvertPageToPdf = function(pageUrl){
    return new Promise(function(resolve, reject) {
      let convertorEndPoint = proxyRootUri + "/convertfromurl";;
      let params = {url: pageUrl};
			$.post(convertorEndPoint, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
    });
  }

  const doDownloadResult = function(caseId, hospitalId, userId, patient){
    return new Promise(async function(resolve, reject) {
      let reportCreateCallerEndPoint = proxyRootUri + "/casereport/create";;
      let params = {caseId: caseId, hospitalId: hospitalId, userId: userId, pdfFileName: patient};
			let reportPdf = await $.post(reportCreateCallerEndPoint, params);
      resolve(reportPdf);
    });
  }

  const doConvertPdfToDicom = function(caseId, hospitalId, userId, studyID, modality, studyInstanceUID){
    return new Promise(function(resolve, reject) {
      let convertorEndPoint = proxyRootUri + "/casereport/convert";;
      let params = {caseId, hospitalId, userId, studyID, modality, studyInstanceUID};
			$.post(convertorEndPoint, params, function(data){
				resolve(data);
			}).fail(function(error) {
        console.log('convert error', error);
				reject(error);
			});
    });
  }

  const doCallNewTokenApi = function() {
    return new Promise(function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      var newTokenApiUri = '/api/login/newtoken';
      var params = {username: userdata.username};
      $.post(newTokenApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log('doCallNewTokenApi=>', JSON.stringify(err));
        reject(err);
  		})
  	});
  }

  const doCallLoadStudyTags = function(hospitalId, studyId){
    return new Promise(async function(resolve, reject) {
      let rqBody = '{"Level": "Study", "Expand": true, "Query": {"PatientName":"TEST"}}';
      let orthancUri = '/studies/' + studyId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
      let callLoadUrl = '/api/orthancproxy/find'
      $.post(callLoadUrl, params).then((response) => {
        resolve(response);
      });
    });
  }

  const doReStructureDicom = function(hospitalId, studyId, dicom){
    return new Promise(async function(resolve, reject) {
      let params = {hospitalId: hospitalId, resourceId: studyId, resourceType: "study", dicom: dicom};
      let restudyUrl = '/api/dicomtransferlog/add';
      $.post(restudyUrl, params).then((response) => {
        resolve(response);
      });
    });
  }

  /* Zoom API Connection */

  const zoomUserId = 'vwrjK4N4Tt284J2xw-V1ew';

  const meetingType = 2; // 1, 2, 3, 8
  const totalMinute = 15;
  const meetingTimeZone = "Asia/Bangkok";
  const agenda = "RADConnext";
  const joinPassword = "RAD1234";

  const meetingConfig ={
    host_video: false,
    participant_video: true,
    cn_meeting: false,
    in_meeting: false,
    join_before_host: true,
    mute_upon_entry: false,
    watermark: false,
    use_pmi: false,
    waiting_room: false,
    approval_type: 0, // 0, 1, 2
    registration_type: 1, // 1, 2, 3
    audio: "both",
    auto_recording: "none",
    alternative_hosts: "",
    close_registration: true,
    //global_dial_in_countries: true,
    registrants_email_notification: false,
    meeting_authentication: false,
  }

  const doGetZoomMeeting = function(incident, startMeetingTime, hospitalName) {
    return new Promise(function(resolve, reject) {
      let reqParams = {};
      reqParams.zoomUserId = zoomUserId;
      let reqUrl = '/api/zoom/listmeeting';
      doCallApi(reqUrl, reqParams).then((meetingsRes)=>{
        //console.log(meetingsRes);
        reqUrl = '/api/zoom/getmeeting';
        reqParams = {};
        let meetings = meetingsRes.response.meetings;
        let readyMeetings = [];
        var promiseList = new Promise(async function(inResolve, inReject){
          await meetings.forEach(async (item, i) => {
            reqParams.meetingId = item.id;
            let meetingRes = await doCallApi(reqUrl, reqParams);
            console.log(meetingRes);
            if ((meetingRes.response) && (meetingRes.response.status)){
              if (meetingRes.response.status === 'waiting') {
                readyMeetings.push(item);
                return;
              } else if (meetingRes.response.status === 'end') {
                reqUrl = '/api/zoom/deletemeeting';
                meetingRes = await doCallApi(reqUrl, reqParams);
              }
            } else {
              return;
            }
          });
          setTimeout(()=> {
            inResolve(readyMeetings);
          }, 1200);
        });
        Promise.all([promiseList]).then(async (ob)=>{
          let patientFullNameEN = incident.case.patient.Patient_NameEN + ' ' + incident.case.patient.Patient_LastNameEN;
          let patientHN = incident.case.patient.Patient_HN;
          if (ob[0].length >= 1) {
            let readyMeeting = ob[0][0];
            console.log('readyMeeting =>', readyMeeting);
            console.log('case dtail =>', incident);
            //update meeting for user
            let joinTopic = 'โรงพยาบาล' + hospitalName + '  ' + patientFullNameEN + '  HN: ' + patientHN;
            let startTime = startMeetingTime;
            let zoomParams = {
              topic: joinTopic,
              type: meetingType,
              start_time: startTime,
              duration: totalMinute,
              timezone: meetingTimeZone,
              password: joinPassword,
              agenda: agenda
            };
            zoomParams.settings = meetingConfig;
            reqParams.params = zoomParams;
            reqUrl = '/api/zoom/updatemeeting';
            let meetingRes = await doCallApi(reqUrl, reqParams);
            console.log('update result=>', meetingRes);
            reqUrl = '/api/zoom/getmeeting';
            reqParams = {meetingId: readyMeeting.id};
            meetingRes = await doCallApi(reqUrl, reqParams);
            console.log('updated result=>', meetingRes);
            resolve(meetingRes.response);
          } else {
            //create new meeting
            reqUrl = '/api/zoom/createmeeting';
            reqParams.zoomUserId = zoomUserId;
            let joinTopic =  'โรงพยาบาล' + hospitalName + ' ' + patientFullNameEN + ' HN: ' + patientHN;
            let startTime = startMeetingTime;
            let zoomParams = {
              topic: joinTopic,
              type: meetingType,
              start_time: startTime,
              duration: totalMinute,
              timezone: meetingTimeZone,
              password: joinPassword,
              agenda: agenda
            };
            zoomParams.settings = meetingConfig;
            reqParams.params = zoomParams;
            doCallApi(reqUrl, reqParams).then((meetingsRes)=>{
              console.log('create meetingsRes=>', meetingsRes);
              reqUrl = '/api/zoom/getmeeting';
              reqParams = {};
              reqParams.meetingId = meetingsRes.response.id;
              doCallApi(reqUrl, reqParams).then((meetingRes)=>{
                console.log('create meetingRes=>', meetingRes);
                resolve(meetingRes.response);
              });
            });
          }
        });
      });
    });
  }

	return {
		/* const */
		proxyRootUri,
		proxyApi,
		proxyEndPoint,

		orthancProxyApi,
    adminEmailAddress,

		/*method*/
		arrFilterValue,
		doTestAjaxCallApi,
    doCallApiByAjax,
		doCallApiDirect,
		doCallApiByProxy,
    doCallApi,
    doGetApi,
		doGetResourceByProxy,
		doCallOrthancApiByProxy,
    doCallReportBug,
		doCallDicomPreview,
		doCallDownloadDicom,
    doCrateDicomAdvance,
		doCallTransferDicom,
		doCallTransferHistory,
		doCallDeleteDicom,
    doGetOrthancPort,
    doCallDicomArchiveExist,
    doConvertPageToPdf,
    doDownloadResult,
    doConvertPdfToDicom,
    doCallNewTokenApi,
    doCallLoadStudyTags,
    doReStructureDicom,
    doGetZoomMeeting
	}
}

},{}],2:[function(require,module,exports){
/* commonlib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);

	const caseReadWaitStatus = [1];
	const caseResultWaitStatus = [2, 8, 9, 13, 14];
	const casePositiveStatus = [2,8,9];
	const caseNegativeStatus = [3,4,7];
	const caseReadSuccessStatus = [5, 10, 11, 12, 13, 14];
	const caseAllStatus = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
	const allCaseStatus = [
		{value: 1, DisplayText: 'เคสใหม่'},
		{value: 2, DisplayText: 'หมอตอบรับแล้ว่ '},
		{value: 3, DisplayText: 'หมอไม่ตอบรับ'},
		{value: 4, DisplayText: 'หมดอายุ'},
		{value: 5, DisplayText: 'ได้ผลอ่านแล้ว'},
		{value: 6, DisplayText: 'ปิดเคสไปแล้ว'},
		{value: 7, DisplayText: 'เคสถูกยกเลิก'},
		{value: 8, DisplayText: 'หมอเปิดอ่านแล้ว'},
		{value: 9, DisplayText: 'หมอเริ่มพิมพ์ผล'},
		{value: 10, DisplayText: 'เจ้าของเคสดูผลแล้ว'},
		{value: 11, DisplayText: 'เจ้าของเคสพิมพ์ผลแล้ว'},
		{value: 12, DisplayText: 'มีการแก้ไขผลอ่าน'},
		{value: 13, DisplayText: 'มีผลอ่านชั่วคราว'},
		{value: 14, DisplayText: 'มีข้อความประเด็นเคส'}
	];

	const allCaseStatusForRadio = [
		{value: 1, DisplayText: 'เคสใหม่'},
		{value: 2, DisplayText: 'หมอตอบรับแล้ว่ '},
		//{value: 3, DisplayText: 'หมอไม่ตอบรับ'},
		{value: 4, DisplayText: 'หมดอายุ'},
		{value: 5, DisplayText: 'ได้ผลอ่านแล้ว'},
		//{value: 6, DisplayText: 'ปิดเคสไปแล้ว'},
		//{value: 7, DisplayText: 'เคสถูกยกเลิก'},
		{value: 8, DisplayText: 'หมอเปิดอ่านแล้ว'},
		{value: 9, DisplayText: 'หมอเริ่มพิมพ์ผล'},
		{value: 10, DisplayText: 'เจ้าของเคสดูผลแล้ว'},
		{value: 11, DisplayText: 'เจ้าของเคสพิมพ์ผลแล้ว'},
		{value: 12, DisplayText: 'มีการแก้ไขผลอ่าน'},
		{value: 13, DisplayText: 'มีผลอ่านชั่วคราว'},
		{value: 14, DisplayText: 'มีข้อความประเด็นเคส'}
	];

	const defaultProfile = {
    readyState: 1,
		readyBy: 'user',
    screen: {
      lock: 30,
      unlock: 0
    },
    auotacc: 0,
    casenotify: {
      webmessage: 1,
      line: 1,
      autocall: 0,
      mancall:0
    }
  };

	const dicomTagPath = [
		{tag: 'StudyDate', path: 'MainDicomTags/StudyDate'},
		{tag: 'StudyTime', path: 'MainDicomTags/StudyTime'},
		{tag: 'Modality', path: 'SamplingSeries/MainDicomTags/Modality'},
		{tag: 'PatientName', path: 'PatientMainDicomTags/PatientName'},
		{tag: 'PatientID', path: 'PatientMainDicomTags/PatientID'},
		{tag: 'StudyDescription', path: 'MainDicomTags/StudyDescription'},
		{tag: 'ProtocolName', path: 'SamplingSeries/MainDicomTags/ProtocolName'}
	];

  const pageLineStyle = {'width': '100%', 'border': '2px solid gray', /*'border-radius': '10px',*/ 'background-color': '#ddd', 'margin-top': '4px', 'padding': '2px'};
	const headBackgroundColor = '#184175';

	const onSimpleEditorChange = function() {
		util.doResetPingCounter();
	}

	const jqteConfig = {format: false, fsize: false, ol: false, ul: false, indent: false, outdent: false,
		link: false, unlink: false, remove: false, /*br: false,*/ strike: false, rule: false,
		sub: false, sup: false, left: false, center: false, right: false /*, source: false
		change: onSimpleEditorChange */
	};
	const modalitySelectItem = ['CR', 'CT', 'MG', 'US', 'MR', 'AX'];
	const sizeA4Style = {width: '210mm', height: '297mm'};
	const quickReplyDialogStyle = { 'position': 'fixed', 'z-index': '33', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto',/* 'background-color': 'rgb(0,0,0)',*/ 'background-color': 'rgba(0,0,0,0.4)'};
	const quickReplyContentStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '620px', 'height': '500px'/*, 'font-family': 'THSarabunNew', 'font-size': '24px'*/ };

	let downloadDicomList = [];

  const doCallApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			apiconnector.doCallApi(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log('error at api ' + url);
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doGetApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			apiconnector.doGetApi(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(url);
				console.log(JSON.stringify(err));
			})
		});
	}

	const doCallLocalApi = function(apiurl, rqParams) {
		return new Promise(function(resolve, reject) {
			const progBar = $('body').radprogress({value: 0, apiname: apiurl});
      $(progBar.progressBox).screencenter({offset: {x: 50, y: 50}});
			$.ajax({
        url: apiurl,
        type: 'post',
        data: rqParams,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          xhr.onprogress = function(evt) {
            if (evt.lengthComputable) {
              // For Download
							/*
              let loaded = evt.loaded;
              let total = evt.total;
              let prog = (loaded / total) * 100;
              let perc = prog.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              $('body').find('#ProgressValueBox').text(perc + '%');
							*/
            }
          };
          xhr.upload.onprogress = function (evt) {
            // For uploads
          };
          return xhr;
        }
      }).done(function (res) {
        progBar.doUpdateProgressValue(100);
        setTimeout(()=>{
  				progBar.doCloseProgress();
          let apiItem = {api: apiurl};
          console.log(apiItem);
					/*
          let logWin = $('body').find('#LogBox');
					if (logWin) {
          	$(logWin).simplelog(apiItem);
					}
					*/
          resolve(res)
        }, 1000);
      }).fail(function (err) {
        reject(err);
      });
		});
	}

	const doGetLocalApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			$.get(apiURL, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

	const doCreateDicomFilterForm = function(execCallback){
		let studyFromDateInput = $('<input type="text" value="*" id="StudyFromDateInput" style="width: 50px;"/>');
		$(studyFromDateInput).datepicker({ dateFormat: 'dd-mm-yy' });
		$(studyFromDateInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let studyToDateInput = $('<input type="text" value="*" id="StudyToDateInput" style="width: 50px;"/>');
		$(studyToDateInput).datepicker({ dateFormat: 'dd-mm-yy' });
		$(studyToDateInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let patientHNInput = $('<input type="text" value="*" id="PatientHNInput" size="12"/>');
		$(patientHNInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let patientNameInput = $('<input type="text" value="*" id="PatientNameInput" size="15"/>');
		$(patientNameInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let modalityInput = $('<input type="text" value="*" id="ModalityInput" size="4"/>');
		$(modalityInput).on('keypress', function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let scanPartInput = $('<input type="text" value="*" id="ScanPartInput" style="width: 96.5%;"/>');
		$(scanPartInput).on('keypress', function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let filterFormRow = $('<div id="DicomFilterForm" style="display: table-row; width: 100%;"></div>');
		let studyDateCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(studyDateCell).append($(studyFromDateInput));
		$(studyDateCell).append($('<span style="margin-left: 5px; margin-right: 2px; display: inline-block;">-</span>'));
		$(studyDateCell).append($(studyToDateInput));
		let patentHNCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(patentHNCell).append($(patientHNInput));
		let patentNameCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(patentNameCell).append($(patientNameInput));
		let modalityCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(modalityCell).append($(modalityInput));
		let scanPartCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(scanPartCell).append($(scanPartInput));

		$(filterFormRow).append($('<div style="display: table-cell; text-align: left;" class="header-cell"></div>'));
		$(filterFormRow).append($(studyDateCell));
		$(filterFormRow).append($(patentHNCell));
		$(filterFormRow).append($(patentNameCell));
		$(filterFormRow).append($('<div style="display: table-cell; text-align: left;" class="header-cell"></div>'));
		$(filterFormRow).append($(modalityCell));
		$(filterFormRow).append($(scanPartCell));

		const doVerifyForm = function(){
			let studyFromDateValue = $(studyFromDateInput).val();
			let studyToDateValue = $(studyToDateInput).val();
			let patientNameValue = $(patientNameInput).val();
			let patientHNValue = $(patientHNInput).val();
			let modalityValue = $(modalityInput).val();
			let scanPartValue = $(scanPartInput).val();

			if ((studyFromDateValue === '') && (studyToDateValue === '') && (patientNameValue === '') && (patientHNValue === '') && (modalityValue === '') && (scanPartValue === '')){
				$(studyFromDateInput).css('border', '1px solid red');
				$(studyToDateInput).css('border', '1px solid red');
				$(patientHNInput).css('border', '1px solid red');
				$(patientNameInput).css('border', '1px solid red');
				$(modalityInput).css('border', '1px solid red');
				$(scanPartInput).css('border', '1px solid red');
			} else {
				$(studyFromDateInput).css('border', '');
				$(studyToDateInput).css('border', '');
				$(patientHNInput).css('border', '');
				$(patientNameInput).css('border', '');
				$(modalityInput).css('border', '');
				$(scanPartInput).css('border', '');

				let stdfdf = studyFromDateValue;
				if (studyFromDateValue !== '*') {
					let yy = studyFromDateValue.substr(6, 4);
					let mo = studyFromDateValue.substr(3, 2);
					let dd = studyFromDateValue.substr(0, 2);
					stdfdf = yy + mo + dd;
				}
				let stdtdf = studyToDateValue;
				if (studyToDateValue !== '*') {
					let yy = studyToDateValue.substr(6, 4);
					let mo = studyToDateValue.substr(3, 2);
					let dd = studyToDateValue.substr(0, 2);
					stdtdf = yy + mo + dd;
				}
				let filterValue = {studyFromDate: stdfdf, studyToDate: stdtdf, patientName: patientNameValue, patientHN: patientHNValue, modality: modalityValue, scanPart: scanPartValue};
				execCallback(filterValue);
			}
		}

		return $(filterFormRow);
	}

	const doSaveQueryDicom = function(filterData){
	  let searchQuery = {Level: "Study", Expand: true};
	  let dicomQuery = {};
		if (filterData.studyFromDate) {
	    dicomQuery.StudyFromDate = filterData.studyFromDate;
	  }
		if (filterData.studyToDate) {
	    dicomQuery.StudyToDate = filterData.studyToDate;
	  }
	  if (filterData.patientName) {
	    dicomQuery.PatientName = filterData.patientName;
	  }
	  if (filterData.patientHN) {
	    dicomQuery.PatientID = filterData.patientHN;
	  }
		if (filterData.modality) {
	    dicomQuery.Modality = filterData.modality;
	  }
	  if (filterData.scanPart) {
	    dicomQuery.ScanPart = filterData.scanPart;
	  }
	  searchQuery.Query = dicomQuery;
	  localStorage.setItem('dicomfilter', JSON.stringify(searchQuery));
	}

	const dicomFilterLogic = function(logicPairs){
		return new Promise(function(resolve, reject) {
			if (logicPairs.length == 0) {
				resolve(true);
			} else {
				let logicAns = true;
				let	promiseList = new Promise(function(resolve2, reject2){
					for (let i=0; i < logicPairs.length; i++){
						let pair = logicPairs[i];

						let realKey = pair.key;
						let indexAt = realKey.indexOf('*');
		        if (indexAt == 0) {
		          realKey = realKey.substring(1);
		        } else if (indexAt == (realKey.length-1)) {
							realKey = realKey.substring(0, (realKey.length-1));
						} else {
							realKey = realKey;
						}
						let key = realKey;
						let value = pair.value;
						let op = pair.op;
						switch (op) {
				      case '==':
				        logicAns = logicAns && (value.indexOf(key) >= 0);
				      break;
				      case '>=':
				        logicAns = logicAns && (value >= key);
				      break;
				      case '<=':
								logicAns = logicAns && (value <= key);
							break;
						}
					}
					setTimeout(()=>{
						resolve2(logicAns);
					}, 10);
				});
				Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
			}
		});
	}

	const doFilterDicom = function(dicoms, query){
		return new Promise(function(resolve, reject) {
			let studyFromDate = query.StudyFromDate;
			let studyToDate = query.StudyToDate;
			let modality = query.Modality;
			let patientName = query.PatientName;
			let patientID = query.PatientID;
			let scanPart = query.ScanPart;

			let studies = [];

			let	promiseList = new Promise(async function(resolve2, reject2){
				let i = 0;
				while ( i < dicoms.length ) {
					let keyPairs = [];
					let studyTag = dicoms[i];

					let studyDateValue = studyTag.MainDicomTags.StudyDate;
					let modalityValue = studyTag.SamplingSeries.MainDicomTags.Modality;
					let patientNameValue = studyTag.PatientMainDicomTags.PatientName;
					let patientIDValue = studyTag.PatientMainDicomTags.PatientID;
					let studyDescriptionValue = studyTag.MainDicomTags.StudyDescription;
					let protocolNameValue = studyTag.SamplingSeries.MainDicomTags.ProtocolName;

					if ((studyFromDate) && (studyFromDate !== '*')) {
						if ((studyToDate) && (studyToDate !== '*')) {
							let fromPair = {value: studyDateValue, key: studyFromDate, op: '>='};
							let toPair = {value: studyDateValue, key: studyToDate, op: '<='};
							keyPairs.push(fromPair);
							keyPairs.push(toPair);
						} else {
							let fromPair = {value: studyDateValue, key: studyFromDate, op: '=='};
							keyPairs.push(fromPair);
						}
					} else {
						if ((studyToDate) && (studyToDate !== '*')) {
							let toPair = {value: studyDateValue, key: studyToDate, op: '<='};
							keyPairs.push(toPair);
						}
					}

					if ((modality) && (modality !== '*')) {
						let modPair = {value: modalityValue, key: modality, op: '=='};
						keyPairs.push(modPair);
					}


					if ((patientName) && (patientName !== '*')) {
						let patientNamePair = {value: patientNameValue, key: patientName, op: '=='};
						keyPairs.push(patientNamePair);
					}


					if ((patientID) && (patientID !== '*')) {
						let patientIDPair = {value: patientIDValue, key: patientID, op: '=='};
						keyPairs.push(patientIDPair);
					}

					if ((scanPart) && (scanPart !== '*')) {
						let scanPartPair = undefined;
						if ((studyDescriptionValue) && (studyDescriptionValue !== '')){
							scanPartPair = {value: studyDescriptionValue, key: scanPart, op: '=='};
						} else if ((protocolNameValue) && (protocolNameValue !== '')){
							scanPartPair = {value: protocolNameValue, key: scanPart, op: '=='};
						} else {
							scanPartPair = {value: '', key: scanPart, op: '=='};
						}
						keyPairs.push(scanPartPair);
					}


					let filterCheck = await dicomFilterLogic(keyPairs);
					if(filterCheck == true){
						studies.push(studyTag);
					}

					i++;
				}
				setTimeout(()=>{
          resolve2(studies);
        }, 1100);
			});
			Promise.all([promiseList]).then(async(ob)=>{
				await ob[0].sort((a,b) => {
					let av = util.getDatetimeValue(a.MainDicomTags.StudyDate, a.MainDicomTags.StudyTime);
					let bv = util.getDatetimeValue(b.MainDicomTags.StudyDate, b.MainDicomTags.StudyTime);
					if (av && bv) {
						return bv - av;
					} else {
						return 0;
					}
				});
				resolve(ob[0]);
			});
		});
	}

	const doUserLogout = function(wsm) {
	  if (wsm) {
	  	let userdata = JSON.parse(localStorage.getItem('userdata'));
	    wsm.send(JSON.stringify({type: 'logout', username: userdata.username}));
			if (userdata.usertypeId == 4){
				localStorage.removeItem('draftbackup');
			}
	  }
	  localStorage.removeItem('token');
		localStorage.removeItem('userdata');
		localStorage.removeItem('masternotify');
		//localStorage.removeItem('caseoptions');
		//localStorage.removeItem('rememberwantsavescanpart');
		sessionStorage.removeItem('logged');
	  let url = '/index.html';
	  window.location.replace(url);
	}

  const doOpenStoneWebViewer = function(StudyInstanceUID, hosId) {
		//const orthancWebviewerUrl = 'http://' + window.location.hostname + ':8042/web-viewer/app/viewer.html?series=';
		let hospitalId = undefined;
		if (hosId) {
			hospitalId = hosId;
		} else {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			hospitalId = userdata.hospitalId;
		}
		apiconnector.doGetOrthancPort(hospitalId).then((response) => {
			//const orthancStoneWebviewer = 'http://'+ window.location.hostname + ':' + response.port + '/stone-webviewer/index.html?study=';
			const orthancStoneWebviewer = 'http://'+ response.ip + ':' + response.port + '/stone-webviewer/index.html?study=';
			let orthancwebapplink = orthancStoneWebviewer + StudyInstanceUID + '&user=' + userdata.username;
			window.open(orthancwebapplink, '_blank');
		});
	}

  const doDownloadDicom = function(studyID, dicomFilename){
		//$('body').loading('start');
		/*
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		const hospitalId = userdata.hospitalId;
  	apiconnector.doCallDownloadDicom(studyID, hospitalId).then((response) => {
			var pom = document.createElement('a');
			pom.setAttribute('href', response.link);
			pom.setAttribute('download', dicomFilename);
			pom.click();
			$('body').loading('stop');
  	}).catch((err)=>{
			console.log(err);
			$('body').loading('stop');
		});
		*/
		let downloadURL = 'https://radconnext.tech/img/usr/zip/' + dicomFilename;
		console.log(downloadURL);
		let pom = document.createElement('a');
		pom.setAttribute('href', downloadURL);
		pom.setAttribute('target', '_blank');
		pom.setAttribute('download', dicomFilename);
		pom.click();
		//$('body').loading('stop');
  }

	const doDownloadLocalDicom = function(studyID, dicomFilename){
		return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			const dicomUrl = '/api/orthanc/download/dicom/archive';
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {StudyID: studyID, UsrArchiveFileName: dicomFilename});
			//console.log(dicomStudiesRes);
			var pom = document.createElement('a');
			pom.setAttribute('href', dicomStudiesRes.result.archive);
			pom.setAttribute('download', dicomFilename);
			pom.click();
			resolve(dicomStudiesRes.result);
			//$('body').loading('stop');
		});
	}

	const doDeleteLocalDicom = function(studyID){
		return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			const dicomUrl = '/api/orthanc/delete/study';
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {StudyID: studyID});
			resolve(dicomStudiesRes.result);
			//$('body').loading('stop');
		});
	}

	const doCountImageLocalDicom = function(studyID){
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/study/count/instances';
			const rqParams = {StudyID: studyID};
			$.post(dicomUrl, rqParams, function(response){
				resolve(response.result);
			});
		});
	}

	const doSeekingAttachFile = function(patientNameEN){
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/attach/file';
			const rqParams = {PatientNameEN: patientNameEN};
			$.post(dicomUrl, rqParams, function(response){
				resolve(response);
			});
		});
	}

  const doPreparePatientParams = function(newCaseData){
		let rqParams = {};
		let patientFragNames = newCaseData.patientNameEN.split(' ');
		let patientNameEN = patientFragNames[0];
		let patientLastNameEN = patientFragNames[0];
		if (patientFragNames.length >= 2) {
			if (patientFragNames[1] !== '') {
				patientLastNameEN = patientFragNames[1];
			} else {
				let foundNotBlank = patientFragNames.find((item, i) =>{
					if (i > 1) {
						if (patientFragNames[i] !== '') {
							return item;
						}
					}
				});
				if (foundNotBlank){
					patientLastNameEN = foundNotBlank;
				} else {
					patientLastNameEN = patientNameEN;
				}
			}
		}
		patientFragNames = newCaseData.patientNameTH.split(' ');
		let patientNameTH = patientFragNames[0];
		let patientLastNameTH = patientFragNames[0];
		if (patientFragNames.length >= 2) {
			if (patientFragNames[1] !== '') {
				patientLastNameTH = patientFragNames[1];
			} else {
				let foundNotBlank = patientFragNames.find((item, i) =>{
					if (i > 1) {
						if (patientFragNames[i] !== '') {
							return item;
						}
					}
				});
				if (foundNotBlank){
					patientLastNameTH = foundNotBlank;
				} else {
					patientLastNameTH = patientNameTH;
				}
			}
		}
		rqParams.Patient_HN = newCaseData.hn;
		rqParams.Patient_NameTH = patientNameTH;
		rqParams.Patient_LastNameTH = patientLastNameTH;
		rqParams.Patient_NameEN = patientNameEN;
		rqParams.Patient_LastNameEN = patientLastNameEN;
		rqParams.Patient_CitizenID = newCaseData.patientCitizenID;
		rqParams.Patient_Birthday = newCaseData.patientBirthDate;
		rqParams.Patient_Age = newCaseData.patientAge;
		rqParams.Patient_Sex = newCaseData.patientSex;
		rqParams.Patient_Tel = '';
		rqParams.Patient_Address = '';
		return rqParams;
	}

  const doPrepareCaseParams = function(newCaseData) {
		let rqParams = {};
		rqParams.Case_OrthancStudyID = newCaseData.studyID;
		rqParams.Case_ACC = newCaseData.acc;
		rqParams.Case_BodyPart = newCaseData.bodyPart;
		rqParams.Case_ScanPart = newCaseData.scanpartItems;
		rqParams.Case_Modality = newCaseData.mdl;
		rqParams.Case_Manufacturer = newCaseData.manufacturer;
		rqParams.Case_ProtocolName = newCaseData.protocalName;
		rqParams.Case_StudyDescription  = newCaseData.studyDesc;
		rqParams.Case_StationName = newCaseData.stationName
		rqParams.Case_PatientHRLink = newCaseData.patientHistory;
		rqParams.Case_RadiologistId = newCaseData.drReader
		rqParams.Case_RefferalId = newCaseData.drOwner;
		rqParams.Case_RefferalName = '';
		rqParams.Case_Price = newCaseData.price;
		rqParams.Case_Department =  newCaseData.department;
		rqParams.Case_DESC = newCaseData.detail;
		rqParams.Case_StudyInstanceUID = newCaseData.studyInstanceUID
		return rqParams;
	}

	const doGetSeriesList = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			const dicomUrl = '/api/dicomtransferlog/select/' + studyId;
			let rqParams = {hospitalId: hospitalId, username: username};
			let dicomStudiesRes = await doCallApi(dicomUrl, rqParams);
			if (dicomStudiesRes.orthancRes.length > 0) {
				resolve(dicomStudiesRes.orthancRes[0].StudyTags);
			} else {
				resolve()
			}
		});
	}

	const doGetLocalSeriesList = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/select/study/' + studyId;
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {});
			resolve(dicomStudiesRes.result);
		});
	}

	const doGetOrthancStudyDicom = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let rqBody = '{"Level": "Study", "Expand": true, "Query": {"PatientName":"TEST"}}';
			let orthancUri = '/studies/' + studyId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
	  	let orthancRes = await apiconnector.doCallOrthancApiByProxy(params);
			resolve(orthancRes);
		});
	}

	const doGetOrthancSeriesDicom = function(seriesId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let rqBody = '{"Level": "Series", "Expand": true, "Query": {"PatientName":"TEST"}}';
			let orthancUri = '/series/' + seriesId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
	  	let orthancRes = await apiconnector.doCallOrthancApiByProxy(params);
			resolve(orthancRes);
		});
	}

	const doGetLocalOrthancSeriesDicom = function(seriesId) {
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/select/series/' + seriesId;
			let dicomSeriesRes = await doCallLocalApi(dicomUrl, {});
			resolve(dicomSeriesRes.result);
		});
	}

	const doCallCreatePreviewSeries = function(seriesId, instanceList){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let params = {hospitalId: hospitalId, seriesId: seriesId, username: username, instanceList: instanceList};
			let apiurl = '/api/orthancproxy/create/preview';
			let orthancRes = await apiconnector.doCallApi(apiurl, params);
			resolve(orthancRes);
		});
	}

	const doCallCreateZipInstance = function(seriesId, instanceId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let params = {hospitalId: hospitalId, seriesId: seriesId, username: username, instanceId: instanceId};
			let apiurl = '/api/orthancproxy/create/zip/instance';
			let orthancRes = await apiconnector.doCallApi(apiurl, params)
			resolve(orthancRes);
		});
	}

	const doCallSendAI = function(seriesId, instanceId, studyId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = { userId: userdata.id, hospitalId: userdata.hospitalId, seriesId: seriesId, instanceId: instanceId, studyId: studyId};
			let apiurl = '/api/orthancproxy/sendai';
			try {
				let orthancRes = await apiconnector.doCallApi(apiurl, params)
				resolve(orthancRes);
			} catch (err) {
				reject(err);
			}
		});
	}

	const doConvertAIResult = function(studyId, pdfcodes, modality){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = {hospitalId: userdata.hospitalId, username: userdata.id, studyId: studyId, pdfcodes: pdfcodes, modality: modality};
			let apiurl = '/api/orthancproxy/convert/ai/report';
			let orthancRes = await apiconnector.doCallApi(apiurl, params)
			resolve(orthancRes);
		});
	}

	const doCallAIResultLog = function(studyId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = { userId: userdata.id, studyId: studyId};
			let apiurl = '/api/ailog/select/' + studyId;
			let aiLogRes = await apiconnector.doCallApi(apiurl, params)
			resolve(aiLogRes);
		});
	}

	const doUpdateCaseStatus = function(id, newStatus, newDescription){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, caseId: id, casestatusId: newStatus, caseDescription: newDescription};
			let apiUrl = '/api/cases/status/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateCaseStatusByShortCut = function(id, newStatus, newDescription){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, caseId: id, casestatusId: newStatus, caseDescription: newDescription};
			let apiUrl = '/api/cases/status/shortcut/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateConsultStatus = function(id, newStatus){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, consultId: id, casestatusId: newStatus};
			let apiUrl = '/api/consult/status/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doCreateNewCustomUrgent = function(ugData){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let acceptStep = {dd: ugData.Accept.dd, hh: ugData.Accept.hh, mn: ugData.Accept.mn};
			let workingStep = {dd: ugData.Working.dd, hh: ugData.Working.hh, mn: ugData.Working.mn};
			let ugTypeData = {UGType: 'custom', UGType_Name: 'กำหนดเอง', UGType_ColorCode: '', UGType_AcceptStep: JSON.stringify(acceptStep), UGType_WorkingStep: JSON.stringify(workingStep), hospitalId: hospitalId};
			let rqData = {data: ugTypeData};
			let apiUrl = '/api/urgenttypes/add';
			try {
				let response = await doCallApi(apiUrl, rqData);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doCallSelectUrgentType = function(urgentId){
		return new Promise(async function(resolve, reject) {
			let apiUrl = '/api/urgenttypes/select/' + urgentId;
			let rqParams = {};
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateCustomUrgent = function(ugData, ugentId) {
		return new Promise(async function(resolve, reject) {
			let acceptStep = {dd: ugData.Accept.dd, hh: ugData.Accept.hh, mn: ugData.Accept.mn};
			let workingStep = {dd: ugData.Working.dd, hh: ugData.Working.hh, mn: ugData.Working.mn};
			let ugTypeData = {UGType_AcceptStep: JSON.stringify(acceptStep), UGType_WorkingStep: JSON.stringify(workingStep)};
			let rqParams = {id: ugentId, data: ugTypeData};
			let apiUrl = '/api/urgenttypes/update';
			try {
				let response = await doCallApi(apiUrl, ugTypeData);
				resolve(response);
			} catch(e) {
				reject(e);
			}
		});
	}

	const doLoadScanpartAux = function(studyDesc, protocolName){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, studyDesc: studyDesc, protocolName: protocolName};
			let apiUrl = 'https://radconnext.tech/api/scanpartaux/select';
			try {
				/*
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
				*/
				$.post(apiUrl, rqParams, function(response){
					resolve(response);
				});
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doFillSigleDigit = function(x) {
		if (Number(x) < 10) {
			return '0' + x;
		} else {
			return '' + x;
		}
	}

	const doDisplayCustomUrgentResult = function(dd, hh, mn, fromDate) {
		let totalShiftTime = (dd * 24 * 60 * 60 * 1000) + (hh * 60 * 60 * 1000) + (mn * 60 * 1000);
		let atDate;
		if (fromDate) {
			atDate = new Date(fromDate);
		} else {
			atDate = new Date();
		}
		let atTime = atDate.getTime() + totalShiftTime;
		atTime = new Date(atTime);
		let YY = atTime.getFullYear();
		let MM = doFillSigleDigit(atTime.getMonth() + 1);
		let DD = doFillSigleDigit(atTime.getDate());
		let HH = doFillSigleDigit(atTime.getHours());
		let MN = doFillSigleDigit(atTime.getMinutes());
		let td = `${YY}-${MM}-${DD} : ${HH}.${MN}`;
		return td;
	}

	const doFormatDateTimeCaseCreated = function(createdAt) {
		let atTime = new Date(createdAt);
		let YY = atTime.getFullYear();
		let MM = doFillSigleDigit(atTime.getMonth() + 1);
		let DD = doFillSigleDigit(atTime.getDate());
		let HH = doFillSigleDigit(atTime.getHours());
		let MN = doFillSigleDigit(atTime.getMinutes());
		let td = `${YY}-${MM}-${DD} : ${HH}.${MN}`;
		return td;
	}

	const formatNumberWithCommas = function(x) {
		if (x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			return undefined;
		}
	}

	const doRenderScanpartSelectedBox = function(scanparts) {
		return new Promise(async function(resolve, reject) {
			const doCreateHeaderField = function() {
	      //let headerFieldRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: ' + headBackgroundColor + '; color: white;"></div>');
				let headerFieldRow = $('<tr></tr>').css({'background-color': headBackgroundColor, 'color': 'white'})
				//let fieldCell = $('<div style="display: table-cell; padding: 2px; text-align: center;">ลำดับที่</div>');
				let fieldCell = $('<td></td>').attr({'width': '10%', 'align': 'left'}).text('ลำดับที่').css({'padding-left': '2px'});
	      $(fieldCell).appendTo($(headerFieldRow));
	      //fieldCell = $('<div style="display: table-cell; padding: 2px;">รหัส</div>');
				fieldCell = $('<td></td>').attr({'width': '20%', 'align': 'left'}).text('รหัส').css({'padding-left': '2px'});
	      $(fieldCell).appendTo($(headerFieldRow));
	      //fieldCell = $('<div style="display: table-cell; padding: 2px;">ชื่อ</div>');
				fieldCell = $('<td></td>').attr({'width': '40%', 'align': 'left'}).text('ชื่อ').css({'padding-left': '2px'});
	      $(fieldCell).appendTo($(headerFieldRow));
	      //fieldCell = $('<div style="display: table-cell; padding: 2px; text-align: right;">ราคา</div>');
				fieldCell = $('<td></td>').attr({'width': '20%', 'align': 'left'}).text('ราคา').css({'padding-left': '2px'});
	      $(fieldCell).appendTo($(headerFieldRow));
				//fieldCell = $('<div style="display: table-cell; padding: 2px;"></div>');
				fieldCell = $('<td></td>').attr({'width': '*', 'align': 'left'});
				$(fieldCell).appendTo($(headerFieldRow));
	      return $(headerFieldRow);
	    };

			//let selectedBox = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let selectedBox = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');

			let headerFieldRow = doCreateHeaderField();
			$(headerFieldRow).appendTo($(selectedBox));
			if ((scanparts) && (scanparts.length > 0)) {
				await scanparts.forEach((item, i) => {
					//let itemRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: #ccc;"></div>');
					let itemRow = $('<tr></tr>').css({'background-color': '#ccc'})
					$(itemRow).appendTo($(selectedBox));
					//let itemCell = $('<div style="display: table-cell; padding: 2px; text-align: center;">' + (i+1) + '</div>');
					let itemCell = $('<td></td>').attr({'align': 'left'}).text((i+1)).css({'padding-left': '10px'});
					$(itemCell).appendTo($(itemRow));
					//itemCell = $('<div style="display: table-cell; padding: 2px;">' + item.Code + '</div>');
					itemCell = $('<td></td>').attr({'align': 'left'}).text(item.Code).css({'padding-left': '2px'});
					$(itemCell).appendTo($(itemRow));
					//itemCell = $('<div style="display: table-cell; padding: 2px;">' + item.Name + '</div>');
					itemCell = $('<td></td>').attr({'align': 'left'}).text(item.Name).css({'padding-left': '2px'});
					$(itemCell).appendTo($(itemRow));
					//itemCell = $('<div style="display: table-cell; padding: 2px; text-align: right;">' + formatNumberWithCommas(item.Price) + '</div>');
					itemCell = $('<td></td>').attr({'align': 'left'}).text(formatNumberWithCommas(item.Price)).css({'padding-left': '2px'});
					$(itemCell).appendTo($(itemRow));

					let removeCmd = $('<img/>')
					$(removeCmd).attr('src', '/images/minus-sign-red-icon.png');
					$(removeCmd).attr('title', 'ลบ Scan Part');
					$(removeCmd).css({'cursor': 'pointer', 'width': '25px', 'height': 'auto'});
					$(removeCmd).on('click', (evt)=>{
						scanparts.splice(i, 1);
						$(itemRow).remove();
					});
					//itemCell = $('<div style="display: table-cell; padding: 2px;"></div>').css({'text-align': 'right', 'vertical-align': 'middle'});
					itemCell = $('<td></td>').attr({'align': 'center', 'valign': 'middle'});
					$(itemCell).append($(removeCmd));
					$(itemRow).append($(itemCell))
				});
			}
			resolve($(selectedBox));
		});
	}

	const getPatientFullNameEN = function (patientId) {
		return new Promise(async function(resolve, reject) {
			let rqParams = {patientId: patientId};
			let apiUrl = '/api/patient/fullname/en/' + patientId;
			try {
				//let response = await doCallApi(apiUrl, rqParams);
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doRenderScanpartSelectedAbs = function (scanparts) {
		return new Promise(async function(resolve, reject) {
			let scanPartBox = $('<div class="scanpart-box"></div>');
			let	promiseList = new Promise(function(resolve2, reject2){
				let joinText = '';
				for (let i=0; i < scanparts.length; i++){
					let item = scanparts[i];
					if (i != (scanparts.length-1)) {
						joinText += item.Name + ' / ';
					} else {
						joinText += item.Name;
					}
					/*
					if ((item.DF) && (item.DF !== '')) {
						joinText += ' ' + item.DF + ' บ.';
					}
					*/
				}
				$(scanPartBox).append($('<div>' + joinText + '</div>'));
				setTimeout(()=>{
          resolve2($(scanPartBox));
        }, 100);
      });
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doExtractList = function(originList, from, to) {
		return new Promise(async function(resolve, reject) {
			await originList.sort((a,b) => {
				if ((a.MainDicomTags) && (b.MainDicomTags)) {
					let aStudyDate = a.MainDicomTags.StudyDate;
					let aStudyTime = a.MainDicomTags.StudyTime
					let bStudyDate = b.MainDicomTags.StudyDate;
					let bStudyTime = b.MainDicomTags.StudyTime
					if ((aStudyDate) && (aStudyTime) && (bStudyDate) && (bStudyTime)) {
						let av = util.getDatetimeValue(aStudyDate, aStudyTime);
						let bv = util.getDatetimeValue(bStudyDate, bStudyTime);
						if (av && bv) {
							return bv - av;
						} else {
							return 0;
						}
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			});

			let exResults = [];
			let	promiseList = new Promise(function(resolve2, reject2){
				for (let i = (from-1); i < to; i++) {
					if (originList[i]){
						exResults.push(originList[i]);
					}
				}
				setTimeout(()=>{
          resolve2(exResults);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateCaseCmd = function(cmd, data, clickCallbak) {
		const cmdIcon = $('<img class="pacs-command" data-toggle="tooltip"/>');
		switch (cmd) {
			case 'view':
			$(cmdIcon).attr('src','/images/pdf-icon.png');
			$(cmdIcon).attr('title', 'Open Result Report.');
			break;

			case 'print':
			$(cmdIcon).attr('src','/images/print-icon.png');
			$(cmdIcon).attr('title', 'Print Result Report.');
			break;

			case 'convert':
			$(cmdIcon).attr('src','/images/convert-icon.png');
			$(cmdIcon).attr('title', 'Convert Result Report to Synapse (PACS).');
			break;

			case 'callzoom':
			$(cmdIcon).attr('src','/images/zoom-black-icon.png');
			$(cmdIcon).attr('title', 'Call Radiologist by zoom App.');
			break;

			case 'upd':
			$(cmdIcon).attr('src','/images/update-icon.png');
			$(cmdIcon).attr('title', 'Update Case data.');
			break;

			case 'delete':
			$(cmdIcon).attr('src','/images/delete-icon.png');
			$(cmdIcon).attr('title', 'Delete Case.');
			break;

			case 'ren':
			$(cmdIcon).attr('src','/images/renew-icon.png');
			$(cmdIcon).attr('title', 'Re-New Case.');
			break;

			case 'cancel':
			$(cmdIcon).attr('src','/images/cancel-icon.png');
			$(cmdIcon).attr('title', 'Cancel Case.');
			break;

			case 'edit':
			$(cmdIcon).attr('src','/images/status-icon.png');
			$(cmdIcon).attr('title', 'Edit Result.');
			break;

			case 'close':
			$(cmdIcon).attr('src','/images/closed-icon.png');
			$(cmdIcon).attr('title', 'Edit Result.');
			break;

			case 'log':
			$(cmdIcon).attr('src','/images/event-log-icon.png');
			$(cmdIcon).attr('title', 'Open Case Event Log.');
			break;

		}
		$(cmdIcon).on('click', (evt)=>{
			clickCallbak(data);
		});
		return $(cmdIcon);
	}

	const doCallMyUserTasksCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let username = userdata.username;
			let rqParams = {userId: userId, username: username, statusId: caseReadWaitStatus};
			let apiUrl = '/api/tasks/filter/user/' + userId;
			try {
				let response = await doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doFindTaksOfCase = function(tasks, caseId){
		return new Promise(async function(resolve, reject) {
			if (tasks) {
				let task = await tasks.find((item)=>{
					if (item.caseId == caseId) return item;
				});
				resolve(task);
			} else {
				resolve();
			}
		});
	}

	const doCreateLegentCmd = function(legentCmdClickCallback){
		let legentCmd = $('<img src="/images/question-icon.png" style="width: 25px; height: auto; padding: 1px; border: 2px solid #ddd; cursor: pointer; margin-top: 0px;" data-toggle="tooltip" title="วิธีพิมพ์ป้อน Study Description"/>');
		$(legentCmd).hover(()=>{
			$(legentCmd).css({'border': '2px solid grey'});
		},()=>{
			$(legentCmd).css({'border': '2px solid #ddd'});
		});
		$(legentCmd).on('click', (evt)=>{
			//doShowLegentCmdClick(evt);
			legentCmdClickCallback(evt);
		});
		let legentCmdBox = $('<span style="margin-left: 10px;"></span>');
		return $(legentCmdBox).append($(legentCmd));
	}

	const doShowStudyDescriptionLegentCmdClick = function(evt){
		const content = $('<div></div>');
		$(content).append($('<p>พิมพ์รายการ Study Description แต่ล่ะรายการ โดยคั่นด้วยเครื่องหมาย Comma (,)</p>'));
		const radalertoption = {
			title: 'วิธีพิมพ์ป้อน Study Description',
			msg: $(content),
			width: '610px',
			onOk: function(evt) {
				radAlertBox.closeAlert();
			}
		}
		let radAlertBox = $('body').radalert(radalertoption);
		$(radAlertBox.cancelCmd).hide();
	}

	const doScrollTopPage = function(){
		$("html, body").animate({ scrollTop: 0 }, "slow");
	  return false;
	}

	const genUniqueID = function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4();
	}

	const onSimpleEditorCopy = function(evt){
		let pathElems = evt.originalEvent.path;
		let simpleEditorPath = pathElems.find((path)=>{
			if (path.className === 'jqte_editor') {
				return path;
			}
		});
		if (simpleEditorPath) {
			let clipboardData = evt.originalEvent.clipboardData || window.clipboardData;
			let selection = document.getSelection();
			let container = document.createElement("div");
			let selContent = selection.getRangeAt(0).cloneContents();
			container.appendChild(selContent);
			clipboardData.setData('text/html', container.innerHTML);
			evt.preventDefault();
		}
	}

	const simpleEditorPaste = function(evt){
		let clipboardData = evt.originalEvent.clipboardData || window.clipboardData;
		let textPastedData = clipboardData.getData('text/plain');
		//console.log(textPastedData);
		let htmlPastedData = clipboardData.getData('text/html');
		//console.log(htmlPastedData);
		//let htmlFormat = htmlformat(htmlPastedData);
		//console.log(htmlFormat);
		let caseData = $('#SimpleEditorBox').data('casedata');
		let simpleEditor = $('#SimpleEditorBox').find('#SimpleEditor');
		let oldContent = $(simpleEditor).val();
		if ((htmlPastedData) && (htmlPastedData !== '')) {
			//console.log(htmlPastedData);
			let htmlFormat = htmlformat(htmlPastedData); //<-- ถ้าเป็น full html จะสกัดเอาเฉพาะใน body ของ html
			console.log(htmlFormat);
			htmlFormat = doExtractHTMLFromAnotherSource(htmlFormat);
			console.log(htmlFormat);
			document.execCommand('insertHTML', false, htmlFormat);
			let newContent = oldContent + htmlFormat;
			let draftbackup = {caseId: caseData.caseId, content: newContent, backupAt: new Date()};
			localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
			$('#SimpleEditorBox').trigger('draftbackupsuccess', [draftbackup]);
		} else {
			if ((textPastedData) && (textPastedData !== '')) {
				console.log(textPastedData);
				textPastedData = doExtractHTMLFromAnotherSource(textPastedData);
				document.execCommand('insertText', false, textPastedData);
				let newContent = oldContent + textPastedData;
				let draftbackup = {caseId: caseData.caseId, content: newContent, backupAt: new Date()};
				localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
				$('#SimpleEditorBox').trigger('draftbackupsuccess', [draftbackup]);
			}
		}
	}

	const onSimpleEditorPaste = function(evt){
		simpleEditorPaste(evt);
		evt.stopPropagation();
		evt.preventDefault();
	}

	const doExtractHTMLFromAnotherSource = function(anotherText){
		let startPointText = '<!--StartFragment-->';
		let endPointText = '<!--EndFragment-->';
		//let tempToken = anotherText.replace('\n', '');
		let tempToken = anotherText;
		let startPosition = tempToken.indexOf(startPointText);
		if (startPosition >= 0) {
			let endPosition = tempToken.indexOf(endPointText);
			tempToken = tempToken.slice((startPosition+20), (endPosition));
		}
		tempToken = tempToken.replace(startPointText, '<div>');
		tempToken = tempToken.replace(endPointText, '</div>');

		let regex = new RegExp('<'+'font'+'[^><]*>|<.'+'font'+'[^><]*>','gi')
		tempToken = tempToken.replace(regex, '');

		return tempToken;
	}

	const doCallLoadStudyTags = function(hospitalId, studyId){
		return new Promise(async function(resolve, reject) {
			let rqBody = '{"Level": "Study", "Expand": true, "Query": {"PatientName":"TEST"}}';
			let orthancUri = '/studies/' + studyId;
			let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
			let callLoadUrl = '/api/orthancproxy/find'
			$.post(callLoadUrl, params).then((response) => {
				resolve(response);
			});
		});
	}

	const doReStructureDicom = function(hospitalId, studyId, dicom){
		return new Promise(async function(resolve, reject) {
			let params = {hospitalId: hospitalId, resourceId: studyId, resourceType: "study", dicom: dicom};
			let restudyUrl = '/api/dicomtransferlog/add';
			$.post(restudyUrl, params).then((response) => {
				resolve(response);
			});
		});
	}

	const doCheckOutTime = function(d){
		let date = new Date(d);
		let hh = date.getHours();
		let mn = date.getMinutes();
		if (hh < 8) {
			return true;
		} else {
			if (hh == 8) {
				if (mn == 0) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
	}

	const doCallPriceChart = function(hospitalId, scanpartId){
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      //let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId, hospitalId: hospitalId, scanpartId: scanpartId};
      let apiUrl = '/api/pricechart/find';
			let response = await doGetApi(apiUrl, rqParams);
			resolve(response);
    });
  }

	const doCreateOpenCaseData = function(caseItem){
		let openCaseData = {caseId: caseItem.id, patientId: caseItem.patientId, hospitalId: caseItem.hospitalId};
		openCaseData.Modality = caseItem.Case_Modality;
		openCaseData.StudyDescription = caseItem.Case_StudyDescription;
		openCaseData.ProtocolName = caseItem.Case_ProtocolName;
		if ((openCaseData.StudyDescription == '') && (openCaseData.ProtocolName != '')) {
			openCaseData.StudyDescription = openCaseData.ProtocolName;
		}
		return openCaseData;
	}

	const doAddNotifyCustomStyle = function(){
    $.notify.addStyle('myshopman', {
      html: "<div class='superblue'><span data-notify-html/></div>",
      classes: {
        base: {
          "border": "3px solid white",
          "border-radius": "20px",
          "color": "white",
          "background-color": "#184175",
          "padding": "10px"
        },
        green: {
          "border": "3px solid white",
          "border-radius": "20px",
          "color": "white",
          "background-color": "green",
          "padding": "10px"
        },
        red: {
          "border": "3px solid white",
          "border-radius": "20px",
          "color": "white",
          "background-color": "red",
          "padding": "10px"
        }
      }
    });
  }

	const doFilterMajorType = function(masters, majorType) {
		return new Promise(async function(resolve, reject) {
			let result = await masters.filter((item) => {
				if (item.MajorType == majorType) {
					return item;
				}
			});
			resolve(result);
		})
	}

	const doFindMemberInMains = function(mains, members) {
		return new Promise(function(resolve, reject) {
			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i = 0; i < members.length; i++) {
					let memberItem = members[i];
					let result = await mains.filter((item)=>{
						if (item.id == memberItem.id) {
							return item;
						}
					});
					if (result.length == 0) {
						mains.push(memberItem);
					}
				}
				setTimeout(()=>{
          resolve2(mains);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doSelectUrgentMesh = function(scanparts, sumass) {
		return new Promise(function(resolve, reject) {
			if (scanparts.length == 1) {
				resolve(scanparts[0]);
			} else {
				let lastTTMinus = 0;
				let mesh = undefined;
				let	promiseList = new Promise(async function(resolve2, reject2){
					for (let i=0; i < scanparts.length; i++) {
						let sumas = await sumass.find((item)=>{
							if (item.id == scanparts[i].sumaseId) {
								return item;
							}
						});
						if (sumas) {
							let workingStep = sumas.UGType_WorkingStep;
							let workingStepMinus = Number(workingStep.mn) + (Number(workingStep.hh) * 60) + (Number(workingStep.dd) * 60 * 24);
							if (workingStepMinus > lastTTMinus) {
								lastTTMinus = workingStepMinus;
								mesh = scanparts[i];
							}
						} else {
							mesh = scanparts[0];
						}
					}
					setTimeout(()=>{
						resolve2(mesh);
					}, 100);
				});
				Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
			}
		});
	}

	const doArrangeNewUrgent = function(scanparts, sumass) {
		return new Promise(function(resolve, reject) {
			let newUrgentTypes = [];
			let meshUrgentTypes = [];
			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i = 0; i < scanparts.length; i++) {
					let majorType = scanparts[i].MajorType;
					let majors = await doFilterMajorType(sumass, majorType);
					newUrgentTypes = await doFindMemberInMains(newUrgentTypes, majors);
					meshUrgentTypes.push(scanparts[i]);
				}
				setTimeout(async()=>{
					let mesh = await doSelectUrgentMesh(meshUrgentTypes, sumass);
					meshUrgentTypes = [mesh];
					resolve2({newUrgentTypes, meshUrgentTypes});
				}, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  return {
		/* Constant share */
		caseReadWaitStatus,
		caseResultWaitStatus,
		casePositiveStatus,
		caseNegativeStatus,
		caseReadSuccessStatus,
		caseAllStatus,
		allCaseStatus,
		allCaseStatusForRadio,
		defaultProfile,
		dicomTagPath,
		pageLineStyle,
		headBackgroundColor,
		jqteConfig,
		modalitySelectItem,
		sizeA4Style,
		quickReplyDialogStyle,
		quickReplyContentStyle,
		downloadDicomList,
		/* Function share */
		doCallApi,
		doGetApi,
		doCallLocalApi,
		doGetLocalApi,
		doCreateDicomFilterForm,
		doSaveQueryDicom,
		doFilterDicom,
		doUserLogout,
		doOpenStoneWebViewer,
		doDownloadDicom,
		doDownloadLocalDicom,
		doDeleteLocalDicom,
		doCountImageLocalDicom,
		doSeekingAttachFile,
    doPreparePatientParams,
    doPrepareCaseParams,
		doGetSeriesList,
		doGetLocalSeriesList,
		doGetOrthancStudyDicom,
		doGetOrthancSeriesDicom,
		doGetLocalOrthancSeriesDicom,
		doCallCreatePreviewSeries,
		doCallCreateZipInstance,
		doCallSendAI,
		doConvertAIResult,
		doCallAIResultLog,
		doUpdateCaseStatus,
		doUpdateCaseStatusByShortCut,
		doUpdateConsultStatus,
		doCreateNewCustomUrgent,
		doCallSelectUrgentType,
		doUpdateCustomUrgent,
		doLoadScanpartAux,
		doFillSigleDigit,
		doDisplayCustomUrgentResult,
		doFormatDateTimeCaseCreated,
		formatNumberWithCommas,
		getPatientFullNameEN,
		doRenderScanpartSelectedBox,
		doRenderScanpartSelectedAbs,
		doExtractList,
		doCreateCaseCmd,
		doCallMyUserTasksCase,
		doFindTaksOfCase,
		doCreateLegentCmd,
		doShowStudyDescriptionLegentCmdClick,
		doScrollTopPage,
		genUniqueID,
		onSimpleEditorCopy,
		onSimpleEditorPaste,
		doCallLoadStudyTags,
		doReStructureDicom,
		doCheckOutTime,
		doCallPriceChart,
		doCreateOpenCaseData,
		doAddNotifyCustomStyle,
		doFilterMajorType,
		doFindMemberInMains,
		doSelectUrgentMesh,
		doArrangeNewUrgent
	}
}

},{"./apiconnect.js":1,"./utilmod.js":7}],3:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  let sipSession = undefined;
  let rtcSession = undefined;

  const realm = '202.28.68.6';
  const wsUrl = 'wss://' + realm + ':8089/ws';

	//const realm = 'radconnext.me';
  //const wsUrl = 'wss://' + realm + '/ws';

	const eventHandlers = {
	  'progress': function(e) {
	    console.log('call is in progress ...');
	  },
	  'failed': function(e) {
	    console.log('call failed with cause: ', e/*.data.cause*/);
	  },
	  'ended': function(e) {
	    console.log('call ended with cause: ', e/*.data.cause*/);
	  },
	  'confirmed': function(e) {
	    console.log('call confirmed ...', e);
	  }
	};

  const callOptions = {
		eventHandlers: eventHandlers,
    mediaConstraints : { 'audio': true, 'video': false },
    rtcOfferConstraints: {'offerToReceiveAudio': true, 'offerToReceiveVideo': false},
    sessionTimersExpires: 7200
  };

  const doRegisterSoftphone = function(softNumber, secret){
		let socket = new JsSIP.WebSocketInterface(wsUrl);
		socket.onmessage = function(msgEvt){
	    let data = JSON.parse(msgEvt.data);
	    console.log(data);
	  }

    let sipUri = 'sip:' + softNumber + '@' + realm;
    let sipConfiguration = {
      sockets: [ socket ],
      authorization_user: softNumber,
      uri: sipUri,
      password: secret,
      ws_servers: wsUrl,
      realm: realm,
      display_name: softNumber,
      contact_uri: sipUri
    };

		let ua = new JsSIP.UA(sipConfiguration);

    ua.on('connected', function(e){
      console.log('Your are ready connected to your socket.', e);
    });

    ua.on('registered', function(e){
      console.log('Your are ready registered.', e);
    });

    ua.on('unregistered', function(e){
      console.log('Your are ready unregistered.', e);
    });

    ua.on('registrationFailed', function(e){
      console.log('Your are registrationFailed.', e);
    });

    ua.on('disconnected', function(e){
      console.log('Your are ready dis-connected.', e);
    });

    //ua.start();
    ua.on("newRTCSession", function(data){
      rtcSession = data.session;
      sipSession = rtcSession;
      if (rtcSession.direction === "incoming") {
        // incoming call here
        console.log(rtcSession);
        $('#SipPhoneIncomeBox').css({'top': '10px'});
        let ringAudio = document.getElementById('RingAudio');
        ringAudio.play();
        rtcSession.on('failed', function (e) {
          console.log('connecttion failed', e);
          ringAudio.pause();
          let remoteAudio = document.getElementById('RemoteAudio');
					doClearTracks(remoteAudio);
					doHiddenSoftPhoneBox();
        });
      }
    });

    return ua;
  }

	const doRejectCall = function(evt){
		doHangup(evt);
	}

	const doEndCall = function(evt){
		doHangup(evt);
	}

	const doAcceptCall = function(evt){
		rtcSession.on("accepted",function(e){
	    // the call has answered
	    console.log('onaccept', e);
	  });
	  rtcSession.on("confirmed",function(e){
	    // this handler will be called for incoming calls too
	    console.log('onconfirm', e);
	    var from = e.ack.from._display_name;
			console.log(from);
	  });
	  rtcSession.on("ended",function(e){
	    // the call has ended
	    console.log('onended', e);
	    var remoteAudio = document.getElementById('RemoteAudio');
	    doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  });
	  rtcSession.on("failed",function(e){
	    // unable to establish the call
	    console.log('onfailed', e);
			var remoteAudio = document.getElementById('RemoteAudio');
	    doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  });

	  // Answer call
	  rtcSession.answer(callOptions);

	  rtcSession.connection.addEventListener('addstream', function (e) {
	    var remoteAudio = document.getElementById("RemoteAudio");
	    remoteAudio.srcObject = e.stream;
	    setTimeout(() => {
	      remoteAudio.play();
	      $('#SipPhoneIncomeBox').find('#IncomeBox').css({'display': 'none'});
	      $('#SipPhoneIncomeBox').find('#AnswerBox').css({'display': 'block'});
	    }, 500);
	  });
	}

	const doClearTracks = function(audio){
	  var stream = audio.srcObject;
	  if (stream){
	    var tracks = stream.getTracks();
	    if (tracks){
	      tracks.forEach(function(track) {
	        track.stop();
	      });
	    }
	  }
	}

	const doHangup = function(evt){
	  if (sipSession){
	    console.log(sipSession);
	    sipSession.terminate();
	    let remoteAudio = document.getElementById('RemoteAudio');
			doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  }
	}

	const doHiddenSoftPhoneBox = function(){
		$('#SipPhoneIncomeBox').find('#IncomeBox').css({'display': 'block'});
		$('#SipPhoneIncomeBox').find('#AnswerBox').css({'display': 'none'});
		$('#SipPhoneIncomeBox').css({'top': '-65px'});
	}

  return {
		callOptions,
    doRegisterSoftphone,
		doRejectCall,
		doAcceptCall,
		doEndCall
	}
}

},{}],4:[function(require,module,exports){
/* streammergermod.js */
const streamMerger = require('./video-stream-merger.js');

const CallcenterMerger = function(streams, mergOption) {
	this.merger = new streamMerger(mergOption);
	this.merger.addStream(streams[0], {
		index: 0,
		x: 0,
		y: 0,
		width: this.merger.width,
		height: this.merger.height,
		fps: 30,
		clearRect: true,
		audioContext: null,
		mute: true
	});

	var xmepos = this.merger.width * 0.24;
	var ymepos = this.merger.height * 0.25;

	if (streams[1]) {
		this.merger.addStream(streams[1], {
			index: 1,
			x: this.merger.width - xmepos,
			y: this.merger.height - ymepos,
			width: xmepos,
			height: ymepos,
			fps: 30,
			clearRect: true,
			mute: false
		});
	}

	/*
	var staticTextStream = createStaticTextStream('สด');
	this.merger.addStream(staticTextStream, {
		index: 2,
		x: 5,
		y: 10,
		width: 80,
		height: 50,
		mute: true
	});
	*/
	this.merger.start();
	return this.merger;
}

CallcenterMerger.prototype.getMerger = function() {
	return this.merger;
};

const createStaticTextStream = function(text) {
	$('body').append($('<div id="HiddenDiv"></div>'));
	var hiddenDiv = document.querySelector('#HiddenDiv');
	var drawer = document.createElement("canvas");
	drawer.style.display = 'none';
	hiddenDiv.appendChild(drawer);

	drawer.width = 80;
	drawer.height = 50;
	var ctx = drawer.getContext("2d");
	ctx.font = 'bold 30px THNiramitAS';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'left';
	ctx.fillText(text, 10, 20);
	var stream = drawer.captureStream(25);
	return stream;
}

module.exports = {
	CallcenterMerger,
	createStaticTextStream
};

},{"./video-stream-merger.js":8}],5:[function(require,module,exports){
/* userinfolib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);
  const common = require('./commonlib.js')($);
	const changepwddlg = require('../../radio/mod/changepwddlg.js')($);

  function doCallUpdateUserInfo(data) {
    return new Promise(function(resolve, reject) {
      var updateUserApiUri = '/api/user/update';
      var params = data;
      //$.post(updateUserApiUri, params, function(response){
			common.doCallApi(updateUserApiUri, params).then((response)=>{
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
				reject(err);
  		})
  	});
  }

  function doCallUserInfo(userId) {
    return new Promise(function(resolve, reject) {
      var userInfoApiUri = '/api/user/' + userId;
      var params = {};
      //$.get(userInfoApiUri, params, function(response){
			common.doGetApi(userInfoApiUri, params).then((response)=>{
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
				reject(err);
  		})
  	});
  }

  function doSaveUserProfile(newUserInfo){
		return new Promise(function(resolve, reject) {
	  	doCallUpdateUserInfo(newUserInfo).then((updateRes)=>{
	  		if (updateRes.Result === "OK") {
	  			doCallUserInfo(newUserInfo.userId).then((userInfoRes)=>{
	  				//update userdata in localstorage
	  				let newUserInfo = userInfoRes.Record.info;
	  				let yourUserdata = JSON.parse(localStorage.getItem('userdata'));
	  				yourUserdata.userinfo = newUserInfo;
	  				localStorage.setItem('userdata', JSON.stringify(yourUserdata));
						let userDisplayName = yourUserdata.userinfo.User_NameTH + ' ' + yourUserdata.userinfo.User_LastNameTH;
						$('#UserDisplayNameBox').empty().append($('<h4>' + userDisplayName + '</h4>'));
	  				$.notify("บันทึกการแก้ไขจ้อมูลของคุณ่เข้าสู่ระบบสำเร็จ", "success");
						resolve(updateRes);
	  			});
	  		} else {
	  			$.notify("เกิดความผิดพลาด ไม่สามารถบันทึกการแก้ไขจ้อมูลของคุณ่เข้าสู่ระบบได้ในขณะนี้", "error");
					reject({error: ''})
	  		}
	  	});
		});
  }

	const createFormFragment = function(fragId, fragLabel, fragValue) {
		let fragRow = $('<div style="display: table-row; padding: 2px; background-color: gray; width: 100%;"></div>');
		let labelCell = $('<div style="display: table-cell; width: 250px; padding: 2px;"></div>');
		$(labelCell).append($('<span>' + fragLabel + '</span>'));
		let inputCell = $('<div style="display: table-cell; padding: 2px;"></div>');
		let fragInput = $('<input type="text"/>');
		$(fragInput).attr('id', fragId);
		$(fragInput).val(fragValue);
		$(fragInput).appendTo($(inputCell));
		$(labelCell).appendTo($(fragRow));
		$(inputCell).appendTo($(fragRow));
		return $(fragRow);
	}

	const createChangePwdFragment = function(changePwdCallback) {
		let fragRow = $('<div style="display: table-row; padding: 2px; background-color: grey; width: 100%;"></div>');
		let labelCell = $('<div style="display: table-cell; width: 250px; padding: 2px; text-align: center;"></div>');
		let inputCell = $('<div style="display: table-cell; padding: 2px;"></div>');
		let changePwdCmd = $('<a href="#">เปลี่ยน Password</a>');
		$(changePwdCmd).on('click', (evt)=>{
			changePwdCallback();
		});
		$(labelCell).append($(changePwdCmd));
		$(labelCell).appendTo($(fragRow));
		$(inputCell).appendTo($(fragRow));
		return $(fragRow);
	}

  const doShowUserProfile = function() {
		let yourUserdata = JSON.parse(localStorage.getItem('userdata'));

		let table = $('<div style="display: table; width: 100%;"></div>');

		let yourNameENFrag = createFormFragment('UserNameEN', 'ชื่อ(ภาษาอังกฤษ์)', yourUserdata.userinfo.User_NameEN);
		$(yourNameENFrag).appendTo($(table));

		let yourLastNameENFrag = createFormFragment('UserLastNameEN', 'นามสกุล(ภาษาอังกฤษ์)', yourUserdata.userinfo.User_LastNameEN);
		$(yourLastNameENFrag).appendTo($(table));

		let yourNameTHFrag = createFormFragment('UserNameTH', 'ชื่อ(ภาษาไทย)', yourUserdata.userinfo.User_NameTH);
		$(yourNameTHFrag).appendTo($(table));

		let yourLastNameTHFrag = createFormFragment('UserLastNameTH', 'นามสกุล(ภาษาไทย)', yourUserdata.userinfo.User_LastNameTH);
		$(yourLastNameTHFrag).appendTo($(table));

		let yourEmailFrag = createFormFragment('UserEmail', 'อีเมล์', yourUserdata.userinfo.User_Email);
		$(yourEmailFrag).appendTo($(table));

		let yourPhoneFrag = createFormFragment('UserPhone', 'โทรศัพท์', yourUserdata.userinfo.User_Phone);
		$(yourPhoneFrag).appendTo($(table));

		let yourLineIDFrag = createFormFragment('UserLineID', 'Line ID', yourUserdata.userinfo.User_LineID);
		$(yourLineIDFrag).appendTo($(table));

		let yourDefaultDownloadPathFrag = createFormFragment('UserPathRadiant', 'โฟลเดอร์ดาวน์โหลด Dicom', yourUserdata.userinfo.User_PathRadiant);
		$(yourDefaultDownloadPathFrag).appendTo($(table));

		const changePasswordCmdClick = function(evt){
			changepwddlg.doCreateChangePwdDlg();
		}

		let createChangePwdFrag = createChangePwdFragment(changePasswordCmdClick);
		$(createChangePwdFrag).appendTo($(table));

		const radDialogOptions = {
	    title: 'ข้อมูลผู้ใช้งานของฉัน',
	    msg: $(table),
	    width: '510px',
			okLabel: ' บันทึก ',
	    onOk: async function(evt) {
				let res = await doVerifyUserInfo();
				console.log(res);
	      radUserInfoDialog.closeAlert();
	    },
			onCancel: function(evt) {
	      radUserInfoDialog.closeAlert();
	    }
	  }

	  let radUserInfoDialog = $('body').radalert(radDialogOptions);

		const doSaveUserInfo = function(newUserInfo){
			return new Promise(async function(resolve, reject) {
				console.log(newUserInfo);
				let yourNewUserInfo = newUserInfo;
				yourNewUserInfo.userId = yourUserdata.id;
				yourNewUserInfo.infoId = yourUserdata.userinfo.id;
				yourNewUserInfo.usertypeId = yourUserdata.usertype.id;
				let saveRes = await doSaveUserProfile(yourNewUserInfo);
				resolve(saveRes);
			});
		}

		const doVerifyUserInfo = function(){
			return new Promise(async function(resolve, reject) {
				let newNameEN = $(table).find('#UserNameEN').val();
				let newLastNameEN = $(table).find('#UserLastNameEN').val();
				let newNameTH = $(table).find('#UserNameTH').val();
				let newLastNameTH = $(table).find('#UserLastNameTH').val();
				let newEmail = $(table).find('#UserEmail').val();
				let newPhone = $(table).find('#UserPhone').val();
				let newLineID = $(table).find('#UserLineID').val();
				let newPathRadiant = $(table).find('#UserPathRadiant').val();
				if (newNameEN === '') {
					$(table).find('#UserNameEN').css('border', '1px solid red');
					$.notify('ต้องมีชื่อ(ภาษาอังกฤษ์)', 'error');
					resolve();
				} else if (newLastNameEN === '') {
					$(table).find('#UserNameEN').css('border', '');
					$(table).find('#UserLastNameEN').css('border', '1px solid red');
					$.notify('ต้องมีนามสกุล(ภาษาอังกฤษ์)', 'error');
					resolve();
				} else if (newNameTH === '') {
					$(table).find('#UserLastNameEN').css('border', '');
					$(table).find('#UserNameTH').css('border', '1px solid red');
					$.notify('ต้องมีชื่อ(ภาษาไทย)', 'error');
					resolve();
				} else if (newLastNameTH === '') {
					$(table).find('#UserNameTH').css('border', '');
					$(table).find('#UserLastNameTH').css('border', '1px solid red');
					$.notify('ต้องมีนามสกุล(ภาษาไทย)', 'error');
					resolve();
				} else if (newEmail === '') {
					$(table).find('#UserLastNameTH').css('border', '');
					$(table).find('#UserEmial').css('border', '1px solid red');
					resolve();
				} else if (newPhone !== '') {
					const phoneNoTHRegEx = /^[0]?[689]\d{8}$/;
					let isCorrectFormat = phoneNoTHRegEx.test(newPhone);
					if (!isCorrectFormat){
						$(table).find('#UserEmial').css('border', '');
						$(table).find('#UserPhone').css('border', '1px solid red');
						$.notify('โทรศัพท์ สามารถปล่อยว่างได้ แต่ถ้ามี ต้องพิมพ์ให้ถูกต้องตามรูปแบบ 0xxxxxxxxx', 'error');
						resolve();
	  			} else {
						$(table).find('#UserEmail').css('border', '');
						$(table).find('#UserPhone').css('border', '');
						if (yourUserdata.usertypeId != 4) {
							let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
							let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
							resolve(callSaveRes);
						} else {
							if (newPathRadiant === '') {
								$(table).find('#UserPathRadiant').css('border', '1px solid red');
								$.notify('กรณีที่คุณเป็นรังสีแพทย์ ต้องระบุ โฟลเดอร์ดาวน์โหลด Dicom', 'error');
								resolve();
							} else {
								$(table).find('#UserPathRadiant').css('border', '');
								let downloadPathFrags = newPathRadiant.split('\\');
								newPathRadiant = downloadPathFrags.join('/');
								let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
								let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
								resolve(callSaveRes);
							}
						}
					}
				} else {
					$(table).find('#UserEmail').css('border', '');
					$(table).find('#UserPhone').css('border', '');
					if (yourUserdata.usertypeId != 4) {
						let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
						let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
						resolve(callSaveRes);
					} else {
						if (newPathRadiant === '') {
							$(table).find('#UserPathRadiant').css('border', '1px solid red');
							$.notify('กรณีที่คุณเป็นรังสีแพทย์ ต้องระบุ โฟลเดอร์ดาวน์โหลด Dicom', 'error');
							resolve();
						} else {
							$(table).find('#UserPathRadiant').css('border', '');
							let downloadPathFrags = newPathRadiant.split('\\');
							newPathRadiant = downloadPathFrags.join('/');
							let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
							let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
							resolve(callSaveRes);
						}
					}
				}
			});
		}
  }

  return {
    doShowUserProfile
  }
}

},{"../../radio/mod/changepwddlg.js":14,"./apiconnect.js":1,"./commonlib.js":2,"./utilmod.js":7}],6:[function(require,module,exports){
/* userprofilelib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);
  const common = require('./commonlib.js')($);

  const showScanpartProfile = function(scanpartAuxs, deleteCallback){
    return new Promise(function(resolve, reject) {
      let scanpartBox = $('<div style="display: table; width: 100%; border-collapse: collapse; padding: 5px;"></div>');
      let headRow = $('<div style="display: table-row; width: 100%; background-color: blue; color: white;"></div>');
      $(headRow).appendTo($(scanpartBox));
      $(headRow).append($('<div style="display: table-cell;">ลำดับที่</div>'));
      $(headRow).append($('<div style="display: table-cell;">Study Description</div>'));
      $(headRow).append($('<div style="display: table-cell;">Protocol Name</div>'));
      $(headRow).append($('<div style="display: table-cell;">Scan Part</div>'));
      $(headRow).append($('<div style="display: table-cell;">คำสั่ง</div>'));
      let promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < scanpartAuxs.length; i++) {
          let item = scanpartAuxs[i];
          let itemRow = $('<div style="display: table-row; width: 100%"></div>');
          $(itemRow).appendTo($(scanpartBox));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + (i+1) + '</div>'));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + item.StudyDesc + '</div>'));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + item.ProtocolName + '</div>'));
          let scanPartCell = $('<div style="display: table-cell; vertical-align: middle;"></div>');
					let scanpartValues = Object.values(item.Scanparts);
					scanpartValues = scanpartValues.slice(0, -1);
          let scanPartBox = await common.doRenderScanpartSelectedBox(scanpartValues);
          $(scanPartBox).appendTo($(scanPartCell));
          $(itemRow).append($(scanPartCell));
          let scanPartCmdCell = $('<div style="display: table-cell; vertical-align: middle;"></div>');
          let deleteCmd = $('<img class="pacs-command" data-toggle="tooltip" src="../images/delete-icon.png" title="ลบรายการนี้"/>');
          $(deleteCmd).appendTo($(scanPartCmdCell));
          $(itemRow).append($(scanPartCmdCell));
          $(deleteCmd).on('click', (evt)=>{
            let yourComfirm = confirm('โปรดยืนยันการลบรายการโดยคลิก ตกลง หรือ OK');
            if (yourComfirm) {
              deleteCallback(item.id);
            }
          });
        }
        setTimeout(()=>{
          resolve2($(scanpartBox));
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
    });
  }

  return {
    showScanpartProfile
  }
}

},{"./apiconnect.js":1,"./commonlib.js":2,"./utilmod.js":7}],7:[function(require,module,exports){
/* utilmod.js */

module.exports = function ( jq ) {
	const $ = jq;

	let wsm, wsl;

	const formatDateStr = function(d) {
		var yy, mm, dd;
		yy = d.getFullYear();
		if (d.getMonth() + 1 < 10) {
			mm = '0' + (d.getMonth() + 1);
		} else {
			mm = '' + (d.getMonth() + 1);
		}
		if (d.getDate() < 10) {
			dd = '0' + d.getDate();
		} else {
			dd = '' + d.getDate();
		}
		var td = `${yy}-${mm}-${dd}`;
		return td;
	}

	const formatTimeStr = function(d) {
		var hh, mn, ss;
		hh = d.getHours();
		mn = d.getMinutes();
		ss = d.getSeconds();
		var td = `${hh}:${mn}:${ss}`;
		return td;
	}

	const formatDate = function(dateStr) {
		var fdate = new Date(dateStr);
		var mm, dd;
		if (fdate.getMonth() + 1 < 10) {
			mm = '0' + (fdate.getMonth() + 1);
		} else {
			mm = '' + (fdate.getMonth() + 1);
		}
		if (fdate.getDate() < 10) {
			dd = '0' + fdate.getDate();
		} else {
			dd = '' + fdate.getDate();
		}
		var date = fdate.getFullYear() + (mm) + dd;
		return date;
	}

	const videoConstraints = {video: {displaySurface: "application", height: 1080, width: 1920 }};

	const doGetScreenSignalError = function(e) {
		var error = {
			name: e.name || 'UnKnown',
			message: e.message || 'UnKnown',
			stack: e.stack || 'UnKnown'
		};

		if(error.name === 'PermissionDeniedError') {
			if(location.protocol !== 'https:') {
				error.message = 'Please use HTTPs.';
				error.stack   = 'HTTPs is required.';
			}
		}

		console.error(error.name);
		console.error(error.message);
		console.error(error.stack);

		alert('Unable to capture your screen.\n\n' + error.name + '\n\n' + error.message + '\n\n' + error.stack);
	}

	/* export function */
	const getTodayDevFormat = function(){
		var d = new Date();
		return formatDateStr(d);
	}

	const getYesterdayDevFormat = function(){
		var d = new Date();
		d.setDate(d.getDate() - 1);
		return formatDateStr(d);
	}

	const getToday = function(){
		var d = new Date();
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getYesterday = function() {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLastThreeDay = function(){
		var days = 3;
		var d = new Date();
		var last = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000));
		var td = formatDateStr(last);
		return formatDate(td);
	}

	const getDateLastWeek = function(){
		var days = 7;
		var d = new Date();
		var last = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000));
		var td = formatDateStr(last);
		return formatDate(td);
	}

	const getDateLastMonth = function(){
		var d = new Date();
		d.setDate(d.getDate() - 31);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLast3Month = function(){
		var d = new Date();
		d.setMonth(d.getMonth() - 3);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLastYear = function(){
		var d = new Date();
		d.setFullYear(d.getFullYear() - 1);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getFomateDateTime = function(date) {
		var todate = formatDateStr(date);
		var totime = formatTimeStr(date);
		return todate + 'T' + totime;
	}

	const getAge = function(dateString) {
		var dob = dateString;
		var yy = dob.substr(0, 4);
		var mo = dob.substr(4, 2);
		var dd = dob.substr(6, 2);
		var dobf = yy + '-' + mo + '-' + dd;
	  var today = new Date();
	  var birthDate = new Date(dobf);
	  var age = today.getFullYear() - birthDate.getFullYear();
	  var ageTime = today.getTime() - birthDate.getTime();
	  ageTime = new Date(ageTime);
	  if (age > 0) {
	  	if ((ageTime.getMonth() > 0) || (ageTime.getDate() > 0)) {
	  		age = (age + 1) + 'Y';
	  	} else {
	  		age = age + 'Y';
	  	}
	  } else {
	  	if (ageTime.getMonth() > 0) {
	  		age = ageTime.getMonth() + 'M';
	  	} else if (ageTime.getDate() > 0) {
	  		age = ageTime.getDate() + 'D';
	  	}
	  }
	  return age;
	}
	const formatStudyDate = function(studydateStr){
		if (studydateStr.length >= 8) {
			var yy = studydateStr.substr(0, 4);
			var mo = studydateStr.substr(4, 2);
			var dd = studydateStr.substr(6, 2);
			var stddf = yy + '-' + mo + '-' + dd;
			var stdDate = new Date(stddf);
			var month = stdDate.toLocaleString('default', { month: 'short' });
			return Number(dd) + ' ' + month + ' ' + yy;
		} else {
			return studydateStr;
		}
	}
	const formatStudyTime = function(studytimeStr){
		if (studytimeStr.length >= 4) {
			var hh = studytimeStr.substr(0, 2);
			var mn = studytimeStr.substr(2, 2);
			return hh + '.' + mn;
		} else {
			return studytimeStr;
		}
	}
	const getDatetimeValue = function(studydateStr, studytimeStr){
		if ((studydateStr.length >= 8) && (studytimeStr.length >= 6)) {
			var yy = studydateStr.substr(0, 4);
			var mo = studydateStr.substr(4, 2);
			var dd = studydateStr.substr(6, 2);
			var hh = studytimeStr.substr(0, 2);
			var mn = studytimeStr.substr(2, 2);
			var ss = studytimeStr.substr(4, 2);
			var stddf = yy + '-' + mo + '-' + dd + ' ' + hh + ':' + mn + ':' + ss;
			var stdDate = new Date(stddf);
			return stdDate.getTime();
		}
	}
	const formatDateDev = function(dateStr) {
		if (dateStr.length >= 8) {
			var yy = dateStr.substr(0, 4);
			var mo = dateStr.substr(4, 2);
			var dd = dateStr.substr(6, 2);
			var stddf = yy + '-' + mo + '-' + dd;
			return stddf;
		} else {
			return;
		}
	}

	const formatDateTimeStr = function(dt){
	  let d = new Date(dt);
		d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
		let yy, mm, dd, hh, mn, ss;
	  yy = d.getFullYear();
	  if (d.getMonth() + 1 < 10) {
	    mm = '0' + (d.getMonth() + 1);
	  } else {
	    mm = '' + (d.getMonth() + 1);
	  }
	  if (d.getDate() < 10) {
	    dd = '0' + d.getDate();
	  } else {
	    dd = '' + d.getDate();
	  }
	  if (d.getHours() < 10) {
	    hh = '0' + d.getHours();
	  } else {
		   hh = '' + d.getHours();
	  }
	  if (d.getMinutes() < 10){
		   mn = '0' + d.getMinutes();
	  } else {
	    mn = '' + d.getMinutes();
	  }
	  if (d.getSeconds() < 10) {
		   ss = '0' + d.getSeconds();
	  } else {
	    ss = '' + d.getSeconds();
	  }
		let td = `${yy}-${mm}-${dd} ${hh}:${mn}:${ss}`;
		return td;
	}

	const formatDateTimeDDMMYYYYJSON = function(dt){
	  let d = new Date(dt);
		d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
		let yy, mm, dd, hh, mn, ss;
	  yy = d.getFullYear();
	  if (d.getMonth() + 1 < 10) {
	    mm = '0' + (d.getMonth() + 1);
	  } else {
	    mm = '' + (d.getMonth() + 1);
	  }
	  if (d.getDate() < 10) {
	    dd = '0' + d.getDate();
	  } else {
	    dd = '' + d.getDate();
	  }
	  if (d.getHours() < 10) {
	    hh = '0' + d.getHours();
	  } else {
		   hh = '' + d.getHours();
	  }
	  if (d.getMinutes() < 10){
		   mn = '0' + d.getMinutes();
	  } else {
	    mn = '' + d.getMinutes();
	  }
	  if (d.getSeconds() < 10) {
		   ss = '0' + d.getSeconds();
	  } else {
	    ss = '' + d.getSeconds();
	  }
		let td = {YY: yy, MM: mm, DD: dd, HH: hh, MN: mn, SS: ss};
		return td;
	}

	const formatStartTimeStr = function(){
		let d = new Date().getTime() + (5*60*1000);
		return formatDateTimeStr(d);
	}

	const formatFullDateStr = function(fullDateTimeStr){
		let dtStrings = '';
		if (fullDateTimeStr.indexOf('T') >= 0) {
			dtStrings = fullDateTimeStr.split('T');
		} else if (fullDateTimeStr.indexOf(' ') >= 0) {
			dtStrings = fullDateTimeStr.split(' ');
		}
		return `${dtStrings[0]}`;;
	}

	const formatTimeHHMNStr = function(fullDateTimeStr){
		let dtStrings = '';
		if (fullDateTimeStr.indexOf('T') >= 0) {
			dtStrings = fullDateTimeStr.split('T');
		} else if (fullDateTimeStr.indexOf(' ') >= 0) {
			dtStrings = fullDateTimeStr.split(' ');
		}
		let ts = dtStrings[1].split(':');
		return `${ts[0]}:${ts[1]}`;;
	}

	const invokeGetDisplayMedia = function(success) {
		if(navigator.mediaDevices.getDisplayMedia) {
	    navigator.mediaDevices.getDisplayMedia(videoConstraints).then(success).catch(doGetScreenSignalError);
	  } else {
	    navigator.getDisplayMedia(videoConstraints).then(success).catch(doGetScreenSignalError);
	  }
	}

	const addStreamStopListener = function(stream, callback) {
		stream.getTracks().forEach(function(track) {
			track.addEventListener('ended', function() {
				callback();
			}, false);
		});
	}

	const base64ToBlob = function (base64, mime) {
		mime = mime || '';
		var sliceSize = 1024;
		var byteChars = window.atob(base64);
		var byteArrays = [];

		for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
			var slice = byteChars.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		return new Blob(byteArrays, {type: mime});
	}

	const windowMinimize = function (){
		window.innerWidth = 100;
		window.innerHeight = 100;
		window.screenX = screen.width;
		window.screenY = screen.height;
		alwaysLowered = true;
	}

	const windowMaximize = function () {
		window.innerWidth = screen.width;
		window.innerHeight = screen.height;
		window.screenX = 0;
		window.screenY = 0;
		alwaysLowered = false;
	}

	const doResetPingCounter = function(){
		if (wsm) {
			if ((wsm.readyState == 0) || (wsm.readyState == 1)){
				wsm.send(JSON.stringify({type: 'reset', what: 'pingcounter'}));
			} else {
				//$.notify("คุณไม่อยู่ในสถานะการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดรีเฟรช (F5) หรือ Logout แล้ว Login ใหม่ อีกครั้ง", "warn");
			}
		}
	}

	const doSetScreenState = function(state){
		if ((wsm.readyState == 0) || (wsm.readyState == 1)){
			wsm.send(JSON.stringify({type: 'set', what: 'screenstate', value: state}));
		} else {
			//$.notify("คุณไม่อยู่ในสถานะการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดรีเฟรช (F5) หรือ Logout แล้ว Login ใหม่ อีกครั้ง", "warn");
		}
	}

	const doConnectWebsocketMaster = function(username, usertype, hospitalId, connecttype, wsl){
		wsl = wsl;
	  const hostname = window.location.hostname;
		const protocol = window.location.protocol;
	  const port = window.location.port;
	  const paths = window.location.pathname.split('/');
	  const rootname = paths[1];
		/*
		let wsProtocol = 'ws://';
		if (protocol == 'https:') {
			wsProtocol = 'wss://';
		}

		let wsUrl = wsProtocol + hostname + ':' + port + '/' + username + '/' + hospitalId + '?type=' + connecttype;
		if (hostname == 'localhost') {
			wsUrl = 'wss://radconnext.tech/' + username + '/' + hospitalId + '?type=' + connecttype;
		}
		*/

		let wsUrl = 'wss://radconnext.tech/' + username + '/' + hospitalId + '?type=' + connecttype;
	  wsm = new WebSocket(wsUrl);
		wsm.onopen = function () {
			//console.log('Master Websocket is connected to the signaling server')
		};

		//console.log(usertype);

		if ((usertype == 1) || (usertype == 2) || (usertype == 3)) {
			const wsmMessageHospital = require('./websocketmessage.js')($, wsm, wsl);
			wsm.onmessage = wsmMessageHospital.onMessageHospital;
		} else if (usertype == 4) {
			const wsmMessageRedio = require('../../radio/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRedio.onMessageRadio;
		} else if (usertype == 5) {
			const wsmMessageRefer = require('../../refer/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRefer.onMessageRefer;
		}

	  wsm.onclose = function(event) {
			setTimeout(()=>{
				if ((usertype == 1) || (usertype == 2) || (usertype == 3)) {
					//window.location.reload();
					doConnectWebsocketMaster(username, usertype, hospitalId, connecttype, wsl);
				} else if (usertype == 4) {
					doConnectWebsocketMaster(username, usertype, hospitalId, connecttype, wsl);
				}
				return false;
			}, 60800);
		};

		wsm.onerror = function (err) {
		   console.log("Master WS Got error", err);
		};

		return wsm;
	}

	const wslOnClose = function(event) {
		console.log("Local WebSocket is closed now. with  event:=> ", event);
		setTimeout(()=>{
			//window.location.reload();
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			doConnectWebsocketLocal(userdata.username);
			return false;
		}, 60800);
	}

	const wslOnError = function (err) {
		 console.log("Local WS Got error", err);
	}

	const wslOnOpen = function () {
		console.log('Local Websocket is connected to the signaling server')
	}

	let clientSocketLastCounterPing = 0;

	const wslOnMessage = function (msgEvt) {
		let data = JSON.parse(msgEvt.data);
		console.log(data);
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		if (data.type == 'test') {
			$.notify(data.message, "success");
		} else if (data.type == 'ping') {
			wsl.clientSocketState = data.clientSocketState;
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsl.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}

			if (!(data.clientSocketState.connected)) {
				let ms = 60;
				setTimeout(()=>{
					let callUrl = '/api/client/api/connect/cloud/close';
					let params = {};
					$.get(callUrl, params).then((response) => {
						console.log(response);
						clientSocketLastCounterPing = 0;
					});
				}, (ms*1000));
				//doCreateWebSocketRetry(ms)
			}
			console.log(clientSocketLastCounterPing);
			console.log(data.clientSocketState.counterping);
			if (data.clientSocketState.counterping >= clientSocketLastCounterPing) {
				clientSocketLastCounterPing = data.clientSocketState.counterping;
			} else {
				let ms = 60;
				setTimeout(()=>{
					let callUrl = '/api/client/api/connect/cloud/close';
					let params = {};
					$.get(callUrl, params).then((response) => {
						console.log(response);
						clientSocketLastCounterPing = 0;
					});
				}, (ms*1000));
				//doCreateWebSocketRetry(ms)
			}

		} else if (data.type == 'result') {
			$.notify(data.message, "success");
		} else if (data.type == 'notify') {
			$.notify(data.message, "warnning");
		} else if (data.type == 'exec') {
			//Send result of exec back to websocket server
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'move') {
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'run') {
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'newdicom') {
			let eventName = 'triggernewdicom'
			let triggerData = {dicom : data.dicom, result: data.result};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
		} else if (data.type == 'updatedicom') {
			let eventName = 'triggerupdatedicom'
			let triggerData = {dicom : data.dicom, result: data.result};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
		} else if (data.type == 'caseeventlog') {
			let eventName = 'caseeventlog';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.data}});
			document.dispatchEvent(event);
		} else if (data.type == 'web-reconnect-cloud') {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
		} else if (data.type == 'web-disconnect-cloud') {
			if (wsm) {
				wsm.close();
			}
		} else if (data.type == 'web-connect-cloud-state') {

		}
	}

	const doConnectWebsocketLocal = function(username){
	  let wsUrl = 'ws://localhost:3000/api/' + username + '?type=local';
		wsl = new WebSocket(wsUrl);
		wsl.onopen = wslOnOpen;
		wsl.onmessage = wslOnMessage;
	  wsl.onclose = wslOnClose;
		wsl.onerror = wslOnError;
		return wsl;
	}

	const isMobileDeviceCheck = function(){
	  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
      return true;
	  } else {
			return false;
		}
	}

	const contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1, index = -1;

        for(i = 0; i < this.length; i++) {
          var item = this[i];

          if((findNaN && item !== item) || item === needle) {
            index = i;
            break;
          }
        }

        return index;
      };
    }
    return indexOf.call(this, needle) > -1;
	};

	const doCreateDownloadPDF = function(pdfLink){
	  return new Promise(async function(resolve, reject){
	    $.ajax({
		    url: pdfLink,
		    success: function(response){
					let stremLink = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
	        resolve(stremLink);
				}
			});
	  });
	}

	const XLSX_FILE_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

	const doCreateDownloadXLSX = function(xlsxLink){
	  return new Promise(async function(resolve, reject){
	    $.ajax({
		    url: xlsxLink,
		    success: function(response){
					let stremLink = URL.createObjectURL(new Blob([response.data], {type: XLSX_FILE_TYPE}));
	        resolve(stremLink);
				}
			});
	  });
	}

	const doShowLogWindow = function(){
		let myLogBox = $('<div id="LogBox"></div>');
		$(myLogBox).css({'position': 'absolute', 'width': '50%', 'min-height': '250px', 'background-color': 'rgba(192,192,192,0.3)', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '100px'});
		let myLogWindow = $(myLogBox).simplelog({});
		$('body').append($(myLogBox));

		$(myLogBox).draggable({ containment: "body"});
		$(myLogBox).resizable({	containment: 'body'});
		return $(myLogBox);
	}

	/*
	const dicomZipSyncWorker = new Worker("../lib/dicomzip-sync-webworker.js");
	dicomZipSyncWorker.addEventListener("message", async function(event) {
	  let evtData = event.data;
	  //{studyID,fileEntryURL}
		if (evtData.fileEntryURL){
		  let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
		  await dicomzipsync.forEach((dicom, i) => {
		    if (dicom.studyID == evtData.studyID) {
		      dicom.fileEntryURL = evtData.fileEntryURL;
		    }
		  });
		  localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
		} else if (evtData.error){
			$.notify("Your Sync Dicom in Background Error", "error");
		}
	});
	*/

	const doCreateWebSocketRetry = function(ms) {
		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<span>ระบบเตรียมทำการเชื่อมต่อใหม่อัตโนมัติ</span>'));
		let milliSecCountDownBox = $('<span></span>').css({'margin-left': '10px'});
		let milliSecUnitBox = $('<span>วินาที</span>').css({'margin-left': '10px'});
		$(radAlertMsg).append($('<div><span>ภายใน</span></div>').css({'width': '100%', 'text-align': 'center'}).append($(milliSecCountDownBox)).append($(milliSecUnitBox)));
		const radconfirmoption = {
			title: 'การเชื่อมต่อระบบขัดข้อง',
			msg: $(radAlertMsg),
			width: '380px',
			onOk: function(evt) {
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
		$(radConfirmBox.cancelCmd).hide();
		setTimeout(()=>{
			radConfirmBox.closeAlert();
		}, (ms*1000) - 400);
		let countDown = 0;
		$(milliSecCountDownBox).text(ms);
		let countDownBlink = function() {
			setTimeout(()=>{
				countDown += 1;
				$(milliSecCountDownBox).text(ms-countDown);
				countDownBlink();
			}, 1000);
		}
		countDownBlink();
	}

	const fmtStr = function (str) {
	  var args = [].slice.call(arguments, 1);
	  var i = 0;
	  return str.replace(/%s/g, () => args[i++]);
	}

	return {
		formatDateStr,
		getTodayDevFormat,
		getYesterdayDevFormat,
		getToday,
		getYesterday,
		getDateLastThreeDay,
		getDateLastWeek,
		getDateLastMonth,
		getDateLast3Month,
		getDateLastYear,
		getFomateDateTime,
		getAge,
		formatStudyDate,
		formatStudyTime,
		getDatetimeValue,
		formatDateDev,
		formatDateTimeStr,
		formatDateTimeDDMMYYYYJSON,
		formatStartTimeStr,
		formatFullDateStr,
		formatTimeHHMNStr,
		invokeGetDisplayMedia,
		addStreamStopListener,
		base64ToBlob,
		windowMinimize,
		windowMaximize,
		doResetPingCounter,
		doSetScreenState,
		doConnectWebsocketMaster,
		doConnectWebsocketLocal,
		isMobileDeviceCheck,
		contains,
		doCreateDownloadPDF,
		XLSX_FILE_TYPE,
		doCreateDownloadXLSX,
		doShowLogWindow,
		//dicomZipSyncWorker,
		doCreateWebSocketRetry,
		fmtStr,
		/*  Web Socket Interface */
		wsm
	}
}

},{"../../radio/mod/websocketmessage.js":22,"../../refer/mod/websocketmessage.js":25,"./websocketmessage.js":9}],8:[function(require,module,exports){
(function (global){(function (){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.VideoStreamMerger = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";module.exports=VideoStreamMerger;function VideoStreamMerger(a){var b=this;if(!(b instanceof VideoStreamMerger))return new VideoStreamMerger(a);a=a||{};var c=window.AudioContext||window.webkitAudioContext,d=!!(c&&(b._audioCtx=a.audioContext||new c).createMediaStreamDestination),e=!!document.createElement("canvas").captureStream;if(!(d&&e))throw new Error("Unsupported browser");b.width=a.width||400,b.height=a.height||300,b.fps=a.fps||25,b.clearRect=!(a.clearRect!==void 0)||a.clearRect,b._canvas=document.createElement("canvas"),b._canvas.setAttribute("width",b.width),b._canvas.setAttribute("height",b.height),b._canvas.setAttribute("style","position:fixed; left: 110%; pointer-events: none"),b._ctx=b._canvas.getContext("2d"),b._streams=[],b._audioDestination=b._audioCtx.createMediaStreamDestination(),b._setupConstantNode(),b.started=!1,b.result=null,b._backgroundAudioHack()}VideoStreamMerger.prototype.getAudioContext=function(){var a=this;return a._audioCtx},VideoStreamMerger.prototype.getAudioDestination=function(){var a=this;return a._audioDestination},VideoStreamMerger.prototype.getCanvasContext=function(){var a=this;return a._ctx},VideoStreamMerger.prototype._backgroundAudioHack=function(){var a=this,b=a._audioCtx.createConstantSource(),c=a._audioCtx.createGain();c.gain.value=.001,b.connect(c),c.connect(a._audioCtx.destination),b.start()},VideoStreamMerger.prototype._setupConstantNode=function(){var a=this,b=a._audioCtx.createConstantSource();b.start();var c=a._audioCtx.createGain();c.gain.value=0,b.connect(c),c.connect(a._audioDestination)},VideoStreamMerger.prototype.updateIndex=function(a,b){var c=this;"string"==typeof a&&(a={id:a}),b=null==b?0:b;for(var d=0;d<c._streams.length;d++)a.id===c._streams[d].id&&(c._streams[d].index=b);c._sortStreams()},VideoStreamMerger.prototype._sortStreams=function(){var a=this;a._streams=a._streams.sort(function(c,a){return c.index-a.index})},VideoStreamMerger.prototype.addMediaElement=function(a,b,c){var d=this;if(c=c||{},c.x=c.x||0,c.y=c.y||0,c.width=c.width||d.width,c.height=c.height||d.height,c.mute=c.mute||c.muted||!1,c.oldDraw=c.draw,c.oldAudioEffect=c.audioEffect,c.draw="VIDEO"===b.tagName||"IMG"===b.tagName?function(a,d,e){c.oldDraw?c.oldDraw(a,b,e):(a.drawImage(b,c.x,c.y,c.width,c.height),e())}:null,!c.mute){var e=b._mediaElementSource||d.getAudioContext().createMediaElementSource(b);b._mediaElementSource=e,e.connect(d.getAudioContext().destination);var f=d.getAudioContext().createGain();e.connect(f),b.muted?(b.muted=!1,b.volume=.001,f.gain.value=1e3):f.gain.value=1,c.audioEffect=function(a,b){c.oldAudioEffect?c.oldAudioEffect(f,b):f.connect(b)},c.oldAudioEffect=null}d.addStream(a,c)},VideoStreamMerger.prototype.addStream=function(a,b){var c=this;if("string"==typeof a)return c._addData(a,b);b=b||{};for(var d={isData:!1,x:b.x||0,y:b.y||0,width:b.width||c.width,height:b.height||c.height,draw:b.draw||null,mute:b.mute||b.muted||!1,audioEffect:b.audioEffect||null,index:null==b.index?0:b.index,hasVideo:0<a.getVideoTracks().length},e=null,f=0;f<c._streams.length;f++)c._streams[f].id===a.id&&(e=c._streams[f].element);e||(e=document.createElement("video"),e.autoplay=!0,e.muted=!0,e.srcObject=a,e.setAttribute("style","position:fixed; left: 0px; top:0px; pointer-events: none; opacity:0;"),document.body.appendChild(e),!d.mute&&(d.audioSource=c._audioCtx.createMediaStreamSource(a),d.audioOutput=c._audioCtx.createGain(),d.audioOutput.gain.value=1,d.audioEffect?d.audioEffect(d.audioSource,d.audioOutput):d.audioSource.connect(d.audioOutput),d.audioOutput.connect(c._audioDestination))),d.element=e,d.id=a.id||null,c._streams.push(d),c._sortStreams()},VideoStreamMerger.prototype.removeStream=function(a){var b=this;"string"==typeof a&&(a={id:a});for(var c=0;c<b._streams.length;c++)a.id===b._streams[c].id&&(b._streams[c].audioSource&&(b._streams[c].audioSource=null),b._streams[c].audioOutput&&(b._streams[c].audioOutput.disconnect(b._audioDestination),b._streams[c].audioOutput=null),b._streams[c]=null,b._streams.splice(c,1),c--)},VideoStreamMerger.prototype._addData=function(a,b){var c=this;b=b||{};var d={};d.isData=!0,d.draw=b.draw||null,d.audioEffect=b.audioEffect||null,d.id=a,d.element=null,d.index=null==b.index?0:b.index,d.audioEffect&&(d.audioOutput=c._audioCtx.createGain(),d.audioOutput.gain.value=1,d.audioEffect(null,d.audioOutput),d.audioOutput.connect(c._audioDestination)),c._streams.push(d),c._sortStreams()},VideoStreamMerger.prototype._requestAnimationFrame=function(a){var b=!1,c=setInterval(function(){!b&&document.hidden&&(b=!0,clearInterval(c),a())},1e3/self.fps);requestAnimationFrame(function(){b||(b=!0,clearInterval(c),a())})},VideoStreamMerger.prototype.start=function(){var a=this;a.started=!0,a._requestAnimationFrame(a._draw.bind(a)),a.result=a._canvas.captureStream(a.fps);var b=a.result.getAudioTracks()[0];b&&a.result.removeTrack(b);var c=a._audioDestination.stream.getAudioTracks();a.result.addTrack(c[0])},VideoStreamMerger.prototype._draw=function(){function a(){c--,0>=c&&b._requestAnimationFrame(b._draw.bind(b))}var b=this;if(b.started){var c=b._streams.length;b.clearRect&&b._ctx.clearRect(0,0,b.width,b.height),b._streams.forEach(function(c){c.draw?c.draw(b._ctx,c.element,a):!c.isData&&c.hasVideo?(b._ctx.drawImage(c.element,c.x,c.y,c.width,c.height),a()):a()}),0===b._streams.length&&a()}},VideoStreamMerger.prototype.destroy=function(){var a=this;a.started=!1,a._canvas=null,a._ctx=null,a._streams=[],a._audioCtx.close(),a._audioCtx=null,a._audioDestination=null,a.result.getTracks().forEach(function(a){a.stop()}),a.result=null};

},{}]},{},[1])(1)
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
/* websocketmessage.js */
module.exports = function ( jq, wsm, wsl) {
	const $ = jq;
  const onMessageHospital = function (msgEvt) {
		let userdata = JSON.parse(localStorage.getItem('userdata'));
    let data = JSON.parse(msgEvt.data);
    console.log(data);
    if (data.type !== 'test') {
			/*
      let masterNotify = localStorage.getItem('masternotify');
      let MasterNotify = JSON.parse(masterNotify);
      if (MasterNotify) {
        MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
      } else {
        MasterNotify = [];
        MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
      }
      localStorage.setItem('masternotify', JSON.stringify(MasterNotify));
			*/
    }
    if (data.type == 'test') {
      $.notify(data.message, "success");
		} else if (data.type == 'ping') {
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
    } else if (data.type == 'trigger') {
			/*************************/
			/*
      let message = {type: 'trigger', dcmname: data.dcmname, StudyInstanceUID: data.studyInstanceUID, owner: data.ownere, hostname: data.hostname};
      wsl.send(JSON.stringify(message));
      $.notify('The system will be start store dicom to your local.', "success");
			*/
		} else if (data.type == 'refresh') {
			if (data.thing === 'consult') {
				let eventName = 'triggerconsultcounter'
				let triggerData = {caseId : data.caseId, statusId: data.statusId};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
			} else if (data.thing === 'case') {
				let eventName = 'triggercasecounter'
				let triggerData = {caseId : data.caseId, statusId: data.statusId};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
			}
		//} else if (data.type == 'refreshconsult') {
		} else if (data.type == 'casemisstake') {
			let eventName = 'triggercasemisstake'
			let triggerData = {msg : data.msg, from: data.from};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
		} else if (data.type == 'newreport') {
			let eventName = 'triggernewreport'
			let triggerData = data;
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
			console.log(event);
    } else if (data.type == 'notify') {
      $.notify(data.message, "info");
    } else if (data.type == 'exec') {
			/*************************/
			/*
        wsl.send(JSON.stringify(data));
			*/
    } else if (data.type == 'cfindresult') {
      let evtData = { result: data.result, owner: data.owner, hospitalId: data.hospitalId, queryPath: data.queryPath};
      $("#RemoteDicom").trigger('cfindresult', [evtData]);
    } else if (data.type == 'move') {
			/*************************/
			/*
      wsl.send(JSON.stringify(data));
			*/
    } else if (data.type == 'cmoveresult') {
      let evtData = { data: data.result, owner: data.owner, hospitalId: data.hospitalId, patientID: data.patientID};
      setTimeout(()=>{
        $("#RemoteDicom").trigger('cmoveresult', [evtData]);
      }, 5000);
    } else if (data.type == 'run') {
			/*************************/
      wsl.send(JSON.stringify(data));
    } else if (data.type == 'runresult') {
      //$('#RemoteDicom').dispatchEvent(new CustomEvent("runresult", {detail: { data: data.result, owner: data.owner, hospitalId: data.hospitalId }}));
      let evtData = { data: data.result, owner: data.owner, hospitalId: data.hospitalId };
      $('body').trigger('runresult', [evtData]);
    } else if (data.type == 'refresh') {
      let event = new CustomEvent(data.section, {"detail": {eventname: data.section, stausId: data.statusId, caseId: data.caseId}});
      document.dispatchEvent(event);
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
		} else if (data.type == 'importresult') {
			let eventName = 'createnewdicomtranserlog';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result}});
			document.dispatchEvent(event);
		} else if (data.type == 'clientresult') {
			console.log(data);
			let eventName = 'clientresult';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result, hospitalId: data.hospitalId, owner: data.owner}});
			document.dispatchEvent(event);
		} else if (data.type == 'logreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'dicomlogreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'reportlogreturn') {
			console.log('yess');
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'echoreturn') {
			let eventName = 'echoreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'clientreconnect') {
			let eventName = 'clientreconnecttrigger';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'rezip') {
			let eventName = 'triggerrezip';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: {studyID: data.studyID, dicomZipFilename: data.dicomZipFilename}}});
			document.dispatchEvent(event);
		} else if (data.type == 'caseeventlog') {
			let eventName = 'caseeventlog';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.data}});
			document.dispatchEvent(event);
		} else if (data.type == 'getsocketstate'){
			if ((wsm) && (wsl)) {
				let stateData = {state: wsl.clientSocketState.state};
				let stateMsg = {type: 'web', from: userdata.username, to: data.from, data: {type: 'socketstate', state: wsl.clientSocketState.state, connected: wsl.clientSocketState.connected, orthancCount: data.data.orthancCount}}
				wsm.send(JSON.stringify(stateMsg));
				if ((wsl.clientSocketState.connected) && (data.data.orthancCount == 0)) {
					let ms = 5;	
					setTimeout(()=>{
						let callUrl = '/api/client/api/connect/cloud/close';
						let params = {};
						$.get(callUrl, params).then((response) => {
							console.log(response);
						});
					}, (ms*1000));
				}
			}
    } else {
			console.log('Nothing Else');
		}
  };

	const doSaveMessageToLocal = function(msg ,from, topicId, status){
		let localMessage = localStorage.getItem('localmessage');
		let localMessageJson = JSON.parse(localMessage);
		if (localMessageJson) {
			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
		} else {
			localMessageJson = [];
			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
		}
		localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
	}

  return {
    onMessageHospital
	}
}

},{}],10:[function(require,module,exports){
const streammergerlib = require('./streammergermod.js');

const videoInitSize = {width: 437, height: 298};
const videoConstraints = {video: true, audio: false};
const mergeOption = {
  width: 520,
  height: 310,
  fps: 25,
  clearRect: true,
  audioContext: null
};

/* https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b */
const rtcConfiguration = {
	'iceServers': [
	 {url: 'stun:stun2.l.google.com:19302'},
	 {url: 'turn:numb.viagenie.ca',
		credential: 'muazkh',
		username: 'webrtc@live.com'
	 }
	]
};


let $ = undefined;

let userJoinOption = undefined;
let userMediaStream = undefined;
let displayMediaStream = undefined;
let localMergedStream = undefined;
let remoteConn = undefined;
let remoteTracks = undefined;
let streammerger = undefined;
let recorder = undefined;
let mergeMode = false;
let trackSenders = undefined;

const doSetupRemoteConn = function(peerConn){
  remoteConn = peerConn;
}

const doSetupUserJoinOption = function(joinOption){
  userJoinOption = joinOption;
}

const doGetRemoteConn = function(){
  return remoteConn;
}

const doGetStreamMerge = function(){
  return streammerger;
}

const doGetDisplayMediaStream = function(){
  return displayMediaStream;
}

const doGetUserMediaStream = function(){
  return userMediaStream;
}

const doGetRemoteTracks = function(){
  return remoteTracks;
}

const doMixStream = function(streams){
  if (streams.length > 0) {
    if ((streams[0].getVideoTracks()) && (streams[1].getVideoTracks())) {
      streammerger = streammergerlib.CallcenterMerger(streams, mergeOption);
      return streammerger.result;
    } else {
      return;
    }
  } else {
    return;
  }
}

const doSetupUserMediaStream = function(stream){
  userMediaStream = stream;
}

const doSetupDisplayMediaStream = function(stream){
  displayMediaStream = stream;
}

const doGetRecorder = function(){
  return recorder;
}

const doInitRTCPeer = function(stream, wsm) {
	let remoteConn = new RTCPeerConnection(rtcConfiguration);

	// Setup ice handling
	remoteConn.onicecandidate = function (event) {
		if (event.candidate) {
			let sendData = {
				type: "wrtc",
				wrtc: "candidate",
				candidate: event.candidate,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
			};
			wsm.send(JSON.stringify(sendData));
		}
	};

	remoteConn.oniceconnectionstatechange = function(event) {
		const peerConnection = event.target;
		console.log('ICE state change event: ', event);
		remoteConn = peerConnection;
	};

	remoteConn.onicegatheringstatechange = function() {
		switch(remoteConn.iceGatheringState) {
			case "new":
			case "complete":
				//label = "Idle";
				console.log(remoteConn.iceGatheringState);
			break;
			case "gathering":
				//label = "Determining route";
			break;
		}
	};

  if ((trackSenders) && (trackSenders.length > 0)) {
    trackSenders.forEach((sender, i) => {
      remoteConn.removeTrack(sender);
    });
  }

  trackSenders = [];
	stream.getTracks().forEach((track) => {
		let sender = remoteConn.addTrack(track, stream);
    trackSenders.push(sender);
	});

	remoteConn.ontrack = remoteConnOnTrackEvent;

  return remoteConn;
}

const remoteConnOnTrackEvent = function(event) {
  if (event.streams[0]) {
    /*
    if (recorder) {
      recorder.stopRecording().then(async()=>{
        let blob = await recorder.getBlob();
        if ((blob) && (blob.size > 0)) {
          invokeSaveAsDialog(blob);
          recorder = undefined;
        }
      });
    }
    */
    let myVideo = document.getElementById("MyVideo");

    let remoteStream = event.streams[0];

    remoteTracks = [];

    remoteStream.getTracks().forEach(function(track) {
      remoteTracks.push(track);
    });

    console.log(remoteTracks.length);

    let remoteMergedStream = undefined;
    /*
    if (userJoinOption.joinType === 'caller') {
      if (displayMediaStream) {
        let streams = [displayMediaStream, remoteStream];
        remoteMergedStream = doMixStream(streams);
      } else {
        let streams = [remoteStream, userMediaStream];
        remoteMergedStream = doMixStream(streams);
      }
    } else if (userJoinOption.joinType === 'callee') {
      if((userJoinOption.joinMode) && (userJoinOption.joinMode == 'face')) {
        let streams = [remoteStream, userMediaStream];
        remoteMergedStream = doMixStream(streams);
      } else {
        //share screen mode
        remoteMergedStream = remoteStream;
      }
    }
    */
    if (userJoinOption.joinMode == 'share') {
      remoteMergedStream = remoteStream;
    } else if (userJoinOption.joinMode == 'face') {
      let streams = [remoteStream, userMediaStream];
      remoteMergedStream = doMixStream(streams);      
    }
    myVideo.srcObject = remoteMergedStream;
    $('#CommandBox').find('#ShareWebRCTCmd').show();
    $('#CommandBox').find('#EndWebRCTCmd').show();
  }
}

const doCreateOffer = function(wsm) {
  if (remoteConn){
    remoteConn.createOffer(function (offer) {
    	remoteConn.setLocalDescription(offer);
      console.log(offer);
    	let sendData = {
    		type: "wrtc",
    		wrtc: "offer",
    		offer: offer ,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
    	};
      wsm.send(JSON.stringify(sendData));
      userJoinOption.joinType = 'caller';
    }, function (error) {
  		console.log(error);
  	});
  }
}

const doCreateInterChange = function(wsm) {
  mergeMode = true;
	let sendData = {
		type: "wrtc",
		wrtc: "interchange",
		interchange: {reason: 'Interchange with cmd.'},
		sender: userJoinOption.joinName,
    sendto: userJoinOption.audienceName
	};
  wsm.send(JSON.stringify(sendData));
  userJoinOption.joinMode = 'face';
}

const doCreateLeave = function(wsm) {
	let sendData = {
		type: "wrtc",
		wrtc: "leave",
		leave: {reason: 'Stop with cmd.'},
		sender: userJoinOption.joinName,
    sendto: userJoinOption.audienceName
	};
  wsm.send(JSON.stringify(sendData));
}

const wsHandleOffer = function(wsm, offer) {
  if (remoteConn) {
    remoteConn.setRemoteDescription(new RTCSessionDescription(offer));
    remoteConn.createAnswer(function (answer) {
      remoteConn.setLocalDescription(answer);
      let sendData = {
        type: "wrtc",
        wrtc: "answer",
        answer: answer,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
      };
      wsm.send(JSON.stringify(sendData));
      userJoinOption.joinType = 'callee';
    }, function (error) {
      console.log(error);
    });
  }
}

const wsHandleAnswer = function(wsm, answer) {
  if (remoteConn){
    remoteConn.setRemoteDescription(new RTCSessionDescription(answer)).then(
      function() {
        console.log('remoteConn setRemoteDescription on wsHandleAnswer success.');
        if (userJoinOption.joinType === 'caller') {
          if (displayMediaStream) {
            let newStream = new MediaStream();
            doGetRemoteTracks().forEach((track) => {
              newStream.addTrack(track)
            });
            let myVideo = document.getElementById("MyVideo");
            let streams = [displayMediaStream, newStream];
            myVideo.srcObject = doMixStream(streams);
          } else {
            console.log('Your displayMediaStream is undefined!!');
          }
        } else if (userJoinOption.joinType === 'callee') {
          console.log('The callee request get share screen, Please wait and go on.');
        }
      }, 	function(error) {
        console.log('remoteConn Failed to setRemoteDescription:=> ' + error.toString() );
      }
    );
  }
}

const wsHandleCandidate = function(wsm, candidate) {
  if (remoteConn){
    remoteConn.addIceCandidate(new RTCIceCandidate(candidate)).then(
      function() {/* console.log(candidate) */},
      function(error) {console.log(error)}
    );
  }
}

const wsHandleInterchange = function(wsm, interchange) {
  //มีปัญหาเรื่อง
  //bundle.js:8846 Uncaught DOMException: Failed to execute 'addTrack' on 'RTCPeerConnection': A sender already exists for the track.
  userJoinOption.joinMode = 'face';
  if ((trackSenders) && (trackSenders.length > 0)) {
    trackSenders.forEach((sender, i) => {
      remoteConn.removeTrack(sender);
    });
  }
  if (userMediaStream) {
    userMediaStream.getTracks().forEach((track) => {
      remoteConn.addTrack(track, userMediaStream);
    });
    doCreateOffer(wsm);
  }
}

const wsHandleLeave = function(wsm, leave) {
  doEndCall(wsm);
}

const errorMessage = function(message, evt) {
	console.error(message, typeof evt == 'undefined' ? '' : evt);
	alert(message);
}

const doGetScreenSignalError =  function(evt){
  var error = {
    name: evt.name || 'UnKnown',
    message: evt.message || 'UnKnown',
    stack: evt.stack || 'UnKnown'
  };
  console.error(error);
  if(error.name === 'PermissionDeniedError') {
    if(location.protocol !== 'https:') {
      error.message = 'Please use HTTPs.';
      error.stack   = 'HTTPs is required.';
    }
  }
}

const doCheckBrowser = function() {
	return new Promise(function(resolve, reject) {
		if (location.protocol === 'https:') {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			if (navigator.getUserMedia) {
				//const vidOption = {audio: true, video: {facingMode: 'user',frameRate: 30, width : 640, height:480}};
				const vidOption = { audio: true, video: true };
				navigator.getUserMedia(vidOption, function (stream) {
					var mediaStreamTrack = stream.getVideoTracks()[0];
					if (typeof mediaStreamTrack == "undefined") {
						errorMessage('Permission denied!');
						resolve();
					} else {
						userMediaStream = stream;
						resolve(stream);
					}
				}, function (e) {
					var message;
					switch (e.name) {
						case 'NotFoundError':
						case 'DevicesNotFoundError':
							message = 'Please setup your webcam first.';
							break;
						case 'SourceUnavailableError':
							message = 'Your webcam is busy';
							break;
						case 'PermissionDeniedError':
						case 'SecurityError':
							message = 'Permission denied!';
							break;
						default: errorMessage('Reeeejected!', e);
							resolve(false);
					}
					errorMessage(message);
					resolve(false);
				});
			} else {
				errorMessage('Uncompatible browser!');
				resolve(false);
			}
		} else {
			errorMessage('Please use https protocol for open this page.');
			resolve(false);
		}
	});
}

const doCreateControlCmd = function(id, iconUrl){
  let hsIcon = new Image();
  hsIcon.src = iconUrl;
  hsIcon.id = id;
  $(hsIcon).css({"width": "40px", "height": "auto", "cursor": "pointer", "padding": "2px"});
  $(hsIcon).css({'border': '4px solid grey', 'border-radius': '5px', 'margin': '4px'});
  $(hsIcon).prop('data-toggle', 'tooltip');
  $(hsIcon).prop('title', "Share Screen");
  $(hsIcon).hover(()=>{
    $(hsIcon).css({'border': '4px solid grey'});
  },()=>{
    $(hsIcon).css({'border': '4px solid #ddd'});
  });
  return $(hsIcon);
}

const doCreateShareScreenCmd = function(){
  let shareScreenIconUrl = '/images/screen-capture-icon.png';
  let shareScreenCmd = doCreateControlCmd('ShareWebRCTCmd', shareScreenIconUrl);;
  return $(shareScreenCmd);
}

const doCreateStartCallCmd = function(){
  let callIconUrl = '/images/phone-call-icon-1.png';
  let callCmd = doCreateControlCmd('StartWebRCTCmd', callIconUrl);
  return $(callCmd)
}

const onShareCmdClickCallback = async function(callback){
  let captureStream = await doGetDisplayMedia();
  onDisplayMediaSuccess(captureStream, (stream)=>{
    callback(stream);
  });
}

const onDisplayMediaSuccess = function(stream, callback){
  stream.getTracks().forEach(function(track) {
    track.addEventListener('ended', function() {
      console.log('Stop Capture Stream.');
      track.stop();
      $('#CommandBox').find('#EndWebRCTCmd').click();
    }, false);
  });
  callback(stream);
}

const doGetDisplayMedia = function(){
  return new Promise(async function(resolve, reject) {
    let captureStream = undefined;
    if(navigator.mediaDevices.getDisplayMedia) {
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(videoConstraints);
        resolve(captureStream);
      } catch(err) {
        console.error("Error: " + err);
        reject(err);
      }
    } else {
      try {
        captureStream = await navigator.getDisplayMedia(videoConstraints);
        resolve(captureStream);
      } catch(err) {
        console.error("Error: " + err);
        reject(err);
      }
    }
  });
}

const setScaleDisplay = function( width, height, padding, border ) {
   var scrWidth = $( window ).width() - 30,
   scrHeight = $( window ).height() - 30,
   ifrPadding = 2 * padding,
   ifrBorder = 2 * border,
   ifrWidth = width + ifrPadding + ifrBorder,
   ifrHeight = height + ifrPadding + ifrBorder,
   h, w;

   if ( ifrWidth < scrWidth && ifrHeight < scrHeight ) {
	  w = ifrWidth;
	  h = ifrHeight;
   } else if ( ( ifrWidth / scrWidth ) > ( ifrHeight / scrHeight ) ) {
	  w = scrWidth;
	  h = ( scrWidth / ifrWidth ) * ifrHeight;
   } else {
	  h = scrHeight;
	  w = ( scrHeight / ifrHeight ) * ifrWidth;
   }
   return {
	  width: w - ( ifrPadding + ifrBorder ),
	  height: h - ( ifrPadding + ifrBorder )
   };
}

const doCreateEndCmd = function(){
  let endIconUrl = '/images/phone-call-icon-3.png';
  let endCmd = doCreateControlCmd('EndWebRCTCmd', endIconUrl);
  return $(endCmd);
}

const doEndCall = async function(wsm){
  /*
  if (recorder) {
    await recorder.stopRecording();
    let blob = await recorder.getBlob();
    if ((blob) && (blob.size > 0)) {
      invokeSaveAsDialog(blob);
      recorder = undefined;
    }
  }
  */
  let myVideo = document.getElementById("MyVideo");

  if (myVideo) {
    doCheckBrowser().then((stream)=>{
      myVideo.srcObject = stream;
    });
  }

  if (displayMediaStream) {
    displayMediaStream.getTracks().forEach((track)=>{
  		track.stop();
  	});
  }
  if (localMergedStream) {
    localMergedStream.getTracks().forEach((track)=>{
  		track.stop();
  	});
  }
  /*
  if (remoteConn) {
    remoteConn.close();
  }*/

  displayMediaStream = undefined;
  localMergedStream = undefined;

  $('#CommandBox').find('#ShareWebRCTCmd').show();
  $('#CommandBox').find('#StartWebRCTCmd').hide();
  $('#CommandBox').find('#EndWebRCTCmd').hide();
}


module.exports = (jq) => {
  $ = jq;
  return {
    streammergerlib,
    streammerger,
    videoInitSize,
    videoConstraints,
    mergeOption,

    mergeMode,
    userJoinOption,
    userMediaStream,
    displayMediaStream,
    localMergedStream,
    remoteConn,

    /************************/

    doSetupRemoteConn,
    doSetupUserJoinOption,
    doGetRemoteConn,
    doGetStreamMerge,
    doGetDisplayMediaStream,
    doGetUserMediaStream,
    doGetRemoteTracks,
    doMixStream,
    doSetupUserMediaStream,
    doSetupDisplayMediaStream,
    doGetRecorder,
    doInitRTCPeer,
    doCreateOffer,
    doCreateInterChange,
    doCreateLeave,

    wsHandleOffer,
    wsHandleAnswer,
    wsHandleCandidate,
    wsHandleInterchange,
    wsHandleLeave,
    doCheckBrowser,
    doCreateControlCmd,
    doCreateShareScreenCmd,
    onShareCmdClickCallback,
    doCreateStartCallCmd,
    doCreateEndCmd,
    onDisplayMediaSuccess,
    doGetDisplayMedia,
    setScaleDisplay,
    doEndCall
  }
}

},{"./streammergermod.js":4}],11:[function(require,module,exports){
/* main.js */

window.$ = window.jQuery = require('jquery');

/*****************************/
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

var noti, sipUA;

const util = require('../case/mod/utilmod.js')($);
const common = require('../case/mod/commonlib.js')($);
const userinfo = require('../case/mod/userinfolib.js')($);
const userprofile = require('../case/mod/userprofilelib.js')($);
const apiconnector = require('../case/mod/apiconnect.js')($);
const welcome = require('./mod/welcomelib.js')($);
const newcase = require('./mod/newcaselib.js')($);
const acccase = require('./mod/acccaselib.js')($);
const searchcase = require('./mod/searchcaselib.js')($);
const opencase = require('./mod/opencase.js')($);
const template = require('./mod/templatelib.js')($);
//const profile = require('./mod/profilelib.js')($);
const profile = require('./mod/profilelibV2.js')($);
const softphone = require('../case/mod/softphonelib.js')($);

const modalLockScreenStyle = { 'position': 'fixed', 'z-index': '41', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto', 'background-color': '#ccc'};



$( document ).ready(function() {
  const initPage = function() {
    let logined = sessionStorage.getItem('logged');
    if (logined) {
  		var token = doGetToken();
  		if (token !== 'undefined') {
        let userdata = doGetUserData();
        if (userdata !== 'undefined') {
          userdata = JSON.parse(userdata);
          console.log(userdata);
          if (userdata.usertypeId == 4){
    			  doLoadMainPage();
            util.wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
            doSetupAutoReadyAfterLogin();
            doAutoAcceptCase(1);
            /*
            if (userdata.userinfo.User_SipPhone){
              let sipPhoneNumber = userdata.userinfo.User_SipPhone;
              let sipPhoneSecret = userdata.userinfo.User_SipSecret;
              sipUA = softphone.doRegisterSoftphone(sipPhoneNumber, sipPhoneSecret);

              sipUA.start();
              let sipPhoneOptions = {onRejectCallCallback: softphone.doRejectCall, onAcceptCallCallback: softphone.doAcceptCall, onEndCallCallback: softphone.doEndCall};
              let mySipPhoneIncomeBox = $('<div id="SipPhoneIncomeBox" tabindex="1"></div>');
              $(mySipPhoneIncomeBox).css({'position': 'absolute', 'width': '98%', 'min-height': '50px;', 'max-height': '50px', 'background-color': '#fefefe', 'padding': '5px', 'border': '1px solid #888',  'z-index': '192', 'top': '-65px'});
              let mySipPhone = $(mySipPhoneIncomeBox).sipphoneincome(sipPhoneOptions);
              $('body').append($(mySipPhoneIncomeBox));
            }
            */
          } else {
            //$.notify('บัญชีใช้งานของคุณไม่สามารถเข้าใช้งานหน้านี้ได้ โปรด Login ใหม่เพื่อเปลี่ยนบัญชีใช้งาน', 'error');
            alert('บัญชีใช้งานของคุณไม่สามารถเข้าใช้งานหน้านี้ได้ โปรด Login ใหม่เพื่อเปลี่ยนบัญชีใช้งาน');
            doLoadLogin();
          }
        } else {
          doLoadLogin();
        }
  		} else {
        doLoadLogin();
  		}
    } else {
      let queryString = decodeURIComponent(window.location.search);
      let params = new URLSearchParams(queryString);
      let transactionId = params.get('transactionId');
      console.log(transactionId);
      if ((transactionId) && (transactionId !== '')) {
        let callURLTokenURL = '/api/tasks/find/transaction/' + transactionId;
        $.get(callURLTokenURL, {}, async function(data){
          console.log(data);
          if ((data) && (data.token)) {
            sessionStorage.setItem('logged', true);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userdata', JSON.stringify(data.radioUserData));
            let taskData = data.Records[0];
            quickCaseId = taskData.caseId;
            userdata = data.radioUserData;
            if (userdata.userprofiles.length == 0){
              userdata.userprofiles.push({Profile: profile.defaultRadioProfileV2});
            }
            doLoadMainPage();
            //doAutoAcceptCase(0);
            util.wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
            doSetupAutoReadyAfterLogin();
            let radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
            let remark = 'รังสีแพทบ์ ' + radioNameTH + ' เข้าอ่านผลทาง Quick Link';
            let response = await common.doUpdateCaseStatus(quickCaseId, 8, remark);
            if (response.status.code == 200) {
              let eventData = data.caseData;
              eventData.startDownload = 1;
              onOpenCaseTrigger(eventData);
              //$('body').loading('stop');
            } else {
    					$.notify('เกิดข้อผิดพลาด ไม่สามารถอัพเดทสถานะเคสได้ในขณะนี้', 'error');
    				}
          } else {
            doLoadLogin();
            //console.log(data);
          }
        }).fail(function(error) {
          console.erroe(error);
          doLoadLogin();
        });
      } else {
        let queryString = decodeURIComponent(window.location.search);
        let params = new URLSearchParams(queryString);
        let caseId = params.get('caseId');
        let token = params.get('token');
        if ((caseId) && (token)) {
          let callURLTokenURL = '/api/tasks/case/open/data/' + caseId;
          $.get(callURLTokenURL, {}, async function(data){
            console.log(data);
            if ((data) && (data.token)) {
              sessionStorage.setItem('logged', true);
              localStorage.setItem('token', data.token);
              localStorage.setItem('userdata', JSON.stringify(data.radioUserData));
              userdata = data.radioUserData;
              /*
              if (userdata.userprofiles.length == 0){
                userdata.userprofiles.push({Profile: profile.defaultRadioProfileV2});
              }
              */
              doLoadMainPage();
              util.wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
              let eventData = data.caseData;
              eventData.startDownload = 0;
              onOpenCaseTrigger(eventData);
              //$('body').loading('stop');
            }
          });
        } else {
          doLoadLogin();
        }
      }
    }
	};

  const doLoadLogin = function(){
    common.doUserLogout(util.wsm);
  }

	initPage();

});

function doCallLoginApi(user) {
  return new Promise(function(resolve, reject) {
    var loginApiUri = '/api/login/';
    var params = user;
    //$.post(loginApiUri, params, function(response){
    common.doCallApi(loginApiUri, params).then((response)=>{
			resolve(response);
		}).catch((err) => {
			console.log(JSON.stringify(err));
      reject(err);
		})
	});
}

function doLoadRadioConfigApi(userId) {
  return new Promise(function(resolve, reject) {
    var loadOriginUrl = '/api/radiologist/load/config/' + userId;
    var params = {userId};
    //$.post(loadOriginUrl, params, function(response){
    common.doCallApi(loadOriginUrl, params).then((response)=>{
			resolve(response);
		}).catch((err) => {
			console.log(JSON.stringify(err));
      reject(err);
		})
  });
}

function doLoadMainPage(){
  let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../lib/notify.min.js';
  let html2textlib = '../lib/to-asciidoc.js';
  let htmlformatlib = '../lib/htmlformatlib.js';
  let jssip = "../lib/jssip-3.9.0.min.js";

	let countdownclockPluginUrl = "../setting/plugin/jquery-countdown-clock-plugin.js";
	let controlPagePlugin = "../setting/plugin/jquery-controlpage-plugin.js";
  let readystatePlugin = "../setting/plugin/jqury-readystate-plugin.js";
  let chatBoxPlugin = "../setting/plugin/jquery-chatbox-plugin.js";
  let utilityPlugin = "../setting/plugin/jquery-radutil-plugin.js";
  let sipPhonePlugin = "../setting/plugin/jquery-sipphone-income-plugin.js";

  $('head').append('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />');
  $('head').append('<meta http-equiv="Pragma" content="no-cache" />');
  $('head').append('<meta http-equiv="Expires" content="0"/>');

	$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
	//https://notifyjs.jpillora.com/
	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  $('head').append('<script src="' + html2textlib + '"></script>');
  $('head').append('<script src="' + htmlformatlib + '"></script>');
  $('head').append('<script src="' + jssip + '"></script>');

	$('head').append('<script src="' + countdownclockPluginUrl + '"></script>');
	$('head').append('<script src="' + controlPagePlugin + '"></script>');
  $('head').append('<script src="' + readystatePlugin + '"></script>');
  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');
  $('head').append('<script src="' + sipPhonePlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');

  /*
  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

	$('body').on('loading.start', function(event, loadingObj) {
	  //console.log('=== loading show ===');
	});

	$('body').on('loading.stop', function(event, loadingObj) {
	  //console.log('=== loading hide ===');
	});
  */

  document.addEventListener("triggercounter", welcome.onCaseChangeStatusTrigger);
  //document.addEventListener("callzoominterrupt", welcome.doInterruptZoomCallEvt);
  document.addEventListener("callzoominterrupt", welcome.doInterruptWebRTCCallEvt);
  document.addEventListener("lockscreen", onLockScreenTrigger);
  document.addEventListener("unlockscreen", onUnLockScreenTrigger);
  document.addEventListener("autologout", onAutoLogoutTrigger);
  document.addEventListener("updateuserprofile", onUpdateUserProfileTrigger);
  document.addEventListener("newreportlocalresult", onNewReportLocalTrigger);
  document.addEventListener("newreportlocalfail", onNewReportLocalFail);

  let userdata = JSON.parse(doGetUserData());

  let mainFile= '../case/form/main-fix.html';
  let mainStyle= '../case/css/main-fix.css';
  let menuFile = 'form/menu.html';
  let menuStyle = '../case/css/menu-fix.css';
  let commonStyle = '../stylesheets/style.css';
  let caseStyle = '../case/css/style.css';

  $('head').append('<link rel="stylesheet" href="' + commonStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + caseStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + mainStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + menuStyle + '" type="text/css" />');

	$('#app').load(mainFile, function(){
		$('#Menu').load(menuFile, function(){
      $('.case-counter').hide();
      $('.consult-counter').hide();

      $(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
        util.doResetPingCounter();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(util.wsm);
			});
			$(document).on('openhome', (evt, data)=>{
        //$(logWin).empty();
        doLoadDefualtPage(1);
        util.doResetPingCounter();
			});
      $(document).on('opennewstatuscase', async (evt, data)=>{
        //$(logWin).empty();
        let newcaseTitlePage = newcase.doCreateNewCaseTitlePage();
        $("#TitleContent").empty().append($(newcaseTitlePage));
        newcase.doCreateNewCasePage().then((newcasePage)=>{
          $(".mainfull").empty().append($(newcasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              newcase.doCreateNewCasePage().then((newcasePage)=>{
                $(".mainfull").append($(newcasePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
              });
            } else {
              common.doUserLogout(util.wsm);
            }
          }
        });
      });
      $(document).on('openacceptedstatuscase', async (evt, data)=>{
        //$(logWin).empty();
        let acccaseTitlePage = acccase.doCreateAccCaseTitlePage();
        $("#TitleContent").empty().append($(acccaseTitlePage));
        acccase.doCreateAccCasePage().then((acccasePage)=>{
          $(".mainfull").empty().append($(acccasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              acccase.doCreateAccCasePage().then((acccasePage)=>{
                $(".mainfull").append($(acccasePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
              });
            } else {
              common.doUserLogout(util.wsm);
            }
          }
        });
      });
      $(document).on('opensearchcase', async (evt, data)=>{
        //$('body').loading('start');
        let yesterDayFormat = util.getYesterdayDevFormat();
        let toDayFormat = util.getTodayDevFormat();
        let defaultSearchKey = {fromDateKeyValue: yesterDayFormat, toDateKeyValue: toDayFormat, patientNameENKeyValue: '*', patientHNKeyValue: '*', bodypartKeyValue: '*', caseStatusKeyValue: 0};
        let defaultSearchParam = {key: defaultSearchKey, hospitalId: userdata.hospitalId, userId: userdata.id, usertypeId: userdata.usertypeId};
        let searchTitlePage = searchcase.doCreateSearchTitlePage();

        $("#TitleContent").empty().append($(searchTitlePage));

        let callsearchKeyUrl = '/api/cases/search/key';
        common.doCallApi(callsearchKeyUrl, defaultSearchParam).then(async(response)=>{
          if (response.status.code === 200) {
            let searchResultViewDiv = $('<div id="SearchResultView"></div>');
            $(".mainfull").empty().append($(searchResultViewDiv));
            await searchcase.doShowSearchResultCallback(response);
            common.doScrollTopPage();
          } else if (response.status.code === 210) {
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              common.doCallApi(callsearchKeyUrl, defaultSearchParam).then(async(response)=>{
                if (response.status.code === 200) {
                  let searchResultViewDiv = $('<div id="SearchResultView"></div>');
                  $(".mainfull").empty().append($(searchResultViewDiv));
                  await searchcase.doShowSearchResultCallback(response);
                  common.doScrollTopPage();
                } else {
                  $(".mainfull").empty().append('<h3>ระบบค้นหาเคสขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
                }
                util.doResetPingCounter();
                //$('body').loading('stop');
              });
            } else {
              common.doUserLogout(util.wsm);
            }
          } else {
            $(".mainfull").empty().append('<h3>ระบบค้นหาเคสขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
          }
          util.doResetPingCounter();
          //$('body').loading('stop');
        });
        util.doResetPingCounter();
      });
      $(document).on('opencase', async (evt, caseData)=>{
        onOpenCaseTrigger(caseData);
        util.doResetPingCounter();
      });
      $(document).on('openprofile', async (evt, data)=>{
        let profileTitlePage = profile.doCreateProfileTitlePage();
        $("#TitleContent").empty().append($(profileTitlePage));
        profile.doCreateProfilePage().then((profilePage)=>{
          $(".mainfull").empty().append($(profilePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              profile.doCreateProfilePage().then((profilePage)=>{
                $(".mainfull").empty().append($(profilePage));
                common.doScrollTopPage();
              });
            } else {
              common.doUserLogout(util.wsm);
            }
          }
        })
      });
      $(document).on('opentemplatedesign', async (evt, data)=>{
        let templateTitlePage = template.doCreateTemplateTitlePage();
        $("#TitleContent").empty().append($(templateTitlePage));
        template.doCreateTemplatePage().then((templatePage)=>{
          $(".mainfull").empty().append($(templatePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              template.doCreateTemplatePage().then((templatePage)=>{
                $(".mainfull").empty().append($(templatePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
              });
            } else {
              common.doUserLogout(util.wsm);
            }
          }
        });
      });
      $(document).on('defualsettingschange', (evt, data)=>{
				doUpdateDefualSeeting(data.key, data.value);
        util.doResetPingCounter();
			});

			doUseFullPage();
      /*
      $('.mainfull').bind('copy', (evt)=>{
        common.onSimpleEditorCopy(evt);
        util.doResetPingCounter();
      });
      */
      $('.mainfull').bind('paste', (evt)=>{
        common.onSimpleEditorPaste(evt);
        //util.doResetPingCounter();
      });
      $('#quickreply').bind('paste', (evt)=>{
        common.onSimpleEditorPaste(evt);
        //util.doResetPingCounter();
      });
      $(document).on('draftbackupsuccess', async (evt, data)=>{
        //Paste ครั้งแรก ของการเปิด case ให้เซฟทันที
        let backupDraftCounter = opencase.getBackupDraftCounter();
        //console.log(backupDraftCounter);
        if (backupDraftCounter == 0){
          let type = 'draft';
          let caseId = data.caseId
          //console.log(caseId);
          let responseHTML = data.content;
          if (responseHTML) {
            let responseText = toAsciidoc(responseHTML);
            let userdata = JSON.parse(localStorage.getItem('userdata'));
            let userId = userdata.id;
            let radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
            let saveData = {Response_HTML: responseHTML, Response_Text: responseText, Response_Type: type};
            $.post('/api/caseresponse/select/' + caseId, {}, function(callRes){
              //console.log(callRes);
              let apiUri = '/api/caseresponse/save';
              let params = undefined;
              if (callRes.Record.length > 0) {
                let responseId = callRes.Record[0].id;
                opencase.setCaseResponseId(responseId);
                params = {caseId: caseId, userId: userId, data: saveData, responseId: responseId, radioNameTH: radioNameTH};
              } else {
                params = {caseId: caseId, userId: userId, data: saveData, radioNameTH: radioNameTH};
              }
              $.post(apiUri, params, function(saveRes){
                //console.log(saveRes);
                if ((saveRes.result) && (saveRes.result.responseId)) {
                  opencase.setCaseResponseId(saveRes.result.responseId);
                }
                opencase.setBackupDraftCounter(backupDraftCounter+1);
              }).fail(function(error) {
                console.log('1st Paste Backup Error', error);
              });
            });
          }
        }
      });

      let idleTime = 0;

      let idleTimerIncrement = function() {
        idleTime = idleTime + 1;
        let userdata = doGetUserData();
        userdata = JSON.parse(userdata);
        if ((userdata.userprofiles) && (userdata.userprofiles.length> 0) && (userdata.userprofiles[0].Profile)) {
          let minuteLockScreen = Number(userdata.userprofiles[0].Profile.lockState.autoLockScreen);
          let minuteLogout = Number(userdata.userprofiles[0].Profile.offlineState.autoLogout);
          if (idleTime > minuteLockScreen) {
            let eventName = 'lockscreen';
            let evtData = {};
            let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
            document.dispatchEvent(event);
          }
          if (minuteLogout > 0){
            if (idleTime == minuteLogout) {
              let eventName = 'autologout';
              let evtData = {};
              let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
              document.dispatchEvent(event);
            }
          }
        }
      }

      let idleInterval = setInterval(idleTimerIncrement, 60000); // 1 minute

      $('#app').on('mousemove', (evt)=> {
        idleTime = 0;
      });
      $('#app').on('keypress', (evt)=> {
        idleTime = 0;
      });

    });
  });
}

const onOpenCaseTrigger = function(caseData) {
  let caseBK = localStorage.getItem('draftbackup');
  if (caseBK) {
    caseBK = JSON.parse(caseBK);
    if ((caseBK) && (caseBK.caseId != caseData.caseId)) {
      localStorage.removeItem('draftbackup');
    }
  }
  $("#TitleContent").empty();
  let opencaseTitlePage = acccase.doCreateAccCaseTitlePage();
  //$("#TitleContent").append($(opencaseTitlePage));
  opencase.doCreateOpenCasePage(caseData).then((opencasePage)=>{
    $.notify('เปิดเคส สำเร็จ', 'success');

    let firstLink = '/images/case-incident-icon-3.png'
		window.fetch(firstLink, {method: 'GET'}).then(response => response.blob()).then(blob => {
      $(".mainfull").empty().append($(opencasePage));
      common.doScrollTopPage();
      util.doResetPingCounter();
      let url = window.URL.createObjectURL(blob);
      $(opencaseTitlePage).find('img').attr('src', url);
      $("#TitleContent").append($(opencaseTitlePage));
      common.downloadDicomList = [];
    });

  }).catch(async (err)=>{
    if (err.error.code == 210){
      let rememberme = localStorage.getItem('rememberme');
      if (rememberme == 1) {
        let newUserData = await apiconnector.doCallNewTokenApi();
        localStorage.setItem('token', newUserData.token);
        localStorage.setItem('userdata', JSON.stringify(newUserData.data));
        opencase.doCreateOpenCasePage(caseData).then((opencasePage)=>{
          $(".mainfull").empty().append($(opencasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
          $.notify('เปิดเคส สำเร็จ', 'success');

          let firstLink = '/images/case-incident-icon-3.png'
          window.fetch(firstLink, {method: 'GET'}).then(response => response.blob()).then(blob => {
            let url = window.URL.createObjectURL(blob);
            $(opencaseTitlePage).find('img').attr('src', url);
          });

        });
      } else {
        common.doUserLogout(util.wsm);
      }
    }
  });
}

function doUseFullPage() {
	$(".row").show();
	$(".mainfull").show();
	$(".mainfull").empty();
  common.doAddNotifyCustomStyle();
}

function doLoadDefualtPage(autoSelectPage) {
  let homeTitlePage = welcome.doCreateHomeTitlePage();
  $("#TitleContent").empty().append($(homeTitlePage));
  welcome.doSetupCounter().then((loadRes)=>{
    /*
    let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
    dicomzipsync.forEach((dicom, i) => {
      if (!dicom.zipfileURL) {
        util.dicomZipSyncWorker.postMessage({studyID: dicom.studyID, type: 'application/x-compressed'});
      }
    });
    */
    util.doResetPingCounter();
    let responseHTML = $('#SimpleEditor').val();
    if ((responseHTML) && (responseHTML !== '')) {

    } else {
      if (autoSelectPage == 1) {
        if (loadRes.accList.Records.length > 0) {
          $('#AcceptedCaseCmd').click();
        } else if (loadRes.newList.Records.length > 0 ) {
          $('#NewCaseCmd').click();
        } else {
          $(".mainfull").empty();
        }
      } else {
        if (loadRes.newList.Records.length > 0 ) {
          $('#NewCaseCmd').click();
        } else if (loadRes.accList.Records.length > 0) {
          $('#AcceptedCaseCmd').click();
        } else {
          $(".mainfull").empty();
        }
      }
    }
    //$('body').loading('stop');
  }).catch(async (err)=>{
    if (err.error.code == 210){
      let rememberme = localStorage.getItem('rememberme');
      if (rememberme == 1) {
        let newUserData = await apiconnector.doCallNewTokenApi();
        localStorage.setItem('token', newUserData.token);
        localStorage.setItem('userdata', JSON.stringify(newUserData.data));
        welcome.doSetupCounter().then((loadRes)=>{
          $(".mainfull").empty();
          //$('body').loading('stop');
        });
      } else {
        common.doUserLogout(util.wsm);
      }
    }
  });
}

const doUpdateDefualSeeting = function (key, value){
	let lastDefualt = JSON.parse(localStorage.getItem('defualsettings'));
	if (lastDefualt.hasOwnProperty(key)) {
		lastDefualt[key] = value;
		localStorage.setItem('defualsettings', JSON.stringify(lastDefualt));
	}
}

function doCreatePasswordUnlockScreen(unlockActionCallback){
  let passwordUnlockBox = $('<div style="position: relative; width: 100%; padding: 10px;"></div>');
  let passwordInputbox = $('<div style="position: relative; width: 100%;"></div>');
  $(passwordInputbox).appendTo($(passwordUnlockBox));
  let yourPassword = $('<input type="password" tabindex="0" id="YourPassword" style="margin-left: 10px; width: 100px;"/>');
  $(passwordInputbox).append($('<span>ป้อนรหัสผ่านของคุณ:</span>'));
  $(passwordInputbox).append($(yourPassword));

  let cmdBar = $('<div style="position: relative; width: 100%; margin-top: 10px;"></div>');
  $(cmdBar).appendTo($(passwordUnlockBox));
  let unlockCmd = $('<input type="button" value=" ปลดล็อค "/>');
  $(unlockCmd).appendTo($(cmdBar));
  $(unlockCmd).on('click', (evt)=>{
    if($(yourPassword).val() !== '') {
      $(yourPassword).css('border', '');
      unlockActionCallback($(yourPassword).val());
    } else {
      $(yourPassword).css('border', '1px solid red');
      $.notify("คุณยังไม่ได้ป้อนรหัสผ่าน", "error");
    }
  });
  $(yourPassword).on('keypress', (evt)=>{
    if(evt.which == 13) {
      if($(yourPassword).val() !== '') {
        $(yourPassword).css('border', '');
        unlockActionCallback($(yourPassword).val());
      } else {
        $(yourPassword).css('border', '1px solid red');
        $.notify("คุณยังไม่ได้ป้อนรหัสผ่าน", "error");
      }
    }
  });

  return $(passwordUnlockBox);
}

const resetScreen = function(){
  $('#quickreply').empty();
  $('#quickreply').removeAttr('style');
  util.doSetScreenState(0);
  util.doResetPingCounter();
}

function unlockAction(modalBox) {
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  console.log(userdata);
  const unlockCallbackAction = function(yourPassword){
    let user = {username: userdata.username, password: yourPassword};
		doCallLoginApi(user).then((response) => {
			if (response.success == true) {
        let welcomeMsg = 'Welcome back ' + userdata.username;
        $.notify(welcomeMsg, "success");
        resetScreen();
        doAutoAcceptCase(1);
      } else {
        $.notify("รหัสผ่านของคุณไม่ถูกต้อง", "error");
      }
    });
  }

  if (userdata.userprofiles[0].Profile.lockState.passwordUnlock == 1) {
    $(modalBox).empty();
    let passwordBox = doCreatePasswordUnlockScreen( unlockCallbackAction );
    $(modalBox).append($(passwordBox));
    $(modalBox).css({ height: 'auto'});
    $(passwordBox).find('#YourPassword').focus();
  } else {
    resetScreen();
    doAutoAcceptCase(1);
  }
}

function onLockScreenTrigger() {
  let responseHTML = $('#SimpleEditor').val();
  let caseData = $('#SimpleEditor').data('casedata');
  if ((responseHTML) && (responseHTML !== '') && (caseData)) {
    let startPointText = '<!--StartFragment-->';
    let endPointText = '<!--EndFragment-->';
    let tempToken = responseHTML.replace('\n', '');
    let startPosition = tempToken.indexOf(startPointText);
    if (startPosition >= 0) {
      let endPosition = tempToken.indexOf(endPointText);
      tempToken = tempToken.slice((startPosition+20), (endPosition));
    }
    tempToken = tempToken.replace(startPointText, '<div>');
    tempToken = tempToken.replace(endPointText, '</div>');
    let draftbackup = {caseId: caseData.caseId, content: tempToken, backupAt: new Date()};
    localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
  }
  let lockScreenBox = $('<div style="width: 100%; text-align: center;" tabindex="0"></div>');
  $(lockScreenBox).append('<h2>Press any key to unlock</h2>');
  //$(lockScreenBox).append('<h3>You can Unlock by Click mouse or press any key.</h3>');
  let lockScreenBoxStyle = { 'background-color': '#fefefe', 'margin': '21% auto', 'padding': '10px', 'border': '2px solid #888', 'width': '620px', 'height': 'auot' };
  $(lockScreenBox).css(lockScreenBoxStyle);
  $('#quickreply').empty().append($(lockScreenBox));
  //$('#quickreply').attr('tabindex', 0);
  $('#quickreply').focus();
  $('#quickreply').css(modalLockScreenStyle);
  util.doSetScreenState(1);
  /*
  $('#quickreply').on('mousemove', (evt)=>{
    $('#quickreply').attr('onmousemove', '').unbind("mousemove");
    unlockAction(lockScreenBox);
  });
  */
  $('#quickreply').on('click', (evt)=>{
    $('#quickreply').attr('onclick', '').unbind("click");
    unlockAction(lockScreenBox);
  });
  $('#quickreply').on('keypress', (evt)=>{
    $('#quickreply').attr('onkeypress', '').unbind("keypress");
    unlockAction(lockScreenBox);
  });
}

function onUnLockScreenTrigger(evt){
  resetScreen();
}

function onAutoLogoutTrigger(evt){
  //doLoadLogin();
  let myWsm = doGetWsm();
  common.doUserLogout(myWsm);
}

function onUpdateUserProfileTrigger(evt){
  let newProfile = evt.detail.data.Profile;
  let newReadyState = newProfile.readyState;

  const userdata = JSON.parse(localStorage.getItem('userdata'));
  userdata.userprofiles[0].Profile.readyState = newReadyState;
  userdata.userprofiles[0].Profile.readyBy = 'bot';
  localStorage.setItem('userdata', JSON.stringify(userdata));

  let readyLogic = undefined;
  if (newReadyState == 1) {
    readyLogic = true;
  } else {
    readyLogic = false;
  }
  $('#app').find('#ReadyState').find('input[type="checkbox"]').prop('checked', readyLogic);
}

function onNewReportLocalTrigger(evt){
  let triggerData = evt.detail.data;
  console.log(triggerData);
  $.notify('ส่งผลอ่านของ ' + triggerData.patientFullName + ' เข้า PACS รพ. สำเร็จ', 'success');
}

function onNewReportLocalFail(evt){
  let triggerData = evt.detail.data;
  console.log(triggerData);
  let msgBox = $('<div></div>');
  let titleBox = $("<div style='text-align: center; background-color: white; color: black;'></div>");
  $(titleBox).append($('<h4>แจ้งเตือน</h4>'));
  let bodyBox = $("<div></div>");
  $(bodyBox).append($('<p></p>').text('ระบบไม่สามารถส่งผลอ่านของ ' + triggerData.patientFullName + ' เข้า PACS ของโรงพยาบาลได้ในขณะนี้'));
  //$(bodyBox).append($('<span>คลิกที่ปุ่ม <b>ตกลง</b> เพื่อเปิดภาพและปิดการแจ้งเตือนนี้</span>'));
  let footerBox = $("<div style='text-align: center; background-color: white; color: black;'></div>");
  let closeCmd = $('<input type="button" value="Close" id="CancelNotifyCmd"/>');
  $(closeCmd).on('click', (evt)=>{
    $(msgBox).remove();
  });
  $(footerBox).append($(closeCmd));
  $(msgBox).append($(titleBox)).append($(bodyBox)).append($(footerBox))
  $('body').append($(msgBox).css({'position': 'absolute', 'top': '50px', 'right': '2px', 'width' : '260px', 'border': '2px solid black', 'background-color': '#2579B8', 'color': 'white', 'padding': '5px'}))
}

function doSetupAutoReadyAfterLogin(){
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  const autoReady = userdata.userprofiles[0].Profile.activeState.autoReady;
  if (autoReady == 1){
    let readyState = userdata.userprofiles[0].Profile.readyState;
    if (readyState == 0){
      userdata.userprofiles[0].Profile.readyState = 1;
      userdata.userprofiles[0].Profile.readyBy = 'auto';
  		localStorage.setItem('userdata', JSON.stringify(userdata));
  		let rqParams = {data: userdata.userprofiles[0].Profile, userId: userdata.id};
  		let profileRes = common.doCallApi('/api/userprofile/update', rqParams);
    }
  }
}

function doAutoAcceptCase(autoSelectPage){
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  const radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
  const autoAcc = userdata.userprofiles[0].Profile.activeState.autoAcc;
  if (autoAcc == 1){
    newcase.doCallMyNewCase().then(async (myNewCase)=>{
      console.log(myNewCase);
      if (myNewCase.status.code == 200){
        let caseLists = myNewCase.Records;
        if (caseLists.length > 0){
          for (let i=0; i < caseLists.length; i++) {
            let caseItem = caseLists[i].case;
            await common.doUpdateCaseStatus(caseItem.id, 2, 'รังสีแพทย์ ' + radioNameTH + ' ตั้งรับเคสอัตโนมัติ');
          }
          doLoadDefualtPage(autoSelectPage);
        } else {
          doLoadDefualtPage(autoSelectPage);
        }
      }
      //$('body').loading('stop');
    });
  } else {
    doLoadDefualtPage(autoSelectPage);
  }
}

function doGetToken(){
	return localStorage.getItem('token');
}

function doGetUserData(){
  return localStorage.getItem('userdata');
}

function doGetUserConfigs(){
  return localStorage.getItem('userconfigs');
}

function doGetUserItemPerPage(){
	let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
  return userDefualtSetting.itemperpage;
}

function doGetWsm(){
	return util.wsm;
}

module.exports = {
  doGetToken,
  doGetUserData,
  doGetUserConfigs,
	doGetUserItemPerPage,
	doGetWsm
}

},{"../case/mod/apiconnect.js":1,"../case/mod/commonlib.js":2,"../case/mod/softphonelib.js":3,"../case/mod/userinfolib.js":5,"../case/mod/userprofilelib.js":6,"../case/mod/utilmod.js":7,"./mod/acccaselib.js":12,"./mod/newcaselib.js":16,"./mod/opencase.js":18,"./mod/profilelibV2.js":19,"./mod/searchcaselib.js":20,"./mod/templatelib.js":21,"./mod/welcomelib.js":23,"jquery":24}],12:[function(require,module,exports){
/* acccaselib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  const doCreateAccCaseTitlePage = function() {
    const acccaseTitle = 'เคสรออ่าน';
    let acccaseTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(acccaseTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + acccaseTitle + '</h3></div>');
    $(titleText).appendTo($(acccaseTitleBox));
    return $(acccaseTitleBox);
  }

  const doCreateHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Receive</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Left</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Scan Part</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Urgent</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Sex/Age</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Status</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Process</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  const doCreateCaseItemCommand = function (caseItem) {
		//let caseItem = incident.case;
    let userdata = JSON.parse(localStorage.getItem('userdata'));
    let caseCmdBox = $('<div style="text-align: center; padding: 4px;"></div>');
		let openCmdText = undefined;
		if (caseItem.casestatusId == 14) {
			openCmdText = 'ตอบข้อความ';
		} else {
			openCmdText = 'อ่านผล';
		}
    let openCmd = $('<div id="OpenCaseCmd"></div>').text(openCmdText);
    $(openCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '5px 12px', 'border-radius': '12px', 'cursor': 'pointer', 'color': 'white'});
		if (caseItem.casestatusId == 2) {
			$(openCmd).css({'background-color' : 'orange'});
		} else {
			$(openCmd).css({'background-color' : 'green'});
		}
    $(openCmd).on('click', async (evt)=>{
			let eventData = common.doCreateOpenCaseData(caseItem);
			let currentCaseRes = await common.doGetApi('/api/cases/status/' + caseItem.id, {});
			if (currentCaseRes.current == 2){

				let nextCaseStatus = 8;
				let radioName = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
				let actionRemark = 'รังสีแพทย์ ' + radioName + ' เปิดเคสสำเร็จ [web]'
	      let response = await common.doUpdateCaseStatus(caseItem.id, nextCaseStatus, actionRemark);
				if (response.status.code == 200) {
		      eventData.statusId = nextCaseStatus;
					eventData.startDownload = 0;
		      $(openCmd).trigger('opencase', [eventData]);
				} else {
					$.notify('เกิดข้อผิดพลาด ไม่สามารถอัพเดทสถานะเคสได้ในขณะนี้', 'error');
				}

			} else if ((currentCaseRes.current == 8) || (currentCaseRes.current == 9) || (currentCaseRes.current == 14)){
				eventData.statusId = caseItem.casestatusId;
				eventData.startDownload = 0;
	      $(openCmd).trigger('opencase', [eventData]);
			} else {
				$.notify('ขออภัย เคสไม่อยู่ในสถานะที่จะพิมพ์ผลอ่านแล้ว', 'error');
				//refresh page
			}
    });
    $(caseCmdBox).append($(openCmd));

    return $(caseCmdBox);
  }

  const doCreateCaseItemRow = function(incident, caseTask) {
    return new Promise(async function(resolve, reject) {
			let caseItem = incident.case;
			let caseDate = util.formatDateTimeStr(caseItem.createdAt);
			let casedatetime = caseDate.split(' ');
			let casedateSegment = casedatetime[0].split('-');
			casedateSegment = casedateSegment.join('');
			let casedate = util.formatStudyDate(casedateSegment);
			let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
			let patientName = caseItem.patient.Patient_NameEN + ' ' + caseItem.patient.Patient_LastNameEN;
			let patientSA = caseItem.patient.Patient_Sex + '/' + caseItem.patient.Patient_Age;
			let patientHN = caseItem.patient.Patient_HN;
			let caseScanparts = caseItem.Case_ScanPart;
			let yourSelectScanpartContent = $('<div></div>');
			if ((caseScanparts) && (caseScanparts.length > 0)) {
				yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
			}
			//let caseUG = caseItem.urgenttype.UGType_Name;
			let caseUG = caseItem.sumase.UGType_Name;
      let caseHosName = caseItem.hospital.Hos_Name;
      let caseSTA = caseItem.casestatus.CS_Name_EN;

			let caseCMD = doCreateCaseItemCommand(caseItem);

      let caseRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');
			$(caseRow).css({'cursor': 'pointer'});
			$(caseRow).on('dblclick', async (evt)=>{
				let nextCaseStatus = 8;
				if (caseItem.casestatusId == 2){
					let radioName = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
					let actionRemark = 'รังสีแพทย์ ' + radioName + ' เปิดเคสสำเร็จ [web]'
					let response = await common.doUpdateCaseStatus(caseItem.id, nextCaseStatus, actionRemark);
				}
				let eventData = common.doCreateOpenCaseData(caseItem);
				eventData.statusId = nextCaseStatus;
				eventData.startDownload = 1;
				$(caseCMD).trigger('opencase', [eventData]);
			});
  		let caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append('<span>' + casedate + ' : ' + casetime + '</span>');
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			if (caseItem.casestatusId != 9) {
	      if ((caseTask) && (caseTask.triggerAt)){
					let now = new Date();
					console.log(now);
					console.log(caseTask.triggerAt);
	        let caseTriggerAt = new Date(caseTask.triggerAt);
					//caseTriggerAt.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
					//caseTriggerAt = new Date(caseTriggerAt.getTime() + (3600000 * 1));
					caseTriggerAt = new Date(caseTriggerAt.getTime());
	        console.log(caseTriggerAt);
					let diffTime = caseTriggerAt.getTime() - now.getTime();
	        let hh = parseInt(diffTime/(1000*60*60));
	        let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
					console.log(hh, mn);
	        let clockCountdownDiv = $('<div></div>').css({'width': '100%', 'text-align': 'center'});
	        $(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
	        $(caseColumn).append($(clockCountdownDiv));
					let totalMinus = (hh*60) + mn;
					if (totalMinus < 30){
						$(clockCountdownDiv).css({'background-color': '#8532EF', 'color': 'white'});
					} else if (totalMinus < 60){
						$(clockCountdownDiv).css({'background-color': '#EF3232', 'color': 'white'});
					} else if (totalMinus < 240){
						$(clockCountdownDiv).css({'background-color': '#FF5733', 'color': 'white'});
					} else if (totalMinus < 1440){
						$(clockCountdownDiv).css({'background-color': '#F79C06', 'color': 'white'});
					} else {
						$(clockCountdownDiv).css({'background-color': '#177102 ', 'color': 'white'});
					}
	      } else {
	        //$(caseColumn).append($('<span>not found Task</span>'));
					$(caseColumn).append($('<span style="color: red;">-</span>'));
					//console.error('not found Task');
	  		}
			} else {
				$(caseColumn).append($('<span>-</span>'));
			}
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($(yourSelectScanpartContent));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + caseUG + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + patientHN + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + patientName + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + patientSA + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + caseHosName + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($('<span>' + caseSTA + '</span>'));
  		$(caseColumn).appendTo($(caseRow));

      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(caseColumn).append($(caseCMD));
  		$(caseColumn).appendTo($(caseRow));

      resolve($(caseRow));
			/*
			let eventName = 'triggercounter'
			let triggerData = {caseId : caseItem.id, statusId: 7, thing: 'case'};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
			resolve();
			*/
    });
  }

  const doCallMyAccCase = function(){
    return new Promise(async function(resolve, reject) {
      const main = require('../main.js');
			let userdata = JSON.parse(main.doGetUserData());
			let userId = userdata.id;
			let rqParams = {userId: userId, statusId: common.caseResultWaitStatus};
			let apiUrl = '/api/cases/filter/radio';
			try {
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				//let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doCallMyTasksCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let username = userdata.username;
			let rqParams = {userId: userId, username: username, statusId: common.caseReadWaitStatus};
			let apiUrl = '/api/tasks/filter/radio/' + userId;
			try {
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				//let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doFindTaksOfCase = function(tasks, caseId){
		return new Promise(async function(resolve, reject) {
			if ((tasks) && (tasks.length > 0)){
				let task = await tasks.find((item)=>{
					if (Number(item.caseId) === Number(caseId)) return item;
				});
				resolve(task);
			} else {
				resolve();
			}
		});
	}

  const doCreateAccCasePage = function() {
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
      let myAccCase = await doCallMyAccCase();
			let myTaksCase = await doCallMyTasksCase();
			if (myAccCase.status.code == 200){
	      let myAccCaseView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
	      let caseHearder = doCreateHeaderRow();
	      $(myAccCaseView).append($(caseHearder));
	      let caseLists = myAccCase.Records;
	      if (caseLists.length > 0) {
	        for (let i=0; i < caseLists.length; i++) {
	          let caseItem = caseLists[i];
						//console.log(myTaksCase);
						let task = await doFindTaksOfCase(myTaksCase.Records, caseItem.case.id);
		        let caseRow = await doCreateCaseItemRow(caseItem, task);
						if (caseRow){
	          	$(myAccCaseView).append($(caseRow));
						}
	        }
					$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').text(caseLists.length);
					$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
	      } else {
	        let notFoundMessage = $('<h3>ไม่พบรายการเคสใหม่ของคุณในขณะนี้</h3>')
	        $(myAccCaseView).append($(notFoundMessage));
					$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
	      }
	      resolve($(myAccCaseView));
	      //$('body').loading('stop');
			} else if (myAccCase.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyAccCase';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

  return {
    doCreateAccCaseTitlePage,
    doCreateHeaderRow,
    doCreateCaseItemRow,
    doCallMyAccCase,
    doCreateAccCasePage
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7,"../main.js":11}],13:[function(require,module,exports){
/*ai-lib.js*/
module.exports = function ( jq ) {
	const $ = jq;
	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  const commandButtonStyle = {'padding': '3px', 'cursor': 'pointer', 'border': '1px solid white', 'color': 'white', 'background-color': 'blue'};
	const quickReplyDialogStyle = { 'position': 'fixed', 'z-index': '13', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto', 'background-color': 'rgb(0,0,0)', 'background-color': 'rgba(0,0,0,0.4)'};
	const quickReplyContentStyle = { 'background-color': '#fefefe', 'margin': '15% auto', 'padding': '10px', 'border': '1px solid #888', 'width': '520px', 'height': '200px', /*'font-family': 'THSarabunNew',*/ 'font-size': '20px' };

  const doCallCheckSeries = function(studyID) {
    return new Promise(async function(resolve, reject) {
      let seriesList = await common.doGetLocalSeriesList(studyID);
			if (seriesList){
	      let seriesDescList = [];
	      let	promiseList = new Promise(async function(resolve2, reject2){
	        seriesList.Series.forEach(async(item, i) => {
						//let seriesTags = await common.doGetOrthancSeriesDicom(item);
	          let seriesTags = await common.doGetLocalOrthancSeriesDicom(item);
						let seriesName = undefined;
						if (seriesTags.MainDicomTags.SeriesDescription){
							seriesName = seriesTags.MainDicomTags.SeriesDescription
						} else {
							seriesName = '[ ' + seriesTags.MainDicomTags.BodyPartExamined + ' ]'
						}
	          let seriesView = {id: item, desc: seriesName};
	          seriesDescList.push(seriesView);
	        });
	        setTimeout(()=>{
						resolve2(seriesDescList);
					}, 2500);
				});
	      Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
			} else {
				resolve();
			}
    });
  }

  const doCreateSeriesSelect = function(dicomSeries){
    return new Promise(async function(resolve, reject) {
      let selectView = $('<div style="width: 100%;"></div>');
      let titleGuide = $('<div style="position: relative; width: 100%; padding: 2px; background-color: #02069B; color: white;"></div>');
      let figgerIcon = $('<img src="/images/figger-right-icon.png" width="25px" height="auto" style="position: relative; display: inline-block;"/>');
      let guideText = $('<span id="GalleryTitle" style="position: relative; display: inline-block; margin-left: 5px;">โปรดเลือกซีรีส์ที่ต้องการส่งภาพให้ AI</span>');
      $(titleGuide).append($(figgerIcon)).append($(guideText));
      $(titleGuide).appendTo($(selectView));

      let seriesContent = $('<div style="position: relative; width: 100%; padding: 2px;"></div>');
			let	promiseList = new Promise(async function(resolve2, reject2){
	      await dicomSeries.forEach((item, i) => {
	        let seriesItem = $('<div class="series-item" style="position: relative; width: 100%; padding: 2px;"></div>');
	        $(seriesItem).text(item.desc);
	        $(seriesItem).css({'cursor': 'pointer'});
	        $(seriesItem).hover(()=>{
	          $(seriesItem).css({'background-color': '#02069B', 'color': 'white'});
	        }, ()=>{
	          $(seriesItem).css({'background-color': '', 'color': ''});
	        });
	        $(seriesItem).on('click', async (evt)=>{
	          //$(selectView).loading('start');
	          $('#quickreply').empty();
						$('#quickreply').append($('<div id="overlay"><div class="loader"></div></div>'));
					  $('#quickreply').loading({overlay: $("#overlay"), stoppable: true});
						$('#quickreply').loading('start');
						//let callSeriesRes = await common.doGetOrthancSeriesDicom(item.id);
	          let callSeriesRes = await common.doGetLocalOrthancSeriesDicom(item.id);
						let modality = callSeriesRes.MainDicomTags.Modality;
						let studyId = callSeriesRes.ParentStudy;
	          let callCreatePreview = await common.doCallCreatePreviewSeries(item.id, callSeriesRes.Instances);
	          let galleryView = await doCreateThumbPreview(item.id, item.desc, callSeriesRes.Instances, studyId, modality);
	          $(galleryView).css(quickReplyContentStyle);
	          $(galleryView).css({'width': '720px', 'height': 'auto'});
	  			  $('#quickreply').append($(galleryView));
						if (callSeriesRes.Instances.length == 1){
							//$(galleryView).find('#ImagePreview').empty();
							$(galleryView).find('#OKCmd').click();
							$(galleryView).find('#ThumbSelector').empty();
							$(galleryView).find('#ThumbSelector').css({'display': 'block'});
						} else {
							$(galleryView).find('#ImagePreview').css({'display': 'block'});
							$(galleryView).find('#ThumbSelector').css({'display': 'block'});
						}
	          $('#quickreply').loading('stop');
	        });
	        $(seriesItem).appendTo($(seriesContent));
	      });
				setTimeout(()=>{
					$(seriesContent).appendTo($(selectView));
		      resolve2($(selectView));
				}, 2500);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
    });
  }

  const doCreateThumbPreview = function(seriesId, seriesDesc, instanceList, studyId, modality){
    return new Promise(async function(resolve, reject) {
      let galleryView = $('<div style="width: 100%;"></div>');
      let titleGuide = $('<div style="position: relative; width: 100%; padding: 2px; background-color: #02069B; color: white;"></div>');
      let figgerIcon = $('<img src="/images/figger-right-icon.png" width="25px" height="auto" style="position: relative; display: inline-block;"/>');
      let guideText = $('<span style="position: relative; display: inline-block; margin-left: 5px;">โปรดเลือกภาพที่ต้องการส่งให้ AI</span>');
      let dialogCmdBox = $('<div style="position: relative; display: inline-block; float: right; padding: 2px;"></div>');
      $(titleGuide).append($(figgerIcon)).append($(guideText)).append($(dialogCmdBox));
      $(titleGuide).appendTo($(galleryView));

      let okCmd = $('<span id="OKCmd" style="padding: 2px; border: 1px solid white; background-color: green; cursor: pointer; border-radius: 10px;">ตกลง</span>');
      $(okCmd).appendTo($(dialogCmdBox));
      $(dialogCmdBox).append($('<span>  </span>'));
      let cancelCmd = $('<span style="padding: 2px; border: 1px solid white; background-color: red; cursor: pointer; border-radius: 10px;">ยกเลิก</span>');
      $(cancelCmd).appendTo($(dialogCmdBox));

      let seriesNameBox = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
      $(seriesNameBox).html('<h4>' + seriesDesc + '</h4>');
      $(seriesNameBox).appendTo($(galleryView));

      let imagePreview = $('<div id="ImagePreview" style="width: 100%; min-height: 220px; text-align: center; margin-top: 5px; display: none;"></div>');
      $(imagePreview).appendTo($(galleryView));
      let thumbSelector = $('<div id="ThumbSelector" style="width: 100%; display: none;"></div>');
      $(thumbSelector).appendTo($(galleryView));

      let previewPath = '/img/usr/preview/' + seriesId
      await instanceList.forEach((item, i) => {
        let thumbImg = $('<img width="60" height="auto"/>');
				let thumbFileSrc = previewPath + '/' + item + '.png';
				//console.log(thumbFileSrc);
        $(thumbImg).attr('src', thumbFileSrc);
        $(thumbImg).css({'cursor': 'pointer'});
        $(thumbImg).data('thumbImgData', {instanceId: item});
        $(thumbImg).on('click', async (evt)=>{
          $(thumbSelector).find('img').removeClass('img-thumb-active');
          $(thumbImg).addClass('img-thumb-active');
          let previewImg = $('<img width="360" height="auto"/>');
          $(previewImg).attr('src', previewPath + '/' + item + '.png');
          $(imagePreview).empty().append($(previewImg));
        })
        $(thumbImg).appendTo($(thumbSelector));
      });
      $(okCmd).on('click', async (evt)=>{
        let thumbSelected = $(thumbSelector).find('img.img-thumb-active');
        if (thumbSelected.length > 0){
					//$('#quickreply').loading('start');
					$(galleryView).append($('<div id="overlay"><div class="loader"></div></div>'));
					$(galleryView).loading({overlay: $("#overlay"), stoppable: true});
					$(galleryView).loading('start');

          let thumbData = $(thumbSelected).data('thumbImgData');
					try {
	          let aiRes = await doCallSendAI(seriesId, thumbData.instanceId, studyId);
						console.log(aiRes);
						let pdfLinks = aiRes.result.links;
						let resultBox = $('<div style="width: 97%; padding: 10px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');
						let embetObject = $('<object data="' + aiRes.result.finalpdf + '" type="application/pdf" width="100%" height="480"></object>');
						$(embetObject).appendTo($(resultBox));

						$(thumbSelector).empty().append($(resultBox));

						/* start convert on cloud */
						let userdata = JSON.parse(localStorage.getItem('userdata'));
						let hospitalId = userdata.hospitalId;
						let socketUrl = 'ws://localhost:3000/api/orthanc/' + hospitalId;
						let wsl = undefined;
						try {
							wsl = new WebSocket(socketUrl);
						} catch(err) {
							console.log('Can not connect to local socket.', err);
						}

						console.log(wsl);
						wsl.onopen = function () {
							console.log('Local Client Websocket is connected to Local server')
						};

						wsl.onmessage = function (msgEvt) {
							let data = JSON.parse(msgEvt.data);
							console.log('Local WebSocket Client have data in=> ', data);
						}
						wsl.onclose = function(event) {
							console.log("Local WebSocket Client is closed now. with  event:=> ", event);
						};

						wsl.onerror = function (err) {
							console.log("Local WebSocket Client Got an error", err);
						};

						setTimeout(async()=>{
							if ((wsl.readyState == 0) || (wsl.readyState == 1)){
								let pdffilecode = aiRes.result.pdfs;
								let convertRes = await common.doConvertAIResult(studyId, pdffilecode, modality);
								console.log(convertRes);
								/********/
								//$(okCmd).text('แปลงผลอ่านเข้า PACS');
								/*
									ต้องบอก user ว่า แปลงเข้า local orthanc และ pacs แล้ว
								*/
								wsl.close();
							} else {
								console.log('you are not hospital orthanc host. We can not convert dicom to ypur pacs.');
								let radAlertMsg = $('<div></div>');
								$(radAlertMsg).append($('<p>อุปกรณ์ที่คุณเปิดใช้งานระบบในขณะนี้</p>'));
								$(radAlertMsg).append($('<p>ไม่ใช่อุปกรณที่ได้เชื่อมต่ออยู่กับ PACS</p>'));
								$(radAlertMsg).append($('<p>จึงไม่สามารถส่งภาพผลอ่านจาก AI เข้าไปยัง PACS ได้</p>'));
								$(radAlertMsg).append($('<p>โปรดคลิกปุ่ม <b>ตกลง</b> เพื่อปิดการแจ้งเตือนนี้</p>'));
								const radconfirmoption = {
						      title: 'แจ้งเตือน',
						      msg: $(radAlertMsg),
						      width: '420px',
						      onOk: function(evt) {
										radAlertBox.closeAlert();
						      }
								}
								let radAlertBox = $('body').radalert(radconfirmoption);
								$(radAlertBox.cancelCmd).hide();
							}
						}, 3000);
						$(guideText).text('ผลอ่านจาก AI');
						$(okCmd).text('  ปิด  ');
						$(cancelCmd).hide();
						$(seriesNameBox).hide();
						$(galleryView).loading('stop');
						$(galleryView).find('#overlay').remove();
						$(okCmd).on('click', (evt)=>{
			        $('#quickreply').empty();
			        $('#quickreply').removeAttr('style');
			      });
					} catch (err) {
						$(galleryView).loading('stop');
						$(galleryView).find('#overlay').remove();
						reject(err);
					}
        }
      });
      $(cancelCmd).on('click', (evt)=>{
        $('#quickreply').empty();
        $('#quickreply').removeAttr('style');
      });
      $(thumbSelector).find('img').first().click();
      resolve($(galleryView));
    });
  }

  const doCallSendAI = function(seriesId, instanceId, studyId){
    return new Promise(async function(resolve, reject) {
			try {
	      let callZipRes = await common.doCallCreateZipInstance(seriesId, instanceId);
	      let callSendAIRes = await common.doCallSendAI(seriesId, instanceId, studyId);
	      resolve(callSendAIRes);
			} catch (err) {
				reject(err);
			}
    });
  }

	const doShowSuccessAlertBox = function(){
	  const registerGuideBox = $('<div></div>');
	  $(registerGuideBox).append($('<p>การลงทะเบียนผู้ใช้งาน จำเป็นต้องมี <b>อีเมล์</b> หนึ่งบัญชี</p>'));
	  $(registerGuideBox).append($('<p>และระบบไม่รองรับการลงทะเบียนบน Microsoft Internet Exploere</p>'));
	  $(registerGuideBox).append($('<p>หากพร้อมแล้วคลิกปุ่ม <b>ตกลง</b> เพื่อเปิดการลงทะเบียนบน Google Chrome</p>'));
	  let chromeBrowser = $('<div style="padding: 5px; text-align: center;"><img src="/images/chrome-icon.png" width="100px" height="auto"/></div>');
	  $(registerGuideBox).append($(chromeBrowser));
	  const radregisteroption = {
	    title: 'ตำชี้แจงเพื่อดำเนินการลงทะเบียน',
	    msg: $(registerGuideBox),
	    width: '460px',
	    onOk: function(evt) {
	      let chromeLink = "ChromeHTML:// radconnext.info/index.html?action=register";
	      window.location.replace(chromeLink);
	      registerGuide.closeAlert();
	    }
	  }
	  let registerGuide = $('body').radalert(radregisteroption);
	  $(registerGuide.cancelCmd).hide();
	}

  return {
    commandButtonStyle,
  	quickReplyDialogStyle,
  	quickReplyContentStyle,

    doCallCheckSeries,
    doCreateSeriesSelect,
    doCreateThumbPreview,
    doCallSendAI
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7}],14:[function(require,module,exports){
/*changepwddlg.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  const doCreateChangePwdDlg = function(){
    let changePwdDlg = $('<div></div>');
    let changePwdWrapper = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');
    let newPasswordRow = $('<tr></tr>');
    let retryPasswordRow = $('<tr></tr>');
    $(changePwdWrapper).append($(newPasswordRow)).append($(retryPasswordRow));
    let newPasswordLabelCell = $('<td width="40%" align="left">New Password <span style="color: red;">*</span></td>');
    let newPasswordValueCell = $('<td width="*" align="left"></td>');
    $(newPasswordRow).append($(newPasswordLabelCell)).append($(newPasswordValueCell));
    let retryPasswordLabelCell = $('<td align="left">Retry Password <span style="color: red;">*</span></td>');
    let retryPasswordValueCell = $('<td align="left"></td>');
    $(retryPasswordRow).append($(retryPasswordLabelCell)).append($(retryPasswordValueCell));

    let newPasswordValue = $('<input type="password" id="NewPassword" style="width: 190px;"/>');
    let retryPasswordValue = $('<input type="password" id="RetryPassword" style="width: 190px;"/>');
    $(newPasswordValueCell).append($(newPasswordValue));
    $(retryPasswordValueCell).append($(retryPasswordValue));
    $(changePwdDlg).append($(changePwdWrapper));

    const doVerifyNewPassword = function(){
      let newPassword = $(newPasswordValue).val();
      let retryPassword = $(retryPasswordValue).val();
      if (newPassword !== ''){
        $(newPasswordValue).css({'border': ''});
        if (retryPassword !== ''){
          $(retryPasswordValue).css({'border': ''});
          if (newPassword === retryPassword){
            $(newPasswordValue).css({'border': ''});
            $(retryPasswordValue).css({'border': ''});
            return newPassword;
          } else {
            $(newPasswordValue).css({'border': '1px solid red'});
            $(retryPasswordValue).css({'border': '1px solid red'});
            $.notify('New Password กับ Retry Password มีค่าไม่เหมือนกัน', 'error');
            return;
          }
        } else {
          $(retryPasswordValue).css({'border': '1px solid red'});
          $.notify('Retry Password ต้องไม่ว่าง', 'error');
          return;
        }
      } else {
        $(newPasswordValue).css({'border': '1px solid red'});
        $.notify('New Password ต้องไม่ว่าง', 'error');
        return;
      }
    }

    const radconfirmoption = {
      title: 'เปลี่ยน Password',
      msg: $(changePwdDlg),
      width: '440px',
      onOk: function(evt) {
        let newPassword = doVerifyNewPassword();
        if ((newPassword) && (newPassword !== '')) {
          //$('body').loading('start');
          changePwdDlgBox.closeAlert();
          let userdata = JSON.parse(localStorage.getItem('userdata'));
          let userId = userdata.id;
          let reqParams = {userId: userId, password: newPassword};
          console.log(reqParams);
          $.post('/api/users/resetpassword', reqParams).then((response) => {
            console.log(response);
            //$('body').loading('stop');
            if (response) {
              $.notify('เปลี่ยน Password สำเร็จ', 'success');
            } else {
              $.notify('เปลี่ยน Password ไม่สำเร็จ', 'error');
            }
          });
        }
      },
      onCancel: function(evt){
        changePwdDlgBox.closeAlert();
      }
    }
    let changePwdDlgBox = $('body').radalert(radconfirmoption);
  }

  const doShowChangePwdDlg = function(){

  }

  return {
    doCreateChangePwdDlg
  }
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7}],15:[function(require,module,exports){
/* chatmanager.js */
module.exports = function ( jq ) {
	const $ = jq;
  const util = require('../../case/mod/utilmod.js')($);
	const apiconnector = require('../../case/mod/apiconnect.js')($);

  const contactIconUrl = '/images/user-account.png';
  const closeContactIconUrl = '/images/cancel-icon.png';

  /* List of Audiences */
  let contactLists = [];

  const doCreateContactContainer = function(caseId, openCase){
		contactLists = [];
    let contactContainer = $('<div id="ContactContainer" style=" position: relative; width: 100%; padding: 4px; margin-top: 10px; text-align: right;"></div>');
		let contactIconBar = $('<div id="ContactBar" style="position: relative; width: 100%"></div>');
		$(contactIconBar).appendTo($(contactContainer));
		let chatBoxContainer = $('<div id="ChatBoxContainer" style="position: relative; width: 100%;"></div>');
		$(chatBoxContainer).css('display', 'none');
		$(chatBoxContainer).appendTo($(contactContainer));

		$(contactContainer).on('newconversation', async (evt, data) =>{
			console.log(data);
			if (data.topicId == caseId){
				let isHide = $(chatBoxContainer).css('display');
				if (isHide === 'none') {
					$(chatBoxContainer).css('display', 'block');
				}
				let contact = await doCreateNewAudience(data.audienceId, data.audienceName, data.topicId, data.topicName);
				if (contact) {
					$(contact).appendTo($(contactIconBar));
					let simpleChat = doCreateSimpleChatBox(data.topicId, data.topicName, data.topicType, data.audienceId, data.audienceName, data.topicStatusId);
					$(simpleChat.chatBox).css('display', 'none');
					$(simpleChat.chatBox).appendTo($(chatBoxContainer));
					await simpleChat.handle.restoreLocal();
					let chatBoxTarget = contactLists.find((item)=>{
						if (item.Id == data.audienceId) { return item}
					});
					if (chatBoxTarget){
						chatBoxTarget.chatBox = simpleChat.chatBox;
						chatBoxTarget.handle = simpleChat.handle;
						chatBoxTarget.contact = contact;
					}
					contactLists.forEach((item, i) => {
						$(item.chatBox).slideToggle();
					});
				} else {
					let eventData = {msg: data.message.msg, from: data.message.from, context: data.message.context};
					setTimeout(()=>{
						let selector = '#'+data.audienceId + ' .chatbox';
						let targetChatBox = $(selector);
		      	$(targetChatBox).trigger('messagedrive', [eventData]);
					}, 300);
				}
			}
		});

		/* ในกรณี เคสเคยมีการ chat มาก่อน (casestatusId==14) ต้องเปิด simppleChat มารอไว้เลย */
		/* ของ reffer ปรับให้คุยได้เฉพาะ topic นั้นเท่านั้น */

		if (openCase.case.casestatusId == 14){
			doSeachChatHistory(caseId).then(async (history) => {
				if (history) {
					localStorage.setItem('localmessage', JSON.stringify(history));
					const userdata = JSON.parse(localStorage.getItem('userdata'));
					let lastHis = history.find((item)=>{
						if (item.from !== userdata.username) return item;
					});
					if (lastHis) {
						let audienceId = lastHis.from;
						let audienceInfo = await apiconnector.doGetApi('/api/users/searchusername/' + audienceId, {});
						audienceInfo = await apiconnector.doGetApi('/api/users/select/' + audienceInfo.id, {});
						let audienceName = audienceInfo.user[0].userinfo.User_NameTH + ' ' + audienceInfo.user[0].userinfo.User_LastNameTH;
						let topicName = openCase.case.patient.Patient_HN + ' ' + openCase.case.patient.Patient_NameEN + ' ' + openCase.case.patient.Patient_LastNameEN + ' ' + openCase.case.patient.Patient_Sex + '/' + openCase.case.patient.Patient_Age + ' ' + openCase.case.Case_BodyPart;
						let topicType = 'case';
						let contact = await doCreateNewAudience(audienceId, audienceName, caseId, topicName);
						if (contact) {
							$(contact).appendTo($(contactIconBar));
							let simpleChat = doCreateSimpleChatBox(caseId, topicName, topicType, audienceId, audienceName, openCase.case.casestatusId);
							$(chatBoxContainer).css('display', 'block');
							$(simpleChat.chatBox).css('display', 'block');
							$(simpleChat.chatBox).appendTo($(chatBoxContainer));
							await simpleChat.handle.restoreLocal();
							simpleChat.handle.scrollDown();
							let chatBoxTarget = contactLists.find((item)=>{
								if (item.Id == audienceId) { return item}
							});
							if (chatBoxTarget){
								chatBoxTarget.chatBox = simpleChat.chatBox;
								chatBoxTarget.handle = simpleChat.handle;
								chatBoxTarget.contact = contact;
							}
						}
					} else {
						console.log('Not found any message of audienceId ', lastHis);
						console.log('this is your history', history);
					}
				} else {
					console.log(history);
				}
			});
		}

    return $(contactContainer);
  }

  const doCreateNewAudience = function(Id, Name, topicId, topicName){
    /* Id=username, Name=displayName */
    return new Promise(async function(resolve, reject) {
      let chatBoxTarget = await contactLists.find((item)=>{
        if ((item.Id == Id) && (item.topicId == topicId)) { return item}
      });
      if (!chatBoxTarget){
        let newAudience = {Id: Id, Name: Name, topicId: topicId, topicName: topicName};
        contactLists.push(newAudience);
        let contactIcon = doCreateContactIcon(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback);
        resolve($(contactIcon));
      } else {
				//let contactIcon = chatBoxTarget.contact[0];
				//let contactIcon = doCreateContactIcon(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback);
        //resolve($(contactIcon));
				resolve();
      }
    });
  }

  const doCreateContactIcon = function(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback) {
    let contactBox = $('<div class="contact" style="position: relative; display: inline-block; text-align: center; margin-right: 2px;"></div>');
    let contactIcon = $('<img style="postion: relative; width: 40px; height: auto; cursor: pointer;"/>');
    $(contactIcon).attr('src', contactIconUrl);
    let closeContactIcon = $('<img style="position: absolute; width: 20px; height: 20px; cursor: pointer; margin-left: 20px; margin-top: -70px;"/>');
    $(closeContactIcon).attr('src', closeContactIconUrl);
		//$(closeContactIcon).css('display', 'none');
		//$(contactIcon).hover((evt) =>{$(closeContactIcon).toggle()});
    let contactName = $('<div style="position: relative; font-size: 16px; color: auto;"></div>');
		$(contactName).text(Name);
		let reddot = doCreateReddot(Id, 0);
    $(contactBox).on('click', async (evt)=>{
      await onContactIconClickCallback(Id);
    });
    $(closeContactIcon).on('click', async (evt)=>{
      await onCloseContactClickCallback(Id, topicId, contactBox);
    });
		$(contactBox).attr('id', Id);
    return $(contactBox).append($(contactIcon)).append($(contactName)).append($(closeContactIcon)).append($(reddot));
  }

	const doCreateReddot = function(Id, value) {
		let reddot = $('<span class="reddot" style="position: absolute; width: 30px; height: 30px; border-radius:50%; background-color: red; color: white; margin-top: -50px;"></span>');
		$(reddot).attr('id', Id);
		$(reddot).text(value);
		return $(reddot);
	}

	const doSetReddotValue = function(Id, value){
		let selector = '#'+Id + ' .reddot';
		let lastValue = $(selector).text();
		let newValue = Number(lastValue) + value;
		if (newValue > 0) {
			$(selector).text(newValue);
			$(selector).show()
		} else {
			$(selector).hide()
		}
	}

  const onContactIconClickCallback = function(Id){
		//{Id: Id, Name: Name, chatBox, handle}
		if (contactLists.length == 1){
			$(contactLists[0].chatBox).slideToggle();
		} else {
			contactLists.forEach((item, i) => {
				$(item.chatBox).css('display', 'none');
			});

			contactLists.forEach((item, i) => {
				if (item.Id === Id) {
					$(item.chatBox).slideToggle();
				}
			});
		}
  }

  const onCloseContactClickCallback = function(Id, topicId, contactBox) {
    return new Promise(async function(resolve, reject) {
      let indexAt = undefined;
      let chatBoxTarget = await contactLists.find((item, index)=>{
        if (item.Id == Id) {
          indexAt = index;
          return item
        }
      });
      if (chatBoxTarget){
				let selector = '#'+Id + ' .chatbox';
				let targetChatBox = $(selector);
				$(targetChatBox).remove();
				$(contactBox).remove();
        contactLists.splice(indexAt, 1);
				const main = require('../main.js');
				const myWsm = main.doGetWsm();
		    myWsm.send(JSON.stringify({type: 'closetopic', topicId: topicId}));
      }
    });
  }

	const doCreateSimpleChatBox = function(topicId, topicName, topicType, audienceId, audienceName, topicStatusId) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let simpleChatBoxOption = {
			myId: userdata.username,
			myName: userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH,
			myDisplayName: 'ฉัน',
			topicId: topicId,
			topicName: topicName,
			topicStatusId: topicStatusId,
			topicType: topicType,
			audienceId: audienceId,
			audienceName: audienceName,
			wantBackup: true,
			externalClassStyle: {},
			sendMessageCallback: doSendMessageCallback,
			resetUnReadMessageCallback: doResetUnReadMessageCallback
		};
		let simpleChat = doInitChatBox(simpleChatBoxOption);
		return simpleChat;
	}

	const doInitChatBox = function(options){
	  let simpleChatBoxOption = {
	    topicId: options.topicId,
	    topicName: options.topicName,
			topicStatusId: options.topicStatusId,
			topicType: options.topicType,
	    myId: options.myId,
	    myName: options.myName,
	    myDisplayName: options.myDisplayName,
	    audienceId: options.audienceId,
	    audienceName: options.audienceName,
	    wantBackup: options.wantBackup,
	    externalClassStyle: options.externalClassStyle,
	    sendMessageCallback: options.sendMessageCallback,
			resetUnReadMessageCallback: options.resetUnReadMessageCallback
	  };
	  let simpleChatBox = $('<div></div>');
	  $(simpleChatBox).attr('id', options.audienceId);
	  let simpleChatBoxHandle = $(simpleChatBox).chatbox(simpleChatBoxOption);
	  return {chatBox: $(simpleChatBox), handle: simpleChatBoxHandle};
	}

	const doSendMessageCallback = function(msg, sendto, from, context){
	  return new Promise(async function(resolve, reject){
			const main = require('../main.js');
			const myWsm = main.doGetWsm();
	    let msgSend = {type: 'message', msg: msg, sendto: sendto, from: from, context: context};
	    myWsm.send(JSON.stringify(msgSend));
	    resolve();
	  });
	}

	const doResetUnReadMessageCallback = function(audienceId, value){
		doSetReddotValue(audienceId, value);
	}

	const doSeachChatHistory = function(topicId){
		return new Promise(async function(resolve, reject){
			let cloudHistory = undefined;
			let localHistory = undefined;
			let localMsgStorage = localStorage.getItem('localmessage');
			if ((localMsgStorage) && (localMsgStorage !== '')) {
		    let localLog = JSON.parse(localMsgStorage);
				if (localLog) {
					localHistory = await localLog.filter((item)=>{
						if (item.topicId == topicId) {
							return item;
						}
					});
				}
			}
			let cloudLog = await apiconnector.doGetApi('/api/chatlog/select/case/' + topicId, {});
			if (cloudLog) {
				cloudHistory = await cloudLog.Log.filter((item)=>{
					if (item.topicId == topicId) {
						return item;
					}
				});
			}
			//console.log(localHistory);
			//console.log(cloudHistory);
			if ((localHistory) && (localHistory.length > 0)) {
				if ((cloudHistory) && (cloudHistory.length > 0)) {
					if (localHistory.length > 0) {
						if (cloudHistory.length > 0) {
							let localLastMsg = localHistory[localHistory.length-1];
							let localLastUpd = new Date(localLastMsg.datetime);
							let cloudLastMsg = cloudHistory[cloudHistory.length-1];
							let cloudLastUpd = new Date(cloudLastMsg.datetime);
							if (cloudLastUpd.getTime() > localLastUpd.getTime()){
								resolve(cloudHistory);
							} else {
								resolve(localHistory);
							}
						} else {
							resolve(localHistory);
						}
					} else {
						if (cloudHistory.length > 0) {
							resolve(cloudHistory);
						} else {
							resolve([]);
						}
					}
				} else {
					resolve(localHistory);
				}
			} else {
				if (cloudHistory) {
					resolve(cloudHistory);
				} else {
					resolve([]);
				}
			}
		});
	}

  return {
    //contactLists,
    doCreateContactContainer,
    doCreateNewAudience,

		doCreateSimpleChatBox,
		doSendMessageCallback,
		doResetUnReadMessageCallback
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/utilmod.js":7,"../main.js":11}],16:[function(require,module,exports){
/* newcaselib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const chatman = require('./chatmanager.js')($);

  const doCreateNewCaseTitlePage = function() {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
    const newcaseTitle = 'แจ้งงานใหม่';
    let newcaseTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/new-case-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(newcaseTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + newcaseTitle + '</h3></div>');
    $(titleText).appendTo($(newcaseTitleBox));

		let readySwitchBox = $('<div id="ReadyState" style="position: relative; display: inline-block; float: right; top: 15px;"></div>');
		let readyOption = {switchTextOnState: 'เปิดรับเคส', switchTextOffState: 'ปิดรับเคส',
			onActionCallback: ()=>{
				doUpdateReadyState(1);
				readySwitch.onAction();
			},
			offActionCallback: ()=>{
				doUpdateReadyState(0);
				readySwitch.offAction();
			}
		};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		$(readySwitchBox).appendTo($(newcaseTitleBox));
		if (userdata.userprofiles.length > 0) {
			if (userdata.userprofiles[0].Profile.readyState == 1) {
				readySwitch.onAction();
			} else {
				readySwitch.offAction();
			}
		} else {
			readySwitch.offAction();
		}

    return $(newcaseTitleBox);
  }

	const doUpdateReadyState = async function(state) {
		//$('body').loading('start');
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		userdata.userprofiles[0].Profile.readyState = state;
		userdata.userprofiles[0].Profile.readyBy = 'user';
		localStorage.setItem('userdata', JSON.stringify(userdata));
		let rqParams = {data: userdata.userprofiles[0].Profile, userId: userdata.id};
		console.log(rqParams);
		let profileRes = await apiconnector.doCallApiDirect('/api/userprofile/update', rqParams);
		//let profileRes = await common.doCallApi('/api/userprofile/update', rqParams);
		let onoffText = undefined;
		if (state==1) {
			onoffText = 'เปิด';
		} else {
			onoffText = 'ปิด';
		}
		if (profileRes.status.code == 200){
			$.notify(onoffText + "รับงาน - Sucess", "success");
			//$('body').loading('stop');
		} else {
			$.notify('ไม่สามารถ' + onoffText + 'รับงาน - Error โปรดติดต่อผู้ดูแลระบบ', 'error');
			//$('body').loading('stop');
		}
	}

  const doCreateHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Receive</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Left</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Scan Part</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Urgent</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Sex/Age</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

	const doCreateConsultHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Receive</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Left</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Urgent</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  function doCreateCaseItemCommand(caseItem) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let radioFullName = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
    let caseCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
    let acceptCmd = $('<div>Accept</div>');
    $(acceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'green', 'color': 'white'});
    $(acceptCmd).on('click', async (evt)=>{
      let response = await common.doUpdateCaseStatus(caseItem.id, 2, 'รังสีแพทย์ ' + radioFullName + ' ตอบรับเคสทางเว็บ');
			if (response.status.code == 200) {
				/*
				let newDicomZipSync = {caseId: caseItem.id, studyID: caseItem.Case_OrthancStudyID};
				let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
				if (dicomzipsync.length > 0){
					dicomzipsync.push(newDicomZipSync);
				} else {
					dicomzipsync = [];
					dicomzipsync.push(newDicomZipSync);
				}
				localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
				*/
				//util.dicomZipSyncWorker.postMessage({studyID: newDicomZipSync.studyID, type: 'application/x-compressed'});
				$.notify('ตอบรับเคสสำเร็จ', 'success');
				$('#NewCaseCmd').click();
			} else {
				$.notify('ตอบรับเคสไม่สำเร็จ้ในขณะนี้', 'error');
			}
    });
    $(caseCmdBox).append($(acceptCmd));

    let notAacceptCmd = $('<div>Reject</div>');
    $(notAacceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'red', 'color': 'white'});
    $(notAacceptCmd).on('click', async (evt)=>{
      let response = await common.doUpdateCaseStatus(caseItem.id, 3, 'รังสีแพทย์ ' + radioFullName + ' ปฏิเสธเคสทางเว็บ');
			if (response.status.code == 200) {
				$.notify('ปฏิเสธเคสสำเร็จ', 'success');
				$('#NewCaseCmd').click();
			} else {
				$.notify('ปฏิเสธเคสไม่สำเร็จในขณะนี้', 'error');
			}
    });
    $(caseCmdBox).append($(notAacceptCmd))

    return $(caseCmdBox);
  }

  const doCreateCaseItemRow = function(incident, caseTask) {
    return new Promise(async function(resolve, reject) {
			let caseItem = incident.case;
			if ((caseTask) && (caseTask.triggerAt)){
				let caseDate = util.formatDateTimeStr(caseItem.createdAt);
				let casedatetime = caseDate.split(' ');
				let casedateSegment = casedatetime[0].split('-');
				casedateSegment = casedateSegment.join('');
				let casedate = util.formatStudyDate(casedateSegment);
				let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));

				let patientName = caseItem.patient.Patient_NameEN + ' ' + caseItem.patient.Patient_LastNameEN;
				let patientSA = caseItem.patient.Patient_Sex + '/' + caseItem.patient.Patient_Age;
				let patientHN = caseItem.patient.Patient_HN;
				let caseScanparts = caseItem.Case_ScanPart;
				let yourSelectScanpartContent = $('<div></div>');
				if ((caseScanparts) && (caseScanparts.length > 0)) {
					yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
				}
				//let caseUG = caseItem.urgenttype.UGType_Name;
				let caseUG = caseItem.sumase.UGType_Name;
	      let caseHosName = caseItem.hospital.Hos_Name;

				let caseCMD = doCreateCaseItemCommand(caseItem);

	      let caseRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

	  		let caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append('<span>' + casedate + ' : ' + casetime + '</span>');
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	      //if ((caseTask) && (caseTask.triggerAt)){
					let now = new Date();
	        let caseTriggerAt = new Date(caseTask.triggerAt);
	        //let diffTime = Math.abs(caseTriggerAt - new Date());
					let diffTime = caseTriggerAt.getTime() - now.getTime();
	        let hh = parseInt(diffTime/(1000*60*60));
	        let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
	        let clockCountdownDiv = $('<div></div>').css({'width': '100%', 'text-align': 'center'});;
	        $(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
	        $(caseColumn).append($(clockCountdownDiv));
	      //} else {
	        //$(caseColumn).append($('<span>not found Task</span>'));
	  		//}
				let totalMinus = (hh*60) + mn;
				if (totalMinus < 30){
					$(clockCountdownDiv).css({'background-color': '#8532EF', 'color': 'white'});
				} else if (totalMinus < 60){
					$(clockCountdownDiv).css({'background-color': '#EF3232', 'color': 'white'});
				} else if (totalMinus < 240){
					$(clockCountdownDiv).css({'background-color': '#FF5733', 'color': 'white'});
				} else if (totalMinus < 1440){
					$(clockCountdownDiv).css({'background-color': '#F79C06', 'color': 'white'});
				} else {
					$(clockCountdownDiv).css({'background-color': '#177102 ', 'color': 'white'});
				}

	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($(yourSelectScanpartContent));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + caseUG + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientHN + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientName + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientSA + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + caseHosName + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($(caseCMD));
	  		$(caseColumn).appendTo($(caseRow));

	      resolve($(caseRow));
			} else {
				let eventName = 'triggercounter'
				let triggerData = {caseId : caseItem.id, statusId: 7, thing: 'case'};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
				resolve();
			}
    });
  }

	const doCreateConsultItemRow = function(consultItem){
		return new Promise(async function(resolve, reject) {
			//let consultTask = await common.doCallApi('/api/consult/tasks/select/'+ consultItem.id, {});
			let consultTask = await apiconnector.doCallApiDirect('/api/consult/tasks/select/'+ consultItem.id, {});
			let consultDate = util.formatDateTimeStr(consultItem.createdAt);
			let consultdatetime = consultDate.split(' ');
			let consultdateSegment = consultdatetime[0].split('-');
			consultdateSegment = consultdateSegment.join('');
			let consultdate = util.formatStudyDate(consultdateSegment);
			let consulttime = util.formatStudyTime(consultdatetime[1].split(':').join(''));

			let patientName = consultItem.PatientName;
			let patientHN = consultItem.PatientHN;
			let consultUG = consultItem.UGType;
      let consultHosName = consultItem.hospital.Hos_Name;

			let consultCMD = await doCreateConsultItemCommand(consultItem);

      let consultRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

			let consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append('<span>' + consultdate + ' : ' + consulttime + '</span>');
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			if (consultItem.casestatusId == 1){
	      if ((consultTask.Tasks) && (consultTask.Tasks.length > 0) && (consultTask.Tasks[0]) && (consultTask.Tasks[0].triggerAt)){
	        let consultTriggerAt = new Date(consultTask.Tasks[0].triggerAt);
	        let diffTime = Math.abs(consultTriggerAt - new Date());
	        let hh = parseInt(diffTime/(1000*60*60));
	        let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
	        let clockCountdownDiv = $('<div></div>');
	        $(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
	        $(consultColumn).append($(clockCountdownDiv));
	      } else {
	        $(consultColumn).append($('<span>not found Task</span>'));
	  		}
			} else {
				$(consultColumn).append($('<span>-</span>'));
			}
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			let ugValue = $('<span>' + consultUG + '</span>');
  		$(consultColumn).append($(ugValue));
  		$(consultColumn).appendTo($(consultRow));
			$(ugValue).load('/api/urgenttypes/urgname/select/' + consultUG);

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + patientHN + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + patientName + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + consultHosName + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($(consultCMD));
  		$(consultColumn).appendTo($(consultRow));

      resolve($(consultRow));
		});
	}

	const doCreateConsultItemCommand = function(consultItem){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let consultId = consultItem.id;
			let fakPaient = {
				Patient_HN: consultItem.patientHN,
				Patient_NameEN: consultItem.patientName,
				Patient_LastNameEN: '',
				Patient_Sex: '',
				Patient_Age: ''
			}
			let caseData = {
				casestatusId: consultItem.casestatusId,
				Case_BodyPart: '',
				patient: fakPaient
			}
			let fakeCase = {
				case: caseData
			}
	    let consultCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
			if (consultItem.casestatusId == 1){
		    let acceptCmd = $('<div>Accept</div>');
		    $(acceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'green', 'color': 'white'});
		    $(acceptCmd).on('click', async (evt)=>{
		      let response = await common.doUpdateConsultStatus(consultItem.id, 2);
					if (response.status.code == 200) {
						let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);
					} else {
						alert('เกิดข้อผิดพลาด ไม่สามารถตอบรับ Consult ได้ในขณะนี้');
					}
		    });
		    $(consultCmdBox).append($(acceptCmd));

		    let notAacceptCmd = $('<div>Reject</div>');
		    $(notAacceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'red', 'color': 'white'});
		    $(notAacceptCmd).on('click', async (evt)=>{
		      let response = await common.doUpdateConsultStatus(consultItem.id, 3);
					if (response.status.code == 200) {
						$('#NewCaseCmd').click();
					} else {
						alert('เกิดข้อผิดพลาด ไม่สามารถตอบปฏิเสธ Consult ได้ในขณะนี้');
					}
		    });
		    $(consultCmdBox).append($(notAacceptCmd))
			} else if (consultItem.casestatusId == 2){
				let openCmd = $('<div>Open</div>');
				$(openCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'orange', 'color': 'white'});
				$(consultCmdBox).append($(openCmd));
				$(openCmd).on('click', async (evt)=>{
					let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);
				});
				let closeCmd = $('<div>Close</div>');
				$(closeCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'grey', 'color': 'white'});
				$(consultCmdBox).append($(closeCmd));
				$(closeCmd).on('click', async (evt)=>{
					let response = await common.doUpdateConsultStatus(consultItem.id, 6);
					if (response.status.code == 200) {
						$.notify('จบการปรึกษา - Success', 'success');
						$('#NewCaseCmd').click();
					} else {
						$.notify('ไม่สามารถจบการปรึกษา - Error โปรดติดต่อผู้ดูแลระบบ', 'error');
					}
				});
			}
	    resolve($(consultCmdBox));
		});
	}

  const doCallMyNewCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let rqParams = {userId: userId, statusId: common.caseReadWaitStatus};
			let apiUrl = '/api/cases/filter/radio';
			try {
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				//let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doCallMyTasksCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let username = userdata.username;
			let rqParams = {userId: userId, username: username, statusId: common.caseReadWaitStatus};
			let apiUrl = '/api/tasks/filter/radio/' + userId;
			try {
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				//let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doFindTaksOfCase = function(tasks, caseId){
		return new Promise(async function(resolve, reject) {
			let task = await tasks.find((item)=>{
				if (Number(item.caseId) === Number(caseId)) return item;
			});
			resolve(task);
		});
	}

	const doCallMyNewConsult = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let rqParams = {userId: userId, statusId: [1 ,2]};
			let apiUrl = '/api/consult/filter/radio';
			try {
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				//let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  const doCreateNewCasePage = function() {
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
      let myNewCase = await doCallMyNewCase();
			let myTasks = await doCallMyTasksCase();
			//console.log(myTasks);
			if (myNewCase.status.code == 200){
				let myNewConsult = await doCallMyNewConsult();
				let myCaseViewBox = $('<div style="position: relative; width: 100%;"></div>');
				let myCaseTitleBar = $('<div style="position: relative; width: 100%;"><h3>เคสใหม่</h3></div>');
				$(myCaseViewBox).append($(myCaseTitleBar))
	      let caseLists = myNewCase.Records;
				console.log(caseLists);
	      if (caseLists.length > 0) {
					let myNewCaseView = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: -25px;"></div>');
					$(myNewCaseView).appendTo($(myCaseViewBox));
		      let caseHeader = doCreateHeaderRow();
		      $(myNewCaseView).append($(caseHeader));
	        for (let i=0; i < caseLists.length; i++) {
	          let caseItem = caseLists[i];
						let task = await doFindTaksOfCase(myTasks.Records, caseItem.case.id);
	          let caseRow = await doCreateCaseItemRow(caseItem, task);
						if (caseRow){
	          	$(myNewCaseView).append($(caseRow));
						}
	        }
	      } else {
	        let notFoundCaseMessage = $('<p style="margin-top: -20px;">ไม่พบรายการเคสใหม่ของคุณในขณะนี้</p>')
	        $(myCaseViewBox).append($(notFoundCaseMessage));
	      }

				let myConsultTitleBar = $('<div style="position: relative; width: 100%;"><h3>Consult ใหม่</h3></div>');
				$(myCaseViewBox).append($(myConsultTitleBar))
	      let consultLists = myNewConsult.Records;
	      if (consultLists.length > 0) {
					let myNewConsultView = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: -25px;"></div>');
					$(myNewConsultView).appendTo($(myCaseViewBox));
		      let consultHeader = doCreateConsultHeaderRow();
		      $(myNewConsultView).append($(consultHeader));
	        for (let i=0; i < consultLists.length; i++) {
	          let consultItem = consultLists[i];
	          let consultRow = await doCreateConsultItemRow(consultItem);
	          $(myNewConsultView ).append($(consultRow));
	        }
	      } else {
	        let notFoundConsultMessage = $('<p style="margin-top: -20px;">ไม่พบรายการ Consult ใหม่ของคุณในขณะนี้</p>')
	        $(myCaseViewBox).append($(notFoundConsultMessage));
	      }

				let searchConsultCmd = doCreateSearchConsultCmd();
				$(myCaseViewBox).append($(searchConsultCmd));

				let allNewIntend = caseLists.length + consultLists.length;
				if (allNewIntend > 0) {
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(allNewIntend);
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
				} else {
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
				}

	      //$('body').loading('stop');
	      resolve($(myCaseViewBox));
			} else if (myNewCase.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyNewCase';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doOpenChatbox = function(caseId, fakeOpen, consultItem){
		return new Promise(async function(resolve, reject) {
			let patientHRLine = $('<div style="width: 99%; min-height: 80px;"></div>');
			let patientTitleBar = $('<div style="position: relative; width: 100%;"><b>HN: </b>' + consultItem.PatientHN + ' <b>Name: </b> ' + consultItem.PatientName + ' <b>โรงพยาลาล: </b>' + consultItem.hospital.Hos_Name + '</div>');
			$(patientHRLine).append($(patientTitleBar));
			let patientHRList = consultItem.PatientHRLink;
			patientHRList.forEach((hrlink, i) => {
				let hrIcon = $('<img style="width: 100px; height: auto; cursor: pointer;"/>');
				$(hrIcon).attr('src', hrlink.link);
				$(hrIcon).on('click', (evt)=>{
					window.open(hrlink.link, '_blank');
				});
				$(patientHRLine).append($(hrIcon));
			});

			let contactContainer = $('<div id="ContactContainer" style=" position: relative; width: 100%; padding: 4px; margin-top: 10px; text-align: right;"></div>');
			$(contactContainer).on('newconversation', async (evt, data) =>{
				let eventData = {msg: data.message.msg, from: data.message.from, context: data.message.context};
				setTimeout(()=>{
					let selector = '#'+data.audienceId + ' .chatbox';
					let targetChatBox = $(selector);
					$(targetChatBox).trigger('messagedrive', [eventData]);
				}, 300);
			});

			let contactIconBar = $('<div id="ContactBar" style="position: relative; width: 100%"></div>');
			$(contactIconBar).appendTo($(contactContainer));
			let chatBoxContainer = $('<div id="ChatBoxContainer" style="position: relative; width: 100%;"></div>');
			$(chatBoxContainer).css('display', 'block');
			$(chatBoxContainer).appendTo($(contactContainer));


			let audienceUserId = consultItem.userId;
			let audienceInfo = await apiconnector.doGetApi('/api/users/select/' + audienceUserId, {});
			let audienceId = audienceInfo.user[0].username;
			let audienceName = audienceInfo.user[0].userinfo.User_NameTH + ' ' + audienceInfo.user[0].userinfo.User_LastNameTH;
			let topicId = consultItem.id;
			let topicName = consultItem.PatientHN + ' ' + consultItem.PatientName;
			let topicType = 'consult';
			let contact = await chatman.doCreateNewAudience(audienceId, audienceName, topicId, topicName);
			if (contact) {
				$(contact).appendTo($(contactIconBar));
				let simpleChat = chatman.doCreateSimpleChatBox(topicId, topicName, topicType, audienceId, audienceName, consultItem.casestatusId);
				$(chatBoxContainer).css('display', 'block');
				$(simpleChat.chatBox).css('display', 'block');
				$(simpleChat.chatBox).appendTo($(chatBoxContainer));
				simpleChat.handle.restoreLocal();
				simpleChat.handle.scrollDown();
				$(".mainfull").empty().append($(patientHRLine)).append($(contactContainer));
				resolve(simpleChat);
			} else {
				resolve();
			}
		});
	}

	/*******************/
	/* Consult Search */
	/*******************/

	const doCreateSearchConsultCmd = function(){
		let searchIcon = $('<img src="/images/chat-history-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 5px;"/>');
		let searchCmdLabel = $('<span style="position: relative; display: inline-block; margin-left: 5px; top: -10px;">รายการ Consult เก่า</span>');
		let searchCmd = $('<div style="position: relative; display: inline-block; cursor: pointer; background-color: #062EAA; color: white; border: 2px solid #6D7CA9; padding: 2px;"></div>');
		$(searchCmd).append($(searchIcon)).append($(searchCmdLabel));
		$($(searchCmd)).on('click', (evt)=>{
			doLoadSearchConsult();
		});
		return $(searchCmd);
	}

	const doLoadSearchConsult = function(){
		//$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let toDayFormat = util.getTodayDevFormat();

		let defaultSearchKey = {fromDateKeyValue: toDayFormat, patientNameENKeyValue: '*', patientHNKeyValue: '*', caseStatusKeyValue: 6};
		let defaultSearchParam = {key: defaultSearchKey, hospitalId: userdata.hospitalId, userId: userdata.id, usertypeId: userdata.usertypeId};
		//common.doCallApi('/api/consult/search/key', defaultSearchParam).then(async(response)=>{
		apiconnector.doCallApiDirect('/api/consult/search/key', defaultSearchParam).then(async(response)=>{
			//$('body').loading('stop');
			if (response.status.code === 200) {
				let searchResultViewDiv = $('<div id="SearchResultView"></div>');
				$(".mainfull").append($(searchResultViewDiv));
				await doShowSearchConsultCallback(response);
			} else {
				$(".mainfull").append('<h3>ระบบค้นหา Consult เก่า ขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
			}
		});
	}

	const doShowSearchConsultCallback = function(response){
		return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
		  let userItemPerPage = userDefualtSetting.itemperpage;

			let showCases = [];

			let allCaseRecords = response.Records;
			if (userItemPerPage == 0) {
				showCases = allCaseRecords;
			} else {
				showCases = await common.doExtractList(allCaseRecords, 1, userItemPerPage);
			}
			let consultView = await doShowConsultView(showCases, response.key, doShowSearchConsultCallback);
			$(".mainfull").find('#SearchResultView').empty().append($(consultView));

			if (allCaseRecords.length == 0) {
				$(".mainfull").find('#SearchResultView').append($('<h4>ไม่พบรายการ Consult เก่า ตามเงื่อนไขที่คุณค้นหา</h4>'));
			} else {
				let navigBarBox = $('<div id="NavigBar"></div>');
				$(".mainfull").append($(navigBarBox));
				let navigBarOption = {
					currentPage: 1,
					itemperPage: userItemPerPage,
					totalItem: allCaseRecords.length,
					styleClass : {'padding': '4px', "font-family": "THSarabunNew", "font-size": "20px"},
					changeToPageCallback: async function(page){
						//$('body').loading('start');
						let toItemShow = 0;
						if (page.toItem == 0) {
							toItemShow = allCaseRecords.length;
						} else {
							toItemShow = page.toItem;
						}
						showCases = await common.doExtractList(allCaseRecords, page.fromItem, toItemShow);
						consultView = await doShowConsultView(showCases, response.key, doShowSearchConsultCallback);
						$(".mainfull").find('#SearchResultView').empty().append($(consultView));
						//$('body').loading('stop');
					}
				};
				let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
				navigatoePage.toPage(1);
			}
			//$('body').loading('stop');
			resolve();
		});
	}

	const doShowConsultView = function(consults, key, callback) {
		return new Promise(function(resolve, reject) {
			let rowStyleClass = {"font-family": "THSarabunNew", "font-size": "22px"};
			let consultView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');

			let headView = doCreateSearchConsultHeaderRow();
			$(headView).appendTo($(consultView));
			let formView = doCreateSearchConsultFormRow(key, callback);
			$(formView).appendTo($(consultView));

			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < consults.length; i++) {
					let itemView = await doCreateSearchConsultItemRow(consults[i]);
					$(itemView).appendTo($(consultView));
				}
				setTimeout(()=>{
					resolve2($(consultView));
				}, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateSearchConsultFormRow = function(key, searchResultCallback){
		let searchFormRow = $('<div style="display: table-row; width: 100%;"></div>');
		let formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');

		let fromDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ตั้งแต่</span>
		$(fromDateKeyBox).appendTo($(formField));
		let fromDateKey = $('<input type="text" id="FromDateKey" size="6" style="margin-left: 5px;"/>');
		if (key.fromDateKeyValue) {
			let arrTmps = key.fromDateKeyValue.split('-');
			let fromDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
			$(fromDateKey).val(fromDateTextValue);
		}
		$(fromDateKey).css({'font-size': '20px'});
		$(fromDateKey).appendTo($(fromDateKeyBox));
		$(fromDateKey).datepicker({ dateFormat: 'dd-mm-yy' });

		$(formField).append($('<span style="margin-left: 5px; margin-right: 2px; display: inline-block;">-</span>'));

		let toDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ถึง</span>
		$(toDateKeyBox).appendTo($(formField));
		let toDateKey = $('<input type="text" id="ToDateKey" size="6" style="margin-left: 5px;"/>');
		if (key.toDateKeyValue) {
			let arrTmps = key.toDateKeyValue.split('-');
			let toDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
			$(toDateKey).val(toDateTextValue);
		}
		$(toDateKey).appendTo($(toDateKeyBox));
		$(toDateKey).datepicker({ dateFormat: 'dd-mm-yy' });
		$(formField).append($(toDateKeyBox));

		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let patientNameENKey = $('<input type="text" id="PatientNameENKey" size="15"/>');
		$(patientNameENKey).val(key.patientNameENKeyValue);
		$(formField).append($(patientNameENKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let patientHNKey = $('<input type="text" id="PatientHNKey" size="10"/>');
		$(patientHNKey).val(key.patientHNKeyValue);
		$(formField).append($(patientHNKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left;vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left;vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');
		let startSearchCmd = $('<img src="/images/search-icon-3.png" width="30px" height="auto"/>');
		$(formField).append($(startSearchCmd));
		$(formField).appendTo($(searchFormRow));

		$(searchFormRow).find('input[type=text],select').css({'font-size': '20px'});

		$(startSearchCmd).css({'cursor': 'pointer'});
		$(startSearchCmd).on('click', async (evt) => {
			let fromDateKeyValue = $('#FromDateKey').val();
			let toDateKeyValue = $(toDateKey).val();
			let patientNameENKeyValue = $(patientNameENKey).val();
			let patientHNKeyValue = $(patientHNKey).val();
			//let bodypartKeyValue = $(bodypartKey).val();
			let caseStatusKeyValue = 6;
			let searchKey = undefined;
			if ((fromDateKeyValue) && (toDateKeyValue)) {
				let arrTmps = fromDateKeyValue.split('-');
				fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
				let fromDateKeyTime = new Date(fromDateKeyValue);
				arrTmps = toDateKeyValue.split('-');
				toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
				let toDateKeyTime = new Date(toDateKeyValue);
				if (toDateKeyTime >= fromDateKeyTime) {
					let fromDateFormat = util.formatDateStr(fromDateKeyTime);
					let toDateFormat = util.formatDateStr(toDateKeyTime);
					searchKey = {fromDateKeyValue: fromDateFormat, toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue,caseStatusKeyValue};
				} else {
					alert('ถึงวันที่ ต้องมากกว่า ตั้งแต่วันที่ หรือ เลือกวันที่เพียงช่องใดช่องหนึ่ง ส่วนอีกช่องให้เว้นว่างไว้\nโปรดเปลี่ยนค่าวันที่แล้วลองใหม่');
				}
			} else {
				if (fromDateKeyValue) {
					let arrTmps = fromDateKeyValue.split('-');
					fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let fromDateKeyTime = new Date(fromDateKeyValue);
					let fromDateFormat = util.formatDateStr(fromDateKeyTime);
					searchKey = {fromDateKeyValue: fromDateFormat, patientNameENKeyValue, patientHNKeyValue, caseStatusKeyValue};
				} else if (toDateKeyValue) {
					let arrTmps = toDateKeyValue.split('-');
					toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let toDateKeyTime = new Date(toDateKeyValue);
					let toDateFormat = util.formatDateStr(toDateKeyTime);
					searchKey = {toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue,caseStatusKeyValue};
				} else {
					searchKey = {patientNameENKeyValue, patientHNKeyValue, caseStatusKeyValue};
				}
			}
			if (searchKey) {
				//$('body').loading('start');
				let userdata = JSON.parse(localStorage.getItem('userdata'));
				let hospitalId = userdata.hospitalId;
				let userId = userdata.id;
				let usertypeId = userdata.usertypeId;

				let searchParam = {key: searchKey, hospitalId: hospitalId, userId: userId, usertypeId: usertypeId};

				let response = await apiconnector.doCallApiDirect('/api/consult/search/key', searchParam);
				//let response = await common.doCallApi('/api/consult/search/key', searchParam);

				$(".mainfull").find('#SearchResultView').empty();
        $(".mainfull").find('#NavigBar').empty();

				await doShowSearchConsultCallback(response);

				//$('body').loading('stop');

			}
		});

		return $(searchFormRow);

	}

	const doCreateSearchConsultHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>วันที่</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ประวัติ</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>โรงพยาบาล</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

	const doCreateSearchConsultItemRow = function(consultItem){
		return new Promise(async function(resolve, reject) {
			let consultDate = util.formatDateTimeStr(consultItem.createdAt);
			let consultdatetime = consultDate.split(' ');
			let consultdateSegment = consultdatetime[0].split('-');
			consultdateSegment = consultdateSegment.join('');
			let consultdate = util.formatStudyDate(consultdateSegment);
			let consulttime = util.formatStudyTime(consultdatetime[1].split(':').join(''));

			let patientName = consultItem.PatientName;
			let patientHN = consultItem.PatientHN;
			let patientHRbox = $('<div></div>');
			await consultItem.PatientHRLink.forEach((item, i) => {
				let hrthumb = $('<img width="40px" height="auto" style="position: relative; display: inline-block; cursor: pointer;"/>');
				if (item.link){
					$(hrthumb).attr('src', item.link);
					$(hrthumb).on('click', (evt)=>{
						window.open(item.link, '_blank');
					});
				} else {
					$(hrthumb).attr('src', '/images/fail-icon.png');
				}
				$(hrthumb).appendTo($(patientHRbox));
			});

			let consultHosName = consultItem.hospital.Hos_Name;

			let consultCMD = doCreateSearchConsultItemCmd(consultItem);
			//let consultCMD = $('<span>CMD</span>');

			let consultRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

			let consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append('<span>' + consultdate + ' : ' + consulttime + '</span>');
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + patientHN + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + patientName + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($(patientHRbox));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + consultHosName + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($(consultCMD));
			$(consultColumn).appendTo($(consultRow));

			resolve($(consultRow));
		});
	}

	const doCreateSearchConsultItemCmd = function(consultItem){
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let consultCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
		let openCmd = $('<div>Open</div>');
		$(openCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'orange', 'color': 'white'});
		$(consultCmdBox).append($(openCmd));
		$(openCmd).on('click', async (evt)=>{
			let consultId = consultItem.id;
			let cloudMessageJson = await apiconnector.doGetApi('/api/chatlog/select/consult/' + consultId, {});
			localStorage.setItem('localmessage', JSON.stringify(cloudMessageJson.Log));
			let fakPaient = {
				Patient_HN: consultItem.patientHN,
				Patient_NameEN: consultItem.patientName,
				Patient_LastNameEN: '',
				Patient_Sex: '',
				Patient_Age: ''
			}
			let caseData = {
				casestatusId: consultItem.casestatusId,
				Case_BodyPart: '',
				patient: fakPaient
			}
			let fakeCase = {
				case: caseData
			}

			let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);

			$('#ChatSendBox').hide();
		});

		return $(consultCmdBox)

	}

  return {
    doCreateNewCaseTitlePage,
    doCreateHeaderRow,
    doCreateCaseItemRow,
    doCallMyNewCase,
    doCreateNewCasePage
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7,"./chatmanager.js":15}],17:[function(require,module,exports){
/* onrefreshtrigger.js */
module.exports = function ( jq ) {
	const $ = jq;

  const doShowCaseCounter = function(newstatusCases, accstatusCases, newConsult){
		let allNewIntend = newstatusCases.length + newConsult.length;
    if (allNewIntend > 0) {
    	$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(allNewIntend);
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
			$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }

    if (accstatusCases.length > 0) {
    	$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').text(accstatusCases.length);
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
			$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }
  }

  return {
    doShowCaseCounter
	}
}

},{}],18:[function(require,module,exports){
/* opencase.js */
module.exports = function ( jq ) {
	const $ = jq;
	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const chatman = require('./chatmanager.js')($);
	const ai = require('./ai-lib.js')($);

	const commandLinkStyle = {'padding': '3px', 'cursor': 'pointer', 'border': '1px solid white', 'color': 'white', 'background-color': 'blue'};
	const commandButtonStyle = {'padding': '3px', 'cursor': 'pointer'/*, 'border': '1px solid white', 'color': 'white', 'background-color': 'blue'*/};

	const backwardCaseStatus = [1, 2, 5, 6, 10, 11, 12, 13, 14];
	let caseHospitalId = undefined;
	let casePatientId = undefined;
	let caseId = undefined;
	let caseResponseId = undefined;
	let backupDraftCounter = undefined;
	let syncTimer = undefined;

	const doDownloadZipBlob = function(downloadCmd, link, outputFilename, successCallback){
		let pom = document.createElement('a');
		$.ajax({
			url: link,
			xhrFields:{
				responseType: 'blob'
			},
			xhr: function () {
				var xhr = $.ajaxSettings.xhr();
				xhr.onprogress = function(event) {
					if (event.lengthComputable) {
						// For Download
						let loaded = event.loaded;
						let total = event.total;
						let prog = (loaded / total) * 100;
						let perc = prog.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						$(downloadCmd).val('Retrieving ' + perc + '%');
					}
				}
				return xhr;
			},
			success: function(data){
				$(downloadCmd).val(' DL/Open ');
				//$(downloadCmd).removeClass('action-btn');
				//$(downloadCmd).addClass('special-action-btn');
				let stremLink = URL.createObjectURL(new Blob([data], {type: 'application/octetstream'}));
				pom.setAttribute('target', "_blank");
				pom.setAttribute('href', stremLink);
				pom.setAttribute('download', outputFilename);
				pom.click();
				successCallback();
				//doResetPingCounterOnOpenCase();
			}
  	});
	}

	const doDownloadDicom = function(evt, caseDicomZipFilename) {
		evt.preventDefault();
		let dicomZipLink = '/img/usr/zip/' + caseDicomZipFilename;
		let pom = document.createElement('a');
		document.body.appendChild(pom);
		pom.setAttribute('target', "_blank");
		pom.setAttribute('href', dicomZipLink);
		pom.setAttribute('download', caseDicomZipFilename);
		pom.click();
		document.body.removeChild(pom);
		common.downloadDicomList = [];
		common.downloadDicomList.push(caseDicomZipFilename);
		return common.downloadDicomList;
	}

	const doDownloadDicomShowProg = function(evt, caseDicomZipFilename) {
		evt.preventDefault();
		let dicomZipLink = '/img/usr/zip/' + caseDicomZipFilename;
		let downloadCmd = $(evt.currentTarget);
		let oldLabel = $(downloadCmd).val();
		$(downloadCmd).prop('disabled', true);
		window.fetch(dicomZipLink, {method: 'GET'}).then((response) => {
			return new Promise(async function(resolve, reject) {
				let reader = response.body.getReader();
				let contentLength = response.headers.get('Content-Length');
				let receivedLength = 0;
				let chunks = [];
				while(true) {
	  			let {done, value} = await reader.read();
				  if (done) {
				    break;
				  }
					chunks.push(value);
				  receivedLength += value.length;
					let prog = (receivedLength / contentLength) * 100;
					let perc = prog.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					$(downloadCmd).val(oldLabel + '(' + perc + '%)');
				}
				let blob = new Blob(chunks);
				//return blob;
				resolve(blob)
			});
		}).then((blob) => {
			let url = window.URL.createObjectURL(blob);
			let pom = document.createElement('a');
			pom.href = url;
			pom.download = caseDicomZipFilename;
      document.body.appendChild(pom);
      pom.click();
      pom.remove();
			$(downloadCmd).val(oldLabel);
			$(downloadCmd).prop('disabled', false);
			//doResetPingCounterOnOpenCase();
		});
		common.downloadDicomList = [];
		common.downloadDicomList.push(caseDicomZipFilename);
		return common.downloadDicomList;
	}

  const onDownloadCmdClick = function(downloadCmd) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
	    //const downloadCmd = $(evt.currentTarget);
	    const downloadData = $(downloadCmd).data('downloadData');
			let dicomzipfilename = downloadData.dicomzipfilename;
			let dicomzipfilepath = '/img/usr/zip/' + dicomzipfilename;
			let orthanczipfilename = downloadData.studyID + '.zip';
			let orthanczipfilepath = '/img/usr/zip/' + orthanczipfilename;

			let existDicomFileRes = await apiconnector.doCallDicomArchiveExist(dicomzipfilename);
			if (existDicomFileRes.link){
				doDownloadZipBlob(downloadCmd, dicomzipfilepath, dicomzipfilename, ()=>{
					common.downloadDicomList = [];
					common.downloadDicomList.push(dicomzipfilename);
					resolve(existDicomFileRes);
				});
			} else {
				let existOrthancFileRes = await apiconnector.doCallDicomArchiveExist(orthanczipfilename);
				if (existOrthancFileRes.link){
					doDownloadZipBlob(downloadCmd, orthanczipfilepath, dicomzipfilename, ()=>{
						common.downloadDicomList = [];
						common.downloadDicomList.push(dicomzipfilename);
						resolve(existOrthancFileRes);
					});
				} else {
					let studyID = downloadData.studyID;
					let hospitalId = downloadData.hospitalId;
					apiconnector.doCallDownloadDicom(studyID, hospitalId).then((response) => {
						setTimeout(()=>{
							doDownloadZipBlob(downloadCmd, response.link, dicomzipfilename, ()=>{
								common.downloadDicomList = [];
								common.downloadDicomList.push(dicomzipfilename);
								resolve(response);
							});
						}, 2500);
					});
				}
			}
  	});
  }

	const doCreateResultPDFDialog = function(caseId, pdfReportLink /*, createNewResultData, okCmdClickCallback*/){
		const dialogHLBarCss = {'position': 'relative', 'width': '99.4%', 'background-color': common.headBackgroundColor, 'color': 'white', 'text-align': 'center', 'border': '1px solid grey', 'margin-top': '4px'};
		const modalDialog = $('<div></div>');
		$(modalDialog).css(common.quickReplyDialogStyle);
		const contentDialog = $('<div></div>');

		let dialogTitle = $('<h3>ผลอ่าน</h3>');
		let dialogHeader = $('<div></div>');
		$(dialogHeader).append($(dialogTitle));
		$(dialogHeader).css(dialogHLBarCss);

		let dialogContent = $('<div style="border: 1px solid grey; position: relative; width: 99.4%; margin-top: 4px;"></div>');
		let embetObject = $('<object data="' + pdfReportLink + '" type="application/pdf" width="99%" height="380"></object>');
		$(dialogContent).append($(embetObject));
		$(dialogContent).css({'position': 'relative', 'width': '100%'});

		//let okCmd = $('<input type="button" value="  ส่งผลอ่าน  " class="action-btn"/>');
		let closeCmd = $('<input type="button" value="  ปิด  " style="margin-left: 10px;"/>');
		let dialogFooter = $('<div></div>');
		$(dialogFooter)/*.append($(okCmd))*/.append($(closeCmd));
		$(dialogFooter).css(dialogHLBarCss);

		const doCloseDialog = function(){
			$(modalDialog).parent().empty();
			$(modalDialog).parent().removeAttr('style');
			$('#AcceptedCaseCmd').click();
		}

		$(closeCmd).on('click', (evt)=>{
			doCloseDialog();
		});

		/*
		$(okCmd).data('saveResponseData', createNewResultData);
		$(okCmd).on('click', (evt)=>{
			okCmdClickCallback(evt);
			doCloseDialog();
		});
		*/
		$(contentDialog).append($(dialogHeader)).append($(dialogContent)).append($(dialogFooter));
		$(contentDialog).css(common.quickReplyContentStyle);
		return $(modalDialog).append($(contentDialog))
	}

  const onOpenStoneWebViewerCmdClick = function(evt) {
    const openCmd = $(evt.currentTarget);
    const openData = $(openCmd).data('openData');
		common.doOpenStoneWebViewer(openData.studyInstanceUID, openData.hospitalId);
  }

  const onOpenThirdPartyCmdClick = function(evt) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const defaultDownloadPath = userdata.userinfo.User_PathRadiant;
		//const defaultDownloadPath = 'C:/Users/Administrator/Downloads';
		/*
		defaultDownloadPath ต้องไม่มีเครื่องหมาย \
		ให้ใช้ / แทน \
		user ต้องรอให้การดาวน์โหลดเสร็จสมูรณ์ จึงคลิก 3th Party ได้
		*/
		let thirdPartyLink = 'radiant://?n=f&v=';
		if (common.downloadDicomList.length > 0) {
			/*
			if (common.downloadDicomList.length <= 3) {
				common.downloadDicomList.forEach((item, i) => {
					if (i < (common.downloadDicomList.length-1)) {
						thirdPartyLink += defaultDownloadPath + '/' + item + '&v=';
					} else {
						thirdPartyLink += defaultDownloadPath + '/' + item;
					}
				});
				console.log(thirdPartyLink);
				var pom = document.createElement('a');
				pom.setAttribute('href', thirdPartyLink);
				pom.click();
				common.downloadDicomList = [];
			} else {
				$.notify("sorry, not support exceed three file download", "warn");
			}
			*/

			let l = common.downloadDicomList.length;
			let r = l - 3;
			for (let i=(l-1); i>r; i--) {
				if (i >= 0) {
					let item = common.downloadDicomList[i];
					if (item !== '') {
						thirdPartyLink += defaultDownloadPath + '/' + item + '&v=';
					}
				}
			}
			let lastThree = thirdPartyLink.substr(thirdPartyLink.length - 3);
			if (lastThree === '&v=') {
				thirdPartyLink = thirdPartyLink.substring(0, thirdPartyLink.length-3);
			}
			console.log(thirdPartyLink);
			let pom = document.createElement('a');
			pom.setAttribute('href', thirdPartyLink);
			pom.click();
			common.downloadDicomList = [];
		} else {
			$.notify("ขออภัย ยังไม่พบรายการดาวน์โหลดไฟล์", "warn");
		}
  }

	const onMisstakeCaseNotifyCmdClick = function(evt){
		let misstakeCaseData = $(evt.currentTarget).data('misstakeCaseData');
		console.log(misstakeCaseData);
		//let getUserInfoUrl = '/api/user/' + misstakeCaseData.userId;
    //common.doGetApi(getUserInfoUrl, {}).then(async(response)=>{
			//console.log(response.Record);
      //let ownerCaseInfo = response.Record.info;
			//let ownerCaseUser = response.Record.user;

			let owner = misstakeCaseData.Owner;

			let ownerCaseInfoBox = $('<div></div>');
			$(ownerCaseInfoBox).append($('<h4>ข้อมูลผู้ส่งเคส</h4>').css({'text-align': 'center', 'line-height': '14px'}));
			$(ownerCaseInfoBox).append($('<p>ชื่อ ' + owner.User_NameTH + ' ' + owner.User_LastNameTH + '</p>').css({'line-height': '14px'}));
			$(ownerCaseInfoBox).append($('<p>โทร. ' + owner.User_Phone + '</p>').css({'line-height': '14px'}));
			if (owner.User_Mail) {
				$(ownerCaseInfoBox).append($('<p>อีเมล์. ' + owner.User_Mail + '</p>').css({'line-height': '14px'}));
			}
			let notifyMessageBox = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
			let optionRow = $('<tr></tr>');
			let optionNameCell = $('<td width="30%">สาเหตุ</td>').css({'padding': '5px'});
			let optionValueCell = $('<td width="*"></td>').css({'padding': '5px'});
			$(optionRow).append($(optionNameCell)).append($(optionValueCell));
			let causeOption = $('<select></select>');
			$(causeOption).append($('<option value="ประวัติไม่ชัดเจน/ขอประวัติเพิ่ม">ประวัติไม่ชัดเจน/ขอประวัติเพิ่ม</option>'));
			$(causeOption).append($('<option value="ภาพไม่ครบ/ต้องการภาพเพิ่มเติม">ภาพไม่ครบ/ต้องการภาพเพิ่มเติม</option>'));
			$(causeOption).append($('<option value="ประวัติ, ภาพ หรือผลผิดคน">ประวัติ, ภาพ หรือผลผิดคน</option>'));
			$(causeOption).append($('<option value="รายการ DF ผิด">รายการ DF ผิด</option>'));
			$(causeOption).append($('<option value="อื่นๆ">อื่นๆ</option>'));
			$(optionValueCell).append($(causeOption));
			$(notifyMessageBox).append($(optionRow));

			let inputRow = $('<tr></tr>');
			let inputNameCell = $('<td">เพิ่มเติม</td>').css({'padding': '5px'});
			let inputValueCell = $('<td></td>').css({'padding': '5px'});
			let inputValue = $('<input type="text" size="25"/>');
			$(inputValueCell).append($(inputValue));
			$(inputRow).append($(inputNameCell)).append($(inputValueCell));
			$(notifyMessageBox).append($(inputRow));
			let radAlertMsg = $('<div></div>');
			$(radAlertMsg).append($(ownerCaseInfoBox)).append($(notifyMessageBox));

			const radconfirmoption = {
	      title: 'แจ้งเคสผิดพลาด',
	      msg: $(radAlertMsg),
	      width: '420px',
	      onOk: function(evt) {
					let causeValue = $(causeOption).val();
					let otherValue = $(inputValue).val();
					const userdata = JSON.parse(localStorage.getItem('userdata'));

					let main = require('../main.js');
					let myWsm = main.doGetWsm();
					if (!myWsm) {
						util.wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
						myWsm = util.wsm;
					}
					//let myWsm = util.wsm;
					let sendto = owner.username;
					let userfullname = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
					let from = {userId: userdata.id, username: userdata.username, userfullname: userfullname};
					let msg = {cause: causeValue, other: otherValue, caseData: misstakeCaseData};
					let msgSend = {type: 'casemisstake', msg: msg, sendto: sendto, from: from};
			    myWsm.send(JSON.stringify(msgSend));
					$.notify('ระบบฯ แจ้งข้อมูลความผิดพลาดของเคสไปยังผู้ส่งเคสสำร็จ', 'success');
					radConfirmBox.closeAlert();
	      },
	      onCancel: function(evt) {
	        radConfirmBox.closeAlert();
	      }
	    }
	    let radConfirmBox = $('body').radalert(radconfirmoption);
    //});
	}

  const onTemplateSelectorChange = async function(evt) {
		//$('body').loading('start');
		let yourResponse = $('#SimpleEditor').val();
		let templateId = $(evt.currentTarget).val();
		if ((templateId) && (templateId > 0)){
			let result = await doLoadTemplate(templateId);
			if ((result.Record) && (result.Record.length > 0)) {
				let yourNewResponse = yourResponse + '<br/>' + result.Record[0].Content;
				$('#SimpleEditor').jqteVal(yourNewResponse);
				await doBackupDraft(caseId, yourNewResponse);
			}
		} else if (templateId == 0) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let radioId = userdata.id;
			let allTemplates = await doLoadTemplateList(radioId);
			if (allTemplates.Options.length > 0) {
				$('#TemplateSelector').empty();
        allTemplates.Options.forEach((item, i) => {
          $('#TemplateSelector').append('<option value="' + item.Value + '">' + item.DisplayText + '</option>');
        });
      } else {
				$.notify('ระบบฯ ไม่พบรายการ Template ของคุณ', 'warn');
			}
		}
		//$('body').loading('stop');
  }

	const onCreateNewResponseCmdClick = async function(evt) {
		let responseHTML = $('#SimpleEditor').val();
		if ((responseHTML) && (responseHTML !== '')) {
			const createNewResponseCmd = $(evt.currentTarget);
			const saveNewResponseData = $(createNewResponseCmd).data('createNewResponseData');
	    const userdata = JSON.parse(localStorage.getItem('userdata'));
			const radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
			/*
			ต้องทดสอบการ Paste จาก MS Word แบบละเียดอีกที
			*/
			const startPointText = '<!--StartFragment-->'
			const endPointText = '<!--EndFragment-->';

			let responsetype = 'draft';
			let caseId = saveNewResponseData.caseId;
			let reporttype = saveNewResponseData.reporttype;
			let userId = userdata.id;

			let responseText = responseHTML;
			let tempToken = responseText.replace('\n', '');
			let startPosition = tempToken.indexOf(startPointText);
			if (startPosition >= 0) {
				let endPosition = tempToken.indexOf(endPointText);
				tempToken = tempToken.slice((startPosition+20), (endPosition));
			}
			/*
			tempToken = tempToken.split(startPointText).join('<div>');
			tempToken = tempToken.split(endPointText).join('</div>');
			*/
			tempToken = tempToken.replace(startPointText, '<div>');
			tempToken = tempToken.replace(endPointText, '</div>');
			if (tempToken !== '') {
				let draftbackup = {caseId: caseId, content: tempToken, backupAt: new Date()};
				localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
				responseText = toAsciidoc(tempToken);
				console.log(responseText);
				let rsW = saveNewResponseData.resultFormat.width;
				let fnS = saveNewResponseData.resultFormat.fontsize;
				let rsH = doCalResultHeigth(tempToken, rsW, fnS);
				console.log(rsW, fnS, rsH);
				let saveData = {Response_HTML: tempToken, Response_Text: responseText, Response_Type: responsetype, reporttype: reporttype, Response_A4Height: rsH};
				let casedate = saveNewResponseData.casedate;
				let casetime = saveNewResponseData.casetime;
				let patientFullName = saveNewResponseData.patientFullName;
				let fileExt = 'pdf';
				let fileName = (patientFullName.split(' ').join('_')) + '-' + casedate + '-' + casetime + '.' + fileExt;

				saveNewResponseData.Response_Text = responseText;

				let params = {
					caseId: caseId,
					userId: userId,
					radioNameTH: radioNameTH,
					data: saveData,
					hospitalId: caseHospitalId,
					pdfFileName: fileName
				};

				if ((params.caseId) && (Number(params.caseId) > 0)) {
					if (caseResponseId){
						params.responseId = caseResponseId;
					}
					//doCreateResultManagementDialog(saveNewResponseData);
					//let saveResponseRes = doCallSaveResult(params);
					//->ตรงนี้คืออะไร
					//-> ตรงนี้คือการสั่งให้เซิร์ฟเวอร์สร้างผลอ่าน pdf ไว้ก่อนล่วงหน้า
					params.reporttype = 'normal';
					//let saveResponseApiURL = '/api/uicommon/radio/saveresponse';
					let saveResponseApiURL = '/api/caseresponse/save';
					$.post(saveResponseApiURL, params, async function(saveResponseRes){
						if ((saveResponseRes.result) && (saveResponseRes.result.responseId)) {
							caseResponseId = saveResponseRes.result.responseId;
							saveNewResponseData.responseid = caseResponseId;
							saveNewResponseData.reportPdfLinkPath = '/img/usr/pdf/' + fileName;
							doCreateResultManagementDialog(saveNewResponseData);
						} else {
							let callRes = await doCallDraftRespons(caseId);
							if (callRes.Record.length > 0) {
								caseResponseId = callRes.Record[0].id;
								saveNewResponseData.responseid = caseResponseId;
								saveNewResponseData.reportPdfLinkPath = '/img/usr/pdf/' + fileName;
								doCreateResultManagementDialog(saveNewResponseData);
							} else {
								console.log({error: 'not found case responseId'});
							}
						}
					}).catch((err) => {
						console.log(err);
						$.notify("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ โปรดแจ้งผู้ดูแลระบบ", "error");
						doReportBugOpenCase({params: params, url: saveResponseApiURL}, 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร');
					});
				} else {
					$.notify('ข้อมูลที่ต้องการบันทึกไม่ถูกต้อง ไม่พบหมายเลขเคสของคุณ', 'error');
					doReportBugOpenCase({params: params, url: saveResponseApiURL}, 'ไม่พบหมายเลขเคสของคุณ');
				}
			} else {
				$.notify("ข้อความในผลอ่านว่างเปล่า ไม่สามารถบันทึกได้", "error");
			}
		} else {
			$.notify("ผลอ่านว่างเปล่า ไม่สามารถบันทึกได้", "error");
		}
	}

	const doCreateResultManagementDialog = function(saveResponseData){
		let report = {reportPdfLinkPath: saveResponseData.reportPdfLinkPath, reportPages: saveResponseData.reportPages, patientFullName: saveResponseData.patientFullName};
		saveResponseData.report = report;
		let saveTypeOptionBox = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');

		let selectSaveTypeOptionGuideRow = $('<tr></tr>');
		$(selectSaveTypeOptionGuideRow).css({'background-color': common.headBackgroundColor, 'color': 'white'});
		$(selectSaveTypeOptionGuideRow).appendTo($(saveTypeOptionBox));
		let guideCell = $('<td colspan="2" align="center"></td>');
		$(guideCell).append($('<h3>Result management</h3>'));
		$(guideCell).appendTo($(selectSaveTypeOptionGuideRow));

		let normalSaveTypeOptionRow = $('<tr class="case-row" style="cursor: pointer;"></tr>');
		$(normalSaveTypeOptionRow).appendTo($(saveTypeOptionBox));
		let normalPointIcon = $('<img src="/images/triangle-right-icon.png" width="25px" height="auto" style="display: none;"/>');
		let arrowPointerIconCell = $('<td width="15%" align="center"></td>');
		$(arrowPointerIconCell).append($(normalPointIcon));
		let labelOptionCell = $('<td width="*" style="border: 2px solid grey;"></td>');
		$(labelOptionCell).append($('<span>Normal</span>'));
		$(normalSaveTypeOptionRow).append($(arrowPointerIconCell)).append($(labelOptionCell))
		$(normalSaveTypeOptionRow).hover(()=>{$(normalPointIcon).toggle();})

		let attentionSaveTypeOptionRow = $('<tr class="case-row" style="cursor: pointer;"></tr>');
		$(attentionSaveTypeOptionRow).appendTo($(saveTypeOptionBox));
		let attentionPointIcon = $('<img src="/images/triangle-right-icon.png" width="25px" height="auto" style="display: none;"/>');
		arrowPointerIconCell = $('<td align="center"></td>');
		$(arrowPointerIconCell).append($(attentionPointIcon));
		labelOptionCell = $('<td style="border: 2px solid grey;"></td>');
		$(labelOptionCell).append($('<span>Need Attention</span>'));
		$(attentionSaveTypeOptionRow).append($(arrowPointerIconCell)).append($(labelOptionCell))
		$(attentionSaveTypeOptionRow).hover(()=>{$(attentionPointIcon).toggle();})

		let criticalSaveTypeOptionRow = $('<tr class="case-row" style="cursor: pointer;"></tr>');
		$(criticalSaveTypeOptionRow).appendTo($(saveTypeOptionBox));
		let criticalPointIcon = $('<img src="/images/triangle-right-icon.png" width="25px" height="auto" style="display: none;"/>');
		arrowPointerIconCell = $('<td align="center"></td>');
		$(arrowPointerIconCell).append($(criticalPointIcon));
		labelOptionCell = $('<td style="border: 2px solid grey;"></td>');
		$(labelOptionCell).append($('<span>Critical</span>'));
		$(criticalSaveTypeOptionRow).append($(arrowPointerIconCell)).append($(labelOptionCell))
		$(criticalSaveTypeOptionRow).hover(()=>{$(criticalPointIcon).toggle();})

		let preliminarySaveTypeOptionRow = $('<tr class="case-row" style="cursor: pointer;"></tr>');
		$(preliminarySaveTypeOptionRow).appendTo($(saveTypeOptionBox));
		let preliminaryPointIcon = $('<img src="/images/triangle-right-icon.png" width="25px" height="auto" style="display: none;"/>');
		arrowPointerIconCell = $('<td align="center"></td>');
		$(arrowPointerIconCell).append($(preliminaryPointIcon));
		labelOptionCell = $('<td style="border: 2px solid grey;"></td>');
		$(labelOptionCell).append($('<span>Pre-Liminary</span>'));
		$(preliminarySaveTypeOptionRow).append($(arrowPointerIconCell)).append($(labelOptionCell))
		$(preliminarySaveTypeOptionRow).hover(()=>{$(preliminaryPointIcon).toggle();})

		let selectSaveTypeOptionControlRow = $('<tr></tr>');
		$(selectSaveTypeOptionControlRow).css({'background-color': common.headBackgroundColor});
		$(selectSaveTypeOptionControlRow).appendTo($(saveTypeOptionBox));
		let controlCell = $('<td colspan="2" align="center"></td>');
		let backCmd = $('<input type="button" value=" Back "/>');
		$(backCmd).on('click', (evt)=>{
			$('#quickreply').empty();
			$('#quickreply').removeAttr('style');
		});
		$(controlCell).append($(backCmd));
		$(controlCell).appendTo($(selectSaveTypeOptionControlRow));

		$('#quickreply').css(common.quickReplyDialogStyle);
		let saveTypeOptionBoxStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '420px', 'height': 'auto'};
		$(saveTypeOptionBox).css(saveTypeOptionBoxStyle);
		$('#quickreply').append($(saveTypeOptionBox));

		$(normalSaveTypeOptionRow).data('saveResponseData', saveResponseData);
		$(normalSaveTypeOptionRow).on('click', onNormalSaveOptionCmdClick);
		$(attentionSaveTypeOptionRow).data('saveResponseData', saveResponseData);
		$(attentionSaveTypeOptionRow).on('click', onAttentionSaveOptionCmdClick);
		$(criticalSaveTypeOptionRow).data('saveResponseData', saveResponseData);
		$(criticalSaveTypeOptionRow).on('click', onCriticalSaveOptionCmdClick);
		$(preliminarySaveTypeOptionRow).data('saveResponseData', saveResponseData);
		$(preliminarySaveTypeOptionRow).on('click', onPreliminarySaveOptionCmdClick);
	}

	const onNormalSaveOptionCmdClick = async function(evt) {
		const responseType = 'normal';
		const reportType = 'normal';
		const normalSaveResponseCmd = $(evt.currentTarget);
		const saveResponseData = $(normalSaveResponseCmd).data('saveResponseData');
		await doSubmitResult(responseType, reportType, saveResponseData)
	}

	const onAttentionSaveOptionCmdClick = async function(evt) {
		const responseType = 'normal';
		const reportType = 'attention';
		const normalSaveResponseCmd = $(evt.currentTarget);
		const saveResponseData = $(normalSaveResponseCmd).data('saveResponseData');
		await doSubmitResult(responseType, reportType, saveResponseData)
	}

	const onCriticalSaveOptionCmdClick = async function(evt) {
		const responseType = 'normal';
		const reportType = 'cristical';
		const normalSaveResponseCmd = $(evt.currentTarget);
		const saveResponseData = $(normalSaveResponseCmd).data('saveResponseData');
		await doSubmitResult(responseType, reportType, saveResponseData)
	}

	const onPreliminarySaveOptionCmdClick = async function(evt) {
		const responseType = 'normal';
		const reportType = 'preliminary';
		const normalSaveResponseCmd = $(evt.currentTarget);
		const saveResponseData = $(normalSaveResponseCmd).data('saveResponseData');
		await doSubmitResult(responseType, reportType, saveResponseData)
	}

	const doSubmitResult = function(responseType, reportType, saveResponseData){
		return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			//console.log(saveResponseData);

	    const userdata = JSON.parse(localStorage.getItem('userdata'));
			let caseId = saveResponseData.caseId
			let userId = userdata.id;
			let radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
			let params = {
				caseId: caseId,
				userId: userId,
				radioNameTH: radioNameTH,
				responseId: caseResponseId,
				hospitalId: caseHospitalId,
				reporttype: reportType,
				report: saveResponseData.report,
			};

			params.report.Response_Text = saveResponseData.patientFullName + '\n====================\n' + saveResponseData.Response_Text;

			let saveResponseRes = await doCallSubmitResult(params);
			//Uri = '/api/uicommon/radio/submitresult';
			console.log(saveResponseRes);

			if ((saveResponseRes.status.code == 200) || (saveResponseRes.status.code == 203)){
				$.notify("ส่งผลอ่านเข้า cloud สำเร็จ", "success");
				//$('body').loading('stop');
				$('#quickreply').empty();
				$('#quickreply').removeAttr('style');
				$("#dialog").empty();
				if (saveResponseData.previewOption === 0){
					resolve(saveResponseRes);
					let responseTextFilename = saveResponseData.patientFullName.split(' ').join('_') + '.txt';
					//console.log(responseTextFilename);
					//doSaveResponseTextToLocalFile(saveResponseData.Response_Text, responseTextFilename);
					setTimeout(()=>{
						$('#AcceptedCaseCmd').click();
					}, 1800);
				} else if (saveResponseData.previewOption === 1) {
					let pdfReportLink = saveResponseData.reportPdfLinkPath + '?t=' + common.genUniqueID();
					console.log(pdfReportLink);
					/*
					saveNewResponseData.reportPdfLinkPath = saveResponseRes.reportLink;
					saveNewResponseData.reportPages = pdfReportPages;
					*/
					let resultPDFDialog = doCreateResultPDFDialog(caseId, pdfReportLink);
					$(resultPDFDialog).css({'margin': '20px auto'});
					$("#dialog").append($(resultPDFDialog));
					resolve(pdfReportLink);
					let responseTextFilename = saveResponseData.patientFullName.split(' ').join('_') + '.txt';
					//doSaveResponseTextToLocalFile(saveResponseData.Response_Text, responseTextFilename);
				}
			} else {
				$.notify("ไม่สามารถส่งผลอ่าน - Error โปรดติดต่อผู้ดูแลระบบ", "error");
				doReportBugOpenCase({params: params, url: '/api/uicommon/radio/submitresult'}, 'ไม่พบหมายเลขเคสของคุณ');
				//$('body').loading('stop');
				reject({errer: 'Submit Case Result Error'});
			}
		});
	}

	const doSaveDraft = function(saveDraftResponseData) {
		return new Promise(async function(resolve, reject) {
			let type = saveDraftResponseData.type;
			/*
			let caseId = saveDraftResponseData.caseId;
			*/
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let radioNameTH = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
			let responseHTML = $('#SimpleEditor').val();
			let startPointText = '<!--StartFragment-->';
			let endPointText = '<!--EndFragment-->';
			let tempToken = responseHTML.replace('\n', '');
			let startPosition = tempToken.indexOf(startPointText);
			if (startPosition >= 0) {
				let endPosition = tempToken.indexOf(endPointText);
				tempToken = tempToken.slice((startPosition+20), (endPosition));
			}
			/*
			tempToken = tempToken.split(startPointText).join('<div>');
			tempToken = tempToken.split(endPointText).join('</div>');
			*/
			tempToken = tempToken.replace(startPointText, '<div>');
			tempToken = tempToken.replace(endPointText, '</div>');
			let draftbackup = {caseId: caseId, content: tempToken, backupAt: new Date()};
			localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
			responseText = toAsciidoc(tempToken);
			let saveData = {Response_HTML: tempToken, Response_Text: responseText, Response_Type: type};
			let params = {caseId: caseId, userId: userId, data: saveData, responseId: caseResponseId, reporttype: type, radioNameTH: radioNameTH};
			let saveResponseRes = await doCallSaveResponse(params);
			resolve(saveResponseRes);
		});
	}

	const onSaveDraftResponseCmdClick = function(evt) {
		return new Promise(async function(resolve, reject) {
			let responseHTML = $('#SimpleEditor').val();
			if (responseHTML !== '') {
				//$('body').loading('start');
				const saveDraftResponseCmd = $(evt.currentTarget);
		    const saveDraftResponseData = $(saveDraftResponseCmd).data('saveDraftResponseData');
				let draftResponseRes = await doSaveDraft(saveDraftResponseData);
				//console.log(draftResponseRes);
				//if ((draftResponseRes.status.code == 200) || (draftResponseRes.status.code == 203)){
				if (draftResponseRes.status.code == 200) {
					caseResponseId = draftResponseRes.result.responseId;
					if (!caseResponseId) {
						$.notify("เกิดความผิดพลาด Case Response API", "error");
					}
					$.notify("บันทึก Draft สำเร็จ", "success");
					//$('body').loading('stop');
				} else {
					$.notify("ไม่สามารถบันทึก Draft - Error โปรดติดต่อผู้ดูแลระบบ", "error");
					//$('body').loading('stop');
				}
				//doResetPingCounterOnOpenCase();
				resolve(draftResponseRes);
			} else {
				$.notify("โปรดพิมพ์ผลอ่านก่อนครับ", "warn");
				resolve();
			}
		});
	}

	const onAddNewTemplateCmdClick = function(evt) {
		let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
		$('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
		$('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
		let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
		$('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

		const simpleEditorConfig = $.extend({}, common.jqteConfig);

		let newTemplateData = $(evt.currentTarget).data('newTemplateData');
		let templateNameInput = $('<input type="text" id="TemplateName" style="width: 250px;"/>');
		let modalityInput = $('<select id="Modality" style="width: 80px;"></select>');

		common.modalitySelectItem.forEach((item, i) => {
			let optionItem = $('<option value="' + item +'">' + item + '</option>');
			$(modalityInput).append($(optionItem));
		});

    let hospitalSelect = $('<select id="Hospital"></select>');
		let modifyHospitalListCmd = $('<input type="hidden" id="ModifyHospitalListCmd"/>');
		$(modifyHospitalListCmd).data('hospitalsData', [{id: 0}]);
		$(hospitalSelect).append('<option value="0">All</option>');
		newTemplateData.hospitalmap.forEach((item, i) => {
			$(hospitalSelect).append('<option value="' + item.id + '">' + item.Hos_Name + '</option>');
		});
		$(hospitalSelect).on('click', (evt)=>{
			let newHosVal = [{id: $(hospitalSelect).val()}];
			$(modifyHospitalListCmd).data('hospitalsData', newHosVal);
		});
    let studyDescriptionInput = $('<input type="text" id="StudyDescription" style="width: 250px;"/>');
		let showLegentCmd = common.doCreateLegentCmd(common.doShowStudyDescriptionLegentCmdClick);

		$(modalityInput).val(newTemplateData.Modality);
		$(studyDescriptionInput).val(newTemplateData.StudyDescription);

		//$(modifyHospitalListCmd).data('templateData', newTemplateData);
		let { onModifyHospitalList, onSaveNewCmdClick } = require('./templatelib.js')($);
		//$(modifyHospitalListCmd).on('click', onModifyHospitalList);   //<-----


		let readySwitchBox = $('<select></select>');
		$(readySwitchBox).append('<option value="1">Yes</option>');
		$(readySwitchBox).append('<option value="0">No</option>');

		let tableControlInputView = $('<table width="100% cellpadding="2" cellspacing="2" border="0"></table>');

		let tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">ชื่อ Template:</span></td>'));
		let inputCell = $('<td colspan="3" align="left"></td>');
		$(inputCell).append($(templateNameInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));


		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">Modality:</span></td>'));
		inputCell = $('<td width="25%" align="left"></td>');
		$(inputCell).append($(modalityInput))
		$(tableRow).append($(inputCell));
		//$(tableControlInputView).append($(tableRow));

		//tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">Hospital:</span></td>'));
		inputCell = $('<td width="*" align="left"></td>');
		//$(inputCell).append($(hospitalInput)).append($(modifyHospitalListCmd));
		$(inputCell).append($(hospitalSelect));
		$(inputCell).append($(modifyHospitalListCmd));
		//$(hospitalInput).attr('readonly', true);
		$(tableRow).append($(inputCell));

		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Study Desc.:</span></td>'));
		inputCell = $('<td colspan="3" align="left"></td>');
		$(inputCell).append($(studyDescriptionInput)).append($(showLegentCmd));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Auto Apply:</span></td>'));
		inputCell = $('<td colspan="3" align="left"></td>');
		$(inputCell).append($(readySwitchBox));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));


		//$(modifyHospitalListCmd).data('hospitalsData', []);

		let yourTemplate = $('#SimpleEditor').val();

    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
    let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
    $(simpleEditor).appendTo($(templateViewBox));
    $(simpleEditor).jqte(simpleEditorConfig);

		$(templateViewBox).find('#SimpleEditor').jqteVal(yourTemplate);
    $(templateViewBox).find('.jqte_editor').css({ height: '300px' });
    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
    let saveCmd = $('<input type="button" value=" Save" class="action-btn"/>');
    $(saveCmd).appendTo($(templateCmdBar));
    $(saveCmd).data('templateData', newTemplateData);
    $(templateCmdBar).append($('<span>  </span>'));
    $(saveCmd).on('click', (evt)=>{
			if($(templateNameInput).val() === '') {
				$(templateNameInput).css('border', '1px solid red');
				$.notify('ชื่อ Template ต้องไม่ว่าง', 'error');
			} else if($(studyDescriptionInput).val() === '') {
				$(templateNameInput).css('border', '');
				$(studyDescriptionInput).css('border', '1px solid red');
				$.notify('Study Description ต้องไม่ว่าง', 'error');
			} else {
				$(studyDescriptionInput).css('border', '');
				let autoApply = $(readySwitchBox).val();
				onSaveNewCmdClick(evt, autoApply, false);
				$(cancelCmd).click();
			}
		});
    let cancelCmd = $('<input type="button" value=" Cancel "/>');
    $(cancelCmd).appendTo($(templateCmdBar));
    $(cancelCmd).on('click',(evt)=>{
			$('#quickreply').empty();
			$('#quickreply').removeAttr('style');
		});

		let saveNewTemplateBox = $('<div></div>');
		$(saveNewTemplateBox).append($(tableControlInputView)).append($(templateViewBox)).append($(templateCmdBar));

		$('#quickreply').css(common.quickReplyDialogStyle);
		let saveTypeOptionBoxStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '620px', 'height': 'auto'};
		$(saveNewTemplateBox).css(saveTypeOptionBoxStyle);
		$('#quickreply').empty().append($(saveNewTemplateBox));
	}

	const onBackToOpenCaseCmdClick = function(evt) {
		$('#AcceptedCaseCmd').click();
	}

  const doOpenHR = function(link, patientFullName, casedate){
		//$('body').loading('start');
    //window.open(link, '_blank');
		let filePaths = link.split('/');
		let fileNames = filePaths[filePaths.length-1];
		let fileName = fileNames.split('.');
		let fileExt = fileName[1];
		fileName = (patientFullName.split(' ').join('_')) + '-' + casedate + '.' + fileExt;
		window.fetch(link, {method: 'GET'}).then(response => response.blob()).then(blob => {
			let url = window.URL.createObjectURL(blob);
			let pom = document.createElement('a');
			pom.href = url;
			pom.download = fileName;
      document.body.appendChild(pom);
      pom.click();
      pom.remove();
		});
  }

  const doRenderPatientHR = function(hrlinks, patientFullName, casedate) {
    return new Promise(async function(resolve, reject) {
      let hrBox = $('<div style="width: 100%; padding: 5px;"></div>');
			let hrTable = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');
			$(hrBox).append($(hrTable));
			if ((hrlinks) && (hrlinks.length > 0)){
	      await hrlinks.forEach((item, i) => {
					//console.log(item);
					let filePaths = item.link.split('/');
					let fileNames = filePaths[filePaths.length-1];
					let fileName = fileNames.split('.');
					let fileExt = fileName[1];
					let patientName = patientFullName.split(' ').join('_');
					patientName = patientName.substring(0, 12);
					let linkText = patientName + ' (' + (i+1) + ')' + '.' + fileExt;
					//$(patientHRLink).text(linkText);
					let fileTypeLow = fileExt.toLowerCase();
					let patientHRButton = $('<div class="action-btn" style="position: relative; display: inline-block; cursor: pointer; text-align: center; width: 99%;">' + linkText + '</div>');
					if ((fileTypeLow  === 'zip') || (fileTypeLow  === 'rar')) {
						patientHRButton = $('<input type="button" value="' + linkText + '" class="action-btn" style="cursor: pointer; width: 100%;"/>');
					}
					$(patientHRButton).on("click", function(evt){
						evt.preventDefault();
						if ((fileTypeLow  === 'zip') || (fileTypeLow  === 'rar')) {
							let dwnList = doDownloadDicom(evt, fileNames);
						} else {
	          	doOpenHR(item.link, patientFullName, casedate);
						}
	    		});
					let hrRow = $('<tr></tr>');
					let hrCell = $('<td width="100%" align="left"></td>');
					$(hrRow).append($(hrCell))
					$(hrCell).append($(patientHRButton));
					$(hrTable).append($(hrRow));
	      });
			}
			if (hrlinks.length == 0) {
      	resolve($(hrBox));
			} else {
				window.fetch(hrlinks[0].link, {method: 'GET'}).then(response => response.blob()).then(blob => {
					let filePaths = hrlinks[0].link.split('/');
					let fileNames = filePaths[filePaths.length-1];
					let fileName = fileNames.split('.');
					let fileExt = fileName[1];
					let patientName = patientFullName.split(' ').join('_');
					fileName = patientName + '-' + casedate + '.' + fileExt;
					let url = window.URL.createObjectURL(blob);
					console.log(url);
					/*
					let pom = document.createElement('a');
					pom.href = url;
					pom.download = fileName;
					document.body.appendChild(pom);
					pom.click();
					pom.remove();
					*/
					resolve($(hrBox));
				});
			}
    });
  }

	//const doCreateDicomCmdBox = function(orthancStudyID, studyInstanceUID, casedate, casetime, hospitalId){
	const doCreateDicomCmdBox = function(caseDicomZipFilename){
		let dicomCmdBox = $('<div></div>');
		//let downloadCmd = $('<div class="action-btn" style="position: relative; display: inline-block; width: 110px;">Download</div>');
		let downloadCmd = $('<input type="button" value="Download" class="action-btn" style="cursor: pointer; width: 100%;"/>');
		$(downloadCmd).css(commandButtonStyle);
		$(downloadCmd).appendTo($(dicomCmdBox));
		$(downloadCmd).on('click', async (evt)=>{
			//$('body').loading('start');
			let downloadList = doDownloadDicom(evt, caseDicomZipFilename);
			//$('body').loading('stop');
		});
		/*
		let openViewerCmd = $('<span class="action-btn">Open</span>');
		$(openViewerCmd).appendTo($(dicomCmdBox));
		$(openViewerCmd).css(commandButtonStyle);
		$(openViewerCmd).on('click', async (evt)=>{
			common.doOpenStoneWebViewer(studyInstanceUID, hospitalId);
		});
		*/
		return $(dicomCmdBox);
	}

	const doCreateHRBackwardBox = function(patientFullName, patientHRLinks, casedate){
		return new Promise(async function(resolve, reject) {
			let hrbackwardBox = $('<div"></div>');
			if ((patientHRLinks) && (patientHRLinks.length > 0)){
				await patientHRLinks.forEach((item, i) => {
					let filePaths = item.link.split('/');
					let fileNames = filePaths[filePaths.length-1];
					let fileName = fileNames.split('.');
					let fileCode = fileName[0];
					let codeLink = $('<div class="action-btn" style="position: relative; display: inline-block; width: 140px; cursor: pointer;">' + fileCode + '</div>');
					$(codeLink).css(commandButtonStyle);
					let fileTypeLow = fileName[1].toLowerCase();
					if ((fileTypeLow  === 'zip') || (fileTypeLow  === 'rar')) {
						codeLink = $('<input type="button" value="Attach" class="action-btn" style="cursor: pointer; width: 100%;"/>');
					}
					$(hrbackwardBox).append($(codeLink));
					$(codeLink).on('click',(evt)=>{
						evt.preventDefault();
						if ((fileTypeLow  === 'zip') || (fileTypeLow  === 'rar')) {
							let caseDicomZipFilename = fileCode + '.' + fileName[1];
							let downloadList = doDownloadDicom(evt, caseDicomZipFilename);
						} else {
							doOpenHR(item.link, patientFullName, casedate);
						}
					});
				});
			}
			resolve($(hrbackwardBox));
		});
	}

	const doCreateResponseBackwardBox = function(backwardCaseId, responseId, responseText, patientFullName, casedate){
		let responseBackwarBox = $('<div></div>');
		let downloadCmd = $('<div class="action-btn" style="position: relative; display: inline-block; width: 110px;">Download</div>');
		$(downloadCmd).css(commandButtonStyle);
		$(downloadCmd).appendTo($(responseBackwarBox));
		$(downloadCmd).on('click', async (evt)=>{
			//$('body').loading('start');
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      let reportCreateCallerEndPoint = "/api/casereport/create";
			let fileExt = 'pdf';
			let fileName = (patientFullName.split(' ').join('_')) + '-' + casedate + '.' + fileExt;
      let params = {caseId: backwardCaseId, responseId:responseId, hospitalId: caseHospitalId, userId: userdata.id, pdfFileName: fileName};
			//let reportPdf = await apiconnector.doCallApi(reportCreateCallerEndPoint, params);
			let reportPdf = await apiconnector.doCallApiDirect(reportCreateCallerEndPoint, params);
			var pom = document.createElement('a');
			pom.setAttribute('href', reportPdf.reportLink);
			pom.setAttribute('download', fileName);
			pom.click();
			//$('body').loading('stop');
		});
		let pasteCmd = $('<div class="action-btn" style="position: relative; display: inline-block; width: 110px;">Paste</div>');
		$(pasteCmd).css(commandButtonStyle).css({'margin-left': '8px'});
		$(pasteCmd).appendTo($(responseBackwarBox));
		$(pasteCmd).on('click', async (evt)=>{
			let yourResponse = $('#SimpleEditor').val();
			let yourNewResponse = yourResponse + '<br/>' + responseText;
			$('#SimpleEditor').jqteVal(yourNewResponse);
			//await doBackupDraft(backwardCaseId, yourNewResponse);
		});
		return $(responseBackwarBox);
	}

	const doCreateToggleSwitch = function(patientFullName, backwardView, currentCaseId) {
		let switchBox = $('<div style="position: relative; cursor: pointer;"></div>');
		let switchIcon = $('<img src="/images/arrow-down-icon.png" width="20px" height="auto" style="position: relative; display: inline-block; margin-top: 2px;"/>');
		$(switchIcon).data('state', {state: 'off'});
		let switchText = $('<span style="margin-left: 10px;">แสดงทั้งหมด</span>');
		$(switchBox).append($(switchIcon)).append($(switchText));
			$(switchBox).on('click', async (evt)=>{
			$(backwardView).loading('start');
			let patientBackwards = undefined;
			let switchState = $(switchIcon).data('state');
				if (switchState.state == 'off') {
				patientBackwards = await doLoadPatientBackward(caseHospitalId, casePatientId, backwardCaseStatus, currentCaseId);
				$(switchIcon).data('state', {state: 'on'});
				$(switchIcon).css({ WebkitTransform: 'rotate(180deg)'});
				$(switchText).text('สองรายการล่าสุด');
			} else {
				let limit = 2;
				patientBackwards = await doLoadPatientBackward(caseHospitalId, casePatientId, backwardCaseStatus, currentCaseId, limit);
				$(switchIcon).data('state', {state: 'off'});
				$(switchIcon).css({ WebkitTransform: 'rotate(0deg)'});
				$(switchText).text('แสดงทั้งหมด');
			}
			let backwardContent = await doCreateBackwardItem(patientFullName, patientBackwards.Records, backwardView);
			$(backwardView).loading('stop');
		});
		return $(switchBox);
	}

	const doCreateBackwardItem = function(patientFullName, backwards, backwardView) {
		return new Promise(function(resolve, reject) {
			$(backwardView).empty();
			let backwardHeader = $('<div style="display: table-row; width: 100%;"></div>');
			$(backwardHeader).appendTo($(backwardView));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">#</div>'));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">วันที่</div>'));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">รายการ</div>').css({'width': '18%'}));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">ภาพ</div>'));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">ไฟล์ประวัติ</div>'));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">ผลอ่าน</div>'));
			$(backwardHeader).append($('<div style="display: table-cell; text-align: center;" class="header-cell">หมายเหตุ/อื่นๆ</div>'));
			const promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < backwards.length; i++) {
					let backwardRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');
					let backward = backwards[i];
					let caseCreateAt = util.formatDateTimeStr(backward.createdAt);
					//console.log(caseCreateAt);
					let casedatetime = caseCreateAt.split(' ');
					let casedateSegment = casedatetime[0].split('-');
					casedateSegment = casedateSegment.join('');
					let casedate = casedateSegment;
					casedateSegment = casedatetime[1].split(':');
					let casetime = casedateSegment.join('');

					let casedateDisplay = util.formatStudyDate(casedate);
					//console.log(casedateDisplay);
					//let dicomCmdBox = doCreateDicomCmdBox(backward.Case_OrthancStudyID, backward.Case_StudyInstanceUID, casedate, casetime, backward.hospitalId);
					let dicomCmdBox = doCreateDicomCmdBox(backward.Case_DicomZipFilename);
					let patientHRBackwardBox = await doCreateHRBackwardBox(patientFullName, backward.Case_PatientHRLink, casedate);
					let responseBackwardBox = undefined;
					const caseSuccessStatusIds = [5, 6, 10, 11, 12, 13, 14];
					let hadSuccess = util.contains.call(caseSuccessStatusIds, backward.casestatusId);
					if (hadSuccess) {
						if ((backward.caseresponses) && (backward.caseresponses.length > 0)) {
							responseBackwardBox = doCreateResponseBackwardBox(backward.id, backward.caseresponses[0].id, backward.caseresponses[0].Response_HTML, patientFullName, casedate);
						} else {
							responseBackwardBox = $('<div style="text-align: center">ไมพบผลอ่าน</div>');
						}
					} else {
						responseBackwardBox = $('<div style="text-align: center">เคสยังไม่มีผลอ่าน</div>');
					}
					$(backwardRow).append($('<div style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;">' + (i+1) + '</div>'));
					$(backwardRow).append($('<div style="display: table-cell; text-align: left; padding: 4px; vertical-align: middle;">' + casedateDisplay + '</div>'));
					$(backwardRow).append($('<div style="display: table-cell; text-align: left; vertical-align: middle;">' + backward.Case_BodyPart + '</div>'));
					let dicomCmdCell = $('<div style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></div>');
					$(dicomCmdCell).append($(dicomCmdBox));
					$(backwardRow).append($(dicomCmdCell));
					let hrBackwardCell = $('<div style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></div>');
					$(hrBackwardCell).append($(patientHRBackwardBox));
					$(backwardRow).append($(hrBackwardCell));
					let responseBackwardCell = $('<div style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></div>');
					$(responseBackwardCell).append($(responseBackwardBox));
					$(backwardRow).append($(responseBackwardCell));
					$(backwardRow).append($('<div style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;">-</div>'));
					$(backwardRow).css({'cursor': 'pointer'});
					$(backwardRow).on('dblclick', (evt)=>{
						common.doOpenStoneWebViewer(backward.Case_StudyInstanceUID, backward.hospitalId);
			    });
					$(backwardRow).appendTo($(backwardView));
				}
				setTimeout(()=> {
					resolve2($(backwardView));
				}, 500);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreatePatientBackward = function(backwards, patientFullName, currentCaseId) {
		return new Promise(async function(resolve, reject) {
			let backwardBox = $('<div style="100%"></div>');
			let titleBox = $('<div style="100%"></div>');
			$(titleBox).appendTo($(backwardBox));
			let titleText = $('<div><b>ประวัติการตรวจ</b></div>');
			$(titleText).appendTo($(titleBox));

			let backwardView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			$(backwardView).appendTo($(backwardBox));

			let limitToggle = doCreateToggleSwitch(patientFullName, backwardView, currentCaseId);
			$(limitToggle).appendTo($(titleBox));
			$(limitToggle).css({'display': 'inline-block', 'float': 'right'});

			let backwardContentView = await doCreateBackwardItem(patientFullName, backwards, backwardView);
			$(backwardBox).append($(backwardContentView));
			resolve($(backwardBox));
		});
	}

	const doCreateSummaryFirstLine = function(selectedCase, patientFullName){
		let summaryFirstLine = $('<div></div>');
		$(summaryFirstLine).append($('<span><b>HN:</b> </span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px; color: black;">' + selectedCase.case.patient.Patient_HN + '</span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px;"><b>Name:</b> </span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px; color: black;">' + patientFullName + '</span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px;"><b>Age/sex:</b> </span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px; color: black;">' + selectedCase.case.patient.Patient_Age + '/' + selectedCase.case.patient.Patient_Sex + '</span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px;"><b>โรงพยาบาล:</b> </span>'));
		$(summaryFirstLine).append($('<span style="margin-left: 4px; color: black;">' + selectedCase.case.hospital.Hos_Name + '</span>'));

		let caseCreateAt = util.formatDateTimeStr(selectedCase.case.createdAt);
		let casedatetime = caseCreateAt.split(' ');
		let casedateSegment = casedatetime[0].split('-');
		casedateSegment = casedateSegment.join('');
		let casedate = casedateSegment;
		casedateSegment = casedatetime[1].split(':');
		let casetime = casedateSegment.join('');

		let patientHN = selectedCase.case.patient.Patient_HN;
		let downloadData = {caseId: selectedCase.case.id, patientId: selectedCase.case.patient.id, studyID: selectedCase.case.Case_OrthancStudyID, casedate: casedate, casetime: casetime, hospitalId: selectedCase.case.hospitalId, dicomzipfilename: selectedCase.case.Case_DicomZipFilename, userId: selectedCase.case.userId};
		downloadData.caseScanParts = selectedCase.case.Case_ScanPart;
		downloadData.patientFullName = patientFullName;
		downloadData.patientHN = patientHN;
		downloadData.Owner = selectedCase.Owner;

		let ownerCaseFullName = selectedCase.Owner.User_NameTH + ' ' + selectedCase.Owner.User_LastNameTH;
		let ownerCaseFullNameLink = $('<a></a>').text(ownerCaseFullName).css({'color': 'blue', 'text-decoration': 'underline', 'cursor': 'pointer'});
		$(ownerCaseFullNameLink).data('misstakeCaseData', downloadData);
		$(ownerCaseFullNameLink).on('click', onMisstakeCaseNotifyCmdClick);
		let ownerCaseInfoBox = $('<div></div>').css({'position': 'relative', 'display': 'inline-block', 'text-align': 'right', 'float': 'right'});
		$(ownerCaseInfoBox).append($('<b>ผู้ส่งเคส: </b>')).append($(ownerCaseFullNameLink))
		$(summaryFirstLine).append($(ownerCaseInfoBox));
		$(summaryFirstLine).css(common.pageLineStyle);
		return $(summaryFirstLine);
	}

	const doCreateSummaryDF = function(df){
		let summaryDF = $('<div style="padding: 5px;"></div>').css({'border': '1px solid black'});
		let total = 0;
		let summaryTable = $('<table width="100%" border="0" cellspacing="0" cellpadding="0"></table>').css({'border-collapse': 'collapse'});
		let headerRow = $('<tr></tr>');
		let headerCell = $('<td colspan="2" align="left"><b>Scan Part</b></td>');
		$(headerRow).append($(headerCell));
		$(summaryTable).append($(headerRow));
		let i = undefined;
		for (let i=0; i < df.length; i++){
			let row = $('<tr></tr>');
			let dfName = undefined;
			if (df[i].DF.type == 'night'){
				dfName = df[i].Name + ' (เวรดึก)';
			} else {
				dfName = df[i].Name;
			}
			let nameCell = $('<td width="90%" align="left">' + dfName + '</td>');
			let priceCell = $('<td width="*" align="right" style="padding-right: 10px;">' + df[i].DF.value + '</td>');
			total += Number(df[i].DF.value);
			$(row).append($(nameCell)).append($(priceCell));
			$(summaryTable).append($(row));
		}
		let blankRow = $('<tr><td colspan="2">&nbsp;</td></tr>').css({'min-height': '23px'});
		if (df.length == 0) {
			$(summaryTable).append($(blankRow)).append($(blankRow)).append($(blankRow));
		} else if (df.length == 1) {
			$(summaryTable).append($(blankRow)).append($(blankRow));
		} else if (df.length == 2) {
			$(summaryTable).append($(blankRow));
		}
		let totalRow = $('<tr></tr>').css({'border-top': '1px solid black', 'border-bottom': '1px solid black'});
		let totalNameCell = $('<td align="left" valign="bottom"><b>รวม</b></td>');
		let totalPriceCell = $('<td align="right" valign="bottom" style="padding-right: 10px;"><b>' + total + '</b></td>');
		$(totalRow).append($(totalNameCell)).append($(totalPriceCell))
		$(summaryTable).append($(totalRow));
		return $(summaryDF).append($(summaryTable));
	}

	const doCreateSummarySecondLine = function(selectedCase, patientFullName, casedate, casetime){
		return new Promise(async function(resolve, reject) {
			let summarySecondLine = $('<div></div>');
			let summarySecondArea = $('<table width="100%" border="0" cellspacing="0" cellpadding="0"></table>');
			let summarySecondAreaRow = $('<tr></tr>');
			let summarySecondAreaLeft = $('<td width="31%" align="left" valign="top"></td>');
			let summarySecondAreaMiddle1 = $('<td width="20%" align="center" valign="top"></td>');
			let summarySecondAreaMiddle2 = $('<td width="23%" align="center" valign="top"></td>');
			let summarySecondAreaMiddle3 = $('<td width="15%" align="left" valign="top">&nbsp;</td>');
			let summarySecondAreaRight = $('<td width="*" align="center" valign="top"></td>');
			$(summarySecondAreaRow).append($(summarySecondAreaLeft)).append($(summarySecondAreaMiddle1)).append($(summarySecondAreaMiddle2)).append($(summarySecondAreaMiddle3)).append($(summarySecondAreaRight));
			$(summarySecondArea).append($(summarySecondAreaRow));
			$(summarySecondLine).append($(summarySecondArea));

			let caseScanParts = selectedCase.case.Case_ScanPart;
			let summaryDF = doCreateSummaryDF(caseScanParts);
			$(summarySecondAreaLeft).append($(summaryDF));

			let buttonCmdArea = $('<div style="padding: 5px;"></div>');
			let buttonCmdTable = $('<table width="100%" border="0" cellspacing="0" cellpadding="0"></table>');
			let buttonCmdRow1 = $('<tr></tr>');
			/*
			let buttonCmdRow2 = $('<tr></tr>');
			let buttonCmdRow3 = $('<tr></tr>');
			*/
			let downloadCmdCell = $('<td width="30%" align="center"></td>');
			/*
			let blankCell = $('<td align="left"><div style="wisth: 100%; min-height: 30px;"></div></td>');
			let open3rdPartyCmdCell = $('<td align="left"></td>');
			*/
			$(buttonCmdRow1).append($(downloadCmdCell));
			/*
			$(buttonCmdRow2).append($(blankCell));
			$(buttonCmdRow3).append($(open3rdPartyCmdCell));
			*/
			$(buttonCmdTable).append($(buttonCmdRow1))/*.append($(buttonCmdRow2)).append($(buttonCmdRow3))*/;
			$(buttonCmdArea).append($(buttonCmdTable));
			$(summarySecondAreaMiddle1).append($(buttonCmdArea));
			let downloadCmd = $('<input type="button" value=" Download " id="DownloadDicomZipCmd" class="action-btn" style="cursor: pointer; width: 110px;"/>');
			let patientFullName = selectedCase.case.patient.Patient_NameEN + ' ' + selectedCase.case.patient.Patient_LastNameEN;
			let patientHN = selectedCase.case.patient.Patient_HN;
			let downloadData = {caseId: selectedCase.case.id, patientId: selectedCase.case.patient.id, studyID: selectedCase.case.Case_OrthancStudyID, casedate: casedate, casetime: casetime, hospitalId: selectedCase.case.hospitalId, dicomzipfilename: selectedCase.case.Case_DicomZipFilename, userId: selectedCase.case.userId};
			downloadData.caseScanParts = caseScanParts;
			downloadData.patientFullName = patientFullName;
			downloadData.patientHN = patientHN;
			downloadData.Owner = selectedCase.Owner;

			$(downloadCmd).attr('title', 'Download zip file of ' + patientFullName);
			$(downloadCmd).data('downloadData', downloadData);
			$(downloadCmd).on('click', async (evt)=>{
				if (evt.ctrlKey) {
					await doStartAutoDownloadDicom(downloadCmd);
				} else {
					/*
					let foundItem = await common.downloadDicomList.find((item, i) =>{
						if (item === downloadData.dicomzipfilename) {
							return item;
						}
					});
					if ((foundItem) && (foundItem === downloadData.dicomzipfilename)) {
						let msgDiv = $('<p></p>').text(downloadData.dicomzipfilename + ' completed.')
						let msgBox = doCreateCustomNotify('ประวัติการดาวน์โหลด', msgDiv, ()=>{
							onOpenThirdPartyCmdClick();
						});
						$('body').append($(msgBox).css({'position': 'absolute', 'top': '50px', 'right': '2px', 'width' : '260px', 'border': '2px solid black', 'background-color': '#184175', 'color': 'white', 'padding': '5px'}))
					} else {
						let dwnList = doDownloadDicom(evt, downloadData.dicomzipfilename);
					}
					*/
					let dwnList = doDownloadDicom(evt, downloadData.dicomzipfilename);
				}
			});
			$(downloadCmd).appendTo($(downloadCmdCell));

			if ((selectedCase.case.Case_PatientHRLink) && (selectedCase.case.Case_PatientHRLink.length > 0)) {
				let patientHRBox = await doRenderPatientHR(selectedCase.case.Case_PatientHRLink, patientFullName, casedate);
				$(summarySecondAreaMiddle2).append($(patientHRBox));
			}

			let misstakeCaseNotifyCmd = $('<input type="button" value=" แจ้งเคสผิดพลาด " class="action-btn" style="cursor: pointer; margin-left: 0px"/>');
			$(misstakeCaseNotifyCmd).data('misstakeCaseData', downloadData);
			$(misstakeCaseNotifyCmd).on('click', onMisstakeCaseNotifyCmdClick);

			let misstakeCaseNotifyBox = $('<div style="width: 100%; padding: 5px;"></div>');
			let misstakeCaseNotifyTable = $('<table width="100%" border="0" cellspacing="0" cellpadding="0"></table>');
			$(misstakeCaseNotifyBox).append($(misstakeCaseNotifyTable));
			let misstakeCaseNotifyRow = $('<tr></tr>');
			let misstakeCaseNotifyCell = $('<td width="100%" align="center"></td>');
			$(misstakeCaseNotifyRow).append($(misstakeCaseNotifyCell))
			$(misstakeCaseNotifyCell).append($(misstakeCaseNotifyCmd));
			$(misstakeCaseNotifyTable).append($(misstakeCaseNotifyRow));
			$(summarySecondAreaRight).append($(misstakeCaseNotifyBox));
			resolve($(summarySecondLine));
		});
	}

  const doCreateSummaryDetailCase = function(caseOpen){
    return new Promise(async function(resolve, reject) {
      let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
			$('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
			$('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
			let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
			$('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

			const selectedCase = caseOpen.selectedCase.Records[0];
			caseHospitalId = selectedCase.case.hospitalId;
			casePatientId = selectedCase.case.patientId;
			caseId = selectedCase.case.id;

			let caseCreateAt = util.formatDateTimeStr(selectedCase.case.createdAt);
			let casedatetime = caseCreateAt.split(' ');
			let casedateSegment = casedatetime[0].split('-');
			casedateSegment = casedateSegment.join('');
			let casedate = casedateSegment;
			casedateSegment = casedatetime[1].split(':');
			let casetime = casedateSegment.join('');

      const userdata = JSON.parse(localStorage.getItem('userdata'));
			const patientFullName = selectedCase.case.patient.Patient_NameEN + ' ' + selectedCase.case.patient.Patient_LastNameEN;
			//let limit = 2;
			//let patientBackward = await doLoadPatientBackward(caseHospitalId, casePatientId, backwardCaseStatus, caseId, limit);
			let patientBackward = caseOpen.patientFilter;
			let patientBackwardView = undefined;
			if (patientBackward.Records.length > 0) {
				patientBackwardView = await doCreatePatientBackward(patientBackward.Records, patientFullName, caseId);
			} else {
				patientBackwardView = $('<div style="100%"><span><b>ไม่พบประวัติการตรวจ</b></span></div>');
			}

      let summary = $('<div style="position: relative; width: 98%; margin-left: 2px;"></div>');
			let summaryFirstLine = doCreateSummaryFirstLine(selectedCase, patientFullName);
      $(summary).append($(summaryFirstLine));

			let summarySecondLine = await doCreateSummarySecondLine(selectedCase, patientFullName, casedate, casetime);
      //$(summarySecondLine).css(common.pageLineStyle);
      $(summary).append($(summarySecondLine));

			let summaryThirdLine = $('<div></div>');
			$(summaryThirdLine).append($(patientBackwardView));
			$(summaryThirdLine).css(common.pageLineStyle);
			$(summaryThirdLine).appendTo($(summary));


			let contactToolsLine = $('<div style="width: 99%; min-height: 80px;"></div>');
			let contactContainer = chatman.doCreateContactContainer(caseId, selectedCase);
			$(contactToolsLine).append($(contactContainer));
			$(contactToolsLine).css(common.pageLineStyle);
			$(contactToolsLine).appendTo($(summary));
			if (selectedCase.case.casestatusId != 14){
				$(contactToolsLine).css('display', 'none');
			}

      let summaryFourthLine = $('<div></div>');
      $(summaryFourthLine).append($('<span><b>Template:</b> </span>'));
      let templateSelector = $('<select id="TemplateSelector"></select>');
			$(templateSelector).append('<option value="0">เลือก Template ของฉัน</option>');

			let yourTemplates = undefined;
			if (caseOpen.templateOptons) {
				yourTemplates = caseOpen.templateOptons;
				yourTemplates.Options.push({Value: 0, DisplayText: 'Template ทั้งหมด'});
			} else if (caseOpen.allTemplates) {
				yourTemplates = caseOpen.allTemplates;
			} else {
				yourTemplates = {Options: [{Value: -1, DisplayText: 'Not Found Your Template'}]}
			}
      if (yourTemplates.Options.length > 0) {
        yourTemplates.Options.forEach((item, i) => {
          $(templateSelector).append('<option value="' + item.Value + '">' + item.DisplayText + '</option>');
        });
      }

      $(templateSelector).on('change', onTemplateSelectorChange);
      $(templateSelector).appendTo($(summaryFourthLine));
			$(summaryFourthLine).append($('<span>  </span>'));
			let addNewTemplateCmd = $('<input type="button" id="AddNewTemplateCmd" value=" + Save New Template " class="action-btn"/>');
			let newTemplateData = {hospitalmap: yourTemplates.Options[0].hospitalmap, Hospitals: [{id: caseHospitalId}], Modality: selectedCase.case.Case_Modality, StudyDescription: selectedCase.case.Case_StudyDescription, ProtocolName: selectedCase.case.Case_ProtocolName};
			$(addNewTemplateCmd).data('newTemplateData', newTemplateData);

			$(addNewTemplateCmd).hide();
			$(addNewTemplateCmd).appendTo($(summaryFourthLine));
			$(addNewTemplateCmd).on('click', onAddNewTemplateCmdClick)
      $(summaryFourthLine).css(common.pageLineStyle);
      $(summaryFourthLine).appendTo($(summary));

			let simpleEditorBox = $('<div id="SimpleEditorBox"></div>');
      let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
      $(simpleEditor).appendTo($(simpleEditorBox));

			backupDraftCounter = 0;
			let keypressCount = 0;
			/**********************************************/
			const simpleEditorChangeEvt = function(evt){
				if (keypressCount == 5){
					let responseHTML = $('#SimpleEditor').val();
					let draftbackup = {caseId: caseId, content: responseHTML, backupAt: new Date()};
					localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
					keypressCount = 0;
					//doResetPingCounterOnOpenCase();
				} else {
					keypressCount += 1;
				}
			}
			$(simpleEditorBox).bind('keypress', function(evt) {
				//simpleEditorChangeEvt(evt);
			});
			/**********************************************/

			let simpleEditorConfig = $.extend({/*change: simpleEditorChangeEvt */}, common.jqteConfig);
      $(simpleEditor).jqte(simpleEditorConfig);
      $(simpleEditorBox).appendTo($(summary));
			$(simpleEditorBox).data('casedata', {caseId: caseId, caseResponseId: caseResponseId, caseHospitalId: caseHospitalId, casePatientId: casePatientId });
			//console.log(caseOpen);

			let createNewResponseCmd = $('<input type="button" value=" ส่งผลอ่าน " class="action-btn"/>');
			let createNewResponseData = {caseId: caseId, hospitalId: caseHospitalId, patientFullName: patientFullName, casedate: casedate, casetime: casetime, reporttype: caseOpen.reportType, resultFormat: caseOpen.resultFormat, previewOption: caseOpen.previewOption};
			$(createNewResponseCmd).data('createNewResponseData', createNewResponseData);
			$(createNewResponseCmd).on('click', onCreateNewResponseCmdClick);

			let saveDraftResponseCmd = $('<input type="button" class="none-action-btn" value=" Draft "/>');
			let saveDraftResponseData = {caseId: caseId, patientFullName: patientFullName, casedate: casedate, type: 'draft'};
			if (caseResponseId) {
				saveDraftResponseData.caseResponseId = caseResponseId;
			}
			$(saveDraftResponseCmd).data('saveDraftResponseData', saveDraftResponseData);
			$(saveDraftResponseCmd).on('click', onSaveDraftResponseCmdClick);

			let backToOpenCaseCmd = $('<input type="button" class="none-action-btn" value=" กลับ "/>');
			let backToOpenCaseData = {};
			$(backToOpenCaseCmd).data('backToOpenCaseData', backToOpenCaseData);
			$(backToOpenCaseCmd).on('click', onBackToOpenCaseCmdClick);

			let summaryFifthLine = $('<div></div>');
			$(summaryFifthLine).css(common.pageLineStyle);
			$(summaryFifthLine).css({'text-align': 'center'});
			$(summaryFifthLine).append($(createNewResponseCmd));
			$(summaryFifthLine).append($('<span>  </span>'));
			$(summaryFifthLine).append($(saveDraftResponseCmd));
			$(summaryFifthLine).append($('<span>  </span>'));
			$(summaryFifthLine).append($(backToOpenCaseCmd));
			$(summaryFifthLine).appendTo($(summary));

			//console.log(caseResponseId);
			let draftBackup = doRestoreDraft(caseId);

			if (selectedCase.case.casestatusId == 8){
				if (yourTemplates.Content) {
					$(summary).find('#SimpleEditor').jqteVal(yourTemplates.Content);
					//auto Save to cache
					let draftbackup = {caseId: caseId, content: yourTemplates.Content, backupAt: new Date()};
					localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
				}
				if ((draftBackup) && (draftBackup.content)){
					doConfirmUpdateFromCache(summary, draftBackup.content);
				}
			} else {
				const youCan = [5, 6, 8, 9, 10, 11, 12, 13, 14];
				let canEditResponse = util.contains.call(youCan, selectedCase.case.casestatusId);
				if (canEditResponse) {
					let draftResponseRes = caseOpen.caseResponse;
					//console.log(draftResponseRes);
					if (draftResponseRes.Record.length > 0) {
						caseResponseId = draftResponseRes.Record[0].id;
						$(summary).find('#SimpleEditor').jqteVal(draftResponseRes.Record[0].Response_HTML);
						let resType = draftResponseRes.Record[0].Response_Type;
						if ((resType === 'draft') || (resType === 'normal')) {
							let cloudUpdatedAt = new Date(draftResponseRes.Record[0].updatedAt);
							if ((draftBackup) && (draftBackup.content !== '')) {
								let localUpdateAt = new Date(draftBackup.backupAt);
								//console.log(cloudUpdatedAt);
								//console.log(localUpdateAt);
								if (localUpdateAt.getTime() > cloudUpdatedAt.getTime()) {
									doConfirmUpdateFromCache(summary, draftBackup.content);
								} else {
									$(summary).find('#SimpleEditor').jqteVal(draftResponseRes.Record[0].Response_HTML);
								}
							} else {
								$(summary).find('#SimpleEditor').jqteVal(draftResponseRes.Record[0].Response_HTML);
							}
						}
					} else {
						if (draftBackup){
							if ((draftBackup.content) && (draftBackup.content !== '')) {
								$(summary).find('#SimpleEditor').jqteVal(draftBackup.content);
							}
						}
					}
				}
			}

			if (syncTimer){
				window.clearTimeout(syncTimer);
			}
			//syncTimer = doCreateSyncBGTimer(60);

      resolve($(summary));
    });
  }

	const doConfirmUpdateFromCache = function(summary, cacheContent) {
		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<p>พบผลอ่านใน cache ที่ใหม่กว่าบน server ต้องการกู้ข้อมูลผลอ่านมาใส่หรือไม่</p>'));
		let backupView = $('<div style="width: 100%; height: 220px; overflow: scroll; background-color: #ccc;"></div>');
		$(backupView).html(cacheContent);
		$(backupView).css({'font-family': 'Arial, Helvetica, sans-serif', 'font-size': '16px'});
		$(radAlertMsg).append($(backupView));
		const radconfirmoption = {
			title: 'โปรดยืนยันการกู้ข้อมูลผลอ่านจาก cache',
			msg: $(radAlertMsg),
			width: '420px',
			onOk: function(evt) {
				//$('body').loading('start');
				$(summary).find('#SimpleEditor').jqteVal(cacheContent);
				//$('body').loading('stop');
				radConfirmBox.closeAlert();
			},
			onCancel: function(evt){
				let yourConfirm = confirm('คุณต้องการล้างข้อมูลใน Cache ด้วย่หรือไม่?');
				if (yourConfirm == true){
					localStorage.removeItem('draftbackup');
				}
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  const doCallMyOpenCase = function(caseData){
    return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let smartTmpFilter = {Modality: caseData.Modality, StudyDescription: caseData.StudyDescription, ProtocolName: caseData.ProtocolName, Hospitals: [caseData.hospitalId]};
			let rqParams = {caseId: caseData.caseId, radioId: userId, hospitalId: caseData.hospitalId, patientId: caseData.patientId, statusId: backwardCaseStatus, currentCaseId: caseData.caseId, smartTemplateFilter: smartTmpFilter, limit: 2};
			//let apiUrl = '/api/cases/select/' + caseId;
			//console.log(rqParams);
			let apiUrl = '/api/uicommon/radio/createresult';
			try {
				//let response = await common.doCallApi(apiUrl, rqParams);
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  const doLoadTemplateList = function(radioId) {
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/template/options/' + radioId;
			var params = {};
			//$.post(apiUri, params, function(response){
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

  const doLoadTemplate = function(templateId) {
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/template/select/' + templateId;
			var params = {};
			//$.post(apiUri, params, function(response){
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doLoadPatientBackward = function(hospitalId, patientId, statusIds, currentCaseId, limit) {
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/cases/filter/patient';
			var params = {statusId: statusIds, patientId: patientId, hospitalId: hospitalId, currentCaseId: currentCaseId};
			if ((limit) && (limit > 0)) {
				params.limit = limit;
			}
			//$.post(apiUri, params, function(response){
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doCallSaveResponse = function(params){
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/caseresponse/save';
			console.log(params);
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doCallSaveResult = function(params){
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/uicommon/radio/saveresult';
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				localStorage.removeItem('draftbackup');
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doCallSubmitResult = function(params){
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/uicommon/radio/submitresult';
			//apiconnector.doCallApi(apiUri, params).then((response)=>{
			apiconnector.doCallApiDirect(apiUri, params).then((response)=>{
				localStorage.removeItem('draftbackup');
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doCallDraftRespons = function(caseId){
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/caseresponse/select/' + caseId;
			var params = {caseId: caseId};
			//$.post(apiUri, params, function(response){
			apiconnector.doCallApi(apiUri, params).then((response)=>{
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

  const doCreateOpenCasePage = function(caseData) {
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
      let myOpenCase = await doCallMyOpenCase(caseData);
			if (myOpenCase.status.code == 200){
	      let myOpenCaseView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
				let caseSummaryDetail = await doCreateSummaryDetailCase(myOpenCase.result);
				$(myOpenCaseView).append($(caseSummaryDetail));
	      resolve($(myOpenCaseView));
				let casestatusId = caseData.statusId;
				if (caseData.startDownload == 1) {
					let downloadDicomZipCmd = $(caseSummaryDetail).find('#DownloadDicomZipCmd');
					if (downloadDicomZipCmd) {
						let downloadData = $(downloadDicomZipCmd).data('downloadData');
						let dicomzipfilename = downloadData.dicomzipfilename;
						let foundItem = await common.downloadDicomList.find((item, i) =>{
							if (item === dicomzipfilename) {
								return item;
							}
						});
						if ((foundItem) && (foundItem === dicomzipfilename)) {
							doChangeStateDownloadDicomCmd(downloadDicomZipCmd);
							let msgDiv = $('<p></p>').text(dicomzipfilename + ' completed.')
							let msgBox = doCreateCustomNotify('ประวัติการดาวน์โหลด', msgDiv, ()=>{
								/*
								let newEvt = jQuery.Event("click");
								newEvt.ctrlKey = true;
								$(downloadDicomZipCmd).trigger(newEvt);
								*/
								onOpenThirdPartyCmdClick();
							});
							//$.notify($(msgBox).html(), {position: 'top right', autoHideDelay: 20000, clickToHide: true, style: 'myshopman', className: 'base'});
							$('body').append($(msgBox).css({'position': 'absolute', 'top': '60px', 'right': '2px', 'width' : '260px', 'border': '2px solid black', 'background-color': '#2579B8', 'color': 'white', 'padding': '5px'}))
						} else {
							let dwnRes = await doStartAutoDownloadDicom(downloadDicomZipCmd);
						}

					} else {
						let apiError = 'api error at doCallMyOpenCase';
						reject({error: apiError});
					}
				}
				/*
				let firstLink = '/images/case-incident-icon-3.png'
				window.fetch(firstLink, {method: 'GET'}).then(response => response.blob()).then(blob => {
		      let url = window.URL.createObjectURL(blob);
		      $("#TitleContent").find('img').attr('src', url);
		    });
				*/
			} else if (myOpenCase.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyOpenCase';
				reject({error: apiError});
			}
    });
  }

	const doStartAutoDownloadDicom = function(downloadDicomZipCmd){
		return new Promise(async function(resolve, reject) {
			let dwnRes = await onDownloadCmdClick(downloadDicomZipCmd);
			doChangeStateDownloadDicomCmd(downloadDicomZipCmd);
			//onOpenThirdPartyCmdClick();
			let downloadData = $(downloadDicomZipCmd).data('downloadData');
			let dicomzipfilename = downloadData.dicomzipfilename;
			let msgDiv = $('<p></p>').text(dicomzipfilename + ' completed.');
			let msgBox = doCreateCustomNotify('ประวัติการดาวน์โหลด', msgDiv, ()=>{
				/*
				let newEvt = jQuery.Event("click");
				newEvt.ctrlKey = true;
				$(downloadDicomZipCmd).trigger(newEvt);
				*/
				onOpenThirdPartyCmdClick();
			});
			//$.notify($(msgBox).html(), {position: 'top right', autoHideDelay: 20000, clickToHide: true, style: 'myshopman', className: 'base'});
			$('body').append($(msgBox).css({'position': 'absolute', 'top': '60px', 'right': '2px', 'width' : '260px', 'border': '2px solid black', 'background-color': '#2579B8', 'color': 'white', 'padding': '5px'}));
			resolve();
		});
	}

	const doChangeStateDownloadDicomCmd = function(downloadDicomZipCmd){
		$(downloadDicomZipCmd).off('click');
		$(downloadDicomZipCmd).attr('title', 'Ctrl+click to open with 3rd party program');
		$(downloadDicomZipCmd).val(' DL/Open ');
		$(downloadDicomZipCmd).removeClass('action-btn');
		$(downloadDicomZipCmd).addClass('special-action-btn');
		let downloadData = $(downloadDicomZipCmd).data('downloadData');
		let dicomzipfilename = downloadData.dicomzipfilename;

		$(downloadDicomZipCmd).on('click', async (evt)=>{
			if (evt.ctrlKey) {
				// Ctrl Click start open third party dicom view
				//onOpenThirdPartyCmdClick();

				let foundItem = await common.downloadDicomList.find((item, i) =>{
					if (item === dicomzipfilename) {
						return item;
					}
				});
				if ((foundItem) && (foundItem === dicomzipfilename)) {
					let msgDiv = $('<p></p>').text(dicomzipfilename + ' completed.')
					let msgBox = doCreateCustomNotify('ประวัติการดาวน์โหลด', msgDiv, ()=>{
						onOpenThirdPartyCmdClick();
					});
					$('body').append($(msgBox).css({'position': 'absolute', 'top': '50px', 'right': '2px', 'width' : '260px', 'border': '2px solid black', 'background-color': '#184175', 'color': 'white', 'padding': '5px'}))
				} else {
					//let dwnList = doDownloadDicom(evt, downloadData.dicomzipfilename);
					let dwnRes = await doStartAutoDownloadDicom(downloadDicomZipCmd);
				}

			} else {
				//normal click normal download
				//dwnRes = await onDownloadCmdClick(downloadDicomZipCmd);
				let downloadList = doDownloadDicom(evt, dicomzipfilename);
			}
		});
	}

	const doBackupDraft = function(caseId, content){
		return new Promise(async function(resolve, reject) {
			let draftbackup = {caseId: caseId, content: content, backupAt: new Date()};
			localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
			console.log(backupDraftCounter);
			let modulusCount = (backupDraftCounter % 20);
			console.log(modulusCount);
			let saveDraftRes = undefined;
			if (backupDraftCounter == 1) {
				let saveDraftResponseData = {type: 'draft', caseId: caseId};
				saveDraftRes = await doSaveDraft(saveDraftResponseData);
				console.log(saveDraftRes);
				if (saveDraftRes.status.code == 200){
					backupDraftCounter += 1;
					caseResponseId = saveDraftRes.result.responseId;
					if (!caseResponseId) {
						$.notify("เกิดความผิดพลาด Case Response API", "error");
					}
				} else {
					$.notify("ไม่สามารถบันทึก Draft - Error โปรดติดต่อผู้ดูแลระบบ", "error");
				}
			} else if (modulusCount == 0) {
				let saveDraftResponseData = {type: 'draft', caseId: caseId};
				saveDraftRes = await doSaveDraft(saveDraftResponseData);
				console.log(saveDraftRes);
				if (saveDraftRes.status.code == 200){
					backupDraftCounter += 1;
					caseResponseId = saveDraftRes.result.responseId;
					if (!caseResponseId) {
						$.notify("เกิดความผิดพลาด Case Response API", "error");
					}
				} else {
					$.notify("ไม่สามารถบันทึก Draft - Error โปรดติดต่อผู้ดูแลระบบ", "error");
				}
			} else {
				//backupDraftCounter += 1;
			}
			let isShowNewTemplateCmd = $('#AddNewTemplateCmd').css('display');
			if (isShowNewTemplateCmd === 'none') {
				$('#AddNewTemplateCmd').show();
			}
			//doResetPingCounterOnOpenCase();
			resolve(draftbackup);
		});
	}

	const doRestoreDraft = function(caseId){
		let draftbackup = JSON.parse(localStorage.getItem('draftbackup'));
		if((draftbackup) && (draftbackup.caseId == caseId)){
			return draftbackup;
		} else {
			return;
		}
	}

	const doViewBackupDraft = function(draftHTML){
		let backupDrafBox = $('<div></div>');
		$('#quickreply').css(common.quickReplyDialogStyle);
		//$(backupDrafBox).css(common.quickReplyContentStyle);
		$('#quickreply').append($(backupDrafBox));
		let htmlView = $('<div></div>');
		$(htmlView).html(draftHTML);
		$(htmlView).appendTo($(backupDrafBox));
		let closeCmd = $('<input type="button" value=" Close"/>');
		$(closeCmd).appendTo($(backupDrafBox));
		$(closeCmd).on('click', (evt)=>{
			$('#quickreply').empty();
			$('#quickreply').removeAttr('style');
		});
	}

	const doCreateSyncBGTimer = function(ssDelay){
		let webworker = new Worker("../lib/response-sync-webworker.js");
	  webworker.addEventListener("message", function(event) {
	    let evtData = event.data;
	    if (evtData.type === 'syncsuccess'){
				console.log(evtData.data);
			} else if (evtData.type === 'notsync'){
				console.log('notsync');
			}
		});
		let timer = window.setTimeout(()=>{
			onSyncBGTimerEvent(ssDelay, webworker);
		}, ssDelay * 1000);
		return timer;
	}

	const onSyncBGTimerEvent = function(ssDelay, webworker){
		if (syncTimer) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let responseHTML = $('#SimpleEditor').val();
			if ((responseHTML) && (responseHTML !== '')){
				let responseText = toAsciidoc(responseHTML);
				let saveData = {Response_HTML: responseHTML, Response_Text: responseText, Response_Type: 'draft'};
				let params = {caseId: caseId, userId: userId, data: saveData, responseId: caseResponseId};

				let token = localStorage.getItem('token');
				let synmessageCmd = {type: 'startsync', params: params, token: token}
			  webworker.postMessage(synmessageCmd);
				window.clearTimeout(syncTimer);
				syncTimer = window.setTimeout(()=>{
					onSyncBGTimerEvent(ssDelay, webworker);
				}, ssDelay * 1000);
			}
		}
	}

	const doCalResultHeigth = function(resultHTML, resultWidth, fontsize){
		/*
		A4 Height = 1122.52 px / 297 mm
		ต้องเพิ่ม font-size, line-height ด้วย
		*/
		const fontSize = 11;
		const lineHeight = 20;
		const resultBoxStyle = {'position': 'relative', 'width': '1004px', 'font-family': '"Tahoma", sans-serif', 'font-size': fontSize+'px', 'line-height': lineHeight+'px'};

		let resultBox = $('<div></div>');
		$(resultBox).css(resultBoxStyle);
		$(resultBox).html(resultHTML);
		$('.mainfull').append($(resultBox));
		let rsH = $(resultBox).outerHeight();
		if (rsH < 850) {
			rsH = 850;
		}
		$(resultBox).remove();
		return rsH;
	}

	const getBackupDraftCounter = function(){
		return backupDraftCounter;
	}

	const setBackupDraftCounter = function(value){
		backupDraftCounter = value;
	}

	const setCaseResponseId = function(responseId) {
		caseResponseId = responseId;
	}

	const getCaseResponseId = function() {
		return caseResponseId;
	}

	const doReportBugOpenCase = function(msgJSON, apiErrorURL) {
		const { getFomateDateTime } = require('../../case/mod/utilmod.js')($);
		let dt = new Date();
		let bugDataReport = $('<div></div>');
		$(bugDataReport).append($('<h2 style="text-align: center;"><b>ERROR REPORT</b></h2>'));
		$(bugDataReport).append('<h3>ERROR MESSAGE : ' + JSON.stringify(msgJSON) + '</h3>');
		$(bugDataReport).append($('<h3>API : ' + apiErrorURL + '</h3>'));
		$(bugDataReport).append($('<h3>METHOD : POST</h3>'));
		$(bugDataReport).append($('<h3>Date-Time : ' + getFomateDateTime(dt) + '</h3>'));
		$(bugDataReport).append($('<h5>User Data : ' + JSON.stringify(userdata) + '</h5>'));
		let bugParams = {email: apiconnector.adminEmailAddress, bugreport: bugDataReport.html()};
		apiconnector.doCallReportBug(bugParams).then((reportRes)=>{
			if (reportRes.status.code == 200) {
				$.notify('ระบบฯ ได้รวบรวมข้อผิดพลาดที่เกิดขึ้นส่งไปให้ผู้ดูแลระบบทางอีเมล์แล้ว', 'success');
				//มีข้อผิดพลาด กรุณาแจ้งผู้ดูแลระบบ
			} else if (reportRes.status.code == 500) {
				$.notify('การรายงานข้อผิดพลาดทางอีเมล์เกิดข้อผิดพลาด @API', 'error');
			} else {
				$.notify('การรายงานข้อผิดพลาดทางอีเมล์เกิดข้อผิดพลาด @ไม่ทราบสาเหตุ', 'error');
			}
			//$('body').loading('stop');
		});
	}

	const doCreateCustomNotify = function(title, msgDiv, callback){
	  let msgBox = $('<div></div>');
	  let titleBox = $("<div style='text-align: center; background-color: white; color: black;'></div>");
	  $(titleBox).append($('<h4>' + title + '</h4>'));
	  let bodyBox = $("<div></div>");
		$(bodyBox).append($(msgDiv));
	  //$(bodyBox).append($('<span>คลิกที่ปุ่ม <b>ตกลง</b> เพื่อเปิดภาพและปิดการแจ้งเตือนนี้</span>'));
	  let footerBox = $("<div style='text-align: center; background-color: white; color: black;'></div>");
	  let openCmd = $('<input type="button" value="Open" id="SuccessNotifyCmd"/>');
		$(openCmd).on('click', (evt)=>{
			evt.stopPropagation();
			if (callback) {
				callback();
			}
			$(msgBox).remove();
		});
		let closeCmd = $('<input type="button" value="Close" id="CancelNotifyCmd"/>');
		$(closeCmd).on('click', (evt)=>{
			$(msgBox).remove();
		});
	  $(footerBox).append($(openCmd)).append($(closeCmd).css({'margin-left': '10px'}));
	  return $(msgBox).append($(titleBox)).append($(bodyBox)).append($(footerBox))
	}

	const doResetPingCounterOnOpenCase = function() {
		/*
		let main = require('../main.js');
		let myWsm = main.doGetWsm();
		*/
		let myWsm = util.wsm;
		if (myWsm) {
			myWsm.send(JSON.stringify({type: 'reset', what: 'pingcounter'}));
		}
	}

	const doSaveResponseTextToLocalFile = function(responseText, filname) {
		let pom = document.createElement('a');
		let file = new Blob([responseText], { type: 'text/plain' });
		let stremLink = URL.createObjectURL(file);
		pom.setAttribute('target', "_blank");
		pom.setAttribute('href', stremLink);
		pom.setAttribute('download', filname);
		pom.click();
	}

  return {
		/* Variable Zone */
		caseHospitalId,
		casePatientId,
		caseId,
		caseResponseId,

		backupDraftCounter,

		/*Medthod Zone */
		commandButtonStyle,
    onDownloadCmdClick,
    onOpenStoneWebViewerCmdClick,
    onOpenThirdPartyCmdClick,
    onTemplateSelectorChange,
    doOpenHR,
    doRenderPatientHR,
		doCreatePatientBackward,
    doCreateSummaryDetailCase,
    doCallMyOpenCase,
    doLoadTemplateList,
    doLoadTemplate,
		doLoadPatientBackward,
    doCreateOpenCasePage,
		doBackupDraft,
		doSaveDraft,
		doCreateSyncBGTimer,
		onSyncBGTimerEvent,
		doCalResultHeigth,
		getBackupDraftCounter,
		setBackupDraftCounter,
		setCaseResponseId,
		getCaseResponseId,
		doReportBugOpenCase,
		doResetPingCounterOnOpenCase
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7,"../main.js":11,"./ai-lib.js":13,"./chatmanager.js":15,"./templatelib.js":21}],19:[function(require,module,exports){
/*profilelibV2.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const changepwddlg = require('./changepwddlg.js')($);

  const profileTitle = 'ตั้งค่าการแจ้งเตือนและรับเคส';

  const doCreateProfileTitlePage = function(){
    let profileTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/setting-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(profileTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + profileTitle + '</h3></div>');
    $(titleText).appendTo($(profileTitleBox));
    return $(profileTitleBox);
  }

  const doCreateBlankTable = function(){
    let blankTable = $('<table cellspacing="0" cellpadding="0" border="1" width="100%"></table>');
    let headerRow = $('<tr></tr>');
    let activeRow = $('<tr></tr>');
    let lockRow = $('<tr></tr>');
    let offlineRow = $('<tr></tr>');
		let phoneRetryOptionRow = $('<tr id="PhoneRetryOptionRow"></tr>');
    let commandRow = $('<tr></tr>');

    let activeNameCell = $('<td><b>Active</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let activeControlCell = $('<td id="ActiveControl"></td>');

    let lockNameCell = $('<td><b>Lock</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let lockControlCell = $('<td id="LockControl"></td>');

    let offlineNameCell = $('<td><b>Offline</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let offlineControlCell = $('<td id="OfflineControl"></td>');

		let phoneRetryOptionNameCell = $('<td><b>Phone Calling</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let phoneRetryOptionControlCell = $('<td id="PhoneRetryOptionControl"></td>');

    let commandCell = $('<td colspan="2" id="ProfilePageCmd" align="center"></td>');

    $(headerRow).append($('<td class="header-cell" width="15%">สถานะ</td>'));
    $(headerRow).append($('<td class="header-cell" width="*">ตั้งค่า</td>'));

    $(activeRow).append($(activeNameCell)).append($(activeControlCell));
    $(lockRow).append($(lockNameCell)).append($(lockControlCell));
    $(offlineRow).append($(offlineNameCell)).append($(offlineControlCell));
		$(phoneRetryOptionRow).append($(phoneRetryOptionNameCell)).append($(phoneRetryOptionControlCell));
    $(commandRow).append($(commandCell));
    return $(blankTable).append(headerRow).append($(activeRow)).append($(lockRow)).append($(offlineRow)).append($(phoneRetryOptionRow)).append($(commandRow));
  }

	const onActionCommonHandle = function(evt) {
		console.log('one');
	}

	const offActionCommonHandle = function(evt) {
		console.log('two');
	}

	const onActiveHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#ActiveControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoActiveGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offActiveHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#ActiveControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectActiveHandle(evt);
	}

	const onLockHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#LockControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoLockGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offLockHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#LockControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectLockHandle(evt);
	}

	const onOfflineHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#OfflineControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoOfflineGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offOfflineHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#OfflineControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectOfflineHandle(evt);
	}

	const manSelectActiveHandle = function(evt){
		let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
		doControlPhoneRetryOption();
	}

	const autoSelectActiveHandle = function(evt){
		let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
		doControlPhoneRetryOption();
	}

	const manSelectLockHandle = function(evt){
		let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
		doControlPhoneRetryOption();
	}

	const autoSelectLockHandle = function(evt){
		let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
		doControlPhoneRetryOption();
	}

	const manSelectOfflineHandle = function(evt){
		let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
		doControlPhoneRetryOption();
	}

	const autoSelectOfflineHandle = function(evt){
		let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
		doControlPhoneRetryOption();
	}

	const changePasswordCmdClick = function(evt){
		changepwddlg.doCreateChangePwdDlg();
	}

	const switchOptions = {onActionCallback: onActionCommonHandle, offActionCallback: offActionCommonHandle};
	const activeActions = {onActionCallback: onActiveHandle, offActionCallback: offActiveHandle};
	const lockActions = {onActionCallback: onLockHandle, offActionCallback: offLockHandle};
	const offlineActions = {onActionCallback: onOfflineHandle, offActionCallback: offOfflineHandle};
	const switchStyle = {'position': 'relative', 'top': '5px', 'left': '20px', 'display': 'inline-block'};
	const switchLabelStyle = {'position': 'relative', 'top': '10px', 'margin-left': '5px'};
	const radioLabelStyle = {'position': 'relative', 'top': '-1px', 'margin-left': '15px'};
	const radioBtnStyle = {'transform': 'scale(2.5)'};

	const doControlPhoneRetryOption = function(){
		let allState = doCheckAllManAutoCallOption();
		if ((allState.activeState == 1) && (allState.lockState ==1) && (allState.offlineState ==1)) {
			$('#PhoneRetryOptionRow').hide();
		} else {
			$('#PhoneRetryOptionRow').show();
		}
	}

	const doCheckAllManAutoCallOption = function() {
		let activeState = $('#ActiveControl').find('input[name="ManAutoActiveGroup"]:checked').val();
		let lockState = $('#LockControl').find('input[name="ManAutoLockGroup"]:checked').val();
		let offlineState = $('#OfflineControl').find('input[name="ManAutoOfflineGroup"]:checked').val();
		return {activeState, lockState, offlineState};
	}

	const doCreateManAutoRadioBox = function(groupName, manCallback, autoCallback){
		let wrapperBox = $('<div id="ManAutoOptionBox" style="position: relative; display: inline-block; margin-left: 30px; top: 10px;"></div>');
		let manOptionBtn = $('<input type="radio" id="ManOption" value="1" checked="true"/>').prop('name', groupName).css(radioBtnStyle);
		let autoOptionBtn = $('<input type="radio" id="AutoOption" value="2"/>').prop('name', groupName).css(radioBtnStyle);
		$(manOptionBtn).on('click', (evt)=>{
			manCallback(evt);
		});
		$(autoOptionBtn).on('click', (evt)=>{
			autoCallback(evt);
		});
		$(wrapperBox).append($(manOptionBtn));
		$(wrapperBox).append($('<label>Manual (คน)</label>').css(radioLabelStyle));
		$(wrapperBox).append($(autoOptionBtn).css({'margin-left': '20px'}));
		$(wrapperBox).append($('<label>Auto</label>').css(radioLabelStyle));
		return $(wrapperBox);
	}

	const doCreatePhoneCallOptionControlBox = function(options){
		let wrapperBox = $('<div id="PhoneCallOptionBox" style="position: relative; display: none; top: 10px; padding: 10px; border: 2px solid black;"></div>');
		let option1HRElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ ไม่เกิน 1 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option4HRElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ 1 - 4 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option24HRLElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ ไม่เกิน 24 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option24HRUElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ เกิน 24 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option1HRInput = $('<input type="number" id="Option1HRInput" style="width: 60px;">');
		$(option1HRInput).val(options.optionCaseControl.case1H? options.optionCaseControl.case1H:0);
		let option4HRInput = $('<input type="number" id="Option4HRInput" style="width: 60px;">');
		$(option4HRInput).val(options.optionCaseControl.case4H? options.optionCaseControl.case4H:0);
		let option24HRLInput = $('<input type="number" id="Option24HRLInput" style="width: 60px;">');
		$(option24HRLInput).val(options.optionCaseControl.case24HL? options.optionCaseControl.case24HL:0);
		let option24HRUInput = $('<input type="number" id="Option24HRUInput" style="width: 60px;">');
		$(option24HRUInput).val(options.optionCaseControl.case24HU? options.optionCaseControl.case24HU:0);
		$(option1HRElem).append($(option1HRInput).css({'margin-left': '10px'}));
		$(option1HRElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option4HRElem).append($(option4HRInput).css({'margin-left': '10px'}));
		$(option4HRElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option24HRLElem).append($(option24HRLInput).css({'margin-left': '10px'}));
		$(option24HRLElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option24HRUElem).append($(option24HRUInput).css({'margin-left': '10px'}));
		$(option24HRUElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(option1HRElem)).append($(option4HRElem)).append($(option24HRLElem)).append($(option24HRUElem));
	}

	const doCreateSwitchBox = function(box, switchOptions, defaultValue){
		let switchBox = $(box).readystate(switchOptions);
    if (defaultValue == 1) {
      switchBox.onAction();
    } else {
      switchBox.offAction();
    }
		return switchBox;
	}

	const doCreateWebNotifyContolSwitch = function(initValue){
		let switchLabel = $('<label>แจ้งเตือนทาง Web Site</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="WebNotifySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreateLineBotNotifyContolSwitch = function(initValue){
		let switchLabel = $('<label>แจ้งเตือนทาง Line</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="LineBotNotifySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreatePhoneCallActiveContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, activeActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoActiveGroup', manSelectActiveHandle, autoSelectActiveHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoAcceptSwitch = function(initValue){
		let switchLabel = $('<label>รับเคสอัตโนมัติ</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="AutoAcceptSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreateAutoOnReadySwitch = function(initValue){
		let switchLabel = $('<label>เปลี่ยนสถานะเป็นรับงานเมื่อฉัน Login</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="AutoOnReadySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreatePhoneCallLockContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, lockActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoLockGroup', manSelectLockHandle, autoSelectLockHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoLockScreenControlBox = function(initValue){
		let wrapperBox = $('<div id="AutoLockScreenControlBox" style="position: relative; display: block; top: 10px; padding: 10px;"></div>');
		let controlElem = $('<div style="line-height: 40px;"></div>').append($('<span>เข้าสู่ Mode Lock เมื่อไม่ได้ใช้งาน</span>'));
		let controlInput = $('<input type="number" id="AutoLockScreenMinuteInput" style="width: 60px;">');
		$(controlInput).val(initValue);
		$(controlElem).append($(controlInput).css({'margin-left': '10px'}));
		$(controlElem).append($('<span>นาที (สูงสุด 60)</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(controlElem));
	}

	const doCreateUnLockScreenControlBox = function(initValue, callback){
		let switchLabel = $('<label>ใช้ Password ในการ Unlock</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="UnlockOptionSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));

		let changePasswordCmd = $('<a href="#">เปลี่ยน Password</a>');
		$(changePasswordCmd).on('click', (evt)=>{
			callback(evt);
		});
		$(switchWrapper).append($(changePasswordCmd).css({'position': 'relative', 'display': 'inline-block', 'margin-left': '50px', 'margin-top': '10px'}));
		return $(switchWrapper);
	}

	const doCreatePhoneCallOfflineContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, offlineActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoOfflineGroup', manSelectOfflineHandle, autoSelectOfflineHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoLogoutControlBox = function(initValue){
		let wrapperBox = $('<div id="AutoLogoutControlBox" style="position: relative; display: block; top: 10px; padding: 10px;"></div>');
		let controlElem = $('<div style="line-height: 40px;"></div>').append($('<span>Logout เมื่อไม่ได้ใช้งาน</span>'));
		let controlInput = $('<input type="number" id="AutoLogoutMinuteInput" style="width: 60px;">');
		$(controlInput).val(initValue);
		$(controlElem).append($(controlInput).css({'margin-left': '10px'}));
		$(controlElem).append($('<span>นาที (ต้องมากว่า Lock Screen)</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(controlElem));
	}

	const doCreatePhoneRetryOptionControlBox = function(phoneRetry){
		let wrapperBox = $('<div id="PhoneRetryOptionControlBox" style="position: relative; display: block; top: 10px; padding: 10px;"></div>');
		let phoneRetryOptionTable = $('<table cellspacing="0" cellpadding="0" border="0" width="100%"></table>');
		let noActionControlCaseStatusSelect = $('<select id="NoActionControlCaseStatusSelect"></select>');
		$(noActionControlCaseStatusSelect).append($('<option value="3">ปฏิเสธเคส</option>'));
		$(noActionControlCaseStatusSelect).append($('<option value="0">ไม่ปฏิเสธเคส</option>'));
		$(noActionControlCaseStatusSelect).val(phoneRetry.noactioncasestatus);
		let retrytimeSelect = $('<select id="RetrytimeSelect"></select>');
		$(retrytimeSelect).append($('<option value="0">ไม่โทรซ้ำ</option>'));
		$(retrytimeSelect).append($('<option value="1">โทรซ้ำ 1 ครั้ง</option>'));
		$(retrytimeSelect).append($('<option value="2">โทรซ้ำ 2 ครั้ง</option>'));
		$(retrytimeSelect).append($('<option value="3">โทรซ้ำ 3 ครั้ง</option>'));
		$(retrytimeSelect).append($('<option value="4">โทรซ้ำ 4 ครั้ง</option>'));
		$(retrytimeSelect).append($('<option value="5">โทรซ้ำ 5 ครั้ง</option>'));

		let retrysecondSelect = $('<select id="RetrysecondSelect"></select>').css({'margin-left': '20px', 'display': 'none'});
		$(retrysecondSelect).append($('<option value="60">ภายใน 1 นาที</option>'));
		$(retrysecondSelect).append($('<option value="180">ภายใน 3 นาที</option>'));
		$(retrysecondSelect).append($('<option value="300">ภายใน 5 นาที</option>'));
		$(retrysecondSelect).append($('<option value="600">ภายใน 10 นาที</option>'));
		$(retrysecondSelect).append($('<option value="900">ภายใน 15 นาที</option>'));

		$(retrytimeSelect).on('change', (evt)=>{
			let retrytimeValue = $(retrytimeSelect).val();
			if (retrytimeValue == 0) {
				$(retrysecondSelect).hide();
			} else {
				$(retrysecondSelect).show();
			}
		});
		$(retrysecondSelect).val(phoneRetry.retrysecond);
		$(retrytimeSelect).val(phoneRetry.retrytime).change();

		let noactionRow = $('<tr></tr>').css({'height': '50px'}).append($('<td align="left" width="30%">การทำงานเมื่อกดตัดสาย</td>')).append($('<td align="left" width="*"></td>').append($(noActionControlCaseStatusSelect)));
		let retryRow = $('<tr></tr>').css({'height': '50px'}).append($('<td align="left">การจัดการกรณ๊ไม่ได้รับสาย</td>')).append($('<td align="left"></td>').append($(retrytimeSelect)).append($(retrysecondSelect)));
		$(phoneRetryOptionTable).append($(noactionRow)).append($(retryRow));
		return $(wrapperBox).append($(phoneRetryOptionTable));
	}

  const doCreateProfilePage = function(){
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let myProfileRes = await doCallMyProfile(userdata.id);
			if (myProfileRes.status.code == 200){
				let myProfile = undefined;
	      if ((myProfileRes) && (myProfileRes.Record.length > 0)) {
	        myProfile = myProfileRes.Record[0];
	      } else {
					let getDefaultProfileUrl = '/api/userprofile/default';
					let defaultRes = await common.doGetApi(getDefaultProfileUrl, {});
					let firstProfile = {Profile: defaultRes.default};
	        myProfile = firstProfile;
	      }
				console.log(myProfile);
				let initValue = 1;

	      let myProfilePage = $('<div style="width: 100%;"></div>');

	      let profileTable = doCreateBlankTable();

				let webNotifyBox = doCreateWebNotifyContolSwitch(myProfile.Profile.activeState.webNotify);
				profileTable.find('#ActiveControl').append($(webNotifyBox));

				let linebotNotifyActiveBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.activeState.lineNotify);
				profileTable.find('#ActiveControl').append($(linebotNotifyActiveBox));

				let phoneCallActiveBox = doCreatePhoneCallActiveContolSwitch(myProfile.Profile.activeState.phoneCall, myProfile.Profile.activeState.phoneCallOptions);
				let manAutoOptionAciveBox = $(phoneCallActiveBox).find('#ManAutoOptionBox');
				//console.log(myProfile.Profile.activeState.phoneCall);
				if (myProfile.Profile.activeState.phoneCall == 0){
					$(manAutoOptionAciveBox).hide();
				} else if (myProfile.Profile.activeState.phoneCall == 1){
					$(manAutoOptionAciveBox).show();
				}
				profileTable.find('#ActiveControl').append($(phoneCallActiveBox));

				let autoAcceptOptionBox = doCreateAutoAcceptSwitch(myProfile.Profile.activeState.autoAcc);
				profileTable.find('#ActiveControl').append($(autoAcceptOptionBox));

				let autoOnReadyOptionBox = doCreateAutoOnReadySwitch(myProfile.Profile.activeState.autoReady);
				profileTable.find('#ActiveControl').append($(autoOnReadyOptionBox));

				let linebotNotifyLockBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.lockState.lineNotify);
				profileTable.find('#LockControl').append($(linebotNotifyLockBox));

				let phoneCallLockBox = doCreatePhoneCallLockContolSwitch(myProfile.Profile.lockState.phoneCall, myProfile.Profile.lockState.phoneCallOptions);
				let manAutoOptionLockBox = $(phoneCallLockBox).find('#ManAutoOptionBox');
				if (myProfile.Profile.lockState.phoneCall == 0){
					$(manAutoOptionLockBox).hide();
				} else if (myProfile.Profile.lockState.phoneCall == 1){
					$(manAutoOptionLockBox).show();
				}
				profileTable.find('#LockControl').append($(phoneCallLockBox));

				let autoLockSreenBox = doCreateAutoLockScreenControlBox(myProfile.Profile.lockState.autoLockScreen);
				profileTable.find('#LockControl').append($(autoLockSreenBox));

				let unlockScreenControlBox = doCreateUnLockScreenControlBox(myProfile.Profile.lockState.passwordUnlock, changePasswordCmdClick);
				profileTable.find('#LockControl').append($(unlockScreenControlBox));

				let linebotNotifyOfflineBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.offlineState.lineNotify);
				profileTable.find('#OfflineControl').append($(linebotNotifyOfflineBox));

				let phoneCallOfflineBox = doCreatePhoneCallOfflineContolSwitch(myProfile.Profile.offlineState.phoneCall, myProfile.Profile.offlineState.phoneCallOptions);
				let manAutoOptionOfflineBox = $(phoneCallOfflineBox).find('#ManAutoOptionBox');
				if (myProfile.Profile.offlineState.phoneCall == 0){
					$(manAutoOptionOfflineBox).hide();
				} else if (myProfile.Profile.offlineState.phoneCall == 1){
					$(manAutoOptionOfflineBox).show();
				}
				profileTable.find('#OfflineControl').append($(phoneCallOfflineBox));

				let autoLogoutControlBox = doCreateAutoLogoutControlBox(myProfile.Profile.offlineState.autoLogout);
				profileTable.find('#OfflineControl').append($(autoLogoutControlBox));

				let phoneRetry = myProfile.Profile.phoneRetry;
				if (!phoneRetry){
					phoneRetry = {
						retrytime: 2, //0, 1, 2 ,3 ,4, 5
						retrysecond: 180, //60, 120, 180, 240
						noactioncasestatus: 3 // ถ้าไม่รับสาย หรือ ปฏิเสธสาย จะให้เคสมีสถานะใด 3=reject
					}
				}
				let phoneRetryOptionControlBox = doCreatePhoneRetryOptionControlBox(phoneRetry)
				profileTable.find('#PhoneRetryOptionControl').append($(phoneRetryOptionControlBox));

				let cmdBar = doCreatePageCmd(myProfilePage, (ob)=>{doCallSaveMyProfile(ob);});
				profileTable.find('#ProfilePageCmd').append($(cmdBar));

	      $(myProfilePage).append($(profileTable));
	      resolve($(myProfilePage));
	      //$('body').loading('stop');
			} else if (myProfileRes.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyProfile';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doCreatePageCmd = function(pageHandle, saveCallBack){
    let cmdBar = $('<div style="width: 100%; margin-top: 5px; text-align: center;"></div>');
    let saveCmd = $('<input type="button" value=" Save " class="action-btn"/>');
    let backCmd = $('<input type="button" value=" Back " class="none-action-btn"/>');
    $(saveCmd).appendTo($(cmdBar));
    $(cmdBar).append('&nbsp;&nbsp;');
    $(backCmd).appendTo($(cmdBar));
    $(backCmd).on('click', (evt)=>{$('#AcceptedCaseCmd').click()});
    $(saveCmd).on('click', (evt)=>{
			let activeWebNotify = pageHandle.find('#ActiveControl').find('#WebNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let activeLineNotify = pageHandle.find('#ActiveControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let activePhoneCall = pageHandle.find('#ActiveControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let activeManAutoOption = pageHandle.find('#ActiveControl').find('input[name="ManAutoActiveGroup"]:checked').val();
			let activePhoneCall1H = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let activePhoneCall4H = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let activePhoneCall24HL = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let activePhoneCall24HU = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let activeAutoAcc = pageHandle.find('#ActiveControl').find('#AutoAcceptSwitchBox').find('input[type=checkbox]').prop('checked');
			let activeAutoReady = pageHandle.find('#ActiveControl').find('#AutoOnReadySwitchBox').find('input[type=checkbox]').prop('checked');

			let lockLineNotify = pageHandle.find('#LockControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let lockPhoneCall = pageHandle.find('#LockControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let lockManAutoOption = pageHandle.find('#LockControl').find('input[name="ManAutoLockGroup"]:checked').val();
			let lockPhoneCall1H = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let lockPhoneCall4H = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let lockPhoneCall24HL = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let lockPhoneCall24HU = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let lockAutoLockScreenMinut = pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').val();
			let lockPasswordUnlock = pageHandle.find('#LockControl').find('#UnlockOptionSwitchBox').find('input[type=checkbox]').prop('checked');

			let offlineLineNotify = pageHandle.find('#OfflineControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let offlinePhoneCall = pageHandle.find('#OfflineControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let offlineManAutoOption = pageHandle.find('#OfflineControl').find('input[name="ManAutoOfflineGroup"]:checked').val();
			let offlinePhoneCall1H = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let offlinePhoneCall4H = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let offlinePhoneCall24HL = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let offlinePhoneCall24HU = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let offlineAutoLogoutMinut = pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').val();



			let noactioncasestatus = pageHandle.find('#PhoneRetryOptionControlBox').find('#NoActionControlCaseStatusSelect').val();
			let retrytime = pageHandle.find('#PhoneRetryOptionControlBox').find('#RetrytimeSelect').val();
			let retrysecond = pageHandle.find('#PhoneRetryOptionControlBox').find('#RetrysecondSelect').val();

			let phoneRetryOptions = {
				retrytime: retrytime? retrytime:2,
				retrysecond: retrysecond? retrysecond:180,
				noactioncasestatus: noactioncasestatus? noactioncasestatus:3
			}
			//console.log(phoneRetryOptions);

			let verifyProfile1 = ((lockAutoLockScreenMinut > -1) && (lockAutoLockScreenMinut < 61));
			let verifyProfile2 = ((offlineAutoLogoutMinut <= 0) || ((offlineAutoLogoutMinut > 0) && (offlineAutoLogoutMinut > lockAutoLockScreenMinut)));

			if (verifyProfile1) {
				pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '');
				if (verifyProfile2) {
					pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '');
					pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').css('border', '');
					let profileValue = {
						activeState: {
							webNotify: activeWebNotify? 1:0,
							lineNotify: activeLineNotify? 1:0,
							phoneCall: activePhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: activeManAutoOption,
								optionCaseControl: {
									case1H: activePhoneCall1H? activePhoneCall1H:0,
									case4H: activePhoneCall4H? activePhoneCall4H:0,
									case24HL: activePhoneCall24HL? activePhoneCall24HL:0,
									case24HU: activePhoneCall24HU? activePhoneCall24HU:0,
								}
							},
							autoAcc: activeAutoAcc? 1:0,
							autoReady: activeAutoReady? 1:0
						},
						lockState: {
							lineNotify: lockLineNotify? 1:0,
							phoneCall: lockPhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: lockManAutoOption,
								optionCaseControl: {
									case1H: lockPhoneCall1H? lockPhoneCall1H:0,
									case4H: lockPhoneCall4H? lockPhoneCall4H:0,
									case24HL: lockPhoneCall24HL? lockPhoneCall24HL:0,
									case24HU: lockPhoneCall24HU? lockPhoneCall24HU:0,
								}
							},
							autoLockScreen: lockAutoLockScreenMinut,
							passwordUnlock: lockPasswordUnlock? 1:0
						},
						offlineState: {
							lineNotify: offlineLineNotify? 1:0,
							phoneCall: offlinePhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: offlineManAutoOption,
								optionCaseControl: {
									case1H: offlinePhoneCall1H? offlinePhoneCall1H:0,
									case4H: offlinePhoneCall4H? offlinePhoneCall4H:0,
									case24HL: offlinePhoneCall24HL? offlinePhoneCall24HL:0,
									case24HU: offlinePhoneCall24HU? offlinePhoneCall24HU:0,
								}
							},
							autoLogout: offlineAutoLogoutMinut
						},
						phoneRetry: phoneRetryOptions
					};
					console.log(profileValue);
					saveCallBack(profileValue);
				} else {
					pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '1px solid red');
					pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').css('border', '1px solid red');
					let radAlertMsg = $('<div></div>');
					$(radAlertMsg).append($('<p>กรณีมีการตั้งค่า Logout อัตโนมัติ</p>'));
					$(radAlertMsg).append($('<p>ค่าจำนวนนาทีของ Logout อัตโนมัติ ต้องมากกว่า จำนวนนาทีของล็อคจอภาพ</p>'));
					const radalertoption = {
						title: 'ตั้งค่าไม่ถูกต้อง',
						msg: $(radAlertMsg),
						width: '420px',
						onOk: function(evt) {
							radAlertBox.closeAlert();
						}
					}
					let radAlertBox = $('body').radalert(radalertoption);
				}
			} else {
				pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '1px solid red');
				let radAlertMsg = $('<div></div>');
				$(radAlertMsg).append($('<p>กรณีมีการตั้งค่า เข้าสู่ Mode Lock เมื่อไม่ได้ใช้งาน</p>'));
				$(radAlertMsg).append($('<p>ด้วยค่าจำนวนนาที ระหว่าง 0 - 60</p>'));
				const radalertoption = {
					title: 'ตั้งค่าไม่ถูกต้อง',
					msg: $(radAlertMsg),
					width: '420px',
					onOk: function(evt) {
						radAlertBox.closeAlert();
					}
				}
				let radAlertBox = $('body').radalert(radalertoption);
			}
		});
    return $(cmdBar);
  }

	const doCallSaveMyProfile = function(profileData){
    return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let radioId = userdata.id;
			let rqParams = undefined;
			let apiUrl = undefined;
      let readyState = undefined;
      let myProfileRes = await doCallMyProfile(radioId);
      if (myProfileRes.Record.length > 0) {
				if (myProfileRes.Record[0].Profile.readyState){
        	readyState = myProfileRes.Record[0].Profile.readyState;
				} else {
					readyState = common.defaultProfile.readyState;
				}
        apiUrl = '/api/userprofile/update';
        rqParams = {data: profileData, userId: radioId};
      } else {
        readyState = common.defaultProfile.readyState;
        apiUrl = '/api/userprofile/add';
        rqParams = {data: profileData, userId: radioId};
      }
			rqParams.data.readyState = readyState;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        if (response.status.code == 200) {
					userdata.userprofiles[0].Profile = profileData;
					userdata.userprofiles[0].Profile.readyState = readyState;
					console.log(userdata.userprofiles[0].Profile);
          localStorage.setItem('userdata', JSON.stringify(userdata));
          $.notify("บันทึกการคั้งค่าสำเร็จ", "success");
        } else {
          $.notify("บันทึกการคั้งค่าไม่สำเร็จ", "error");
        }
        //$('body').loading('stop');
        resolve(response);
			} catch(e) {
        $.notify("มีความผิดพลาดขณะบันทึกการคั้งค่า", "error");
        //$('body').loading('stop');
	      reject(e);
    	}
		});
	}

	const doCallMyProfile = function(radioId){
    return new Promise(async function(resolve, reject) {
			let rqParams = {};
			let apiUrl = '/api/userprofile/select/' + radioId;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  return {
    doCreateProfileTitlePage,
    doCreateProfilePage,
    doCallMyProfile,
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7,"./changepwddlg.js":14}],20:[function(require,module,exports){
/* searchcaselib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  function doCreateCaseItemCommand(ownerRow, caseItem) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let operationCmdButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/arrow-down-icon.png" title="คลิกเพื่อเปิดรายการคำสั่งใช้งานของคุณ"/>');
		$(operationCmdButton).click(async function() {
			let casestatusId = caseItem.case.casestatusId;
			let cando = await common.doGetApi('/api/cases/cando/' + casestatusId, {});
			if (cando.status.code == 200) {
				let cmdRow = $('<div class="cmd-row" style="display: tbable-row; width: 100%;"></div>');
				$(cmdRow).append($('<div style="display: table-cell; border-color: transparent;"></div>'));
				let mainBoxWidth = parseInt($(".mainfull").css('width'), 10);
				//console.log(mainBoxWidth);
				// left: 0px; width: 100%;
				let cmdCell = $('<div style="display: table-cell; position: absolute; width: ' + (mainBoxWidth-8) + 'px; border: 1px solid black; background-color: #ccc; text-align: right;"></div>');
				$(cmdRow).append($(cmdCell));
				console.log(cando);
				await cando.next.actions.forEach((item, i) => {
					let cmd = item.substr(0, (item.length-1));
					let frag = item.substr((item.length-1), item.length);
					if ((frag==='H') &&(userdata.usertypeId==2)) {
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							console.log(data);
							//hospital Action todo
						});
						$(iconCmd).appendTo($(cmdCell));
					} else if ((frag==='R') &&(userdata.usertypeId==4)) {
						console.log(cmd);
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							//console.log(data);
							//readio Action todo
							if (cmd === 'edit') {
								let eventData = {caseId: caseItem.case.id, statusId: caseItem.case.casestatusId, patientId: caseItem.case.patientId, hospitalId: caseItem.case.hospitalId};
								eventData.Modality = caseItem.case.Case_Modality;
								eventData.StudyDescription = caseItem.case.Case_StudyDescription;
								eventData.ProtocolName = caseItem.case.Case_ProtocolName;
								if ((eventData.StudyDescription == '') && (eventData.ProtocolName != '')) {
									eventData.StudyDescription = eventData.ProtocolName;
								}
								eventData.statusId = caseItem.casestatusId;
								eventData.startDownload = 0;
					      $(iconCmd).trigger('opencase', [eventData]);
							}
						});
						$(iconCmd).appendTo($(cmdCell));
					}
				});
				$('.cmd-row').remove();
				$(cmdRow).insertAfter(ownerRow);
			}
		});
		return $(operationCmdButton);
	}

	function doCreateCaseItemRadioCommand(commandStr, caseItem) {
		let cmd = commandStr.substr(0, (commandStr.length-1));
		let frag = commandStr.substr((commandStr.length-1), commandStr.length);
		if ((frag === 'R') && (cmd === 'edit')) {
			let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
				let eventData = common.doCreateOpenCaseData(caseItem.case);
				eventData.statusId = caseItem.case.casestatusId;
				eventData.startDownload = 0;
				$(iconCmd).trigger('opencase', [eventData]);
			});
			return $(iconCmd);
		} else {
			return $('<span></span>');
		}
	}

  const doCreateSearchTitlePage = function(){
		let searchResultTitleBox = $('<div id="ResultTitleBox"></div>');
		let logoPage = $('<img src="/images/search-icon-4.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
		$(logoPage).appendTo($(searchResultTitleBox));
		let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>ผลการค้นหาเคสของคุณ</h3></div>');
		$(titleResult).appendTo($(searchResultTitleBox));
		return $(searchResultTitleBox);
	}

  const doCreateHeaderFieldCaseList = function() {
		let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>วันที่ส่งอ่าน</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ชื่อผู้ป่วย</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>เพศ/อายุ</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Mod.</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Scan Part</span>');
		$(headColumn).appendTo($(headerRow));

    /*
		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ประเภทความด่วน</span>');
		$(headColumn).appendTo($(headerRow));
    */

		/*
		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>แพทย์ผู้ส่ง</span>');
		$(headColumn).appendTo($(headerRow));
		*/

		headColumn = $('<div style="display: table-cell; text-align: center" class="header-cell"></div>');
		$(headColumn).append('<span>โรงพยาบาล</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>สถานะเคส</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

		return $(headerRow);
	}

  const doCreateSearchCaseFormRow = function(key, searchResultCallback){
    let searchFormRow = $('<div style="display: table-row; width: 100%;"></div>');
    let formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');

    let fromDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ตั้งแต่</span>
    $(fromDateKeyBox).appendTo($(formField));
    let fromDateKey = $('<input type="text" id="FromDateKey" size="6" style="margin-left: 1px;"/>');
    if (key.fromDateKeyValue) {
      let arrTmps = key.fromDateKeyValue.split('-');
      let fromDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
      $(fromDateKey).val(fromDateTextValue);
    }
    //$(fromDateKey).css({'font-size': '20px'});
    $(fromDateKey).appendTo($(fromDateKeyBox));
    $(fromDateKey).datepicker({ dateFormat: 'dd-mm-yy' });

    $(formField).append($('<span style="margin-left: 2px; display: inline-block;">-</span>'));

    let toDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ถึง</span>
    $(toDateKeyBox).appendTo($(formField));
    let toDateKey = $('<input type="text" id="ToDateKey" size="6" style="margin-left: 2px;"/>');
    if (key.toDateKeyValue) {
      let arrTmps = key.toDateKeyValue.split('-');
      let toDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
      $(toDateKey).val(toDateTextValue);
    }
    $(toDateKey).appendTo($(toDateKeyBox));
    $(toDateKey).datepicker({ dateFormat: 'dd-mm-yy' });
    $(formField).append($(toDateKeyBox));

    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let patientNameENKey = $('<input type="text" id="PatientNameENKey" size="15"/>');
    $(patientNameENKey).val(key.patientNameENKeyValue);
    $(formField).append($(patientNameENKey));
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let patientHNKey = $('<input type="text" id="PatientHNKey" size="8"/>');
    $(patientHNKey).val(key.patientHNKeyValue);
    $(formField).append($(patientHNKey));
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let bodypartKey = $('<input type="text" id="BodyPartKey" style="width: 90%"/>');
    $(bodypartKey).val(key.bodypartKeyValue);
    $(formField).append($(bodypartKey));
    $(formField).appendTo($(searchFormRow));
    /*
    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));
    */
    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let caseStatusKey = $('<select id="CaseStatusKey"></select>');
    $(caseStatusKey).append($('<option value="0">ทั้งหมด</option>'));
		//console.log(common.allCaseStatusForRadio);
    common.allCaseStatusForRadio.forEach((item, i) => {
      $(caseStatusKey).append($('<option value="' + item.value + '">' + item.DisplayText + '</option>'));
    });
    $(caseStatusKey).val(key.caseStatusKeyValue);
    $(formField).append($(caseStatusKey));
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');
    let startSearchCmd = $('<img src="/images/search-icon-3.png" width="30px" height="auto"/>');
    $(formField).append($(startSearchCmd));
    $(formField).appendTo($(searchFormRow));

    $(searchFormRow).find('input[type=text],select').css({'font-size': '14px'});

    $(startSearchCmd).css({'cursor': 'pointer'});
    $(startSearchCmd).on('click', async (evt) => {
      let fromDateKeyValue = $('#FromDateKey').val();
      let toDateKeyValue = $(toDateKey).val();
      let patientNameENKeyValue = $(patientNameENKey).val();
      let patientHNKeyValue = $(patientHNKey).val();
      let bodypartKeyValue = $(bodypartKey).val();
      let caseStatusKeyValue = $(caseStatusKey).val();
      let searchKey = undefined;
      if ((fromDateKeyValue) && (toDateKeyValue)) {
        let arrTmps = fromDateKeyValue.split('-');
        fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
        let fromDateKeyTime = new Date(fromDateKeyValue);
        arrTmps = toDateKeyValue.split('-');
        toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
        let toDateKeyTime = new Date(toDateKeyValue);
        if (toDateKeyTime >= fromDateKeyTime) {
          let fromDateFormat = util.formatDateStr(fromDateKeyTime);
          let toDateFormat = util.formatDateStr(toDateKeyTime);
          searchKey = {fromDateKeyValue: fromDateFormat, toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
        } else {
          alert('ถึงวันที่ ต้องมากกว่า ตั้งแต่วันที่ หรือ เลือกวันที่เพียงช่องใดช่องหนึ่ง ส่วนอีกช่องให้เว้นว่างไว้\nโปรดเปลี่ยนค่าวันที่แล้วลองใหม่');
        }
      } else {
        if (fromDateKeyValue) {
          let arrTmps = fromDateKeyValue.split('-');
          fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
          let fromDateKeyTime = new Date(fromDateKeyValue);
          let fromDateFormat = util.formatDateStr(fromDateKeyTime);
          searchKey = {fromDateKeyValue: fromDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
        } else if (toDateKeyValue) {
          let arrTmps = toDateKeyValue.split('-');
          toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
          let toDateKeyTime = new Date(toDateKeyValue);
          let toDateFormat = util.formatDateStr(toDateKeyTime);
          searchKey = {toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
        } else {
          searchKey = {patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
        }
      }
      if (searchKey) {
        //$('body').loading('start');
				const userdata = JSON.parse(localStorage.getItem('userdata'));
        let hospitalId = userdata.hospitalId;
        let userId = userdata.id;
        let usertypeId = userdata.usertypeId;

        let searchParam = {key: searchKey, hospitalId: hospitalId, userId: userId, usertypeId: usertypeId};

        let response = await common.doCallApi('/api/cases/search/key', searchParam);

        $(".mainfull").find('#SearchResultView').empty();
        $(".mainfull").find('#NavigBar').empty();

        await searchResultCallback(response);

        //$('body').loading('stop');

      }
    });
    return $(searchFormRow);
  }

  function doCreateCaseItemRow(caseItem) {
    return new Promise(async function(resolve, reject) {
      let caseDate = util.formatDateTimeStr(caseItem.case.createdAt);
			let casedatetime = caseDate.split(' ');
      let casedateSegment = casedatetime[0].split('-');
      casedateSegment = casedateSegment.join('');
      let casedate = util.formatStudyDate(casedateSegment);
      let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
			let patientName = '-';
			let patientSA = '-';
			let patientHN = '-';
			if (caseItem.case.patient){
      	patientName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
      	patientSA = caseItem.case.patient.Patient_Sex + '/' + caseItem.case.patient.Patient_Age;
      	patientHN = caseItem.case.patient.Patient_HN;
			} else {
				console.log(caseItem);
			}
      let caseMODA = caseItem.case.Case_Modality;
      let caseScanparts = caseItem.case.Case_ScanPart;
      let yourSelectScanpartContent = $('<div></div>');
      if ((caseScanparts) && (caseScanparts.length > 0)) {
        yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
      }
			//console.log(caseItem.case);
      let caseUG = '-';
			if (caseItem.case.urgenttype){
				//caseUG = caseItem.case.urgenttype.UGType_Name;
				caseUG = caseItem.case.urgenttype.UGType_Name;
			}
      //let caseREFF = caseItem.Refferal.User_NameTH + ' ' + caseItem.Refferal.User_LastNameTH;
      //console.log(caseItem);
			let caseHosName = '-'
			if (caseItem.case.hospital){
      	caseHosName = caseItem.case.hospital.Hos_Name;
			}

			let caseSTAT = '-';
			if (caseItem.case.casestatus){
      	caseSTAT = caseItem.case.casestatus.CS_Name_EN;
			}

      let itemRow = $('<div class="case-row" style="display: table-row; width: 100%; cursor: pointer;"></div>');
      let itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append('<span>'+ casedate + ' : ' + casetime +'</span>');
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(patientName);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(patientSA);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(patientHN);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(caseMODA);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append($(yourSelectScanpartContent));
      $(itemColumn).appendTo($(itemRow));

      /*
      itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
      $(itemColumn).append(caseUG);
      $(itemColumn).appendTo($(itemRow));
      */
      /*
      itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
      $(itemColumn).append(caseREFF);
      $(itemColumn).appendTo($(itemRow));
      */

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(caseHosName);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(caseSTAT);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: center; vertical-align: middle;"></div>');
			//console.log(caseItem.next.actions);
      //let caseCMD = doCreateCaseItemCommand(itemRow, caseItem);
			caseItem.next.actions.forEach((item, i) => {
				let cmdFrag = item;
				let caseCMD = doCreateCaseItemRadioCommand(cmdFrag, caseItem);
      	$(itemColumn).append($(caseCMD));
			});
      $(itemColumn).appendTo($(itemRow));

			$(itemRow).on('dblclick', (evt)=>{
				let eventData = common.doCreateOpenCaseData(caseItem.case);
				eventData.statusId = caseItem.case.casestatusId;
				eventData.startDownload = 1;
				$(itemRow).trigger('opencase', [eventData]);
			});

      resolve($(itemRow));
    });
  }

  const doShowCaseView = function(incidents, key, callback) {
		return new Promise(function(resolve, reject) {
			let rowStyleClass = {/*"font-family": "THSarabunNew", "font-size": "22px"*/};
			let caseView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');

			let headView = doCreateHeaderFieldCaseList(key.fromDateKeyValue);
			$(headView).appendTo($(caseView));
			let formView = doCreateSearchCaseFormRow(key, callback);
			$(formView).appendTo($(caseView));
			const youCan = [5, 6, 9, 10, 11, 12, 13, 14];

			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < incidents.length; i++) {
					let caseItem = incidents[i];
					let checkState = util.contains.call(youCan, caseItem.case.casestatusId);
					if (checkState) {
						let itemView = await doCreateCaseItemRow(caseItem);
						$(itemView).appendTo($(caseView));
					}
				}
				setTimeout(()=>{
					resolve2($(caseView));
				}, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  const doShowSearchResultCallback = function(response){
    return new Promise(async function(resolve, reject) {
      /*  Concept */
      /*
      1. ส่งรายการ case ตามจำนวนรายการ ในเงื่อนไขของ Navigator ไปสร้าง View
      2. รับ view ที่จกข้อ 1 มา append ต่อจาก titlepage
      3. ตรวจสอบจำนวน case ในข้อ 1 ว่ามีกี่รายการ
        - มากกว่า 0 ให้แสดง Navigator
        - เท่ากับ 0 ให้แสดงข้อความ ไม่พบรายการที่ค้นหา
      */
      //$('body').loading('start');

			let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));

      let userItemPerPage = userDefualtSetting.itemperpage;
      let showCases = [];

      let allCaseRecords = response.Records;
			console.log(allCaseRecords);
      if (userItemPerPage == 0) {
        showCases = allCaseRecords;
      } else {
        showCases = await common.doExtractList(allCaseRecords, 1, userItemPerPage);
      }
      let caseView = await doShowCaseView(showCases, response.key, doShowSearchResultCallback);
      $(".mainfull").find('#SearchResultView').empty().append($(caseView));

      if (allCaseRecords.length == 0) {
        $(".mainfull").find('#SearchResultView').append($('<h4>ไม่พบรายการเคสตามเงื่อนไขที่คุณค้นหา</h4>'));
      } else {
				let navigBarBox = $(".mainfull").find('#NavigBar');
				if ($(navigBarBox).length == 0) {
					navigBarBox = $('<div id="NavigBar"></div>');
				} else {
					$(navigBarBox).empty();
				}
        $(".mainfull").append($(navigBarBox));
        let navigBarOption = {
          currentPage: 1,
          itemperPage: userItemPerPage,
          totalItem: allCaseRecords.length,
          styleClass : {'padding': '4px'/*, "font-family": "THSarabunNew", "font-size": "20px"*/},
          changeToPageCallback: async function(page){
            //$('body').loading('start');
            let toItemShow = 0;
            if (page.toItem == 0) {
              toItemShow = allCaseRecords.length;
            } else {
              toItemShow = page.toItem;
            }
            showCases = await common.doExtractList(allCaseRecords, page.fromItem, toItemShow);
            caseView = await doShowCaseView(showCases, response.key, doShowSearchResultCallback);
            $(".mainfull").find('#SearchResultView').empty().append($(caseView));
            //$('body').loading('stop');
          }
        };
        let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
        navigatoePage.toPage(1);
      }
      //$('body').loading('stop');
      resolve();
    });
  }

  return {
    doCreateSearchTitlePage,
    doCreateHeaderFieldCaseList,
    doCreateSearchCaseFormRow,
    doShowCaseView,
    doShowSearchResultCallback
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7}],21:[function(require,module,exports){
/* templatelib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

	const simpleEditorConfig = $.extend({}, common.jqteConfig);

  const onAddNewTemplateClick = async function(evt){
    const addCmd = $(evt.currentTarget);
		const templateData = $(addCmd).data('templateData');
    let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
    $('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
    let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
    $('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

    let templateNameInput = $('<input type="text" id="TemplateName"/>');
		let modalityInput = $('<select id="Modality" style="width: 80px;"></select>');

		common.modalitySelectItem.forEach((item, i) => {
			let optionItem = $('<option value="' + item +'">' + item + '</option>');
			$(modalityInput).append($(optionItem));
		});

    let hospitalInput = $('<input type="text" id="Hospital" style="width: 310px;"/>');
		let modifyHospitalListCmd = $('<input type="button" id="ModifyHospitalListCmd" value=" ... " class="action-btn"; style="margin-left: 10px;"/>');
    let studyDescriptionInput = $('<input type="text" id="StudyDescription" style="width: 310px;"/>');
		let showLegentCmd = common.doCreateLegentCmd(common.doShowStudyDescriptionLegentCmdClick);

		/*
		let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
		let readyOption = {onActionCallback: ()=>{}, offActionCallback: ()=>{}};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		*/
		let readySwitchBox = $('<select></select>');
		$(readySwitchBox).append('<option value="1">Yes</option>');
		$(readySwitchBox).append('<option value="0">No</option>');

		let tableControlInputView = $('<table width="100% cellpadding="2" cellspacing="2" border="0"></table>');

		let tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">ขื่อ Template:</span></td>'));
		let inputCell = $('<td width="*" align="left"></td>');
		$(inputCell).append($(templateNameInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Modality:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(modalityInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Hospital:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(hospitalInput)).append($(modifyHospitalListCmd));
		$(modifyHospitalListCmd).data('templateData', templateData);
		$(modifyHospitalListCmd).on('click', onModifyHospitalList);
		$(hospitalInput).attr('readonly', true);
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Associated Study Description:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(studyDescriptionInput)).append($(showLegentCmd));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Auto Apply:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(readySwitchBox));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		$(modifyHospitalListCmd).data('hospitalsData', []);

    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
    let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
    $(simpleEditor).appendTo($(templateViewBox));
    $(simpleEditor).jqte(simpleEditorConfig);
    $(templateViewBox).find('.jqte_editor').css({ height: '350px' });
    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
    let saveCmd = $('<input id="SaveNewTemplate" type="button" value=" Save" class="action-btn"/>');
    $(saveCmd).appendTo($(templateCmdBar));
    $(saveCmd).data('templateData', templateData);
    $(templateCmdBar).append($('<span>  </span>'));
    $(saveCmd).on('click', (evt)=>{
			//let readyState = readySwitch.getState();
			let readyState = $(readySwitchBox).val();
			onSaveNewCmdClick(evt, readyState, true)
		});
    let cancelCmd = $('<input type="button" value=" Cancel "/>');
    $(cancelCmd).appendTo($(templateCmdBar));
    $(cancelCmd).on('click',(evt)=>{$(cancelCmd).trigger('opentemplatedesign')});

		$(".mainfull").empty();
		$(".mainfull").append($(tableControlInputView));
		$(".mainfull").append($(templateViewBox)).append($(templateCmdBar));

  }

  const onViewCmdClick = async function(evt) {
    const viewCmd = $(evt.currentTarget);
		const templateData = $(viewCmd).data('templateData');
    let rqParams = {};
    let apiUrl = '/api/template/select/' + templateData.templateId;
    let response = await common.doCallApi(apiUrl, rqParams);
		if (response.status.code == 200){
	    let templateNameBox = $('<div style="width: 100%; text-align: center;"></div>');
	    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
	    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
	    if (response.Record.length > 0) {
	      $(templateNameBox).append($('<h4>' + response.Record[0].Name + '</h4>'));
	      let thisTemplate = response.Record[0].Content;
	      $(templateViewBox).html(thisTemplate);
	      let editCmd = $('<input type="button" value=" Edit"/>');
	      $(editCmd).appendTo($(templateCmdBar));
	      $(editCmd).data('templateData', templateData);
	      $(templateCmdBar).append($('<span>  </span>'));
	      $(editCmd).on('click', onEditCmdClick);
	      let backCmd = $('<input type="button" value=" Back "/>');
	      $(backCmd).appendTo($(templateCmdBar));
	      $(backCmd).on('click',(evt)=>{$(backCmd).trigger('opentemplatedesign')});
	    } else {
	      $(templateViewBox).append($('<span>ไม่พบรายการ Template รายการนี้</span>'));
	    }
	    $(".mainfull").empty().append($(templateNameBox)).append($(templateViewBox)).append($(templateCmdBar));
		} else if (response.status.code == 210){
			let rememberme = localStorage.getItem('rememberme');
			if (rememberme == 1) {
				let newUserData = await apiconnector.doCallNewTokenApi();
				localStorage.setItem('token', newUserData.token);
				localStorage.setItem('userdata', JSON.stringify(newUserData.data));
				onViewCmdClick(evt);
			} else {
				common.doUserLogout(wsm);
			}

		}
  }

  const onEditCmdClick = async function(evt) {
    const editCmd = $(evt.currentTarget);
		const templateData = $(editCmd).data('templateData');
		//console.log(templateData);
    let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
    $('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
    let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
    $('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

    let rqParams = {};
    let apiUrl = '/api/template/select/' + templateData.templateId;
    let response = await common.doCallApi(apiUrl, rqParams);

    let templateNameInput = $('<input type="text" id="TemplateName" style="width: 310px;"/>');
    let modalityInput = $('<select id="Modality" style="width: 80px;"></select>');

		common.modalitySelectItem.forEach((item, i) => {
			let optionItem = $('<option value="' + item +'">' + item + '</option>');
			$(modalityInput).append($(optionItem));
		});

    let hospitalInput = $('<input type="text" id="Hospital" style="width: 310px;"/>');
		let modifyHospitalListCmd = $('<input type="button" id="ModifyHospitalListCmd" value=" ... " class="action-btn"; style="margin-left: 10px;"/>');
    let studyDescriptionInput = $('<input type="text" id="StudyDescription" style="width: 310px;"/>');
		let showLegentCmd = common.doCreateLegentCmd(common.doShowStudyDescriptionLegentCmdClick);
		/*
		let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
		let readyOption = {onActionCallback: ()=>{}, offActionCallback: ()=>{}};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		*/
		let readySwitchBox = $('<select></select>');
		$(readySwitchBox).append('<option value="1">Yes</option>');
		$(readySwitchBox).append('<option value="0">No</option>');

		let tableControlInputView = $('<table width="100% cellpadding="2" cellspacing="2" border="0"></table>');
		let tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">ขื่อ Template:</span></td>'));
		let inputCell = $('<td width="*" align="left"></td>');
		$(inputCell).append($(templateNameInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Modality:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(modalityInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Hospital:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(hospitalInput)).append($(modifyHospitalListCmd));
		$(modifyHospitalListCmd).data('templateData', templateData);
		$(modifyHospitalListCmd).on('click', onModifyHospitalList);
		$(hospitalInput).attr('readonly', true);
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Associated Study Description:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(studyDescriptionInput)).append($(showLegentCmd));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Auto Apply:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(readySwitchBox));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
    let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
    $(simpleEditor).appendTo($(templateViewBox));
    $(simpleEditor).jqte(simpleEditorConfig);
    $(templateViewBox).find('.jqte_editor').css({ height: '350px' });
    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
    if (response.Record.length > 0) {
			$(modifyHospitalListCmd).data('hospitalsData', response.Record[0].Hospitals);
			let hosValues = [];
			if (response.Record[0].Hospitals){
				await response.Record[0].Hospitals.forEach((item, i) => {
					if (item.id != 0){
						let mapItem = templateData.hospitalmap.find((map)=>{
							if (map.id == item.id) {
								return map;
							}
						});
						if (mapItem){
							hosValues.push(mapItem.Hos_Name);
						}
					} else {
						hosValues.push('All');
					}
				});
			}
      $(templateNameInput).val(response.Record[0].Name);
			$(modalityInput).val(response.Record[0].Modality);
			$(hospitalInput).val(hosValues.join(', '));
			$(studyDescriptionInput).val(response.Record[0].StudyDescription);
			/*
			if (response.Record[0].AutoApply == 1){
				readySwitch.onAction()
			}
			*/
      $(templateViewBox).find('#SimpleEditor').jqteVal(response.Record[0].Content);
      let saveCmd = $('<input type="button" id="SaveEditCmd" value=" Save" class="action-btn"/>');
      $(saveCmd).appendTo($(templateCmdBar));
      $(saveCmd).data('templateData', templateData);
      $(templateCmdBar).append($('<span>  </span>'));
      $(saveCmd).on('click', (evt)=>{
				//let readyState = readySwitch.getState();
				let readyState = $(readySwitchBox).val();
				onSaveEditCmdClick(evt, readyState);
			});
      let cancelCmd = $('<input type="button" value=" Cancel "/>');
      $(cancelCmd).appendTo($(templateCmdBar));
      $(cancelCmd).on('click',(evt)=>{$(cancelCmd).trigger('opentemplatedesign')});
    } else {
      $(templateViewBox).append($('<span>ไม่พบรายการ Template รายการนี้</span>'));
    }
    $(".mainfull").empty();
		$(".mainfull").append($(tableControlInputView));
		$(".mainfull").append($(templateViewBox)).append($(templateCmdBar));
  }

	const onModifyHospitalList = function(evt){
		const modifyHosCmd = $(evt.currentTarget);
		const templateData = $(modifyHosCmd).data('templateData');

		let hospitalOptionBox = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');

		let selectHospitalOptionGuideRow = $('<tr></tr>');
		$(selectHospitalOptionGuideRow ).css({'background-color': common.headBackgroundColor, 'color': 'white'});
		$(selectHospitalOptionGuideRow ).appendTo($(hospitalOptionBox));
		let guideCell = $('<td colspan="2" align="center"></td>');
		$(guideCell).append($('<h3>Apply this template to</h3>'));
		$(guideCell).appendTo($(selectHospitalOptionGuideRow));

		let allAospitalItemRow = $('<tr></tr>');
		let selectCell = $('<td width="15%" align="center"></td>');
		let hospitalNameCell = $('<td width="*" align="left"></td>');
		$(allAospitalItemRow).append($(selectCell)).append($(hospitalNameCell));
		$(hospitalNameCell).text('All');
		let allCheckBox = $('<input type="checkbox" id="AllCmd" name="hospitalIds[]" value="0" style="transform: scale(1.9);"/>');
		$(selectCell).append($(allCheckBox));
		$(hospitalOptionBox).append($(allAospitalItemRow));
		$(allCheckBox).on('click', (evt)=>{
			let isCheckAll = $(evt.currentTarget).prop('checked');
			if (isCheckAll){
				//$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', true).prop('disabled', true);
				$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', false).prop('disabled', true);
			} else {
				//$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', false).prop('disabled', false);
				$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('disabled', false);
			}
		});

		templateData.hospitalmap.forEach(async (hos, i) => {
			let hospitalItemRow = $('<tr></tr>');
			selectCell = $('<td align="center"></td>');
			hospitalNameCell = $('<td align="left"></td>');
			$(hospitalItemRow).append($(selectCell)).append($(hospitalNameCell));
			$(hospitalNameCell).text(hos.Hos_Name);
			let checkBox = $('<input type="checkbox" name="hospitalIds[]" value="' + hos.id + '" style="transform: scale(1.9);"/>');
			$(selectCell).append($(checkBox));
			$(hospitalOptionBox).append($(hospitalItemRow));

			if (templateData.Hospitals){
				let findMapSelected = await templateData.Hospitals.find((item)=>{
					if (item.id == hos.id) {
						return item;
					}
				});
				if (findMapSelected){
					$(checkBox).prop('checked', true);
				}
			}
		});

		let cmdRow = $('<tr></tr>');
		$(cmdRow).css({'background-color': common.headBackgroundColor, 'color': 'white'});
		$(cmdRow).appendTo($(hospitalOptionBox));
		let cmdCell = $('<td colspan="2" align="center"></td>');
		$(cmdRow).append($(cmdCell));

		let okCmd = $('<input type="button" value=" OK " class="action-btn"/>');
		$(okCmd).on('click', async (evt)=>{
			var values = [];
			await $('input[type="checkbox"][name="hospitalIds[]"]:checked').each(function(i,v){
			  values.push($(v).val());
			});
			//console.log(values);
			let modifyValues = [];
			let hospitalResult = [];
			values.forEach((item, i) => {
				if (item != 0){
					let mapItem = templateData.hospitalmap.find((map)=>{
						if (map.id == item) {
							return map;
						}
					});
					if (mapItem){
						modifyValues.push(mapItem.Hos_Name);
						hospitalResult.push(mapItem);
					}
				} else {
					modifyValues.push('All');
					hospitalResult.push({id: 0});
				}
			});
			$('#ModifyHospitalListCmd').data('hospitalsData', hospitalResult);
			$('#Hospital').val(modifyValues.join(', '));
			$(cancelCmd).click();
		});
		let cancelCmd = $('<input type="button" value=" Cancel " style="margin-left: 10px;"/>');
		$(cancelCmd).on('click', (evt)=>{
			$('#quickreply').empty();
			$('#quickreply').removeAttr('style');
		});

		$(cmdCell).append($(okCmd)).append($(cancelCmd));

		$('#quickreply').css(common.quickReplyDialogStyle);
		let hopitalOptionBoxStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '420px', 'height': 'auto'};
		$(hospitalOptionBox).css(hopitalOptionBoxStyle);
		$('#quickreply').append($(hospitalOptionBox));
	}

  const onDeleteCmdClick = async function(evt) {
    const deleteCmd = $(evt.currentTarget);
		const templateData = $(deleteCmd).data('templateData');
    let yourAnswer = confirm('โปรดยืนยันการลบ Template โดยคลิก ตกลง หรือ OK');
    if (yourAnswer === true) {
      let callDeleteTemplateUrl = '/api/template/delete';
      let templateId = templateData.templateId;
      let rqParams = {id: templateId}
      let response = await common.doCallApi(callDeleteTemplateUrl, rqParams);
      if (response.status.code == 200) {
        $.notify("ลบรายการ Template สำเร็จ", "success");
        $(deleteCmd).trigger('opentemplatedesign')
      } else {
        $.notify("ลบรายการ Template ขัดข้อง", "`error`");
      }
    }
  }

  const onSaveNewCmdClick = async function(evt, autoApply, triggerOption){
    const saveEditCmd = $(evt.currentTarget);
		const templateData = $(saveEditCmd).data('templateData');
		const hospitalsData = $('#ModifyHospitalListCmd').data('hospitalsData');
    let templaeName = $('#TemplateName').val();
		let modality = $('#Modality').val();
    let studyDescription = $('#StudyDescription').val();
    let templateContent = $('#SimpleEditor').val();
    //let templateId = templateData.templateId;

		var callSaveNew = function(data){
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callAddTemplateUrl = '/api/template/add';
			let rqParams = {data: data, radioId: radioId};
			common.doCallApi(callAddTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					$.notify("บันทึก Template สำเร็จ", "success");
					if (triggerOption){
						$(saveEditCmd).trigger('opentemplatedesign');
					}
				} else {
					$.notify("บันทึก Template ขัดข้อง", "`error`");
				}
			});
		}

		if (templaeName === '') {
      $.notify("ชื่อ Template ต้องไม่ว่าง", "error");
      $('#TemplateName').css('border', '1px solid red');
		} else if (modality === ''){
			$('#TemplateName').css('border', '');
			$.notify("Modality ต้องไม่ว่าง", "error");
      $('#Modality').css('border', '1px solid red;');
		} else if ((!hospitalsData) || (hospitalsData == '')) {
			$('#Modality').css('border', '');
			$.notify("Hospital ต้องไม่ว่าง", "error");
			$('#Hospital').css('border', '1px solid red;');
		} else if (studyDescription === ''){
			$('#Hospital').css('border', '');
			$.notify("Study Description ต้องไม่ว่าง", "error");
			$('#StudyDescription').css('border', '1px solid red;');
    } else if (templateContent === ''){
      $('#StudyDescription').css('border', '');
      $.notify("ข้อมูล Template ต้องไม่ว่าง", "error");
      $('#SimpleEditor').css('border', '1px solid red;');
    } else {
      $('#SimpleEditor').css('border', '');
			let checkData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription};
			let saveData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription, Content: templateContent, AutoApply: autoApply};
			if (autoApply == true) {
				callCheckTemplateDuplicate(checkData).then((result)=>{
					console.log(result);
					if ((result) && (result.Name)) {
						let radAlertMsg = $('<div></div>');
						$(radAlertMsg).append($('<p>ระบบฯ ตรวจสอบพบ Template ที่มีคุณสมบัติตรงกับ Template ใหม่ และเปิดใช้งาน Auto Apply อยู่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ต้องการ</b> ให้ Template ใหม่เป็น Auto Apply แทนรายการเดิม คลิกปุ่ม <b>ตกลง</b> เพิ่อบันทึกและตั้งค่า Auto Apply ใหม่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ไม่ต้องการ</b> คลิกปุ่ม <b>ยกเลิก</b> เพิ่อปิดกล่องนี้และตั้งค่า Auto Apply ใหม</p>'));
						const radconfirmoption = {
							title: 'โปรดยืนยันการตั้งค่า Auto Apply',
							msg: $(radAlertMsg),
							width: '420px',
							onOk: function(evt) {
								callSaveNew(saveData);
								radConfirmBox.closeAlert();
							},
							onCancel: function(evt){
								radConfirmBox.closeAlert();
							}
						}
						let radConfirmBox = $('body').radalert(radconfirmoption);
					} else {
						callSaveNew(saveData);
					}
				});
			} else {
				callSaveNew(saveData);
			}
    }
  }

  const onSaveEditCmdClick = async function(evt, autoApply){
    const saveEditCmd = $(evt.currentTarget);
		const templateData = $(saveEditCmd).data('templateData');
		const hospitalsData = $('#ModifyHospitalListCmd').data('hospitalsData');
    let templaeName = $('#TemplateName').val();
		let modality = $('#Modality').val();
    let studyDescription = $('#StudyDescription').val();
    let templateContent = $('#SimpleEditor').val();
    let templateId = templateData.templateId;

		var callSaveUpdate = function(data){
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callUpdateTemplateUrl = '/api/template/update';
			let rqParams = {data: data, id: templateId, radioId: radioId};
			common.doCallApi(callUpdateTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					$.notify("บันทึก Template สำเร็จ", "success");
					$(saveEditCmd).trigger('opentemplatedesign')
				} else {
					$.notify("บันทึก Template ขัดข้อง", "`error`");
				}
			});
		}

    if (templaeName === '') {
      $.notify("ชื่อ Template ต้องไม่ว่าง", "error");
      $('#TemplateName').css('border', '1px solid red');
		} else if (modality === ''){
			$('#TemplateName').css('border', '');
			$.notify("Modality ต้องไม่ว่าง", "error");
      $('#Modality').css('border', '1px solid red;');
		} else if ((!hospitalsData) || (hospitalsData == '')) {
			$('#Modality').css('border', '');
			$.notify("Hospital ต้องไม่ว่าง", "error");
			$('#Hospital').css('border', '1px solid red;');
		} else if (studyDescription === ''){
			$('#Hospital').css('border', '');
			$.notify("Study Description ต้องไม่ว่าง", "error");
			$('#StudyDescription').css('border', '1px solid red;');
    } else if (templateContent === ''){
      $('#StudyDescription').css('border', '');
      $.notify("ข้อมูล Template ต้องไม่ว่าง", "error");
      $('#SimpleEditor').css('border', '1px solid red;');
    } else {
      $('#SimpleEditor').css('border', '');
			let checkData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription};
			let saveData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription, Content: templateContent, AutoApply: autoApply};
			if (autoApply == true) {
				callCheckTemplateDuplicate(checkData).then((result)=>{
					console.log(result);
					if ((result) && (result.Name)) {
						let radAlertMsg = $('<div></div>');
						$(radAlertMsg).append($('<p>ระบบฯ ตรวจสอบพบ Template ที่มีคุณสมบัติตรงกับ Template ใหม่ และเปิดใช้งาน Auto Apply อยู่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ต้องการ</b> ให้ Template ใหม่เป็น Auto Apply แทนรายการเดิม คลิกปุ่ม <b>ตกลง</b> เพิ่อบันทึกและตั้งค่า Auto Apply ใหม่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ไม่ต้องการ</b> คลิกปุ่ม <b>ยกเลิก</b> เพิ่อปิดกล่องนี้และตั้งค่า Auto Apply ใหม</p>'));
						const radconfirmoption = {
							title: 'โปรดยืนยันการตั้งค่า Auto Apply',
							msg: $(radAlertMsg),
							width: '420px',
							onOk: function(evt) {
								callSaveUpdate(saveData);
								radConfirmBox.closeAlert();
							},
							onCancel: function(evt){
								radConfirmBox.closeAlert();
							}
						}
						let radConfirmBox = $('body').radalert(radconfirmoption);
					} else {
						callSaveUpdate(saveData);
					}
				});
			} else {
				callSaveUpdate(saveData);
			}
    }
  }

  const doCreateTemplateTitlePage = function() {
    const templateTitle = 'Template';
    let templateTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/format-design-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(templateTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + templateTitle + '</h3></div>');
    $(titleText).appendTo($(templateTitleBox));
    return $(templateTitleBox);
  }

  const doCallMyTemplate = function() {
    return new Promise(async function(resolve, reject) {
      const main = require('../main.js');
			let userdata = JSON.parse(main.doGetUserData());
			let radioId = userdata.id;
			let rqParams = {};
			let apiUrl = '/api/template/options/' + radioId;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  const doCreateHeaderRow = function(){
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');

		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>#</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ขื่อ Template</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Modality</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Associated Study Description</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Auto Apply</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  const doCreateTemplateItemRow = function(i, tmItem){
    return new Promise(function(resolve, reject) {
      const templateData = {templateId: tmItem.Value, Hospitals: tmItem.Hospitals, hospitalmap: tmItem.hospitalmap};
      let tmRow = $('<div style="display: table-row; width: 100%;"></div>');

      let tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).append('<span>' + (i+1) + '</span>');
  		$(tmCell).appendTo($(tmRow));

      tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + tmItem.DisplayText + '</span>');
  		$(tmCell).appendTo($(tmRow));

			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + (tmItem.Modality)? tmItem.Modality:'' + '</span>');
  		$(tmCell).appendTo($(tmRow));

			let hosList = [];
			if (tmItem.Hospitals){
				tmItem.Hospitals.forEach((item, i) => {
					if (item.id != 0){
						let mapItem = templateData.hospitalmap.find((map)=>{
							if (map.id == item.id) {
								return map;
							}
						});
						if (mapItem){
							hosList.push(mapItem.Hos_Name);
						}
					} else {
						hosList.push('All');
					}
				});
			}
			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + hosList.join(', ') + '</span>');
  		$(tmCell).appendTo($(tmRow));

			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + (tmItem.StudyDescription)? tmItem.StudyDescription:'' + '</span>');
  		$(tmCell).appendTo($(tmRow));

      tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).appendTo($(tmRow));

      let viewCmd = $('<input type="button" value=" View "/>');
      $(viewCmd).appendTo($(tmCell));
      $(viewCmd).data('templateData', templateData);
      $(viewCmd).on('click', onViewCmdClick);
      $(tmCell).append($('<span>  </span>'));

      let editCmd = $('<input type="button" value=" Edit "/>');
      $(editCmd).appendTo($(tmCell));
      $(editCmd).data('templateData', templateData);
      $(editCmd).on('click', onEditCmdClick);
      $(tmCell).append($('<span>  </span>'));

      let deleteCmd = $('<input type="button" value=" Delete "/>');
      $(deleteCmd).appendTo($(tmCell));
      $(deleteCmd).data('templateData', templateData);
      $(deleteCmd).on('click', onDeleteCmdClick);

			tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).appendTo($(tmRow));
			let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
			let readyOption = {
				onActionCallback: ()=>{doUpdateAutoApply({templateId: tmItem.Value, state: 1});},
				offActionCallback: ()=>{doUpdateAutoApply({templateId: tmItem.Value, state: 0});}
			};
			let readySwitch = $(readySwitchBox).readystate(readyOption);
			$(readySwitchBox).appendTo($(tmCell));
			if (tmItem.AutoApply == 1) {
				readySwitch.onAction();
			} else {
				readySwitch.offAction();
			}

      resolve($(tmRow));
    });
  }

	const doCreatAaddNewTemplateBox = function(templateRows){
		let addNewTemplateBox = $('<div style="width: 100%; text-align: right; padding: 4px;"></div>');
		let addNewTemplateCmd = $('<input type="button" value=" + New Template " class="action-btn"/>');
		$(addNewTemplateCmd).appendTo($(addNewTemplateBox));
		$(addNewTemplateCmd).on('click', onAddNewTemplateClick);
		if (templateRows.length > 0) {
			$(addNewTemplateCmd).data('templateData', templateRows[0]);
		} else {
			$(addNewTemplateCmd).data('templateData', templateRows);
		}
		return $(addNewTemplateBox);
	}

	const doCreateTemplateTable = function(templateRows){
    return new Promise(async function(resolve, reject) {
			let myTemplateView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let tempalateHearder = doCreateHeaderRow();
			$(myTemplateView).append($(tempalateHearder));
			//let templateLists = myTemplate.Options;
			if (templateRows.length > 0) {
				for (let i=0; i < templateRows.length; i++) {
					let tmItem = templateRows[i];
					let tmRow = await doCreateTemplateItemRow(i, tmItem);
					$(myTemplateView).append($(tmRow));
				}
			} else {
				let notFoundMessage = $('<h3>ไม่พบรายการ Template ของคุณในขณะนี้</h3>')
				$(myTemplateView).append($(notFoundMessage));
			}
			resolve($(myTemplateView));
		});
	}

  const doCreateTemplatePage = function(){
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
      let myTemplatePage = $('<div style="width: 100%;"></div>');
      let myTemplate = await doCallMyTemplate();
			//console.log(myTemplate);
			if (myTemplate.status.code == 200){
				let addNewTemplateBox = doCreatAaddNewTemplateBox(myTemplate.Options);
				let myTemplateView = await doCreateTemplateTable(myTemplate.Options);
				$(myTemplatePage).append($(addNewTemplateBox));
				$(myTemplatePage).append($(myTemplateView));
				resolve($(myTemplatePage));
	      //$('body').loading('stop');
			} else if (myTemplate.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyTemplate';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doUpdateAutoApply = function(autoApplyData){
		let callUpdateTemplateAutoApplyUrl = '/api/template/autoapply/update';
		let userdata = JSON.parse(localStorage.getItem('userdata'));;
		let radioId = userdata.id;
		let rqParams = {data: {AutoApply: autoApplyData.state}, id: autoApplyData.templateId, radioId: radioId};
		common.doCallApi(callUpdateTemplateAutoApplyUrl, rqParams).then(async(response)=>{
			if (response.status.code == 200) {
				$.notify("บันทึก Template สำเร็จ", "success");
				let myTemplate = response.result.Options;
				let addNewTemplateBox = doCreatAaddNewTemplateBox(myTemplate);
				let myTemplateView = await doCreateTemplateTable(myTemplate);
				let myTemplatePage = $('<div style="width: 100%;"></div>');
				$(myTemplatePage).append($(addNewTemplateBox));
				$(myTemplatePage).append($(myTemplateView));
				$(".mainfull").empty().append($(myTemplatePage));
			} else {
				$.notify("บันทึก Template ขัดข้อง", "`error`");
			}
		});
	}

	const callCheckTemplateDuplicate = function(data){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callCheckTemplateUrl = '/api/template/check/duplicate';
			let rqParams = {data: data, radioId: radioId};
			common.doCallApi(callCheckTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					resolve(response.result);
				} else {
					$.notify("Can not find Duplicate Auto Apply Template", "`error`");
					resolve();
				}
			});
		});
	}

  return {
		/* Event Listener */
		onModifyHospitalList,
		onSaveNewCmdClick,
		/* Medthod */
    doCreateTemplateTitlePage,
    doCreateHeaderRow,
    doCallMyTemplate,
    doCreateTemplatePage
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/utilmod.js":7,"../main.js":11}],22:[function(require,module,exports){
/* websocketmessage.js */
module.exports = function ( jq, wsm) {
	const $ = jq;

	const wrtcCommon = require('../../case/mod/wrtc-common.js')(jq);

  const onMessageRadio = function (msgEvt) {
		let userdata = JSON.parse(localStorage.getItem('userdata'));
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
		} else if (data.type == 'refresh') {
			let eventName = 'triggercounter'
			let triggerData = {caseId : data.caseId, statusId: data.statusId, thing: data.thing};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
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
		} else if (data.type == 'ping') {
			/*
			if ((userdata.userprofiles) && (userdata.userprofiles.length > 0)) {
				let minuteLockScreen = Number(userdata.userprofiles[0].Profile.lockState.autoLockScreen);
				let minuteLogout = Number(userdata.userprofiles[0].Profile.offlineState.autoLogout);
				let tryLockModTime = (Number(data.counterping) % Number(minuteLockScreen));
				if (data.counterping == minuteLockScreen) {
					let eventName = 'lockscreen';
		      let evtData = {};
		      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
		      document.dispatchEvent(event);
				} else if (tryLockModTime == 0) {
					let eventName = 'lockscreen';
		      let evtData = {};
		      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
		      document.dispatchEvent(event);
				}
				if (minuteLogout > 0){
					if (data.counterping == minuteLogout) {
						let eventName = 'autologout';
			      let evtData = {};
			      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			      document.dispatchEvent(event);
					}
				}
			}
			*/
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
		} else if (data.type == 'unlockscreen') {
			let eventName = 'unlockscreen';
			let evtData = {};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			document.dispatchEvent(event);
		} else if (data.type == 'updateuserprofile') {
			let eventName = 'updateuserprofile';
			let evtData = data.profile;
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			document.dispatchEvent(event);
		} else if (data.type == 'message') {
			$.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
			doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
			/* จุดระวัง */
			/* จุด Swap หรือ จุดไขว้ค่า myId กับ audienceId ระหว่าง sendto กับ from */
			let newConversationData = {topicId: data.context.topicId, topicName: data.context.topicName, topicType: data.context.topicType, topicStatusId: data.context.topicStatusId, audienceId: data.context.myId, audienceName: data.context.myName, myId: data.context.audienceId, myName: data.context.audienceName };
			newConversationData.message = {msg: data.msg, from: data.from, context: data.context};
			$('#ContactContainer').trigger('newconversation', [newConversationData]);
		} else if (data.type == 'clientresult') {
			let eventName = 'clientresult';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result}});
			document.dispatchEvent(event);
		} else if (data.type == 'logreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'echoreturn') {
			let eventName = 'echoreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'newreportlocalresult') {
			let eventName = 'newreportlocalresult';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: {result: data.result, hospitalId: data.hospitalId, from: data.from, patientFullName: data.patientFullName}}});
			document.dispatchEvent(event);
		} else if (data.type == 'newreportlocalfail') {
			let eventName = 'newreportlocalfail';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: {result: data.result, hospitalId: data.hospitalId, from: data.from, patientFullName: data.patientFullName}}});
			document.dispatchEvent(event);
		} else if (data.type == 'wrtc') {
			switch(data.wrtc) {
				//when somebody wants to call us
				case "offer":
					wrtcCommon.wsHandleOffer(wsm, data.offer);
				break;
				case "answer":
					wrtcCommon.wsHandleAnswer(wsm, data.answer);
				break;
				//when a remote peer sends an ice candidate to us
				case "candidate":
					wrtcCommon.wsHandleCandidate(wsm, data.candidate);
				break;
				case "interchange":
					wrtcCommon.wsHandleInterchange(wsm, data.interchange);
				break;
				case "leave":
					wrtcCommon.wsHandleLeave(wsm, data.leave);
				break;
			}
    }
  };

	const doSaveMessageToLocal = function(msg ,from, topicId, status){
		let localMsgStorage = localStorage.getItem('localmessage');
		if ((localMsgStorage) && (localMsgStorage !== '')) {
			let localMessage = JSON.parse(localMsgStorage);
			//console.log(localMessage);
			let localMessageJson = localMessage;
			if (localMessageJson) {
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			} else {
				localMessageJson = [];
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			}
			localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
		} else {
			let firstFocalMessageJson = [];
			firstFocalMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			localStorage.setItem('localmessage', JSON.stringify(firstFocalMessageJson));
		}
	}

  return {
    onMessageRadio
	}
}

},{"../../case/mod/wrtc-common.js":10}],23:[function(require,module,exports){
/* welcomelib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
	const common = require('../../case/mod/commonlib.js')($);
	const caseCounter = require('./onrefreshtrigger.js')($);
	const wrtcCommon = require('../../case/mod/wrtc-common.js')($);

	let newstatusCases = [];
  let accstatusCases = [];
	let newConsult = [];

	//let dicomzipsync = [];

  const doCreateHomeTitlePage = function() {
    const welcomeTitle = 'ยินดีต้อนรับเข้าสู่ระบบ Rad Connext';
    let homeTitle = $('<div></div>');
    let logoPage = $('<img src="/images/home-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(homeTitle));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + welcomeTitle + '</h3></div>');
    $(titleText).appendTo($(homeTitle));

		$('.case-counter').hide();
		$('.consult-counter').hide();

    return $(homeTitle);
  }

	const doShowCaseCounter = function(){
    if (newstatusCases.length > 0) {
    	$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(newstatusCases.length);
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }

    if (accstatusCases.length > 0) {
			$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').text(accstatusCases.length);
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }
  }

	/** Case Event Counter **/
  const onCaseChangeStatusTrigger = function(evt) {
		let triggerData = evt.detail.data;
		let caseId = triggerData.caseId;
		let statusId = triggerData.statusId;
		let thing = triggerData.thing;

    let indexAt = undefined;
    switch (Number(statusId)) {
      case 1:
        if (newstatusCases.indexOf(Number(caseId)) < 0) {
					if (thing === 'case') {
          	newstatusCases.push(caseId);
					} else if (thing === 'consult'){
						newConsult.push(caseId);
					}
        }
      break;
      case 2:
			case 8:
      case 9:
      case 13:
			case 14:
				if (thing === 'case') {
	        if (accstatusCases.indexOf(Number(caseId)) < 0) {
	          accstatusCases.push(caseId);
	        }
	        indexAt = newstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          newstatusCases.splice(indexAt, 1);
	        }
				} else if (thing === 'consult'){
					indexAt = newConsult.indexOf(caseId);
					if (indexAt > -1) {
	          newConsult.splice(indexAt, 1);
	        }
				}
      break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 10:
      case 11:
      case 12:
				if (thing === 'case') {
	        indexAt = newstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          newstatusCases.splice(indexAt, 1);
	        }
	        indexAt = accstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          accstatusCases.splice(indexAt, 1);
	        }
				} else if (thing === 'consult'){
					indexAt = newConsult.indexOf(caseId);
					if (indexAt > -1) {
	          newConsult.splice(indexAt, 1);
	        }
				}
      break;
    }
    doShowCaseCounter();
  }

	const doLoadCaseForSetupCounter = function(userId){
		return new Promise(async function(resolve, reject) {
			let loadUrl = '/api/cases/load/list/by/status/radio';
			let rqParams = {userId: userId};
			rqParams.casestatusIds = [[1], [2, 8, 9, 13, 14]];
			/*
			rqParams.casestatusIds = [1];
			let newList = await common.doCallApi(loadUrl, rqParams);
			if (newList.status.code == 200){
			*/
			let allStatusList = await apiconnector.doCallApiDirect(loadUrl, rqParams);
			//let allStatusList = await common.doCallApi(loadUrl, rqParams);
			if (allStatusList.status.code == 200){
				/*
				rqParams.casestatusIds = [2, 8, 9, 13, 14];
				let accList = await common.doCallApi(loadUrl, rqParams);
				*/
				loadUrl = '/api/consult/load/list/by/status/radio';
				rqParams = {userId: userId};
				rqParams.casestatusIds = [1];
				let newConsultList = await apiconnector.doCallApiDirect(loadUrl, rqParams);
				//let newConsultList = await common.doCallApi(loadUrl, rqParams);
				resolve({newList: allStatusList.Records[0], accList:allStatusList.Records[1], newConsultList});
			} else 	if (allStatusList.status.code == 210) {
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at /api/cases/load/list/by/status/radio';
				console.log(apiError);
				reject({error: apiError});
			}
		});
	}

	const doSetupCounter = function() {
		return new Promise(async function(resolve, reject) {
			//$('body').loading('start');
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			doLoadCaseForSetupCounter(userId).then(async (myList)=>{
				//console.log(myList);
				newstatusCases = [];
			  accstatusCases = [];

				newConsult = [];

				//dicomzipsync = [];

				await myList.newList.Records.forEach((item, i) => {
					newstatusCases.push(Number(item.id));
				});
				await myList.accList.Records.forEach((item, i) => {
					accstatusCases.push(Number(item.id));
					//let newDicomZipSync = {caseId: item.id, studyID: item.Case_OrthancStudyID};
					//dicomzipsync.push(newDicomZipSync);
				});
				myList.newConsultList.Records.forEach((item, i) => {
					newConsult.push(Number(item.id));
				});
				//localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
				caseCounter.doShowCaseCounter(newstatusCases, accstatusCases, newConsult);
				//$('body').loading('stop');
				resolve(myList);
			}).catch((err)=>{
				reject(err);
			});
		});
	}
	/** Case event Counter **/

	/** Zoom Calle Event **/
	const doInterruptZoomCallEvt = function(evt) {
		//$('body').loading('start');
		const main = require('../main.js');
		let myWsm = main.doGetWsm();

		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<p>คุณมีสายเรียกเข้าเพื่อ Conference ทาง Zoom</p>'));
		$(radAlertMsg).append($('<p>คลิก ตกลง เพื่อรับสายและเปิด Zoom Conference</p>'));
		$(radAlertMsg).append($('<p>หรือ คลิก ยกเลิก เพื่อปฏิเสธการรับสาย</p>'));
		const radconfirmoption = {
			title: 'Zoom Conference',
			msg: $(radAlertMsg),
			width: '420px',
			onOk: function(evt) {
				let callData = evt.detail.data;
				alert('Password ในการเข้าร่วม Conference คิอ ' + callData.password + '\n');
				window.open(callData.openurl, '_blank');
				//Say yes back to caller
				let callZoomMsg = {type: 'callzoomback', sendTo: callData.sender, result: 1};
				myWsm.send(JSON.stringify(callZoomMsg));
				//$('body').loading('stop');
				radConfirmBox.closeAlert();
			},
			onCancel: function(evt){
				let callZoomMsg = {type: 'callzoomback', sendTo: callData.sender, result: 0};
				myWsm.send(JSON.stringify(callZoomMsg));
				//$('body').loading('stop');
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

	let dlgContent = undefined;

	const doInterruptWebRTCCallEvt = function(evt){
		//$('body').loading('start');
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const main = require('../main.js');
		const wsm = main.doGetWsm();
		//wrtcCommon.doSetupWsm(wsm);

		let callData = evt.detail.data;
		//console.log(callData);

		wrtcCommon.doCheckBrowser().then((stream)=>{
			if (stream) {
				$('head').append('<script src="../lib/RecordRTC.min.js"></script>');
				wrtcCommon.doSetupUserMediaStream(stream);
				let userJoinOption = {joinType: 'callee', joinMode: 'share', joinName: userdata.username, audienceName: callData.sender, userMediaStream: stream};
				wrtcCommon.doSetupUserJoinOption(userJoinOption);

				let webrtcBox = undefined;

				if (!dlgContent) {
					dlgContent = doCreateWebRCTDlgContent();
					let radwebrctoption = {
						title: 'Video Conference [' + callData.topic + ']',
						msg: $(dlgContent),
						width: '620px',
						onOk: function(evt) {
							/*
							if (wrtcCommon.doGetRecorder()) {
								await wrtcCommon.doGetRecorder().stopRecording();
								let blob = await wrtcCommon.doGetRecorder().getBlob();
								if ((blob) && (blob.size > 0)) {
				          invokeSaveAsDialog(blob);
				        }
							}
							*/
							if (wrtcCommon.doGetDisplayMediaStream()){
								wrtcCommon.doGetDisplayMediaStream().getTracks().forEach(function(track) {
		  						track.stop();
								});
							}
							if (wrtcCommon.doGetUserMediaStream()){
								wrtcCommon.doGetUserMediaStream().getTracks().forEach(function(track) {
		  						track.stop();
								});
							}
							if (wrtcCommon.doGetRemoteConn()) {
								wrtcCommon.doGetRemoteConn().close();
							}
							wrtcCommon.doCreateLeave(wsm);
							webrtcBox.closeAlert();
						}
					}
					webrtcBox = $('body').radalert(radwebrctoption);
					$(webrtcBox.cancelCmd).hide();
				}
				let myVideo = document.getElementById("MyVideo");
				myVideo.srcObject = wrtcCommon.doGetUserMediaStream();

				let shareCmd = wrtcCommon.doCreateShareScreenCmd();
				$(shareCmd).on('click', (evt)=>{
					wrtcCommon.onShareCmdClickCallback((myDisplayMediaStream)=>{
						if (wrtcCommon.doGetDisplayMediaStream()){
							wrtcCommon.doGetDisplayMediaStream().getTracks().forEach(function(track) {
								track.stop();
							});
						}
						wrtcCommon.doCreateInterChange(wsm);
						wrtcCommon.doSetupDisplayMediaStream(myDisplayMediaStream);
					  let streams = [wrtcCommon.doGetDisplayMediaStream(), wrtcCommon.doGetUserMediaStream()];
						let localMergedStream = wrtcCommon.doMixStream(streams);
					  let myVideo = document.getElementById("MyVideo");
						let lastStream = myVideo.srcObject;
					  myVideo.srcObject = localMergedStream;
						setTimeout(()=>{
							let myRemoteConn = wrtcCommon.doGetRemoteConn();
							if (myRemoteConn) {
								myRemoteConn.removeStream(lastStream);
								localMergedStream.getTracks().forEach((track) => {
						      myRemoteConn.addTrack(track, localMergedStream);
						    });
								$(startCmd).click();
							} else {
						    myRemoteConn = wrtcCommon.doInitRTCPeer(localMergedStream, wsm);
								localMergedStream.getTracks().forEach((track) => {
						      myRemoteConn.addTrack(track, localMergedStream);
						    });
						    wrtcCommon.doSetupRemoteConn(myRemoteConn);
								$(startCmd).click();
							}
						}, 500);
						$(shareCmd).show();
						$(startCmd).hide();
						$(endCmd).show();
					});
				});
				let startCmd = wrtcCommon.doCreateStartCallCmd();
				$(startCmd).on('click', (evt)=>{
					userJoinOption.joinType = 'caller'
					wrtcCommon.doSetupUserJoinOption(userJoinOption);
					wrtcCommon.doCreateOffer(wsm)
					$(shareCmd).show();
					$(startCmd).hide();
					$(endCmd).show();
				});
				let endCmd = wrtcCommon.doCreateEndCmd();
				$(endCmd).on('click', async (evt)=>{
					if (wrtcCommon.doGetDisplayMediaStream()) {
						wrtcCommon.doGetDisplayMediaStream().getTracks().forEach((track) => {
				      track.stop();
				    });
					}
					let lastStream = myVideo.srcObject;
					let remoteConn = wrtcCommon.doGetRemoteConn();
					remoteConn.removeStream(lastStream);
					let myUserMediaStream = wrtcCommon.doGetUserMediaStream();
					if (myUserMediaStream) {
						myUserMediaStream.getTracks().forEach((track) => {
				      remoteConn.addTrack(track, myUserMediaStream);
				    });
					}
					wrtcCommon.doCreateInterChange(wsm);
					//$(startCmd).click();

					let myRemoteTracks = wrtcCommon.doGetRemoteTracks();
					let newStream = new MediaStream();
					myRemoteTracks.forEach((track) => {
						newStream.addTrack(track)
			    });

					myVideo.srcObject = wrtcCommon.doMixStream([newStream, myUserMediaStream]);

					$(shareCmd).show();
					$(startCmd).hide();
					$(endCmd).show();
				});

				$(dlgContent).find('#CommandBox').append($(shareCmd).hide());
				$(dlgContent).find('#CommandBox').append($(startCmd).hide());
				$(dlgContent).find('#CommandBox').append($(endCmd).hide());

				let myRemoteConn = wrtcCommon.doInitRTCPeer(wrtcCommon.doGetUserMediaStream(), wsm);
				wrtcCommon.doSetupRemoteConn(myRemoteConn);

				setTimeout(() => {
					wrtcCommon.doCreateOffer(wsm);
					//$('body').loading('stop');
				}, 7500);
			} else {
				$.notify('เว็บบราวเซอร์ของคุณไม่รองรับการใช้งานฟังก์ชั่นนี้', 'error');
				//$('body').loading('stop');
			}
		});
	}

	const doCreateWebRCTDlgContent = function(){
		let wrapper = $('<div id="WebRCTBox" style="width: 100%"></div>');
		let myVideoElem = $('<video id="MyVideo" width="620" height="350" autoplay/>')/*.css({'border': '1px solid blue'})*/;
		let videoCmdBox = $('<div id="CommandBox" style="width: 100%; text-align: center;"></div>');
		return $(wrapper).append($(myVideoElem)).append($(videoCmdBox));
	}

	/*
	const onDisplayMediaSuccess = function(stream){
  	let vw, vh;
	  let myVideo = document.getElementById("MyVideo");
		stream.getTracks().forEach(function(track) {
	    track.addEventListener('ended', function() {
	      console.log('Stop Stream.');
	    }, false);
	  });

	  wrtcCommon.displayMediaStream = stream;

	  let streams = [wrtcCommon.displayMediaStream, wrtcCommon.userMediaStream];
	  let myMerger = wrtcCommon.streamMerger.CallcenterMerger(streams, wrtcCommon.mergeOption);
	  wrtcCommon.localMergedStream = myMerger.result
	  myVideo.srcObject = wrtcCommon.localMergedStream;
		myVideo.addEventListener( "loadedmetadata", function (e) {
	    vw = this.videoWidth;
	    vh = this.videoHeight;
	    myVideo.width = vw;
	    myVideo.height = vh;
	  });
	}
*/

  return {
		/*
		newstatusCases,
	  accstatusCases,
		*/

		doCreateHomeTitlePage,
		onCaseChangeStatusTrigger,
		doSetupCounter,
		doInterruptZoomCallEvt,
		doInterruptWebRTCCallEvt
	}
}

},{"../../case/mod/apiconnect.js":1,"../../case/mod/commonlib.js":2,"../../case/mod/wrtc-common.js":10,"../main.js":11,"./onrefreshtrigger.js":17}],24:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v3.5.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2020-05-04T22:49Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.5.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( _i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.5
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2020-03-14
 */
( function( window ) {
var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ( {} ).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	pushNative = arr.push,
	push = arr.push,
	slice = arr.slice,

	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[ i ] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
		"ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5]
		// or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
		whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
		"*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		return nonHex ?

			// Strip the backslash prefix from a non-hex escape sequence
			nonHex :

			// Replace a hexadecimal escape sequence with the encoded Unicode code point
			// Support: IE <=11+
			// For values outside the Basic Multilingual Plane (BMP), manually construct a
			// surrogate pair
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" +
				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android<4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;

			// Can't trust NodeList.length
			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

				// Support: IE 8 only
				// Exclude object elements
				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					if ( newContext !== context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split( "|" ),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[ i ] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( ( cur = cur.nextSibling ) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return ( name === "input" || name === "button" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
					inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem.namespaceURI,
		docElem = ( elem.ownerDocument || elem ).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
	// IE/Edge & older browsers don't support the :scope pseudo-class.
	// Support: Safari 6.0 only
	// Safari 6.0 supports :scope but it's an alias of :root there.
	support.scope = assert( function( el ) {
		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
		return typeof el.querySelectorAll !== "undefined" &&
			!el.querySelectorAll( ":scope fieldset div" ).length;
	} );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert( function( el ) {
		el.className = "i";
		return !el.getAttribute( "className" );
	} );

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert( function( el ) {
		el.appendChild( document.createComment( "" ) );
		return !el.getElementsByTagName( "*" ).length;
	} );

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter[ "ID" ] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter[ "ID" ] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find[ "TAG" ] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,

				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( ( elem = results[ i++ ] ) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert( function( el ) {

			var input;

			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll( "[selected]" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push( "~=" );
			}

			// Support: IE 11+, Edge 15 - 18+
			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
			// Adding a temporary attribute to the document before the selection works
			// around the issue.
			// Interestingly, IE 10 & older don't seem to have the issue.
			input = document.createElement( "input" );
			input.setAttribute( "name", "" );
			el.appendChild( input );
			if ( !el.querySelectorAll( "[name='']" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
					whitespace + "*(?:''|\"\")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push( ":checked" );
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push( ".#.+[+~]" );
			}

			// Support: Firefox <=3.6 - 5 only
			// Old Firefox doesn't throw on a badly-escaped identifier.
			el.querySelectorAll( "\\\f" );
			rbuggyQSA.push( "[\\r\\n\\f]" );
		} );

		assert( function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement( "input" );
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll( "[name=d]" ).length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: Opera 10 - 11 only
			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll( "*,:x" );
			rbuggyQSA.push( ",.*:" );
		} );
	}

	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector ) ) ) ) {

		assert( function( el ) {

			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		} );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			) );
		} :
		function( a, b ) {
			if ( b ) {
				while ( ( b = b.parentNode ) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a == document || a.ownerDocument == preferredDoc &&
				contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b == document || b.ownerDocument == preferredDoc &&
				contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			return a == document ? -1 :
				b == document ? 1 :
				/* eslint-enable eqeqeq */
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( ( cur = cur.parentNode ) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( ( cur = cur.parentNode ) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[ i ] === bp[ i ] ) {
			i++;
		}

		return i ?

			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[ i ], bp[ i ] ) :

			// Otherwise nodes in our document sort first
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			ap[ i ] == preferredDoc ? -1 :
			bp[ i ] == preferredDoc ? 1 :
			/* eslint-enable eqeqeq */
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

				// As well, disconnected nodes are said to be in a document
				// fragment in IE 9
				elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			( val = elem.getAttributeNode( name ) ) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {

		// If no nodeType, this is expected to be an array
		while ( ( node = elem[ i++ ] ) ) {

			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {

			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
				match[ 5 ] || "" ).replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					Sizzle.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

				// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				Sizzle.error( match[ 0 ] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace +
					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
						className, function( elem ) {
							return pattern.test(
								typeof elem.className === "string" && elem.className ||
								typeof elem.getAttribute !== "undefined" &&
									elem.getAttribute( "class" ) ||
								""
							);
				} );
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				/* eslint-disable max-len */

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
				/* eslint-enable max-len */

			};
		},

		"CHILD": function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || ( node[ expando ] = {} );

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								( outerCache[ node.uniqueID ] = {} );

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {

								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || ( node[ expando ] = {} );

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									( outerCache[ node.uniqueID ] = {} );

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												( outerCache[ node.uniqueID ] = {} );

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		"not": markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element (issue #299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		"has": markFunction( function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		} ),

		"contains": markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement &&
				( !document.hasFocus || document.hasFocus() ) &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return ( nodeName === "input" && !!elem.checked ) ||
				( nodeName === "option" && !!elem.selected );
		},

		"selected": function( elem ) {

			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {

			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos[ "empty" ]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		"last": createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		"even": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"odd": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rcombinators.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :

			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] ||
							( outerCache[ elem.uniqueID ] = {} );

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = uniqueCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts(
				selector || "*",
				context.nodeType ? [ context ] : context,
				[]
			),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?

				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
					tokens
						.slice( 0, i - 1 )
						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache(
			selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers )
		);

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
				.replace( runescape, funescape ), context ) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
						context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert( function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute( "href" ) === "#";
} ) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	} );
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert( function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
} ) ) {
	addHandle( "value", function( elem, _name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	} );
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert( function( el ) {
	return el.getAttribute( "disabled" ) == null;
} ) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
				( val = elem.getAttributeNode( name ) ) && val.specified ?
					val.value :
					null;
		}
	} );
}

return Sizzle;

} )( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
					dataPriv.get( this, "events" ) || Object.create( null )
				)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();
						return result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px";
				tr.style.height = "1px";
				trChild.style.height = "9px";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = (
					dataPriv.get( cur, "events" ) || Object.create( null )
				)[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {

				// Handle: regular nodes (via `this.ownerDocument`), window
				// (via `this.document`) & document (via `this`).
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script
			if ( !isSuccess && jQuery.inArray( "script", s.dataTypes ) > -1 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			if ( typeof props.top === "number" ) {
				props.top += "px";
			}
			if ( typeof props.left === "number" ) {
				props.left += "px";
			}
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

},{}],25:[function(require,module,exports){
/* websocketmessage.js */
module.exports = function ( jq, wsm ) {
	const $ = jq;

	const wrtcCommon = require('../../case/mod/wrtc-common.js')(jq);

  const onMessageRefer = function (msgEvt) {
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
		} else if (data.type == 'ping') {
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
		} else if (data.type == 'refresh') {
			let eventName = 'triggercounter'
			let triggerData = {caseId : data.caseId, statusId: data.statusId};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);

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
		} else if (data.type == 'ping') {
      console.log('Ping Data =>', data);
		} else if (data.type == 'unlockscreen') {

    } else if (data.type == 'message') {
      $.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
			doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
      let eventData = {msg: data.msg, from: data.from, context: data.context};
      $('#SimpleChatBox').trigger('messagedrive', [eventData]);
		} else if (data.type == 'wrtc') {
			switch(data.wrtc) {
				//when somebody wants to call us
				case "offer":
					wrtcCommon.wsHandleOffer(wsm, data.offer);
				break;
				case "answer":
					wrtcCommon.wsHandleAnswer(wsm, data.answer);
				break;
				//when a remote peer sends an ice candidate to us
				case "candidate":
					wrtcCommon.wsHandleCandidate(wsm, data.candidate);
				break;
				case "interchange":
					wrtcCommon.wsHandleInterchange(wsm, data.interchange);
				break;
				case "leave":
					wrtcCommon.wsHandleLeave(wsm, data.leave);
				break;
			}
    }
  };

	const doSaveMessageToLocal = function(msg ,from, topicId, status){
		let localMsgStorage = localStorage.getItem('localmessage');
		if ((localMsgStorage) && (localMsgStorage !== '')) {
			let localMessage = JSON.parse(localMsgStorage);
			//console.log(localMessage);
			let localMessageJson = localMessage;
			if (localMessageJson) {
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			} else {
				localMessageJson = [];
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			}
			localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
		} else {
			let firstFocalMessageJson = [];
			firstFocalMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			localStorage.setItem('localmessage', JSON.stringify(firstFocalMessageJson));
		}
	}

  return {
    onMessageRefer
	}
}

},{"../../case/mod/wrtc-common.js":10}]},{},[11]);
