/*pp-qrcode.js*/

const fs = require('fs');
const util = require("util");
const path = require("path");
const qrCode = require('qrcode');
const {registerFont, createCanvas, createImageData} = require('canvas');

const shopDir = path.normalize(__dirname + '/../../../shop');

registerFont(shopDir + '/font/THSarabunNew.ttf', { family: 'THSarabunNew' });
registerFont(shopDir + '/font/EkkamaiStandard-Light.ttf', { family: 'EkkamaiStandard' });

var log, ppText;

const offsetTimeZone = 7;

const formatCustomerDate = function (fullDataTime) {
	let d = new Date(fullDataTime);
	let utc = d.getTime();
	let adate = new Date(utc + (3600000 * offsetTimeZone));
	let dd = adate.getDate();
	let mm = adate.getMonth()+1; //January is 0!
	let yyyy = adate.getFullYear();
	if(dd<10) {
		dd = '0'+dd
	}
	if(mm<10) {
		mm = '0'+mm
	}
	return dd + "-" + mm + "-" + yyyy;
}

const formatCustomerTime = function (fullDataTime) {
	let d = new Date(fullDataTime);
	let utc = d.getTime();
	let adate = new Date(utc + (3600000 * offsetTimeZone));
	let hh = adate.getHours();
	let mm = adate.getMinutes();
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
    log.info('ppData ==> ' + JSON.stringify(ppData));
    const maxH = 370;
		const maxW = 360;
		const imageCanvas = createCanvas(maxW, maxH);
		const ctx = imageCanvas.getContext('2d');
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = "yellow";
		ctx.fillRect(0, 0, maxW, maxH);
		ctx.fill();

    const qrcodeText =  ppText.ppTextCreator(ppData.ppaytype, ppData.ppayno, ppData.netAmount);
    const qrcodeCanvas = createCanvas(200, 200);
    qrCode.toCanvas(qrcodeCanvas, qrcodeText, function (error) {

			ctx.font = 'bold 40px "THSarabunNew"'
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			//ctx.fillText("สแกนเพื่อชำระเงิน", 200, 340);
			ctx.fillText("สแกนเพื่อชำระเงิน", 180, 40);

      let qrH = 200;
			ctx.drawImage(qrcodeCanvas, 80, 60, qrH, qrH);

			ctx.font = 'bold 30px "THSarabunNew"'
			ctx.textAlign = 'left';

			//let textFormater = util.format("หมายเลขพร้อมเพย์ %s ", ppData.ppayno);
			//ctx.fillText(textFormater, 20, 290);

			textFormater = util.format("ชื่อบัญชี  %s %s", ppData.fname, ppData.lname);
			ctx.fillText(textFormater, 20, 290);

			textFormater = util.format("จำนวนเงิน %s บาท", Number(ppData.netAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
			ctx.fillText(textFormater, 20, 320);

			ctx.font = 'bold 25px "THSarabunNew"'
			ctx.textAlign = 'left';
			let today = new Date();
			textFormater = util.format("วันที่ : %s เวลา : %s" ,  formatCustomerDate(today), formatCustomerTime(today));
			ctx.fillText(textFormater, 20, (maxH-20));

      let imageFileName = "PPQR-" + ppData.ppayno + "-" + today.getTime();

			let imageFileExName = '.png';

      let imageLink = '/img/usr/qrcode/' + imageFileName + imageFileExName;
			let imagePath =  shopDir + imageLink;

			log.info('imagePath ==> ' + imagePath);

      const out = fs.createWriteStream(imagePath);
			const stream = imageCanvas.createPNGStream();
			stream.pipe(out);
			out.on('finish', () =>  {
				resolve({qrLink: '/shop' + imageLink, qrPath: imagePath, qrFileName: imageFileName});
			});
    });
  });
}

const doCreatePPQRCodeAddAdv = function(ppData) {
  return new Promise(async function(resolve, reject) {
    log.info('ppData ==> ' + JSON.stringify(ppData));
    const maxHH = 500;
		const maxH = 370;
		const maxW = 360;
		const imageCanvas = createCanvas(maxW, maxHH);
		const ctx = imageCanvas.getContext('2d');
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = "yellow";
		ctx.fillRect(0, 0, maxW, maxHH);
		ctx.fill();
		/* Stamp Logo + Ad */
		const imageSrcDir = shopDir + '/favposicon.png'
		const srcCanvas = require('canvas');
		const srcImage = new srcCanvas.Image;
		srcImage.src = imageSrcDir;

		const imageWidth = srcImage.width;
		const imageHeight = srcImage.height;

		ctx.drawImage(srcImage, 30, 410, 45, 45);
		ctx.font = 'bold 40px "EkkamaiStandard"';
		ctx.textAlign = 'left';
		ctx.fillStyle = 'black';
		//let textAd = 'สร้างพร้อมเพย์คิวอาร์โค้ดแบบรายครั้งได้ฟรีที่';
		let textAd = 'สร้างฟรี ที่';
		ctx.fillText(textAd, 100, 450);
		ctx.font = 'bold 40px "EkkamaiStandard"';
		ctx.textAlign = 'left';
		let linkAd = 'radconnext.tech/shop';
		ctx.fillText(linkAd, 5, 490);

		/* Stamp Logo + Ad */

    const qrcodeText =  ppText.ppTextCreator(ppData.ppaytype, ppData.ppayno, ppData.netAmount);
    const qrcodeCanvas = createCanvas(200, 200);
    qrCode.toCanvas(qrcodeCanvas, qrcodeText, function (error) {
			ctx.font = 'bold 40px "THSarabunNew"'
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			//ctx.fillText("สแกนเพื่อชำระเงิน", 200, 340);
			ctx.fillText("สแกนเพื่อชำระเงิน", 180, 40);

      let qrH = 200;
			ctx.drawImage(qrcodeCanvas, 80, 60, qrH, qrH);

			ctx.font = 'bold 30px "THSarabunNew"'
			ctx.textAlign = 'left';

			//let textFormater = util.format("หมายเลขพร้อมเพย์ %s ", ppData.ppayno);
			//ctx.fillText(textFormater, 20, 290);

			textFormater = util.format("ชื่อบัญชี  %s %s", ppData.fname, ppData.lname);
			ctx.fillText(textFormater, 20, 290);

			textFormater = util.format("จำนวนเงิน %s บาท", Number(ppData.netAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
			ctx.fillText(textFormater, 20, 320);

			ctx.font = 'bold 25px "THSarabunNew"'
			ctx.textAlign = 'left';
			let today = new Date();
			textFormater = util.format("วันที่ : %s เวลา : %s" ,  formatCustomerDate(today), formatCustomerTime(today));
			ctx.fillText(textFormater, 20, (maxH-20));

      let imageFileName = "PPQR-" + ppData.ppayno + "-" + today.getTime();

			let imageFileExName = '.png';

      let imageLink = '/img/usr/qrcode/' + imageFileName + imageFileExName;
			let imagePath =  shopDir + imageLink;

			log.info('imagePath ==> ' + imagePath);

			const out = fs.createWriteStream(imagePath);
			const stream = imageCanvas.createPNGStream();
			stream.pipe(out);
			out.on('finish', () =>  {
				resolve({qrLink: '/shop' + imageLink, qrPath: imagePath, qrFileName: imageFileName});
			});
    });
  });
}

module.exports = (monitor) => {
  log = monitor;
  ppText = require('./promptpaytext.js')(log);
  return {
    doCreatePPQRCode,
		doCreatePPQRCodeAddAdv
  }
}
