const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, wss, auth;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const doSearchOrder = function(whereCluase, orderby) {
  return new Promise(async function(resolve, reject) {
    const orderInclude = [{model: db.customers, attributes: ['id', 'Name', 'Address', 'Tel']}, {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH', 'User_Phone', 'User_LineID']}];
    const orders = await db.orders.findAll({include: orderInclude, where: whereCluase, order: orderby});
    const promiseList = new Promise(async function(resolve2, reject2) {
      let orderList = [];
      for (let i=0; i < orders.length; i++){
        let order = orders[i];
        let newOrder = {};
        if (order.Status == 1) {
          newOrder = order
          orderList.push(newOrder);
        } else if (order.Status == 2) {
          let invoices = await db.invoices.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          newOrder = JSON.parse(JSON.stringify(order));
          if (invoices.length > 0) {
            newOrder.invoice = invoices[0];
          }
          orderList.push(newOrder);
        } else if (order.Status == 3) {
          let invoices = await db.invoices.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          let bills = await db.bills.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          let payments = await db.payments.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          newOrder = JSON.parse(JSON.stringify(order));
          if (invoices.length > 0) {
            newOrder.invoice = invoices[0];
          }
          if (bills.length > 0) {
            newOrder.bill = bills[0];
          }
          if (payments.length > 0) {
            newOrder.payment = payments[0];
          }
          orderList.push(newOrder);
        } else if (order.Status == 4) {
          let invoices = await db.invoices.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          let bills = await db.bills.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          let taxinvoices = await db.taxinvoices.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          let payments = await db.payments.findAll({attributes: excludeColumn, where: {orderId: order.id}});
          newOrder = JSON.parse(JSON.stringify(order));
          if (invoices.length > 0) {
            newOrder.invoice = invoices[0];
          }
          if (bills.length > 0) {
            newOrder.bill = bills[0];
          }
          if (taxinvoices.length > 0) {
            newOrder.taxinvoice = taxinvoices[0];
          }
          if (payments.length > 0) {
            newOrder.payment = payments[0];
          }
          orderList.push(newOrder);
        } else if (order.Status == 0) {
          newOrder = order
          orderList.push(newOrder);
        }
      }
      setTimeout(()=> {
        resolve2(orderList);
      },800);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

const doFindItemsDiff = function(newItems, oldItems) {
  return new Promise(function(resolve, reject) {
    const promiseList = new Promise(async function(resolve2, reject2) {
      let upItems = [];
      let downItems = [];
      let qtys = [];
      if ((newItems.length > 0) && (oldItems.length > 0)) {
        await newItems.forEach(async (itemO1, i) => {
          let id = Number(itemO1.id);
          let upItem = await oldItems.find((itemO2, j) =>{
            if (Number(itemO2.id) == id) {
              return itemO2;
            }
          });
          if (!upItem) {
            upItems.push(itemO1);
          }
        });
        await oldItems.forEach(async (itemO2, i) => {
          let id = Number(itemO2.id);
          let downItem = await newItems.find((itemO1, j) =>{
            if (Number(itemO1.id) == id) {
              return itemO1;
            }
          });
          if (!downItem) {
            downItems.push(itemO2);
          }
        });
        await newItems.forEach(async (itemO1, i) => {
          let id = Number(itemO1.id);
          let foundItem = await oldItems.find((itemO2, j) =>{
            if (Number(itemO2.id) == id) {
              return itemO2;
            }
          });
          if (foundItem) {
            let diff = Number(itemO1.Qty) - Number(foundItem.Qty);
            if (diff != 0) {
              foundItem.diff = diff;
              qtys.push(foundItem);
            }
          }
        });
      }
      setTimeout(()=> {
        resolve2({upItems, downItems, qtys});
      },1800);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

//List API
app.post('/list/by/shop/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'ASC']];
          const shopId = req.params.shopId;
          const whereCluase = {shopId: shopId};
          const orderDate = req.body.orderDate;
          if (orderDate) {
            let fromDateWithZ = new Date(orderDate);
            fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7))
            let toDateWithZ = new Date(orderDate);
            toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7))
            //log.info('fromDateWithZ=>' + fromDateWithZ);
            toDateWithZ.setDate(toDateWithZ.getDate() + 1);
            //log.info('toDateWithZ=>' + toDateWithZ);
            whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          }

          let orederRecords = await doSearchOrder(whereCluase, orderby);
          res.json({status: {code: 200}, Records: orederRecords});

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
          const whereCluase = {userId: userId};
          const orderDate = req.body.orderDate;
          if (orderDate) {
            let fromDateWithZ = new Date(orderDate);
            let toDateWithZ = new Date(orderDate);
            toDateWithZ.setDate(toDateWithZ.getDate() + 1);
            whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          }
          let orederRecords = await doSearchOrder(whereCluase, orderby);
          res.json({status: {code: 200}, Records: orederRecords});
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

app.post('/list/by/customer/(:customerId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'DESC']];
          const customerId = req.params.customerId;
          const whereCluase = {customerId: customerId};
          const orderDate = req.body.orderDate;
          if (orderDate) {
            let fromDateWithZ = new Date(orderDate);
            let toDateWithZ = new Date(orderDate);
            toDateWithZ.setDate(toDateWithZ.getDate() + 1);
            whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          }
          let orederRecords = await doSearchOrder(whereCluase, orderby);
          res.json({status: {code: 200}, Records: orederRecords});
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

app.post('/active/by/shop/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          const orderby = [['id', 'ASC']];
          const shopId = req.params.shopId;
          const whereCluase = {shopId: shopId};
          const orderDate = req.body.orderDate;
          if (orderDate) {
            let fromDateWithZ = new Date(orderDate);
            fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7))
            let toDateWithZ = new Date(orderDate);
            toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7))
            toDateWithZ.setDate(toDateWithZ.getDate() + 1);
            whereCluase.createdAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
          }

          whereCluase.Status = {[db.Op.in]: [1, 2]};

          const orderInclude = [{model: db.customers, attributes: ['id', 'Name', 'Address', 'Tel']}];
          const orders = await db.orders.findAll({include: orderInclude, where: whereCluase, order: orderby});
          res.json({status: {code: 200}, Records: orders});

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
app.post('/select/(:orderId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let orderId = req.params.orderId;
          const orderInclude = [{model: db.customers, attributes: ['id', 'Name', 'Address', 'Tel', 'Mail']}, {model: db.userinfoes, attributes: ['id', 'User_NameEN', 'User_LastNameEN', 'User_NameTH', 'User_LastNameTH', 'User_Phone', 'User_LineID']}];
          const orders = await db.orders.findAll({ attributes: excludeColumn, include: orderInclude, where: {id: orderId}});
          res.json({status: {code: 200}, Record: orders[0]});
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
        let newOrder = req.body.data;
        let adOrder = await db.orders.create(newOrder);
        await db.orders.update({shopId: req.body.shopId, customerId: req.body.customerId, userId: req.body.userId, userinfoId: req.body.userinfoId}, {where: {id: adOrder.id}});
        res.json({Result: "OK", status: {code: 200}, Records: [adOrder]});
        let newOrderData = {type: 'shop', orderId: adOrder.id, shopId: req.body.shopId, status: 'New', shop: {}, msg: 'มีออร์เดอร์ใหม่'};
        wss.doControlShopMessage(newOrderData);
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
        let shopCookingOption = req.body.shop.Shop_CookingOption;
        //console.log('shopCookingOption=>' + shopCookingOption);
        let beforeItems = await db.orders.findAll({ attributes: ['Items', 'shopId'], where: {id: req.body.id}});
        //console.log('beforeItems=> ' + JSON.stringify(beforeItems));
        let updateOrder = req.body.data;
        //console.log('updateOrder=> ' + JSON.stringify(updateOrder));
        if ((updateOrder) && (updateOrder.Items)) {
          if (shopCookingOption == 0) {
            await db.orders.update(updateOrder, { where: { id: req.body.id } });
            res.json({Result: "OK", status: {code: 200}});
          } else {
            updateOrder.BeforeItems = beforeItems[0].Items;
            await db.orders.update(updateOrder, { where: { id: req.body.id } });
            if ((updateOrder.Items) && (updateOrder.Items.length > 0)) {
              let diffItems = await doFindItemsDiff(updateOrder.Items, updateOrder.BeforeItems);
              //console.log('diffItems=> ' + JSON.stringify(diffItems));
              res.json({Result: "OK", status: {code: 200}, DiffItems: diffItems});
              let updateOrderData = {type: 'shop', orderId: req.body.id, shopId: beforeItems[0].shopId, status: 'New', shop: 'orderupdate', updataData: {diffItems: diffItems}};
              if ((diffItems.upItems.length > 0) || (diffItems.downItems.length > 0) || (diffItems.qtys.length > 0)) {
                updateOrderData.msg = 'มีการแก้ไขออร์เดอร์';
              }
              wss.doControlShopMessage(updateOrderData);
            } else {
              res.json({Result: "OK", status: {code: 200}});
            }
          }
        } else {
          await db.orders.update({Items: []}, { where: { id: req.body.id } });
          res.json({status: {code: 200}, Result: 'Blank Order'});
        }
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
        await db.orders.destroy({ where: { id: req.body.id } });
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

//update gooditem status API
app.post('/item/status/update', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let shopCookingOption = req.body.shop.Shop_CookingOption;
        //console.log('shopCookingOption=>' + shopCookingOption);

        let orderId = req.body.orderId;
        let goodId = req.body.goodId;
        let newStatus = req.body.newStatus;
        let whereClous = {id: orderId};

        if (shopCookingOption == 0) {
          let resultItems = await db.orders.findAll({ attributes: ['Items'], where: whereClous});
          await resultItems[0].Items.forEach((item, i) => {
            if (item.id == goodId){
              item.ItemStatus = newStatus;
            }
          });
          await db.orders.update({Items: resultItems[0].Items}, { where: whereClous});
          res.json({Result: "OK", status: {code: 200}, result: resultItems});
        } else {
          let beforeItems = await db.orders.findAll({ attributes: ['Items', 'shopId'], where: whereClous});
          let resultItems = await db.orders.findAll({ attributes: ['Items'], where: whereClous});
          await resultItems[0].Items.forEach((item, i) => {
            if (item.id == goodId){
              item.ItemStatus = newStatus;
            }
          });
          await db.orders.update({BeforeItems: beforeItems[0].Items, Items: resultItems[0].Items}, { where: whereClous});
          if ((resultItems[0].Items) && (resultItems[0].Items.length > 0)) {
            let diffItems = await doFindItemsDiff(resultItems[0].Items, beforeItems[0].Items);
            //console.log('diffItems=> ' + JSON.stringify(diffItems));
            res.json({Result: "OK", status: {code: 200}, result: resultItems, DiffItems: diffItems});
            let updateOrderData = {type: 'shop', orderId: req.body.id, shopId: beforeItems[0].shopId, status: 'New', shop: 'orderupdate', updataData: {diffItems: diffItems}};
            if ((diffItems.upItems.length > 0) || (diffItems.downItems.length > 0) || (diffItems.qtys.length > 0)) {
              updateOrderData.msg = 'มีการแก้ไขออร์เดอร์';
            }
            wss.doControlShopMessage(updateOrderData);
          }
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

//Swap Item API
app.post('/swap/item', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let srcOrderId = req.body.srcOrderId;
        let tgtOrderId = req.body.tgtOrderId;
        let srcIndex = req.body.srcIndex;
        let srcOrders = await db.orders.findAll({attributes: ['Items'], where: {id: srcOrderId}});
        let tgtOrders = await db.orders.findAll({attributes: ['Items'], where: {id: tgtOrderId}});

        let item = srcOrders[0].Items[srcIndex];
        tgtOrders[0].Items.push(item);
        srcOrders[0].Items.splice(srcIndex, 1);

        await db.orders.update({Items: srcOrders[0].Items}, { where: { id: srcOrderId } });
        await db.orders.update({Items: tgtOrders[0].Items}, { where: { id: tgtOrderId } });

        //await srcOrders[0].save();
        //await tgtOrders[0].save();

        srcOrders = await db.orders.findAll({ attributes: ['Items'], where: {id: srcOrderId}});
        res.json({status: {code: 200}, srcOrders: srcOrders});

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

module.exports = ( dbconn, monitor, wsServer ) => {
  db = dbconn;
  log = monitor;
  wss = wsServer;
  auth = require('./auth.js')(db, log);
  return app;
}
