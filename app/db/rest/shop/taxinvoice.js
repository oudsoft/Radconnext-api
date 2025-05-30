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
          const taxinvoices = await db.taxinvoices.findAll({attributes: excludeColumn, where: {shopId: shopId}, order: orderby});
          res.json({status: {code: 200}, Records: taxinvoices});
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
          const taxinvoices = await db.taxinvoices.findAll({attributes: excludeColumn, where: {userId: userId}, order: orderby});
          res.json({status: {code: 200}, Records: taxinvoices});
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

app.post('/find/last/taxinvioceno/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const shopId = req.params.shopId;
          const taxinvoices = await db.taxinvoices.findAll({attributes: ['No'], where: {shopId: shopId}, order: orderby, limit: 1});
          res.json({status: {code: 200}, Records: taxinvoices});
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
app.post('/select/(:taxinvoiceId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let taxinvoiceId = req.params.taxinvoiceId;
          const taxinvoices = await db.taxinvoices.findAll({ attributes: excludeColumn, where: {id: taxinvoiceId}});
          res.json({status: {code: 200}, Record: taxinvoices[0]});
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
        let newtaxinvoice = req.body.data;
        log.info('newtaxinvoice=>'+JSON.stringify(newtaxinvoice));
        try {
          let newtaxinvoiceData = {No: newtaxinvoice.No, Discount: parseFloat(newtaxinvoice.Discount), Vat: parseFloat(newtaxinvoice.Vat), Filename: newtaxinvoice.Filename};
          if (newtaxinvoice.Remark) {
            newtaxinvoiceData.Remark = newtaxinvoice.Remark;
          }
          let adtaxinvoice = await db.taxinvoices.create(newtaxinvoiceData);
          await db.taxinvoices.update({shopId: req.body.shopId, orderId: req.body.orderId, userId: req.body.userId, userinfoId: req.body.userinfoId}, {where: {id: adtaxinvoice.id}});
          res.json({Result: "OK", status: {code: 200}, Record: adtaxinvoice});

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
          log.error('Tax-Invoice Add Error=>' + JSON.stringify(error))
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
        let updateinvoice = req.body.data;
        await db.taxinvoices.update(updateinvoice, { where: { id: req.body.id } });
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
        await db.taxinvoices.destroy({ where: { id: req.body.id } });
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
        let docType = 3;
        let shopId = req.body.shopId;
        let docRes = await commonReport.doCreateReport(orderId, docType, shopId);
        await db.taxinvoices.update({Report: docRes.doc}, { where: { orderId: orderId } });
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
          let taxinvoiceDate = req.body.taxinvoiceDate; // {taxinvoiceDate: 'yyyy-mm-dd'}
          let date = undefined;
          if (taxinvoiceDate) {
            date = new Date(taxinvoiceDate);
          } else {
            date = new Date();
          }
          let fromDateWithZ = new Date(date.getFullYear(), date.getMonth(), 1);
          fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));
          let toDateWithZ = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7));
          whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          let taxinvoiceCount = await db.taxinvoices.count({where: whereCluase});
          res.json({status: {code: 200}, count: taxinvoiceCount});
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
    let taxinvoiceDate = req.query.taxinvoiceDate;
    let date = undefined;
    if (taxinvoiceDate) {
      date = new Date(taxinvoiceDate);
    } else {
      date = new Date();
    }
    let fromDateWithZ = new Date(date.getFullYear(), date.getMonth(), 1);
    fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));
    let toDateWithZ = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7));
    whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
    let taxinvoiceCount = await db.taxinvoices.count({where: whereCluase});
    res.json({status: {code: 200}, count: taxinvoiceCount});
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
