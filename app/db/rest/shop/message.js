const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, auth;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

//My Messages load
app.post('/my/load/(:userId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const userId = req.params.userId;
          const messages = await db.messages.findAll({where: {userId: userId}, order: orderby});
          res.json({status: {code: 200}, Records: messages});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Shop Messages load Status 1 and 2
app.post('/shop/load/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const shopId = req.params.shopId;
          const userInfoModel = {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']};
          const messageInclude = [userInfoModel];
          const whereCluase = {ToShopId: shopId, Status: { [db.Op.in]: [1, 2] }};
          const messages = await db.messages.findAll({include: messageInclude, where: whereCluase, order: orderby});
          res.json({status: {code: 200}, Records: messages});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Shop Messages load all Status (1, 2, 3)
app.post('/shop/loadall/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const shopId = req.params.shopId;
          const userInfoModel = {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']};
          const messageInclude = [userInfoModel];
          const whereCluase = {ToShopId: shopId};
          const messages = await db.messages.findAll({include: messageInclude, where: whereCluase, order: orderby});
          res.json({status: {code: 200}, Records: messages});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Shop Mobile Messages load Status (1, 2)
app.post('/shop/mobile/load/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const totalLastRow = 20;
          const orderby = [['Status', 'ASC'], ['id', 'DESC']];
          const shopId = req.params.shopId;
          const userInfoModel = {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH']};
          const messageInclude = [userInfoModel];
          const whereCluase = {ToShopId: shopId};
          const messages = await db.messages.findAll({include: messageInclude, where: whereCluase, order: orderby, limit: totalLastRow});
          res.json({status: {code: 200}, Records: messages});

        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Select API
app.post('/select/(:messageId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let messageId = req.params.messageId;
          const messages = await db.messages.findAll({ attributes: excludeColumn, where: {id: messageId}});
          res.json({status: {code: 200}, Record: messages[0]});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Add New message API
app.post('/add', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let newmessage = req.body.data;
        log.info('newmessage=>'+JSON.stringify(newmessage));
        try {
          let admessage = await db.messages.create(newmessage);
          log.info('admessage.id=>' + admessage.id);
          let updateMessage = {shopId: req.body.shopId, userId: req.body.userId, userinfoId: req.body.userinfoId};
          log.info('updateMessage=>'+JSON.stringify(updateMessage));
          await db.messages.update(updateMessage, {where: {id: admessage.id}});
          res.json({Result: "OK", status: {code: 200}, Record: admessage});

        } catch(error) {
          log.error('Message Add Error=>' + JSON.stringify(error))
        }
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Update message API
app.post('/update', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let updatemessage = req.body.data;
        await db.messages.update(updatemessage, { where: { id: req.body.id } });
        res.json({Result: "OK", status: {code: 200}});
      } else if (ur.token.expired){
        res.json({status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//Deltete message API
app.post('/delete', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        await db.messages.destroy({ where: { id: req.body.id } });
        res.json({Result: "OK", status: {code: 200}});
      } else if (ur.token.expired){
        res.json({ status: {code: 210}, token: {expired: true}});
      } else {
        log.info('Can not found user from token.');
        res.json({status: {code: 203}, error: 'Your token lost.'});
      }
    });
  } else {
    log.info('Authorization Wrong.');
    res.json({status: {code: 400}, error: 'Your authorization wrong'});
  }
});

//New Status Count of shopId
app.post('/month/new/count/(:shopId)', async (req, res) => {
  try {
    let shopId = req.params.shopId;
    let whereCluase = {ToShopId: shopId, Status: 1};
    let messageCount = await db.messages.count({where: whereCluase});
    res.json({status: {code: 200}, count: messageCount});
  } catch(error) {
    log.error(error);
    res.json({status: {code: 500}, error: error});
  }
});

module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  return app;
}
