const A4Width = 1004;
const A4Height = 1410;
const SlipWidth = 374;
const SlipHeight = 1410;

const reportParams = {};

function doSetReportParams(shopId, orderId, docType){
  reportParams.shopId = shopId;
  reportParams.orderId = orderId;
  reportParams.docType = docType;
}

function doGetApi(url, params) {
  return new Promise(function(resolve, reject) {
    $.get(url, params, function(response){
      resolve(response);
    })
  });
}

function doCallApi(url, params) {
  return new Promise(function(resolve, reject) {
    $.post(url, params, function(response){
      resolve(response);
    })
  });
}

function doLoadReportVarialble(orderId, docType){
  return new Promise(function(resolve, reject) {
    let apiUrl = '/api/shop/invoice/variable';
    let params = {orderId: orderId, docType: docType};
    doCallApi(apiUrl, params).then((result) => {
      resolve(result);
    });
  });
}

function doFormatNumber(num){
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  return Number(num).toLocaleString('en', options);
}

function doFormatQtyNumber(num){
  if ((Number(num) === num) && (num % 1 !== 0)) {
    return doFormatNumber(num);
  } else {
    return Number(num);
  }
}

function doReplaceDynamicContent(variable, field) {
  switch (field) {
    case 'shop_name':
      return variable.shop_name;
    break;
    case 'shop_address':
      return variable.shop_address;
    break;
    case 'shop_tel':
      return variable.shop_tel;
    break;
    case 'shop_mail':
      return variable.shop_mail;
    break;
    case 'shop_vatno':
      return variable.shop_vatno;
    break;
    case 'customer_name':
      return variable.customer_name;
    break;
    case 'customer_address':
      return variable.customer_address;
    break;
    case 'customer_tel':
      return variable.customer_tel;
    break;
    case 'order_no':
      return variable.order_no;
    break;
    case 'order_by':
      return variable.order_by;
    break;
    case 'order_datetime':
      return variable.order_datetime;
    break;
    case 'print_no':
      return variable.print_no;
    break;
    case 'print_by':
      return variable.print_by;
    break;
    case 'print_datetime':
      return variable.print_datetime;
    break;
    case 'print_date':
      return variable.print_date;
    break;
    case 'print_time':
      return variable.print_time;
    break;
    case 'total':
      return doFormatNumber(variable.total);
    break;
    case 'discount':
      return doFormatNumber(variable.discount);
    break;
    case 'vat':
      return doFormatNumber(variable.vat);
    break;
    case 'grandtotal':
      return doFormatNumber(variable.grandtotal);
    break;
    case 'baht_word':
      return variable.baht_word;
    break;
    case 'paytype':
      return variable.paytype;
    break;
    case 'payamount':
      return doFormatNumber(variable.payamount);
    break;
    case 'cashchange':
      return doFormatNumber(variable.cashchange);
    break;
  }
}

function doReplaceDynamicGooditem(gooditem, field, itemNo) {
  switch (field) {
    case 'gooditem_no':
      return itemNo.toString();
    break;
    case 'gooditem_name':
      return gooditem.MenuName;
    break;
    case 'gooditem_unit':
      return gooditem.Unit;
    break;
    case 'gooditem_price':
      return doFormatNumber(gooditem.Price);
    break;
    case 'gooditem_qty':
      return doFormatQtyNumber(gooditem.Qty);
    break;
    case 'gooditem_total':
      return doFormatNumber(Number(gooditem.Qty) * Number(gooditem.Price));
    break;
  }
}

