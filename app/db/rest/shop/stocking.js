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

const offset = 7;
const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };
const { QueryTypes } = require('sequelize');

const formatDateTimeToStrWithoutTimeZone = function(dt){
	let d = new Date(dt);
	//สำหรับ timezone = Etc/UTC
	let utc = d.getTime();
	d = new Date(utc - (3600000 * offset));
	//สำหรับ timezone = Asia/Bangkok
	//d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
	var yy, mm, dd, hh, mn, ss;
	yy = d.getFullYear();
	if (d.getMonth() + 1 < 10) {
		mm = '0' + (d.getMonth() + 1);
	} else {
		mm = '' + (d.getMonth() + 1);
	}
	if (d.getDate() < 10) {
		dd = '0' + d.getDate();
	} else {
		dd = '' + d.getDate();
	}
	if (d.getHours() < 10) {
		hh = '0' + d.getHours();
	} else {
		 hh = '' + d.getHours();
	}
	if (d.getMinutes() < 10){
		 mn = '0' + d.getMinutes();
	} else {
		mn = '' + d.getMinutes();
	}
	if (d.getSeconds() < 10) {
		 ss = '0' + d.getSeconds();
	} else {
		ss = '' + d.getSeconds();
	}
	var td = `${yy}-${mm}-${dd} ${hh}:${mn}:${ss}`;
	return td;
}

const summaryToCutoffDate = function(menuitemId, cutoffDate) {
  return new Promise(async function(resolve, reject) {
    const orderby = [['id', 'ASC']];
    const whereCluase = {menuitemId: menuitemId};
    let fromDateWithZ = new Date(cutoffDate);
    fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7));

    //fromDateWithZ.setDate(fromDateWithZ.getDate() + 1);
		fromDateWithZ.setDate(fromDateWithZ.getDate());

    whereCluase.StockedAt = { [db.Op.lt]: new Date(fromDateWithZ)};
    const stocks = await db.stockings.findAll({where: whereCluase, order: orderby});
    const promiseList = new Promise(async function(resolve2, reject2) {
			let sumQty = 0;
			let sumAmountIn = 0;
			let sumAmountOut = 0;
      for (let i=0; i < stocks.length; i++){
        if (stocks[i].Direction == '+') {
          sumQty = sumQty + stocks[i].Qty;
					sumAmountIn = sumAmountIn + (stocks[i].Qty * stocks[i].Price);
        } else if (stocks[i].Direction == '-') {
          sumQty = sumQty - stocks[i].Qty;
					sumAmountOut = sumAmountOut + (stocks[i].Qty * stocks[i].Price);
        }
      }
      setTimeout(()=> {
        resolve2({Qty: sumQty, AmountIn: sumAmountIn, AmountOut: sumAmountOut});
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

//Update StockedAt Stocking API
app.post('/edit/stockeddate', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let stockingId = req.body.stockingId;
        log.info('stockingId=>'+stockingId);
        let updateStock = req.body.data;
        log.info('updateStock=>'+JSON.stringify(updateStock));
        try {
          let fromDateWithZ = new Date(updateStock.StockedAt);
          log.info('fromDateWithZ=>'+ fromDateWithZ);
          let fromDateWithoutZ = formatDateTimeToStrWithoutTimeZone(fromDateWithZ);
          log.info('fromDateWithoutZ=>'+ fromDateWithoutZ);

          let sqlCmd = 'update stockings set "StockedAt"=to_timestamp(\'' + fromDateWithoutZ + '\', \'yyyy-mm-dd hh24:mi\') where id=' + stockingId;
          log.info('sqlCmd=>'+ sqlCmd);

          await db.sequelize.query(sqlCmd, {type: QueryTypes.UPDATE});
          res.json({Result: "OK", status: {code: 200}});
        } catch(error) {
          log.error('Stocking Update StockedAt Error=>' + JSON.stringify(error));
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
        const orderby = [['StockedAt', 'ASC']];
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
        whereCluase.StockedAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
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


app.post('/summary/(:shopId)', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        const orderby = [['StockedAt', 'ASC']];
        let shopId = req.params.shopId;
        let cutoffDate = req.body.cutoffDate;
        log.info('cutoffDate=>'+cutoffDate);

				const stocks = await db.menuitems.findAll({ attributes: ['id', 'MenuName'], where: {shopId: shopId, StockingOption: '1'}});

				let results = [];

				const promiseList = new Promise(async function(resolve2, reject2) {
		      for (let i=0; i < stocks.length; i++){
						let menuitemId = stocks[i].id;
						let menuitemName = stocks[i].MenuName;
						log.info('MenuitemId=>' + menuitemId)
						let sum = await summaryToCutoffDate(menuitemId, cutoffDate);
						let before = {Qty: sum.Qty, AmountIn: sum.AmountIn, AmountOut: sum.AmountOut};

						let fromDateWithZ = new Date(cutoffDate);
						fromDateWithZ = new Date(fromDateWithZ.getTime() - (3600000 * 7))
						let toDateWithZ = new Date();
						toDateWithZ = new Date(toDateWithZ.getTime() - (3600000 * 7))
						toDateWithZ.setDate(toDateWithZ.getDate() + 1);
						let whereCluase = {menuitemId: menuitemId};
						whereCluase.StockedAt = { [db.Op.between]: [new Date(fromDateWithZ), new Date(toDateWithZ)]};
						const stockAfters = await db.stockings.findAll({where: whereCluase, order: orderby});

				    const promiseList2 = new Promise(async function(resolve3, reject3) {
							let sumQty = 0;
							let sumAmountIn = 0;
							let sumAmountOut = 0;
				      for (let i=0; i < stockAfters.length; i++){
				        if (stockAfters[i].Direction == '+') {
				          sumQty = sumQty + stockAfters[i].Qty;
									sumAmountIn = sumAmountIn + (stockAfters[i].Qty * stockAfters[i].Price);
				        } else if (stockAfters[i].Direction == '-') {
				          sumQty = sumQty - stockAfters[i].Qty;
									sumAmountOut = sumAmountOut + (stockAfters[i].Qty * stockAfters[i].Price);
				        }
				      }
				      setTimeout(()=> {
				        resolve3({Qty: sumQty, AmountIn: sumAmountIn, AmountOut: sumAmountOut});
				      },100);
				    });
				    Promise.all([promiseList2]).then((ob)=> {
							let after = ob[0];
							let result = {MenuitemId: menuitemId, MenuitemName: menuitemName, Before: before, After: after, CutoffDate: cutoffDate};
							results.push(result);
				    });
		      }
		      setTimeout(()=> {
		        resolve2(results);
		      },800);
		    });
		    Promise.all([promiseList]).then((ob)=> {
					res.json({ status: {code: 210}, results: ob[0]});
		    });
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
