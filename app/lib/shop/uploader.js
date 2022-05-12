/* uploader.js */
const util = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const base64Img = require('base64-img');
const exec = require('child_process').exec;

const DWLD = process.env.SHOP_USRUPLOAD_PATH;
const USRUPLOAD_DIR = process.env.SHOP_USRUPLOAD_DIR;
const currentDir = __dirname;
const parentDir = path.normalize(currentDir + '/..');
const usrUploadDir = path.join(__dirname, '../../../', USRUPLOAD_DIR);

const maxUploadSize = 900000000;

const upload = multer({
  dest: usrUploadDir,
  limits: {fileSize: 100000000}
});

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, usrUploadDir);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const parseStr = function (str) {
  var args = [].slice.call(arguments, 1),
      i = 0;
  return str.replace(/%s/g, () => args[i++]);
}

const genUniqueID = function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4();
}

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

module.exports = function (app) {

	app.post('/shop/upload/shoplogo', upload.array('shoplogo'), function(req, res) {
		//const token = req.cookies[process.env.COOKIE_NAME].token;
		//console.log('token from cookie', token);

		const rootname = req.originalUrl.split('/')[1];

		var filename = req.files[0].originalname;
		var fullnames = filename.split('.');

		var newFileName = genUniqueID() + '.' + fullnames[1];
		var imgPath = req.files[0].destination + '/' + req.files[0].filename;
		var newPath = req.files[0].destination + '/shoplogo/'  + newFileName;
		var readStream = fs.createReadStream(imgPath);
		var writeStream = fs.createWriteStream(newPath);
		readStream.pipe(writeStream);

		var command = parseStr(' rm %s', imgPath);
		runcommand(command).then((stdout) => {
			var link =  DWLD + '/shoplogo/' + newFileName;
			res.status(200).send({status: {code: 200}, text: 'ok upload shop logo.', link: link});
		}).catch((err) => {
			console.log('err: 500 >>', err);
      res.status(500).send({status: {code: 500}, error: ree});
		});
	});

  app.post('/shop/upload/menugrouplogo', upload.array('groupmenulogo'), function(req, res) {

		const rootname = req.originalUrl.split('/')[1];

		var filename = req.files[0].originalname;
		var fullnames = filename.split('.');

		var newFileName = genUniqueID() + '.' + fullnames[1];
		var imgPath = req.files[0].destination + '/' + req.files[0].filename;
		var newPath = req.files[0].destination + '/groupmenulogo/'  + newFileName;
		var readStream = fs.createReadStream(imgPath);
		var writeStream = fs.createWriteStream(newPath);
		readStream.pipe(writeStream);

		var command = parseStr(' rm %s', imgPath);
		runcommand(command).then((stdout) => {
			var link =  DWLD + '/groupmenulogo/' + newFileName;
			res.status(200).send({status: {code: 200}, text: 'ok upload groupmenu logo.', link: link});
		}).catch((err) => {
			console.log('err: 500 >>', err);
      res.status(500).send({status: {code: 500}, error: ree});
		});
	});

  app.post('/shop/upload/menuitemlogo', upload.array('menuitemlogo'), function(req, res) {

    const rootname = req.originalUrl.split('/')[1];

    var filename = req.files[0].originalname;
    var fullnames = filename.split('.');

    var newFileName = genUniqueID() + '.' + fullnames[1];
    var imgPath = req.files[0].destination + '/' + req.files[0].filename;
    var newPath = req.files[0].destination + '/itemmenulogo/'  + newFileName;
    var readStream = fs.createReadStream(imgPath);
    var writeStream = fs.createWriteStream(newPath);
    readStream.pipe(writeStream);

    var command = parseStr(' rm %s', imgPath);
    runcommand(command).then((stdout) => {
      var link =  DWLD + '/itemmenulogo/' + newFileName;
      res.status(200).send({status: {code: 200}, text: 'ok upload itemmenu logo.', link: link});
    }).catch((err) => {
      console.log('err: 500 >>', err);
      res.status(500).send({status: {code: 500}, error: ree});
    });
  });

	return {
		genUniqueID,
		parseStr,
		runcommand
	}

}
