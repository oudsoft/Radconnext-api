/*pp-qrcode.js*/

const fs = require('fs');
const util = require("util");
const path = require("path");
const qrCode = require('qrcode');
const {registerFont, createCanvas, createImageData} = require('canvas');
registerFont('../../../shop/font/THSarabunNew.ttf', { family: 'THSarabunNew' });

const shopDir = path.normalize(__dirname + '/../../../shop');

var log, ppText;

const formatCustomerDate = function (fullDataTime) {
	var Adate = new Date(fullDataTime);
	var dd = Adate.getDate();
	var mm = Adate.getMonth()+1; //January is 0!
	var yyyy = Adate.getFullYear();
	if(dd<10) {
		dd = '0'+dd
	}
	if(mm<10) {
		mm = '0'+mm
	}
	return dd + "/" + mm + "/" + yyyy;
}

const formatCustomerTime = function (fullDataTime) {
	var Adate = new Date(fullDataTime);
	var hh = Adate.getHours();
	var mm = Adate.getMinutes();
	if(hh<10) {
		hh = '0'+hh
	}
	if(mm<10) {
		mm = '0'+mm
	}
	return hh + ":" + mm;
}

const doCreatePPQRCode = function(ppData) {
  return new Promise(async function(resolve, reject) {
    log.info('ppData --> ' + JSON.stringify(ppData));
    const maxH = 380;
		const maxW = 400;
		const imageCanvas = createCanvas(maxW, maxH);
		const ctx = imageCanvas.getContext('2d');
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = "yellow";
		ctx.fillRect(0, 0, maxW, maxH);
		ctx.fill();

    const qrcodeText =  ppText.ppTextCreator(ppData.ppaytype, ppData.ppayno, ppData.netAmount);
    const qrcodeCanvas = createCanvas(200, 200);
    qrCode.toCanvas(qrcodeCanvas, qrcodeText, function (error) {
      let qrH = 200;
			ctx.drawImage(qrcodeCanvas, 100, 20, qrH, qrH);
			ctx.font = 'bold 30px "THSarabunNew"'
			ctx.fillStyle = 'black';
			ctx.textAlign = 'left';

			let textFormater = util.format("หมายเลขพร้อมเพย์ %s ", ppData.ppayno);
			ctx.fillText(textFormater, 10, 250);

			textFormater = util.format("ชื่อบัญชี  %s %s", ppData.fname, ppData.lname);
			ctx.fillText(textFormater, 10, 280);

			textFormater = util.format("จำนวนเงิน %s บาท", Number(ppData.netAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
			ctx.fillText(textFormater, 10, 310);

			ctx.font = 'bold 40px "THSarabunNew"'
			ctx.textAlign = 'center';
			ctx.fillText("ขอขอบคุณ", 200, 340);

			ctx.font = 'bold 25px "THSarabunNew"'
			ctx.textAlign = 'left';
			let today = new Date();
			textFormater = util.format("ออก ณ วันที่ : %s เวลา : %s น." ,  formatCustomerDate(today), formatCustomerTime(today));
			ctx.fillText(textFormater, 10, (maxH-10));

      let imageFileName = "PPQR-" + ppData.ppayno + "-" + today.getTime();

			let imageFileExName = '.png';

      let imageLink = '/img/usr/qrcode/' + imageFileName + imageFileExName;
			let imagePath =  shopDir + imageLink;

      const out = fs.createWriteStream(imagePath);
			const stream = imageCanvas.createPNGStream();
			stream.pipe(out);
			out.on('finish', () =>  {
				resolve({qrLink: imageLink});
			});
    });
  });
}

module.exports = (monitor) => {
  log = monitor;
  ppText = require('./promptpaytext.js')(log);
  return {
    doCreatePPQRCode
  }
}