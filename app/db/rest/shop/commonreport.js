const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const requester = require('request');
const PDFParser = require('pdf2json');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require('cheerio');
const exec = require('child_process').exec;

var log, db;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const runcommand = function (command) {
	return new Promise(function(resolve, reject) {
		exec(command, (error, stdout, stderr) => {
			if(error === null) {
				resolve(`${stdout}`);
			} else {
				reject(`${stderr}`);
			}
    });
	});
}

const billFieldOptions = [
  {name_en: 'shop_name', name_th: 'ชื่อร้านค้า'},
  {name_en: 'shop_address', name_th: 'ที่อยู่ร้านค้า'},
  {name_en: 'shop_tel', name_th: 'เบอร์โทรศัพท์ร้านค้า'},
  {name_en: 'shop_mail', name_th: 'อีเมล์ร้านค้า'},
  {name_en: 'shop_vatno', name_th: 'หมายเลขผู้เสียภาษีร้านค้า'},

  {name_en: 'customer_name', name_th: 'ชื่อลูกค้า'},
  {name_en: 'customer_address', name_th: 'ที่อยู่ลูกค้า'},
  {name_en: 'customer_tel', name_th: 'เบอร์โทรศัพท์ลูกค้า'},

  {name_en: 'order_no', name_th: 'หมายเลขออร์เดอร์'},
  {name_en: 'order_by', name_th: 'ผู้สั่งออร์เดอร์'},
  {name_en: 'order_datetime', name_th: 'วันเวลาสั่งออร์เดอร์'},

  {name_en: 'print_no', name_th: 'หมายเลขใบแจ้งหนี้/ใบเสร็จ/ใบกำกับภาษี'},
  {name_en: 'print_by', name_th: 'ผู้ออกเอกสาร'},
  {name_en: 'print_datetime', name_th: 'วันเวลาออกเอกสาร'},

  {name_en: 'gooditem_no', name_th: 'เลขลำดับที่'},
  {name_en: 'gooditem_name', name_th: 'ชื่อสินค้า'},
  {name_en: 'gooditem_unit', name_th: 'หน่วยขายสินค้า'},
  {name_en: 'gooditem_price', name_th: 'ราคาสินค้าต่อหน่วย'},
  {name_en: 'gooditem_qty', name_th: 'จำนวนสินค้า'},
  {name_en: 'gooditem_total', name_th: 'จำนวนเงินของรายการสินค้า'},

  {name_en: 'total', name_th: 'รวมค่าสินค้า'},
  {name_en: 'discount', name_th: 'ส่วนลด'},
  {name_en: 'vat', name_th: 'ภาษีมูลค่าเพิ่ม 7%'},
  {name_en: 'grandtotal', name_th: 'รวมทั้งหมด'},

  {name_en: 'paytype', name_th: 'ชำระโดย'},
  {name_en: 'payamount', name_th: 'จำนวนเงินที่ชำระ'},
  {name_en: 'cashchange', name_th: 'เงินทอน'}
]

const fmtStr = function (str) {
  var args = [].slice.call(arguments, 1);
  var i = 0;
  return str.replace(/%s/g, () => args[i++]);
}

const formatDateTimeStr = function(dt){
	const offset = 7;
	let d = new Date(dt);
	//สำหรับ timezone = Etc/UTC
	let utc = d.getTime();
	d = new Date(utc + (3600000 * offset));
	//สำหรับ timezone = Asia/Bangkok
	//d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
	var yy, mm, dd, hh, mn, ss;
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
	var td = `${yy}-${mm}-${dd}T${hh}:${mn}:${ss}`;
	return td;
}

const doFormateDateTimeThaiZone = function(unFormatDateTime){
	//log.info('unFormatDateTime=>' + unFormatDateTime);
	let fmtDate = formatDateTimeStr(unFormatDateTime);
	//log.info('fmtDate=>' + fmtDate);
	let datetime = fmtDate.split('T');
	let dateSegment = datetime[0].split('-');
	dateSegment = dateSegment.join('');
	let date = formatStudyDate(dateSegment);
	let time = formatStudyTime(datetime[1].split(':').join(''));
	return fmtStr('%s %s', date, time);
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

const doCountPagePdf = function(pdfFile){
  return new Promise(function(resolve, reject) {
    let pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', function(data) {
      let pageCount = data && data.Pages && data.Pages.length ? data.Pages.length : 0;
      resolve(pageCount);
    });
    pdfParser.loadPDF(pdfFile);
  });
}

