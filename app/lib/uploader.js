/* uploader.js */
const util = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const base64Img = require('base64-img');
const exec = require('child_process').exec;

const DWLD = process.env.USRUPLOAD_PATH;
const USRUPLOAD_DIR = process.env.USRUPLOAD_DIR;
const currentDir = __dirname;
const parentDir = path.normalize(currentDir + '/..');
const usrUploadDir = path.join(__dirname, '../../', USRUPLOAD_DIR);

const maxUploadSize = 500000000;

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
/*
const importer = multer({
  storage: storage,
  limits: {fileSize: maxUploadSize}
}).single('bestand');
*/
const importer = multer({dest: usrUploadDir, limits: {fileSize: maxUploadSize}});


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

	app.post('/uploadpatienthistory', upload.array('patienthistory'), function(req, res) {
		//const token = req.cookies[process.env.COOKIE_NAME].token;
		//console.log('token from cookie', token);

		const rootname = req.originalUrl.split('/')[1];

		var filename = req.files[0].originalname;
		var fullnames = filename.split('.');

		var newFileName = genUniqueID() + '.' + fullnames[1];
		var imgPath = req.files[0].destination + '/' + req.files[0].filename;
		var newPath = req.files[0].destination + '/'  + newFileName;
		var readStream = fs.createReadStream(imgPath);
		var writeStream = fs.createWriteStream(newPath);
		readStream.pipe(writeStream);

		var command = parseStr(' rm %s', imgPath);
		runcommand(command).then((stdout) => {
			//var link = 'http://' + req.headers.host + '/' + rootname + '/res' + DWLD + '/' + newFileName;
			var link =  DWLD + '/' + newFileName;
			res.status(200).send({status: {code: 200}, text: 'ok uploadpatienthistory.', link: link});

		}).catch((err) => {
			console.log('err: 500 >>', err);
      res.status(500).send({status: {code: 500}, error: ree});
		});
	});

	app.post('/scannerupload', function(req, res) {
  	const rootname = req.originalUrl.split('/')[1];
		var body = req.body;
		var newFileName = genUniqueID() + '.jpg';
		var newPath = usrUploadDir + '/'  + newFileName;
	  var base64Data = body.image.replace(/^data:image\/jpeg;base64,/,"");
		fs.writeFile(newPath, base64Data, 'base64', function(err) {
			if (err) {
				res.status(500).send({status: {code: 500}, text: 'Write File Error =>', error: err});
			} else {
				var link =  DWLD + '/' + newFileName;
				res.status(200).send({status: {code: 200}, text: 'ok scannerupload.', link: link});
				}
		});
	});

	app.post('/captureupload', upload.array('picture'), function(req, res) {

		var filename = req.files[0].originalname;
		var fullnames = filename.split('.');

		var newFileName = genUniqueID() + '.jpg';
		var imgPath = req.files[0].destination + '/' + req.files[0].filename;
		var newPath = req.files[0].destination + '/'  + newFileName;
		var readStream = fs.createReadStream(imgPath);
		var writeStream = fs.createWriteStream(newPath);
		readStream.pipe(writeStream);

		var command = parseStr('rm %s', imgPath);
		runcommand(command).then((stdout) => {
			var link =  DWLD + '/' + newFileName;

      res.status(200).send({status: {code: 200}, text: 'ok captureupload.', link: link});

		}).catch((err) => {
			console.log('err: 500 >>', err);
			res.status(500).send({status: {code: 500}, error: err});
		});
	});

  //app.post('/portal/archiveupload', upload.array('archiveupload'), function(req, res) {
  app.post('/portal/archiveupload', importer.array('archiveupload'), function(req, res) {
    /*
    importer(req,res,function(err) {
      if(err) {
        return res.end("Error uploading file.");
      }
    */
  		var filename = req.files[0].originalname;
  		var fullnames = filename.split('.');
  		var newFileName = genUniqueID() + '.zip';
  		var archivePath = req.files[0].destination + '/' + req.files[0].filename;
  		var newPath = req.files[0].destination + '/'  + newFileName;
  		var readStream = fs.createReadStream(archivePath);
  		var writeStream = fs.createWriteStream(newPath);
  		readStream.pipe(writeStream);

  		var command = parseStr('rm %s', archivePath);
  		runcommand(command).then((stdout) => {
  			var link =  DWLD + '/' + newFileName;

        res.status(200).send({status: {code: 200}, text: 'ok archive upload.', link: link, file: newFileName});

  		}).catch((err) => {
  			console.log('err: 500 >>', err);
  			res.status(500).send({status: {code: 500}, error: err});
  		});
    // });
	});

	return {
		genUniqueID,
		parseStr,
		runcommand
	}

}
