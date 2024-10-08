const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, auth, commonReport;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

//List API
app.post('/list/by/shop/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'ASC']];
          const shopId = req.params.shopId;
          const bills = await db.bills.findAll({attributes: excludeColumn, where: {shopId: shopId}, order: orderby});
          res.json({status: {code: 200}, Records: bills});
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

app.post('/list/by/user/(:userId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'ASC']];
          const userId = req.params.userId;
          const bills = await db.bills.findAll({attributes: excludeColumn, where: {userId: userId}, order: orderby});
          res.json({status: {code: 200}, Records: bills});
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

app.post('/find/last/billno/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const shopId = req.params.shopId;
          const bills = await db.bills.findAll({attributes: ['No'], where: {shopId: shopId}, order: orderby, limit: 1});
          res.json({status: {code: 200}, Records: bills});
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
app.post('/select/(:billId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let billId = req.params.billId;
          const bills = await db.bills.findAll({ attributes: excludeColumn, where: {id: billId}});
          res.json({status: {code: 200}, Record: bills[0]});
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

//Add New Hospital API
app.post('/add', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let newbill = req.body.data;
        log.info('newbill=>'+JSON.stringify(newbill));
        try {
          let newBillData = {No: newbill.No, Discount: parseFloat(newbill.Discount), Vat: parseFloat(newbill.Vat), Filename: newbill.Filename};
          if (newbill.Remark) {
            newBillData.Remark = newbill.Remark;
          }
          let adbill = await db.bills.create(newBillData);
          await db.bills.update({shopId: req.body.shopId, orderId: req.body.orderId, userId: req.body.userId, userinfoId: req.body.userinfoId}, {where: {id: adbill.id}});
          res.json({Result: "OK", status: {code: 200}, Record: adbill});

          let shopData = req.body.shopData;
          if (parseInt(shopData.Shop_StockingOption) == 1) {
            const orders = await db.orders.findAll({attributes: ['Items'], where: {id: req.body.orderId}});
            if (orders.length > 0) {
              const menuItems = orders[0].Items;
              for (let i=0; i < menuItems.length; i++){
                let stockingOption = menuItems[i].StockingOption;
                if (parseInt(stockingOption) == 1) {
                  let newStockOut = {Direction: '-', Qty: parseFloat(menuItems[i].Qty), Price: parseFloat(menuItems[i].Price), StockedAt: new Date()};
                  let adStock = await db.stockings.create(newStockOut);
                  await db.stockings.update({shopId: req.body.shopId, orderId: req.body.orderId, userId: req.body.userId, menuitemId: menuItems[i].id}, {where: {id: adStock.id}});
                }
              }
            }
          }

        } catch(error) {
          log.error('Bill Add Error=>' + JSON.stringify(error))
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

//Update Hospital API
app.post('/update', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let updatebill = req.body.data;
        await db.bills.update(updatebill, { where: { id: req.body.id } });
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

//Deltete Hospital API
app.post('/delete', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        await db.bills.destroy({ where: { id: req.body.id } });
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

//Create Pdf Report API
app.post('/create/report', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        log.info(JSON.stringify(req.body))
        let orderId = req.body.orderId;
        let docType = 2;
        let shopId = req.body.shopId;
        let docRes = await commonReport.doCreateReport(orderId, docType, shopId);
        await db.bills.update({Report: docRes.doc}, { where: { orderId: orderId } });
        if (docRes.status.code == 200) {
          res.json({status: {code: 200}, result: docRes.doc});
        } else if (docRes.status.code == 300) {
          res.json(docRes);
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

app.post('/mount/count/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const shopId = req.params.shopId;
          let whereCluase = {shopId: shopId};
          let billDate = req.body.billDate; // {billDate: 'yyyy-mm-dd'}
          let date = undefined;
          if (billDate) {
            date = new Date(billDate);
          } else {
            date = new Date();
          }
          let fromDateWithZ = new Date(date.getFullYear(), date.getMonth(), 1);
          fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));
          let toDateWithZ = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7));
          whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          let billCount = await db.bills.count({where: whereCluase});
          res.json({status: {code: 200}, count: billCount});
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

app.get('/mount/count/(:shopId)', async (req, res) => {
  try {
    let shopId = req.params.shopId;
    let whereCluase = {shopId: shopId};
    let billDate = req.query.billDate;
    let date = undefined;
    if (billDate) {
      date = new Date(billDate);
    } else {
      date = new Date();
    }
    let fromDateWithZ = new Date(date.getFullYear(), date.getMonth(), 1);
    fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));
    let toDateWithZ = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7));
    whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
    let billCount = await db.bills.count({where: whereCluase});
    res.json({status: {code: 200}, count: billCount});
  } catch(error) {
    log.error(error);
    res.json({status: {code: 500}, error: error});
  }
});

module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  commonReport = require('./commonreport.js')(db, log);
  return app;
}