const doFindGooditemTableHight = function(shopId, docType, googItems){
  return new Promise(async function(resolve, reject) {
    const templates = await db.templates.findAll({ attributes: ['TypeId', 'Content', 'PaperSize'], where: {shopId: shopId, TypeId: docType}});
    const reportElements = templates[0].Content;
    const gooditemsTable = await reportElements.find((element)=>{
      if (element.elementType == 'table'){
        return element;
      }
    })
    const compensatValue = 6;
    const gooditemRows = gooditemsTable.rows;
    let totalHeight = 0;
    const promiseList = new Promise(async function(resolve2, reject2) {
      for (let i=0; i < gooditemRows.length; i++){
        if (gooditemRows[i].id == 'dataRow') {
          totalHeight += (Number(gooditemRows[i].fields[0].fontsize) + compensatValue) * googItems.length;
        } else {
          totalHeight += (Number(gooditemRows[i].fields[0].fontsize) + compensatValue);
        }
      }
      setTimeout(()=> {
        resolve2(totalHeight);
      },1800);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

const doLoadVariable = function(docType, orderId, docNo){
  return new Promise(async function(resolve, reject) {
    /*
      docType
      1=invoices
      2=bill
      3=taxinvoice
    */
    const userInfoModel = {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']};
    const shopModel = {model: db.shops, attributes: ['id', 'Shop_Name', 'Shop_Address', 'Shop_Tel', 'Shop_Mail', 'Shop_LogoFilename', 'Shop_VatNo']};
    const customerModel = {model: db.customers, attributes: ['id', 'Name', 'Address', 'Tel']};
    const paytypeModel = {model: db.paytypes, attributes: ['id', 'NameTH']};
    const orderInclude = [shopModel, userInfoModel, customerModel];
    const docInclude = [userInfoModel];
    const paymentInclude = [paytypeModel];
    try {
      const orders = await db.orders.findAll({include: orderInclude, where: {id: orderId}});
      let docs = undefined;
      if (docType == 1) {
        docs = await db.invoices.findAll({include: docInclude, where: {orderId: orderId}});
      } else if (docType == 2) {
        docs = await db.bills.findAll({include: docInclude, where: {orderId: orderId}});
      } else if (docType == 3) {
        docs = await db.bills.findAll({include: docInclude, where: {orderId: orderId}});
      }
      let payments = await db.payments.findAll({include: paymentInclude, where: {orderId: orderId}});
      let total = 0;
      await orders[0].Items.forEach((item, i) => {
        total += Number(item.Price) * Number(item.Qty);
      });

      let grandtotal = (total - Number(docs[0].Discount)) + Number(docs[0].Vat)
      let rsH = await doFindGooditemTableHight(orders[0].shopId, docType, orders[0].Items);

      const variable = {
        shop_name: orders[0].shop.Shop_Name,
        shop_address: orders[0].shop.Shop_Address,
        shop_tel: orders[0].shop.Shop_Tel,
        shop_mail: orders[0].shop.Shop_Mail,
        shop_vatno: orders[0].shop.Shop_VatNo,
        customer_name: orders[0].customer.Name,
        customer_address: orders[0].customer.Address,
        customer_tel: orders[0].customer.Tel,
        order_no: orderId,
        order_by: orders[0].userinfo.User_NameTH + ' ' + orders[0].userinfo.User_LastNameTH,
        order_datetime: doFormateDateTimeThaiZone(orders[0].createdAt),

        print_no: docNo,
        print_by: docs[0].userinfo.User_NameTH + ' ' + docs[0].userinfo.User_LastNameTH,
        print_datetime: doFormateDateTimeThaiZone(docs[0].createdAt),
        /*
        gooditem_no', name_th: 'เลขลำดับที่'},
        gooditem_name', name_th: 'ชื่อสินค้า'},
        gooditem_unit', name_th: 'หน่วยขายสินค้า'},
        gooditem_price', name_th: 'ราคาสินค้าต่อหน่วย'},
        gooditem_qty', name_th: 'จำนวนสินค้า'},
        gooditem_total', name_th: 'จำนวนเงินของรายการสินค้า'},
        */
        gooditems: orders[0].Items,

        total: total,
        discount: docs[0].Discount,
        vat: docs[0].Vat,
        grandtotal: grandtotal,

        rsH: rsH
      };

      if ((payments) && (payments.length > 0)) {
        variable.paytype = payments[0].paytype.NameTH;
        variable.payamount = payments[0].Amount;
        variable.cashchange =  Number(payments[0].Amount) - grandtotal;
      }

      resolve(variable);
    } catch(error) {
      log.error('doLoadVariable error => ' + error);
      reject({error: error});
    }
  });
}

const reportCreator = function(elements, variable, pdfFileName, orderId, rsH, paperSize){
	return new Promise(async function(resolve, reject) {
		const publicDir = path.normalize(__dirname + '/../../../../public');
    const shopDir = path.normalize(__dirname + '/../../../../shop');
		//const fs = require("fs");
		const fileNames = pdfFileName.split('.');
		const qrgenerator = require('../../../lib/qrcodegenerator.js');
		const qrcontent = 'https://radconnext.info/shop/portal?orderId=' + orderId;

    const qrcodeFullPath = process.env.USRQRCODE_PATH + '/' + fileNames[0] + '.png';
    if (fs.existsSync(qrcodeFullPath)) {
      await fs.unlinkSync(qrcodeFullPath);
    }
    log.info('qrcodeFullPath=>' + qrcodeFullPath);

		const qrcode = await qrgenerator(qrcontent, pdfFileName);
		const qrlink = qrcode.qrlink;


		const usrPdfPath = publicDir + process.env.USRPDF_PATH;
		const htmlFileName = fileNames[0] + '.html';
		const reportHtmlLinkPath = process.env.USRPDF_PATH + '/' + htmlFileName;

		if (fs.existsSync(usrPdfPath + '/' + htmlFileName)) {
	    //await runcommand('rm ' + usrPdfPath + '/' + htmlFileName);
			await fs.unlinkSync(usrPdfPath + '/' + htmlFileName);
	  }
		if (fs.existsSync(usrPdfPath + '/' + pdfFileName)) {
			//await runcommand('rm ' + usrPdfPath + '/' + pdfFileName);
			await fs.unlinkSync(usrPdfPath + '/' + pdfFileName);
		}

		var html = '<!DOCTYPE html><head></head><body><div id="report-wrapper"></div></body>';
		var _window = new JSDOM(html, { runScripts: "dangerously", resources: "usable" }).window;
		/* ************************************************************************* */
		/* Add scripts to head ***************************************************** */
		var jsFiles = [
					shopDir + '/lib/jquery.js',
					shopDir + '/lib/jquery-ui.min.js',
					shopDir + '/lib/plugin/jquery-report-element-plugin.js',
					shopDir + '/lib/report-generator.js'
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

		/* ************************************************************************* */
		/* Run page **************************************************************** */
		_window.document.addEventListener('DOMContentLoaded', () => {
			log.info('main says: DOMContentLoaded');
			// We need to delay one extra turn because we are the first DOMContentLoaded listener,
			// but we want to execute this code only after the second DOMContentLoaded listener
			// (added by external.js) fires.
			//_window.sayBye('OK Boy'); // prints "say-hello.js says: Good bye!"
			//_window.doSetReportParams(hospitalId, caseId, userId);
			log.info("Start Create Html Report.");
			_window.doCreateReportDOM(elements, variable, qrlink, orderId, rsH, paperSize, async (reportHTML, reportPages) =>{
				/******/
        let htmlFilePath = usrPdfPath + '/' + htmlFileName;
				var writerStream = fs.createWriteStream(htmlFilePath);
				var reportContent = '<!DOCTYPE html>\n<html>\n<head>\n<link href="../../../report-design/report.css" rel="stylesheet">\n<style>body {font-family: "Kanit", sans-serif;}</style>\n</head>\n<body>\n<div id="report-wrapper">\n' + reportHTML + '\n</div>\n</body>\n</html>';
				writerStream.write(reportContent,'UTF8');
				writerStream.end();
				writerStream.on('finish', function() {
          log.info("Write HTML Report file completed.");
          //_window.doCheckContent();

          log.info("Start Create Pdf Report.");

          const shopPdfPath = shopDir + process.env.USRPDF_PATH;
					const reportPdfFilePath = shopPdfPath + '/' + pdfFileName;
					const reportPdfLinkPath = '/shop' + process.env.USRPDF_PATH + '/' + pdfFileName;

					const creatReportCommand = fmtStr('wkhtmltopdf -s A4 http://localhost:8080%s %s', reportHtmlLinkPath, reportPdfFilePath);

					log.info('Create pdf report file with command => ' + creatReportCommand);
					runcommand(creatReportCommand).then(async (cmdout) => {
            let pdfPage = await doCountPagePdf(reportPdfFilePath);
            log.info('pdfPage=> ' + pdfPage);
						log.info("Create Pdf Report file Success.");
						resolve({reportPdfLinkPath: reportPdfLinkPath, reportHtmlLinkPath: reportHtmlLinkPath, reportPages: /*reportPages*/pdfPage});
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

const doCreateReport = function(orderId, docType, shopId, pdfFileName, docNo){
  return new Promise(async function(resolve, reject) {
    const templates = await db.templates.findAll({ attributes: ['TypeId', 'Content', 'PaperSize'], where: {shopId: shopId, TypeId: docType}});
    const reportElements = templates[0].Content;
    const paperSize = templates[0].PaperSize;
    const reportVar = await doLoadVariable(docType, orderId, docNo);
    const rsH = parseFloat(reportVar.rsH);

    let docReport = await reportCreator(reportElements, reportVar, pdfFileName, orderId, rsH, paperSize);

    resolve({status: {code: 200}, doc: {link: docReport.reportPdfLinkPath, pagecount: docReport.reportPages}});
  });
}

module.exports = (dbconn, monitor) => {
	db = dbconn;
	log = monitor;
  return {
    billFieldOptions,
    doLoadVariable,
    reportCreator,
    doCreateReport
  }
}
