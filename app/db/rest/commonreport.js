const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const requester = require('requests');
//const PDFParser = require('pdf2json');
const countPages = require('page-count');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//const cheerio = require('cheerio');

var log, db, websocket, uti, common;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const doCountPagePdf = function(pdfFile){
  return new Promise(async function(resolve, reject) {
    /*
    let pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', function(data) {
      let pageCount = data && data.Pages && data.Pages.length ? data.Pages.length : 0;
      resolve(pageCount);
    });
    pdfParser.loadPDF(pdfFile);
    */
    const pdfBuffer = fs.readFileSync(pdfFile);
    const pageCount = await countPages.count(pdfBuffer);
    resolve(pageCount);
  });
}

const doLoadVariable = function(caseId, responseId, userId){
  return new Promise(async function(resolve, reject) {
    const userInclude = [{model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']}];
    const caseInclude = [{model: db.hospitals, attributes: ['Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
    try {
      const cases = await db.cases.findAll({include: caseInclude, where: {id: caseId}});
      const refes = await db.users.findAll({include: userInclude, where: {id: cases[0].Case_RefferalId}});
      const rades = await db.users.findAll({include: userInclude, where: {id: cases[0].Case_RadiologistId}});
      const caseRes = await db.caseresponses.findAll({attributes: ['id', 'Response_HTML', 'Response_A4Height', 'updatedAt'], where: {id: responseId}});
      const PatientFullNameEN = cases[0].patient.Patient_NameEN + ' ' + cases[0].patient.Patient_LastNameEN;
      const PatientFullNameTH = cases[0].patient.Patient_NameTH + ' ' + cases[0].patient.Patient_LastNameTH;
      let PatientFullNameENTH;
      if (PatientFullNameEN) {
        PatientFullNameENTH = PatientFullNameEN;
      } else {
        PatientFullNameENTH = PatientFullNameTH;
      }
      //log.info('cases[0].createdAt=>' + cases[0].createdAt);
      let scanDateText = uti.doFormateDateThaiZone(cases[0].createdAt);
      //log.info('scanDateText=>' + scanDateText);
      let reportDateTimeText = uti.doFormateDateTimeThaiZone(caseRes[0].updatedAt);
      let patientBirthDate = uti.formatBirthDateThai(cases[0].patient.Patient_Birthday);
      let patientAge = uti.formatAgeThai(cases[0].patient.Patient_Birthday);
      //log.info('Case_ScanPart => ' + JSON.stringify(cases[0].Case_ScanPart));
      let scanparts = [];
      if (typeof cases[0].Case_ScanPart.length === 'string') {
        let tmps = [];
        let scpl = Number(cases[0].Case_ScanPart.length);
        for (let i=0; i < scpl; i++){
          if (cases[0].Case_ScanPart[i].Code) {
            tmps.push(cases[0].Case_ScanPart[i]);
          }
        }
        scanparts = tmps;
      } else {
        scanparts = cases[0].Case_ScanPart;
      }
      //log.info('scanparts => ' + JSON.stringify(scanparts));
      let scanpartText = '';
      await scanparts.forEach((item, i) => {
        if (i == 0) {
          scanpartText = '1. ' + item.Name;
        } else {
          scanpartText = scanpartText + ' ' + (i+1) + '. ' + item.Name;
        }
      });
      //log.info('scanpartText => ' + scanpartText);
      const variable = {
        hospital_name: cases[0].hospital.Hos_Name,
        patient_name: PatientFullNameEN,
        patient_name_th: PatientFullNameTH,
        patient_name_en_th: PatientFullNameENTH,
        patient_hn: cases[0].patient.Patient_HN,
        patient_gender: cases[0].patient.Patient_Sex,
        patient_age: patientAge,
        patient_birthdate: patientBirthDate,
        patient_rights: cases[0].cliameright.CR_Name,
        patient_dept: cases[0].Case_Department,
        patient_doctor: refes[0].userinfo.User_NameTH + ' ' + refes[0].userinfo.User_LastNameTH,
        scan_date: scanDateText,
        scan_protocol: cases[0].Case_ProtocolName,
        accessionNo: cases[0].Case_ACC,
        report_by: rades[0].userinfo.User_NameTH + ' ' + rades[0].userinfo.User_LastNameTH,
        result: caseRes[0].Response_HTML,
        rsH: caseRes[0].Response_A4Height,
        scan_part: scanpartText,
        report_datetime: reportDateTimeText
      }
      resolve(variable);
    } catch(error) {
      log.error('doLoadVariable error => ' + error);
      reject({error: error});
    }
  });
}

const reportCreator = function(elements, variable, pdfFileName, caseId, rsH){
	return new Promise(async function(resolve, reject) {
		const publicDir = path.normalize(__dirname + '/../../../public');

    /*
		const qrgenerator = require('../../lib/qrcodegenerator.js');
		const qrcontent = 'https://radconnext.info/portal?caseId=' + caseId;

    const qrcodeFullPath = process.env.USRQRCODE_PATH + '/' + pdfFileName + '.png';
    if (fs.existsSync(qrcodeFullPath)) {
      await fs.unlinkSync(qrcodeFullPath);
    }
    log.info('qrcodeFullPath=>' + qrcodeFullPath);

		const qrcode = await qrgenerator(qrcontent, pdfFileName);
		const qrlink = qrcode.qrlink;
    */

    const qrlink = undefined;

		const fileNames = pdfFileName.split('.');
		const usrPdfPath = publicDir + process.env.USRPDF_PATH;
		const htmlFileName = fileNames[0] + '.html';
		const reportHtmlLinkPath = process.env.USRPDF_PATH + '/' + htmlFileName;

    let oldHtmlFilePath = usrPdfPath + '/' + htmlFileName;
    log.info('oldHtmlFilePath=>' + oldHtmlFilePath);
		if (fs.existsSync(oldHtmlFilePath)) {
			await fs.unlinkSync(oldHtmlFilePath);
	  }
    let oldPdfFilePath = usrPdfPath + '/' + pdfFileName;
    log.info('oldPdfFilePath=>' + oldPdfFilePath);
		if (fs.existsSync(oldPdfFilePath)) {
			await fs.unlinkSync(oldPdfFilePath);
		}

		var html = '<!DOCTYPE html><head></head><body><div id="report-wrapper"></div></body>';
		var _window = new JSDOM(html, { runScripts: "dangerously", resources: "usable" }).window;
		/* ************************************************************************* */
		/* Add scripts to head ***************************************************** */
		var jsFiles = [
					publicDir + '/lib/jquery.js',
					publicDir + '/lib/jquery-ui.min.js',
					publicDir + '/report-design/jquery-report-plugin.js',
					publicDir + '/report-design/report-generator.js'
				];
		var scriptsContent = ``;
		for(var i =0; i< jsFiles.length;i++){
			let scriptContent = fs.readFileSync( jsFiles[i], 'utf8');
			scriptsContent = scriptsContent + `
			/* ******************************************************************************************* */
			/* `+jsFiles[i]+` **************************************************************************** */
			`+scriptContent;
		};
		let scriptElement = _window.document.createElement('script');
		scriptElement.textContent = scriptsContent;
		_window.document.head.appendChild(scriptElement);
    let stylesheetFile = publicDir + '/report-design/report.css'
    let stylesheetsContent = fs.readFileSync( stylesheetFile, 'utf8');
    let stylesheetElement = _window.document.createElement('style');
    _window.document.head.appendChild(stylesheetElement);

		/* ************************************************************************* */
		/* Run page **************************************************************** */
		_window.document.addEventListener('DOMContentLoaded', () => {
			log.info('main says: DOMContentLoaded');
			// We need to delay one extra turn because we are the first DOMContentLoaded listener,
			// but we want to execute this code only after the second DOMContentLoaded listener
			// (added by external.js) fires.
			//_window.sayBye('OK Boy'); // prints "say-hello.js says: Good bye!"
			//_window.doSetReportParams(hospitalId, caseId, userId);
			//_window.doLoadReportFormat(hospitalId, (reportHTML) =>{
			log.info("Start Create Html Report.");
			_window.doMergeContent(elements, variable, qrlink, caseId, rsH, async (reportHTML, reportPages) =>{
				/******/
				var writerStream = fs.createWriteStream(usrPdfPath + '/' + htmlFileName);
				var reportContent = '<!DOCTYPE html>\n<html>\n<head>\n<link href="../../../report-design/report.css" rel="stylesheet">\n</head>\n<body>\n<div id="report-wrapper">\n' + reportHTML + '\n</div>\n</body>\n</html>';
				writerStream.write(reportContent,'UTF8');
				writerStream.end();
				writerStream.on('finish', function() {
          log.info("Write HTML Report file completed.");
          //_window.doCheckContent();

          log.info("Start Create Pdf Report.");

					const reportPdfFilePath = usrPdfPath + '/' + pdfFileName;
					const reportPdfLinkPath = process.env.USRPDF_PATH + '/' + pdfFileName;

					const creatReportCommand = uti.fmtStr('xvfb-run wkhtmltopdf -s A4 http://localhost:8080%s %s', reportHtmlLinkPath, reportPdfFilePath);

					log.info('Create pdf report file with command => ' + creatReportCommand);
					uti.runcommand(creatReportCommand).then(async (cmdout) => {
            //log.info('reportPages=> ' + reportPages);
            //setTimeout(async ()=>{
              let pdfPage = await doCountPagePdf(reportPdfFilePath);
              log.info('pdfPage=> ' + pdfPage);
  						log.info("Create Pdf Report file Success.");
  						resolve({reportPdfLinkPath: reportPdfLinkPath, reportHtmlLinkPath: reportHtmlLinkPath, reportPages: /*reportPages*/pdfPage});
            //}, 1000);
					}).catch((cmderr) => {
						log.error('cmderr: 500 >>', cmderr);
						reject(cmderr);
					});

        });
				writerStream.on('error', function(err){ log.error(err.stack); });
			});
		});
	});
}

const doAppendBlankPageToHtmlFile = function(htmlFileName, pages){
  return new Promise(async function(resolve, reject) {
		const publicDir = path.normalize(__dirname + '/../../../public');

    let htmlFileLink = 'http://localhost:8080/img/usr/pdf/' + htmlFileName;
    let loadHtmlOptions = { runScripts: "dangerously", resources: "usable" };
    //let loadHtmlOptions = {contentType: "text/html",};
    JSDOM.fromURL(htmlFileLink, loadHtmlOptions).then(dom => {
      //log.info('FullHTML=>' +dom.serialize());
      const document = dom.window.document;
      let reportWrapper = document.querySelector("#report-wrapper");
      let wrapperHTML = reportWrapper.innerHTML;
      let link = document.querySelector("#radio-link");
      let linkStyleTop = link.style.top;
      let expr  = /(\d*\.?\d*)(.*)/;
      let r = linkStyleTop.match(expr );
      linkStyleTop = (Number(r[1]) + 70) + 'px';
      for (i=0; i<pages; i++){
        wrapperHTML += '\n<div class="blankPage" style="top: ' + linkStyleTop + '"><h2 class="unuse-text">Unuse</h2></div>';
      }
      let reportContent = '<!DOCTYPE html>\n<html>\n<head>\n<link href="/report-design/report.css" rel="stylesheet">\n</head>\n<body>\n<div id="report-wrapper">\n' + wrapperHTML + '\n</div>\n</body>\n</html>';
      log.info('reportContent=>' + reportContent);
      const usrPdfPath = publicDir + process.env.USRPDF_PATH;

      let writerStream = fs.createWriteStream(usrPdfPath + '/' + htmlFileName);

      writerStream.write(reportContent,'UTF8');
      writerStream.end();
      writerStream.on('finish', function() {
        log.info("Re-Write Report HTML file completed.");
        //_window.doCheckContent();
        log.info("Start Re-Create Pdf Report.");
        let fileNameFrags = htmlFileName.split('.');
        let pdfFileName = fileNameFrags[0] + '.pdf';
        let reportPdfFilePath = usrPdfPath + '/' + pdfFileName;
        let reportPdfLinkPath = process.env.USRPDF_PATH + '/' + pdfFileName;
        let reportHtmlLinkPath = process.env.USRPDF_PATH + '/' + htmlFileName;

        let creatReportCommand = uti.fmtStr('xvfb-run wkhtmltopdf -s A4 http://localhost:8080/%s %s', reportHtmlLinkPath, reportPdfFilePath);

        log.info('Re-Create pdf report file with command => ' + creatReportCommand);
        uti.runcommand(creatReportCommand).then(async (cmdout) => {
          //setTimeout(async ()=>{
            let pdfPage = await doCountPagePdf(reportPdfFilePath);
            log.info('pdfPage=> ' + pdfPage);
            log.info("Re-Create Pdf Report file Success.");
            resolve({reportPdfLinkPath: reportPdfLinkPath, reportHtmlLinkPath: reportHtmlLinkPath, reportPages: /*reportPages*/pdfPage});
          //}, 1000);
        }).catch((cmderr) => {
          log.error('cmderr: 500 >>', cmderr);
          reject(cmderr);
        });
      });
      writerStream.on('error', function(err){ log.error(err.stack); });
      /*
      setTimeout(async ()=>{
      }, 3000);
      */
    });
  });
}

const dicomConvertor = function(studyID, modality, fileCode, hospitalId, hostname, pdfPages, seriesInstanceUIDs, sopInstanceUIDs) {
	return new Promise(async function(resolve, reject) {
    /*
		const orthanc = await uti.doLoadOrthancTarget(hospitalId, hostname);
		const cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let dicomport = cloud.dicomport;
		if ((hostname === 'localhost') || (hostname.indexOf('192.168') >= 0)){
			dicomport = cloud.dicomportex;
		}
    */
		//const orthancs = await db.orthancs.findAll({ attributes: excludeColumn, where: {hospitalId: hospitalId}});
		//ip: "202.28.68.28", httpport: "8042", dicomport: "4242", user: "demo", pass: "demo", portex : "8042"};
		//const cloud = JSON.parse(orthancs[0].Orthanc_Cloud)
    /*
		const ORTHANC_URL =  'http://' + cloud.ip + ':' + cloud.httpport;
		const USERPASS = cloud.user + ':' + cloud.pass;
		const publicDir = path.normalize(__dirname + '/../../../public');
		const USRPDF_PATH = process.env.USRPDF_PATH;
		const pdfFileName = fileCode + '.pdf';
    let pdfLink = USRPDF_PATH + '/' + pdfFileName;
		let outterCommand = 'curl --user ' + USERPASS + ' ' + ORTHANC_URL + '/studies/' + studyID;
		log.info('run command => ' + outterCommand);
		uti.runcommand(outterCommand).then((stdout) => {
  		log.info('stdout=> ' + stdout);
    */
      const publicDir = path.normalize(__dirname + '/../../../public');
  		const USRPDF_PATH = process.env.USRPDF_PATH;
  		//const pdfFileName = fileCode + '.pdf';
      let pdfFileName = fileCode;
      if (fileCode.substr(fileCode.length - 4) !== '.pdf') {
        pdfFileName = fileCode + '.pdf';
      }
      let pdfLink = USRPDF_PATH + '/' + pdfFileName;

      let dicomlogRes = await db.dicomtransferlogs.findAll({attributes: excludeColumn, where: {ResourceID: studyID}});
      //log.info('dicomlogRes=> ' + JSON.stringify(dicomlogRes));
      if ((dicomlogRes) && (dicomlogRes.length > 0)) {
  			//let studyObj = JSON.parse(stdout);
        let studyObj = dicomlogRes[0].StudyTags;
  			let mainTags = Object.keys(studyObj.MainDicomTags);
  			let patientMainTags = Object.keys(studyObj.PatientMainDicomTags);
        const promiseList = new Promise(async function(resolve2, reject2) {
          let dicomLinks = [];
          let dicomNames = [];
          let seriesUIDs = [];
          let sopUIDs = [];
          let seriesIds = [];
          for (let i=0; i < (pdfPages); i++) {
            let targetCode = uti.genUniqueID();
      			let bpmFile = targetCode + '.bmp';
      			let dcmFile = targetCode + '.dcm';
            let bmpFilePath = publicDir + USRPDF_PATH + '/' + bpmFile;
      			let command = '';
      			command += 'convert -verbose -density 150 -trim ' + publicDir + USRPDF_PATH + '/' + pdfFileName + '[' + i + ']';
      			command += ' -define bmp:format=BMP3 -quality 100 -flatten -sharpen 0x1.0 ';
      			command += ' ' + bmpFilePath;
      			command += ' && cd ' + publicDir + USRPDF_PATH;
      			command += ' && img2dcm -i BMP ' + bpmFile + ' ' + dcmFile;
      			await mainTags.forEach((tag, x) => {
      				command += uti.fmtStr(' -k "%s=%s"', tag, Object.values(studyObj.MainDicomTags)[x]);
      			});
      			await patientMainTags.forEach((tag, y) => {
      				if (tag !== 'OtherPatientIDs')	{
      					command += uti.fmtStr(' -k "%s=%s"', tag, Object.values(studyObj.PatientMainDicomTags)[y]);
      				}
      			});

            if ((seriesInstanceUIDs) && (seriesInstanceUIDs[i])){
              let seriesInstanceUID = seriesInstanceUIDs[i];
              command += uti.fmtStr(' -k "SeriesInstanceUID=%s"', seriesInstanceUID);
            }

            if ((sopInstanceUIDs) && (sopInstanceUIDs[i])){
              let sopInstanceUID = sopInstanceUIDs[i];
              command += uti.fmtStr(' -k "SOPInstanceUID=%s"', sopInstanceUID);
            }

            //command += ' -k "Modality=OT" -v';
            command += uti.fmtStr(' -k "SeriesDescription=%s"', 'Radiologist Result');

      			command += uti.fmtStr(' -k "Modality=%s" -v', modality);

      			//command += ' && storescu';
      			//command += uti.fmtStr(' %s %s %s -v', cloud.ip, dicomport, (publicDir + USRPDF_PATH + '/' + dcmFile));

      			log.info('Start Convert Dicom with command => ' + command);
      			let cmdout = await uti.runcommand(command);

            /*
            let dcmFilePath = publicDir + USRPDF_PATH + '/' + dcmFile;
            let postDicomRes = await doPostDicomFile(dcmFilePath, ORTHANC_URL, cloud.user, cloud.pass);
            seriesIds.push(postDicomRes.SeriesID);
            seriesUIDs.push(postDicomRes.SeriesInstanceUID);
            sopUIDs.push(postDicomRes.SOPInstanceUID);
            */
            dicomNames.push(dcmFile);
    				let dicomLink = USRPDF_PATH + '/' + dcmFile;
            dicomLinks.push(dicomLink);

            command = uti.fmtStr('rm %s', bmpFilePath);
            await uti.runcommand(command);

          }

          setTimeout(()=> {
            let dicom = {links: dicomLinks, names: dicomNames/*, seriesInstanceUIDs: seriesUIDs, seriesIds: seriesIds, sopInstanceUIDs: sopUIDs*/}; // <-- links + names ต่อไปจะไม่ได้ใช้
            resolve2(dicom);
          },1800);
        });
        Promise.all([promiseList]).then((ob)=> {
          resolve({link: {dicom: ob[0].links, pdf: pdfLink}, name: {dicom: ob[0].names, pdf: pdfFileName}/*, seriesInstanceUIDs: ob[0].seriesInstanceUIDs, seriesIds: ob[0].seriesIds, sopInstanceUIDs: ob[0].sopInstanceUIDs*/});
        }).catch((err)=>{
          reject(err);
        });
      } else {
        throw new Error({code: 500, cuase: 'Eempty Study from Dicomlog'});
      }
    /*
		}).catch((err) => {
			log.error('err: 500 >>', JSON.stringify(err));
			reject(err);
		});
    */
	});
}

const doPostDicomFile = function(dicomFile, orthancUrl, user, pass){
  return new Promise(async function(resolve, reject) {
    let postToUrl = orthancUrl + '/instances'
    let stream = fs.createReadStream(dicomFile);
    let headers = {
      'content-type': 'application/json',
    };
    let auth = {
      user: user,
      pass: pass
    };
    let postOptions = {
      url: postToUrl,
      method: 'POST',
      headers: headers,
      auth: auth,
      body: stream,
    };

    requester(postOptions, (perr, pres, pbody)=>{
      log.info('pbody=> ' + pbody);
      let seriesID = JSON.parse(pbody).ParentSeries;
      let loadDicomDataUrl = orthancUrl + '/series/' + seriesID;
      let loadDicomOptions = {
        url: loadDicomDataUrl,
        method: 'GET',
        headers: headers,
        auth: auth,
      }
      requester(loadDicomOptions, (lerr, lres, lbody)=>{
        log.info('lbody=> ' + lbody);
        let resBody = JSON.parse(lbody);
        let mainDicomTags = resBody.MainDicomTags;
        log.info('mainDicomTags=> ' + JSON.stringify(mainDicomTags));
        let seriesInstanceUID = mainDicomTags.SeriesInstanceUID;
        log.info('seriesInstanceUID=> ' + seriesInstanceUID);

        let firstInstanceID = resBody.Instances[0];
        let loadInstanceUrl = orthancUrl + '/instances/' + firstInstanceID;
        let loadInstanceOptions = {
          url: loadInstanceUrl,
          method: 'GET',
          headers: headers,
          auth: auth,
        }

        requester(loadInstanceOptions, (merr, mres, mbody)=>{
          log.info('mbody=> ' + mbody);
          let mBody = JSON.parse(mbody);
          let instanceMainDicomTags = mBody.MainDicomTags;
          log.info('instanceMainDicomTags=> ' + JSON.stringify(instanceMainDicomTags));
          let sopInstanceUID = instanceMainDicomTags.SOPInstanceUID;
          log.info('seriesInstanceUID=> ' + seriesInstanceUID);
          resolve({SeriesID: seriesID, SeriesInstanceUID: seriesInstanceUID, SOPInstanceUID: sopInstanceUID});
        });
      });
    });
  });
}

const doDeleteResultSeries = function(seriesIds, hospitalId, hostname){
  return new Promise(async function(resolve, reject) {
    const orthanc = await uti.doLoadOrthancTarget(hospitalId, hostname);
		const cloud = JSON.parse(orthanc.Orthanc_Cloud);
		let dicomport = cloud.dicomport;
		if ((hostname === 'localhost') || (hostname.indexOf('192.168') >= 0)){
			dicomport = cloud.dicomportex;
		}
		const ORTHANC_URL =  'http://' + cloud.ip + ':' + cloud.httpport;
    let deleteReses = [];
    if ((seriesIds) && (seriesIds.length > 0)) {
      const promiseList = new Promise(async function(resolve2, reject2) {
        await seriesIds.forEach((item, i) => {
          let deleteUrl = ORTHANC_URL + '/series/' + item
          let headers = {
            'content-type': 'application/json',
          };
          let auth = {
            user: cloud.user,
            pass: cloud.pass
          };
          let deleteOptions = {
            url: deleteUrl,
            method: 'DELETE',
            headers: headers,
            auth: auth,
          };
          requester(deleteOptions, (perr, pres, pbody)=>{
            if ((!perr) && (pbody) && (pbody !== '')) {
              let pBody = JSON.parse(pbody);
              deleteReses.push(pBody);
            }
          });
        });
        setTimeout(()=>{
          resolve2(deleteReses);
        }, 1000);
      });
      Promise.all([promiseList]).then((ob)=> {
        log.info('deleteResultSeriesReses => ' + JSON.stringify(ob[0]));
        resolve({deleteresult: ob[0]});
      })
    } else {
      resolve(deleteReses);
    }
  });
}

const risParamCreator = function(caseId, radioId) {
	return new Promise(async function(resolve, reject) {
		let radioProfile = await common.doLoadRadioProfile(radioId);
		let radFullNameEN = radioProfile.User_NameEN + ' ' + radioProfile.User_LastNameEN;
		let radFullNameTH = radioProfile.User_NameTH + ' ' + radioProfile.User_LastNameTH;
		const caseInclude = [{model: db.patients, attributes: ['Patient_HN']}, {model: db.caseresponses, attributes: ['Response_Text']}];
		const cases = await db.cases.findAll({attributes: ['Case_ACC', 'Case_BodyPart', 'casestatusId'], include: caseInclude, where: {id: caseId}});
    const caseStatusId = cases[0].casestatusId;
		//log.info('case=> ' + JSON.stringify(cases));
    let responseText = undefined;
    if ((cases[0].caseresponses) && (cases[0].caseresponses.length > 0)) {
      if (caseStatusId == 12) {
        responseText = '------------\n' + cases[0].caseresponses[0].Response_Text;
      } else {
        responseText = cases[0].caseresponses[0].Response_Text;
      }
    } else {
      responseText = '------------\n';
    }
		let risParams = {
			Hn: cases[0].patient.Patient_HN,
			AccessionNo: cases[0].Case_ACC,
			ExamUid: caseId,
			ExamName:  cases[0].Case_BodyPart,
			ResultText:  responseText,
			RadUid: radioId,
			RadName: radFullNameEN
		}
		resolve(risParams);
	});
}

const doCreateNewReport = function(caseId, responseId, userId, hospitalId, pdfFileName, hostname){
  return new Promise(async function(resolve, reject) {
    if (responseId){
      const reports = await db.hospitalreports.findAll({ attributes: ['Content', 'AutoConvert'], where: {hospitalId: hospitalId}});
      const reportElements = reports[0].Content;
      const autoConvert = reports[0].AutoConvert;

      const reportVar = await doLoadVariable(caseId, responseId, userId);
      const rsH = parseFloat(reportVar.rsH);

      let report = await reportCreator(reportElements, reportVar, pdfFileName, caseId, rsH);

      await db.casereports.update({PDF_Filename: report.reportPdfLinkPath}, { where: { caseresponseId: responseId }});
      resolve({status: {code: 200}, reportLink: report.reportPdfLinkPath, htmlLink: report.reportHtmlLinkPath, reportPages: report.reportPages, responseId: responseId});
    } else {
      let cuaseErrorText = 'The caseresponseId is undefined!';
      log.error('CreateNewReport ERROR=> ' + cuaseErrorText);
      let createNewReportEroor = new Error(cuaseErrorText);
      /*
      let subject = 'The caseresponseId is undefined!'
      let msgHtml = uti.fmtStr('<p>caseId=%s</p><p>userId=%s</p><p>hospitalId=%s</p><p>pdfFileName=%s</p>', caseId, userId, hospitalId, pdfFileName);
      msgHtml += uti.fmtStr('<p>Create-Report=> %s</p>', JSON.stringify(createNewReportEroor));
      let caseData = await db.cases.findAll({ where: {id: caseId}});
      msgHtml += uti.fmtStr('<p>Case Data=> %s</p>', JSON.stringify(caseData));
      let sendEmailRes = await common.doSendEmailToAdmin(subject, msgHtml);
      msgHtml = uti.fmtStr('มีข้อผิดพลาดจากการสร้างผลอ่าน CaseId=%s รายละเอียดส่งทางอีเมล์ %s แล้ว', caseId, process.env.EMAIL_ADMIN_ADDRESS);
      await common.sendNotifyChatBotToAdmin(msgHtml);
      */
      reject(createNewReportEroor);
    }
  });
}

const doSubmitReport = function(caseId, responseId, userId, hospitalId, reportType, hostname, report){
  return new Promise(async function(resolve, reject) {
    const hosReports = await db.hospitalreports.findAll({ attributes: ['AutoConvert'], where: {hospitalId: hospitalId}});
    const autoConvert = hosReports[0].AutoConvert;
    if (responseId){
      await db.casereports.update({Report_Type: reportType}, { where: { caseresponseId: responseId }});
    } else {
      log.info('doSubmitReport ERROR=> The caseresponseId is undefined!')
    }

    let newReportRes = undefined;
    if (autoConvert == 1){
      const cases = await db.cases.findAll({attributes: ['Case_OrthancStudyID', 'Case_StudyInstanceUID', 'Case_Modality', 'Case_RadiologistId', 'casestatusId', 'userId', 'hospitalId'], where: {id: caseId}});
      let pdfLinkPaths = report.reportPdfLinkPath.split('/');
      let pdfFiles = pdfLinkPaths[pdfLinkPaths.length-1];
      pdfFiles = pdfFiles.split('.');
      let pdfReportFileName = pdfFiles[0];
      let studyID = cases[0].Case_OrthancStudyID;
      let modality = cases[0].Case_Modality;
      let studyInstanceUID = cases[0].Case_StudyInstanceUID;
      let caseStatusId = cases[0].casestatusId;
      log.info('caseStatusId=>' + caseStatusId);
      let isEditResponse = uti.contains.call(common.editResponseStatus, caseStatusId);
      log.info('isEditResponse=>' + isEditResponse);
      let pdfPages = report.reportPages;
      log.info('pdfPages=>' + pdfPages);
      if (!pdfPages) {
        let publicDir = path.normalize(__dirname + '/../../../public');
        let reportPdfFilePath = publicDir + report.reportPdfLinkPath;
        log.info('reportPdfFilePath of dicom first result => ' + reportPdfFilePath);
        pdfPages = 1;
        if (fs.existsSync(reportPdfFilePath)) {
          pdfPages = await doCountPagePdf(reportPdfFilePath);
          log.info('Found Pdf file at => ' + reportPdfFilePath);
        } else {
          log.info('Not Found Pdf file at => ' + reportPdfFilePath);
          log.info('start Create new pdf file');
          let newPdfFileName = pdfReportFileName + '.pdf';
          newReportRes = await doCreateNewReport(caseId, responseId, userId, hospitalId, newPdfFileName, hostname);
          log.info('Create-New-Report=> ' + JSON.stringify(newReportRes));
          pdfPages = await doCountPagePdf(reportPdfFilePath);
        }
      }
      let lastReports = await db.casereports.findAll({attributes: ['PDF_DicomSeriesIds', 'SeriesInstanceUIDs', 'SOPInstanceUIDs'], where: {caseresponseId: responseId}});
      log.info('lastReports=>' + JSON.stringify(lastReports));


      let dicom = undefined;
      if ((lastReports) && (lastReports.length > 0) && (lastReports[0].PDF_DicomSeriesIds)) {
        if ((isEditResponse) && (lastReports.length > 0)) {
          dicom = await dicomConvertor(studyID, modality, pdfReportFileName, hospitalId, hostname, pdfPages);
          log.info('dicom last result => ' + JSON.stringify(dicom));
          await db.casereports.update({PDF_DicomSeriesIds: {items: dicom.seriesIds}, SeriesInstanceUIDs: {items: dicom.seriesInstanceUIDs}, SOPInstanceUIDs: {items: dicom.sopInstanceUIDs}}, { where: { caseresponseId: responseId }}); //<-- save orthanc seriesId to casereport
        } else {
          dicom = await dicomConvertor(studyID, modality, pdfReportFileName, hospitalId, hostname, pdfPages);
          log.info('dicom first result => ' + JSON.stringify(dicom));
          await db.casereports.update({PDF_DicomSeriesIds: {items: dicom.seriesIds}, SeriesInstanceUIDs: {items: dicom.seriesInstanceUIDs}, SOPInstanceUIDs: {items: dicom.sopInstanceUIDs}}, { where: { caseresponseId: responseId }}); //<-- save orthanc seriesId to casereport
        }
      } else {
        dicom = await dicomConvertor(studyID, modality, pdfReportFileName, hospitalId, hostname, pdfPages);
        log.info('dicom first result => ' + JSON.stringify(dicom));
        await db.casereports.update({PDF_DicomSeriesIds: {items: dicom.seriesIds}, SeriesInstanceUIDs: {items: dicom.seriesInstanceUIDs}, SOPInstanceUIDs: {items: dicom.sopInstanceUIDs}}, { where: { caseresponseId: responseId }}); //<-- save orthanc seriesId to casereport
      }

      common.removeReportTempFile(pdfReportFileName);

      let radioId = cases[0].Case_RadiologistId;
      let radioProfile = await common.doLoadRadioProfile(radioId);
      let risParams = await risParamCreator(caseId, radioId);
      let socketTrigger = {type: 'newreport', studyId: studyID, studyInstanceUID: studyInstanceUID, risParams: risParams, dicom: dicom, radioProfile: radioProfile, hospitalId: hospitalId, caseId: caseId, patientFullName: report.patientFullName};

      let yourLocalSocket = await websocket.findOrthancLocalSocket(hospitalId);
      if (yourLocalSocket) {
        //update resullt to envision
        let result = await websocket.sendLocalGateway(socketTrigger, hospitalId);
  			log.info('send newreport trigger result => ' + JSON.stringify(result));
        resolve({status: {code: 200}, submit: 'done', result: result, triggerData: socketTrigger});
      } else {
        websocket.unSendDatas.push({sendTo: 'orthanc', callData: socketTrigger, hospitalId: hospitalId});
        const userInclude = [{model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']}];
        let ownerCaseUsers = await db.users.findAll({attributes: excludeColumn, include: userInclude, where: {id: cases[0].userId}});
        let ownerCaseUsername = ownerCaseUsers[0].username;
        let ownerCaseSocket = await websocket.findUserSocket(ownerCaseUsername);
        if (ownerCaseSocket) {
          ownerCaseSocket.send(JSON.stringify(socketTrigger));
          resolve({status: {code: 200}, submit: 'done', ownerCaseSocket: ownerCaseSocket, triggerData: socketTrigger});
        } else {
          let unSendTrigger = {sendTo: ownerCaseUsername, callData: socketTrigger, hospitalId: hospitalId};
          //websocket.unSendDatas.push(unSendTrigger);
          await db.casereports.update({PDF_DicomSeriesIds: unSendTrigger}, { where: { caseresponseId: responseId }});
          /*
          send Admin Notify
          */
          let msgHtml = uti.fmtStr('มีข้อผิดพลาดจากการส่งผลอ่านทาง Web Socket ของผู้ใช้งาน CaseId=%s รายละเอียดส่งทางอีเมล์ %s แล้ว', caseId, process.env.EMAIL_ADMIN_ADDRESS);
          await common.sendNotifyChatBotToAdmin(msgHtml);
          resolve({status: {code: 200}, submit: 'done', cuase: 'but, not found local user owner case socket.'});
          /*
          send fake Success Notify to radio
          */

          let radioSocket = await websocket.findUserSocket(radioProfile.username);
          if (radioSocket) {
            let fakeRadioTrigger = {type: 'newreportlocalresult', result: 'wait local active', from: 'system', hospitalId: hospitalId, caseId: caseId, patientFullName: report.patientFullName};
            radioSocket.send(JSON.stringify(fakeRadioTrigger));
          }
        }
      }
    } else {
      resolve({status: {code: 200}, submit: 'none', cuase: 'not auto convert on configuration hospital report.'});
    }
  });
}

const doReSubmitReport = function(caseId, hostname){
  return new Promise(async function(resolve, reject) {
    //const caseInclude = [{model: db.hospitals, attributes: ['Hos_Name']}, {model: db.patients, attributes: excludeColumn}, {model: db.cliamerights, attributes: ['id', 'CR_Name']}];
    let cases = await db.cases.findAll({ where: {id: caseId}});
    log.info('cases=> ' + JSON.stringify(cases));
    let patients = await db.patients.findAll({ where: {id: cases[0].patientId}});
    log.info('patients=> ' + JSON.stringify(patients));
    let caseresponses = await db.caseresponses.findAll({ where: {caseId: caseId}});
    //log.info('caseresponses=> ' + JSON.stringify(caseresponses));

    if (caseresponses.length > 0){
      let responseId = caseresponses[0].id;
      let userId = cases[0].userId;
      let hospitalId = cases[0].hospitalId;
      let caseCreateAt = uti.formatDateTimeStr(cases[0].createdAt);
      let casedatetime = caseCreateAt.split('T');
      let casedateSegment = casedatetime[0].split('-');
      casedateSegment = casedateSegment.join('');
      let casedate = casedateSegment;
      casedateSegment = casedatetime[1].split(':');
      let casetime = casedateSegment.join('');
      let fileExt = 'pdf';
      let pdfFileName = patients[0].Patient_NameEN + '_' + patients[0].Patient_LastNameEN + '-' + casedate + '-' + casetime + '.' + fileExt;
      let newReportRes = await doCreateNewReport(caseId, responseId, userId, hospitalId, pdfFileName, hostname);
      log.info('Create-Report=> ' + JSON.stringify(newReportRes));

      let casereports = await db.casereports.findAll({ where: {caseresponseId: responseId}});
      log.info('casereports=> ' + JSON.stringify(casereports));
      if (casereports.length == 0) {
        let reporttype = 'normal';
        let remark = 'สร้างรายงายผลอ่านด้วยการ re-submit โดย admin';
        let reportLog = [{action: 'new', by: 0, at: new Date()}];
        let pdfFileUrl = '/img/usr/pdf/' + pdfFileName;
        let newCaseReport = {Remark: remark, Report_Type: reporttype, PDF_Filename: pdfFileUrl, Status: 'new', Log: reportLog};
        let adReport = await db.casereports.create(newCaseReport);
        await db.casereports.update({caseId: caseId, userId: 0, caseresponseId: responseId}, { where: { id: adReport.id } });
        casereports = await db.casereports.findAll({ where: {caseresponseId: responseId}});
        log.info('casereports=> ' + JSON.stringify(casereports));
      }
      const hosReports = await db.hospitalreports.findAll({ attributes: ['AutoConvert'], where: {hospitalId: hospitalId}});
      const autoConvert = hosReports[0].AutoConvert;
      if (autoConvert == 1){
        let pdfDicomSeriesIds = undefined;
        let seriesInstanceUIDs = undefined;
        let sopInstanceUIDs = undefined;
        if (casereports.length > 0) {
          if (casereports[0].PDF_DicomSeriesIds) {
            pdfDicomSeriesIds = casereports[0].PDF_DicomSeriesIds.items;
          }
          if (casereports[0].SeriesInstanceUIDs) {
            seriesInstanceUIDs = casereports[0].SeriesInstanceUIDs.items;
          }
          if (casereports[0].SOPInstanceUIDs) {
            sopInstanceUIDs = casereports[0].SOPInstanceUIDs.items;
          }
        }
        //let dicom = {seriesIds: pdfDicomSeriesIds, seriesInstanceUIDs: seriesInstanceUIDs, sopInstanceUIDs: sopInstanceUIDs};
        let publicDir = path.normalize(__dirname + '/../../../public');
        let reportPdfFilePath = publicDir + '/img/usr/pdf/' + pdfFileName;
        let pdfPages = await doCountPagePdf(reportPdfFilePath);
        let dicom = await dicomConvertor(cases[0].Case_OrthancStudyID, cases[0].Case_Modality, pdfFileName, hospitalId, hostname, pdfPages);
        let radioId = cases[0].Case_RadiologistId;
        let risParams = await risParamCreator(caseId, radioId);

        let socketTrigger = {type: 'newreport', pdfDicomSeriesIds: pdfDicomSeriesIds, risParams: risParams, dicom: dicom};
        if (seriesInstanceUIDs) {
          socketTrigger.seriesInstanceUIDs = seriesInstanceUIDs;
        }
        let result = await websocket.sendLocalGateway(socketTrigger, hospitalId);
  			log.info('send resubmitreport trigger result => ' + JSON.stringify(result));
        resolve({status: {code: 200}, submit: 'done', result: result, triggerData: socketTrigger});
      } else {
        resolve({status: {code: 200}, submit: 'none', cuase: 'not auto convert on configuration hospital report.'});
      }
    } else {
      resolve({status: {code: 200}, cause: 'case response empty'});
    }
  });
}

module.exports = (wssocket, dbconn, monitor) => {
  websocket = wssocket;
	db = dbconn;
	log = monitor;
  uti = require('../../lib/mod/util.js')(db, log);
  common = require('./commonlib.js')(db, log);
  return {
    doCountPagePdf,
    doLoadVariable,
    reportCreator,
    dicomConvertor,
    doPostDicomFile,
    risParamCreator,
    doCreateNewReport,
    doSubmitReport,
    doReSubmitReport,
    doAppendBlankPageToHtmlFile
  }
}
