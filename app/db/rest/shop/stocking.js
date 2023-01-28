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

const summaryToCutoffDate = function(menuitemId, cutoffDate) {
  return new Promise(async function(resolve, reject) {
    const orderby = [['id', 'ASC']];
    const whereCluase = {menuitemId: menuitemId};
    let fromDateWithZ = new Date(cutoffDate);
    fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));

    fromDateWithZ.setDate(fromDateWithZ.getDate() + 2);

    whereCluase.createdAt = { [db.Op.lt]: new Date(fromDateWithZ)};
    const stocks = await db.stockings.findAll({where: whereCluase, order: orderby});
    let sum = 0;
    const promiseList = new Promise(async function(resolve2, reject2) {
      for (let i=0; i < stocks.length; i++){
        if (stocks[i].Direction == '+') {
          sum = sum + stocks[i].Qty;
        } else if (stocks[i].Direction == '-') {
          sum = sum - stocks[i].Qty;
        }
      }
      setTimeout(()=> {
        resolve2({Qty: sum});
      },800);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

//Add New Stocking API
app.post('/add', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let newStock = req.body.data;
        let shopId = req.body.shopId;
        let userId = req.body.userId;
        let orderId = req.body.orderId;
        let menuitemId = req.body.menuitemId;
        log.info('newstocking=>'+JSON.stringify(newStock));
        try {
          let newStockIn = {Direction: newStock.Direction, Qty: parseFloat(newStock.Qty), Price: parseFloat(newStock.Price), StockedAt: new Date()};
          let adStock = await db.stockings.create(newStockIn);
          await db.stockings.update({shopId: shopId, orderId: orderId, userId: userId, menuitemId: menuitemId}, {where: {id: adStock.id}});
          res.json({Result: "OK", status: {code: 200}, Record: adStock});
        } catch(error) {
          log.error('Stocking Add Error=>' + JSON.stringify(error));
          res.json({Result: "ERROR", status: {code: 400}, Error: error});
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

//Update Stocking API
app.post('/update', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let updateStock = req.body.data;
        let stockingId = req.body.stockingId;
        let shopId = req.body.shopId;
        let userId = req.body.userId;
        let orderId = req.body.orderId;
        let menuitemId = req.body.menuitemId;
        log.info('updateStock=>'+JSON.stringify(updateStock));
        try {
          let updateStockIn = {Direction: updateStock.Direction, Qty: parseFloat(updateStock.Qty), Price: parseFloat(updateStock.Price)};
          await db.stockings.update(updateStockIn, {where: {id: stockingId}});
          res.json({Result: "OK", status: {code: 200}, Record: updateStockIn});
        } catch(error) {
          log.error('Stocking Update Error=>' + JSON.stringify(error));
          res.json({Result: "ERROR", status: {code: 400}, Error: error});
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

//Update CreatedAt Stocking API
app.post('/edit/createdate', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let stockingId = req.body.stockingId;
        let updateStock = req.body.data;
        log.info('updateStock=>'+JSON.stringify(updateStock));
        try {
          let fromDateWithZ = new Date(updateStock.StockedAt);
          //fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));

          //let updateCreatedAt = {StockedAt: new Date()};
          let updateCreatedAt = {StockedAt: new Date(fromDateWithZ.getTime() - (3600000 * 7))};
          log.info('updateCreatedAt=>'+ JSON.stringify(updateCreatedAt));
          await db.stockings.update(updateCreatedAt, {where: {id: stockingId}});
          //db.stockings.set('StockedAt', new Date(fromDateWithZ.getTime() - (3600000 * 7)));
          //db.stockings.set('StockedAt', new Date(updateStock.StockedAt));
          //await db.stockings.save();
          res.json({Result: "OK", status: {code: 200}, Record: updateStockIn});
        } catch(error) {
          log.error('Stocking Update CreatedAt Error=>' + JSON.stringify(error));
          res.json({Result: "ERROR", status: {code: 400}, Error: error});
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

//Delete Stocking API
app.post('/delete', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let stockingId = req.body.stockingId;
        log.info('stockingId=>'+stockingId);
        try {
          await db.stockings.destroy({ where: { id: stockingId} });
          res.json({Result: "OK", status: {code: 200}});
        } catch(error) {
          log.error('Stocking Delete Error=>' + JSON.stringify(error));
          res.json({Result: "ERROR", status: {code: 400}, Error: error});
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

app.post('/list/by/menuitem/(:menuitemId)', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const orderby = [['createdAt', 'ASC']];
        let menuitemId = req.params.menuitemId;
        log.info('menuitemId=>'+menuitemId);
        let cutoffDate = req.body.cutoffDate;
        log.info('cutoffDate=>'+cutoffDate);

        let sumQty = await summaryToCutoffDate(menuitemId, cutoffDate);

        let fromDateWithZ = new Date(cutoffDate);
        fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7))
        let toDateWithZ = new Date();
        toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7))
        toDateWithZ.setDate(toDateWithZ.getDate() + 1);

        const whereCluase = {menuitemId: menuitemId};
        whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
        const stocks = await db.stockings.findAll({where: whereCluase, order: orderby});
        res.json({ status: {code: 200}, Records: stocks, sumQty: sumQty, menuitemId: menuitemId, cutoffDate: cutoffDate});
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

module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  return app;
}
