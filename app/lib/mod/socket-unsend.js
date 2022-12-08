/*socket-unsend.js*/
var db, log;

//['PDF_DicomSeriesIds', 'SeriesInstanceUIDs', 'SOPInstanceUIDs']

const doLoadUnSendData = (hospitalId) => {
  return new Promise(async (resolve, reject) => {
    let whereClous = {
      PDF_DicomSeriesIds: {
        hospitalId: {[db.Op.eq]: hospitalId},
        callData: {
          type: {[db.Op.eq]: "newreport"}
        }
      }
    };
    let unsendReports = await db.casereports.findAll({attributes: ['id', 'caseId', 'PDF_DicomSeriesIds'], where: whereClous});
    //log.info('unsendReports=>' + JSON.stringify(unsendReports));
    resolve(unsendReports);
  });
}

const doShiftToSendData = (reportId, unsendData) => {
  return new Promise(async (resolve, reject) => {
    await db.casereports.update({PDF_DicomSeriesIds: {}, SeriesInstanceUIDs: unsendData}, { where: {id: reportId }});
    resolve();
  });
}

module.exports = (dbconn, monitor) => {
  db = dbconn;
  log = monitor;

  return {
    doLoadUnSendData,
    doShiftToSendData
	}
}
