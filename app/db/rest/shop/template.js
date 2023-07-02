const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var db, log, auth, commonreport;

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const doGenOptions = function(shopId) {
  return new Promise(function(resolve, reject) {
    const promiseList = new Promise(async function(resolve, reject) {
      const orderby = [['id', 'ASC']];
      const templates = await db.templates.findAll({ attributes: ['id', 'Name'], where: {shopId: shopId}, order: orderby});
      const result = [];
      templates.forEach((template, i) => {
        result.push({Value: template.id, DisplayText: template.Name});
      });
      setTimeout(()=> {
        resolve({Result: "OK", Options: result});
      },200);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    }).catch((err)=>{
      reject(err);
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
          const orderby = [['id', 'ASC'], ['TypeId', 'ASC']];
          const shopId = req.params.shopId;
          const templates = await db.templates.findAll({attributes: excludeColumn, where: {shopId: shopId}, order: orderby});
          res.json({status: {code: 200}, Records: templates});
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
app.post('/select/(:templateId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let templateId = req.params.templateId;
          const templates = await db.templates.findAll({ attributes: excludeColumn, where: {id: templateId}});
          res.json({status: {code: 200}, Records: [templates[0]]});
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
        let newtemplate = req.body.data;
        let adtemplate = await db.templates.create(newtemplate);
        await db.templates.update({shopId: req.body.shopId}, {where: {id: adtemplate.id}});
        const templates = await db.templates.findAll({ attributes: excludeColumn, where: {id: adtemplate.id}});
        res.json({Result: "OK", status: {code: 200}, Record: templates[0]});
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
        let updatetemplate = req.body.data;
        await db.templates.update(updatetemplate, { where: { id: req.body.id } });
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

//Save Template API
app.post('/save', async (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        let shopId = req.body.shopId;
        let typeId = req.body.data.TypeId;
        let templates = await db.templates.findAll({attributes: excludeColumn, where: {shopId: shopId, TypeId: typeId}});
        if (templates.length == 0) {
          let newtemplate = req.body.data;
          let adtemplate = await db.templates.create(newtemplate);
          await db.templates.update({shopId: req.body.shopId},{where: {id: adtemplate.id}});
          templates = await db.templates.findAll({ attributes: excludeColumn, where: {id: adtemplate.id}});
          res.json({Result: "Add OK", status: {code: 200}, Record: templates[0]});
        } else {
          let templateId = templates[0].id;
          let updatetemplate = req.body.data;
          await db.templates.update(updatetemplate, {where: {id: templateId}});
          templates = await db.templates.findAll({ attributes: excludeColumn, where: {id: templateId}});
          res.json({Result: "Update OK", status: {code: 200}, Record: templates[0]});
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

//Deltete Hospital API
app.post('/delete', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        await db.cutomers.destroy({ where: { id: req.body.id } });
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

app.post('/create/default/(:shopId)', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let shopId = req.params.shopId;

          let directoryPath = path.join(__dirname, '../../../');

          let rawdata = fs.readFileSync(directoryPath + '/lib/shop/defaultinvoice.json');
          let defaultInvoiceFile = JSON.parse(rawdata);

          rawdata = fs.readFileSync(directoryPath + '/lib/shop/defaultbill.json');
          let defaultBillFile = JSON.parse(rawdata);

          let templateOptions = {ppqr: {bill: 1, invoice: 1, taxinvoice: 1}};
          let defaultInvoice = {
            Name: 'My Invoice',
            TypeId: 1,
            Content: defaultInvoiceFile,
            shopId: shopId,
            PaperSize: 2,
            Options: templateOptions
          }
          let defaultBill = {
            Name: 'My Bill',
            TypeId: 2,
            Content: defaultBillFile,
            shopId: shopId,
            PaperSize: 2,
            Options: templateOptions
          }

          //log.info('defaultInvoice=>' + JSON.stringify(defaultInvoice));
          //log.info('defaultBill=>' + JSON.stringify(defaultBill));

          let adtemplate1 = await db.templates.create(defaultInvoice);

          let adtemplate2 = await db.templates.create(defaultBill);


          res.json({Result: "Create Default OK", status: {code: 200}});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
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

app.post('/update/template/logo', (req, res) => {
  let token = req.headers.authorization;
  if (token) {
    auth.doDecodeToken(token).then(async (ur) => {
      if (ur.length > 0){
        try {
          let shopId = req.body.shopId;
          let link = req.body.link;
          log.info('link=>' + link);
          let templates = await db.templates.findAll({ attributes: ['id', 'Content'], where: {shopId: shopId, TypeId: 1}});
          if (templates.length > 0) {
            let contentJsons = templates[0].Content;
            let logoElement = await contentJsons.find((elem) =>{
              if (elem.id === 'image-element-1') {
                return elem;
              }
            });
            log.info('logoElement=>' + JSON.stringify(logoElement));
            if (logoElement) {
              logoElement.url = link;
              log.info('contentJsons=>' + JSON.stringify(contentJsons));
              log.info('templates[0].id=>' + templates[0].id);
              await db.templates.update({Content: contentJsons}, {where: {id: templates[0].id}});
            }
          }

          templates = await db.templates.findAll({ attributes: ['id', 'Content'], where: {shopId: shopId, TypeId: 2}});
          if (templates.length > 0) {
            let contentJsons = templates[0].Content;
            let logoElement = await contentJsons.find((elem) =>{
              if (elem.id === 'image-element-1') {
                return elem;
              }
            });
            if (logoElement) {
              logoElement.url = link;
              await db.templates.update({Content: contentJsons}, {where: {id: templates[0].id}});
            }
          }

          let shops = await db.shops.findAll({ attributes: ['Shop_VatNo'], where: {id: shopId}});
          if ((shops.length > 0) && (shops[0].Shop_VatNo !== '')) {
            templates = await db.templates.findAll({ attributes: ['id', 'Content'], where: {shopId: shopId, TypeId: 3}});
            if (templates.length > 0) {
              let contentJsons = templates[0].Content;
              let logoElement = await contentJsons.find((elem) =>{
                if (elem.id === 'image-element-1') {
                  return elem;
                }
              });
              if (logoElement) {
                logoElement.url = link;
                await db.templates.update({Content: contentJsons}, {where: {id: templates[0].id}});
              }
            }
          }
          res.status(200).send({status: {code: 200}, text: 'Update Bill Logo Success.', link: link});
        } catch(error) {
          log.error(error);
          res.json({status: {code: 500}, error: error});
        }
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

app.get('/options/(:shopId)', (req, res) => {
  let shopId = req.params.shopId;
  doGenOptions(shopId).then((result) => {
    res.json(result);
  })
});

app.post('/options/(:shopId)', async (req, res) => {
  let shopId = req.params.shopId;
  doGenOptions(shopId).then((result) => {
    res.json(result);
  })
});

app.get('/billFieldOptions', (req, res) => {
  res.json(commonreport.billFieldOptions);
});


module.exports = ( dbconn, monitor ) => {
  db = dbconn;
  log = monitor;
  auth = require('./auth.js')(db, log);
  commonreport = require('./commonreport.js')(db, log);
  return app;
}