function doMapGooditemCell(mapCells, gooditems, tableRow, row) {
  return new Promise(async function(resolve, reject) {
    const promiseList = new Promise(async function(resolve2, reject2) {
      let newFields = []
      for (let k=0; k < mapCells.length; k++){
        let field = mapCells[k].substring(1);
        let value = doReplaceDynamicGooditem(gooditems[row], field, (row+1));
        let layoutField = {};
        await Object.getOwnPropertyNames(tableRow.fields[k]).forEach((tag) => {
          if (tag !== 'cellData') {
            layoutField[tag] = tableRow.fields[k][tag];
          } else {
            layoutField[tag] = value
          }
        });
        newFields.push(layoutField);
      }
      setTimeout(()=> {
        resolve2(newFields);
      }, 400);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

function doMapGooditemRow(gooditems, tableRow) {
  return new Promise(async function(resolve, reject) {
    let mapCells = [];
    await tableRow.fields.forEach((item, i) => {
      mapCells.push(item.cellData);
    });
    const promiseList = new Promise(async function(resolve2, reject2) {
      let newRows = [];
      for (let j=0; j < gooditems.length; j++){
        let newRow = {};
        await Object.getOwnPropertyNames(tableRow).forEach((tag) => {
          if (tag !== 'fields') {
            newRow[tag] = tableRow[tag];
          }
        });

        let newFields = await doMapGooditemCell(mapCells, gooditems, tableRow, j);

        newRow.fields = newFields;
        newRows.push(newRow);
      }
      setTimeout(()=> {
        resolve2(newRows);
      }, 500);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

function doMapGoodItem(variable, table){
  return new Promise(async function(resolve, reject) {
    const promiseList = new Promise(async function(resolve2, reject2) {
      let copyTable = {};
      await Object.getOwnPropertyNames(table).forEach((tag) => {
        if (tag !== 'rows') {
          copyTable[tag] = table[tag];
        } else {
          copyTable['rows'] = [];
        }
      });
      for (let i=0; i < table.rows.length; i++) {
        let tableRow = table.rows[i];
        if (tableRow.id === 'dataRow') {
          let newRows = await doMapGooditemRow(variable.gooditems, tableRow);
          await newRows.forEach((item, i) => {
            copyTable.rows.push(item);
          });
        } else {
          for (let j=0; j < tableRow.fields.length; j++) {
            if (tableRow.fields[j].cellData.substring(0, 1) === '$'){
              let field = tableRow.fields[j].cellData.substring(1);
              let realValue = doReplaceDynamicContent(variable, field);
              tableRow.fields[j].cellData = realValue;
            }
          }
          copyTable.rows.push(tableRow);
        }
      }
      setTimeout(()=> {
        resolve2(copyTable);
      }, 500);
    });
    Promise.all([promiseList]).then((ob)=> {
      resolve(ob[0]);
    });
  });
}

function doMapContent(elements, variable, paperSize){
  return new Promise(async function(resolve, reject) {
    let successElements = [];
    let maxTop = 0;
    const promiseList = new Promise(async function(resolve2, reject2) {
      for (let i=0; i < elements.length; i++) {
        let item = elements[i];
        let field = undefined;
        let realValue = undefined;
        if (item.elementType === 'text'){
          if (item.type === 'dynamic'){
            field = item.title.substring(1);
            realValue = doReplaceDynamicContent(variable, field);
            item.title = realValue;
            successElements.push(item);
          } else {
            successElements.push(item);
          }
        } else if (item.elementType === 'table'){
          let mapTable = await doMapGoodItem(variable, item);
          successElements.push(mapTable);
        } else {
          successElements.push(item);
        }
        if (item.x > maxTop) {
          maxTop = item.x;
        }
      }
      setTimeout(()=> {
        resolve2(successElements);
      }, 1000);
    });
    Promise.all([promiseList]).then(async (ob)=> {
      successElements = ob[0];
      let imageDynamicIndex = await successElements.findIndex((item)=>{
        return ((item.elementType === 'image') && (item.type === 'dynamic') && (item.x === '*') && (item.y === '*'))
      });
      if (imageDynamicIndex >= 0) {
        //element.id === 'image-element-PPQR'
        doMapImageAtLeftBottomPage(successElements[imageDynamicIndex], maxTop, paperSize)
      }
      imageDynamicIndex = await successElements.findIndex((item)=>{
        return ((item.elementType === 'image') && (item.type === 'dynamic') && (item.x === '**') && (item.y === '**'))
      });
      if (imageDynamicIndex >= 0) {
        //element.id === 'image-element-Advert'
        doMapImageAtRightBottomPage(successElements[imageDynamicIndex], maxTop, paperSize, 400, variable.rsDimension);
      }
      imageDynamicIndex = await successElements.findIndex((item)=>{
        return ((item.elementType === 'image') && (item.type === 'dynamic') && (item.x === '***') && (item.y === '***'))
      });
      if (imageDynamicIndex >= 0) {
        //element.id === 'image-element-DocLink'
        doMapDocLinkImage(successElements[imageDynamicIndex], maxTop, paperSize, 160, variable.rsDimension);
      }
      resolve(successElements);
    });
  });
}

function doMapImageAtLeftBottomPage(element, maxTop, paperSize) {
  /* setup x position only */
  let w = 240;
  let h = 267;
  let x = 0;
  let y = 0;
  if (paperSize == 1) {
    x = 10;
    y = (A4Height - h) + 90;
  } else if (paperSize == 2) {
    x = (SlipWidth/2) - (w/2);
    y = maxTop;
  }
  element.x = x;
  element.y = y;
  element.width = w;
  element.height = h;
  return element;
}

function doMapImageAtRightBottomPage(element, top, paperSize, imageWidth, rsDimension) {
  /* setup x position only */
  let w = 0;
  let h = 123;
  let x = 0;
  let y = 0;
  if (paperSize == 1) {
    w = imageWidth;
    x = 10;
    y = (A4Height - h) + 90;
  } else if (paperSize == 2) {
    w = imageWidth * 0.5;
    x = (SlipWidth/2) - (w/2);
    y = (Number(rsDimension.top) + Number(rsDimension.height.template)) + 10;
  }
  element.x = x;
  element.y = y;
  element.width = w;
  element.height = h;
  return element;
}

function doMapDocLinkImage(element, top, paperSize, imageWidth, rsDimension) {
  /* setup x position only */
  let w = imageWidth;
  let h = imageWidth;
  let x = 0;
  let y = 0;
  if (paperSize == 1) {
    x = A4Width - w - 10;
    //y = A4Height - h - 90;
    y = 1190;
  } else if (paperSize == 2) {
    x = (SlipWidth/2) - (w/2);
    y = top;
  }
  element.x = x;
  element.y = y;
  element.width = w;
  element.height = h;
  return element;
}

function doCreateReportDOM(elements, variable, qrcodeLink, orderId, paperSize, cb){
  /* setup y position only */
  let wrapper = $("#report-wrapper").empty();
  let formatedContents = elements;
  doMapContent(elements, variable, paperSize).then(async (formatedContents)=>{
    let maxTop = 0;
    let lastElement = undefined;
    await formatedContents.forEach((item, i) => {
      let newElement = doCreateElement(wrapper, item.elementType, item, paperSize, variable.rsDimension);
      let newTop = parseFloat($(newElement).css('top'));
      if (newTop > maxTop) {
        maxTop = newTop;
        lastElement = $(newElement);
      }
    });

    let advertImageElem = $(wrapper).find('#image-element-Advert');
    let ppqrImageElem = $(wrapper).find('#image-element-PPQR');
    let doclinkImageElem = $(wrapper).find('#image-element-DocLink');

    console.log('rsDimension=>' + JSON.stringify(variable.rsDimension));

    if (paperSize == 1) {
      let realH = Number(variable.rsDimension.top) + Number(variable.rsDimension.height.real);
      let diff = A4Height - realH;
      console.log('diff=>' + diff); //1410
      if (diff > 220) {
        $(advertImageElem).css({'top': 1340 + 'px'});
        $(ppqrImageElem).css({'top': 1190 + 'px'});
        $(doclinkImageElem).css({'top': 1190 + 'px'});
      } else {
        $(advertImageElem).css({'top': (maxTop + 50)+'px'});
        $(ppqrImageElem).css({'top': (maxTop + 50)+'px'});
        $(doclinkImageElem).css({'top': (maxTop + 50)+'px'});
      }
    } else if (paperSize == 2) {
      console.log('maxTop=>' + maxTop);
      if ((advertImageElem) && (advertImageElem.length > 0)) {
        maxTop = maxTop + 80;
        $(advertImageElem).css({'top': (maxTop)+'px'});
      }
      if ((ppqrImageElem) && (ppqrImageElem.length > 0)) {
        maxTop = maxTop + 90;
        $(ppqrImageElem).css({'top': (maxTop)+'px'});
        if ((doclinkImageElem) && (doclinkImageElem.length > 0)) {
          maxTop = maxTop + 220 + 70;
          $(doclinkImageElem).css({'top': (maxTop)+'px'});
          maxTop = maxTop + 160;
          $(wrapper).css({'heigth' : (maxTop)+'px'});
        } else {
          maxTop = maxTop + 70;
          $(wrapper).css({'heigth' : (maxTop)+'px'});
        }
      } else {
        if ((doclinkImageElem) && (doclinkImageElem.length > 0)) {
          maxTop = maxTop + 70;
          $(doclinkImageElem).css({'top': (maxTop)+'px'});
          maxTop = maxTop + 200;
          $(wrapper).css({'heigth' : (maxTop)+'px'});
        } else {
          maxTop = maxTop + 70;
          $(wrapper).css({'heigth' : (maxTop)+'px'});
        }
      }
    }
    console.log('maxTop=>' + maxTop);
    cb($(wrapper).html(), maxTop);
  });
}

function doCreateElement(wrapper, elemType, elem, paperSize, rsDimension){
  /*
  rsDimension = {top: tableTop, height: {real: totalHeight, template: tableHeight}}
  */
  const newRatio = 1.0;
  let rsH = Number(rsDimension.top) + Number(rsDimension.height.template);
  let element, beforeTop, newTop;
  switch (elemType) {
    case "text":
      element = $("<div></div>").css({'position': 'absolute'});
      if (elem.id) {
        $(element).attr('id', elem.id);
      }
      $(element).css({"left": Number(elem.x)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
      if (Number(elem.y) < (Number(rsDimension.top))) {
        newTop = Number(elem.y)*newRatio;
        $(element).css({"top": newTop + "px"});
      } else {
        beforeTop = Number(elem.y) - rsH;
        newTop = Number(rsDimension.top) + Number(rsDimension.height.real) + beforeTop;
        $(element).css({"top": newTop*newRatio + "px"});
      }
      $(element).css({"font-size": Number(elem.fontsize)*newRatio + "px"});
      $(element).css({"font-weight": elem.fontweight});
      $(element).css({"font-style": elem.fontstyle});
      $(element).css({"text-align": elem.fontalign});
      $(element).text(elem.title);
    break;
    case "hr":
      element = $("<div><hr/></div>").css({'position': 'absolute'});
      if (elem.id) {
        $(element).attr('id', elem.id);
      }
      $(element).css({"left": Number(elem.x)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
      if (Number(elem.y) < (Number(rsDimension.top))) {
        newTop = Number(elem.y)*newRatio;
        $(element).css({"top": newTop + "px"});
      } else {
        beforeTop = Number(elem.y) - (Number(rsDimension.top) + Number(rsDimension.height.template));
        newTop = Number(rsDimension.top) + Number(rsDimension.height.real) + beforeTop;
        $(element).css({"top": newTop*newRatio + "px"});
      }
      $(element > "hr").css({"border": elem.border});
    break;
    case "image":
      element = $("<div></div>").css({'position': 'absolute'});
      if (elem.id) {
        $(element).attr('id', elem.id);
      }
      let newImage = new Image();
      newImage.src = elem.url;
      newImage.setAttribute("width", Number(elem.width)*newRatio);
      $(element).append(newImage);
      $(element).css({"width": Number(elem.width)*newRatio + "px", "height": "auto"});
      if (elem.id === 'image-element-Advert') {
        $(element).css({"right": Number(elem.x)*newRatio + "px" });
      } else if (elem.id === 'image-element-Advert') {
        $(element).css({"right": Number(elem.x)*newRatio + "px" });
      } else {
        $(element).css({"left": Number(elem.x)*newRatio + "px"});
      }
      if (Number(elem.y) < (Number(rsDimension.top))) {
        newTop = Number(elem.y)*newRatio;
        $(element).css({"top": newTop + "px"});
      } else {
        beforeTop = Number(elem.y) - (Number(rsDimension.top) + Number(rsDimension.height.template));
        newTop = Number(rsDimension.top) + Number(rsDimension.height.real) + beforeTop;
        $(element).css({"top": newTop*newRatio + "px"});
      }
    break;
    case "table":
      element = doRenderTable(wrapper, elem.rows, elem.x, elem.y, elem.border, newRatio);
      if (elem.id) {
        $(element).attr('id', elem.id);
      }
    break;
  }
  $(element).appendTo($(wrapper));
  return $(element);
}

const doRenderTable = function(wrapper, tableRows, left, top, border, ratio){
  let table = $('<table cellpadding="2" cellspacing="0" width="100%"></tble>');
  $(table).attr('border', border);
  let fullW = 0;
  tableRows[0].fields.forEach((field, i) => {
    fullW += Number(field.width);
  });

  for (let i=0; i < tableRows.length; i++){
    let row = $('<tr></tr>');
    if (tableRows[i].backgroundColor) {
      $(row).css({'background-color': tableRows[i].backgroundColor, 'height': tableRows[i].height + 'px'})
    }
    for (let j=0; j < tableRows[i].fields.length; j++) {
      let cell = $('<td></td>');
      if (tableRows[i].fields.length == 1) {
        $(cell).attr("colspan", (tableRows[0].fields.length).toString());
      } else if (tableRows[i].fields.length == 2) {
        if (j == 0) {
          $(cell).attr("colspan", (tableRows[0].fields.length - 1).toString());
        } else if (j == 1) {
          $(cell).attr("colspan", (tableRows[0].fields.length - 2).toString());
        }
      } else if (tableRows[i].fields.length == 3) {
        if (j == 0) {
          $(cell).attr("colspan", (2).toString());
        } else if (j == 1) {
          $(cell).attr("colspan", (tableRows[0].fields.length - 3).toString());
        }
      } else if (tableRows[i].fields.length == 4) {
        if (j == 0) {
          $(cell).attr("colspan", (2).toString());
        } else if (j == 1) {
          //$(cell).attr("colspan", (tableRows[0].fields.length - 2).toString());
        } else if (j == 3) {
          $(cell).attr("colspan", (2).toString());
        }
      } else if (tableRows[i].fields.length > 4) {
        //
      }
      $(cell).attr({'align': tableRows[i].fields[j].fontalign});
      $(cell).attr({'valign': tableRows[i].fields[j].valign});
      if (i == 0) {
        $(cell).attr({'width': (Number(tableRows[i].fields[j].width / fullW) * 100) + '%'});
      }
      $(cell).css({'font-size': Number(tableRows[i].fields[j].fontsize)*ratio + "px", 'font-weight': tableRows[i].fields[j].fontweight, 'font-style': tableRows[i].fields[j].fontstyle});
      $(cell).text(tableRows[i].fields[j].cellData);
      $(row).append($(cell));
    }
    $(table).append($(row));
  }
  let topPos = Number(top)*ratio;
  $(wrapper).append($(table).css({'position': 'absolute', 'left': Number(left)*ratio+'px', 'top': topPos+'px'}));
  return $(table);
}

$( document ).ready(function() {
  $.ajaxSetup({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
    }
  });
});

/*
Re-Create Document Report invoice/bill/taxinvoice
let docParams = {orderId: 181, shopId: 6};
let docRes = await common.doCallApi('/api/shop/bill/create/report', docParams);

let apiUrl = '/api/shop/bill/create/report';
let rqParams = {orderId: 181, shopId: 6};
$.post(apiUrl, rqParams, function(data){
	console.log(data);
}).fail(function(error) {
	console.error(error);
});
*/
