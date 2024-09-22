const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, auth;

app.get('/', (req, res) => {
  res.json({status: {code: 200}, login: 'failed', why: 'This API don\'t support HTTPT GET Method'});
});

app.post('/', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  //log.info('username => ' + username);
  //log.info('password => ' + password);
  auth.doVerifyUser(username, password).then(async(result) => {
    if (result.result === true) {
      const yourToken = auth.doEncodeToken(username);
      /*
      เริ่มเช็คว่าร้านมี Shop_VatNo หรือไม่
        ถ้าไม่มี ก็ไม่เป็นไร
        ถ้ามี เช็ค Template TypeId = 3 ว่ามีไหม
        ถ้ามี ไม่เป็นไร
        ถ้าไม่ ต้องแจ้งเตือนให้ สร้าง ใบกำกับภาษี
      */
      log.info('your result => ' + JSON.stringify(result));
      if (result.data.shop.Shop_VatNo !== '') {
        let shopId = result.data.shop.id;
        //log.info('your shopId => ' + shopId);
        const templates = await db.templates.findAll({attributes: ['Content'], where: {shopId: shopId, TypeId: 3}});
        //log.info('templates => ' + JSON.stringify(templates));
        if (templates.length == 0) {
          res.json({status: {code: 200}, success: true, token: yourToken, data: result.data, info: 'System not found Tax Invoice Template of your Shop, Pleate Create on Desktop Version.'});
        } else {
          res.json({status: {code: 200}, success: true, token: yourToken, data: result.data });
        }
      } else {
        res.json({status: {code: 200}, success: true, token: yourToken, data: result.data });
      }
    } else {
      res.json({status: {code: 200}, success: false});
    }
  }).catch ((err) => {
    res.json({status: {code: 500}, error: err});
  });
});

app.post('/newtoken', (req, res) => {
  const username = req.body.username;
  auth.doExistUser(username).then((ur) => {
    if ((ur.length > 0) && (ur[0].username === username)) {
      const yourNewToken = auth.doEncodeToken(username);
      res.json({status: {code: 200}, success: true, token: yourNewToken, data: ur[0] });
    } else {
      res.json({status: {code: 200}, success: false});
    }
  }).catch ((err) => {
    log.error('auth.doExistUser(' + username + ') Erroe => ' + JSON.stringify(err));
    res.json({status: {code: 500}, error: err});
  });
});

module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  return app;
}
