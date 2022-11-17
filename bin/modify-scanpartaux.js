const logname = 'scpaux-mod-log';
const log = require('electron-log');
log.transports.console.level = 'info';
log.transports.file.level = 'info';
log.transports.file.file = __dirname + '/..' + '/log/' + logname +'.log';
log.info('Start log = > ' + logname);

const db = require('../app/db/relation.js');
//db.sequelize.sync({ force: false });

const excludeColumn = { exclude: ['updatedAt', 'createdAt'] };

const modify = function() {
  return new Promise(async function(resolve, reject) {
    const scanPartAuxs = await db.scanpartauxs.findAll({ attributes: ['id', 'StudyDesc', 'ProtocolName', 'Scanparts'], order: [['id', 'ASC']]});
    const promiseList = new Promise(async function(resolve2, reject2) {
      let results = [];
      for (let i=0; i < scanPartAuxs.length; i++) {
        log.info(i + '. => ' + scanPartAuxs[i].StudyDesc + ' == ' + scanPartAuxs[i].ProtocolName);
        let auxItem = scanPartAuxs[i];
        log.info('auxItem=>' + JSON.stringify(auxItem));
        if ((auxItem.Scanparts.length) && (typeof auxItem.Scanparts.length == 'string')) {
          let tmps = [];
          let scpl = Number(auxItem.Scanparts.length);
          for (let i=0; i < scpl; i++){
            tmps.push(auxItem.Scanparts[i]);
          }
          log.info('tmps=>' + JSON.stringify(tmps));
          scanPartAuxs[i].Scanparts = tmps;
          let result = await scanPartAuxs[i].save();
          log.info('result=>' + JSON.stringify(result));
        } else {
          await auxItem.Scanparts.forEach(async (item, x) => {
            if ((item.sumaseId) && (item.sumaseId > 0)) {
              log.info(x + '. ==========================')
            } else {
              log.info('item=>' + JSON.stringify(item));
              let refId = item.id;
              let whereClous = {id: refId}
              let refs = await db.scanpartrefs.findAll({attributes: ['MajorType', 'sumaseId'], where: whereClous});
              log.info('refs =>' + JSON.stringify(refs));
              if (refs.length > 0) {
                let newScanparts = scanPartAuxs[i].Scanparts[x];
                newScanparts.MajorType = refs[0].MajorType;
                newScanparts.sumaseId = refs[0].sumaseId;
                scanPartAuxs[i].Scanparts = newScanparts;
                //scanPartAuxs[i].Scanparts[x].sumaseId = refs[0].sumaseId;
                //scanPartAuxs[i].Scanparts[x].MajorType = refs[0].MajorType;
                log.info('scanPartAuxs[' + i + '] =>' + JSON.stringify(scanPartAuxs[i]));
                results.push(scanPartAuxs[i]);
                let result = await scanPartAuxs[i].save();
                //log.info('result=>' + JSON.stringify(result));
                //results.push(result);
              }
            }
          });
        }
      }
      setTimeout(()=> {
        resolve2(results);
      },20000);
    });
    Promise.all([promiseList]).then((ob)=> {
      //log.info('results=>' + ob[0]);
      resolve(ob[0]);
    });
  });
}

const modify2 = function() {
  return new Promise(async function(resolve, reject) {
    const scanPartAuxs = await db.scanpartauxs.findAll({ attributes: ['id', 'StudyDesc', 'ProtocolName', 'Scanparts'], order: [['id', 'ASC']]});
    const promiseList = new Promise(async function(resolve2, reject2) {
      let results = [];
      for (let i=0; i < scanPartAuxs.length; i++) {
        let currentScanparts = scanPartAuxs[i].Scanparts;
        scanPartAuxs[i].Scanparts = [currentScanparts];
        let result = await scanPartAuxs[i].save();
        results.push(result);
      }
      setTimeout(()=> {
        resolve2(results);
      },20000);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

modify2();
