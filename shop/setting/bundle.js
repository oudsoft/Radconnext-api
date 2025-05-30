(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports=[
  {"filename": "shop-mng.js", "elementId": "orderMngCmd", "defaultWord": "ออร์เดอร์", "customWord": "แจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "titleTextBox", "defaultWord": "ออร์เดอร์", "customWord": "แจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "newOrderCmd", "defaultWord": "เปิดออร์เดอร์ใหม", "customWord": "เปิดรายการแจ้งซ่อมใหม่"},
  {"filename": "order-mng.js", "elementId": "titleOrderForm", "defaultWord": "ออร์เดอร์", "customWord": "แจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "notFoundOrderDatbox", "defaultWord": "ออร์เดอร์", "customWord": "แจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "opennerOrderLabel", "defaultWord": "ผู้รับออร์เดอร์", "customWord": "ผู้รับแจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "mergeOrderCmd", "defaultWord": "ยุบรวมออร์เดอร", "customWord": "ยุบรวมแจ้งซ่อม"},
  {"filename": "order-mng.js", "elementId": "cancelOrderCmd", "defaultWord": "ยกเลิกออร์เดอร", "customWord": "ยกเลิกแจ้งซ่อม"}
]

},{}],2:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const fileUploadMaxSize = 10000000;

	const shopSensitives = [6];

	const fmtStr = function (str) {
	  var args = [].slice.call(arguments, 1);
	  var i = 0;
	  return str.replace(/%s/g, () => args[i++]);
	}

  const doCallApi = function(apiUrl, rqParams) {
    return new Promise(function(resolve, reject) {
      $('body').loading('start');
      $.post(apiUrl, rqParams, function(data){
        resolve(data);
        $('body').loading('stop');
      }).fail(function(error) {
        reject(error);
        $('body').loading('stop');
      });
    });
  }

  const doGetApi = function(apiUrl, rqParams) {
    return new Promise(function(resolve, reject) {
      $('body').loading('start');
      $.get(apiUrl, rqParams, function(data){
        resolve(data);
        $('body').loading('stop');
      }).fail(function(error) {
        reject(error);
        $('body').loading('stop');
      });
    });
  }

	const doUserLogout = function() {
	  localStorage.removeItem('token');
		localStorage.removeItem('userdata');
		localStorage.removeItem('customers');
		localStorage.removeItem('menugroups');
		localStorage.removeItem('menuitems');
		localStorage.removeItem('changelogs');
		sessionStorage.removeItem('logged');
	  let url = '/shop/index.html';
	  window.location.replace(url);
	}

	const doFormatNumber = function(num){
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    return Number(num).toLocaleString('en', options);
  }

	const doFormatQtyNumber = function(num){
	  if ((Number(num) === num) && (num % 1 !== 0)) {
	    return doFormatNumber(num);
	  } else {
	    return Number(num);
	  }
	}

	const doFormatDateStr = function(d) {
		var yy, mm, dd;
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
		var td = `${yy}-${mm}-${dd}`;
		return td;
	}

	const doFormatTimeStr = function(d) {
		var hh, mn, ss;
		if (d.getHours() < 10) {
			hh = '0' + d.getHours();
		} else {
			hh = '' + d.getHours();
		}
		if (d.getMinutes() < 10) {
			mn = '0' + d.getMinutes();
		} else {
			mn = '' + d.getMinutes();
		}
		ss = d.getSeconds();
		var td = `${hh}.${mn}`;
		return td;
	}

	const doCreateImageCmd = function(imageUrl, title) {
    let imgCmd = $('<img src="' + imageUrl + '"/>').css({'width': '35px', 'height': 'auto', 'cursor': 'pointer', 'border': '2px solid #ddd'});
    $(imgCmd).hover(()=>{
			$(imgCmd).css({'border': '2px solid grey'});
		},()=>{
			$(imgCmd).css({'border': '2px solid #ddd'});
		});
		if (title) {
			$(imgCmd).attr('title', title);
		}
    return $(imgCmd)
  }

	const doCreateTextCmd = function(text, bgcolor, textcolor, bordercolor, hovercolor) {
    let textCmd = $('<span></span>').css({/*'min-height': '35px', 'line-height': '30px',*/ 'cursor': 'pointer', 'border-radius': '4px', 'padding': '4px', 'text-align': 'center', 'font-size': '16px'});
		$(textCmd).text(text);
		$(textCmd).css({'background-color': bgcolor, 'color': textcolor});
		if (bordercolor){
			$(textCmd).css({'border': '2px solid ' + bordercolor});
		} else {
			$(textCmd).css({'border': '2px solid #ddd'});
		}
		if ((bordercolor) && (hovercolor)) {
			$(textCmd).hover(()=>{
				$(textCmd).css({'border': '2px solid ' + hovercolor});
			},()=>{
				$(textCmd).css({'border': '2px solid ' + bordercolor});
			});
		} else {
    	$(textCmd).hover(()=>{
				$(textCmd).css({'border': '2px solid grey'});
			},()=>{
				$(textCmd).css({'border': '2px solid #ddd'});
			});
		}
    return $(textCmd)
  }

	const delay = function(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
	}

	const calendarOptions = {
		lang: "th",
		years: "2020-2040",
		sundayFirst: true,
	};

	const genUniqueID = function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4();
	}

	const isExistsResource = function(url) {
    if(url){
      var req = new XMLHttpRequest();
      req.open('GET', url, false);
      req.send();
      return req.status==200;
    } else {
      return false;
    }
	}

	const doCreateReportDocButtonCmd = function(text, textCmdCallback, qrCmdCallback) {
		let reportDocButtonBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
		let openReportDocCmd = $('<span>' + text + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
		$(openReportDocCmd).on('click', (evt)=>{
			evt.stopPropagation();
			textCmdCallback(evt);
		});
		let openReportQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
		$(openReportQrCmd).on('click', (evt)=>{
			evt.stopPropagation();
			qrCmdCallback(evt);
		});
		return $(reportDocButtonBox).append($(openReportDocCmd)).append($(openReportQrCmd));
	}

	const doCalOrderTotal = function(gooditems){
    return new Promise(async function(resolve, reject) {
      let total = 0;
      await gooditems.forEach((item, i) => {
        total += Number(item.Price) * Number(item.Qty);
      });
      resolve(total);
    });
  }

	const doResetSensitiveWord = function(words){
    return new Promise(async function(resolve, reject) {
			await words.forEach((word, i) => {
				if ($('#' + word.elementId).hasClass('sensitive-word')) {
					$('#' + word.elementId).text(word.customWord);
				}
			});
			resolve();
    });
  }

	const doConnectWebsocketMaster = function(username, usertype, shopId, connecttype){
	  const hostname = window.location.hostname;
		const protocol = window.location.protocol;
	  const port = window.location.port;
	  const paths = window.location.pathname.split('/');
	  const rootname = paths[1];

		let wsUrl = 'wss://' + hostname + ':' + port + '/' + username + '/' + shopId + '?type=' + connecttype;
		//let wsUrl = 'wss://radconnext.tech/' + username + '/' + shopId + '?type=' + connecttype;

	  const wsm = new WebSocket(wsUrl);
		wsm.onopen = function () {
			//console.log('Master Websocket is connected to the signaling server')
		};

		wsm.onclose = function(event) {
			//console.log("Master WebSocket is closed now. with  event:=> ", event);
		};

		wsm.onerror = function (err) {
		   console.log("Master WS Got error", err);
		};

		//console.log(usertype);

		/*
		if ((usertype == 1) || (usertype == 2) || (usertype == 3)) {
			const wsmMessageHospital = require('./websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageHospital.onMessageHospital;
		} else if (usertype == 4) {
			const wsmMessageRedio = require('../../radio/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRedio.onMessageRadio;
		} else if (usertype == 5) {
			const wsmMessageRefer = require('../../refer/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRefer.onMessageRefer;
		}
		*/

		const wsmMessageShop = require('./websocketmessage.js')($, wsm);
		wsm.onmessage = wsmMessageShop.onMessageShop;

		return wsm;
	}

	const doRenderEvtLogBox = function(foundItems){
		let logBox = $('<div></div>').css({'width': '100%', 'margin-top': '20px', 'padding': '5px'});
		for (let i=0; i < foundItems.length; i++) {
			let evtBox = $('<div></div>').css({'width': '95%', 'padding': '5px', 'border': '2px solid #dddd'});
			let foundItem = foundItems[i];
			let d = new Date(foundItem.date);
			let dd = doFormatDateStr(d);
			let tt = doFormatTimeStr(d);
			let diffItems = foundItem.diffItems;
			if (diffItems.upItems.length > 0) {
				$(evtBox).append($('<p><b>รายการเพิ่มมาใหม่ [' + dd + ' ' + tt +']</b></p>'));
				for (let x=0; x < diffItems.upItems.length; x++) {
					let evtMessageLine = fmtStr('%s. %s จำนวน <span class="qty">%s</span> %s', (x+1), diffItems.upItems[x].MenuName, doFormatNumber(Number(diffItems.upItems[x].Qty)), diffItems.upItems[x].Unit);
					$(evtBox).append($('<p></p>').html(evtMessageLine));
					$(evtBox).find('.qty').css({'min-width': '20px', 'background-color': 'grey', 'color': 'white', 'padding': '2px'});
					let deleteEvtCmd = $('<span><b>ลบ</b></span>').css({'margin-left': '10px', 'background-color': 'red', 'color': 'white', 'cursor': 'pointer'});
					$(deleteEvtCmd).on('click', (evt)=>{
						doRemoveChangeLogAt(i, 'upItems', x);
						$(evtBox).remove();
					});
					$(evtBox).append($(deleteEvtCmd));
				}
			}
			if (diffItems.downItems.length > 0) {
				$(evtBox).append($('<p><b>รายการถูกลดออกไป [' + dd + ' ' + tt +']</b></p>'));
				for (let y=0; y < diffItems.downItems.length; x++) {
					let evtMessageLine = fmtStr('%s. %s จำนวน <span class="qty">%s</span> %s', (y+1), diffItems.downItems[y].MenuName, doFormatNumber(Number(diffItems.downItems[y].Qty)), diffItems.downItems[y].Unit);
					$(evtBox).append($('<p></p>').html(evtMessageLine));
					$(evtBox).find('.qty').css({'min-width': '20px', 'background-color': 'grey', 'color': 'white', 'padding': '2px'});
					let deleteEvtCmd = $('<span><b>ลบ</b></span>').css({'margin-left': '10px', 'background-color': 'red', 'color': 'white', 'cursor': 'pointer'});
					$(deleteEvtCmd).on('click', (evt)=>{
						doRemoveChangeLogAt(i, 'downItems', y);
						$(evtBox).remove();
					});
					$(evtBox).append($(deleteEvtCmd));
				}
			}
			if (diffItems.qtys.length > 0) {
				$(evtBox).append($('<p><b>รายการคงอยู่แต่เปลี่ยนจำนวน [' + dd + ' ' + tt +']</b></p>'));
				for (let z=0; z < diffItems.qtys.length; z++) {
					let evtMessageLine = fmtStr('%s. %s จำนวน <span class="qty">%s</span> %s', (z+1), diffItems.qtys[z].MenuName, doFormatNumber(Number(diffItems.qtys[z].diff)), diffItems.qtys[z].Unit);
					$(evtBox).append($('<p></p>').html(evtMessageLine));
					$(evtBox).find('.qty').css({'min-width': '20px', 'background-color': 'grey', 'color': 'white', 'padding': '2px'});
					let deleteEvtCmd = $('<span><b>ลบ</b></span>').css({'margin-left': '10px', 'background-color': 'red', 'color': 'white', 'cursor': 'pointer'});
					$(deleteEvtCmd).on('click', (evt)=>{
						doRemoveChangeLogAt(i, 'qtys', z);
						$(evtBox).remove();
					});
					$(evtBox).append($(deleteEvtCmd));
				}
			}
			$(logBox).append($(evtBox));
		}
		return $(logBox);
	}

	const doPopupOrderChangeLog = async function(orderId) {
		let changelogs = JSON.parse(localStorage.getItem('changelogs'));
		let foundItems = await changelogs.filter((item, i) =>{
			if ((item.orderId == orderId) && (item.status === 'New')) {
				return item;
			}
		});
		let oldItems = await changelogs.filter((item, i) =>{
			if ((item.orderId == orderId) && (item.status === 'Read')) {
				return item;
			}
		});
		if (foundItems.length > 0) {
			let logBox = doRenderEvtLogBox(foundItems);
			let oldItemsBox = undefined;
			let readySwitchBox = $('<div id="ReadyState" style="position: relative; display: inline-block; float: right; margin-top: 15px;"></div>');
			let readyOption = {switchTextOnState: 'ดูทั้งหมด', switchTextOffState: 'ปิดรายการเก่า',
				onActionCallback: ()=>{
					oldItemsBox = doRenderEvtLogBox(oldItems);
					$(oldItemsBox).css({'background-color': '#dddd', 'width': '95%'});
					$(oldItemsBox).insertAfter(readySwitchBox);
					readySwitch.onAction();
				},
				offActionCallback: ()=>{
					$(oldItemsBox).remove();
					readySwitch.offAction();
				}
			};
			let readySwitch = $(readySwitchBox).readystate(readyOption);
			$(logBox).append($(readySwitchBox));

			let logDlgOption = {
				title: 'รายการแก้ไขออร์เดอร์',
				msg: $(logBox),
				width: '480px',
				onOk: async function(evt) {
					await doSetChangeStateLog(orderId);
					dlgHandle.closeAlert();
				},
				onCancel: function(evt){
					dlgHandle.closeAlert();
				}
			}
			let dlgHandle = $('body').radalert(logDlgOption);
			$(dlgHandle.cancelCmd).hide();
			return dlgHandle;
		} else {
			return;
		}
	}

	const doSetChangeStateLog = async function(orderId){
		let changelogs = JSON.parse(localStorage.getItem('changelogs'));
		let newChangelogs = [];
		await changelogs.forEach((item, i) => {
			if ((item.orderId == orderId) && (item.status === 'New')) {
				item.status = 'Read';
				newChangelogs.push(item);
			} else {
				newChangelogs.push(item);
			}
		});
		localStorage.setItem('changelogs', JSON.stringify(newChangelogs));
	}

	const doRemoveChangeLogAt = function(logIndex, diffType, diffIndex){
		let changelogs = JSON.parse(localStorage.getItem('changelogs'));
		if ((changelogs[logIndex]) && (changelogs[logIndex].diffItems[diffType])) {
			changelogs[logIndex].diffItems[diffType].splice(diffIndex, 1);
		}
		localStorage.setItem('changelogs', JSON.stringify(changelogs));
	}

	const isMobileDeviceCheck = function(){
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
			|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
			return true;
		} else {
			return false;
		}
	}

	const findCutoffDateFromDateOption = function(dUnit) {
    let d = dUnit.substring(0, dUnit.length - 1);
    let u = dUnit.substring(dUnit.length - 1);
    let now = new Date();
    if (u === 'D') {
      return now.setDate(now.getDate() - parseInt(d));
    } else if (u === 'M') {
      return now.setMonth(now.getMonth() - parseInt(d));
    } else if (u === 'Y') {
      return now.setFullYear(now.getFullYear() - parseInt(d));
    }
  }

  return {
		fileUploadMaxSize,
		shopSensitives,
		fmtStr,
    doCallApi,
    doGetApi,
		doUserLogout,
		doFormatNumber,
		doFormatQtyNumber,
		doFormatDateStr,
		doFormatTimeStr,
		doCreateImageCmd,
		doCreateTextCmd,
		delay,
		calendarOptions,
		genUniqueID,
		isExistsResource,
		doCreateReportDocButtonCmd,
		doCalOrderTotal,
		doResetSensitiveWord,
		doConnectWebsocketMaster,
		doPopupOrderChangeLog,
		isMobileDeviceCheck,
		findCutoffDateFromDateOption
	}
}

},{"./websocketmessage.js":4}],3:[function(require,module,exports){
const A4Width = 1004;
const A4Height = 1410;
const SlipWidth = 374;
const SlipHeight = 1410;

const templateTypes = [
  {id: 1, NameEN: 'Invoice', NameTH: 'ใบแจ้งหนี้'},
  {id: 2, NameEN: 'Bill', NameTH: 'บิลเงินสด/ใบเสร็จรับเงิน'},
  {id: 3, NameEN: 'Tax-Invoice', NameTH: 'ใบกำกับภาษี'}
];

const paperSizes = [
  {id: 1, NameEN: 'A4', NameTH: 'A4', width: A4Width},
  {id: 2, NameEN: 'Slip', NameTH: 'Slip', width: SlipWidth}
];

const defaultTableData = [
  {id: 'headerRow', backgroundColor: '#ddd', fields: [
      {id: 'headerCell_1', cellData: 'ลำดับที่', fontweight: 'bold', fontalign: 'center', width: '10%'},
      {id: 'headerCell_2', cellData: 'รายการสินค้า', fontweight: 'bold', fontalign: 'center', width: '34%'},
      {id: 'headerCell_3', cellData: 'ราคาต่อหน่วย', fontweight: 'bold', fontalign: 'center', width: '20%'},
      {id: 'headerCell_4', cellData: 'จำนวน', fontweight: 'bold', fontalign: 'center', width: '13%'},
      {id: 'headerCell_5', cellData: 'รวม', fontweight: 'bold', fontalign: 'center', width: '19%'}
    ]
  },
  {id: 'dataRow', class: 'gooditem', fields: [
      {id: 'dataCell_1', type: "dynamic", cellData: '$gooditem_no', fontweight: 'normal', fontalign: 'center', width: '10%'},
      {id: 'dataCell_2', type: "dynamic", cellData: '$gooditem_name', fontweight: 'normal', fontalign: 'left', width: '34%'},
      {id: 'dataCell_3', type: "dynamic", cellData: '$gooditem_price', fontweight: 'normal', fontalign: 'center', width: '20%'},
      {id: 'dataCell_4', type: "dynamic", cellData: '$gooditem_qty', fontweight: 'normal', fontalign: 'center', width: '13%'},
      {id: 'dataCell_5', type: "dynamic", cellData: '$gooditem_total', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'totalRow', fields: [
      {id: 'totalCell_1', cellData: 'รวมค่าสินค้า', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'totalCell_2', type: "dynamic", cellData: '$total', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'discountRow', fields: [
      {id: 'discountCell_1', cellData: 'ส่วนลด', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'discountCell_2', type: "dynamic", cellData: '$discount', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'vatRow', fields: [
      {id: 'vatCell_1', cellData: 'ภาษีมูลค่าเพิ่ม 7%', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'vatCell_2', type: "dynamic", cellData: '$vat', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'grandTotalRow', backgroundColor: '#ddd', fields: [
      {id: 'grandTotalCell_1', cellData: 'รวมทั้งหมด', fontweight: 'bold', fontalign: 'center', width: '78%'},
      {id: 'grandTotalCell_2', type: "dynamic", cellData: '$grandtotal', fontweight: 'bold', fontalign: 'right', width: '19%'}
    ]
  }
]

module.exports = {
  A4Width,
  A4Height,
  SlipWidth,
  SlipHeight,
  templateTypes,
  paperSizes,
  defaultTableData
}

},{}],4:[function(require,module,exports){
/* websocketmessage.js */
module.exports = function ( jq, wsm ) {
	const $ = jq;

  const onMessageShop = function (msgEvt) {
		let userdata = JSON.parse(localStorage.getItem('userdata'));
    let data = JSON.parse(msgEvt.data);
    console.log(data);
    if (data.type == 'test') {
      $.notify(data.message, "success");
		} else if (data.type == 'ping') {
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
    } else if (data.type === 'shop') {
			/*
      switch(data.shop) {
				//when somebody wants to call us
				case "orderupdate":
					if (data.msg) {
						$.notify(data.msg, "success");
					}
					onOrderUpdate(wsm, data.orderId, data.status, data.updataData);
				break;
			}
			*/

			switch(data.status) {
				case "New":
				console.log(data);
				if (data.msg) {
					$.notify(data.msg, "success");
				}
				onOrderUpdate(wsm, data.orderId, data.status, data.updataData);
				$('#NewOrderTab').click();
				break;
			}

    } else {
			console.log('Nothing Else');
		}
  };

  const onOrderUpdate = async function(wsm, orderId, status, changeOrder){
		console.log(changeOrder);
		
		let changelogs = JSON.parse(localStorage.getItem('changelogs'));
		if (!changelogs) {
			changelogs = [];
		}
		console.log(changelogs);

		localStorage.setItem('changelogs', JSON.stringify(changelogs));
		let newMsgCounts = undefined;
		await $('.order-box').each(async(i, orderBox)=>{
			let orderData = $(orderBox).data('orderData');
			if (orderData.orderId == orderId) {
				newMsgCounts = await changelogs.filter((item, j) =>{
					if (item.status === 'New') {
						return item;
					}
				});
			}
		});
		if ((newMsgCounts) && (newMsgCounts.length > 0)) {
			$('#NewOrderTab').click();
		}
  }

  return {
    onMessageShop
	}
}

},{}],5:[function(require,module,exports){
/* main.js */

window.$ = window.jQuery = require('jquery');

window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

const common = require('../../home/mod/common-lib.js')($);
const shopitem = require('./mod/shop-item-mng.js')($);

let wss = undefined;

$( document ).ready(function() {
  const initPage = function() {
    let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
  	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
  	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
  	let jqueryNotifyUrl = '../lib/notify.min.js';
    let printjs = '../lib/print/print.min.js';
    let jquerySimpleUploadUrl = '../lib/simpleUpload.min.js';
    let utilityPlugin = "../lib/plugin/jquery-radutil-plugin.js";
    let reportElementPlugin = "../lib/plugin/jquery-report-element-plugin.js";
    let controlPagePlugin = "../lib/plugin/jquery-controlpage-plugin.js"

    let momentWithLocalesPlugin = "../lib/moment-with-locales.min.js";
    let ionCalendarPlugin = "../lib/ion.calendar.min.js";
    let ionCalendarCssUrl = "../stylesheets/ion.calendar.css";
    let excelexportjs = '../lib/excel/excelexportjs.js';

    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  	//https://carlosbonetti.github.io/jquery-loading/
  	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  	//https://notifyjs.jpillora.com/
  	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');
    //https://printjs.crabbly.com/
    $('head').append('<script src="' + printjs + '"></script>');
    //https://www.jqueryscript.net/other/Export-Table-JSON-Data-To-Excel-jQuery-ExportToExcel.html#google_vignette

    $('head').append('<script src="' + excelexportjs + '"></script>');

    $('head').append('<script src="' + jquerySimpleUploadUrl + '"></script>');

    $('head').append('<script src="' + utilityPlugin + '"></script>');
    $('head').append('<script src="' + reportElementPlugin + '"></script>');
    $('head').append('<script src="' + controlPagePlugin + '"></script>');

    $('head').append('<script src="' + momentWithLocalesPlugin + '"></script>');
    $('head').append('<script src="' + ionCalendarPlugin + '"></script>');

    $('head').append('<link rel="stylesheet" href="../stylesheets/style.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../lib/print/print.min.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../../case/css/scanpart.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="' + ionCalendarCssUrl + '" type="text/css" />');

    $('body').append($('<div id="App"></div>'));
    $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

    $('body').loading({overlay: $("#overlay"), stoppable: true});

    let userdata = JSON.parse(localStorage.getItem('userdata'));
    console.log(userdata);
    if ((!userdata) || (userdata == null)) {
      common.doUserLogout();
    } else {
      if (userdata.usertypeId == 1) {
        doShowShopItems();
      } else {
        doShowShopMng(userdata.shopId);
      }
      wss = common.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.shopId, 'shop');
    }
	};

	initPage();

  // ปุ่ม ctrl+Z อาจจะมีปัญหาในการพิมพ์ได้
  $(window).on('keydown', async (evt)=>{
    if (evt.ctrlKey && evt.key === 'z') {
      let protocol = window.location.protocol;
      let domain = window.location.host;
      window.location.replace(protocol + '//' + domain + '/shop/mobile');
    }
  });

  document.addEventListener("loading-trigger", doTriggerLoading);
});

const doTriggerLoading = function(evt) {
  let triggerData = evt.detail;
  let action = triggerData.action;
  if (action === 'start') {
    $('body').loading('start');
  } else if (action === 'stop') {
    $('body').loading('stop');
  }
}


const doShowShopItems = async function(){
  //shopitem.doShowShopItem();
  let itemperpage = 20;
  let currentPage = 1;
  let userDefualtSetting = {itemperpage: itemperpage, currentPage: currentPage};
  localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));
  await shopitem.doShowShopItem(currentPage);
}

const doShowShopMng = async function(shopId) {
  let shopRes = await common.doCallApi('/api/shop/shop/select/' + shopId, {});
  if ((shopRes) && (shopRes.status.code == 210)) {
    common.doUserLogout();
  }
  let shopData = shopRes.Record;
  let editShopCallback = shopitem.doOpenEditShopForm;
  let uploadLogCallback = shopitem.doStartUploadPicture;
  shopitem.doOpenManageShop(shopData, uploadLogCallback, editShopCallback);
  if (common.shopSensitives.includes(shopId)) {
    let sensitiveWordJSON = require('../../../../api/shop/lib/sensitive-word.json');
    localStorage.setItem('sensitiveWordJSON', JSON.stringify(sensitiveWordJSON))
    sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
    common.delay(500).then(async ()=>{
      await common.doResetSensitiveWord(sensitiveWordJSON);
    });
  }
}

const doTestCreateInvoice = async function(){
  let docParams = {orderId: 199, shopId: 6};
  let docRes = await common.doCallApi('/api/shop/bill/create/report', docParams);
  console.log(docRes);

  window.open(docRes.result.link, '_blank');
  window.open(docRes.result.qrLink, '_blank');
  /*
  $('body').loading('start');
  let apiUrl = '/api/shop/bill/create/report';
  let docParams = {orderId: 210, shopId: 9};
  $.post(apiUrl, docParams, function(docRes){
    console.log(docRes);
    window.open(docRes.result.link, '_blank');
    window.open(docRes.result.pngLink, '_blank');
    window.open(docRes.result.qrLink, '_blank');
    if (docRes.result.ppLink) {
      window.open(docRes.result.ppLink, '_blank');
    }
    //let shareCode = orders[i].bill.Filename.split('.')[0];
    //window.open('/shop/share/?id=' + shareCode, '_blank');
    $('body').loading('stop');
  })
  */
}

module.exports = {
  doShowShopItems,
  doShowShopMng,
}

},{"../../../../api/shop/lib/sensitive-word.json":1,"../../home/mod/common-lib.js":2,"./mod/shop-item-mng.js":18,"jquery":23}],6:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

  const doCreateCalendar = function(calendarOptions){
    let calendareBox = $('<div id="CalendarBox"></div>');
    return $(calendareBox).ionCalendar(calendarOptions);
  }

  return {
    doCreateCalendar
	}
}

},{"../../../home/mod/common-lib.js":2}],7:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

  String.prototype.lpad = function(padString, length) {
      var str = this;
      while (str.length < length)
          str = padString + str;
      return str;
  }

  const doCreateFormDlg = function(shopData, orderTotal, orderObj, invoiceSuccessCallback, billSuccessCallback, taxinvoiceSuccessCallback) {
    return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let orderId = orderObj.id;
      let payAmountInput = undefined;
      let createTaxInvoiceCmd = undefined;

      const keyChangeValue = function(evt){
        let discountValue = $(discountInput).val();
        let vatValue = $(vatInput).val();
        let grandTotal = (Number(orderTotal) - Number(discountValue)) + Number(vatValue);
        $(granTotalCell).empty().append($('<span><b>' + common.doFormatNumber(grandTotal) + '</b></span>'));
        if ($(payAmountInput)) {
          $(payAmountInput).val(common.doFormatNumber(grandTotal));
        }
        if ((vatValue == '') || (vatValue == 0)) {
          if ($(createTaxInvoiceCmd)) {
            $(createTaxInvoiceCmd).hide();
          } else {
            $(createTaxInvoiceCmd).show();
          }
        }
      }

			const checkboxVatClick = function(evt) {
				let check = $(checkboxVat).prop('checked');
				if (check == true){
					let vatVal = (0.07*orderTotal).toFixed(2);
					$(vatInput).val(vatVal);
				} else {
					$(vatInput).val('0');
				}
				keyChangeValue(evt);
			}

      let wrapperBox = $('<div></div>');
      let closeOrderTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let dataRow = $('<tr class="first-step"></tr>').css({'height': '40px'});
      $(dataRow).append($('<td width="40%" align="left"><b>ยอดรวมค่าสินค้า</b></td>'));
      $(dataRow).append($('<td width="*" align="right"><b>' + common.doFormatNumber(orderTotal) + '</b></td>'));
      $(closeOrderTable).append($(dataRow));
      dataRow = $('<tr class="first-step"></tr>').css({'height': '40px'});
      $(dataRow).append($('<td align="left">ส่วนลด</td>'));
      let discountInputCell = $('<td align="right"></td>');
      let discountInput = $('<input type="number" value="0"/>').css({'width': '80px'});
      $(discountInput).on('keyup', keyChangeValue);
      $(discountInputCell).append($(discountInput));
      $(dataRow).append($(discountInputCell));
      $(closeOrderTable).append($(dataRow));

      let vatInput = $('<input type="number" value="0"/>').css({'width': '80px', 'margin-left': '4px'});
			let checkboxVat = $('<input type="checkbox"/>').css({'transform': 'scale(1.5)'});
      if (shopData.Shop_VatNo !== '') {
				$(checkboxVat).attr('checked', true);
				$(checkboxVat).on('click', checkboxVatClick);
        $(vatInput).on('keyup', keyChangeValue);
        dataRow = $('<tr class="first-step"></tr>').css({'height': '40px'});
        $(dataRow).append($('<td align="left">ภาษีมูลค่าเพิ่ม (7%)</td>'));
        //$(vatInput).val(common.doFormatNumber(0.07*orderTotal));
				let vatVal = (0.07*orderTotal).toFixed(2);
				$(vatInput).val(vatVal);
        $(dataRow).append($('<td align="right"></td>').append($(checkboxVat)).append($(vatInput)));
        $(closeOrderTable).append($(dataRow));
      } else {
				$(checkboxVat).attr('checked', false);
			}
      dataRow = $('<tr></tr>').css({'background-color': '#ddd', 'height': '40px'});
      $(dataRow).append($('<td width="55%" align="left"><b>รวมทั้งสิ้น</b></td>'));
      let discountValue = $(discountInput).val();
      let vatValue = $(vatInput).val();
      let grandTotal = (Number(orderTotal) - Number(discountValue)) + Number(vatValue);
      let granTotalCell = $('<td width="*" align="right"></td>');
      $(granTotalCell).empty().append($('<span><b>' + common.doFormatNumber(grandTotal) + '</b></span>'));
      $(dataRow).append(granTotalCell);
      $(closeOrderTable).append($(dataRow));

      let middleActionCmdRow = $('<tr></tr>').css({'height': '40px'});
      let commandCell = $('<td colspan="2" align="center" id="MiddleActionCmdCell"></td>');
      $(middleActionCmdRow).append($(commandCell));
      $(closeOrderTable).append($(middleActionCmdRow));

			/** add admin for edit order and re-create bill/tax-invoice **/
			if ((orderObj.Status == 1) || (userId == 1)) {
	      let createInvoiceCmd = common.doCreateTextCmd('พิมพ์ใบแจ้งหนี้', '#F5500E', 'white', '#5D6D7E', '#FF5733');
				$(createInvoiceCmd).attr('id', 'CreateInvoiceCmd');
				$(createInvoiceCmd).on('click', async(evt)=>{
					let shopId = shopData.id;
					let nextInvoiceNo = '000000001';
					let filename = shopId.toString().lpad("0", 5) + '-1-' + nextInvoiceNo + '.pdf';
					let discountValue = parseFloat($(discountInput).val());
					let vatValue = parseFloat($(vatInput).val());

					let lastinvoicenoRes = await common.doCallApi('/api/shop/invoice/find/last/invioceno/' + shopId, {});
					console.log(lastinvoicenoRes);
					if (lastinvoicenoRes.Records.length > 0) {
						let lastinvoiceno = lastinvoicenoRes.Records[0].No;
						let nextNo = Number(lastinvoiceno);
						nextNo = nextNo + 1;
						nextInvoiceNo = nextNo.toString().lpad("0", 9);
						filename = shopId.toString().lpad("0", 5) + '-1-' + nextInvoiceNo + '.pdf';
						let invoiceData = {No: nextInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
						invoiceSuccessCallback(invoiceData);
					} else {
						let invoiceData = {No: nextInvoiceNo, Discount: discountValue, Vat:vatValue, Filename: filename};
						invoiceSuccessCallback(invoiceData);
					}
				});
				$(commandCell).append($(createInvoiceCmd));
			}
			if ((orderObj.Status == 1) || (orderObj.Status == 2) || (userId == 1)) {
	      let closeOrderCmd = common.doCreateTextCmd('เก็บเงิน', 'green', 'white');
	      $(closeOrderCmd).css({'margin-left': '10px'});
	      $(closeOrderCmd).on('click', async(evt)=>{
					$('.first-step').hide();
	        let paytypeRes = await common.doCallApi('/api/shop/paytype/options', {});
	        $(middleActionCmdRow).remove();
	        let paytypeSelect = $('<select></select>');
	        paytypeRes.Options.forEach((item, i) => {
	          $(paytypeSelect).append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
	        });
					let discountValue = $(discountInput).val();
					let vatValue = $(vatInput).val();
					let grandTotal = (Number(orderTotal) - Number(discountValue)) + Number(vatValue);
	        payAmountInput = $('<input type="number" value="0"/>').css({'width': '120px'});
	        $(payAmountInput).val(grandTotal);
	        dataRow = $('<tr></tr>').css({'height': '40px'});
	        $(dataRow).append($('<td align="left">วิธีชำระ</td>'));
	        $(dataRow).append($('<td align="right"></td>').append($(paytypeSelect)));
	        $(closeOrderTable).append($(dataRow));
	        dataRow = $('<tr></tr>').css({'height': '40px'});
	        $(dataRow).append($('<td align="left">จำนวนที่ชำระ</td>'));
	        $(dataRow).append($('<td align="right"></td>').append($(payAmountInput)));
	        $(closeOrderTable).append($(dataRow));

					let addRemarkCmdRow = $('<tr></tr>').css({'height': '40px'});
	        let addRemarkCmdCell = $('<td align="left"></td>');
	        $(addRemarkCmdRow).append($(addRemarkCmdCell)).append($('<td align="left"></td>'));
	        $(closeOrderTable).append($(addRemarkCmdRow));

					let addRemarkCmd = common.doCreateTextCmd('เพิ่มบันทึกการปิดบิล', 'gray', 'white');
					$(addRemarkCmd).css({'width' : '100%'});
					$(addRemarkCmd).on('click', (evt)=>{
						let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
						if (hasHiddenRemarkBox) {
							$(remarkBox).slideDown('slow');
							$(addRemarkCmd).text('ซ่อนบันทึก');
						} else {
							$(remarkBox).slideUp('slow');
							$(addRemarkCmd).text('เพิ่มบันทึกการปิดบิล');
						}
					});
					$(addRemarkCmdCell).append($(addRemarkCmd));

					let remarkBoxRow = $('<tr></tr>').css({'height': '80px'});
	        let remarkBoxCell = $('<td colspan="2" align="left"></td>');
					let remarkBox = $('<textarea id="Remark" cols="44" rows="5"></textarea>').css({'display': 'none'});
					$(remarkBoxCell).append($(remarkBox));
	        $(remarkBoxRow).append($(remarkBoxCell));
	        $(closeOrderTable).append($(remarkBoxRow));

	        let finalActionCmdRow = $('<tr></tr>').css({'height': '60px', 'vertical-align': 'bottom'});
	        let finalCommandCell = $('<td colspan="2" align="center"></td>');
	        $(finalActionCmdRow).append($(finalCommandCell));
	        $(closeOrderTable).append($(finalActionCmdRow));

					let checkVat = $(checkboxVat).prop('checked');

					if (checkVat == false) {
						let createBillCmd = common.doCreateTextCmd('พิมพ์ใบเสร็จ', 'green', 'white');
		        $(finalCommandCell).append($(createBillCmd));
	        	$(createBillCmd).on('click', async(evt)=>{
		          let shopId = shopData.id;
		          let nextBillNo = '000000001';
							let filename = shopId.toString().lpad("0", 5) + '-2-' + nextBillNo + '.pdf';
							let discountValue = parseFloat($(discountInput).val());
							let vatValue = parseFloat($(vatInput).val());

							let payAmountValue = parseFloat($(payAmountInput).val());
							let payType = parseInt($(paytypeSelect).val());
							let paymentData = {Amount: payAmountValue, PayType: payType};
							let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
		          let lastbillnoRes = await common.doCallApi('/api/shop/bill/find/last/billno/' + shopId, {});
							console.log(lastbillnoRes);
		          if (lastbillnoRes.Records.length > 0) {
		            let lastbillno = lastbillnoRes.Records[0].No;
		            let nextNo = Number(lastbillno);
		            nextNo = nextNo + 1;
		            nextBillNo = nextNo.toString().lpad("0", 9);
		            filename = shopId.toString().lpad("0", 5) + '-2-' + nextBillNo + '.pdf';
		            let billData = {No: nextBillNo, Discount: discountValue, Vat:vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									billData.Remark = $(remarkBox).val();
								}
								billSuccessCallback(billData, paymentData);
		          } else {
								let billData = {No: nextBillNo, Discount: discountValue, Vat:vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									billData.Remark = $(remarkBox).val();
								}
								billSuccessCallback(billData, paymentData);
							}
		        });
					}

	        if ((shopData.Shop_VatNo !== '') && (checkVat == true)) {
	          let createTaxInvoiceCmd = common.doCreateTextCmd('พิมพ์ใบกำกับภาษี', 'green', 'white');
	          $(createTaxInvoiceCmd).css({'margin-left': '10px'});
	          $(finalCommandCell).append($(createTaxInvoiceCmd));
	          $(createTaxInvoiceCmd).on('click', async (evt)=>{
							let shopId = shopData.id;
		          let nextTaxInvoiceNo = '000000001';
							let filename = shopId.toString().lpad("0", 5) + '-3-' + nextTaxInvoiceNo + '.pdf';
							let discountValue = parseFloat($(discountInput).val());
							let vatValue = parseFloat($(vatInput).val());

							let payAmountValue = parseFloat($(payAmountInput).val());
							let payType = parseInt($(paytypeSelect).val());
							let paymentData = {Amount: payAmountValue, PayType: payType};
							let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
		          let lasttaxinvoicenoRes = await common.doCallApi('/api/shop/taxinvoice/find/last/taxinvioceno/' + shopId, {});
							console.log(lasttaxinvoicenoRes);
		          if (lasttaxinvoicenoRes.Records.length > 0) {
		            let lasttaxinvoiceno = lasttaxinvoicenoRes.Records[0].No;
		            let nextNo = Number(lasttaxinvoiceno);
		            nextNo = nextNo + 1;
		            nextTaxInvoiceNo = nextNo.toString().lpad("0", 9);
		            filename = shopId.toString().lpad("0", 5) + '-3-' + nextTaxInvoiceNo + '.pdf';
		            let taxinvoicenoData = {No: nextTaxInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									taxinvoicenoData.Remark = $(remarkBox).val();
								}
								taxinvoiceSuccessCallback(taxinvoicenoData, paymentData);
		          } else {
								let taxinvoicenoData = {No: nextTaxInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									taxinvoicenoData.Remark = $(remarkBox).val();
								}
								taxinvoiceSuccessCallback(taxinvoicenoData, paymentData);
							}
	          });
	        }
	      });
				$(commandCell).append($(closeOrderCmd));
			}

      $(wrapperBox).append($(closeOrderTable))
      resolve($(wrapperBox));
    });
  }

	const doOpenReportPdfDlg = function(pdf, title, closeCallback){
    return new Promise(async function(resolve, reject) {
			const pdfURL = pdf.link + '?t=' + common.genUniqueID();
      const reportPdfDlgContent = $('<object data="' + pdfURL + '" type="application/pdf" width="99%" height="380"></object>');
      $(reportPdfDlgContent).css({'margin-top': '10px'});
			let radAlertMsg = $('<div></div>');
			$(radAlertMsg).append($(reportPdfDlgContent));
			let ectAccessBox = undefined;
			let newAcc = {};
			if (!pdf.pngLink) {
				let tpms = pdf.link.split('/');
				let names = tpms[tpms.length-1].split('.');
				newAcc.pngLink = '/shop/img/usr/pdf/' + names[0] + '.png';
				//newAcc.ppLink =
				//newAcc.qrLink = '/shop/img/usr/qrcode/' + names[0] + '.png';
			}
			if (pdf.pngLink) {
				ectAccessBox = $('<div></div>');
				let pngThumb = $('<img/>').attr('src', pdf.pngLink).css({'width': '60px', 'height': 'auto', 'display': 'inline-block', 'cursor': 'pointer'});
				$(ectAccessBox).append($(pngThumb))
				$(pngThumb).on('click', (evt)=>{
					window.open(pdf.pngLink, '_blank');
				});
			} else {
				let tpms = pdf.link.split('/');
				let names = tpms[tpms.length-1].split('.');
				let newAccPngLink = '/shop/img/usr/pdf/' + names[0] + '.png';
				ectAccessBox = $('<div></div>');
				let pngThumb = $('<img/>').attr('src', newAccPngLink).css({'width': '60px', 'height': 'auto', 'display': 'inline-block', 'cursor': 'pointer'});
				$(ectAccessBox).append($(pngThumb))
				$(pngThumb).on('click', (evt)=>{
					window.open(newAccPngLink, '_blank');
				});
			}
			if (pdf.ppLink) {
				if (!ectAccessBox) {
					ectAccessBox = $('<div></div>');
				}
				let ppThumb = $('<img/>').attr('src', pdf.ppLink).css({'width': '60px', 'height': 'auto', 'display': 'inline-block', 'cursor': 'pointer', 'margin-left': '20px'});
				$(ectAccessBox).append($(ppThumb))
				$(ppThumb).on('click', (evt)=>{
					window.open(pdf.ppLink, '_blank');
				});
			}
			if (pdf.qrLink) {
				if (!ectAccessBox) {
					ectAccessBox = $('<div></div>');
				}
				let qrThumb = $('<img/>').attr('src', pdf.qrLink).css({'width': '60px', 'height': 'auto', 'display': 'inline-block', 'cursor': 'pointer', 'margin-left': '20px'});
				$(ectAccessBox).append($(qrThumb))
				$(qrThumb).on('click', (evt)=>{
					window.open(pdf.qrLink, '_blank');
				});
			}
			if (ectAccessBox) {
				$(ectAccessBox).css({'display': 'none', 'cursor': 'pointer', 'border': '2px solid grey', 'background-color': '#ddd', 'width': '100%'});
				let tggAccessCmd = $('<div>รูปภาพ</div>').css({'display': 'block', 'cursor': 'pointer', 'border': '2px solid black', 'background-color': 'grey', 'width': '100%', 'text-align': 'center', 'line-height': '36px'});
				$(tggAccessCmd).on('click', (evt)=>{
					$(ectAccessBox).slideDown('slow');
					$(tggAccessCmd).hide();
				})
				$(ectAccessBox).on('click', (evt)=>{
					$(ectAccessBox).slideUp('slow');
					$(tggAccessCmd).show();
				})
				$(radAlertMsg).append($(tggAccessCmd)).append($(ectAccessBox));
			}
      const reportformoption = {
  			title: title,
  			msg: $(radAlertMsg),
  			width: '720px',
				okLabel: ' เปิดหน้าต่างใหม่ ',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
					window.open(pdf.link, '_blank');
          reportPdfDlgHandle.closeAlert();
					if (closeCallback) {
						closeCallback();
					}
  			},
  			onCancel: function(evt){
  				reportPdfDlgHandle.closeAlert();
					if (closeCallback) {
						closeCallback();
					}
  			}
  		}
  		let reportPdfDlgHandle = $('body').radalert(reportformoption);
      resolve(reportPdfDlgHandle)
    });
  }

	const doShowBillRemarkBox = function(evt) {
		let masterCmd = $(evt.currentTarget);
		let masterCell = $(masterCmd).parent();
		$(masterCmd).hide();

		let remarkBox = $('<div></div>').css({'display': 'block', 'height': '100px', 'border': '1px solid red'});
		let hiddenBoxCmd = common.doCreateTextCmd('ซ่อน', 'gray', 'white');
		$(hiddenBoxCmd).on('click', (evt)=>{
			$(remarkBox).slideUp('fast')/*.css({'display': 'none'})*/;
			$(remarkBox).remove();
			$(masterCmd).show();
		});

		$(remarkBox).append($(hiddenBoxCmd));
		$(masterCell).append($(remarkBox));
		$(remarkBox)/*.css({'display': 'block'})*/.slideDown('slow');
	}

  return {
    doCreateFormDlg,
		doOpenReportPdfDlg
	}
}

},{"../../../home/mod/common-lib.js":2}],8:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);

  const doCreateFormDlg = function(shopData, successCallback) {
    return new Promise(async function(resolve, reject) {
      let customers = JSON.parse(localStorage.getItem('customers'));

      let wrapperBox = $('<div></div>');
      let searchInputBox = $('<div></div>').css({'width': '100%', 'padding': '4px'});
      let customerListBox = $('<div></div>').css({'width': '100%', 'padding': '4px', 'min-height': '200px'});
      let searchKeyInput = $('<input type="text" size="40" value="*"/>');
      let customerResult = undefined;
      $(searchKeyInput).css({'background': 'url(../../images/search-icon.png) no-repeat right center', 'background-size': '6% 100%', 'padding-right': '3px'});
      $(searchKeyInput).on('keyup', async (evt)=>{
        let key = $(searchKeyInput).val();
        if (key !== ''){
          if (key === '*') {
            customerResult = await doShowList(customers, successCallback);
          } else {
            let customerFilter = await doFilterCustomer(customers, key);
            customerResult = await doShowList(customerFilter, successCallback);
          }
          $(customerListBox).empty().append($(customerResult));
        }
      });
      let addCustomerCmd = $('<input type="button" value=" เพิ่มลูกค้า " class="action-btn"/>').css({'margin-left': '10px'});
      $(addCustomerCmd).on('click', (evt)=>{
        //$(wrapperBox).empty();
        $(searchInputBox).hide();
        $(customerListBox).hide();
        let newCustomerForm = doShowAddCustomerForm(shopData, async(newCustomers)=>{
          //customers = newCustomers;
          $(newCustomerForm).remove();
          $(searchInputBox).show();
          $(customerListBox).show();
					customers = JSON.parse(localStorage.getItem('customers'));
          customerResult = await doShowList(customers, successCallback);
          $(customerListBox).empty().append($(customerResult));
        }, ()=>{
					$(newCustomerForm).remove();
          $(searchInputBox).show();
          $(customerListBox).show();
				});
        $(wrapperBox).append($(newCustomerForm))
      });
      $(searchInputBox).append($(searchKeyInput)).append($(addCustomerCmd));
      customerResult = await doShowList(customers, successCallback);
      $(customerListBox).empty().append($(customerResult));
      $(wrapperBox).append($(searchInputBox)).append($(customerListBox));
      resolve($(wrapperBox));
    });
  }

  const doFilterCustomer = function(customers, key){
    return new Promise(async function(resolve, reject) {
      let result = customers.filter((item)=>{
        let n = item.Name.search(key);
        if (n >= 0) {
          return item;
        }
      });
      resolve(result);
    });
  }

  const doShowList = function(results, successCallback){
    return new Promise(async function(resolve, reject) {
      let customerTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let	promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < results.length; i++){
          let resultRow = $('<tr></tr>').css({'cursor': 'pointer', 'padding': '4px'});
          $(resultRow).hover(()=>{
            $(resultRow).css({'background-color': 'grey', 'color': 'white'});
          },()=>{
            $(resultRow).css({'background-color': '#ddd', 'color': 'black'});
          });
          $(resultRow).on('click', (evt)=>{
            successCallback(results[i]);
          });
          let nameCell = $('<td width="25%" align="left">' + results[i].Name + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          let addressCell = $('<td width="45%" align="left">' + results[i].Address + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          let telCell = $('<td width="*" align="left">' + results[i].Tel + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          $(resultRow).append($(nameCell)).append($(addressCell)).append($(telCell));
          $(customerTable).append($(resultRow));
        }
        setTimeout(()=>{
          resolve2($(customerTable));
        }, 100);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  const doShowAddCustomerForm = function(shopData, successCallback, cancelCallback){
    let form = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let formRow = $('<tr></tr>');
    let nameCell = $('<td width="22%" align="left"></td>');
    let addressCell = $('<td width="22%" align="left"></td>');
    let telCell = $('<td width="20%" align="left"></td>');
    let commandCell = $('<td width="*" align="center"></td>');
    let nameInput = $('<input type="text" placeholder="ชื่อ"/>').css({'width': '65px'});
    let addressInput = $('<input type="text" placeholder="ที่อยู่"/>').css({'width': '80px'});
    let telInput = $('<input type="text" placeholder="เบอร์โทร"/>').css({'width': '80px'});
    let saveCmd = $('<input type="button" value="บันทึก" class="action-btn"/>');
    $(saveCmd).on('click', async (evt)=>{
      let nameValue = $(nameInput).val();
      let addressValue = $(addressInput).val();
      let telValue = $(telInput).val();
      if (nameValue !== '') {
        $(nameInput).css({'border': ''});
        let newCustomerData = {Name: nameValue, Address: addressValue, Tel: telValue};
        let params = {data: newCustomerData, shopId: shopData.id};
        let customerRes = await common.doCallApi('/api/shop/customer/add', params);
        if (customerRes.status.code == 200) {
          $.notify("เพิ่มรายการลูกค้าสำเร็จ", "success");
					let newCustomer = customerRes.Record;
					let customers = customerRes.Records;
          localStorage.setItem('customers', JSON.stringify(customers));
          successCallback(newCustomer);
        } else if (customerRes.status.code == 201) {
          $.notify("ไม่สามารถเพิ่มรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
        } else {
          $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการลูกค้าได้", "error");
        }
      } else {
        $(nameInput).css({'border': '1px solid red'});
      }
    });
		let cancelCmd = $('<input type="button" value="ยกเลิก" style="margin-left: 2px;"/>');
    $(cancelCmd).on('click', (evt)=>{
			cancelCallback();
		});
    $(nameCell).append($(nameInput)).append($('<span>*</span>').css({'margin-left': '5px', 'color': 'red'}));
    $(addressCell).append($(addressInput));
    $(telCell).append($(telInput));
    $(commandCell).append($(saveCmd)).append($(cancelCmd));
    $(formRow).append($(nameCell)).append($(addressCell)).append($(telCell)).append($(commandCell));
    return $(form).append($(formRow));
  }

  return {
    doCreateFormDlg
	}
}

},{"../../../home/mod/common-lib.js":2}],9:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);
	const order = require('./order-mng.js')($);
	const calendardlg = require('./calendar-dlg.js')($);
	const history = require('./order-history.js')($);

  const customerTableFields = [
		{fieldName: 'Name', displayName: 'ชื่อ', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'Address', displayName: 'ที่อยู่', width: '25%', align: 'left', inputSize: '30', verify: false, showHeader: true},
    {fieldName: 'Tel', displayName: 'โทรศัพท์', width: '15%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'Mail', displayName: 'อีเมล์', width: '15%', align: 'left', inputSize: '30', verify: false, showHeader: true},
	];

	const doLoadCustomerItem = function(shopId){
    return new Promise(async function(resolve, reject) {
			let customerRes = await common.doCallApi('/api/shop/customer/list/by/shop/' + shopId, {});
			localStorage.setItem('customers', JSON.stringify(customerRes.Records));
			resolve(customerRes.Records);
		});
	}

	const doFilterCustomer = function(customers, key) {
		return new Promise(async function(resolve, reject) {
			let result = customers.filter((item)=>{
        let n = item.Name.search(key);
        if (n >= 0) {
          return item;
        }
      });
      resolve(result);
		});
	}

	const doCreateCalendarCmd = function(cmdTitle, successCallback){
		let orderDateBox = $('<div></div>').text(cmdTitle).css({'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '16px'});
		$(orderDateBox).on('click', (evt)=>{
			common.calendarOptions.onClick = async function(date){
				calendarHandle.closeAlert();
				successCallback(date);
				selectDate = common.doFormatDateStr(new Date(date));
			}
			let calendarHandle = order.doShowCalendarDlg(common.calendarOptions);
		});
		return $(orderDateBox);
	}

	const doCreateCustomerListTable = function(shopData, workAreaBox, customerItems, newCustomerCmdBox, pOptions){
		let customerTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let headerRow = $('<tr></tr>');
		$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
		for (let i=0; i < customerTableFields.length; i++) {
			if (customerTableFields[i].showHeader) {
				$(headerRow).append($('<td width="' + customerTableFields[i].width + '" align="center"><b>' + customerTableFields[i].displayName + '</b></td>'));
			}
		}
		$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
		$(customerTable).append($(headerRow));

		let from = 0;
		let to = customerItems.length;
		if (pOptions) {
			from = pOptions.from;
			to = pOptions.to + 1;
		}
		for (let x=from; x < to; x++) {
			let itemRow = $('<tr class="customer-row"></tr>');
			$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
			let item = customerItems[x];
			for (let i=0; i < customerTableFields.length; i++) {
				if (customerTableFields[i].showHeader) {
					let field = $('<td align="' + customerTableFields[i].align + '"></td>');
					$(field).text(item[customerTableFields[i].fieldName]);
					$(itemRow).append($(field));
				}
			}

			let commandCell = $('<td align="center"></td>');

			let editCustomerCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
			$(editCustomerCmd).on('click', (evt)=>{
				doOpenEditCustomerForm(shopData, workAreaBox, item);
			});

			let orderCustomerCmd = $('<input type="button" value=" Order " class="action-btn"/>').css({'margin-left': '8px'});
			$(orderCustomerCmd).on('click', async (evt)=>{
				let params = {};
				let orderRes = await common.doCallApi('/api/shop/order/list/by/customer/' + item.id, params);
				localStorage.setItem('customerorders', JSON.stringify(orderRes.Records));
				console.log(JSON.parse(localStorage.getItem('customerorders')));

				$(editCustomerCmd).hide();
				$(orderCustomerCmd).hide();
				$(deleteCustomerCmd).hide();
				$(newCustomerCmdBox).hide();
				$('.customer-row').hide();
				$(itemRow).css({'background-color': 'gray', 'color': 'white'});
				let fromDateCmd = doCreateCalendarCmd('ตั้งแต่วันที่', async (date)=>{
					let selectDate = common.doFormatDateStr(new Date(date));
					$(fromDateCmd).text(selectDate);
					$('#HistoryTable').remove();
					$('#NavigBar').remove();
					let orderHostoryTable = await history.doCreateOrderHistoryTable(workAreaBox, 0, 0, selectDate);
				});
				let backCustomerCmd = $('<input type="button" value=" Back " class="action-btn"/>').css({'margin-left': '8px'});
				$(backCustomerCmd).on('click', (evt)=>{
					$(backCustomerCmd).remove();
					$(fromDateCmd).remove();
					$(editCustomerCmd).show();
					$(orderCustomerCmd).show();
					$(deleteCustomerCmd).show();
					$(newCustomerCmdBox).show();
					$('.customer-row').show();
					$(itemRow).css({'background-color': '', 'color': ''});
					localStorage.removeItem('customerorders');
					$('#HistoryTable').remove();
					$('#NavigBar').remove();
				});
				$(commandCell).append($(fromDateCmd)).append($(backCustomerCmd));
				$(itemRow).show();

				$('#HistoryTable').remove();
				$('#NavigBar').remove();
				if (orderRes.Records.length > 0) {
					let orderHostoryTable = await history.doCreateOrderHistoryTable(workAreaBox, 0, 0);
				} else {
					let notFoundBox = $('<div id="HistoryTable"></div>').css({'position': 'relative', 'width': '100%', 'margin-top': '25px'});
					$(notFoundBox).text('ไม่พบรายการออร์เดอร์');
					$(workAreaBox).append($(notFoundBox));
				}
			});

			let deleteCustomerCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
			$(deleteCustomerCmd).on('click', (evt)=>{
				doDeleteCustomer(shopData, workAreaBox, item.id);
			});

			$(commandCell).append($(editCustomerCmd));
			$(commandCell).append($(orderCustomerCmd));
			$(commandCell).append($(deleteCustomerCmd));
			$(itemRow).append($(commandCell));
			$(customerTable).append($(itemRow));
		}
		return $(customerTable);
	}

  const doShowCustomerItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
			let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
			let itemPerPage = userDefualtSetting.itemperpage;
			//let itemPerPage = 50;

      $(workAreaBox).empty();
			let customerItems = await doLoadCustomerItem(shopData.id);

			let customerTable = undefined;

      let titlePageBox = $('<div style="padding: 4px;">รายการลูกค้าของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			$(workAreaBox).append($(titlePageBox));
			let newCustomerCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let searchKeyInput = $('<input type="text" size="40" value="*"/>');
			$(searchKeyInput).css({'background': 'url(../../images/search-icon.png) no-repeat right center', 'background-size': '6% 100%', 'padding-right': '3px'});
			$(searchKeyInput).on('keyup', async (evt)=>{
				if (customerTable) {
					$(customerTable).remove();
				}
				let key = $(searchKeyInput).val();
				if (key !== ''){
					$('#NavigBar').remove();
					if (key === '*') {
						//customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox);
						doControlItemDisplayPage();
					} else {
						let customers = JSON.parse(localStorage.getItem('customers'));
						let customerFilter = await doFilterCustomer(customers, key);
						customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerFilter, newCustomerCmdBox);
					}
					$(workAreaBox).append($(customerTable));
				}
			});

			let newCustomerCmd = $('<input type="button" value=" + New Customer " class="action-btn"/>');
			$(newCustomerCmd).on('click', (evt)=>{
				doOpenNewCustomerForm(shopData, workAreaBox);
			});
			$(newCustomerCmdBox).append($(searchKeyInput)).append($(newCustomerCmd).css({'margin-left': '10px'}));

			$(workAreaBox).append($(newCustomerCmdBox));

			const doControlItemDisplayPage = function() {
				console.log(customerItems.length <= itemPerPage);
				if (customerItems.length <= itemPerPage) {
					customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox);
		      $(workAreaBox).append($(customerTable));
				} else {
					let pOp = {from: 0, to: (itemPerPage-1)};
					customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox, pOp);
		      $(workAreaBox).append($(customerTable));
					let defaultNavPage = {
						currentPage: 1,
						itemperPage: itemPerPage,
						totalItem: customerItems.length,
						styleClass : {'padding': '4px', 'margin-top': '60px'},
					}
					defaultNavPage.changeToPageCallback = function(page) {
						$(customerTable).remove();
						itemPerPage = page.perPage;
						let newFrom = (itemPerPage * (page.toPage - 1));
						let newTo = (newFrom + itemPerPage) - 1;
						if (newTo > customerItems.length) {
							newTo = customerItems.length - 1;
						}
						pOp = {from: newFrom, to: newTo};
						customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox, pOp);
						$(customerTable).insertBefore($(navigBarBox));
						/*
						let userDefualtSetting = {itemperpage:page.perPage, currentPage: defaultNavPage.currentPage};
						localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));
						*/
					}

					let navigBarBox = $('<div id="NavigBar"></div>');
					let navigatoePage = $(navigBarBox).controlpage(defaultNavPage);
					setTimeout(()=>{
						$(workAreaBox).append($(navigBarBox));
						navigatoePage.toPage(1);
					}, 200);
				}
			}

			doControlItemDisplayPage();
			resolve();
    });
  }

  const doCreateNewCustomerForm = function(customerData){
    let customerFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < customerTableFields.length; i++) {
			let fieldRow = $('<tr></tr>');
			let labelField = $('<td width="40%" align="left">' + customerTableFields[i].displayName + (customerTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
			let inputValue = $('<input type="text" id="' + customerTableFields[i].fieldName + '" size="' + customerTableFields[i].inputSize + '"/>');
			if ((customerData) && (customerData[customerTableFields[i].fieldName])) {
				$(inputValue).val(customerData[customerTableFields[i].fieldName]);
			}
			$(inputField).append($(inputValue));
			$(fieldRow).append($(labelField));
			$(fieldRow).append($(inputField));
			$(customerFormTable).append($(fieldRow));
		}
		return $(customerFormTable);
  }

  const doVerifyCustomerForm = function(){
    let isVerify = true;
		let customerDataForm = {};
		for (let i=0; i < customerTableFields.length; i++) {
			let curValue = $('#'+customerTableFields[i].fieldName).val();
			if (customerTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+customerTableFields[i].fieldName).css({'border': ''});
					customerDataForm[customerTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+customerTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					customerDataForm[customerTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		return customerDataForm;
  }

  const doOpenNewCustomerForm = function(shopData, workAreaBox) {
    let newCustomerForm = doCreateNewCustomerForm();
    let radNewCustomerFormBox = $('<div></div>');
    $(radNewCustomerFormBox).append($(newCustomerForm));
    const newcustomerformoption = {
      title: 'เพิ่มลูกค้าใหม่เข้าร้าน',
      msg: $(radNewCustomerFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newCustomerFormObj = doVerifyCustomerForm();
        if (newCustomerFormObj) {
          let hasValue = newCustomerFormObj.hasOwnProperty('Name');
          if (hasValue){
            newCustomerFormBox.closeAlert();
						let params = {data: newCustomerFormObj, shopId: shopData.id};
            let userRes = await common.doCallApi('/api/shop/customer/add', params);
            if (userRes.status.code == 200) {
              $.notify("เพิ่มรายการลูกค้าสำเร็จ", "success");
              await doShowCustomerItem(shopData, workAreaBox)
            } else if (userRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการลูกค้าได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newCustomerFormBox.closeAlert();
      }
    }
    let newCustomerFormBox = $('body').radalert(newcustomerformoption);
  }

  const doOpenEditCustomerForm = function(shopData, workAreaBox, customerData){
		let editCustomerForm = doCreateNewCustomerForm(customerData);
		let radEditCustomerFormBox = $('<div></div>');
		$(radEditCustomerFormBox).append($(editCustomerForm));
		const editcustomerformoption = {
			title: 'แก้ไขลูกค้าของร้าน',
			msg: $(radEditCustomerFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editCustomerFormObj = doVerifyCustomerForm();
				if (editCustomerFormObj) {
					let hasValue = editCustomerFormObj.hasOwnProperty('Name');
					if (hasValue){
						editCustomerFormBox.closeAlert();
						let params = {data: editCustomerFormObj, id: customerData.id};
						let userRes = await common.doCallApi('/api/shop/customer/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการลูกค้าสำเร็จ", "success");
							await doShowCustomerItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการลูกค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editCustomerFormBox.closeAlert();
			}
		}
		let editCustomerFormBox = $('body').radalert(editcustomerformoption);
	}

  const doDeleteCustomer = function(shopData, workAreaBox, customerId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบลูกค้ารายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบลูกค้า</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบลูกค้า',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let customerRes = await common.doCallApi('/api/shop/customer/delete', {id: customerId});
				if (customerRes.status.code == 200) {
					$.notify("ลบรายการลูกค้าสำเร็จ", "success");
					await doShowCustomerItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการลูกค้าได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowCustomerItem
  }
}

},{"../../../home/mod/common-lib.js":2,"./calendar-dlg.js":6,"./order-history.js":15,"./order-mng.js":17}],10:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	const constant = require('../../../home/mod/constant-lib.js');

	const resetActive = function(element) {
    $(".reportElement").each((index, elem)=>{
      $(elem).removeClass("elementActive");
    })
    $(element).addClass("elementActive");
		//$(element).focus();
		$(element).on('keyup', (e)=> {
			if (e.keyCode == 46){
				removeActiveElement();
			}
		});

    $("#remove-item-cmd").prop('disabled', false);
		let tableElement = $('.tableElement');
		let tableCount = $(tableElement).length;
		if(tableCount >= 1) {
			$('#selectable').find('#table-element-cmd').remove();
		}
		let isTableElement = $(element).hasClass('tableElement');
		let newTrRowCmd = $('<li class="ui-widget-content" id="tr-element-cmd"><img src="/images/list-item-icom.png" class="icon-element"/><span class="text-element">แถวรายการ</span></li>')
		if (isTableElement) {
			if ($('#tr-element-cmd').length == 0) {
				$(newTrRowCmd).data({type: "tr"});
				$('#selectable').append($(newTrRowCmd));
				$('#selectable').find('#td-element-cmd').remove();
				$(newTrRowCmd).on('click', (evt)=>{
					let reportcontainerBox = $("#report-container");
					doCreateElement(tableElement, 'tr');
				});
			}
		} else {
			$('#selectable').find('#tr-element-cmd').remove();
			$('#selectable').find('#td-element-cmd').remove();
		}
		let isTrElement = $(element).hasClass('trElement');
		let newTdColCmd = $('<li class="ui-widget-content" id="td-element-cmd"><img src="/images/list-item-icom.png" class="icon-element"/><span class="text-element">ช่องข้อมูล</span></li>')
		if (isTrElement) {
			if ($('#td-element-cmd').length == 0) {
				$(newTdColCmd).data({type: "td"});
				$('#selectable').append($(newTdColCmd));
				$('#selectable').find('#tr-element-cmd').remove();

				$(newTdColCmd).on('click', (evt)=>{
					let activeRow = $(tableElement).find('.elementActive');
					doCreateElement(activeRow, 'td');
				});
			}
		} else {
			$('#selectable').find('.tdElement').remove();
		}
  }

	const resetPropForm = function(target, data){
    let propform = createElementPropertyForm(target, data);
    $("#report-property").empty();
    $("#report-property").append($(propform));
  }

	const removeActiveElement = function(){
		$(".reportElement").each((index, elem)=>{
			let isActive = $(elem).hasClass("elementActive");
			if (isActive) {
				$(elem).remove();
				$("#remove-item-cmd").prop('disabled', true);
				$("#report-property").empty();
			}
			let tableCount = $('.tableElement').length;
			if(tableCount == 0) {
				let tableElementCmdCount = $('#table-element-cmd').length;
				if(tableElementCmdCount == 0){
					let addTableElementCmd = $('<li class="ui-widget-content" id="table-element-cmd"><img src="/images/item-list-icon.png" class="icon-element"/><span class="text-element">ตารางออร์เดอร์</span></li>')
					$("#selectable").append($(addTableElementCmd));
					$('#tr-element-cmd').remove();
					$('#td-element-cmd').remove();
					$(addTableElementCmd).on('click', (evt)=>{
						let reportcontainerBox = $("#report-container");
						doCreateElement(reportcontainerBox, 'table');
					});
				}
			}
		});
	}

  const elementSelect = function(event, data){
		if ((event) && (event.target)) {
			event.stopPropagation();
    	resetActive(event.target);
    	let prop = data.options;
    	resetPropForm(event.target, prop);
		}
  }
  const elementDrop = function(event, data){
		if ((data) && (data.options)) {
    	let prop = data.options;
    	resetPropForm(event.target, prop);
		}
  }
  const elementResizeStop = function(event, data){
		if ((data) && (data.options)) {
	    let prop = data.options;
	    resetPropForm(event.target, prop);
		}
  }

	const doCreateElement = function(wrapper, elemType, prop){
		//doFindMaxYWrapper(wrapper);
    let defHeight = 50;
    switch (elemType) {
      case "text":
        var textTypeLength = $(".textElement").length;
        var oProp;
        if (prop) {
          oProp = {
            x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id, type: prop.type, title: prop.title,
            fontsize: prop.fontsize,
            fontweight: prop.fontweight,
            fontstyle: prop.fontstyle,
            fontalign: prop.fontalign
          };
        } else {
          defHeight = 50;
          oProp = {x:0, y: (defHeight * textTypeLength),
            width: '150', height: defHeight,
            id: 'text-element-' + (textTypeLength + 1),
            title: 'Text Element ' + (textTypeLength + 1)
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var textbox = $( "<div></div>" );
        $(textbox).textelement( oProp );
        $(wrapper).append($(textbox));
				return $(textbox).css({'position': 'absolute'});
      break;
      case "hr":
        var hrTypeLength = $(".textElement").length;
        var oProp;
        if (prop) {
          oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id};
        } else {
          defHeight = 20;
					let parentWidth = $(wrapper).width();
          oProp = {x:0, y: (defHeight * hrTypeLength),
            width: parentWidth.toString(),
						height: defHeight,
            id: 'hr-element-' + (hrTypeLength + 1)
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var hrbox = $( "<div><hr/></div>" );
        $(hrbox).hrelement( oProp );
        $(wrapper).append($(hrbox));
				return $(hrbox).css({'position': 'absolute'});
      break;
      case "image":
        var imageTypeLength = $(".textElement").length;
        var oProp;
        if (prop) {
          oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id, url: prop.url};
        } else {
          defHeight = 60;
          oProp = {x:0, y: (defHeight * imageTypeLength),
            width: '100', height: defHeight,
            id: 'image-element-' + (imageTypeLength + 1),
            url: '../../icon.png'
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var imagebox = $( "<div></div>" )
        $(imagebox).imageelement( oProp );
        $(wrapper).append($(imagebox));
				return $(imagebox).css({'position': 'absolute'});
      break;
			case "table":
				var tableTypeLength = $(".tableElement").length;
				let tableBox = undefined;
				//console.log(imageTypeLength);
				if (tableTypeLength == 0) {
					var oProp;
					if (prop) {
						tableBox = doCreateTable(wrapper, prop.rows, prop.x, prop.y);
					} else {
						tableBox = doCreateTable(wrapper, constant.defaultTableData);
					}
				}
				return $(tableBox).css({'position': 'absolute'});
			break;
			case "tr":
				var trLength = $(".trElement").length;
				var oProp;
				if (prop) {
					oProp = {'backgroundColor': prop.backgroundColor};
				} else {
					oProp = {/*x:0, y: (defHeight * imageTypeLength),
						width: '100%', height: defHeight,
						*/
						'backgroundColor': '#ddd',
						id: 'tr-element-' + (trLength + 1)
					}
				}
				//}
				oProp.elementselect = elementSelect;
				oProp.elementdrop = elementDrop;
				oProp.elementresizestop = elementResizeStop;
				var trbox = $('<div></div>');
				$(trbox).trelement( oProp );
				$(wrapper).append($(trbox));
				$(trbox).click();
				return $(trbox);
			break;
			case "td":
				var tdLength = $(".tdElement").length;
				var oProp;
				if (prop) {
					oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id};
				} else {
					//defHeight = 60;
					oProp = {
						'width': '90', 'height': '35',
						id: 'td-element-' + (tdLength + 1)
					}
				}
				//}
				oProp.elementselect = elementSelect;
				oProp.elementdrop = elementDrop;
				oProp.elementresizestop = elementResizeStop;
				var tdbox = $('<span></span>');
				$(tdbox).tdelement( oProp );
				$(wrapper).append($(tdbox));
				$(wrapper).click();
				return $(tdbox);
			break;
    }
  }

	const doCreateTable = function(wrapper, tableData, x, y){
		let wrapperWidth = $(wrapper).width();
		let tableProp = {id: 'table-element-1', x: x?x:0, y: y?y:60, width: '100%', cols: 5, border: '1'};
		tableProp.elementselect = elementSelect;
		tableProp.elementdrop = elementDrop;
		tableProp.elementresizestop = elementResizeStop;
		let rowWidth = wrapperWidth * 0.95;
		let tableBox = $('<div></div>').tableelement( tableProp );
		$(wrapper).append($(tableBox));
		$(tableBox).click();
		for (let i=0; i < tableData.length; i++){
			let row = tableData[i];
			let rowProp = {id: row.id};
			if (row.class){
				rowProp.class = row.class;
			}
			if (row.backgroundColor) {
				rowProp.backgroundColor = row.backgroundColor;
			}
			rowProp.elementselect = elementSelect;
			rowProp.elementdrop = elementDrop;
			rowProp.elementresizestop = elementResizeStop;
			let rowBox = $('<div></div>').trelement( rowProp );
			$(tableBox).append($(rowBox));
			$(rowBox).click();
			for (let j=0; j < row.fields.length; j++){
				let field = row.fields[j];
				let cellProp = {id: field.id, height: '35', cellData: field.cellData, fontweight: field.fontweight, fontalign: field.fontalign};
				let percentValue = field.width.slice(0, (field.width.length-1));
				cellProp.width = (rowWidth * (percentValue/100)).toFixed(2);
				cellProp.elementselect = elementSelect;
				cellProp.elementdrop = elementDrop;
				cellProp.elementresizestop = elementResizeStop;
				let cellBox = $('<div></div>').tdelement( cellProp );
				$(rowBox).append($(cellBox));
				$(cellBox).click();
			}
		}
		return $(tableBox);
	}

  function createPropEditFragment(fragParent, fragTarget, key, label, oValue, type){
    let fragProp = $("<tr></tr>");
    $(fragProp).appendTo($(fragParent));
    let fragLabel = $("<td align='left'>" + label + "</td>");
    $(fragLabel).appendTo($(fragProp));
    let fragValue = $("<input type='text' size='8'/>");
    $(fragValue).val(oValue);
    $(fragValue).on('keyup', (e)=> {
      if (e.keyCode == 13){
        let value = $(e.currentTarget).val();
        if (!(isNaN(value))) {
          let targetData = $(fragTarget).data();
          switch (type) {
            case "text":
              targetData.customTextelement.options[key] = value;
              targetData.customTextelement.options.refresh();
            break;
            case "hr":
              targetData.customHrelement.options[key] = value;
              targetData.customHrelement.options.refresh();
            break;
            case "image":
              targetData.customImageelement.options[key] = value;
              targetData.customImageelement.options.refresh();
            break;
						case "table":
              targetData.customTableelement.options[key] = value;
              targetData.customTableelement.options.refresh();
            break;
						case "tr":
              targetData.customTrelement.options[key] = value;
              targetData.customTrelement.options.refresh();
            break;
						case "td":
              targetData.customTdelement.options[key] = value;
              targetData.customTdelement.options.refresh();
            break;
          }
        } else {
          $(e.currentTarget).css({border: "2px solid red"})
        }
      }
    });
    let fragEditor = $("<td align='left'></td>");
    $(fragEditor).append($(fragValue));
    $(fragValue).appendTo($(fragProp));
    return $(fragProp);
  }

  function createPropContentFragment(fragParent, fragTarget, data) {
		//console.log(data);
    let targetData = $(fragTarget).data();
    //console.log(targetData);
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'hr') {
			elementDataName = 'customHrelement';
		} else if (data.elementType == 'image') {
			elementDataName = 'customImageelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		} else {
			console.log(elementDataName);
		}

    let fragProp = $("<tr></tr>");
    $(fragProp).appendTo($(fragParent));
    let fragLabel = $("<td align='left'>Type</td>");
    $(fragLabel).appendTo($(fragProp));
    let fragValue = $("<select><option value='static'>Static</option><option value='dynamic'>Dynamic</option></select>");
    let contentLabelFrag, contentDataFrag, updateContentCmdFrag;
    let dynamicFrag;

		let billFieldOptions = JSON.parse(localStorage.getItem('billFieldOptions'));

    $(fragValue).on('change', ()=> {
      let newValue = $(fragValue).val();
      if (newValue === 'static') {
				if (targetData[elementDataName].options) {
	        targetData[elementDataName].options['type'] = 'static';
	        $(dynamicFrag).remove();

	        contentLabelFrag = $("<tr></tr>");
	        $(contentLabelFrag).appendTo($(fragParent));
	        let contentlabel = $("<td colspan='2' align='left'>Text</td>");
	        $(contentlabel).appendTo($(contentLabelFrag));

	        contentDataFrag = $("<tr></tr>");
	        $(contentDataFrag).appendTo($(fragParent));
	        let textEditorFrag = $("<td colspan='2' align='left'></td>");
	        $(textEditorFrag).appendTo($(contentDataFrag));
	        let textEditor = $("<input type='text'/>").css({'width': '60px'});
	        $(textEditor).css({"width": "98%"});

					if (data.elementType == 'text') {
						$(textEditor).val(data.title);
					} else if (data.elementType == 'td') {
						$(textEditor).val(data.cellData);
					}
	        $(textEditor).appendTo($(textEditorFrag));
	        updateContentCmdFrag = $("<tr></tr>");
	        $(updateContentCmdFrag).appendTo($(fragParent));
	        let updateCmdFrag = $("<td colspan='2' align='right'></td>");
	        $(updateCmdFrag).appendTo($(updateContentCmdFrag));
					$(textEditor).on('keyup', (e)=> {
						let newContent = $(textEditor).val();
						if (data.elementType == 'text') {
	          	targetData[elementDataName].options['title'] = newContent;
						} else if (data.elementType == 'td') {
							targetData[elementDataName].options['cellData'] = newContent;
						}
	          targetData[elementDataName].options.refresh();
					});
				}
      } else if (newValue === 'dynamic') {
        targetData[elementDataName].options['type'] = 'dynamic';
        $(contentLabelFrag).remove();
        $(contentDataFrag).remove();
        $(updateContentCmdFrag).remove();

        dynamicFrag = $("<tr></tr>");
        $(dynamicFrag).appendTo($(fragParent));

        let dynamicFieldlabel = $("<td align='left'>Field</td>");
        $(dynamicFieldlabel).appendTo($(dynamicFrag));

        let dynamicFieldValue = $("<td align='left'></td>");
        $(dynamicFieldValue).appendTo($(dynamicFrag));

        let dynamicFieldOption = $("<select></select>");
        $(dynamicFieldOption).appendTo($(dynamicFieldValue));
				if ((targetData[elementDataName].options.elementType == 'text') || (targetData[elementDataName].options.elementType == 'td')) {
	        billFieldOptions.forEach((item, i) => {
	          $(dynamicFieldOption).append("<option value='" + item.name_en + "'>" + item.name_th + "</option>");
	        });
				}
        $(dynamicFieldOption).on('change', ()=> {
          let newContent = $(dynamicFieldOption).val();
					if (data.elementType == 'text') {
          	targetData[elementDataName].options['title'] = '$' + newContent;
					} else if (data.elementType == 'td') {
						targetData[elementDataName].options['cellData'] = '$' + newContent;
					}
          targetData[elementDataName].options.refresh();
        });
				if (data.elementType == 'text') {
					if (data.title) {
						let currentVal = data.title.substring(1);
						$(dynamicFieldOption).val(currentVal).change();
					}
				} else if (data.elementType == 'td') {
					if (data.cellData) {
						let currentVal = data.cellData.substring(1);
						$(dynamicFieldOption).val(currentVal).change();
					}
				}
      }
    });
    let fragEditor = $("<td align='left'></td>");
    $(fragEditor).append($(fragValue));
    $(fragValue).appendTo($(fragProp));
    $(fragValue).val(data.type).change();
    return $(fragProp);
  }

  function createFontSizeFragment(fragParent, fragTarget, data) {
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,32, 34, 36, 38, 40];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}
    let fragFontSize = $("<tr></tr>");
    $(fragFontSize).appendTo($(fragParent));
    let fragFontSizeLabel = $("<td align='left'>Font Size</td>");
    $(fragFontSizeLabel).appendTo($(fragFontSize));
    let fragFontSizeOption = $("<td align='left'></td>");
    $(fragFontSizeOption).appendTo($(fragFontSize));
    let fragFontSizeValue = $("<select></select>");
    $(fragFontSizeValue).appendTo($(fragFontSizeOption));
    fontSizes.forEach((item, i) => {
      $(fragFontSizeValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontSizeValue).on('change', ()=>{
      let newSize = $(fragFontSizeValue).val();
			targetData[elementDataName].options['fontsize'] = newSize;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontSizeValue).val(data.fontsize).change();
    return $(fragFontSize);
  }

  function createFontWeightFragment(fragParent, fragTarget, data) {
    const fontWeight = ["normal", "bold"];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}

    let fragFontWeight = $("<tr></tr>");
    $(fragFontWeight).appendTo($(fragParent));
    let fragFontWeightLabel = $("<td align='left'>Font Weight</td>");
    $(fragFontWeightLabel).appendTo($(fragFontWeight));

    let fragFontWeightOption = $("<td align='left'></td>");
    $(fragFontWeightOption).appendTo($(fragFontWeight));
    let fragFontWeightValue = $("<select></select>");
    $(fragFontWeightValue).appendTo($(fragFontWeightOption));
    fontWeight.forEach((item, i) => {
      $(fragFontWeightValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontWeightValue).on('change', ()=>{
      let newWeight = $(fragFontWeightValue).val();
      targetData[elementDataName].options['fontweight'] = newWeight;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontWeightValue).val(data.fontweight).change();
    return $(fragFontWeight);
  }

  function createFontStyleFragment(fragParent, fragTarget, data) {
    const fontStyle = ["normal", "italic"];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}
    let fragFontStyle = $("<tr></tr>");
    $(fragFontStyle).appendTo($(fragParent));
    let fragFontStyleLabel = $("<td align='left'>Font Style</td>");
    $(fragFontStyleLabel).appendTo($(fragFontStyle));

    let fragFontStyleOption = $("<td align='left'></td>");
    $(fragFontStyleOption).appendTo($(fragFontStyle));
    let fragFontStyleValue = $("<select></select>");
    $(fragFontStyleValue).appendTo($(fragFontStyleOption));
    fontStyle.forEach((item, i) => {
      $(fragFontStyleValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontStyleValue).on('change', ()=>{
      let newStyle = $(fragFontStyleValue).val();
      targetData[elementDataName].options['fontstyle'] = newStyle;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontStyleValue).val(data.fontstyle).change();
    return $(fragFontStyle);
  }

  function createFontAlignFragment(fragParent, fragTarget, data) {
    const fontAlign = ["left", "center", "right"];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}

    let fragFontAlign = $("<tr></tr>");
    $(fragFontAlign).appendTo($(fragParent));
    let fragFontAlignLabel = $("<td align='left'>Align</td>");
    $(fragFontAlignLabel).appendTo($(fragFontAlign));

    let fragFontAlignOption = $("<td align='left'></td>");
    $(fragFontAlignOption).appendTo($(fragFontAlign));
    let fragFontAlignValue = $("<select></select>");
    $(fragFontAlignValue).appendTo($(fragFontAlignOption));
    fontAlign.forEach((item, i) => {
      $(fragFontAlignValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontAlignValue).on('change', ()=>{
      let newAlign = $(fragFontAlignValue).val();
      targetData[elementDataName].options['fontalign'] = newAlign;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontAlignValue).val(data.fontalign).change();
    return $(fragFontAlign);
  }

	function createVAlignFragment(fragParent, fragTarget, data) {
    const vAlign = ["top", "middle", "bottom"];
		let targetData = $(fragTarget).data();
		let elementDataName = 'customTdelement';

    let fragVAlign = $("<tr></tr>");
    $(fragVAlign).appendTo($(fragParent));
    let fragVAlignLabel = $("<td align='left'>V-Align</td>");
    $(fragVAlignLabel).appendTo($(fragVAlign));

    let fragVAlignOption = $("<td align='left'></td>");
    $(fragVAlignOption).appendTo($(fragVAlign));
    let fragVAlignValue = $("<select></select>");
    $(fragVAlignValue).appendTo($(fragVAlignOption));
    vAlign.forEach((item, i) => {
      $(fragVAlignValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragVAlignValue).on('change', ()=>{
      let newAlign = $(fragVAlignValue).val();
      targetData[elementDataName].options['valign'] = newAlign;
      targetData[elementDataName].options.refresh();
    });
		if ((data.valign) && (data.valign !== '')) {
    	$(fragVAlignValue).val(data.valign).change();
		} else {
			$(fragVAlignValue).val('middle').change();
		}
    return $(fragVAlign);
	}

	function createHrLineStyleFragment(fragParent, fragTarget, data) {
    const lineStyle = ["solid", "dashed"];
		let elementDataName = 'customHrelement';
		let targetData = $(fragTarget).data();
		let fragLineStyle = $("<tr></tr>");
    $(fragLineStyle).appendTo($(fragParent));
    let fragLineStyleLabel = $("<td align='left'>Style</td>");
    $(fragLineStyleLabel).appendTo($(fragLineStyle));

    let fragLineStyleOption = $("<td align='left'></td>");
    $(fragLineStyleOption).appendTo($(fragLineStyle));
    let fragLineStyleValue = $("<select></select>");
    $(fragLineStyleValue).appendTo($(fragLineStyleOption));
    lineStyle.forEach((item, i) => {
      $(fragLineStyleValue).append("<option value='" + item + "'>" + item + "</option>");
    });
		$(fragLineStyleValue).on('change', ()=>{
			if (targetData[elementDataName].options) {
	      let newStyle = $(fragLineStyleValue).val();
	      targetData[elementDataName].options['lineStyle'] = newStyle;
	      targetData[elementDataName].options.refresh();
			}
    });
    $(fragLineStyleValue).val(data.lineStyle).change();
    return $(fragLineStyle);
	}

  function createPropImageSrcFragment(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
    let fragImageSrc = $("<tr></tr>");
    $(fragImageSrc).appendTo($(fragParent));
    let fragImageSrcLabel = $("<td align='left'>Image Url</td>");
    $(fragImageSrcLabel).appendTo($(fragImageSrc));

    let fragImageSrcInput = $("<td align='left'><input type='text' id='urltext' size='10' value='" + data.url + "'/></td>");
    $(fragImageSrcInput).appendTo($(fragImageSrc));

    let openSelectFileCmd = $("<input type='button' value=' ... ' />");
    $(openSelectFileCmd).appendTo($(fragImageSrcInput));
    $(openSelectFileCmd).on('click', (evt) => {
      let fileBrowser = $('<input type="file"/>');
      $(fileBrowser).attr("id", 'fileupload');
      $(fileBrowser).attr("name", 'imagetemplate');
      $(fileBrowser).attr("multiple", true);
      $(fileBrowser).css('display', 'none');
      $(fileBrowser).on('change', function(e) {
        const defSize = 10000000;
        var fileSize = e.currentTarget.files[0].size;
        var fileType = e.currentTarget.files[0].type;
        if (fileSize <= defSize) {
          var uploadUrl = "/api/shop/upload/image/template";
          $('#fileupload').simpleUpload(uploadUrl, {
            progress: function(progress){
  						console.log("ดำเนินการได้ : " + Math.round(progress) + "%");
  					},
            success: function(uploaddata){
  						//console.log('Uploaded.', uploaddata);
              var imageUrl = uploaddata.link;
              $("#urltext").val(imageUrl);
              targetData.customImageelement.options['url'] = imageUrl;
              targetData.customImageelement.options.refresh();
            }
          });
					$(fragTarget).click();
        }
      });
      $(fileBrowser).appendTo($(fragImageSrcInput));
      $(fileBrowser).click();
    });
    return $(fragImageSrc);
  }

	const createTablePropFragment = function(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
		if (targetData.customTableelement) {
			let fragCols = $("<tr></tr>");
			$(fragParent).append($(fragCols));
			$(fragCols).append($('<td align="left">จำนวนคอลัมน์</td>'));
			let colsInput = $('<input type="number"/>').css({'width': '50px'});
			$(colsInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(colsInput).val();
					targetData.customTableelement.options['cols'] = newValue;
					targetData.customTableelement.options.refresh();
				}
			});
			$(colsInput).val(targetData.customTableelement.options['cols']);
			let colsFieldValue = $('<td align="left"></td>');
			$(colsFieldValue).append($(colsInput));
			$(fragCols).append($(colsFieldValue));

			let fragฺBorder = $("<tr></tr>");
			$(fragParent).append($(fragฺBorder));
			$(fragฺBorder).append($('<td align="left">เส้นขอบ</td>'));
			let borderInput = $('<input type="number"/>').css({'width': '50px'});
			$(borderInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(borderInput).val();
					targetData.customTableelement.options['border'] = newValue;
					//console.log(targetData.customTableelement.options['border']);
					targetData.customTableelement.options.refresh();
				}
			});
			if ((targetData.customTableelement.options['border']) && (targetData.customTableelement.options['border'] !== '')) {
				$(borderInput).val(targetData.customTableelement.options['border']);
			} else {
				$(borderInput).val('1');
			}
			let borderFieldValue = $('<td align="left"></td>');
			$(borderFieldValue).append($(borderInput));
			$(fragฺBorder).append($(borderFieldValue));

			return $(fragCols);
		} else {
			return;
		}
	}

	const createTrPropFragment = function(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
		if (targetData.customTrelement) {
			let fragRow = $("<tr></tr>");
			$(fragParent).append($(fragRow));
			$(fragRow).append($('<td align="left">สีพื้นหลัง</td>'));
			let colorInput = $('<input type="text"/>').css({'width': '70px'});
			$(colorInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(colorInput).val();
					targetData.customTrelement.options['backgroundColor'] = newValue;
					targetData.customTrelement.options.refresh();
				}
			});
			$(colorInput).val(targetData.customTrelement.options['backgroundColor']);
			let colorFieldValue = $('<td align="left"></td>');
			$(colorFieldValue).append($(colorInput));
			$(fragRow).append($(colorFieldValue));

			fragRow = $("<tr></tr>");
			$(fragParent).append($(fragRow));
			$(fragRow).append($('<td align="left">ความสูง</td>'));
			let heightInput = $('<input type="text"/>').css({'width': '70px'});
			$(heightInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(heightInput).val();
					targetData.customTrelement.options['height'] = newValue;
					targetData.customTrelement.options.refresh();
				}
			});
			if ((targetData.customTrelement.options['height']) && (targetData.customTrelement.options['height'] !== '')){
				$(heightInput).val(targetData.customTrelement.options['height']);
			} else {
				$(heightInput).val('40');
			}
			let heightFieldValue = $('<td align="left"></td>');
			$(heightFieldValue).append($(heightInput));
			$(fragRow).append($(heightFieldValue));

			return $(fragRow);
		} else {
			return;
		}
	}

  const createElementPropertyForm = function(target, data) {
    let formbox = $("<table width='100%' cellspacing='0' cellpadding='2' border='0'></table>");
    $(formbox).append("<tr><td align='left' width='40%'>id</td><td align='left' width='*'>" + data.id + "</td></tr>");
    if (data.elementType === 'text') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
      let contentProp = createPropContentFragment(formbox, target, data);
      let contentFontSize = createFontSizeFragment(formbox, target, data);
      let contentFontWeight = createFontWeightFragment(formbox, target, data);
      let contentFontStyle = createFontStyleFragment(formbox, target, data);
      let contentFontAlign = createFontAlignFragment(formbox, target, data);
		} else if (data.elementType === 'hr') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
			let lineThickProp = createPropEditFragment(formbox, target, 'lineThick', 'Thick', data.lineThick, data.elementType);
			let lineStyleProp = createHrLineStyleFragment(formbox, target, data);
    } else if (data.elementType === 'image') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
      let imageSrcProp = createPropImageSrcFragment(formbox, target, data);
		} else if (data.elementType === 'table') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
			let tableProp = createTablePropFragment(formbox, target, data);
		} else if (data.elementType === 'tr') {
			let trProp = createTrPropFragment(formbox, target, data);
		} else if (data.elementType === 'td') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
      let contentProp = createPropContentFragment(formbox, target, data);
      let contentFontSize = createFontSizeFragment(formbox, target, data);
      let contentFontWeight = createFontWeightFragment(formbox, target, data);
      let contentFontStyle = createFontStyleFragment(formbox, target, data);
      let contentFontAlign = createFontAlignFragment(formbox, target, data);
			let contentVAlign = createVAlignFragment(formbox, target, data);
    }
    return $(formbox);
  }

	const doFindMaxYWrapper = function(wrapper) {
		let maxY = 0;
		$(wrapper).each(function() {
  		//let options = parseFloat($(this).data());
			let options = $(this).data();
			console.log(options);
  		//maximum = (value > maximum) ? value : maximum;
		});
	}

  return {
		resetActive,
		resetPropForm,
		removeActiveElement,
		elementSelect,
		elementDrop,
		elementResizeStop,
		doCreateElement,

  	createElementPropertyForm,
		doFindMaxYWrapper
	}
}

},{"../../../home/mod/constant-lib.js":3}],11:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);

  const doCreateFormDlg = function(shopData, gooditemSeleted, successCallback) {
    return new Promise(async function(resolve, reject) {
      let menugroups = JSON.parse(localStorage.getItem('menugroups'));
      let menuitems = JSON.parse(localStorage.getItem('menuitems'));
      let wrapperBox = $('<div></div>');
      let searchInputBox = $('<div></div>').css({'width': '100%', 'padding': '4px'});
      let gooditemListBox = $('<div></div>').css({'width': '100%', 'padding': '4px', 'min-height': '200px'});
      let searchKeyInput = $('<input id="SearchKeyInput" type="text" value=""/>').css({'width': '70px'});
      let gooditemResult = undefined;
      $(searchKeyInput).css({'background': 'url(../../images/search-icon.png) no-repeat right center', 'background-size': '6% 100%', 'padding-right': '3px'});
      $(searchKeyInput).on('keyup', async (evt)=>{
        let key = $(searchKeyInput).val();
        if (key !== ''){
          if (key === '0') {
            //gooditemResult = await doShowList(menuitems, gooditemSeleted, successCallback);
						//$(gooditemListBox).empty().append($(gooditemResult));
						doShowGroupFilter(menugroups, async (groupSelected)=>{
							console.log(groupSelected);
							if (groupSelected) {
								let gooditemFilter = await doFilterGooditemByGroup(menuitems, groupSelected);
		            gooditemResult = await doShowList(gooditemFilter, gooditemSeleted, successCallback);
								$(gooditemListBox).empty().append($(gooditemResult));
							}
						});
          } else {
            let gooditemFilter = await doFilterGooditem(menuitems, key);
            gooditemResult = await doShowList(gooditemFilter, gooditemSeleted, successCallback);
						$(gooditemListBox).empty().append($(gooditemResult));
          }
        } else {
					gooditemResult = await doShowList(menuitems, gooditemSeleted, successCallback);
					$(gooditemListBox).empty().append($(gooditemResult));
				}
      });
			let scanQRCodeCmd = $('<img src="../../images/scan-qrcode-icon.png" title="ค้นหาโดยสแกนคิวอาร์โค้ด"/>').css({'width': '28px', 'height': 'auto', 'cursor': 'pointer', 'margin-left': '10px', 'margin-bottom': '-8px'});
			$(scanQRCodeCmd).on('click', (evt)=>{
				let qrCodeBox = $('<div id="QRCodeReaderBox"></div>').css({'width': '100%', 'heigth': '100px', 'text-align': 'center', 'display': 'none'});
				$(searchInputBox).append($(qrCodeBox));
				$(qrCodeBox).slideDown('slow');
				let onScanSuccess = function(decodedText, decodedResult) {
			    //console.log(`Scan result: ${decodedText}`, decodedResult);
					let temps = decodedText.split('?')
					temps = temps[1].split('=');
					let mid = temps[1];
					if ((temps[0]=='mid') && (Number(temps[1]) > 0)) {
						let key = Number(temps[1]);
						let result = menuitems.filter((item)=>{
		          if (item.id === key) {
		            return item;
		          }
		        });
						if (result.length > 0) {
							let menuKey = result[0].MenuName;
							$(searchKeyInput).val(menuKey).trigger('keyup')
						}
						html5QrcodeScanner.clear();
						$(qrCodeBox).remove();
					}
				}
				let onScanError = function(errorMessage) {
    			console.log(errorMessage);
				}

				let html5QrcodeScanner = new Html5QrcodeScanner("QRCodeReaderBox", { fps: 10, qrbox: 250 });
				html5QrcodeScanner.render(onScanSuccess, onScanError);
			});
      let addGoodItemCmd = $('<input type="button" value=" เพิ่มสินค้า " class="action-btn"/>').css({'margin-left': '10px'});
      $(addGoodItemCmd).on('click', (evt)=>{
        //$(wrapperBox).empty();
        $(searchInputBox).hide();
        $(gooditemListBox).hide();
        let newGooditemForm = doShowAddGooditemForm(shopData, async(newGooditems)=>{
          gooditems = newGooditems;
          $(newGooditemForm).remove();
          $(searchInputBox).show();
          $(gooditemListBox).show();
          gooditemResult = await doShowList(gooditems, gooditemSeleted, successCallback);
          $(gooditemListBox).empty().append($(gooditemResult));
        }, ()=>{
					$(newGooditemForm).remove();
          $(searchInputBox).show();
          $(gooditemListBox).show();
				});
        $(wrapperBox).append($(newGooditemForm))
      });
      $(searchInputBox).append($(searchKeyInput)).append($(scanQRCodeCmd)).append($(addGoodItemCmd));
      gooditemResult = await doShowList(menuitems, gooditemSeleted, successCallback);
      $(gooditemListBox).empty().append($(gooditemResult));
      $(wrapperBox).append($(searchInputBox)).append($(gooditemListBox));
      resolve($(wrapperBox));
    });
  }

  const doFilterGooditem = function(gooditems, key){
    return new Promise(async function(resolve, reject) {
      if (key === '*') {
        resolve(gooditems);
      } else {
        let result = await gooditems.filter((item)=>{
          let n = item.MenuName.search(key);
          if (n >= 0) {
            return item;
          } else if ((item.Desc) && (item.Desc.search(key) >= 0)) {
						return item;
					}
        });
        resolve(result);
      }
    });
  }

	const doFilterGooditemByGroup = function(gooditems, groupSelected){
		return new Promise(async function(resolve, reject) {
			let groupId = groupSelected.id;
			let result = await gooditems.filter((item)=>{
				if (item.menugroupId == groupId) {
					return item;
				}
			});
			resolve(result);
		});
	}

  const doShowList = function(results, gooditemSeleted, successCallback){
    return new Promise(async function(resolve, reject) {
      let gooditemTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let	promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < results.length; i++){
					let itemOnOrders = gooditemSeleted.filter((item)=>{
						return (item.id == results[i].id);
					});
					if (itemOnOrders.length == 0) {
						let descRow = undefined;
	          let resultRow = $('<tr></tr>').css({'cursor': 'pointer', 'padding': '4px'});
	          $(resultRow).hover(()=>{
	            $(resultRow).css({'background-color': 'grey', 'color': 'white'});
	          },()=>{
	            $(resultRow).css({'background-color': '#ddd', 'color': 'black'});
	          });
	          let qtyInput = $('<input type="text" value="1" tabindex="3"/>').css({'width': '20px'});
						$(qtyInput).on('click', (evt)=>{
							evt.stopPropagation();
						});
	          $(qtyInput).on('keyup', (evt)=>{
	            if (evt.keyCode == 13) {
	              $(resultRow).click();
	            }
	          });
	          $(resultRow).on('click', (evt)=>{
	            let qtyValue = $(qtyInput).val();
	            if (qtyValue > 0) {
	              $(qtyInput).css({'border': ''});
	              let applyResult = results[i];
	              applyResult.Qty = qtyValue;
								applyResult.ItemStatus = 'New';
								$(resultRow).remove();
								if ($(descRow)) {
									$(descRow).remove();
								}
	              successCallback(applyResult);
	            } else {
	              $(qtyInput).css({'border': '1px solid red'});
	            }
	          });
	          let pictureCell = $('<td width="10%" align="center"></td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
	          if (results[i].MenuPicture){
	            let picture = $('<img src="' + results[i].MenuPicture + '"/>').css({'width': '40px', 'height': 'auto', 'cursor': 'pointer'});
	            $(pictureCell).append($(picture));
							$(picture).on('click', (evt)=>{
								evt.stopPropagation();
								doShowGooditemPopup(results[i]);
							});
	          }

						// console.log(results[i]);

	          let nameCell = $('<td width="30%" align="left">' + results[i].MenuName + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
	          let qtyCell = $('<td width="10%" align="left"></td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
	          let priceCell = $('<td width="10%" align="left">' + common.doFormatNumber(results[i].Price) + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
	          let unitCell = $('<td width="15%" align="left">' + results[i].Unit + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
						let groupCell = undefined;
						if (results[i].menugroup) {
	          	groupCell = $('<td width="*" align="left">' + results[i].menugroup.GroupName + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
						} else {
							groupCell = $('<td width="*" align="left">ไม่พบกลุ่มสินค้า</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});
						}
	          $(qtyCell).append($(qtyInput)).append($('<span>*</spam>').css({'color': 'red'}));
	          $(resultRow).append($(pictureCell)).append($(nameCell)).append($(qtyCell)).append($(priceCell)).append($(unitCell)).append($(groupCell));
	          $(gooditemTable).append($(resultRow));
						if ((results[i].Desc) && (results[i].Desc != '')) {
							$(resultRow).attr('title', results[i].Desc);
							descRow = $('<tr></tr>');
							let descCell = $('<td colspan="6" align="left" valign="middle"></td>').css({'font-size': '14px'});
							$(descCell).text(results[i].Desc.substring(0, 150));
							$(descRow).append($(descCell))
							$(gooditemTable).append($(descRow));
						}
					}
        }
        setTimeout(()=>{
          resolve2($(gooditemTable));
        }, 100);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  const doShowAddGooditemForm = function(shopData, successCallback, cancelCallback){
    let form = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let formRow = $('<tr></tr>');
		let commandRow = $('<tr></tr>');
    let nameCell = $('<td width="35%" align="left"></td>');
    let priceCell = $('<td width="20%" align="left"></td>');
    let unitCell = $('<td width="25%" align="left"></td>');
    let groupCell = $('<td width="*" align="left"></td>');
    let commandCell = $('<td colspan="4" align="center"></td>');
    let nameInput = $('<input type="text" placeholder="ชื่อรายการสินค้า"/>').css({'width': '120px'});
    let priceInput = $('<input type="text" placeholder="ราคา"/>').css({'width': '50px'});
    let unitInput = $('<input type="text" placeholder="หน่วยขาย"/>').css({'width': '70px'});
    let groupSelect = $('<select></select>').css({'width': '80px'});
    let menugroups = JSON.parse(localStorage.getItem('menugroups'));
    menugroups.forEach((item, i) => {
      $(groupSelect).append($('<option value="' + item.id + '">' + item.GroupName + '</option>'));
    });

    let saveCmd = $('<input type="button" value=" บันทึก " class="action-btn"/>');
    $(saveCmd).on('click', async (evt)=>{
      let nameValue = $(nameInput).val();
      let priceValue = $(priceInput).val();
      let unitValue = $(unitInput).val();
      if (nameValue !== '') {
        $(nameInput).css({'border': ''});
        if (priceValue !== '') {
          $(priceInput).css({'border': ''});
          if (unitValue !== '') {
            $(unitInput).css({'border': ''});
            let groupId = $(groupSelect).val();
            let newMenuitemData = {MenuName: nameValue, Price: priceValue, Unit: unitValue};
            let params = {data: newMenuitemData, shopId: shopData.id, groupId: parseInt(groupId)};
            let menuitemRes = await common.doCallApi('/api/shop/menuitem/add', params);
            if (menuitemRes.status.code == 200) {
              $.notify("เพิ่มรายการสินค้าสำเร็จ", "success");
              let menuitems = JSON.parse(localStorage.getItem('menuitems'));
              menuitems.push(menuitemRes.Record);
              localStorage.setItem('menuitems', JSON.stringify(menuitems));
              successCallback(menuitems);
            } else if (menuitemRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการสินค้าได้", "error");
            }
          } else {
            $(unitInput).css({'border': '1px solid red'});
          }
        } else {
          $(priceInput).css({'border': '1px solid red'});
        }
      } else {
        $(nameInput).css({'border': '1px solid red'});
      }
    });

		let cancelCmd = $('<input type="button" value="ยกเลิก" style="margin-left: 5px;"/>');
    $(cancelCmd).on('click', (evt)=>{
			cancelCallback();
		});

    $(nameCell).append($(nameInput)).append($('<span>*</span>').css({'margin-left': '5px', 'color': 'red'}));
    $(priceCell).append($(priceInput)).append($('<span>*</span>').css({'margin-left': '5px', 'color': 'red'}));
    $(unitCell).append($(unitInput)).append($('<span>*</span>').css({'margin-left': '5px', 'color': 'red'}));
    $(groupCell).append($(groupSelect));
    $(commandCell).append($(saveCmd)).append($(cancelCmd));
    $(formRow).append($(nameCell)).append($(priceCell)).append($(unitCell)).append($(groupCell))/*.append($(commandCell))*/;
		$(commandRow).append($(commandCell))
    $(form).append($(formRow));

		$(form).append($('<tr><td colspan="4"></td></tr>').css({'height': '30px'}));
		$(form).append($(commandRow))
		return $(form).css({'border': '2px grey solid', 'padding': '2px'});
  }

	const doShowGooditemPopup = function(gooditem) {
		let gooditemImage = $('<img/>').attr('src', gooditem.MenuPicture).css({'width': '280px', 'height': 'auto'});
		let imageBox = $('<div></div>').css({'width': '100%', 'text-align': 'center'}).append($(gooditemImage));
		let nameBox = $('<div></div>').css({'width': '100%', 'text-align': 'left'}).append($('<span><b>ชื่อ: </b></span>')).append($('<span></span>').text(gooditem.MenuName));
		let priceBox = $('<div></div>').css({'width': '100%', 'text-align': 'left'}).append($('<span><b>ราคาต่อหน่วย: </b></span>')).append($('<span></span>').text(common.doFormatNumber(gooditem.Price)));
		let unitBox = $('<div></div>').css({'width': '100%', 'text-align': 'left'}).append($('<span><b>หน่วยขาย: </b></span>')).append($('<span></span>').text(gooditem.Unit));
		let groupBox = $('<div></div>').css({'width': '100%', 'text-align': 'left'}).append($('<span><b>สังกัดกลุ่ม: </b></span>')).append($('<span></span>').text(gooditem.menugroup.GroupName));
		let popupOption = {
			title: 'รายละเอียดสินค้า',
			msg: $('<div></div>').css({'width': '100%'}).append($(imageBox)).append($(nameBox)).append($(priceBox)).append($(unitBox)).append($(groupBox)),
			width: '320px',
			onOk: function(evt) {
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(popupOption);
		$(dlgHandle.overlay).css({'z-index': '400'});
		$(dlgHandle.cancelCmd).hide();
		return dlgHandle;
	}

	const doShowGroupFilter = function(menugroups, successCallback) {
		let groupFilterBox = $('<div></div>').css({'width': '100%'});
		menugroups.forEach((group, i) => {
			let groupImage = $('<img/>').attr('src', group.GroupPicture).css({'width': '110px', 'height': 'auto', 'position': 'relative', 'display': 'inline'});
			let imageBox = $('<div></div>').css({'width': '100%', 'text-align': 'center'}).append($(groupImage));
			let nameBox = $('<div></div>').css({'width': '100%', 'text-align': 'left'}).append($('<span></span>').text(group.GroupName));
			let groupBox = $('<div></div>').css({'width': '120px', 'display': 'inline-block', 'cursor': 'pointer', 'background-color': '#ddd', 'margin': '10px 0 0 10px', 'border': '2px ridge grey'}).append($(imageBox)).append($(nameBox));
			$(groupBox).hover(()=>{
				$(groupBox).css({'background-color': 'grey', 'color': 'white'});
			},()=>{
				$(groupBox).css({'background-color': '#ddd', 'color': 'black'});
			});
			$(groupBox).on('click', (evt)=>{
				dlgHandle.closeAlert();
				successCallback(group);
			});
			$(groupFilterBox).append($(groupBox));
		});
		let popupOption = {
			title: 'เลือกกลุ่มสินค้า',
			msg: $(groupFilterBox),
			width: '460px',
			onOk: function(evt) {
				dlgHandle.closeAlert();
				successCallback(undefined);
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
				successCallback(undefined);
			}
		}
		let dlgHandle = $('body').radalert(popupOption);
		$(dlgHandle.overlay).css({'z-index': '400'});
		$(dlgHandle.cancelCmd).hide();
		return dlgHandle;
	}

  return {
    doCreateFormDlg
	}
}

},{"../../../home/mod/common-lib.js":2}],12:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);

  const groupmenuTableFields = [
		{fieldName: 'GroupName', displayName: 'ชื่อกลุ่มเมนู', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'GroupDesc', displayName: 'รายละเอียด', width: '30%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'GroupPicture', displayName: 'โลโก้', width: '25%', align: 'center', inputSize: '30', verify: false, showHeader: true}
	];

  const doShowMenugroupItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      $(workAreaBox).empty();
      let groupmenuRes = await common.doCallApi('/api/shop/menugroup/list/by/shop/' + shopData.id, {});
			let groupmenuItems = groupmenuRes.Records;
      let titlePageBox = $('<div style="padding: 4px;">รายการกลุ่มเมนูของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
      $(workAreaBox).append($(titlePageBox));
      let newGroupmenuCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
      let newGroupmenuCmd = $('<input type="button" value=" + New Group Menu " class="action-btn"/>');
      $(newGroupmenuCmd).on('click', (evt)=>{
        doOpenNewGroupmenuForm(shopData, workAreaBox);
      });
      $(newGroupmenuCmdBox).append($(newGroupmenuCmd))
      $(workAreaBox).append($(newGroupmenuCmdBox));

      let groupmenuTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < groupmenuTableFields.length; i++) {
        if (groupmenuTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + groupmenuTableFields[i].width + '" align="center"><b>' + groupmenuTableFields[i].displayName + '</b></td>'));
        }
			}
			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(groupmenuTable).append($(headerRow));

			for (let x=0; x < groupmenuItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = groupmenuItems[x];
				for (let i=0; i < groupmenuTableFields.length; i++) {
					let field = $('<td align="' + groupmenuTableFields[i].align + '"></td>');
					if (groupmenuTableFields[i].fieldName !== 'GroupPicture') {
						$(field).text(item[groupmenuTableFields[i].fieldName]);
						$(itemRow).append($(field));
					} else {
						let groupmenuLogoIcon = new Image();
						groupmenuLogoIcon.id = 'GroupPicture_' + item.id;
						if (item['GroupPicture'] !== ''){
							groupmenuLogoIcon.src = item['GroupPicture'];
						} else {
							groupmenuLogoIcon.src = '/shop/favicon.ico'
						}
						$(groupmenuLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
						$(groupmenuLogoIcon).on('click', (evt)=>{
							window.open(item['GroupPicture'], '_blank');
						});
						let groupMenuLogoIconBox = $('<div></div>').css({"position": "relative", "width": "fit-content", "border": "2px solid #ddd"});
				    $(groupMenuLogoIconBox).append($(groupmenuLogoIcon));
						let editGroupMenuLogoCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'position': 'absolute', 'width': '25px', 'height': 'auto', 'cursor': 'pointer', 'right': '2px', 'bottom': '2px', 'display': 'none', 'z-index': '21'});
						$(editGroupMenuLogoCmd).attr('title', 'เปลี่ยนภาพใหม่');
						$(groupMenuLogoIconBox).append($(editGroupMenuLogoCmd));
						$(groupMenuLogoIconBox).hover(()=>{
							$(editGroupMenuLogoCmd).show();
						},()=>{
							$(editGroupMenuLogoCmd).hide();
						});
						$(editGroupMenuLogoCmd).on('click', (evt)=>{
							evt.stopPropagation();
							doStartUploadPicture(evt, groupmenuLogoIcon, field, item.id, shopData, workAreaBox);
						});
						$(field).append($(groupMenuLogoIconBox));

						let clearGroupmenuLogoCmd = $('<input type="button" value=" เคลียร์รูป " class="action-btn"/>');
						$(clearGroupmenuLogoCmd).on('click', async (evt)=>{
							let callRes = await common.doCallApi('/api/shop/menugroup/change/logo', {data: {GroupPicture: ''}, id: item.id});
							groupmenuLogoIcon.src = '/shop/favicon.ico'
						});
						$(field).append($('<div style="width: 100%;"></div>').append($(clearGroupmenuLogoCmd)));
						$(itemRow).append($(field));
					}
				}
				let editGroupmenuCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editGroupmenuCmd).on('click', (evt)=>{
					doOpenEditGroupmenuForm(shopData, workAreaBox, item);
				});
				let deleteGroupmenuCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteGroupmenuCmd).on('click', (evt)=>{
					doDeleteGroupmenu(shopData, workAreaBox, item.id);
				});

				let commandCell = $('<td align="center"></td>');
				$(commandCell).append($(editGroupmenuCmd));
				$(commandCell).append($(deleteGroupmenuCmd));
				$(itemRow).append($(commandCell));
				$(groupmenuTable).append($(itemRow));
			}
			$(workAreaBox).append($(groupmenuTable));
      resolve();
    });
  }

  const doStartUploadPicture = function(evt, groupmenuLogoIcon, imageBox, groupId, shopData, workAreaBox){
    let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'groupmenulogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      const defSize = 10000000;
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= defSize) {
        doUploadImage(fileBrowser, groupmenuLogoIcon, fileType, groupId, shopData, workAreaBox);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + defSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
  }

  const doUploadImage = function(fileBrowser, groupmenuLogoIcon, fileType, groupId, shopData, workAreaBox){
    var uploadUrl = '/api/shop/upload/menugrouplogo';
		//$('body').loading('start');
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
        let shopRes = await common.doCallApi('/api/shop/menugroup/change/logo', {data: {GroupPicture: data.link}, id: groupId});
        setTimeout(async() => {
          await doShowMenugroupItem(shopData, workAreaBox);
					$('body').loading({message: undefined});
					$('body').loading('stop');
        }, 400);
      },
			progress: function(progress){
				$('body').loading({message: Math.round(progress) + ' %'});
			}
			//https://www.npmjs.com/package/jquery-simple-upload
    });
  }

	const doCreateNewGroupmenuForm = function(groupmenuData){
    let groupmenuFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < groupmenuTableFields.length; i++) {
			if (groupmenuTableFields[i].fieldName !== 'GroupPicture') {
				let fieldRow = $('<tr></tr>');
				let labelField = $('<td width="40%" align="left">' + groupmenuTableFields[i].displayName + (groupmenuTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
				let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
				let inputValue = $('<input type="text" id="' + groupmenuTableFields[i].fieldName + '" size="' + groupmenuTableFields[i].inputSize + '"/>');
				if ((groupmenuData) && (groupmenuData[groupmenuTableFields[i].fieldName])) {
					$(inputValue).val(groupmenuData[groupmenuTableFields[i].fieldName]);
				}
				$(inputField).append($(inputValue));
				$(fieldRow).append($(labelField));
				$(fieldRow).append($(inputField));
				$(groupmenuFormTable).append($(fieldRow));
			}
		}
		return $(groupmenuFormTable);
  }

	const doVerifyGroupmenuForm = function(){
    let isVerify = true;
		let groupmenuDataForm = {};
		for (let i=0; i < groupmenuTableFields.length; i++) {
			let curValue = $('#'+groupmenuTableFields[i].fieldName).val();
			if (groupmenuTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+groupmenuTableFields[i].fieldName).css({'border': ''});
					groupmenuDataForm[groupmenuTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+groupmenuTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					groupmenuDataForm[groupmenuTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		return groupmenuDataForm;
  }

  const doOpenNewGroupmenuForm = function(shopData, workAreaBox) {
		let newGroupmenuForm = doCreateNewGroupmenuForm();
    let radNewGroupmenuFormBox = $('<div></div>');
    $(radNewGroupmenuFormBox).append($(newGroupmenuForm));
    const newgroupmenuformoption = {
      title: 'เพิ่มกลุ่มเมนูใหม่เข้าร้าน',
      msg: $(radNewGroupmenuFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newGroupmenuFormObj = doVerifyGroupmenuForm();
        if (newGroupmenuFormObj) {
          let hasValue = newGroupmenuFormObj.hasOwnProperty('GroupName');
          if (hasValue){
            newGroupmenuFormBox.closeAlert();
						let params = {data: newGroupmenuFormObj, shopId: shopData.id};
            let userRes = await common.doCallApi('/api/shop/menugroup/add', params);
            if (userRes.status.code == 200) {
              $.notify("เพิ่มรายการกลุ่มเมนูสำเร็จ", "success");
              await doShowMenugroupItem(shopData, workAreaBox)
            } else if (userRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการกลุ่มเมนูได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newGroupmenuFormBox.closeAlert();
      }
    }
    let newGroupmenuFormBox = $('body').radalert(newgroupmenuformoption);
  }

  const doOpenEditGroupmenuForm = function(shopData, workAreaBox, groupmenuData) {
		let editGroupmenuForm = doCreateNewGroupmenuForm(groupmenuData);
		let radEditGroupmenuFormBox = $('<div></div>');
		$(radEditGroupmenuFormBox).append($(editGroupmenuForm));
		const editgroupmenuformoption = {
			title: 'แก้ไขกลุ่มเมนูของร้าน',
			msg: $(radEditGroupmenuFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editGroupmenuFormObj = doVerifyGroupmenuForm();
				if (editGroupmenuFormObj) {
					let hasValue = editGroupmenuFormObj.hasOwnProperty('GroupName');
					if (hasValue){
						editGroupmenuFormBox.closeAlert();
						let params = {data: editGroupmenuFormObj, id: groupmenuData.id};
						let userRes = await common.doCallApi('/api/shop/menugroup/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการกลุ่มเมนูสำเร็จ", "success");
							await doShowMenugroupItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการกลุ่มเมนูได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editGroupmenuFormBox.closeAlert();
			}
		}
		let editGroupmenuFormBox = $('body').radalert(editgroupmenuformoption);
  }

  const doDeleteGroupmenu = function(shopData, workAreaBox, groupmenuId){
    let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบกลุ่มเมนูรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบกลุ่มเมน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบกลุ่มเมนู',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let groupmenuRes = await common.doCallApi('/api/shop/menugroup/delete', {id: groupmenuId});
				if (groupmenuRes.status.code == 200) {
					$.notify("ลบรายการกลุ่มเมนูสำเร็จ", "success");
					await doShowMenugroupItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการกลุ่มเมนูได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
  }

  return {
    doShowMenugroupItem
  }
}

},{"../../../home/mod/common-lib.js":2}],13:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);
	const stock = require('./stock-cutoff.js')($);

  const menuitemTableFields = [
		{fieldName: 'MenuName', displayName: 'ชื่อเมนู', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'Desc', displayName: 'รายละเอียด', width: '20%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'MenuPicture', displayName: 'รูปเมนู', width: '10%', align: 'center', inputSize: '30', verify: false, showHeader: true},
    {fieldName: 'Price', displayName: 'ราคา', width: '6%', align: 'right', inputSize: '20', verify: true, showHeader: true},
		{fieldName: 'Unit', displayName: 'หน่วย', width: '10%', align: 'center', inputSize: '30', verify: true, showHeader: true}
	];
  const menugroupTableFields = [
		{fieldName: 'GroupName', displayName: 'กลุ่ม', width: '10%', align: 'center', inputSize: '30', verify: true, showHeader: true}
  ];

	const doCreateStockOptionSelect = function() {
		let optionSelector = $('<select id="StockingOption"></select>');
		$(optionSelector).append($('<option value="0">ไม่ตัดสต็อค</option>'));
		$(optionSelector).append($('<option value="1">ตัดสต็อค</option>'));
		return $(optionSelector);
	}

	const doCreateStockInCmd = function(shopData, workAreaBox, menuitem) {
		let stockInCmd = $('<input type="button" value=" นำเข้า " class="action-btn"/>');
		$(stockInCmd).on('click', (evt)=>{
			stock.doOpenStockInForm(shopData, workAreaBox, menuitem);
		});
		return $(stockInCmd);
	}

	const doCreateStockCutoffDateOptionSelect = function() {
		let optionSelector = $('<select id="StockCutoffDateOption"></select>');
		$(optionSelector).append($('<option value="1D">1 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="2D">2 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="3D">3 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="5D">5 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="7D">7 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="10D">10 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="15D">15 วันที่แล้ว</option>'));
		$(optionSelector).append($('<option value="1M">1 เดือนที่แล้ว</option>'));
		$(optionSelector).append($('<option value="2M">2 เดือนที่แล้ว</option>'));
		$(optionSelector).append($('<option value="3M">3 เดือนที่แล้ว</option>'));
		$(optionSelector).append($('<option value="6M">6 เดือนที่แล้ว</option>'));
		$(optionSelector).append($('<option value="1Y">1 ปีที่แล้ว</option>'));
		$(optionSelector).append($('<option value="2Y">2 ปีที่แล้ว</option>'));
		$(optionSelector).append($('<option value="3Y">3 ปีที่แล้ว</option>'));
		$(optionSelector).append($('<option value="4Y">4 ปีที่แล้ว</option>'));
		$(optionSelector).append($('<option value="5Y">5 ปีที่แล้ว</option>'));
		return $(optionSelector);
	}

	const doCreateCheckStockCmd = function(shopData, workAreaBox, menuitem, row) {
		let checkCtockCmd = $('<input type="button" value=" เช็ค " class="action-btn"/>');
		$(checkCtockCmd).on('click', (evt)=>{
			$('#TitlePageBox').text('เช็คสต็อครายการสินค้า');
			$('#NewMenuitemCmdBox').hide();
			$('.menuitem-row').hide();
			$(row).show();
			$(row).css({'background-color': 'gray', 'color': 'white'});
			$(row).find('input[type="button"]').hide();
			let commandCell = $(row).find('#CommandCell');
			$(commandCell).find('img').hide();

			let cutoffDateBox = $('<div id="CutoffDateBox"></div>');
			let cutoffDateSelector = doCreateStockCutoffDateOptionSelect();
			let fromDateText = $('<span>ตั้งแต่</span>');
			$(cutoffDateBox).append($(fromDateText)).append($(cutoffDateSelector).css({'margin-left': '4px'}));
			$(cutoffDateSelector).on('change', async (evt)=>{
				$('#StockTable').remove();
				$('#NavigBar').remove();
				let cutoffDateValue = $(cutoffDateSelector).val();
				let cutoffDate = common.findCutoffDateFromDateOption(cutoffDateValue);
				let orderDateFmt = common.doFormatDateStr(new Date(cutoffDate));
				cutoffDate = new Date(cutoffDate);
				let params = {cutoffDate: cutoffDate};
				let stockCutoffUrl = '/api/shop/stocking/list/by/menuitem/' + menuitem.id;
				let stockRes = await common.doCallApi(stockCutoffUrl, params);
				let stockTable = await stock.doRenderCutoffStockTable(workAreaBox, 0, 0, cutoffDate, stockRes, menuitem);
			});

			let backMenuitemCmd = $('<input type="button" value=" Back " class="action-btn"/>').css({'margin-top': '4px'});
			$(backMenuitemCmd).on('click', (evt)=>{
				$(cutoffDateBox).remove();
				$(backMenuitemCmd).remove();
				$('#StockTable').remove();
				$('#NavigBar').remove();
				$('#TitlePageBox').text('รายการสินค้าของร้าน');
				$('#NewMenuitemCmdBox').show();
				$('.menuitem-row').show();
				$(row).css({'background-color': '', 'color': ''});
				$(row).find('input[type="button"]').show();
				$(commandCell).find('img').show();
			});

			$(commandCell).append($(cutoffDateBox)).append($(backMenuitemCmd));
			$(cutoffDateSelector).change();
		});
		return $(checkCtockCmd);
	}

  const doShowMenuitemItem = function(shopData, workAreaBox, groupId){
    return new Promise(async function(resolve, reject) {
			let stockingOptionIndex = await menuitemTableFields.findIndex((item) =>{
				return (item.fieldName == 'StockingOption');
			});
			if (stockingOptionIndex > -1) {
				menuitemTableFields.splice(stockingOptionIndex, 1);
			}

			if (parseInt(shopData.Shop_StockingOption) == 1) {
				menuitemTableFields.push({fieldName: 'StockingOption', displayName: 'Stock', width: '10%', align: 'center', inputSize: '30', verify: true, showHeader: true});
			}

      let menugroupRes = await common.doCallApi('/api/shop/menugroup/options/' + shopData.id, {});
      let menugroups = menugroupRes.Options;
      localStorage.setItem('menugroups', JSON.stringify(menugroups));

      $(workAreaBox).empty();
			let listParams = {};
			if (groupId) {
				listParams.groupId = groupId;
			}
      let menuitemRes = await common.doCallApi('/api/shop/menuitem/list/by/shop/' + shopData.id, listParams);
			let menuitemItems = menuitemRes.Records;
      let titlePageBox = $('<div id="TitlePageBox" style="padding: 4px;">รายการสินค้าของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
      $(workAreaBox).append($(titlePageBox));
      let newMenuitemCmdBox = $('<div id="NewMenuitemCmdBox" style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
      let newMenuitemCmd = $('<input type="button" value=" + New Menu " class="action-btn"/>');
      $(newMenuitemCmd).on('click', (evt)=>{
        doOpenNewMenuitemForm(shopData, workAreaBox, groupId);
      });
			let menugroupFilter = $('<select></select>');
			$(menugroupFilter).append($('<option value="0">All</option>'));
			menugroups.forEach((item, i) => {
				$(menugroupFilter).append($('<option value="' +item.Value + '">' + item.DisplayText + '</option>'));
			});
			if (groupId) {
				$(menugroupFilter).val(groupId);
			}
			$(menugroupFilter).on('change', async (evt)=>{
				let selectGroupId = $(menugroupFilter).val();
				if (selectGroupId != 0) {
					await doShowMenuitemItem(shopData, workAreaBox, selectGroupId);
				} else {
					await doShowMenuitemItem(shopData, workAreaBox);
				}
			});

			let readySwitch = undefined;
			let stockFilter = false;
			if (parseInt(shopData.Shop_StockingOption) == 1) {
				let readySwitchBox = $('<div id="ReadyState" style="position: relative; display: inline-block; top: -4px;"></div>');
				let readyOption = {switchTextOnState: 'กรองเฉพาะที่ตัดสต็อค', switchTextOffState: 'ไม่กรอง(แสดงทั้งหมด)',
					onActionCallback: async ()=>{
						stockFilter = true;
						$(menuitemTable).remove()
						doRenderMenuitemTable();
						$(workAreaBox).append($(menuitemTable));
					},
					offActionCallback: async ()=>{
						stockFilter = false;
						$(menuitemTable).remove()
						doRenderMenuitemTable();
						$(workAreaBox).append($(menuitemTable));
					}
				};
				readySwitch = $(readySwitchBox).readystate(readyOption);
				readySwitch.offAction();
				$(newMenuitemCmdBox).append($(readySwitchBox));
      	$(newMenuitemCmdBox).append($(menugroupFilter).css({'margin-left': '10px'})).append($(newMenuitemCmd).css({'margin-left': '10px'}));
			} else {
      	$(newMenuitemCmdBox).append($(menugroupFilter)).append($(newMenuitemCmd).css({'margin-left': '10px'}));
			}
      $(workAreaBox).append($(newMenuitemCmdBox));


			let menuitemTable = undefined;

			const doRenderMenuitemTable = function() {
				menuitemTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
				let headerRow = $('<tr></tr>');
				$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
				for (let i=0; i < menuitemTableFields.length; i++) {
	        if (menuitemTableFields[i].showHeader) {
	          $(headerRow).append($('<td width="' + menuitemTableFields[i].width + '" align="center"><b>' + menuitemTableFields[i].displayName + '</b></td>'));
	        }
				}
	      for (let i=0; i < menugroupTableFields.length; i++) {
	        if (menugroupTableFields[i].showHeader) {
	          $(headerRow).append($('<td width="' + menugroupTableFields[i].width + '" align="center"><b>' + menugroupTableFields[i].displayName + '</b></td>'));
	        }
				}
				$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
				$(menuitemTable).append($(headerRow));

				let unRenderCount = 0;

	      for (let x=0; x < menuitemItems.length; x++) {
					let item = menuitemItems[x];
					let stockingOption = item.StockingOption;
					let isRendeItem = (!stockFilter) || (!stockingOption) || ((stockFilter) && (parseInt(stockingOption) == 1));
					if (isRendeItem) {
						let itemRow = $('<tr class="menuitem-row"></tr>');
						$(itemRow).append($('<td align="center">' + (x + 1 - unRenderCount) + '</td>'));
						for (let i=0; i < menuitemTableFields.length; i++) {
							let field = $('<td align="' + menuitemTableFields[i].align + '"></td>');
							if (menuitemTableFields[i].fieldName !== 'MenuPicture') {
								if (menuitemTableFields[i].fieldName !== 'StockingOption') {
									$(field).text(item[menuitemTableFields[i].fieldName]);
								} else {
									let stockStateText = $('<div></div>');
									if (parseInt(stockingOption) == 0) {
										$(stockStateText).text('ไม่ตัดสต็อค');
										$(field).append($(stockStateText));
									} else if (parseInt(stockingOption) == 1) {
										$(stockStateText).text('ตัดสต็อค');
										$(field).append($(stockStateText));
										let stockInCmd = doCreateStockInCmd(shopData, workAreaBox, item);
										let checkStockCmd = doCreateCheckStockCmd(shopData, workAreaBox, item, itemRow);
										$(field).append($(stockInCmd)).append($(checkStockCmd).css({'margin-left': '4px'}));
									}
								}
								$(itemRow).append($(field));
							} else {
								let menuitemLogoIcon = new Image();
								menuitemLogoIcon.id = 'MenuPicture_' + item.id;
								if ((item['MenuPicture']) && (item['MenuPicture'] !== '')) {
									menuitemLogoIcon.src = item['MenuPicture'];
								} else {
									menuitemLogoIcon.src = '/shop/favicon.ico'
								}
								$(menuitemLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
								$(menuitemLogoIcon).on('click', (evt)=>{
									window.open(item['MenuPicture'], '_blank');
								});

								let menuItemLogoIconBox = $('<div></div>').css({"position": "relative", "width": "fit-content", "border": "2px solid #ddd"});
						    $(menuItemLogoIconBox).append($(menuitemLogoIcon));
								let editMenuItemLogoCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'position': 'absolute', 'width': '25px', 'height': 'auto', 'cursor': 'pointer', 'right': '2px', 'bottom': '2px', 'display': 'none', 'z-index': '21'});
								$(editMenuItemLogoCmd).attr('title', 'เปลี่ยนภาพใหม่');
								$(menuItemLogoIconBox).append($(editMenuItemLogoCmd));
								$(menuItemLogoIconBox).hover(()=>{
									$(editMenuItemLogoCmd).show();
								},()=>{
									$(editMenuItemLogoCmd).hide();
								});
								$(editMenuItemLogoCmd).on('click', (evt)=>{
									evt.stopPropagation();
									doStartUploadPicture(evt, menuitemLogoIcon, field, item.id, shopData, workAreaBox, groupId);
								});
								$(field).append($(menuItemLogoIconBox));

								let clearMenuitemLogoCmd = $('<input type="button" value=" เคลียร์รูป " class="action-btn"/>');
								$(clearMenuitemLogoCmd).on('click', async (evt)=>{
									let callRes = await common.doCallApi('/api/shop/menuitem/change/logo', {data: {MenuPicture: ''}, id: item.id});
									menuitemLogoIcon.src = '/shop/favicon.ico'
								});
								$(field).append($('<div style="width: 100%;"></div>').append($(clearMenuitemLogoCmd)));
								$(itemRow).append($(field));
							}
						}
		        for (let i=0; i < menugroupTableFields.length; i++) {
		          let field = $('<td align="' + menugroupTableFields[i].align + '"></td>');
							if ((item.menugroup.GroupPicture) && (item.menugroup.GroupPicture !== '')) {
								let menuGroupLogoIconBox = $('<div></div>').css({"position": "relative", "width": "fit-content", "border": "2px solid #ddd"});
								let groupLogoImg = new Image();
								groupLogoImg.src = item.menugroup.GroupPicture;
								$(groupLogoImg).attr('title', item.menugroup[menugroupTableFields[i].fieldName]);
								$(groupLogoImg).css({"width": "80px", "height": "auto"})
								$(menuGroupLogoIconBox).append($(groupLogoImg));
								$(field).append($(menuGroupLogoIconBox));
							}
		          $(field).append($('<div style="position: relative; display: block;">' + item.menugroup[menugroupTableFields[i].fieldName] + '</div>'));
		          $(itemRow).append($(field));
		        }

						let qrcodeImg = new Image();
						qrcodeImg.id = 'MenuQRCode_' + item.id;
						if ((item.QRCodePicture) && (item.QRCodePicture != '')) {
							let qrLink = '/shop/img/usr/qrcode/' + item.QRCodePicture + '.png';
			      	qrcodeImg.src = qrLink;
							// open dialog for print qrcode
							$(qrcodeImg).attr('title', 'พิมพ์คิวอาร์โค้ดรายการนี้');
							$(qrcodeImg).css({'width': '55px', 'height': 'auto', 'cursor': 'pointer'});
							$(qrcodeImg).on('click', (evt)=>{
								doOpenQRCodePopup(evt, item.id, item.QRCodePicture, qrLink);
							});
						} else {
							qrcodeImg.src = '../../images/scan-qrcode-icon.png';
							$(qrcodeImg).attr('title', 'สร้างคิวอาร์โค้ดให้รายการนี้');
							$(qrcodeImg).css({'width': '45px', 'height': 'auto', 'cursor': 'pointer'});
							// generate new qrcode
							$(qrcodeImg).on('click', async (evt)=>{
								await doCreateNewQRCode(evt, item.id);
							});
						}
						let menuitemQRCodeBox = $('<div></div>').css({'text-align': 'center'}).append($(qrcodeImg));

						let editMenuitemCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
						$(editMenuitemCmd).on('click', (evt)=>{
							doOpenEditMenuitemForm(shopData, workAreaBox, item, groupId);
						});
						let deleteMenuitemCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
						$(deleteMenuitemCmd).on('click', (evt)=>{
							doDeleteMenuitem(shopData, workAreaBox, item.id, groupId);
						});
						let menuitemBtnBox = $('<div></div>').css({'text-align': 'center'}).append($(editMenuitemCmd)).append($(deleteMenuitemCmd));

						let commandCell = $('<td id="CommandCell" align="center"></td>');
						$(commandCell).append($(menuitemQRCodeBox));
						$(commandCell).append($(menuitemBtnBox));
						$(itemRow).append($(commandCell));
						$(menuitemTable).append($(itemRow));
					} else {
						unRenderCount += 1;
					}
				}
			}

			doRenderMenuitemTable();

      $(workAreaBox).append($(menuitemTable));
      resolve();
    });
  }

  const doStartUploadPicture = function(evt, menuitemLogoIcon, imageBox, itemId, shopData, workAreaBox, groupId){
    let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'menuitemlogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      const defSize = 10000000;
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= defSize) {
        doUploadImage(fileBrowser, menuitemLogoIcon, fileType, itemId, shopData, workAreaBox, groupId);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + defSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
  }

  const doUploadImage = function(fileBrowser, menuitemLogoIcon, fileType, itemId, shopData, workAreaBox, groupId){
    var uploadUrl = '/api/shop/upload/menuitemlogo';
		//$('body').loading('start');
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
        let shopRes = await common.doCallApi('/api/shop/menuitem/change/logo', {data: {MenuPicture: data.link}, id: itemId});
        setTimeout(async() => {
          await doShowMenuitemItem(shopData, workAreaBox, groupId);
					$('body').loading({message: undefined});
					$('body').loading('stop');
        }, 400);
      },
			progress: function(progress){
				$('body').loading({message: Math.round(progress) + ' %'});
			}
			//https://www.npmjs.com/package/jquery-simple-upload
    });
  }

  const doCreateNewMenuitemForm = function(menuitemData, groupId){
    let menuitemFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < menuitemTableFields.length; i++) {
      if (menuitemTableFields[i].fieldName !== 'MenuPicture') {
  			let fieldRow = $('<tr></tr>');
  			let labelField = $('<td width="40%" align="left">' + menuitemTableFields[i].displayName + (menuitemTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
  			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
  			let inputValue = undefined;
				if (menuitemTableFields[i].fieldName === 'StockingOption') {
					inputValue = doCreateStockOptionSelect();
				} else {
					inputValue = $('<input type="text" id="' + menuitemTableFields[i].fieldName + '" size="' + menuitemTableFields[i].inputSize + '"/>');
				}
  			if ((menuitemData) && (menuitemData[menuitemTableFields[i].fieldName])) {
  				$(inputValue).val(menuitemData[menuitemTableFields[i].fieldName]);
  			}
  			$(inputField).append($(inputValue));
  			$(fieldRow).append($(labelField));
  			$(fieldRow).append($(inputField));
  			$(menuitemFormTable).append($(fieldRow));
      }
		}
		if ((menuitemData) && (menuitemData.Qty)) {
    	let fieldRow = $('<tr></tr>');
			let labelField = $('<td width="40%" align="left">จำนวน <span style="color: red;">*</span></td>').css({'padding': '5px'});
			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
			let inputValue = $('<input type="number" id="Qty" size="10"/>');
			$(inputValue).val(menuitemData.Qty);
			$(inputField).append($(inputValue));
			$(fieldRow).append($(labelField));
			$(fieldRow).append($(inputField));
			$(menuitemFormTable).append($(fieldRow));
		}

		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">กลุ่มเมนู <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputValue = $('<select id="GroupId"></select>');
		let menugroups = JSON.parse(localStorage.getItem('menugroups'));
		let firstGroupId = undefined;
		menugroups.forEach((item, i) => {
			$(inputValue).append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
			if (i == 0) {
				firstGroupId = item.Value;
			}
		});
		$(inputField).append($(inputValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(menuitemFormTable).append($(fieldRow));

		if (groupId) {
			$(inputValue).val(groupId);
		} else if ((menuitemData) && (menuitemData.menugroupId)){
			$(inputValue).val(menuitemData.menugroupId);
		} else {
			$(inputValue).val(firstGroupId);
		}

		return $(menuitemFormTable);
  }

  const doVerifyMenuitemForm = function(){
    let isVerify = true;
		let menuitemDataForm = {};
		for (let i=0; i < menuitemTableFields.length; i++) {
			let curValue = $('#'+menuitemTableFields[i].fieldName).val();
			if (menuitemTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+menuitemTableFields[i].fieldName).css({'border': ''});
					menuitemDataForm[menuitemTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+menuitemTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					menuitemDataForm[menuitemTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		menuitemDataForm.Qty = $('#Qty').val();
    menuitemDataForm.menugroupId = $('#GroupId').val();
		return menuitemDataForm;
  }

  const doOpenNewMenuitemForm = function(shopData, workAreaBox, groupId){
    let newMenuitemForm = doCreateNewMenuitemForm({menugroupId: groupId}, groupId);
    let radNewMenuitemFormBox = $('<div></div>');
    $(radNewMenuitemFormBox).append($(newMenuitemForm));
    const newmenuitemformoption = {
      title: 'เพิ่มเมนูใหม่เข้าร้าน',
      msg: $(radNewMenuitemFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newMenuitemFormObj = doVerifyMenuitemForm();
        if (newMenuitemFormObj) {
          let hasValue = newMenuitemFormObj.hasOwnProperty('MenuName');
          if (hasValue){
            newMenuitemFormBox.closeAlert();
						let params = {data: newMenuitemFormObj, shopId: shopData.id, groupId: newMenuitemFormObj.groupId};
            let menuitemRes = await common.doCallApi('/api/shop/menuitem/add', params);
            if (menuitemRes.status.code == 200) {
              $.notify("เพิ่มรายการสินค้าสำเร็จ", "success");
              await doShowMenuitemItem(shopData, workAreaBox, groupId)
            } else if (menuitemRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการสินค้าได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newMenuitemFormBox.closeAlert();
      }
    }
    let newMenuitemFormBox = $('body').radalert(newmenuitemformoption);
  }

  const doOpenEditMenuitemForm = function(shopData, workAreaBox, menuitemData, groupId){
    let editMenuitemForm = doCreateNewMenuitemForm(menuitemData, groupId);
		let radEditMenuitemFormBox = $('<div></div>');
		$(radEditMenuitemFormBox).append($(editMenuitemForm));
		const editmenuitemformoption = {
			title: 'แก้ไขเมนูของร้าน',
			msg: $(radEditMenuitemFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editMenuitemFormObj = doVerifyMenuitemForm();
				if (editMenuitemFormObj) {
					let hasValue = editMenuitemFormObj.hasOwnProperty('MenuName');
					if (hasValue){
						editMenuitemFormBox.closeAlert();
						let params = {data: editMenuitemFormObj, id: menuitemData.id};
						let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
						if (menuitemRes.status.code == 200) {
							$.notify("แก้ไขรายการสินค้าสำเร็จ", "success");
							await doShowMenuitemItem(shopData, workAreaBox, groupId)
						} else if (menuitemRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการสินค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editMenuitemFormBox.closeAlert();
			}
		}
		let editMenuitemFormBox = $('body').radalert(editmenuitemformoption);
  }

  const doDeleteMenuitem = function(shopData, workAreaBox, menuitemId, groupId){
    let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบเมนูรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบเมน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบเมนู',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let menuitemRes = await common.doCallApi('/api/shop/menuitem/delete', {id: menuitemId});
				if (menuitemRes.status.code == 200) {
					$.notify("ลบรายการสินค้าสำเร็จ", "success");
					await doShowMenuitemItem(shopData, workAreaBox, groupId);
				} else if (menuitemRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการสินค้าได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
  }

	const doOpenQRCodePopup = function(evt, menuId, qrCodeName, qrLink) {
		 printJS(qrLink, 'image');
	}

	const doCreateNewQRCode = function(evt, menuId) {
		return new Promise(async function(resolve, reject) {
			let callUrl = '/api/shop/menuitem/qrcode/create/' + menuId;
			let qrRes = await common.doCallApi(callUrl, {id: menuId});
			let qrcodeImg = evt.currentTarget;
			qrcodeImg.src = qrRes.qrLink;
			$(qrcodeImg).attr('title', 'พิมพ์คิวอาร์โค้ดรายการนี้');
			$(qrcodeImg).css({'width': '55px', 'height': 'auto', 'cursor': 'pointer'});
			$(qrcodeImg).on('click', (evt)=>{
				doOpenQRCodePopup(evt, menuId, qrRes.qrName, qrRes.qrLink);
			});
			resolve(qrRes);
		});
	}


  return {
    doShowMenuitemItem,
		doCreateNewMenuitemForm,
		doVerifyMenuitemForm
  }
}

},{"../../../home/mod/common-lib.js":2,"./stock-cutoff.js":20}],14:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

	const jqteConfig = {format: false, fsize: false, ol: false, ul: false, indent: false, outdent: false,
		link: true, unlink: true, remove: true, /*br: false,*/ strike: false, rule: false,
		sub: false, sup: false, left: true, center: true, right: true /*, source: false
		change: onSimpleEditorChange */
	};

	const doCreateTitlePage = function(shopData) {
		let titlePageBox = $('<div style="padding: 4px;"></viv>').css({'width': '99.25%', 'height': '45px', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
		$(titlePageBox).text('รายการข้อความข่าวสารของร้าน');
		return $(titlePageBox);
	}

	const doCreateMessagesTable = function(shopData, loadUrl) {
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let myMessageUrl = undefined;
			if ((loadUrl) && (loadUrl !== '')) {
				myMessageUrl = loadUrl;
			} else {
				myMessageUrl = '/api/shop/message/shop/load/' + shopData.id
			}
			let params = {shopId: shopData.id};
			let msgRes = await common.doCallApi(myMessageUrl, params);
			console.log(msgRes);
			let msgTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let dataRow = $('<tr style="background-color: lightgrey"></tr>');
			let datetimeCell = $('<td width="20%" align="center"><b>วันที่-เวลา</b></td>');
			let msgCell = $('<td width="50%" align="center"><b>ข้อความ/ข่าวสาร</b></td>');
			let fromCell = $('<td width="10%" align="center"><b>จาก</b></td>');
			let statusCell = $('<td width="*" align="center"><b>สถานะข้อความ</b></td>');
			$(dataRow).append($(datetimeCell)).append($(msgCell)).append($(fromCell)).append($(statusCell));
			$(msgTable).append($($(dataRow)));
			for (let i=0; i<msgRes.Records.length; i++) {
				let msg = msgRes.Records[i];
				let msgDate = new Date(msg.createdAt);
				let fmtDate = common.doFormatDateStr(msgDate);
				let fmtTime = common.doFormatTimeStr(msgDate);

				let fmUserFullname = undefined;
				if ((msg.userinfo.User_NameTH !== '') && (msg.userinfo.User_LastNameTH !== '')) {
					fmUserFullname = msg.userinfo.User_NameTH + ' ' + msg.userinfo.User_LastNameTH;
				} else {
					fmUserFullname = msg.userinfo.User_NameEN + ' ' + msg.userinfo.User_LastNameEN;
				}

				let msgStatus = undefined;
				if (msg.Status == 1) {
					msgStatus = 'New';
					doUpdateMessageOpen(shopData, msg);
				} else if (msg.Status == 2) {
					msgStatus = 'Open';
				} else if (msg.Status == 3) {
					msgStatus = 'Close';
				}
				datetimeCell = $('<td align="left"></td>').text(fmtDate + ' : ' + fmtTime);
				msgCell = $('<td align="left"></td>').html(msg.Message);
				fromCell = $('<td align="left"></td>').text(fmUserFullname);
				statusCell = $('<td align="center"></td>').append($('<span>' + msgStatus + '</span>'));

				if ((userdata.id == 1) && (userdata.shopId == 1)) {
					let editMessageCmd = common.doCreateTextCmd('แก้ไข', 'blue', 'white');
					$(editMessageCmd).on('click', async(evt)=>{
						await doOpenUpdateMessageForm(shopData, msg)
					});
					let deleteMessageCmd = common.doCreateTextCmd('ลบ', 'red', 'white');
					$(deleteMessageCmd).on('click', (evt)=>{
						doDeleteMessage(shopData, msg);
					});

					$(statusCell).append($(editMessageCmd).css({'margin-left': '5px'})).append($(deleteMessageCmd).css({'margin-left': '5px'}));

					if ((msg.Status == 2) || (msg.Status == 3)) {
						let resetMessageCmd = common.doCreateTextCmd('รีเซ็ต', 'green', 'white');
						$(resetMessageCmd).on('click', (evt)=>{
							doResetMessage(shopData, msg);
						});
						$(statusCell).append($(resetMessageCmd).css({'margin-left': '5px'}));
					}
				}

				if (msg.Status == 2) {
					let closeMessageCmd = common.doCreateTextCmd('ปิด', 'black', 'white');
					$(closeMessageCmd).on('click', (evt)=>{
						doCloseMessage(shopData, msg);
					});
					$(statusCell).append($(closeMessageCmd).css({'margin-left': '5px'}))
				}

				dataRow = $('<tr height="50"></tr>');
				$(dataRow).append($(datetimeCell)).append($(msgCell)).append($(fromCell)).append($(statusCell));
				$(msgTable).append($($(dataRow)));
			}
			resolve($(msgTable));
		});
	}

  const doShowMyMesaage = function(shopData, workAreaBox) {
    return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
      $(workAreaBox).empty();
			let titleBox = doCreateTitlePage(shopData);
			$(workAreaBox).append($(titleBox));
			if ((userdata.id == 1) && (userdata.shopId == 1)) {
				let addNewMessageCmd = common.doCreateTextCmd('สร้างข้อความใหม', 'green', 'white');
				$(addNewMessageCmd).on('click', (evt)=>{
					doOpenNewMessageForm(shopData);
				});
				let showAllMessageCmd = common.doCreateTextCmd('แสดงข้อความทั้งหมด', 'grey', 'white');
				$(showAllMessageCmd).on('click', async (evt)=>{
					$(msgTable).remove();
					let loadAllMessageUrl = '/api/shop/message/shop/loadall/' + shopData.id
					msgTable = await doCreateMessagesTable(shopData, loadAllMessageUrl);
					$(workAreaBox).append($(msgTable).css({'margin-top': '5px'}));
				});
				let addNewMessageBar = $('<div></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'right', 'margin-top': '10px'});
				$(addNewMessageBar).append($(showAllMessageCmd)).append($(addNewMessageCmd).css({'margin-left': '5px'}));
				$(workAreaBox).append($(addNewMessageBar));
			}
			let msgTable = await doCreateMessagesTable(shopData);
			$(workAreaBox).append($(msgTable).css({'margin-top': '5px'}));
			$('#App').find('#SummaryBox').remove();
      resolve();
    });
  }

	const doCreateNewMessageForm = async function(shopData, oldMessage) {
		return new Promise(async function(resolve, reject) {
			let shopListUrl = '/api/shop/shop/options';
			let params = {};
			let shops = await common.doCallApi(shopListUrl, params);
			let shopListSelect = $('<select id="ToShopId"></select>');
			shops.Options.forEach((item, i) => {
				if (oldMessage) {
					if (item.Value == oldMessage.ToShopId) {
						$(shopListSelect).append($('<option></option>').text(item.DisplayText).val(item.Value).prop('selected', true));
					} else {
						$(shopListSelect).append($('<option></option>').text(item.DisplayText).val(item.Value));
					}
				} else {
					$(shopListSelect).append($('<option></option>').text(item.DisplayText).val(item.Value));
				}
			});

			let jqtePluginStyleUrl = '../lib/jqte/jquery-te-1.4.0.css';
			$('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
			let jqtePluginScriptUrl = '../lib/jqte/jquery-te-1.4.0.min.js';
			$('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

			let mainBox = $('<table width="100%" cellspacing="0" cellpadding="4" border="0"></table>');
			let row = $('<tr></tr>');
			let leftCell = $('<td width="25%" align="left">ส่งถึง</td>');
			let rightCell = $('<td width="*" align="left"></td>').append($($(shopListSelect)));
			$(row).append($(leftCell)).append($(rightCell));
			$(mainBox).append($(row));
			row = $('<tr></tr>');
			leftCell = $('<td align="left">ข้อความ</td>');
			rightCell = $('<td align="left"></td>');

			let simpleEditorConfig  = $.extend({}, jqteConfig);
			let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
			$(simpleEditor).appendTo($(rightCell));
			$(simpleEditor).jqte(simpleEditorConfig);

			$(rightCell).find('.jqte_editor').css({ height: '100px', width: '350px' });
			if (oldMessage) {
				$(rightCell).find('#SimpleEditor').jqteVal(oldMessage.Message);
			}
			$(row).append($(leftCell)).append($(rightCell));
			$(mainBox).append($(row));

			resolve($(mainBox));
		});
	}

	const doOpenNewMessageForm = function(shopData) {
		return new Promise(async function(resolve, reject) {
			let messageForm = await doCreateNewMessageForm(shopData);
			$(messageForm).css({'margin-top': '10px'})
			let messageFormDlgOption = {
				title: 'ป้อนข้อมูลเพื่อส่งข้อความใหม่',
				msg: $(messageForm),
				width: '465px',
				onOk: function(evt) {
					let newMessageUrl = '/api/shop/message/add';
					let toShopId = $('#ToShopId').val();
					let message = $('#SimpleEditor').val();
					let userdata = JSON.parse(localStorage.getItem('userdata'));
					let params = {data: {ToShopId: toShopId, Message: message, Status: 1}, shopId: userdata.shopId, userId: userdata.id, userinfoId: userdata.userinfo.id};
					console.log(params);

					common.doCallApi(newMessageUrl, params).then(async(msgRes)=>{
						console.log(msgRes);
						$.notify("ส่งข้อความสำเร็จ", "success");
						dlgHandle.closeAlert();
						let workingAreaBox = $('#WorkingAreaBox');
						await doShowMyMesaage(shopData, workingAreaBox);
					});
				},
				onCancel: function(evt) {
					dlgHandle.closeAlert();
				}
			}
			let dlgHandle = $('body').radalert(messageFormDlgOption);
			resolve();
		});
	}

	const doOpenUpdateMessageForm = function(shopData, oldMessage) {
		return new Promise(async function(resolve, reject) {
			let messageForm = await doCreateNewMessageForm(shopData, oldMessage);
			$(messageForm).css({'margin-top': '10px'});
			let messageFormDlgOption = {
				title: 'แก้ไขข้อความ',
				msg: $(messageForm),
				width: '465px',
				onOk: function(evt) {
					let updateMessageUrl = '/api/shop/message/update';
					//let toShopId = $('#ToShopId').val();
					let message = $('#SimpleEditor').val();
					let userdata = JSON.parse(localStorage.getItem('userdata'));
					let params = {data: {Message: message}, id: oldMessage.id};
					console.log(params);
					common.doCallApi(updateMessageUrl, params).then(async(msgRes)=>{
						console.log(msgRes);
						$.notify("บันทึกการแก้ไขข้อความสำเร็จ", "success");
						dlgHandle.closeAlert();
						let workingAreaBox = $('#WorkingAreaBox');
						await doShowMyMesaage(shopData, workingAreaBox);
					});
				},
				onCancel: function(evt) {
					dlgHandle.closeAlert();
				}
			}
			let dlgHandle = $('body').radalert(messageFormDlgOption);
			$('#ToShopId').prop('disabled', true);
			resolve();
		});
	}

	const doDeleteMessage = function(shopData, msg) {
		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<p>คุณต้องการลบข้อความ/ข่าวสารใช่ไหม?</p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบข้อความ/ข่าวสาร',
			msg: $(radAlertMsg),
			width: '320px',
			onOk: function(evt) {
				let deleteMessageUrl = '/api/shop/message/delete';
				let params = {id: msg.id};
				console.log(params);
				common.doCallApi(deleteMessageUrl, params).then(async(msgRes)=>{
					console.log(msgRes);
					$.notify("ลบข้อความสำเร็จ", "success");
					dlgHandle.closeAlert();
					let workingAreaBox = $('#WorkingAreaBox');
					await doShowMyMesaage(shopData, workingAreaBox);
				});
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(radconfirmoption);
	}

	const doCloseMessage = function(shopData, msg) {
		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<p>คุณต้องการปิดข้อความ/ข่าวสารใช่ไหม?</p>'));
		$(radAlertMsg).append($('<p>ข้อความ/ข่าวสารที่ต้องการปิดจะไม่แสดงในหน้านี้อีกต่อไป</p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการปิดข้อความ/ข่าวสาร',
			msg: $(radAlertMsg),
			width: '320px',
			onOk: function(evt) {
				let closeMessageUrl = '/api/shop/message/update';
				let params = {data: {Status: 3}, id: msg.id};
				//console.log(params);
				common.doCallApi(closeMessageUrl, params).then(async(msgRes)=>{
					//console.log(msgRes);
					$.notify("ปิดข้อความแล้ว", "success");
					dlgHandle.closeAlert();
					let workingAreaBox = $('#WorkingAreaBox');
					await doShowMyMesaage(shopData, workingAreaBox);

					let myMessageUrl = '/api/shop/message/month/new/count/' + shopData.id
					params = {userId: userdata.id};
					let countRes = await common.doCallApi(myMessageUrl, params);
					if (countRes.count > 0) {
						$('#MessageAmount').text(countRes.count);
					} else {
						$('#MessageAmount').hide();
					}

				});
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(radconfirmoption);
	}

	const doUpdateMessageOpen = function(shopData, msg) {
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let closeMessageUrl = '/api/shop/message/update';
		let params = {data: {Status: 2}, id: msg.id};
		//console.log(params);
		common.doCallApi(closeMessageUrl, params).then(async(msgRes)=>{
			//console.log(msgRes);
			let myMessageUrl = '/api/shop/message/month/new/count/' + shopData.id
			params = {userId: userdata.id};
			let countRes = await common.doCallApi(myMessageUrl, params);
			if (countRes.count > 0) {
				$('#MessageAmount').text(countRes.count);
			} else {
				$('#MessageAmount').hide();
			}
		});
	}

	const doResetMessage = function(shopData, msg){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let resetMessageUrl = '/api/shop/message/update';
		let params = {data: {Status: 1}, id: msg.id};
		//console.log(params);
		common.doCallApi(resetMessageUrl, params).then(async(msgRes)=>{
			//console.log(msgRes);
			let myMessageUrl = '/api/shop/message/month/new/count/' + shopData.id
			params = {userId: userdata.id};
			let countRes = await common.doCallApi(myMessageUrl, params);
			if (countRes.count > 0) {
				$('#MessageAmount').text(countRes.count);
			} else {
				$('#MessageAmount').hide();
			}
		});
	}

  return {
    doShowMyMesaage
	}
}

},{"../../../home/mod/common-lib.js":2}],15:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);

  const doExtractList = function(originList, from, to) {
		return new Promise(async function(resolve, reject) {
			let exResults = [];
			let	promiseList = new Promise(function(resolve2, reject2){
				for (let i = (from-1); i < to; i++) {
					if (originList[i]){
						exResults.push(originList[i]);
					}
				}
				setTimeout(()=>{
          resolve2(exResults);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  const doCreateOrderHistoryTable = function(workAreaBox, viewPage, startRef, fromDate){
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
      let titleText = 'ประวัติออร์เดอร์'
      let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
      let userItemPerPage = userDefualtSetting.itemperpage;
      let orderHistoryItems = JSON.parse(localStorage.getItem('customerorders'));

			let fromDateTime = undefined;
      if (fromDate) {
        fromDateTime = (new Date(fromDate)).getTime();
      } else {
				fromDate = new Date();
			  fromDate.setDate(fromDate.getDate() - 30);
				fromDateTime = (new Date(fromDate)).getTime();
				fromDate = common.doFormatDateStr(fromDate);
			}
			orderHistoryItems = await orderHistoryItems.filter((item, i) => {
				let orderDateTime = (new Date(item.createdAt)).getTime();
				if (orderDateTime >= fromDateTime) {
					return item;
				}
			});
			titleText += ' ตั้งแต่วันที่ ' + fromDate;

      let totalItem = orderHistoryItems.length;

      if (userItemPerPage != 0) {
        if (startRef > 0) {
          orderHistoryItems = await doExtractList(orderHistoryItems, (startRef+1), (startRef+userItemPerPage));
        } else {
          orderHistoryItems = await doExtractList(orderHistoryItems, 1, userItemPerPage);
        }
      }

      let historyTable = $('<table id="HistoryTable" width="100%" cellspacing="0" cellpadding="0" border="1"></table>');

      let titleRow = $('<tr></tr>').css({'background-color': 'gray', 'color': 'white'});
      let titleCol = $('<td colspan="5" align="center"></td>');
      $(titleCol).append($('<h3></h3>').text(titleText).css({'font-weight': 'bold'}));
      $(titleRow).append($(titleCol));
      $(historyTable).append($(titleRow));

      let headerRow = $('<tr></tr>');
      $(headerRow).append($('<td width="4%" align="center"><b>#</b></td>'));
      $(headerRow).append($('<td width="15%" align="center"><b>วันที่</b></td>'));
      $(headerRow).append($('<td width="45%" align="center"><b>รายการสินค้า</b></td>'));
			let billRemarkCol = $('<td width="20%" align="center"><b>บันทึกการปิดบิล</b></td>');
			$(headerRow).append($(billRemarkCol));
      let cmdCol = $('<td width="*" align="center"></td>');
      $(headerRow).append($(cmdCol));
      $(historyTable).append($(headerRow));

      let promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < orderHistoryItems.length; i++) {
          let no = (i + 1 + startRef);
          let orderHistoryItem = orderHistoryItems[i];
          let orderDate = common.doFormatDateStr(new Date(orderHistoryItem.createdAt));
          let dataRow = $('<tr></tr>');
          $(dataRow).append($('<td align="center"></td>').text(no));
          $(dataRow).append($('<td align="left"></td>').text(orderDate));
          let orderItemCol = $('<td align="left"></td>');

          for (let j=0; j < orderHistoryItem.Items.length; j++) {
            let price = Number(orderHistoryItem.Items[j].Price);
            let qty = Number(orderHistoryItem.Items[j].Qty);
            let total = price * qty;
            let orderItemRow = $('<span style="width: 100%; display: table-row;"></span>');
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 30px; text-align: center;"></span>').text((j+1)+'.'));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 180px; text-align: left;"></span>').text(orderHistoryItem.Items[j].MenuName));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 80px; text-align: center;"></span>').text(common.doFormatNumber(price)));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 40px; text-align: center;"></span>').text(common.doFormatQtyNumber(qty)));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 70px; text-align: center;"></span>').text(orderHistoryItem.Items[j].Unit));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 70px; text-align: right;"></span>').text(common.doFormatNumber(total)));
            $(orderItemCol).append($(orderItemRow));
          }
          $(dataRow).append($(orderItemCol));

					let remarkText = '';
					if (orderHistoryItem.bill) {
						remarkText = orderHistoryItem.bill.Remark;
					} else if (orderHistoryItem.taxinvoice) {
						remarkText = orderHistoryItem.taxinvoice.Remark;
					}
					if ((remarkText) && (remarkText !== '')) {
						let remarkTexts = remarkText.split('\n');
						console.log(remarkTexts);
						let remarkBox = $('<div></div>').css({'text-align': 'left'});
						await remarkTexts.forEach((line, i) => {
							$(remarkBox).append($('<p></p>').text(line).css({'line-height': '14px'}));
						});

						let remarkCell = $('<td align="center"></td>');
						$(remarkCell).append($(remarkBox));
						$(dataRow).append($(remarkCell));
					} else {
						$(dataRow).append($('<td align="center"></td>'));
					}
					$(dataRow).append($('<td align="center"></td>'));
          $(historyTable).append($(dataRow));
        }
        setTimeout(()=> {
	        resolve2(historyTable);
	      },1200);
      });
      Promise.all([promiseList]).then((ob)=> {
        let orderHostoryTable = ob[0];
        $(workAreaBox).append($(orderHostoryTable).css({'margin-top': '20px'}));

        let showPage = 1;
        if ((viewPage) && (viewPage > 0)){
          showPage = viewPage;
        }

        let pageNavigator = doCreatePageNavigatorBox(showPage, userItemPerPage, totalItem, async function(page){
          console.log(page);
          $('body').loading('start');
          $('#HistoryTable').remove();
          $('#NavigBar').remove();

					userDefualtSetting = {itemperpage: page.perPage, currentPage: showPage};
          localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));

          let toPage = Number(page.toPage);
          let newStartRef = Number(page.fromItem);
          orderHostoryTable = await doCreateOrderHistoryTable(workAreaBox, toPage, newStartRef, fromDate)
          $('body').loading('stop');
        })
        $(workAreaBox).append($(pageNavigator).css({'margin-top': '2px'}));

  			resolve(orderHostoryTable);
        $('body').loading('stop');
  		});
    });
  }

  const doCreatePageNavigatorBox = function(showPage, userItemPerPage, totalItem, callback) {
    let navigBarBox = $('<div id="NavigBar"></div>');
    let navigBarOption = {
      currentPage: showPage,
      itemperPage: userItemPerPage,
      totalItem: totalItem,
      styleClass : {'padding': '4px', 'margin-top': '60px'},
      changeToPageCallback: callback
    };
    let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
    //navigatoePage.toPage(1);
    return $(navigBarBox);
  }

  return {
    doCreateOrderHistoryTable,
    doCreatePageNavigatorBox
  }
}

},{"../../../home/mod/common-lib.js":2}],16:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

	let dlgHandle = undefined;

	const orderSelectCallback = function(evt, orders, srcIndex, destIndex, mergeSuccessCallback) {
		let	promiseList = new Promise(async function(resolve2, reject2){
			for (let i=0; i < orders[srcIndex].Items.length; i++) {
				srcItemId = orders[srcIndex].Items[i].id;
				let foundIndex = orders[destIndex].Items.findIndex((item)=>{
					return (item.id === srcItemId);
				});
				if (foundIndex >= 0) {
					let srcQty = orders[srcIndex].Items[i].Qty;
					let destQty = orders[destIndex].Items[foundIndex].Qty;
					let newQty = Number(srcQty) + Number(destQty);
					orders[destIndex].Items[foundIndex].Qty = newQty;
				} else {
					orders[destIndex].Items.push(orders[srcIndex].Items[i]);
				}
			}
			setTimeout(()=>{
				resolve2($(orders));
			}, 500);
		});
		Promise.all([promiseList]).then((ob)=>{
			$('body').loading('start');
			mergeSuccessCallback(ob[0], destIndex);
			$('body').loading('stop');
			if (dlgHandle) {
				dlgHandle.closeAlert();
			}
		});
	}

	const doMergeOrder = async function(orders, srcIndex, mergeSuccessCallback) {
		let orderMergerForm = await doCreateMergeSelectOrderForm(orders, srcIndex, orderSelectCallback, mergeSuccessCallback);
		let mergeDlgOption = {
			title: 'เลือกออร์เดอร์ปลายทางที่ต้องการนำไปยุบรวม',
			msg: $(orderMergerForm),
			width: '420px',
			onOk: async function(evt) {
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		dlgHandle = $('body').radalert(mergeDlgOption);
		$(dlgHandle.okCmd).hide();
	}

  const doCreateMergeSelectOrderForm = function(orders, srcIndex, selectedCallback, mergeSuccessCallback){
    return new Promise(async function(resolve, reject) {
      let selectOrderForm = $('<div></div>').css({'width': '100%', 'height': '220px', 'overflow': 'scroll', 'padding': '5px'});
      let promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < orders.length; i++) {
          if ((orders[i].Status == 1) && (orders[i].id != orders[srcIndex].id)) {
						let total = await common.doCalOrderTotal(orders[i].Items);
            let ownerOrderFullName = orders[i].userinfo.User_NameTH + ' ' + orders[i].userinfo.User_LastNameTH;
            let orderBox = $('<div></div>').css({'width': '95%', 'position': 'relative', 'cursor': 'pointer', 'padding': '5px', 'background-color': '#dddd', 'border': '4px solid #dddd'});
            $(orderBox).append($('<div><b>ลูกค้า :</b> ' + orders[i].customer.Name + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>ผู้รับออร์เดอร์ :</b> ' + ownerOrderFullName + '</div>').css({'width': '100%'}));
						$(orderBox).append($('<div><b>ยอดรวม :</b> ' + common.doFormatNumber(total) + '</div>').css({'width': '100%'}));
            $(orderBox).hover(()=>{
              $(orderBox).css({'border': '4px solid grey'});
            },()=>{
              $(orderBox).css({'border': '4px solid #dddd'});
            });
            $(orderBox).on('click', (evt)=>{
              selectedCallback(evt, orders, srcIndex, i, mergeSuccessCallback);
            });
            $(selectOrderForm).append($(orderBox));
          }
        }
        setTimeout(()=> {
          resolve2($(selectOrderForm));
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  return {
		doMergeOrder,
    doCreateMergeSelectOrderForm
	}
}

},{"../../../home/mod/common-lib.js":2}],17:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);
  const customerdlg = require('./customer-dlg.js')($);
  const gooditemdlg = require('./gooditem-dlg.js')($);
	const closeorderdlg = require('./closeorder-dlg.js')($);
	const calendardlg = require('./calendar-dlg.js')($);
	const mergeorderdlg = require('./order-merge-dlg.js')($);

  const doShowOrderList = function(shopData, workAreaBox, orderDate){
    return new Promise(async function(resolve, reject) {
      let customerRes = await common.doCallApi('/api/shop/customer/list/by/shop/' + shopData.id, {});
      let menugroupRes = await common.doCallApi('/api/shop/menugroup/list/by/shop/' + shopData.id, {});
      let menuitemRes = await common.doCallApi('/api/shop/menuitem/list/by/shop/' + shopData.id, {});
      let customers = customerRes.Records;
      localStorage.setItem('customers', JSON.stringify(customers));
      let menugroups = menugroupRes.Records;
      localStorage.setItem('menugroups', JSON.stringify(menugroups));
      let menuitems = menuitemRes.Records;
      localStorage.setItem('menuitems', JSON.stringify(menuitems));

      $(workAreaBox).empty();

			let selectDate = undefined;
			if (orderDate) {
				selectDate = common.doFormatDateStr(new Date(orderDate));
			} else {
				selectDate = common.doFormatDateStr(new Date());
			}
      let titlePageBox = $('<div style="padding: 4px;"></viv>').css({'width': '99.1%', 'height': '75px', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			let titleTextBox = $('<div></div>').append('รายการ<span class="sensitive-word" id="titleTextBox">ออร์เดอร์</span>ของร้าน วันที่ ');
			let orderDateBox = $('<span></span>').text(selectDate).css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 5px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey'});
			$(orderDateBox).on('click', (evt)=>{
				common.calendarOptions.onClick = async function(date){
					selectDate = common.doFormatDateStr(new Date(date));
					$(orderDateBox).text(selectDate);
					calendarHandle.closeAlert();
					$('#OrderListBox').remove();
					let orderListBox = await doCreateOrderList(shopData, workAreaBox, selectDate);
					$(workAreaBox).append($(orderListBox));
				}
				let calendarHandle = doShowCalendarDlg(common.calendarOptions);
			});
			$(orderDateBox).hover(()=>{
				$(orderDateBox).css({'border': '3px solid black'});
			},()=>{
				$(orderDateBox).css({'border': '3px solid grey'});
			});

			$(titlePageBox).append($(titleTextBox).append($(orderDateBox)));

			$(workAreaBox).append($(titlePageBox));
			//let newOrderCmdBox = $('<div></div>').css({'position': 'absolute', 'text-align': 'right', 'padding': '4px', 'margin-bottom': '4px'});
			//let newOrderCmd = $('<input type="button" value=" เปิดออร์เดอร์ใหม่ " class="action-btn"/>');
			let newOrderCmd = common.doCreateTextCmd('เปิดออร์เดอร์ใหม', 'green', 'white');
			$(newOrderCmd).addClass('sensitive-word');
			$(newOrderCmd).attr('id', 'newOrderCmd');
			$(newOrderCmd).on('click', (evt)=>{
				doOpenOrderForm(shopData, workAreaBox);
			});
			if (common.shopSensitives.includes(shopData.id)) {
				let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
				$(newOrderCmd).text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'newOrderCmd') return item}).customWord);
				$(titleTextBox).find('#titleTextBox').text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'titleTextBox') return item}).customWord) ;
			}

			let canceledOrderHiddenToggleCmd = common.doCreateTextCmd('ซ่อนรายการที่ถูกยกเลิก', 'grey', 'white');
			$(canceledOrderHiddenToggleCmd).on('click', (evt)=>{
				let displayStatus = $('.canceled-order').css('display');
				if (displayStatus === 'none') {
					$('.canceled-order').css('display', 'block');
					$(canceledOrderHiddenToggleCmd).text('ซ่อนรายการที่ถูกยกเลิก');
				} else {
					$('.canceled-order').css('display', 'none');
					$(canceledOrderHiddenToggleCmd).text('แสดงรายการที่ถูกยกเลิก');
				}
			});

			$(titlePageBox).append($(newOrderCmd).css({'float': 'right', 'margin-right': '5px', 'margin-top': '10px'})).append($(canceledOrderHiddenToggleCmd).css({'float': 'right', 'margin-right': '10px', 'margin-top': '10px'}));


			$('#OrderListBox').remove();
			let orderListBox = await doCreateOrderList(shopData, workAreaBox, selectDate);
			$(workAreaBox).append($(orderListBox));

			console.log('try + ', $(orderListBox).find('.canceled-order').length);

			if ($(orderListBox).find('.canceled-order').length > 0){
				$(canceledOrderHiddenToggleCmd).show();
			} else {
				$(canceledOrderHiddenToggleCmd).hide();
			}
      resolve();
    });
  }

	const doShowCalendarDlg = function(calendarOptions) {
		let calendarContent = calendardlg.doCreateCalendar(calendarOptions);
		const calendarDlgOption = {
			title: 'เลือกวันที่บนปฎิทิน',
			msg: $(calendarContent),
			width: '220px',
			onOk: function(evt) {
				calendarDlgHandle.closeAlert();
			},
			onCancel: function(evt){
				calendarDlgHandle.closeAlert();
			}
		}
		let calendarDlgHandle = $('body').radalert(calendarDlgOption);
		$(calendarDlgHandle.okCmd).hide();
		return calendarDlgHandle;
	}

  const doOpenOrderForm = async function(shopData, workAreaBox, orderData, selectDate){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let userId = userdata.id;
		let userinfoId = userdata.userinfoId;

    let orderObj = {};

    $(workAreaBox).empty();
    let titleText = $('<div>เปิด<span id="titleOrderForm" class="sensitive-word">ออร์เดอร์</span>ใหม่</div>');
    if (orderData) {
      titleText = $('<div>แก้ไข<span id="titleOrderForm" class="sensitive-word">ออร์เดอร์</span></div>');
			orderObj.id = orderData.id;
			orderObj.Status = orderData.Status
    } else {
			orderObj.Status = 1;
		}
    let titlePageBox = $('<div style="padding: 4px;"></viv>').append($(titleText)).css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
    let customerWokingBox = $('<div id="OrderCustomer" style="padding: 4px; width: 99.1%;"></viv>');
    let itemlistWorkingBox = $('<div id="OrderItemList" style="padding: 4px; width: 99.1%;"></viv>');
    let saveNewOrderCmdBox = $('<div></div>').css({'width': '99.1%', 'text-align': 'center'});
    $(workAreaBox).append($(titlePageBox)).append($(customerWokingBox)).append($(itemlistWorkingBox)).append($(saveNewOrderCmdBox));

    let customerForm = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let customerFormRow = $('<tr></tr>');
    let customerContent = $('<td width="85%" align="left"></tf>');
    let customerControlCmd = $('<td width="*" align="right" valign="middle"></tf>');
    $(customerFormRow).append($(customerContent)).append($(customerControlCmd));
    $(customerForm).append($(customerFormRow));
    $(customerWokingBox).append($(customerForm));

    let editCustomerCmd = $('<input type="button" class="action-btn"/>');

    let customerDataBox = undefined;
    if ((orderData) && (orderData.customer)) {
      orderObj.customer = orderData.customer;
      customerDataBox = doRenderCustomerContent(orderData.customer);
      $(customerContent).empty().append($(customerDataBox));
      $(editCustomerCmd).val('แก้ไขลูกค้า');
    } else {
      $(editCustomerCmd).val('ใส่ลูกค้า');
      $(customerContent).append($('<h2>ข้อมูลลูกค้า</h2>'));
    }
    if ((orderData) && (orderData.gooditems)) {
			if (orderData.BeforeItems) {
				await orderData.gooditems.forEach(async(srcItem, i) => {
					let foundItem = await orderData.BeforeItems.find((destItem) => {
						if (destItem.id === srcItem.id) {
							return destItem;
						}
					});
					srcItem.ItemStatus = foundItem.ItemStatus;
				});
				orderObj.gooditems = orderData.gooditems;
			} else {
      	orderObj.gooditems = orderData.gooditems;
			}
    } else {
      orderObj.gooditems = [];
    }

		//console.log(orderObj);

    let dlgHandle = undefined;

    $(editCustomerCmd).on('click', async (evt)=>{
      dlgHandle = await doOpenCustomerMngDlg(shopData, customerSelectedCallback);
    });
		$(customerControlCmd).append($(editCustomerCmd));

		let addNewGoodItemCmd = undefined;
		//if (orderObj.Status == 1) {
		if ([1, 2].includes(orderObj.Status)) {
			addNewGoodItemCmd = common.doCreateTextCmd('เพิ่มรายการ', 'green', 'white');
	    $(addNewGoodItemCmd).on('click', async (evt)=>{
	      dlgHandle = await doOpenGoodItemMngDlg(shopData, orderObj.gooditems, gooditemSelectedCallback);
	    });
		}

		let doShowCloseOrderDlg = async function() {
			let total = await doCalOrderTotal(orderObj.gooditems);
			if (total > 0) {
				dlgHandle = await doOpenCreateCloseOrderDlg(shopData, total, orderObj, invoiceCallback, billCallback, taxinvoiceCallback);
			} else {
				$.notify("ออร์เดอร์ยังไม่สมบูรณ์โปรดเพิ่มรายการสินค้าก่อน", "error");
			}
		}

		let callCreateCloseOrderCmd = common.doCreateTextCmd(' คิดเงิน ', '#F5500E', 'white', '#5D6D7E', '#FF5733');
		$(callCreateCloseOrderCmd).on('click', async (evt)=>{
			if (orderObj.customer) {
				if ((orderObj.gooditems) && (orderObj.gooditems.length > 0)) {
					let params = undefined;
					let orderRes = undefined;
					if ((orderData) && (orderData.id)) {
						params = {data: {Items: orderObj.gooditems, Status: orderObj.Status, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId}, shop: shopData, id: orderData.id};
						console.log(params);
						orderRes = await common.doCallApi('/api/shop/order/update', params);
						if (orderRes.status.code == 200) {
							$.notify("บันทึกรายการออร์เดอร์สำเร็จ", "success");
							doShowCloseOrderDlg();
						} else {
							$.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
						}
					} else {
						params = {data: {Items: orderObj.gooditems, Status: 1}, shopId: shopData.id, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
						console.log(params);
						params.data.Items = orderObj.gooditems;
						orderRes = await common.doCallApi('/api/shop/order/add', params);
	          if (orderRes.status.code == 200) {
	            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
							orderObj.id = orderRes.Records[0].id;
							orderData = orderRes.Records[0];
							doShowCloseOrderDlg();
	          } else {
	            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
	          }
					}
				} else {
	        $.notify("ยังไม่พบรายการสินค้าเพื่อคิดเงิน โปรดใส่รายการสินค้า", "error");
	      }
			} else {
        $.notify("โปรดระบุข้อมูลลูกค้าก่อนบันทึกออร์เดอร์", "error");
      }
    });

    if ((orderObj) && (orderObj.gooditems)){
      let goodItemTable = await doRenderGoodItemTable(orderObj, itemlistWorkingBox, selectDate);
			let lastCell = $(goodItemTable).children(":first").children(":last");
			if (addNewGoodItemCmd) {
				$(lastCell).append($(addNewGoodItemCmd));
			}

			/*
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let userinfoId = userdata.userinfoId;
			*/

			/** add admin for edit order and re-create bill/tax-invoice **/
			if (([1, 2].includes(orderObj.Status)) || (userId == 1)) {
				lastCell = $(goodItemTable).children(":last").children(":last");
				$(lastCell).append($(callCreateCloseOrderCmd));
			}
      $(itemlistWorkingBox).append($(goodItemTable));
    }

    let cancelCmd = $('<input type="button" value=" กลับ "/>').css({'margin-left': '10px'});
    $(cancelCmd).on('click', async(evt)=>{
			if (evt.ctrlKey) {
				let changelogs = JSON.parse(localStorage.getItem('changelogs'));
				let logIndex = changelogs.findIndex((item, i)=>{
					if (item.orderId == orderObj.id) {
						return item;
					}
				});
				changelogs[logIndex].status = 'New';
				localStorage.setItem('changelogs', JSON.stringify(changelogs));
      	common.doPopupOrderChangeLog(orderObj.id);
			} else {
				await doShowOrderList(shopData, workAreaBox, selectDate);
			}
    });
    let saveNewOrderCmd = $('<input type="button" value=" บันทึก " class="action-btn"/>');;
		$(saveNewOrderCmdBox).append($(saveNewOrderCmd));
    $(saveNewOrderCmd).on('click', async(evt)=>{
      if (orderObj.customer) {
        let params = undefined;
        let orderRes = undefined;
        if (orderData) {
          params = {data: {Items: orderObj.gooditems, Status: 1, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId}, shop: shopData, id: orderData.id};
          orderRes = await common.doCallApi('/api/shop/order/update', params);
          if (orderRes.status.code == 200) {
            $.notify("บันทึกรายการออร์เดอร์สำเร็จ", "success");
            await doShowOrderList(shopData, workAreaBox, selectDate);
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
        } else {
          params = {data: {Status: 1}, shopId: shopData.id, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
					console.log(params);
					params.data.Items = orderObj.gooditems;
					orderRes = await common.doCallApi('/api/shop/order/add', params);
          if (orderRes.status.code == 200) {
            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
            await doShowOrderList(shopData, workAreaBox, selectDate);
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
        }
      } else {
        $.notify("โปรดระบุข้อมูลลูกค้าก่อนบันทึกออร์เดอร์", "error");
      }
    });
		if (orderObj.id) {
			let changelogs = JSON.parse(localStorage.getItem('changelogs'));
			if (changelogs) {
				let newMsgCounts = await changelogs.filter((item, i) =>{
					if ((item.orderId == orderObj.id) && (item.status === 'New')) {
						return item;
					}
				});
				if (newMsgCounts.length > 0) {
					let viewLogCmd = $('<input type="button" value=" การเปลี่ยนแปลง " class="action-btn"/>').css({'margin-left': '10px'});
					$(viewLogCmd).on('click', (evt)=>{
						common.doPopupOrderChangeLog(orderObj.id);
					});
					$(saveNewOrderCmdBox).append($(viewLogCmd));
				}
			}
		}
    $(saveNewOrderCmdBox).append($(cancelCmd));

		//if (orderObj.Status != 1) {
		if ([3, 4].includes(orderObj.Status)) {
			$(editCustomerCmd).hide();
			$(saveNewOrderCmd).hide();
		}

		$('#App').find('#SummaryBox').remove();

		if (common.shopSensitives.includes(shopData.id)) {
			let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
			common.delay(500).then(async ()=>{
				await common.doResetSensitiveWord(sensitiveWordJSON);
			});
		}

    const customerSelectedCallback = function(customerSelected){
      orderObj.customer = customerSelected;
      customerDataBox = doRenderCustomerContent(customerSelected);
      $(customerContent).empty().append($(customerDataBox));
			$(editCustomerCmd).val('แก้ไขลูกค้า');
      if (dlgHandle) {
        dlgHandle.closeAlert();
      }
    }

    const gooditemSelectedCallback = async function(gooditemSelected){
      orderObj.gooditems.push(gooditemSelected);
      goodItemTable = await doRenderGoodItemTable(orderObj, itemlistWorkingBox, selectDate);
			let lastCell = $(goodItemTable).children(":first").children(":last");
			if (addNewGoodItemCmd) {
				$(lastCell).append($(addNewGoodItemCmd));
			}
			if ([1, 2].includes(orderObj.Status)) {
				lastCell = $(goodItemTable).children(":last").children(":last");
				$(lastCell).append($(callCreateCloseOrderCmd));
			}
      $(itemlistWorkingBox).empty().append($(goodItemTable));
    }

		const invoiceCallback = async function(newInvoiceData){
			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
			let invoiceParams = {data: newInvoiceData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let invoiceRes = await common.doCallApi('/api/shop/invoice/add', invoiceParams);

			if (invoiceRes.status.code == 200) {
				let invoiceId = invoiceRes.Record.id;
				let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
				let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
				console.log(docRes);
				if (docRes.status.code == 200) {
					//window.open(docRes.result.link, '_blank');
					closeorderdlg.doOpenReportPdfDlg(docRes.result, 'ใบแจ้งหนี้');
					$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
				} else if (docRes.status.code == 300) {
					$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
				}
			} else {
				$.notify("บันทึกใบแจ้งหนี้ไม่สำเร็จ", "error");
			}
		}

		const billCallback = async function(newBillData, paymentData){
			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
			let billParams = {data: newBillData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId, shopData: shopData};
			let billRes = await common.doCallApi('/api/shop/bill/add', billParams);

			if (billRes.status.code == 200) {
				let billId = billRes.Record.id;
				let paymentParams = {data: paymentData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newBillData.Filename, No: newBillData.No*/};
					let docRes = await common.doCallApi('/api/shop/bill/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						//window.open(docRes.result.link, '_blank');
						closeorderdlg.doOpenReportPdfDlg(docRes.result, 'บิลเงินสด/ใบเสร็จรับเงิน', ()=>{
							$(cancelCmd).click();
						});
						$.notify("ออกบิลเงินสด/ใบเสร็จรับเงินสำเร็จ", "sucess");
					} else if (docRes.status.code == 300) {
						$.notify("ระบบไม่พบรูปแบบเอกสารบิลเงินสด/ใบเสร็จรับเงิน", "error");
					}
				} else {
					$.notify("บันทึกข้อมูลการชำระเงินไม่สำเร็จ", "error");
				}
			} else {
				$.notify("บันทึกบิลไม่สำเร็จ", "error");
			}
		}

		const taxinvoiceCallback = async function(newTaxInvoiceData, paymentData){
			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
			let taxinvoiceParams = {data: newTaxInvoiceData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId, shopData: shopData};
			let taxinvoiceRes = await common.doCallApi('/api/shop/taxinvoice/add', taxinvoiceParams);

			/*
				พื้นที่ที่ควรสั่งให้ TaxInvoice มีการอัพเดทและสร้าง เอกสารกระดาษใหม่
			*/

			if (taxinvoiceRes.status.code == 200) {
				let taxinvoiceId = taxinvoiceRes.Record.id;
				let paymentParams = {data: paymentData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
					let docRes = await common.doCallApi('/api/shop/taxinvoice/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						//window.open(docRes.result.link, '_blank');
						closeorderdlg.doOpenReportPdfDlg(docRes.result, 'ใบกำกับภาษี', ()=>{
							$(cancelCmd).click();
						});
						$.notify("ออกใบกำกับภาษีสำเร็จ", "sucess");
					} else if (docRes.status.code == 300) {
						$.notify("ระบบไม่พบรูปแบบเอกสารใบกำกับภาษี", "error");
					}
				} else {
					$.notify("บันทึกข้อมูลการชำระเงินไม่สำเร็จ", "error");
				}
			} else {doOpenOrderForm
				$.notify("บันทึกใบกำกับภาษีไม่สำเร็จ", "error");
			}
		}
  }

  const doOpenCustomerMngDlg = function(shopData, callback) {
    return new Promise(async function(resolve, reject) {
      const customerDlgContent = await customerdlg.doCreateFormDlg(shopData, callback);
      $(customerDlgContent).css({'margin-top': '10px'});
      const customerformoption = {
  			title: 'เลือกรายการลูกค้า',
  			msg: $(customerDlgContent),
  			width: '520px',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
          customerFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				customerFormBoxHandle.closeAlert();
  			}
  		}
  		let customerFormBoxHandle = $('body').radalert(customerformoption);
      $(customerFormBoxHandle.okCmd).hide();
      resolve(customerFormBoxHandle)
    });
  }

  const doOpenGoodItemMngDlg = function(shopData, gooditemSeleted, callback){
    return new Promise(async function(resolve, reject) {
      const gooditemDlgContent = await gooditemdlg.doCreateFormDlg(shopData, gooditemSeleted, callback);
			$(gooditemDlgContent).find('#SearchKeyInput').css({'width': '280px', 'background': 'url("../../images/search-icon.png") right center / 8% 100% no-repeat'});
      $(gooditemDlgContent).css({'margin-top': '10px'});
      const gooditemformoption = {
  			title: 'เลือกรายการสินค้า',
  			msg: $(gooditemDlgContent),
  			width: '580px',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
          gooditemFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				gooditemFormBoxHandle.closeAlert();
  			}
  		}
  		let gooditemFormBoxHandle = $('body').radalert(gooditemformoption);
      $(gooditemFormBoxHandle.okCmd).hide();
      resolve(gooditemFormBoxHandle)
    });
  }

	const doOpenCreateCloseOrderDlg = function(shopData, orderTotal, orderObj, invoiceCallback, billCallback, taxinvoiceCallback) {
		return new Promise(async function(resolve, reject) {
      const closeOrderDlgContent = await closeorderdlg.doCreateFormDlg(shopData, orderTotal, orderObj, invoiceCallback, billCallback, taxinvoiceCallback);
      $(closeOrderDlgContent).css({'margin-top': '10px'});
      const closeOrderformoption = {
  			title: 'ป้อนข้อมูลเพื่อเตรียมออกใบแจ้งหนี้ หรือ เก็บเงิน',
  			msg: $(closeOrderDlgContent),
  			width: '420px',
  			onOk: async function(evt) {
          closeOrderFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				closeOrderFormBoxHandle.closeAlert();
  			}
  		}
  		let closeOrderFormBoxHandle = $('body').radalert(closeOrderformoption);
      $(closeOrderFormBoxHandle.okCmd).hide();
      resolve(closeOrderFormBoxHandle);
    });
	}

  const doRenderCustomerContent = function(customerData){
    let customerDataTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let dataRow = $('<tr></tr>');
    let avatarCell = $('<td width="30%" rowspan="3" align="center" valign="middle"></td>');
    let nameCell = $('<td width="*" align="left"><b>ชื่อลูกค้า</b> ' + customerData.Name + '</td>');
    let addressCell = $('<td><b>ที่อยู่</b> ' + customerData.Address + '</td>');
    let telCell = $('<td><b>โทรศัพท์</b> ' + customerData.Tel + '</td>');
    let avatarIcon = $('<img src="../../images/avatar-icon.png"/>').css({'width': '95px', 'height': 'auto'});
    $(avatarCell).append($(avatarIcon));
    $(dataRow).append($(avatarCell)).append($(nameCell));
    $(customerDataTable).append($(dataRow));
    dataRow = $('<tr></tr>');
    $(dataRow).append($(addressCell));
    $(customerDataTable).append($(dataRow));
    dataRow = $('<tr></tr>');
    $(dataRow).append($(telCell));
    $(customerDataTable).append($(dataRow));
    return $(customerDataTable);
  }

  const doRenderGoodItemTable = function(orderData, gooditemWorkingBox, orderdate){
    return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let shopData = userdata.shop;
      let goodItemForm = $('<table id="GoodItemTable" width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
      let goodItemHeadFormRow = $('<tr></tr>').css({'background-color': 'grey', 'color': 'white', 'height': '42px'});
      let goodItemHeadNumberCell = $('<td width="5%" align="center"><b>#</b></td>');
      let goodItemHeadNameCell = $('<td width="30%" align="center"><b>รายการ</b></td>');
      let goodItemHeadQtyCell = $('<td width="7%" align="center"><b>จำนวน</b></td>');
      let goodItemHeadUnitCell = $('<td width="10%" align="center"><b>หน่วย</b></td>');
      let goodItemHeadPriceCell = $('<td width="15%" align="center"><b>ราคาต่อหน่วย</b></td>');
      let goodItemHeadSubTotalCell = $('<td width="15%" align="center"><b>รวม</b></td>');
      let goodItemHeadControlCmd = $('<td width="*" align="center" valign="middle"></td>');
      $(goodItemHeadFormRow).append($(goodItemHeadNumberCell)).append($(goodItemHeadNameCell)).append($(goodItemHeadQtyCell)).append($(goodItemHeadUnitCell))
      $(goodItemHeadFormRow).append($(goodItemHeadPriceCell)).append($(goodItemHeadSubTotalCell)).append($(goodItemHeadControlCmd));
      $(goodItemForm).append($(goodItemHeadFormRow));
      let totalLabelCell = $('<td colspan="5" align="center" valign="middle"><b>ยอดรวม</b></td>');
      let totalValueCell = $('<td align="right" valign="middle"></td>');
			let totalRow = $('<tr></tr>').css({'background-color': '#ddd', 'height': '42px'});
			$(totalRow).append($(totalLabelCell)).append($(totalValueCell)).append($('<td align="center"></td>'));

      if ((orderData) && (orderData.gooditems) && (orderData.gooditems.length > 0)) {
        let	promiseList = new Promise(async function(resolve2, reject2){
          let total = 0;
          let goodItems = orderData.gooditems;
					let itenNoCells = [];
          for (let i=0; i < goodItems.length; i++) {
						let menuNameFrag = $('<span></span>').text(goodItems[i].MenuName).attr('title', goodItems[i].Desc);
						let priceFrag = $('<span></span>').text(common.doFormatNumber(Number(goodItems[i].Price)));
						let qtyFrag = $('<span></span>').text(common.doFormatQtyNumber(goodItems[i].Qty));
						if ([1, 2].includes(orderData.Status)) {
							//$(menuNameFrag).css({'cursor': 'pointer', 'text-decoration': 'underline', 'text-decoration-style': 'dotted'});
							$(menuNameFrag).on('click', (evt)=>{
								doEditMenuNameOnTheFly(evt, orderData.gooditems, i, async(newName)=>{
									orderData.gooditems[i].MenuName = newName;
									$(menuNameFrag).text(orderData.gooditems[i].MenuName);
								});
							});
							//$(priceFrag).css({'cursor': 'pointer', 'text-decoration': 'underline', 'text-decoration-style': 'dotted'});
							$(priceFrag).on('click', (evt)=>{
								doEditPriceOnTheFly(evt, orderData.gooditems, i, async(newPrice)=>{
									orderData.gooditems[i].Price = newPrice;
									$(priceFrag).text(common.doFormatNumber(Number(orderData.gooditems[i].Price)));
									subTotal = Number(orderData.gooditems[i].Price) * Number(orderData.gooditems[i].Qty);
									$(subTotalCell).empty().append($('<span>' +  common.doFormatNumber(subTotal) + '</span>').css({'margin-right': '4px'}));
									total = await doCalOrderTotal(orderData.gooditems);
				          $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
								});
							});
							//$(qtyFrag).css({'cursor': 'pointer', 'text-decoration': 'underline', 'text-decoration-style': 'dotted'});
							$(qtyFrag).on('click', (evt)=>{
								doEditQtyOnTheFly(evt, orderData.gooditems, i, async(newQty)=>{
									orderData.gooditems[i].Qty = newQty;
									//$(qtyFrag).text(common.doFormatNumber(Number(orderData.gooditems[i].Qty)));
									$(qtyFrag).text(newQty);
									subTotal = Number(orderData.gooditems[i].Price) * Number(orderData.gooditems[i].Qty);
									$(subTotalCell).empty().append($('<span>' +  common.doFormatNumber(subTotal) + '</span>').css({'margin-right': '4px'}));
									total = await doCalOrderTotal(orderData.gooditems);
				          $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
								});
							});
							$(menuNameFrag).css({'cursor': 'pointer', 'background-color': '#dddd', 'color': 'black', 'padding': '2px'});
							$(priceFrag).css({'cursor': 'pointer', 'background-color': '#dddd', 'color': 'black', 'padding': '2px'});
							$(qtyFrag).css({'cursor': 'pointer', 'background-color': '#dddd', 'color': 'black', 'padding': '2px 10px 2px 10px'});
							$(menuNameFrag).hover(()=>{
								$(menuNameFrag).css({'background-color': 'grey', 'color': 'white', 'border': '1px solid black'});
							},()=>{
								$(menuNameFrag).css({'background-color': '#dddd', 'color': 'black', 'border': ''});
							});
							$(priceFrag).hover(()=>{
								$(priceFrag).css({'background-color': 'grey', 'color': 'white', 'border': '1px solid black'});
							},()=>{
								$(priceFrag).css({'background-color': '#dddd', 'color': 'black', 'border': ''});
							});
							$(qtyFrag).hover(()=>{
								$(qtyFrag).css({'background-color': 'grey', 'color': 'white', 'border': '1px solid black'});
							},()=>{
								$(qtyFrag).css({'background-color': '#dddd', 'color': 'black', 'border': ''});
							});
						}
            let goodItemRow = $('<tr></tr>');
						let itenNoCell = $('<td align="center">' + (i+1) + '</td>');
            $(goodItemRow).append($(itenNoCell));
            $(goodItemRow).append($('<td align="left"></td>').append($(menuNameFrag)));
            let goodItemQtyCell = $('<td align="center"></td>').append($(qtyFrag));
            $(goodItemRow).append($(goodItemQtyCell));
            $(goodItemRow).append($('<td align="center">' + goodItems[i].Unit + '</td>'));
            $(goodItemRow).append($('<td align="center"></td>').append($(priceFrag)));
            let subTotal = Number(goodItems[i].Price) * Number(goodItems[i].Qty);
            let subTotalCell = $('<td align="right"></td>');
						$(subTotalCell).append($('<span>' +  common.doFormatNumber(subTotal) + '</span>').css({'margin-right': '4px'}))
            $(goodItemRow).append($(subTotalCell));
            let commandCell = $('<td align="center"></td>');
            $(goodItemRow).append($(commandCell));

            let increaseBtnCmd = common.doCreateImageCmd('../../images/plus-sign-icon.png', 'เพิ่มจำนวน');
            $(increaseBtnCmd).on('click', async(evt)=>{
              let oldQty = $(goodItemQtyCell).text();
              oldQty = Number(oldQty);
              let newQty = oldQty + 1;
              $(goodItemQtyCell).text(common.doFormatQtyNumber(newQty));
              goodItems[i].Qty = newQty;
              subTotal = Number(goodItems[i].Price) * newQty;
              $(subTotalCell).empty().append($('<span><b>' + common.doFormatNumber(subTotal) + '</b></span>').css({'margin-right': '4px'}));
              let total = await doCalOrderTotal(orderData.gooditems);
              $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
            });
            let decreaseBtnCmd = common.doCreateImageCmd('../../images/minus-sign-icon.png', 'ลดจำนวน');
            $(decreaseBtnCmd).on('click', async(evt)=>{
              let oldQty = $(goodItemQtyCell).text();
              oldQty = Number(oldQty);
              let newQty = oldQty - 1;
              if (newQty > 0) {
                $(goodItemQtyCell).text(common.doFormatQtyNumber(newQty));
                goodItems[i].Qty = newQty;
                subTotal = Number(goodItems[i].Price) * newQty;
                $(subTotalCell).empty().append($('<span><b>' + common.doFormatNumber(subTotal) + '</b></span>').css({'margin-right': '4px'}));
                let total = await doCalOrderTotal(orderData.gooditems);
                $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
              } else {
                $.notify("ไม่สามารถลดจำนวนสินค้าได้น้อยไปกว่านี้", "error");
              }
            });

						let splitGoodItemCmd = common.doCreateImageCmd('../../images/split-icon.png', 'แยกออเดอร์');
						$(splitGoodItemCmd).on('click', async(evt)=>{
							doSplitGooditem(evt, shopData, orderData, i, orderdate, async(newOrderData)=>{
								let addNewGoodItemCmd = $('#GoodItemTable').children(":first").children(":last").children();
								let callCreateCloseOrderCmd = $('#GoodItemTable').children(":last").children(":last").children();

								let goodItemTable = await doRenderGoodItemTable(newOrderData, gooditemWorkingBox, orderdate);
								let lastCell = $(goodItemTable).children(":first").children(":last");
								$(lastCell).append($(addNewGoodItemCmd));
								lastCell = $(goodItemTable).children(":last").children(":last");
								$(lastCell).append($(callCreateCloseOrderCmd));
								$(gooditemWorkingBox).empty().append($(goodItemTable));
							});
						});

						let deleteGoodItemCmd = common.doCreateImageCmd('../../images/cross-red-icon.png', 'ลบรายการ');
            $(deleteGoodItemCmd).on('click', async (evt)=>{
							$(goodItemRow).remove();
              let newGoodItems = await doDeleteGoodItem(i, orderData);
              orderData.gooditems = newGoodItems;

							if (orderData.id) {
								let params = undefined;
								if (newGoodItems.length > 0) {
									params = {data: {Items: newGoodItems}, shop: shopData, id: orderData.id};
								} else {
									/*
									ปัญหาเกิดจากการอัพเดท Items ซึงเป็น jsonb ด้วย [] empty array
									*/
									params = {data: {Status: 1}, shop: shopData, id: orderData.id};
								}
								let orderRes = await common.doCallApi('/api/shop/order/update', params);
							}
							itenNoCells = await itenNoCells.filter((item)=>{
								if ($(item).text() !== $(itenNoCell).text()) {
									if ($(item).text() > $(itenNoCell).text()) {
										let value = $(item).text();
										value = Number(value) - 1;
										return $(item).text(value);
									} else {
										return $(item);
									}
								}
							})
              let total = await doCalOrderTotal(orderData.gooditems);
              $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
            });
						if ([1, 2].includes(orderData.Status)) {
            	$(commandCell).append($(increaseBtnCmd)).append($(decreaseBtnCmd)).append($(splitGoodItemCmd)).append($(deleteGoodItemCmd));
						}

						if (/*(orderData.Status > 0)*/ [1, 2].includes(orderData.Status) && (parseInt(shopData.Shop_StockingOption) == 1) && (parseInt(goodItems[i].StockingOption) == 1)) {
							 let stockInfoCmd = common.doCreateImageCmd('../../images/stock-icon.png', 'เช็คสต็อค');
							 $(stockInfoCmd).on('click', async (evt)=>{
								 let cutoffDateValue = '1D';
								 let cutoffDate = common.findCutoffDateFromDateOption(cutoffDateValue);
								 let orderDateFmt = common.doFormatDateStr(new Date(cutoffDate));
								 cutoffDate = new Date(cutoffDate);
								 let params = {cutoffDate: cutoffDate};

								 let stockRes = await common.doCallApi('/api/shop/stocking/list/by/menuitem/' + goodItems[i].id, params);
								 let sum = stockRes.sumQty.Qty;
								 if (stockRes.Records.length > 0) {
									 for (let k=0; k < stockRes.Records.length; k++) {
											if (stockRes.Records[k].Direction == '+') {
												sum = sum + stockRes.Records[k].Qty;
											} else if (stockRes.Records[k].Direction == '-') {
												sum = sum - stockRes.Records[k].Qty;
											}
									 }
								 }
								 doShowStockInfo(goodItems[i], sum);
							 });
							 $(commandCell).append($(stockInfoCmd))
						}

            $(goodItemForm).append($(goodItemRow));
						itenNoCells.push($(itenNoCell));
          }
          total = await doCalOrderTotal(orderData.gooditems);
          $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
          $(goodItemForm).append($(totalRow));
          setTimeout(()=>{
            resolve2($(goodItemForm));
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
          resolve(ob[0]);
        });
      } else {
				$(totalValueCell).empty().append($('<span><b>0.00</b></span>').css({'margin-right': '4px'}));
				$(goodItemForm).append($(totalRow));
        resolve($(goodItemForm));
      }
    });
  }

  const doDeleteGoodItem = function(goodItemIndex, orderData) {
    return new Promise(async function(resolve, reject) {
      let anotherItems = await orderData.gooditems.filter((item, i)=>{
        if (i != goodItemIndex) {
          return item;
        }
      });
      resolve(anotherItems);
    });
  }

  const doCalOrderTotal = function(gooditems){
    return new Promise(async function(resolve, reject) {
      let total = 0;
      await gooditems.forEach((item, i) => {
        total += Number(item.Price) * Number(item.Qty);
      });
      resolve(total);
    });
  }

  const doCreateOrderList = function(shopData, workAreaBox, orderDate){
    return new Promise(async function(resolve, reject) {
			let orderReqParams = {};
			if (orderDate) {
				orderReqParams = {orderDate: orderDate};
			}

      let orderRes = await common.doCallApi('/api/shop/order/list/by/shop/' + shopData.id, orderReqParams);
      let orders = orderRes.Records;
      console.log(orders);

			let yellowOrders = [];
			let orangeOrders = [];
			let greenOrders = [];
			let greyOrders = [];

      let orderListBox = $('<div id="OrderListBox"></div>').css({'position': 'relative', 'width': '100%', 'margin-top': '25px', 'overflow': 'auto'});
      if ((orders) && (orders.length > 0)) {
        let	promiseList = new Promise(async function(resolve2, reject2){
          for (let i=0; i < orders.length; i++) {
            //console.log(orders[i]);
            let total = await doCalOrderTotal(orders[i].Items);
            let orderDate = new Date(orders[i].createdAt);
            let fmtDate = common.doFormatDateStr(orderDate);
            let fmtTime = common.doFormatTimeStr(orderDate);
            let ownerOrderFullName = orders[i].userinfo.User_NameTH + ' ' + orders[i].userinfo.User_LastNameTH;
            let orderBox = $('<div class="order-box"></div>').css({'width': '125px', 'position': 'relative', 'min-height': '150px', 'border': '2px solid black', 'border-radius': '5px', 'display': 'inline-block', /*'float': 'left', 'clear': 'left',*/ 'cursor': 'pointer', 'padding': '5px', 'margin-left': '8px', 'margin-top': '10px'});
            $(orderBox).append($('<div><b>ลูกค้า :</b> ' + orders[i].customer.Name + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b><span id ="opennerOrderLabel" class="sensitive-word">ผู้รับออร์เดอร์</span> :</b> ' + ownerOrderFullName + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>ยอดรวม :</b> ' + common.doFormatNumber(total) + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>วันที่-เวลา :</b> ' + fmtDate + ' : ' + fmtTime + '</div>').css({'width': '100%'}));
						$(orderBox).data('orderData', {id: orders[i].id});
						$(orderBox).append($('<span id="NotifyIndicator">0</span>').css({'display': 'none', 'position': 'absolute', 'top': '1px', 'right': '1px', 'color': 'white', 'background-color': 'red', 'height': '25px', 'width': '25px', 'line-height': '25px', 'border-radius': '50%', 'text-align': 'center'}));
						let mergeOrderCmdBox = undefined;
						let cancelOrderCmdBox = undefined;

						if (orders[i].Status == 1) {
							$(orderBox).css({'background-color': 'yellow'});
							mergeOrderCmdBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'center', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px', 'border': '1px solid black'});
							$(mergeOrderCmdBox).append($('<span id ="mergeOrderCmd" class="sensitive-word">ยุบรวมออร์เดอร์</span>').css({'font-weight': 'bold'}));
							$(mergeOrderCmdBox).on('click', async (evt)=>{
								evt.stopPropagation();
								mergeorderdlg.doMergeOrder(orders, i, async (newOrders, destIndex)=>{
									let params = {data: {Status: 0, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, shop: shopData, id: orders[i].id};
									let orderRes = await common.doCallApi('/api/shop/order/update', params);
									if (orderRes.status.code == 200) {
										$.notify("ยกเลิกรายการออร์เดอร์สำเร็จ", "success");
										params = {data: {Items: orders[destIndex].Items, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, shop: shopData, id: orders[destIndex].id};
					          orderRes = await common.doCallApi('/api/shop/order/update', params);
					          if (orderRes.status.code == 200) {
					            $.notify("ยุบรวมรายการออร์เดอร์สำเร็จ", "success");
											common.delay(500).then(async()=>{
												$('#OrderListBox').remove();
												let newOrderListBox = await doCreateOrderList(shopData, workAreaBox, orderReqParams.orderDate);
												$(workAreaBox).append($(newOrderListBox));
											});
					          } else {
					            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
					          }
									} else {
										$.notify("ระบบไม่สามารถยกเลิกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
									}
								});
							});
							$(orderBox).append($(mergeOrderCmdBox));
							cancelOrderCmdBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'center', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px', 'border': '1px solid black'});
							$(cancelOrderCmdBox).append($('<span id ="cancelOrderCmd" class="sensitive-word">ยกเลิกออร์เดอร์</span>').css({'font-weight': 'bold'}));
							$(cancelOrderCmdBox).on('click', async (evt)=>{
								evt.stopPropagation();
								let params = {data: {Status: 0, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, shop: shopData, id: orders[i].id};
								let orderRes = await common.doCallApi('/api/shop/order/update', params);
								if (orderRes.status.code == 200) {
									$.notify("ยกเลิกรายการออร์เดอร์สำเร็จ", "success");
									common.delay(500).then(async()=>{
										$('#OrderListBox').remove();
										let newOrderListBox = await doCreateOrderList(shopData, workAreaBox, orderReqParams.orderDate);
										$(workAreaBox).append($(newOrderListBox));
									});
								} else {
									$.notify("ระบบไม่สามารถยกเลิกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
								}
							});
							$(orderBox).append($(cancelOrderCmdBox));
							yellowOrders.push(orders[i]);
						} else if (orders[i].Status == 2) {
							$(orderBox).css({'background-color': 'orange'});
							let invoiceBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
							let openInvoicePdfCmd = $('<span>' + orders[i].invoice.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
							$(openInvoicePdfCmd).on('click', async (evt)=>{
								evt.stopPropagation();
								let docParams = {orderId: orders[i].id, shopId: shopData.id};
								let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
								console.log(docRes);
								if (docRes.status.code == 200) {
									closeorderdlg.doOpenReportPdfDlg(docRes.result, 'ใบแจ้งหนี้');
									//const pdfURL = docRes.result.link + '?t=' + common.genUniqueID();
									//const reportPdfDlgContent = $('<object data="' + pdfURL + '" type="application/pdf" width="99%" height="380"></object>');
									$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
								} else if (docRes.status.code == 300) {
									$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
								}
							});
							let openInvoiceQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
							$(openInvoiceQrCmd).on('click', (evt)=>{
								evt.stopPropagation();
								let shareCode = orders[i].invoice.Filename.split('.')[0];
								window.open('/shop/share/?id=' + shareCode, '_blank');
							});
							$(invoiceBox).append($(openInvoicePdfCmd)).append($(openInvoiceQrCmd));
							$(orderBox).append($(invoiceBox));
							orangeOrders.push(orders[i]);
						} else if ((orders[i].Status == 3) || (orders[i].Status == 4)) {
							$(orderBox).css({'background-color': 'green'});
							if (orders[i].bill){
								let billBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
								let openBillPdfCmd = $('<span>' + orders[i].bill.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
								$(openBillPdfCmd).on('click', (evt)=>{
									evt.stopPropagation();
									closeorderdlg.doOpenReportPdfDlg({link: '/shop/img/usr/pdf/' + orders[i].bill.Filename}, 'บิลเงินสด/ใบเสร็จรับเงิน');
								});
								let openBillQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
								$(openBillQrCmd).on('click', (evt)=>{
									evt.stopPropagation();
									let shareCode = orders[i].bill.Filename.split('.')[0];
									window.open('/shop/share/?id=' + shareCode, '_blank');
								});
								$(billBox).append($(openBillPdfCmd)).append($(openBillQrCmd));
								$(orderBox).append($(billBox));
							}
							if (orders[i].taxinvoice){
								let taxinvoiceBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
								let openTaxInvoicePdfCmd = $('<span>' + orders[i].taxinvoice.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
								$(openTaxInvoicePdfCmd).on('click', (evt)=>{
									evt.stopPropagation();
									closeorderdlg.doOpenReportPdfDlg({link: '/shop/img/usr/pdf/' + orders[i].taxinvoice.Filename}, 'ใบกำกับภาษี');
								});
								let openTaxInvoiceQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
								$(openTaxInvoiceQrCmd).on('click', (evt)=>{
									evt.stopPropagation();
									let shareCode = orders[i].taxinvoice.Filename.split('.')[0];
									window.open('/shop/share/?id=' + shareCode, '_blank');
								});
								$(taxinvoiceBox).append($(openTaxInvoicePdfCmd)).append($($(openTaxInvoiceQrCmd)));
								$(orderBox).append($(taxinvoiceBox));
							}
							greenOrders.push(orders[i]);
						} else if (orders[i].Status == 0) {
							$(orderBox).css({'background-color': 'grey'});
							$(orderBox).addClass('canceled-order');
							greyOrders.push(orders[i]);
						}
            $(orderBox).on('click', (evt)=>{
							evt.stopPropagation();
              let orderData = {customer: orders[i].customer, gooditems: orders[i].Items, id: orders[i].id, Status: orders[i].Status};
              $(orderListBox).remove();
              doOpenOrderForm(shopData, workAreaBox, orderData, orderDate);
            });

						if (common.shopSensitives.includes(shopData.id)) {
							let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
							$(orderBox).find("#opennerOrderLabel").text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'opennerOrderLabel') return item}).customWord) ;
							if (mergeOrderCmdBox) {
								$(mergeOrderCmdBox).find("#mergeOrderCmd").text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'mergeOrderCmd') return item}).customWord) ;
							}
							if (cancelOrderCmdBox) {
								$(cancelOrderCmdBox).find("#cancelOrderCmd").text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'cancelOrderCmd') return item}).customWord) ;
							}
						}

            $(orderListBox).append($(orderBox));
          }
          setTimeout(()=>{
            resolve2($(orderListBox));
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
          $(workAreaBox).append($(ob[0]));
					$('#App').find('#SummaryBox').remove();
					let summaryData = {yellowOrders, orangeOrders, greenOrders, greyOrders};
					let summaryBox = $('<div id="SummaryBox"></div>').css({'position': 'relative', 'width': '99%', 'min-height': '60px', 'cursor': 'pointer', 'font-size': '18px', 'text-align': 'center', 'background-color': ' #dddd', 'border': '2px solid grey', 'margin-top': '45px', 'overflow': 'auto'});
					$(summaryBox).append($('<span><b>สรุป</b></span>').css({'line-height': '60px'}));
					$(summaryBox).data('summaryData', summaryData);
					$(summaryBox).on('click', (evt)=>{
						doShowSummaryOrder(evt);
						$(summaryBox).off('click');
					});
					$('#App').append($(summaryBox).css({'padding': '5px'}));
					resolve(ob[0]);
        });

				//.off() ยกเลิกตัวจัดการเหตุการณ์ที่แนบมากับ .on()
				/*
				$('#SummaryBox').off('click');
				*/

      } else {
				let notFoundOrderDatbox = $('<div>ไม่พบรายการ<span id="notFoundOrderDatbox" class="sensitive-word">ออร์เดอร์</span>ของวันที่ ' + orderDate + '</div>');
				if (common.shopSensitives.includes(shopData.id)) {
					let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
					$(notFoundOrderDatbox).find("#notFoundOrderDatbox").text(sensitiveWordJSON.find((item)=>{if(item.elementId === 'notFoundOrderDatbox') return item}).customWord) ;
				}
				$(orderListBox).append($(notFoundOrderDatbox));
				$('#App').find('#SummaryBox').remove();
        resolve($(orderListBox));
      }
    });
  }

	const doEditPriceOnTheFly = function(event, gooditems, index, successCallback){
		let editInput = $('<input type="number"/>').val(common.doFormatNumber(Number(gooditems[index].Price))).css({'width': '100px', 'margin-left': '20px'});
		$(editInput).on('keyup', (evt)=>{
			if (evt.keyCode == 13) {
				$(dlgHandle.okCmd).click();
			}
		});
		let editLabel = $('<label>ราคา:</label>').attr('for', $(editInput)).css({'width': '100%'});
		let editOption = $('<input type="checkbox" checked="checked"/>').css({'transform' : 'scale(1.5)'});
		let optionLabel = $('<label>บันทึกการแก้ไขราคาลงในข้อมูลสินค้า</label>').attr('for', $(editOption)).css({'width': '100%'});
		let editBox = $('<div></div>').css({'width': '100%', 'height': '70px', 'margin-top': '20px'});
		$(editBox).append($('<div></div>').append($(editLabel)).append($(editInput)));
		$(editBox).append($('<div style="margin-top: 6px;"></div>').append($(editOption)).append($(optionLabel)));
		let editDlgOption = {
			title: 'แก้ไขราคา',
			msg: $(editBox),
			width: '350px',
			onOk: async function(evt) {
				let newValue = $(editInput).val();
				if(newValue !== '') {
					$(editInput).css({'border': ''});
					let optionUpdate = $(editOption).prop("checked");
					if (optionUpdate == true) {
						let params = {data: {Price: newValue}, id: gooditems[index].id};
						let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
						if (menuitemRes.status.code == 200) {
							$.notify("แก้ไขรายการสินค้าสำเร็จ", "success");
							dlgHandle.closeAlert();
							successCallback(newValue);
						} else if (menuitemRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการสินค้าได้", "error");
						}
					} else {
						dlgHandle.closeAlert();
						successCallback(newValue);
					}
				} else {
					$.notify('ราคาสินค้าต้องไม่ว่าง', 'error');
					$(editInput).css({'border': '1px solid red'});
				}
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		return dlgHandle;
	}

	const doEditMenuNameOnTheFly = function(event, gooditems, index, successCallback){
		let editInput = $('<input type="text"/>').val(gooditems[index].MenuName).css({'width': '340px', 'margin-left': '20px'});
		$(editInput).on('keyup', (evt)=>{
			if (evt.keyCode == 13) {
				$(dlgHandle.okCmd).click();
			}
		});
		let editLabel = $('<label>ชื่อสินค้า:</label>').attr('for', $(editInput)).css({'width': '100%'})
		let editOption = $('<input type="checkbox" checked="checked"/>').css({'transform' : 'scale(1.5)'});
		let optionLabel = $('<label>บันทึกการแก้ไขชื่อสินค้าลงในข้อมูลสินค้า</label>').attr('for', $(editOption)).css({'width': '100%'});
		let editBox = $('<div></div>').css({'width': '100%', 'height': '70px', 'margin-top': '20px'});
		$(editBox).append($('<div></div>').append($(editLabel)).append($(editInput)));
		$(editBox).append($('<div style="margin-top: 6px;"></div>').append($(editOption)).append($(optionLabel)));
		let editDlgOption = {
			title: 'แก้ไขชื่อสินค้า',
			msg: editBox,
			width: '450px',
			onOk: async function(evt) {
				let newValue = $(editInput).val();
				if(newValue !== '') {
					$(editInput).css({'border': ''});
					let optionUpdate = $(editOption).prop("checked");
					if (optionUpdate == true) {
						let params = {data: {MenuName: newValue}, id: gooditems[index].id};
						let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
						if (menuitemRes.status.code == 200) {
							$.notify("แก้ไขรายการสินค้าสำเร็จ", "success");
							dlgHandle.closeAlert();
							successCallback(newValue);
						} else if (menuitemRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการสินค้าได้", "error");
						}
					} else {
						dlgHandle.closeAlert();
						successCallback(newValue);
					}
				} else {
					$.notify('ชื่อสินค้าต้องไม่ว่าง', 'error');
					$(editInput).css({'border': '1px solid red'});
				}
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		return dlgHandle;
	}

	const doEditQtyOnTheFly = function(event, gooditems, index, successCallback){
		let editInput = $('<input type="number"/>').val(common.doFormatNumber(Number(gooditems[index].Qty))).css({'width': '100px', 'margin-left': '20px'});
		$(editInput).on('keyup', (evt)=>{
			if (evt.keyCode == 13) {
				$(dlgHandle.okCmd).click();
			}
		});
		let editLabel = $('<label>จำนวน:</label>').attr('for', $(editInput)).css({'width': '100%'})
		let editDlgOption = {
			title: 'แก้ไขจำนวน',
			msg: $('<div></div>').css({'width': '100%', 'height': '70px', 'margin-top': '20px'}).append($(editLabel)).append($(editInput)),
			width: '220px',
			onOk: async function(evt) {
				let newValue = $(editInput).val();
				if(newValue !== '') {
					$(editInput).css({'border': ''});
					/*
					let params = {data: {Qty: newValue}, id: gooditems[index].id};
					let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
					if (menuitemRes.status.code == 200) {
						$.notify("แก้ไขรายการสินค้าสำเร็จ", "success");
						dlgHandle.closeAlert();
						successCallback(newValue);
					} else if (menuitemRes.status.code == 201) {
						$.notify("ไม่สามารถแก้ไขรายการสินค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการสินค้าได้", "error");
					}
					*/
					dlgHandle.closeAlert();
					successCallback(newValue);
				} else {
					$.notify('จำนวนสินค้าต้องไม่ว่าง', 'error');
					$(editInput).css({'border': '1px solid red'});
				}
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		return dlgHandle;
	}

	const doShowSummaryOrder = function(evt){
		return new Promise(async function(resolve, reject) {
			//let summaryData = {yellowOrders, orangeOrders, greenOrders, greyOrders};
			let summaryBox = $(evt.currentTarget);
			let summaryData = $(summaryBox).data('summaryData');
			let summaryTable = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let summaryRow = $('<div style="display: table-row; width: 100%;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>ประเภท</b></span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>จำนวน</b></span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>มูลค่ารวม</b></span>'));
			$(summaryTable).append($(summaryRow));
			let cancelAmount = 0;
			for (let i=0; i < summaryData.greyOrders.length; i++){
				cancelAmount += await doCalOrderTotal(summaryData.greyOrders[i].Items);
			}
			let newAmount = 0;
			for (let i=0; i < summaryData.yellowOrders.length; i++){
				newAmount += await doCalOrderTotal(summaryData.yellowOrders[i].Items);
			}
			let invoiceAmount = 0;
			for (let i=0; i < summaryData.orangeOrders.length; i++){
				invoiceAmount += await doCalOrderTotal(summaryData.orangeOrders[i].Items);
			}
			let successAmount = 0;
			for (let i=0; i < summaryData.greenOrders.length; i++){
				successAmount += await doCalOrderTotal(summaryData.greenOrders[i].Items);
			}

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: grey;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">ยกเลิก</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.greyOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(cancelAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: yellow;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">ออร์เดอร์ใหม่</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.yellowOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(newAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: orange;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">รอเก็บเงิน</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.orangeOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(invoiceAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: green;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">เก็บเงินแล้ว</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.greenOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(successAmount)));
			$(summaryTable).append($(summaryRow));

			$(summaryBox).empty().append($(summaryTable));

			$(summaryBox).on('click', (evt)=>{
				$(summaryBox).off('click');
				$(summaryBox).empty().append($('<span><b>สรุป</b></span>').css({'line-height': '60px'}));
				$(summaryBox).on('click', (evt)=>{
					$(summaryBox).off('click');
					doShowSummaryOrder(evt);
				});
			});
			resolve();
		});
	}

	const doRenderGooditemInfo = function(goodItemData, sum){
		let mainBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'height': 'auto'});
		let gooditemNameBox = $('<div></div>').append($('<h2></h2>').text(goodItemData.MenuName)).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'center'});
		$(mainBox).append($(gooditemNameBox));
		if (goodItemData.MenuPicture !== '') {
			let goodItemImage = $('<img width="140" height="auto"/>').attr('src', goodItemData.MenuPicture).css({'cursor': 'pointer'});
			$(goodItemImage).on('click', (evt)=>{
				window.open(goodItemData.MenuPicture, '_blank');
			});
			let gooditemPictureBox = $('<div></div>').append($(goodItemImage)).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'center'});
			$(mainBox).append($(gooditemPictureBox));
		}
		if (goodItemData.Desc !== '') {
			let gooditemDescBox = $('<div></div>').append($('<p></p>').text(goodItemData.Desc)).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left'});
			$(mainBox).append($(gooditemDescBox));
		}
		let gooditemPriceBox = $('<div></div>').append($('<p></p>').html('<span>ราคา(ขาย)</span><span style="margin-left: 5px; font-weight: bold;">' + goodItemData.Price + '</span>')).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left'});
		$(mainBox).append($(gooditemPriceBox));
		let gooditemUnitBox = $('<div></div>').append($('<p></p>').html('<span>หน่วย(ขาย)</span><span style="margin-left: 5px; font-weight: bold;">' + goodItemData.Unit + '</span>')).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left'});
		$(mainBox).append($(gooditemUnitBox));
		let gooditemGroupNameBox = $('<div></div>').append($('<p></p>').html('<span>กลุ่ม</span><span style="margin-left: 5px; font-weight: bold;">' + goodItemData.menugroup.GroupName + '</span>')).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left'});
		$(mainBox).append($(gooditemGroupNameBox));
		if ((sum==0) || (sum>0) || (sum<0)) {
			let gooditemSumStockBox = $('<div></div>').append($('<p></p>').html('<span>ยอดสต็อคสุทธิ</span><span style="margin-left: 5px; font-weight: bold;">' + common.doFormatQtyNumber(sum) + '</span>')).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left', 'background-color': '#ddd'});
			if (sum > 0) {
				$(gooditemSumStockBox).css({'border': '2px solid green'});
			} else {
				$(gooditemSumStockBox).css({'border': '2px solid red'});
			}
			$(mainBox).append($(gooditemSumStockBox));
		} else {
			let gooditemSumStockBox = $('<div></div>').append($('<p></p>').html('<span>ยังไม่เปิดใช้งานเชื่อมต่อระบบสต็อค</span>')).css({'position': 'relative', 'width': '100%', 'height': 'auto', 'text-align': 'left', 'background-color': '#ddd'});
			$(gooditemSumStockBox).css({'border': '2px solid black'});
			$(mainBox).append($(gooditemSumStockBox));
		}
		return $(mainBox);
	}

	const doShowStockInfo = function(goodItemData, sum){
		let goodItemInfoBox = doRenderGooditemInfo(goodItemData, sum);
		let editDlgOption = {
			title: 'ข้อมูลสินค้า',
			msg: $(goodItemInfoBox),
			width: '420px',
			onOk: async function(evt) {
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		$(dlgHandle.cancelCmd).hide();
	}

	const doSplitGooditem = function(event, shopData, orderData, index, orderDate, successCallback){
		return new Promise(async function(resolve, reject) {
			let gooditems = orderData.gooditems;
			let orderReqParams = {orderDate: orderDate};
			let orderRes = await common.doCallApi('/api/shop/order/active/by/shop/' + shopData.id, orderReqParams);
			let orders = orderRes.Records;

			let splitForm = $('<div></div>').css({'width': '100%'});
			$(splitForm).append('<p>โปรดเลือกออเดอร์ปลายทางที่จะแยกรายการนี้ไป</p>');
			for (let i=0; i < orders.length; i++) {
				let order = orders[i];
				if (order.id != orderData.id) {
					let targetOrder = $('<div></div>').css({'width': '100%', 'text-align': 'center', 'margin-top': '5px', 'background-color': 'yellow', 'border': '2px solid black', 'cursor': 'pointer'});
					$(targetOrder).append($('<p></p>').text(order.customer.Name));
					if ((order.customer.Address) && (order.customer.Address !== '')) {
						$(targetOrder).append($('<p></p>').text(order.customer.Address).css({'font-size': '14px'}));
					}
					$(targetOrder).on('click', async (evt)=>{
						let params = {srcOrderId: orderData.id, tgtOrderId: order.id, srcIndex: index};
						let orderRes = await common.doCallApi('/api/shop/order/swap/item', params);
						if (orderRes.status.code == 200) {
							$.notify("ย้ายบิลสำเร็จ", "success");
							// re-render Src order form
							orderData.gooditems = orderRes.srcOrders[0].Items;
							successCallback(orderData);
							dlgHandle.closeAlert();
						} else {
							$.notify("ระบบไม่สามารถย้ายบิลได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
							dlgHandle.closeAlert();
						}
					});
					$(splitForm).append($(targetOrder));
				}
			}
			let newOrder = $('<div></div>').css({'width': '100%', 'text-align': 'center', 'margin-top': '5px', 'background-color': '#2579B8', 'color': 'white', 'border': '2px solid black', 'cursor': 'pointer'});
			$(newOrder).append($('<p></p>').text('เปิดออเดอร์ใหม่'));
			$(newOrder).on('click', (evt)=>{
				let customers = JSON.parse(localStorage.getItem('customers'));
				//console.log(customers);
				$(splitForm).empty();
				$(splitForm).append('<p>โปรดเลือกชื่อลูกค้าสำหรับสร้างออเดอร์ใหม่</p>');
				let customerSelect = $('<select></select>');
				for (let i=0; i < customers.length; i++) {
					let customer = customers[i];
					let customerName = customer.Name;
					if ((customer.Address) && (customer.Address !== '')) {
						customerName = customerName + ' ' + customer.Address;
					}
					$(customerSelect).append($('<option value="' + customer.id + '">' + customerName + '</option>'));
				}
				$(customerSelect).append($('<option value="0">สร้างลูกค้าใหม่</option>'));
				$(splitForm).append($(customerSelect));
				newOrder = $('<div></div>').css({'width': '100%', 'text-align': 'center', 'margin-top': '5px', 'background-color': '#2579B8', 'color': 'white', 'border': '2px solid black', 'cursor': 'pointer'});
				$(newOrder).append($('<p></p>').text('สร้างออเดอร์ใหม่'));
				$(newOrder).on('click', async (evt)=>{
					let customerId = $(customerSelect).val();
					let userdata = JSON.parse(localStorage.getItem('userdata'));
					let userId = userdata.id;
					let userinfoId = userdata.userinfoId;
					params = {data: {Status: 1}, shopId: shopData.id, customerId: customerId, userId: userId, userinfoId: userinfoId};
					orderRes = await common.doCallApi('/api/shop/order/add', params);
          if (orderRes.status.code == 200) {
            $.notify("สร้างรายการออร์เดอร์สำเร็จ", "success");
						params = {srcOrderId: orderData.id, tgtOrderId: orderRes.Records[0].id, srcIndex: index};
						orderRes = await common.doCallApi('/api/shop/order/swap/item', params);
						if (orderRes.status.code == 200) {
							$.notify("ย้ายบิลสำเร็จ", "success");
							// re-render Src order form
							orderData.gooditems = orderRes.srcOrders[0].Items;
							successCallback(orderData);
							dlgHandle.closeAlert();
						} else {
							$.notify("ระบบไม่สามารถย้ายบิลได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
							dlgHandle.closeAlert();
						}
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ใหม่ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
						dlgHandle.closeAlert();
          }
				});
				$(splitForm).append($(newOrder));
				$(customerSelect).on('change', async (evt)=> {
					let selectedVal = $(customerSelect).val();
					if (selectedVal == 0) {
						$(splitForm).empty();
						$(splitForm).append('<p>โปรดระบุข้อมูลลูกค้าที่จะสร้างใหม่สำหรับสร้างออเดอร์ใหม่</p>');
						let tableForm = $('<table width="100%" cellspacing="4" cellpadding="0" border="0"></table>');
						let row = $('<tr></tr>');
						let cell1 = $('<td width="25%" align="left">ชื่อ <span style="color: red;">*</span></td>');
						let customerName = $('<input type="text"/>').css({'width': '180px'});
						let cell2 = $('<td width="*" align="left"></td>');
						$(cell2).append($(customerName));
						$(row).append(cell1).append(cell2);
						$(tableForm).append($(row));
						row = $('<tr></tr>');
						cell1 = $('<td align="left">ที่อยู่</td>');
						let customerAddress = $('<input type="text"/>').css({'width': '280px'});
						cell2 = $('<td align="left"></td>');
						$(cell2).append($(customerAddress));
						$(row).append(cell1).append(cell2);
						$(tableForm).append($(row));
						row = $('<tr></tr>');
						cell1 = $('<td align="left">เบอร์โทร</td>');
						let customerPhone = $('<input type="text"/>').css({'width': '180px'});
						cell2 = $('<td align="left"></td>');
						$(cell2).append($(customerPhone));
						$(row).append(cell1).append(cell2);
						$(tableForm).append($(row));
						$(splitForm).append($(tableForm));

						newOrder = $('<div></div>').css({'width': '100%', 'text-align': 'center', 'margin-top': '5px', 'background-color': '#2579B8', 'color': 'white', 'border': '2px solid black', 'cursor': 'pointer'});
						$(newOrder).append($('<p></p>').text('สร้างออเดอร์จากลูกค้าใหม่'));
						$(newOrder).on('click', async (evt)=>{
							if ($(customerName).val() !== '') {
								$(customerName).css({'border': ''});
								let newCustomer = {Name: $(customerName).val(), Address: $(customerAddress).val(), Tel: $(customerPhone).val()}
								params = {data: newCustomer, shopId: shopData.id};
								let userRes = await common.doCallApi('/api/shop/customer/add', params);
								if (userRes.status.code == 200) {
									$.notify("เพิ่มรายการลูกค้าสำเร็จ", "success");
									let newCustomerId = userRes.Record.id;
									let userdata = JSON.parse(localStorage.getItem('userdata'));
									let userId = userdata.id;
									let userinfoId = userdata.userinfoId;
									params = {data: {Status: 1}, shopId: shopData.id, customerId: newCustomerId, userId: userId, userinfoId: userinfoId};
									orderRes = await common.doCallApi('/api/shop/order/add', params);
									if (orderRes.status.code == 200) {
										$.notify("สร้างรายการออร์เดอร์สำเร็จ", "success");
										params = {srcOrderId: orderData.id, tgtOrderId: orderRes.Records[0].id, srcIndex: index};
										orderRes = await common.doCallApi('/api/shop/order/swap/item', params);
										if (orderRes.status.code == 200) {
											$.notify("ย้ายบิลสำเร็จ", "success");
											// re-render Src order form
											orderData.gooditems = orderRes.srcOrders[0].Items;
											successCallback(orderData);
											dlgHandle.closeAlert();
										} else {
											$.notify("ระบบไม่สามารถย้ายบิลได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
											dlgHandle.closeAlert();
										}
									} else {
				            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ใหม่ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
										dlgHandle.closeAlert();
				          }
								} else {
									$.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการลูกค้าได้", "error");
								}
							} else {
								$(customerName).css({'border': '1px solid red'});
								$.notify("ข้อมูลไม่ถูกต้อง", "error");
							}
						});
						$(splitForm).append($(newOrder));
					}
				});
			});
			$(splitForm).append($(newOrder));

			let splitDlgOption = {
				title: 'ย้ายออเดอร์',
				msg: $(splitForm),
				width: '400px',
				onOk: async function(evt) {
					dlgHandle.closeAlert();
				},
				onCancel: function(evt){
					dlgHandle.closeAlert();
				}
			}
			let dlgHandle = $('body').radalert(splitDlgOption);
			$(dlgHandle.okCmd).hide();
			resolve(orders);
		});
	}

  return {
    doShowOrderList,
		doShowCalendarDlg,
		doOpenOrderForm,
		doShowSummaryOrder
	}
}

},{"../../../home/mod/common-lib.js":2,"./calendar-dlg.js":6,"./closeorder-dlg.js":7,"./customer-dlg.js":8,"./gooditem-dlg.js":11,"./order-merge-dlg.js":16}],18:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);
	const shopmng = require('./shop-mng.js')($);

	const shopTableFields = [
		{fieldName: 'Shop_Name', displayName: 'ชื่อร้าน', width: '12%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_Address', displayName: 'ที่อยู่', width: '15%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_Tel', displayName: 'โทรศัพท์', width: '10%', align: 'left', inputSize: '20', verify: true, showHeader: true},
		{fieldName: 'Shop_Mail', displayName: 'อีเมล์', width: '10%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_LogoFilename', displayName: 'โลโก้', width: '10%', align: 'center', inputSize: '40', verify: false, showHeader: true},
		{fieldName: 'Shop_VatNo', displayName: 'VAT No.', width: '10%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_PromptPayNo', displayName: 'หมายเลขพร้อมเพย์', width: '8%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_PromptPayName', displayName: 'ขื่อบัญชีพร้อมเพย์', width: '10%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_BillQuota', displayName: 'Bill Quota', width: '7%', align: 'left', inputSize: '5', verify: false, showHeader: false},
		{fieldName: 'Shop_StockingOption', displayName: 'Stocking Connect', width: '7%', align: 'left', inputSize: '5', verify: false, showHeader: false},
		{fieldName: 'Shop_CookingOption', displayName: 'Cooking Connect', width: '7%', align: 'left', inputSize: '5', verify: false, showHeader: false},
		{fieldName: 'id', displayName: 'ShopId', width: '5%', align: 'center', inputSize: '40', verify: false, showHeader: false}
	];

	const doCreateShopListTable = function(shopItems, pOptions) {
		let shopTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let headerRow = $('<tr></tr>');
		$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
		for (let i=0; i < shopTableFields.length; i++) {
			if (shopTableFields[i].showHeader) {
				$(headerRow).append($('<td width="' + shopTableFields[i].width + '" align="center"><b>' + shopTableFields[i].displayName + '</b></td>'));
			}
		}
		$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
		$(shopTable).append($(headerRow));

		let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
		let itemPerPage = userDefualtSetting.itemperpage;
		let currentPage = userDefualtSetting.currentPage;

		let from = ((currentPage-1) * itemPerPage);
		let to = Number(from) + (Number(itemPerPage));

		/*
		console.log(from);
		console.log(to);
		*/

		for (let x=from; x < to; x++) {
			let itemRow = $('<tr></tr>');
			$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
			let item = shopItems[x];
			if (item) {
				for (let i=0; i < shopTableFields.length; i++) {
					if (shopTableFields[i].showHeader) {
						let field = $('<td align="' + shopTableFields[i].align + '"></td>');
						if (shopTableFields[i].fieldName !== 'Shop_LogoFilename') {
							$(field).text(item[shopTableFields[i].fieldName]);
							$(itemRow).append($(field));
						} else {
							let shopLogoIcon = new Image();
							shopLogoIcon.id = 'Shop_LogoFilename_' + item.id;
							if (item['Shop_LogoFilename'] !== ''){
								shopLogoIcon.src = item['Shop_LogoFilename'];
							} else {
								shopLogoIcon.src = '/shop/favicon.ico'
							}
							$(shopLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
							$(shopLogoIcon).on('click', (evt)=>{
								window.open(item['Shop_LogoFilename'], '_blank');
							});
							$(field).append($(shopLogoIcon));
							let updateShopLogoCmd = $('<input type="button" value=" เปลี่ยนรูป " class="action-btn"/>');
							$(updateShopLogoCmd).on('click', (evt)=>{
								doStartUploadPicture(evt, field, item.id);
							});
							$(field).append($('<div style="width: 100%; text-align: center;"></div>').append($(updateShopLogoCmd)));
							$(itemRow).append($(field));
						}
					}
				}
				let editShopCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editShopCmd).on('click', (evt)=>{
					doOpenEditShopForm(item);
				});
				let mngShopCmd = $('<input type="button" value=" Manage " class="action-btn"/>').css({'margin-left': '8px'});
				$(mngShopCmd).on('click', (evt)=>{
					doOpenManageShop(item, doStartUploadPicture, doOpenEditShopForm);
				});
				let deleteShopCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteShopCmd).on('click', (evt)=>{
					doDeleteShop(item.id);
				});

				let commandCell = $('<td align="center"></td>');
				$(commandCell).append($(editShopCmd)).append($(mngShopCmd)).append($(deleteShopCmd));
				$(itemRow).append($(commandCell));
				$(shopTable).append($(itemRow));
			}
		}
		return $(shopTable);
	}

  const doShowShopItem = function(currentPage){
    return new Promise(async function(resolve, reject) {
			let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
			let itemPerPage = userDefualtSetting.itemperpage;
			let currentPage = userDefualtSetting.currentPage;

			$('#App').empty();
      let shopRes = await common.doCallApi('/api/shop/shop/list', {});
			if ((shopRes) &&/* (shopRes.status) && (shopRes.status.code) && */ (shopRes.status.code == 210)) {
		    common.doUserLogout();
			}
			let shopItems = shopRes.Records;
			let titlePageBox = $('<div style="padding: 4px;">รายการร้านค้าในระบบ</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			let logoutCmd = $('<span>ออกจากระบบ</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'absolute', 'right': '5px', 'top': '8px', 'padding': '4px', 'font-size': '14px'});
			$(logoutCmd).on('click', (evt)=>{
				common.doUserLogout();
			});
			$(titlePageBox).append($(logoutCmd));

			$('#App').append($(titlePageBox));

			let newShopCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let newShopCmd = $('<input type="button" value=" + New Shop " class="action-btn"/>');
			$(newShopCmd).on('click', (evt)=>{
				doOpenNewShopForm();
			});
			$(newShopCmdBox).append($(newShopCmd))
			$('#App').append($(newShopCmdBox));

			let shopTable = undefined;

			const doControlItemDisplayPage = function() {
				//console.log(shopItems.length <= itemPerPage);
				if (shopItems.length <= itemPerPage) {
					shopTable = doCreateShopListTable(shopItems);
					$('#App').append($(shopTable));
				} else {
					let from = (currentPage * itemPerPage) - 1;
					let pOp = {from: from, to: (from + itemPerPage)-1};
					shopTable = doCreateShopListTable(shopItems, pOp);
					$('#App').append($(shopTable));
					let defaultNavPage = {
						currentPage: currentPage? currentPage:1,
						itemperPage: itemPerPage,
						totalItem: shopItems.length,
						styleClass : {'padding': '4px', 'margin-top': '60px'},
					}
					defaultNavPage.changeToPageCallback = function(page) {
						$(shopTable).remove();
						itemPerPage = page.perPage;
						let newFrom = (itemPerPage * (page.toPage - 1));
						let newTo = (newFrom + itemPerPage) - 1;
						if (newTo > shopItems.length) {
							newTo = shopItems.length - 1;
						}
						pOp = {from: newFrom, to: newTo};
						//console.log(pOp);
						shopTable = doCreateShopListTable(shopItems, pOp);
						$(shopTable).insertBefore($(navigBarBox));
						/*
						let userDefualtSetting = {itemperpage:page.perPage, currentPage: defaultNavPage.currentPage};
						localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));
						*/
					}

					let navigBarBox = $('<div id="NavigBar"></div>');
					let navigatoePage = $(navigBarBox).controlpage(defaultNavPage);

					setTimeout(()=>{
						$('#App').append($(navigBarBox));
						navigatoePage.toPage(userDefualtSetting.currentPage);
					}, 200);
				}
			}

			/*
				การอัพโหลดภาพโลโก้ร้าน ในหน้ารายการตั้งแต่หน้า 2 เมื่ออัพโหลดเสร็จ ระบบจะแสดงรายการในหน้า 1
				ที่ถูกต้องคือ หน้ารายการที่กำลังสั่งอัพโหลดต่างหาก
				from หมายถึง fromItem ไม่ใช่ fromPage
			*/

			doControlItemDisplayPage();
			resolve();
    });
  }

	const doCreateShopForm = function(shopData){
		let shopFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < shopTableFields.length; i++) {
			if ((shopTableFields[i].fieldName !== 'id') && (shopTableFields[i].fieldName !== 'Shop_LogoFilename')) {
				let fieldRow = $('<tr></tr>');
				let labelField = $('<td width="40%" align="left">' + shopTableFields[i].displayName + (shopTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
				let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
				let inputValue = $('<input type="text" id="' + shopTableFields[i].fieldName + '" size="' + shopTableFields[i].inputSize + '"/>');
				if ((shopData) && (shopData[shopTableFields[i].fieldName])) {
					$(inputValue).val(shopData[shopTableFields[i].fieldName]);
				}
				$(inputField).append($(inputValue));
				$(fieldRow).append($(labelField));
				$(fieldRow).append($(inputField));
				$(shopFormTable).append($(fieldRow));
			}
		}
		return $(shopFormTable);
	}

	const doVerifyShopForm = function(){
		let isVerify = true;
		let shopDataForm = {};
		for (let i=0; i < shopTableFields.length; i++) {
			if (shopTableFields[i].fieldName !== 'Shop_LogoFilename') {
				let curValue = $('#'+shopTableFields[i].fieldName).val();
				if (shopTableFields[i].verify) {
					if (curValue !== '') {
						$('#'+shopTableFields[i].fieldName).css({'border': ''});
						shopDataForm[shopTableFields[i].fieldName] = curValue;
						isVerify = isVerify && true;
					} else {
						$('#'+shopTableFields[i].fieldName).css({'border': '1px solid red'});
						isVerify = isVerify && false;
						return;
					}
				} else {
					if (curValue !== '') {
						shopDataForm[shopTableFields[i].fieldName] = curValue;
						isVerify = isVerify && true;
					}
				}
			}
		}
		return shopDataForm;
	}

	const doStartUploadPicture = function(evt, imageBox, shopId, callback){
		let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'shoplogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= common.fileUploadMaxSize) {
        doUploadImage(fileBrowser, shopId, callback);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + common.fileUploadMaxSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
	}

	const doUploadImage = function(fileBrowser, shopId, callback){
		var uploadUrl = '/api/shop/upload/shoplogo';
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
				let shopRes = await common.doCallApi('/api/shop/shop/change/logo', {data: {Shop_LogoFilename: data.link}, id: shopId});
				if (callback) {
					callback(data);
				} else {
					setTimeout(async() => {
						let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
						let currentPage = userDefualtSetting.currentPage;
						await doShowShopItem(currentPage);
      		}, 400);
				}
      },
    });
	}

	const doOpenNewShopForm = function(){
		let initShop = {Shop_BillQuota: '500', Shop_StockingOption: '0'};
		let shopNewForm = doCreateShopForm(initShop);
		let radNewShopFormBox = $('<div></div>');
		$(radNewShopFormBox).append($(shopNewForm));
		const newshopformoption = {
			title: 'เพิ่มร้านค้าใหม่เข้าสู่ระบบ',
			msg: $(radNewShopFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newShopFormObj = doVerifyShopForm();
				if (newShopFormObj) {
					let hasValue = newShopFormObj.hasOwnProperty('Shop_Name');
					if (hasValue){
						newShopFormBox.closeAlert();
						newShopFormObj.Shop_LogoFilename = '';
						if (!newShopFormObj.Shop_VatNo) {
							newShopFormObj.Shop_VatNo = '';
						}
						let shopRes = await common.doCallApi('/api/shop/shop/add', newShopFormObj);
						if (shopRes.status.code == 200) {
							$.notify("เพิ่มรายการร้านค้าสำเร็จ", "success");
							let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
							let currentPage = userDefualtSetting.currentPage;
							await doShowShopItem(currentPage);
						} else if (shopRes.status.code == 201) {
							$.notify("ไม่สามารถเพิ่มรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการร้านค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				newShopFormBox.closeAlert();
			}
		}
		let newShopFormBox = $('body').radalert(newshopformoption);
	}

	const doOpenEditShopForm = function(shopData, successCallback){
		let shopEditForm = doCreateShopForm(shopData);
		let radEditShopFormBox = $('<div></div>');
		$(radEditShopFormBox).append($(shopEditForm));
		const editshopformoption = {
			title: 'แก้ไขข้อมูลร้านค้า',
			msg: $(radEditShopFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editShopFormObj = doVerifyShopForm();
				if (editShopFormObj) {
					let hasValue = editShopFormObj.hasOwnProperty('Shop_Name');
					if (hasValue){
						editShopFormBox.closeAlert();
						//editShopFormObj.Shop_LogoFilename = '';
						if (!editShopFormObj.Shop_VatNo) {
							editShopFormObj.Shop_VatNo = '';
						}
						let params = {data: editShopFormObj, id: shopData.id}
						let shopRes = await common.doCallApi('/api/shop/shop/update', params);
						if (shopRes.status.code == 200) {
							$.notify("แก้ไขรายการร้านค้าสำเร็จ", "success");
							if (successCallback) {
								successCallback(editShopFormObj);
							} else {
								let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
								let currentPage = userDefualtSetting.currentPage;
								await doShowShopItem(currentPage);
							}
						} else if (shopRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการร้านค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editShopFormBox.closeAlert();
			}
		}
		let editShopFormBox = $('body').radalert(editshopformoption);
	}

	const doOpenManageShop = function(shopData, uploadLogoCallback, editShopCallback){
		shopmng.doShowShopMng(shopData, uploadLogoCallback, editShopCallback);
		if (common.shopSensitives.includes(shopData.id)) {
	    let sensitiveWordJSON = require('../../../../../api/shop/lib/sensitive-word.json');
	    localStorage.setItem('sensitiveWordJSON', JSON.stringify(sensitiveWordJSON))
	    sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
	    common.delay(500).then(async ()=>{
	      await common.doResetSensitiveWord(sensitiveWordJSON);
	    });
	  }
	}

	const doDeleteShop = function(shopId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบร้านค้ารายการที่เลือกออกจากระบบฯ ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบร้านค้า</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบร้านค้า',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let shopRes = await common.doCallApi('/api/shop/shop/delete', {id: shopId});
				if (shopRes.status.code == 200) {
					$.notify("ลบรายการร้านค้าสำเร็จ", "success");
					let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
					let currentPage = userDefualtSetting.currentPage;
					await doShowShopItem(currentPage);
				} else if (shopRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการร้านค้าได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowShopItem,
		doOpenManageShop,
		doCreateShopForm,
		doOpenEditShopForm,
		doStartUploadPicture
	}
}

},{"../../../../../api/shop/lib/sensitive-word.json":1,"../../../home/mod/common-lib.js":2,"./shop-mng.js":19}],19:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);

  const common = require('../../../home/mod/common-lib.js')($);
	const user = require('./user-mng.js')($);
	const customer = require('./customer-mng.js')($);
	const menugroup = require('./menugroup-mng.js')($);
	const menuitem = require('./menuitem-mng.js')($);
	const order = require('./order-mng.js')($);
	const template = require('./template-design.js')($);
	const message = require('./message-mng.js')($);

  const doCreateTitlePage = function(shopData, uploadLogoCallback, editShopCallback){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
    let shopLogoIcon = new Image();
    if (shopData['Shop_LogoFilename'] !== ''){
    	shopLogoIcon.src = shopData['Shop_LogoFilename'];
    } else {
    	shopLogoIcon.src = '/shop/favicon.ico'
    }
		$(shopLogoIcon).css({"width": "140px", "height": "auto", "padding": "2px", "display": "block", "z-index": "9", "cursor": "pointer"});
		$(shopLogoIcon).on('click', (evt)=>{
			evt.stopPropagation();
			window.open(shopLogoIcon.src, '_blank');
		});
		let shopLogoIconBox = $('<div></div>').css({"position": "relative"/*, "border": "2px solid #ddd"*/ });
    $(shopLogoIconBox).append($(shopLogoIcon));
		let editShopLogoCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'position': 'absolute', 'width': '25px', 'height': 'auto', 'cursor': 'pointer', 'right': '2px', 'bottom': '2px', 'display': 'none', 'z-index': '21'});
		$(shopLogoIconBox).append($(editShopLogoCmd));
		$(shopLogoIconBox).hover(()=>{
			$(editShopLogoCmd).show();
		},()=>{
			$(editShopLogoCmd).hide();
		});
		$(editShopLogoCmd).on('click', (evt)=>{
			evt.stopPropagation();
			uploadLogoCallback(evt, shopLogoIconBox, shopData.id, (successData)=>{
				shopLogoIcon.src = successData.link;
			});
		});

    let shopName = $('<h2>' + shopData['Shop_Name'] + '</h2>').css({'line-height': '20px'});
    let shopAddress = $('<p>' + shopData['Shop_Address'] + '</p>').css({'line-height': '11px'});
    let shopTel = $('<p>โทร. ' + shopData['Shop_Tel'] + '</p>').css({'line-height': '11px'});

    let titlePageBox = $('<div style="padding: 4px;"></viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '18px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
    let layoutPage = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let layoutRow = $('<tr></tr>');
    let letfSideCell = $('<td width="20%" align="center" valign="middle"></td>');
    let middleCell = $('<td width="65%" align="left" valign="middle" style="padding: 5px"></td>');
    let rightSideCell = $('<td width="*" align="center" style="position: relative;"></td>');
    $(letfSideCell).append($(shopLogoIconBox));
    $(middleCell).append($(shopName)).append($(shopAddress)).append($(shopTel));


		let shopMail = $('<p>อีเมล์ ' + shopData['Shop_Mail'] + '</p>').css({'line-height': '11px'});
    let shopVatNo = $('<p>หมายเลขผู้เสียภาษี ' + shopData['Shop_VatNo'] + '</p>').css({'line-height': '11px'});
		let shopPPQCNo = $('<p>หมายเลขพร้อมเพย์ <span>' + shopData['Shop_PromptPayNo'] + '</span></p>').css({'line-height': '11px'});

		if (shopData['Shop_Mail'] !== '') {
			$(middleCell).append($(shopMail));
			$(shopMail).hide();
		}
		if (shopData['Shop_VatNo'] !== '') {
			$(middleCell).append($(shopVatNo));
			$(shopVatNo).hide();
		}
		if ((shopData['Shop_PromptPayNo']) && (shopData['Shop_PromptPayNo'] !== '')) {
			$(middleCell).append($(shopPPQCNo));
			$(shopPPQCNo).hide();
		}

		let shopBillUsage = $('<p>จำนวนบิลที่ใช้<span id="BillDateChangeCmd">เดือนนี้</span> <span id="BillAmount" style="font-weight: bold;">0</span> บิล</p>').css({'line-height': '11px'});
		$(middleCell).append($(shopBillUsage));
		$(shopBillUsage).hide();

		let shopTaxinvoiceUsage = $('<p>จำนวนใบกำกับภาษีที่ใช้<span id="TaxInvoiceDateChangeCmd">เดือนนี้</span> <span id="TaxInvoiceAmount" style="font-weight: bold;">0</span> ใบ</p>').css({'line-height': '11px'});
		$(middleCell).append($(shopTaxinvoiceUsage));
		$(shopTaxinvoiceUsage).hide();

		let billUsageUrl = '/api/shop/bill/mount/count/' + shopData.id
		let params = {};
		common.doCallApi(billUsageUrl, params).then(async(billRes)=>{
			$('#BillAmount').text(billRes.count);
			if (shopData['Shop_VatNo'] !== '') {
				let taxinvoiceRes = await common.doCallApi('/api/shop/taxinvoice/mount/count/' + shopData.id, {});
				$('#TaxInvoiceAmount').text(taxinvoiceRes.count);
			}
			doControlChangeDateAmount(shopData);
		});

		if ((shopData['Shop_PromptPayNo']) && (shopData['Shop_PromptPayNo'] !== '')) {
			let doCreatePPQRCmd = common.doCreateTextCmd('สร้างพร้อมเพย์คิวอาร์โค้ด', 'grey', 'white');
			$(doCreatePPQRCmd).on('click', (evt)=>{
				evt.stopPropagation();
				doStartTestPPQC(evt, shopData);
			});
			$(middleCell).append($(doCreatePPQRCmd).css({'display': 'line-block', 'margin-top': '15px'}));
		}

		let doCreateOtherDetailCmd = common.doCreateTextCmd('ข้อมูลอื่นๆ', 'grey', 'white');
		$(doCreateOtherDetailCmd).on('click', (evt)=>{
			if ($(doCreateOtherDetailCmd).text() === 'ข้อมูลอื่นๆ') {
				$(doCreateOtherDetailCmd).text('ซ่อนข้อมูล');
				$(shopMail).show();
				$(shopVatNo).show();
				$(shopPPQCNo).show();
				$(shopBillUsage).show();
				$(shopTaxinvoiceUsage).show();
			} else {
				$(doCreateOtherDetailCmd).text('ข้อมูลอื่นๆ');
				$(shopMail).hide();
				$(shopVatNo).hide();
				$(shopPPQCNo).hide();
				$(shopBillUsage).hide();
				$(shopTaxinvoiceUsage).hide();
			}
		});
		$(middleCell).append($(doCreateOtherDetailCmd).css({'display': 'line-block', 'margin-top': '15px', 'margin-left': '5px'}));

		if (userdata.usertypeId == 1) {
			let backCmd = $('<input type="button" value=" Back " class="action-btn"/>');
	    $(backCmd).on('click', (evt)=>{
	      const main = require('../main.js');
	      main.doShowShopItems();
	    });
    	$(rightSideCell).append($(backCmd));
		} else {
			let shopConfigCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'width': '45px', 'height': 'auto', 'cursor': 'pointer'});
			$(rightSideCell).append($(shopConfigCmd));
			$(shopConfigCmd).on('click', (evt)=>{
				editShopCallback(shopData, (newShopData)=>{
					$(shopName).text(newShopData['Shop_Name']);
					$(shopAddress).text(newShopData['Shop_Address']);
					$(shopTel).text(newShopData['Shop_Tel']);
					$(shopMail).text(newShopData['Shop_Mail']);
					$(shopVatNo).text(newShopData['Shop_VatNo']);
					shopData['Shop_Name'] = newShopData['Shop_Name'];
					shopData['Shop_Address'] = newShopData['Shop_Address'];
					shopData['Shop_Tel'] = newShopData['Shop_Tel'];
					shopData['Shop_Mail'] = newShopData['Shop_Mail'];
					shopData['Shop_VatNo'] = newShopData['Shop_VatNo'];
					shopData['Shop_PromptPayNo'] = newShopData['Shop_PromptPayNo'];
					shopData['Shop_PromptPayName'] = newShopData['Shop_PromptPayName'];
				});
				$('#Shop_BillQuota').attr('readOnly', true);
			});
		}

		let shopMessageCmd = $('<img src="../../images/shop-message-icon.png"/>').css({'width': '45px', 'height': 'auto', 'cursor': 'pointer', 'position': 'absolute'});
		$(shopMessageCmd).on('click', (evt)=>{
			evt.stopPropagation();
			doOpenMyMessageCallBack(evt, shopData);
		});
		$(rightSideCell).append($('<br/>')).append($(shopMessageCmd).css({'bottom': '0px', 'margin-left': '-20px'}));

		let myMessageUrl = '/api/shop/message/month/new/count/' + shopData.id
		params = {userId: userdata.id};
		common.doCallApi(myMessageUrl, params).then((msgRes)=>{
			if (msgRes.count > 0) {
				const redCircleAmountStyle = {'display': 'inline-block', 'color': '#fff', 'text-align': 'center', 'line-height': '24px', 'border-radius': '50%', 'font-size': '16px', 'min-width': '28px', 'min-height': '28px', 'margin-top': '16%', 'margin-right': '95%', 'background-color': 'red', 'position': 'absolute', 'cursor': 'pointer'};
				let myMessageAmount = $('<div id="MessageAmount">2</div>').css(redCircleAmountStyle);
				$(myMessageAmount).text(msgRes.count);
				$(rightSideCell).append($(myMessageAmount));
			}
		});

    $(layoutRow).append($(letfSideCell)).append($(middleCell)).append($(rightSideCell));
    $(layoutPage).append($(layoutRow));
    return $(titlePageBox).append($(layoutPage));
	}

  const doCreateContolShopCmds = function(shopData){
    let commandsBox = $('<div style="padding: 4px;"></viv>').css({'width': '99.1%', 'height': '35px', 'text-align': 'left', 'border': '2px solid black', 'border-radius': '4px', 'background-color': 'grey', 'margin-top': '5px'});
    //let userMngCmd = $('<input type="button" value=" ผู้ใช้งาน " class="action-btn"/>').css({'margin-left': '10px'});
		let userMngCmd = $('<span>ผู้ใช้งาน</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(userMngCmd).hover(()=>{	$(userMngCmd).css({'border': '3px solid black'});}, ()=>{	$(userMngCmd).css({'border': '3px solid grey'});});
    $(userMngCmd).on('click', (evt)=>{
      doUserMngClickCallBack(evt, shopData);
    });
    //let customerMngCmd = $('<input type="button" value=" รายการลูกค้า " class="action-btn"/>').css({'margin-left': '10px'});
		let customerMngCmd = $('<span>รายการลูกค้า</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(customerMngCmd).hover(()=>{	$(customerMngCmd).css({'border': '3px solid black'});}, ()=>{	$(customerMngCmd).css({'border': '3px solid grey'});});
    $(customerMngCmd).on('click', (evt)=>{
      doCustomerMngClickCallBack(evt, shopData);
    });
    //let menugroupMngCmd = $('<input type="button" value=" รายการกลุ่มสินค้า " class="action-btn"/>').css({'margin-left': '10px'});
		let menugroupMngCmd = $('<span>รายการกลุ่มสินค้า</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(menugroupMngCmd).hover(()=>{	$(menugroupMngCmd).css({'border': '3px solid black'});}, ()=>{	$(menugroupMngCmd).css({'border': '3px solid grey'});});
    $(menugroupMngCmd).on('click', (evt)=>{
      doMenugroupMngClickCallBack(evt, shopData);
    });
    //let menuitemMngCmd = $('<input type="button" value=" รายการสินค้า " class="action-btn"/>').css({'margin-left': '10px'});
		let menuitemMngCmd = $('<span>รายการสินค้า</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(menuitemMngCmd).hover(()=>{	$(menuitemMngCmd).css({'border': '3px solid black'});}, ()=>{	$(menuitemMngCmd).css({'border': '3px solid grey'});});
    $(menuitemMngCmd).on('click', (evt)=>{
      doMenuitemMngClickCallBack(evt, shopData);
    });

    //let orderMngCmd = $('<input type="button" value=" ออร์เดอร์ " class="action-btn"/>').css({'margin-left': '10px'});
		let orderMngCmd = $('<span id="orderMngCmd">ออร์เดอร์</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(orderMngCmd).hover(()=>{	$(orderMngCmd).css({'border': '3px solid black'});}, ()=>{ $(orderMngCmd).css({'border': '3px solid grey'});});
		$(orderMngCmd).addClass('sensitive-word');
    $(orderMngCmd).on('click', (evt)=>{
      doOrderMngClickCallBack(evt, shopData);
    });

		//let templateMngCmd = $('<input type="button" value=" รูปแบบเอกสาร " class="action-btn"/>').css({'margin-left': '10px'});
		let templateMngCmd = $('<span>รูปแบบเอกสาร</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(templateMngCmd).hover(()=>{	$(templateMngCmd).css({'border': '3px solid black'});}, ()=>{ $(templateMngCmd).css({'border': '3px solid grey'});});
    $(templateMngCmd).on('click', (evt)=>{
      doTemplateMngClickCallBack(evt, shopData);
    });

		let calculatorCmd = $('<span>เครื่องคิดเลข</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
		$(calculatorCmd).hover(()=>{	$(calculatorCmd).css({'border': '3px solid black'});}, ()=>{ $(calculatorCmd).css({'border': '3px solid grey'});});
    $(calculatorCmd).on('click', (evt)=>{
      doOpenCalculatorCallBack(evt, shopData);
    });

    $(commandsBox).append($(orderMngCmd)).append($(menuitemMngCmd)).append($(menugroupMngCmd)).append($(customerMngCmd)).append($(userMngCmd)).append($(templateMngCmd)).append($(calculatorCmd));

		if (parseInt(shopData.Shop_StockingOption) == 1) {
			let earningCmd = $('<span>กำไร-ขาดทุน</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 0px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'left'});
			$(earningCmd).hover(()=>{	$(earningCmd).css({'border': '3px solid black'});}, ()=>{ $(earningCmd).css({'border': '3px solid grey'});});
			$(earningCmd).on('click', async (evt)=>{
				doOpenEarningCallBack(evt, shopData);
			});
			$(commandsBox).append($(earningCmd));
		}

		let logoutCmd = $('<span>ออกจากระบบ</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 5px 0px 0px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey', 'float': 'right'});
		$(logoutCmd).on('click', (evt)=>{
			common.doUserLogout();
		});
		$(logoutCmd).hover(()=>{$(logoutCmd).css({'border': '3px solid black'});},()=>{$(logoutCmd).css({'border': '3px solid grey'});});

		return $(commandsBox).append($(logoutCmd));
  }

  const doShowShopMng = function(shopData, uploadLogCallback, editShopCallback){
    let titlePage = doCreateTitlePage(shopData, uploadLogCallback, editShopCallback);
    $('#App').empty().append($(titlePage));
    let shopCmdControl = doCreateContolShopCmds(shopData);
		let workingAreaBox = $('<div id="WorkingAreaBox" style="padding: 4px;"></viv>').css({'width': '99.1%', 'font-size': '14px' /*, 'border': '2px solid black', 'border-radius': '0px'*/});
		$(workingAreaBox).css({'margin-top': '8px'});
    $('#App').append($(shopCmdControl)).append($(workingAreaBox));
		let orderMngCmd = $(shopCmdControl).children(":first");
		$(orderMngCmd).click();
  }

	const doStartTestPPQC = function(evt, shopData){
		let editInput = $('<input type="number"/>').val(common.doFormatNumber(100)).css({'width': '100px', 'margin-left': '20px'});
		$(editInput).on('keyup', (evt)=>{
			if (evt.keyCode == 13) {
				$(dlgHandle.okCmd).click();
			}
		});
		let editLabel = $('<label>จำนวนเงิน(บาท):</label>').attr('for', $(editInput)).css({'width': '100%'});
		let ppQRBox = $('<div></div>').css({'width': '100%', 'height': '480px', 'margin-top': '20px'}).append($(editLabel)).append($(editInput));
		let editDlgOption = {
			title: 'สร้างพร้อมเพย์คิวอาร์โค้ด',
			msg: $(ppQRBox),
			width: '420px',
			onOk: async function(evt) {
				let newValue = $(editInput).val();
				if(newValue !== '') {
					$(editInput).css({'border': ''});
					let params = {
						Shop_PromptPayNo: shopData.Shop_PromptPayNo,
						Shop_PromptPayName: shopData.Shop_PromptPayName,
						netAmount: newValue,
					};
					let shopRes = await common.doCallApi('/api/shop/shop/create/ppqrcode', params);
					if (shopRes.status.code == 200) {
						$.notify("สร้างพร้อมเพย์คิวอาร์โค้ดสำเร็จ", "success");
						let ppqrImage = $('<img/>').attr('src', shopRes.result.qrLink).css({'width': '410px', 'height': 'auto'});
						$(ppqrImage).on('click', (evt)=>{
							evt.stopPropagation();
							window.open('/shop/share/?id=' + shopRes.result.qrFileName, '_blank');
						});

						let alertTextBox = $('<p></p>').text('ต้องการรับใบเสร็จ โปรดแจ้งแม่ค้า').css({'text-align': 'center', 'font-size': '30px', 'color': 'blue'});

						let openNewOrderCmd = common.doCreateTextCmd('ออกบิลใหม่', 'green', 'white');
						$(openNewOrderCmd).addClass('sensitive-word');
						$(openNewOrderCmd).attr('id', 'newOrderCmd');
						$(openNewOrderCmd).on('click', (evt)=>{
							evt.stopPropagation();
							dlgHandle.closeAlert();
							let workAreaBox = $('#WorkingAreaBox');
							order.doOpenOrderForm(shopData, workAreaBox);
						});

						$(ppQRBox).empty().append($(ppqrImage)).append($(alertTextBox)).append($(openNewOrderCmd)).css({'display': 'inline-block', 'text-align': 'center', 'margin-top': '20px'});
						$(dlgHandle.cancelCmd).show();
						$(dlgHandle.cancelCmd).val(' ตกลง ');
						$(dlgHandle.okCmd).hide();
					} else if (shopRes.status.code == 201) {
						$.notify("ไม่สามารถสร้างพร้อมเพย์คิวอาร์โค้ดได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถสร้างพร้อมเพย์คิวอาร์โค้ดได้", "error");
					}
				} else {
					$.notify('จำนวนเงินต้องไม่ว่าง', 'error');
					$(editInput).css({'border': '1px solid red'});
				}
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		//$(dlgHandle.cancelCmd).hide();
		return dlgHandle;
	}

  const doUserMngClickCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await user.doShowUserItem(shopData, workingAreaBox);
  }

  const doCustomerMngClickCallBack = async function(evt, shopData){
    let workingAreaBox = $('#WorkingAreaBox');
		await customer.doShowCustomerItem(shopData, workingAreaBox)
  }

  const doMenugroupMngClickCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await menugroup.doShowMenugroupItem(shopData, workingAreaBox)
  }

  const doMenuitemMngClickCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await menuitem.doShowMenuitemItem(shopData, workingAreaBox)
  }

  const doOrderMngClickCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await order.doShowOrderList(shopData, workingAreaBox);
  }

	const doTemplateMngClickCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await template.doShowTemplateDesign(shopData, workingAreaBox)
	}

	const doOpenCalculatorCallBack = function(evt, shopData){
		let calcBox = $('<div id="root"></div>');
		let calcDlgOption = {
			title: 'เครื่องคิดเลข',
			msg: $(calcBox),
			width: '365px',
			okLabel: ' ปิด ',
			cancelLabel: ' ปิด ',
			onOk: function(evt) {
				$(calcScript).remove();
				dlgHandle.closeAlert();
			},
			onCancel: function(evt) {
				$(calcScript).remove();
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(calcDlgOption);
		$(dlgHandle.cancelCmd).hide();
		let calcScript = document.createElement("script");
		calcScript.type = "text/javascript";
		calcScript.src = "../lib/calculator.js";
		$("head").append($(calcScript));
	}

	const doOpenEarningCallBack = function(evt, shopData){
		localStorage.setItem('earnShopData', JSON.stringify(shopData));
		let earningBox = $('<div id="root"></div>');
		let earningDlgOption = {
			title: 'สรุปกำไร-ขาดทุน',
			msg: $(earningBox),
			width: '615px',
			okLabel: ' ปิด ',
			cancelLabel: ' ปิด ',
			onOk: function(evt) {
				$(earningScript).remove();
				localStorage.removeItem('earnShopData');
				dlgHandle.closeAlert();
			},
			onCancel: function(evt) {
				$(earningScript).remove();
				localStorage.removeItem('earnShopData');
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(earningDlgOption);
		$(dlgHandle.cancelCmd).hide();
		let earningScript = document.createElement("script");
		earningScript.type = "text/javascript";
		earningScript.src = "../lib/earning.js";
		$("head").append($(earningScript));
	}

	const doCreateMountSelectBox = function() {
		const mounts = [{display: 'ม.ค.', value: 1}, {display: 'ก.พ.', value: 2}, {display: 'มี.ค.', value: 3}, {display: 'เม.ย.', value: 4}, {display: 'พ.ค.', value: 5}, {display: 'มิ.ย.', value: 6}, {display: 'ก.ค.', value: 7}, {display: 'ส.ค.', value: 8}, {display: 'ก.ย.', value: 9}, {display: 'ต.ค.', value: 10}, {display: 'พ.ย.', value: 11}, {display: 'ธ.ค.', value: 12}];
		const years = ['2023', '2024', '2025', '2026'];
		let mainBox = $('<div></div>').css({'position': 'relative'})
		let d = new Date();
		let month = d.getMonth();
		let mountSelect = $('<select id="Mount"></select>');
		mounts.forEach((item, i) => {
			if (i == month) {
				$(mountSelect).append($('<option></option>').text(item.display).val(item.value).prop('selected', true));;
			} else {
				$(mountSelect).append($('<option></option>').text(item.display).val(item.value));
			}
		});

		let yearSelect = $('<select id="Year"></select>');
		years.forEach((item, i) => {
			$(yearSelect).append($('<option></option>').text(item).val(item));
		});

		$(mainBox).append($('<span>เดือน</span>'));
		$(mainBox).append($(mountSelect).css({'margin-left': '5px'}));
		$(mainBox).append($('<span>ปี</span>').css({'margin-left': '5px'}));
		$(mainBox).append($(yearSelect).css({'margin-left': '5px'}));

		return $(mainBox);
	}

	const doControlChangeDateAmount = function(shopData) {
		$('#BillDateChangeCmd').css({'padding': '2px', 'cursor': 'pointer'});
		$('#TaxInvoiceDateChangeCmd').css({'padding': '2px', 'cursor': 'pointer'});
		$('#BillDateChangeCmd').hover(()=>{
			$('#BillDateChangeCmd').css({'background-color': 'white', 'color': 'black', 'border': '1px solid black'});
		},()=>{
			$('#BillDateChangeCmd').css({'background-color': 'inherit', 'color': 'inherit', 'border': ''});
		});
		$('#BillDateChangeCmd').on('click', (evt)=>{
			let dlgHandle = undefined;
			let mountSelect = doCreateMountSelectBox();
			$(mountSelect).css({'margin-top': '10px'})
			let mountSelectDlgOption = {
				title: 'เลือกเดือนที่ต้องการเช็คจำนวนบิล',
				msg: $(mountSelect),
				width: '365px',
				onOk: function(evt) {
					let mm = $('#Mount').val();
					let yy = $('#Year').val();
					let billUsageUrl = '/api/shop/bill/mount/count/' + shopData.id;
					let billDate = `${yy}-${mm}-01`;
					let params = {billDate: billDate};
					common.doCallApi(billUsageUrl, params).then((billRes)=>{
						console.log(billRes);
						$('#BillAmount').text(billRes.count);
						$('#BillDateChangeCmd').text('เดือน ' + $('#Mount option:selected').text());
						dlgHandle.closeAlert();
					});
				},
				onCancel: function(evt) {
					dlgHandle.closeAlert();
				}
			}
			dlgHandle = $('body').radalert(mountSelectDlgOption);
		});

		$('#TaxInvoiceDateChangeCmd').hover(()=>{
			$('#TaxInvoiceDateChangeCmd').css({'background-color': 'white', 'color': 'black', 'border': '1px solid black'});
		},()=>{
			$('#TaxInvoiceDateChangeCmd').css({'background-color': 'inherit', 'color': 'inherit', 'border': ''});
		});
		$('#TaxInvoiceDateChangeCmd').on('click', (evt)=>{
			let mountSelect = doCreateMountSelectBox();
			$(mountSelect).css({'margin-top': '10px'})
			let mountSelectDlgOption = {
				title: 'เลือกเดือนที่ต้องการเช็คจำนวนบิล',
				msg: $(mountSelect),
				width: '365px',
				onOk: function(evt) {
					let mm = $('#Mount').val();
					let yy = $('#Year').val();
					let taxinvoiceUsageUrl = '/api/shop/taxinvoice/mount/count/' + shopData.id;
					let taxinvoiceDate = `${yy}-${mm}-01`;
					let params = {taxinvoiceDate: taxinvoiceDate};
					common.doCallApi(taxinvoiceUsageUrl, params).then((taxinvoiceRes)=>{
						console.log(taxinvoiceRes);
						$('#TaxInvoiceAmount').text(taxinvoiceRes.count);
						$('#TaxInvoiceDateChangeCmd').text('เดือน ' + $('#Mount option:selected').text());
						dlgHandle.closeAlert();
					});
				},
				onCancel: function(evt) {
					dlgHandle.closeAlert();
				}
			}
			dlgHandle = $('body').radalert(mountSelectDlgOption);
		});
	}

	const doOpenMyMessageCallBack = async function(evt, shopData){
		let workingAreaBox = $('#WorkingAreaBox');
		await message.doShowMyMesaage(shopData, workingAreaBox);
	}

  return {
    doShowShopMng
	}
}

},{"../../../home/mod/common-lib.js":2,"../main.js":5,"./customer-mng.js":9,"./menugroup-mng.js":12,"./menuitem-mng.js":13,"./message-mng.js":14,"./order-mng.js":17,"./template-design.js":21,"./user-mng.js":22}],20:[function(require,module,exports){
/*stock-cutoff.js*/
module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);
  const order = require('./order-mng.js')($);

  const doExtractList = function(originList, from, to) {
		return new Promise(async function(resolve, reject) {
			let exResults = [];
			let	promiseList = new Promise(function(resolve2, reject2){
				for (let i = (from-1); i < to; i++) {
					if (originList[i]){
						exResults.push(originList[i]);
					}
				}
				setTimeout(()=>{
          resolve2(exResults);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  const doRenderCutoffStockTable = function(workAreaBox, viewPage, startRef, fromDate, stockRes, menuitemData) {
    return new Promise(async function(resolve, reject) {
      console.log(stockRes);
      $('body').loading('start');
      let stocks = stockRes.Records;
      let titleText = 'เช็คสต็อค';
      let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
      let userItemPerPage = userDefualtSetting.itemperpage;

      let cutoffDate = common.doFormatDateStr(fromDate);
      titleText += ' ตั้งแต่วันที่ ' + cutoffDate;

      let stockPageItems = stocks;

      let totalItem = stockPageItems.length;

      if (userItemPerPage != 0) {
        if (startRef > 0) {
          stockPageItems = await doExtractList(stocks, (startRef+1), (startRef+userItemPerPage));
        } else {
          stockPageItems = await doExtractList(stocks, 1, userItemPerPage);
        }
      }

      let stockTable = $('<table id="StockTable" width="100%" cellspacing="0" cellpadding="0" border="1"></table>');

      let titleRow = $('<tr></tr>').css({'background-color': 'gray', 'color': 'white'});
      let titleCol = $('<td colspan="7" align="center"></td>');
      $(titleCol).append($('<h3></h3>').text(titleText).css({'font-weight': 'bold'}));
      $(titleRow).append($(titleCol));
      $(stockTable).append($(titleRow));

      let sumBeforeText = 'ยอดคงเหลือยกมา ' + common.doFormatQtyNumber(stockRes.sumQty.Qty) + ' ' + menuitemData.Unit;
      let sumBeforeRow = $('<tr></tr>');
      let sumBeforeCol = $('<td colspan="7" align="center"></td>');
      $(sumBeforeCol).append($('<h3></h3>').text(sumBeforeText).css({'font-weight': 'bold'}));
      $(sumBeforeRow).append($(sumBeforeCol));
      $(stockTable).append($(sumBeforeRow));

      let headerRow = $('<tr></tr>');
      $(headerRow).append($('<td width="4%" align="center"><b>#</b></td>'));
      $(headerRow).append($('<td width="15%" align="center"><b>วันที่</b></td>'));
      let dirCol = $('<td width="10%" align="center"><b>เข้า/ออก</b></td>');
      $(headerRow).append($(dirCol));
      let qtyCol = $('<td width="10%" align="center"><b>จำนวน</b></td>');
      $(headerRow).append($(qtyCol));
			let priceCol = $('<td width="10%" align="center"><b>ราคา</b></td>');
			$(headerRow).append($(priceCol));
      let sumCol = $('<td width="10%" align="center"><b>คงเหลือ</b></td>');
      $(headerRow).append($(sumCol));
      let cmdCol = $('<td width="*" align="center" class="row-cmd"><b>คำสั่ง</b></td>');
      $(headerRow).append($(cmdCol));
      $(stockTable).append($(headerRow));

      let promiseList = new Promise(async function(resolve2, reject2){
        let sum = stockRes.sumQty.Qty;
        for (let i=0; i < stockPageItems.length; i++) {
          let no = (i + 1 + startRef);
          let stockPageItem = stockPageItems[i];
          let stockDate = common.doFormatDateStr(new Date(stockPageItem.StockedAt));
          let dataRow = $('<tr></tr>');
          if (stockPageItem.Direction == '+') {
            $(dataRow).css({'background-color': '#ddd'});
            sum = sum + stockPageItem.Qty;
          } else if (stockPageItem.Direction == '-'){
            $(dataRow).css({'background-color': ''});
            sum = sum - stockPageItem.Qty;
          }
          $(dataRow).append($('<td align="center"></td>').text(no));
          let stockDateCol = $('<td align="left"></td>');

          if (stockPageItem.Direction == '+') {
            let stockDateBox = $('<span></span>').text(stockDate).css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 5px 0px 10px', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey'});
      			$(stockDateBox).on('click', (evt)=>{
      				common.calendarOptions.onClick = async function(date){
                console.log(date);
      					//selectDate = common.doFormatDateStr(new Date(date));
                //console.log(selectDate);
                let params = {data: {StockedAt: date}, stockingId: stockPageItem.id};
                console.log(params);
                let stockRes = await common.doCallApi('/api/shop/stocking/edit/stockeddate', params);
                if (stockRes.status.code == 200) {
                  $.notify("แก้ไขวันที่นำเข้า " + menuitemData.MenuName + " สำเร็จ", "success");
                  $('#StockCutoffDateOption').change();
                } else if (stockRes.status.code == 201) {
                  $.notify("ไม่สามารถแก้ไขวันที่นำเข้าสต็อคได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
                } else {
                  $.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขวันที่นำเข้าสต็อคได้", "error");
                  console.log(stockRes);
                }
                calendarHandle.closeAlert();
      				}
      				let calendarHandle = order.doShowCalendarDlg(common.calendarOptions);
      			});
      			$(stockDateBox).hover(()=>{
      				$(stockDateBox).css({'border': '3px solid black'});
      			},()=>{
      				$(stockDateBox).css({'border': '3px solid grey'});
      			});
						$(stockDateBox).attr('title', 'แก้ไขวันที่นำเข้าสต็อค');
            $(stockDateCol).append($(stockDateBox));
          } else {
            let stockDateBox = $('<span></span>').text(stockDate).css({'position': 'relative', 'margin': '-3px 5px 0px 10px', 'padding': '4px', 'font-size': '16px'});
            $(stockDateCol).append($(stockDateBox));
          }
          $(dataRow).append($(stockDateCol));
          $(dataRow).append($('<td align="center"></td>').text(stockPageItem.Direction).css({'font-weight': 'bold'}));
          $(dataRow).append($('<td align="right"></td>').text(stockPageItem.Direction + common.doFormatQtyNumber(stockPageItem.Qty)).css({'padding-right': '2px'}));
          $(dataRow).append($('<td align="right"></td>').text(common.doFormatNumber(stockPageItem.Price)).css({'padding-right': '2px'}));
          $(dataRow).append($('<td align="right"></td>').text(common.doFormatQtyNumber(sum)).css({'padding-right': '2px'}));
          let cmdItemCol = $('<td align="center" class="row-cmd"></td>');
          $(dataRow).append($(cmdItemCol));
          $(stockTable).append($(dataRow));
          if (stockPageItem.Direction == '+') {
            let editStockInValueCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
            $(editStockInValueCmd).on('click', (evt)=>{
              doUpdateStockInValue(menuitemData, stockPageItem, ()=>{
                $('#StockCutoffDateOption').change();
              });
            });
            $(cmdItemCol).append($(editStockInValueCmd));

            let deleteStockInValueCmd = $('<input type="button" value=" Delete " class="action-btn"/>');
            $(deleteStockInValueCmd).on('click', (evt)=>{
              doDeleteStockInValue(menuitemData, stockPageItem, ()=>{
                $('#StockCutoffDateOption').change();
              });
            });
            $(cmdItemCol).append($(deleteStockInValueCmd).css({'margin-left': '5px'}));
          } else if (stockPageItem.Direction == '-') {
            // Open Order
            let openOrderCmd = $('<input type="button" value=" Open " class="action-btn"/>');
            $(openOrderCmd).on('click', async (evt)=>{
              let userdata = JSON.parse(localStorage.getItem('userdata'));
              let shopData = userdata.shop;
              let selectDate = stockPageItem.StockedAt;
              let params = {};
              let orderRes = await common.doCallApi('/api/shop/order/select/' + stockPageItem.orderId, params);
              let orderData = {customer: orderRes.Record.customer, gooditems: orderRes.Record.Items, id: orderRes.Record.id, Status: orderRes.Record.Status};
              order.doOpenOrderForm(shopData, workAreaBox, orderData, selectDate);
            });
            $(cmdItemCol).append($(openOrderCmd));
          }
        }

        let sumAfterText = 'ยอดคงเหลือสุทธิ ';
        let sumAfterRow = $('<tr></tr>').css({'background-color': 'grey', 'color': 'white'});
        let sumAfterCol = $('<td colspan="5" align="center"></td>');
        let sumQtyCol = $('<td align="right"></td>').css({'padding-right': '2px'});
        let sumCmdCol = $('<td align="center" class="row-cmd"></td>')
        $(sumQtyCol).append($('<h3></h3>').text(common.doFormatQtyNumber(sum)).css({'font-weight': 'bold'}));
        $(sumAfterCol).append($('<h3></h3>').text(sumAfterText).css({'font-weight': 'bold'}));
        $(sumAfterRow).append($(sumAfterCol)).append($(sumQtyCol)).append($(sumCmdCol));
        $(stockTable).append($(sumAfterRow));

        let exportCmdIcon = $('<img src="../../images/excel-icon.png"/>');
    		$(exportCmdIcon).css({'position': 'relative', 'width': '30px', 'height': 'auto', 'cursor': 'pointer'});
    		$(exportCmdIcon).on('click', async(evt)=>{
    			$('body').loading('start');
          $('.row-cmd').hide();
          let wsName = 'StockingRecord'+ menuitemData.id;
          $(workAreaBox).excelexportjs({
    			  containerid: 'StockTable',
    			  datatype: 'table',
    				encoding: "utf-8",
    				locale: 'th-TH',
    				worksheetName: wsName
    			});
          $('.row-cmd').show();
          $('body').loading('stop');
        });
        $(sumCmdCol).append($(exportCmdIcon));

        let printCmdIcon = $('<img src="../../images/print-icon.png"/>');
        $(printCmdIcon).css({'position': 'relative', 'width': '30px', 'height': 'auto', 'cursor': 'pointer', 'margin-left': '10px'});
        $(printCmdIcon).on('click', async(evt)=>{
          $('body').loading('start');
          $('.row-cmd').hide();
          printJS('StockTable', 'html');
          $('.row-cmd').show();
          $('body').loading('stop');
        });
        $(sumCmdCol).append($(printCmdIcon));

        setTimeout(()=> {
          resolve2(stockTable);
        },1200);
      });

      Promise.all([promiseList]).then((ob)=> {
        let stockTable = ob[0];
        $(workAreaBox).append($(stockTable).css({'margin-top': '20px'}));

        let showPage = 1;
        if ((viewPage) && (viewPage > 0)){
          showPage = viewPage;
        }

        let pageNavigator = doCreatePageNavigatorBox(showPage, userItemPerPage, totalItem, async function(page){
          console.log(page);
          $('body').loading('start');
          $('#StockTable').remove();
          $('#NavigBar').remove();
          //userDefualtSetting.itemperpage = page.perPage;
					userDefualtSetting = {itemperpage: page.perPage, currentPage: showPage};
          localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));

          let toPage = Number(page.toPage);
          let newStartRef = Number(page.fromItem);
          stockTable = await doRenderCutoffStockTable(workAreaBox, toPage, newStartRef, fromDate, stockRes, menuitemData);
          $('body').loading('stop');
        })
        $(workAreaBox).append($(pageNavigator).css({'margin-top': '2px'}));

        resolve(stockTable);
        $('body').loading('stop');
      });
    });
  }

  const doCreatePageNavigatorBox = function(showPage, userItemPerPage, totalItem, callback) {
    let navigBarBox = $('<div id="NavigBar"></div>');
    let navigBarOption = {
      currentPage: showPage,
      itemperPage: userItemPerPage,
      totalItem: totalItem,
      styleClass : {'padding': '4px', 'margin-top': '60px'},
      changeToPageCallback: callback
    };
    let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
    //navigatoePage.toPage(1);
    return $(navigBarBox);
  }

  const doCreateStockInMenuitemForm = function(menuitemData, stockInData){
    let stockInFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
  	let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">จำนวน<span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputQtyValue = $('<input type="number" id="StockiInQty" size="10"/>');
    if (stockInData && stockInData.Qty) {
      $(inputQtyValue).val(stockInData.Qty);
    }
		$(inputField).append($(inputQtyValue));
		$(fieldRow).append($(labelField)).append($(inputField));
		$(stockInFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">ราคา(รับ)<span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputPriceValue = $('<input type="number" id="StockiInPrice" size="10"/>');
    if (stockInData && stockInData.Price) {
      $(inputPriceValue).val(stockInData.Price);
    }
		$(inputField).append($(inputPriceValue));
		$(fieldRow).append($(labelField)).append($(inputField));
		$(stockInFormTable).append($(fieldRow));
		return $(stockInFormTable);
  }

  const doVerifyStockInForm = function(form) {
		let qty = $(form).find('#StockiInQty').val();
		if (parseFloat(qty) >= 0) {
			$(form).find('#StockiInQty').css({'border': ''});
			let price = $(form).find('#StockiInPrice').val();
			if (parseFloat(price) >= 0) {
				$(form).find('#StockiInPrice').css({'border': ''});
				let newStockIn = {Direction: '+', Qty: qty, Price: price};
				return newStockIn;
			} else {
				$.notify("ข้อมูลราคารับเพื่อนำเข้าไม่ภูกต้อง", "error");
				$(form).find('#StockiInPrice').css({'border': '1px solid red'});
				return;
			}
		} else {
			$.notify("ข้อมูลจำนวนนำเข้าไม่ภูกต้อง", "error");
			$(form).find('#StockiInQty').css({'border': '1px solid red'});
			return;
		}
	}

	const doOpenStockInForm = function(shopData, workAreaBox, menuitemData){
    let stockInForm = doCreateStockInMenuitemForm(menuitemData);
		let stockInFormBox = $('<div></div>');
		$(stockInFormBox).append($(stockInForm));
		const stockInformoption = {
			title: 'นำเข้า ' + menuitemData.MenuName,
			msg: $(stockInFormBox),
			width: '520px',
			onOk: async function(evt) {
				let stockInObj = doVerifyStockInForm(stockInForm);
				if (stockInObj) {
					stockIn.closeAlert();
					let userdata = JSON.parse(localStorage.getItem('userdata'));
					let params = {data: stockInObj, shopId: shopData.id, userId: userdata.id, orderId: 0, menuitemId: menuitemData.id};
					let stockRes = await common.doCallApi('/api/shop/stocking/add', params);
					if (stockRes.status.code == 200) {
						$.notify("นำเข้า " + menuitemData.MenuName + " สำเร็จ", "success");
					} else if (stockRes.status.code == 201) {
						$.notify("ไม่สามารถนำเข้าสต็อคได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถนำเข้าสต็อคได้", "error");
						console.log(stockRes);
					}
				}else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				stockIn.closeAlert();
			}
		}
		let stockIn = $('body').radalert(stockInformoption);
  }

  const doUpdateStockInValue = function(menuitemData, stockItemData, callback) {
    let stockInForm = doCreateStockInMenuitemForm(menuitemData, stockItemData);
    let stockInFormBox = $('<div></div>');
    $(stockInFormBox).append($(stockInForm));
    const stockInformoption = {
      title: 'แก้ไข การนำเข้า ' + menuitemData.MenuName,
      msg: $(stockInFormBox),
      width: '520px',
      onOk: async function(evt) {
				let stockInObj = doVerifyStockInForm(stockInForm);
        if (stockInObj) {
          stockIn.closeAlert();
          let userdata = JSON.parse(localStorage.getItem('userdata'));
          let params = {data: stockInObj, shopId: userdata.shopId, userId: userdata.id, orderId: 0, menuitemId: menuitemData.id, stockingId: stockItemData.id};
          console.log(params);
					let stockRes = await common.doCallApi('/api/shop/stocking/update', params);
					if (stockRes.status.code == 200) {
						$.notify("แก้ไขการนำเข้า " + menuitemData.MenuName + " สำเร็จ", "success");
            callback();
					} else if (stockRes.status.code == 201) {
						$.notify("ไม่สามารถแก้ไขการนำเข้าสต็อคได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขการนำเข้าสต็อคได้", "error");
						console.log(stockRes);
					}
        }
      },
      onCancel: function(evt){
        stockIn.closeAlert();
      }
    }
    let stockIn = $('body').radalert(stockInformoption);
  }

  const doDeleteStockInValue = function(menuitemData, stockItemData, callback){
    let stockInConfirmBox = $('<div></div>');
    let stockInConfirm = $('<p></p>').text('โปรดยืนยันการลบโดยคลิกปุ่ม ตกลง');
    $(stockInConfirmBox).append($(stockInConfirm));
    const stockInconfirmoption = {
      title: 'ยืนยันการลบรายการนำเข้าสต็อค ' + menuitemData.MenuName,
      msg: $(stockInConfirmBox),
      width: '420px',
      onOk: async function(evt) {
        stockIn.closeAlert();
        let params = {stockingId: stockItemData.id};
        console.log(params);
				let stockRes = await common.doCallApi('/api/shop/stocking/delete', params);
				if (stockRes.status.code == 200) {
					$.notify("ลบรายการนำเข้า " + menuitemData.MenuName + " สำเร็จ", "success");
          callback();
				} else if (stockRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการนำเข้าสต็อคได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการนำเข้าสต็อคได้", "error");
					console.log(stockRes);
				}
      },
      onCancel: function(evt){
        stockIn.closeAlert();
      }
    }
    let stockIn = $('body').radalert(stockInconfirmoption);
  }

  return {
    doOpenStockInForm,
    doRenderCutoffStockTable
  }
}

},{"../../../home/mod/common-lib.js":2,"./order-mng.js":17}],21:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);
	const constant = require('../../../home/mod/constant-lib.js');
  const elementProperty = require('./element-property-lib.js')($);
  let activeType, activeElement;

  const doCalRatio = function(paperSize){
    let containerWidth = $('#report-container').width();
		if (paperSize == 1) {
    	return containerWidth/constant.A4Width;
		} else if (paperSize == 2) {
			return containerWidth/constant.SlipWidth;
		}
  }

  const resetContainer = function(paperSize){
    let newRatio = doCalRatio(paperSize);
    let newHeight = undefined;
		if (paperSize == 1){
			newHeight = constant.A4Height/* * newRatio*/;
			$('#report-container').css({'width': constant.A4Width, 'margin-left': '0px'});
		} else if (paperSize == 2){
			newHeight = constant.SlipHeight * newRatio;
			let parentWidth = $('#report-container').parent().width();
			let adjustLeft = (parentWidth - constant.SlipWidth) / 2;
			$('#report-container').css({'width': constant.SlipWidth, 'margin-left': adjustLeft+'px'});
		}
    $('#report-container').css('height', newHeight + 'px');
    $('#report-container').css('max-height', newHeight + 'px');

    doCollectElement(paperSize).then((reportElements)=>{
			//console.log(reportElements);
      if (reportElements.length > 0) {
        let wrapper = $('#report-container');
        $(wrapper).empty();
        reportElements.forEach(async (item, i) => {
          let reportElem = {};
          await Object.getOwnPropertyNames(item).forEach((tag) => {
            reportElem[tag] = item[tag];
          });
          let element = elementProperty.doCreateElement(wrapper, item.elementType, reportElem);
					$(element).click();
        });
      }
    });
  }

  const doCreateTemplateTypeSelector = function(shopData){
    let selector = $('<select></select>');
    constant.templateTypes.forEach((item, i) => {
			if (item.id != 3) {
      	$(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
			} else {
				if ((shopData.Shop_VatNo) && (shopData.Shop_VatNo != '')) {
					$(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
				}
			}
    });
    return $(selector);
  }

	const doCreatePaperSizeSelector = function(){
		let selector = $('<select></select>');
		constant.paperSizes.forEach((item, i) => {
      $(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
    });
    return $(selector);
	}

  const doCreateTemplateDesignArea = function(){
    let wrapper = $('<div class="row" id="WorkRow"></div>');
    let columnSideBox = $('<div class="column side"></div>');
    let reportItemBox = $('<div id="report-item"></div>');
    let selectableBox = $('<ol id="selectable"></ol>');
		let addTextElementCmd = $('<li class="ui-widget-content" id="text-element-cmd"><img src="/images/text-icon.png" class="icon-element"/><span class="text-element">กล่องข้อความ</span></li>');
		let addHrElementCmd = $('<li class="ui-widget-content" id="hr-element-cmd"><img src="/images/hr-line-icon.png" class="icon-element"/><span class="text-element">เส้นแนวนอน</span></li>');
		let addImageElementCmd = $('<li class="ui-widget-content" id="image-element-cmd"><img src="/images/image-icon.png" class="icon-element"/><span class="text-element">กล่องรูปภาพ</span></li>');
    $(selectableBox).append($(addTextElementCmd));
    $(selectableBox).append($(addHrElementCmd));
    $(selectableBox).append($(addImageElementCmd));
		var tableTypeLength = $(".tableElement").length;
		if (tableTypeLength == 0) {
			let addTableElementCmd = $('<li class="ui-widget-content" id="table-element-cmd"><img src="/images/item-list-icon.png" class="icon-element"/><span class="text-element">ตารางออร์เดอร์</span></li>');
			$(selectableBox).append($(addTableElementCmd));
			$(addTableElementCmd).on('click', (evt)=>{
				elementProperty.doCreateElement(reportcontainerBox, 'table');
			});
		}
    let reportItemCmdBox = $('<div id="report-item-cmd" style="padding:5px; text-align: center; margin-top: 20px;"></div>');
    let addElementCmd = $('<input type="button" id="add-item-cmd" value=" เพิ่ม "/>');
    let removeElementCmd = $('<input type="button" id="remove-item-cmd" value=" ลบ "/>');
    $(reportItemCmdBox).append($(addElementCmd)).append($(removeElementCmd));
    let reportPropertyBox = $('<div id="report-property"></div>') ;

    $(reportItemBox).append($(selectableBox)).append($(reportItemCmdBox)).append($(reportPropertyBox));
    $(columnSideBox).append($(reportItemBox));

    let columnMiddleBox = $('<div class="column middle"></div>');
    let reportcontainerBox = $('<div id="report-container"></div>');
    $(columnMiddleBox).append($(reportcontainerBox));

		$(addTextElementCmd).on('click', (evt)=>{
			let elemAc = $(reportcontainerBox).find('.elementActive');
			let elemData = $(elemAc).data();
			//console.log(elemData);
			if (elemData && elemData.customTdelement) {
				if (elemData.customTdelement.options.elementType == 'td') {
					elementProperty.doCreateElement(elemAc, 'text');
				} else {
					elementProperty.doCreateElement(reportcontainerBox, 'text');
				}
			} else {
				elementProperty.doCreateElement(reportcontainerBox, 'text');
			}
		});
		$(addHrElementCmd).on('click', (evt)=>{
			let elemAc = $(reportcontainerBox).find('.elementActive');
			let elemData = $(elemAc).data();
			if (elemData && elemData.customTdelement) {
				if (elemData.customTdelement.options.elementType == 'td') {
					elementProperty.doCreateElement(elemAc, 'hr');
				} else {
					elementProperty.doCreateElement(reportcontainerBox, 'hr');
				}
			} else {
				elementProperty.doCreateElement(reportcontainerBox, 'hr');
			}
		});
		$(addImageElementCmd).on('click', (evt)=>{
			let elemAc = $(reportcontainerBox).find('.elementActive');
			let elemData = $(elemAc).data();
			if (elemData && elemData.customTdelement) {
				//console.log(elemData.customTdelement.options);
				if (elemData.customTdelement.options.elementType == 'td') {
					elementProperty.doCreateElement(elemAc, 'image');
					console.log('ok');
				} else {
					elementProperty.doCreateElement(reportcontainerBox, 'image');
				}
			} else {
				elementProperty.doCreateElement(reportcontainerBox, 'image');
			}
		});

    return $(wrapper).append($(columnSideBox)).append($(columnMiddleBox))
  }

	const doLoadCommandAction = function(){
    $("#add-item-cmd").prop('disabled', false);
    $("#remove-item-cmd").prop('disabled', true);
    $("#text-element-cmd").data({type: "text"});
    $("#hr-element-cmd").data({type: "hr"});
    $("#image-element-cmd").data({type: "image"});
		$("#table-element-cmd").data({type: "table"});
		$("#tr-element-cmd").data({type: "tr"});
		$("#td-element-cmd").data({type: "td"});
		let activeType = undefined;
		/*
    $("#selectable").selectable({
      stop: function() {
        $( ".ui-selected", this ).each(function() {
          activeType = $(this).data();
          $("#add-item-cmd").prop('disabled', false);
        });
      },
      selected: function(event, ui) {
        $(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected");
      }
    });
		*/
    $("#report-container").droppable({
      accept: ".reportElement",
      drop: function( event, ui ) {
      }
    });
		$('.tableElement').droppable({
      accept: ".trElement",
      drop: function( event, ui ) {
      }
    });
		$('.trElement').droppable({
      accept: ".tdElement",
      drop: function( event, ui ) {
      }
    });
		$('.tdElement').droppable({
      accept: ".reportElement",
      drop: function( event, ui ) {
      }
    });
    $("#add-item-cmd").click((event) => {
      let elemType = activeType.type;
      let wrapper = $("#report-container");
			if (elemType == 'tr') {
				wrapper = $(wrapper).find('.tableElement');
			} else if (elemType == 'td') {
				let myTable = $(wrapper).find('.tableElement');
				//console.log($(myTable).data());
				let activeRow = $(myTable).find('.elementActive');
				//console.log($(activeRow).data());
				wrapper = $(activeRow)
			}
      elementProperty.doCreateElement(wrapper, elemType);
    });
    $("#remove-item-cmd").click((event) => {
			elementProperty.removeActiveElement()
    });
  }

	const doReadTableData = function(){
		let tableBox = $("#report-container").find('.tableElement');
		let tableWidth = $(tableBox).width();
		let rowWidth = tableWidth * 0.94;
		let tableData = $(tableBox).data().customTableelement.options;
		//console.log(tableData);
		let tableDesignData = {elementType: 'table', id: tableData.id, x: tableData.x, y: tableData.y, width: tableData.width, height: tableData.height, cols: tableData.cols, border: tableData.border, rows: []};
		let trs = $(tableBox).find('.trElement');
		$(trs).each((i, tr)=>{
			let trData = $(tr).data().customTrelement.options;
			//console.log(trData);
			let trDesignData = {elementType: 'tr', id: trData.id, backgroundColor: trData.backgroundColor, height: trData.height, fields: []};
			let tds  = $(tr).find('.tdElement');
			//console.log(tds);
			$(tds).each((i, td)=>{
				let tdData = $(td).data().customTdelement.options;
				let fieldData = {elementType: 'td', id: tdData.id, height: tdData.height, cellData: tdData.cellData, fontweight: tdData.fontweight, fontalign: tdData.fontalign, fontsize: tdData.fontsize, fontstyle: tdData.fontstyle, valign: tdData.valign};
				let percentWidth = ((tdData.width / rowWidth) * 100).toFixed(2);
				fieldData.width = percentWidth;
				trDesignData.fields.push(fieldData);
			});
			tableDesignData.rows.push(trDesignData);
		});
		return tableDesignData;
	}

	const doCollectElement = function(paperSize) {
    return new Promise(function(resolve, reject){
      let newRatio = doCalRatio(paperSize);
      let htmlElements = $("#report-container").children();
      let reportElements = [];
      var promiseList = new Promise(function(resolve, reject){
        htmlElements.each(async (index, elem) => {
          let elemData = $(elem).data();
          let data;
          if (elemData.customTextelement) {
            data = elemData.customTextelement.options;
          } else if (elemData.customHrelement) {
            data = elemData.customHrelement.options;
          } else if (elemData.customImageelement) {
            data = elemData.customImageelement.options;
					} else if (elemData.customTableelement) {
						data = doReadTableData();
          } else {
            data = {};
          }

          let reportElem = {};
          await Object.getOwnPropertyNames(data).forEach((tag) => {
            reportElem[tag] = data[tag];
          });
          reportElements.push(reportElem);
        });
        setTimeout(()=> {
          resolve(reportElements);
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

	const doRenderElement = function(shopData, wrapper, reportElements, ratio, paperSize){
		return new Promise(async function(resolve, reject) {
			let newRatio = 1;
			if (ratio) {
				newRatio = ratio;
			}
			let maxTop = 0;
			const promiseList = new Promise(async function(resolve2, reject2) {
		    await reportElements.forEach((elem, i) => {
		      let element;
		      switch (elem.elementType) {
		        case "text":
		          element = $("<div></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
		          $(element).css({"font-size": Number(elem.fontsize)*newRatio + "px"});
		          $(element).css({"font-weight": elem.fontweight});
		          $(element).css({"font-style": elem.fontstyle});
		          $(element).css({"text-align": elem.fontalign});
							let field = elem.title.substring(1);
							if (field == 'shop_name') {
								$(element).text(shopData.Shop_Name);
							} else if (field == 'shop_address') {
								$(element).text(shopData.Shop_Address);
							} else {
								$(element).text(elem.title);
							}
		        break;
		        case "hr":
		          element = $("<div><hr/></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
		          $(element > "hr").css({"border": elem.border});
		        break;
		        case "image":
		          element = $("<div></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          let newImage = new Image();
		          newImage.src = elem.url;
		          newImage.setAttribute("width", Number(elem.width)*newRatio);
		          $(element).append(newImage);
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": "auto"});
		        break;
						case "table":
							//doCreateTable(wrapper, elem.rows);
							doRenderTable(wrapper, elem.rows, elem.x, elem.y, newRatio);
						break;
		      }
					if (element) {
		      	$(wrapper).append($(element));
					}
					if (Number(elem.y) > maxTop) {
						maxTop = Number(elem.y);
					}
		    });
				setTimeout(()=> {
	        resolve2(maxTop);
	      }, 1000);
	    });
	    Promise.all([promiseList]).then((ob)=> {
	      resolve(ob[0]);
	    });
		});
  }

	const doRenderTable = function(wrapper, tableRows, left, top, ratio){
		let table = $('<table cellpadding="0" cellspacing="0" width="100%" border="1"></tble>');
		for (let i=0; i < tableRows.length; i++){
			let row = $('<tr></tr>');
			if (tableRows[i].backgroundColor) {
				$(row).css({'background-color': tableRows[i].backgroundColor})
			}
			$(table).append($(row));
			for (let j=0; j < tableRows[i].fields.length; j++) {
				let cell = $('<td></td>');
				if (tableRows[i].fields.length == 2) {
					$(cell).attr("colspan", (tableRows[0].fields.length - 1).toString());
				}
				$(cell).attr({'align': tableRows[i].fields[j].fontalign, 'width': (Number(tableRows[i].fields[j].width.replace(/px$/, ''))*ratio)/* + 'px'*/});
				$(cell).css({'font-size': Number(tableRows[i].fields[j].fontsize)*ratio + "px", 'font-weight': tableRows[i].fields[j].fontweight, 'font-style': tableRows[i].fields[j].fontstyle});
				$(cell).text(tableRows[i].fields[j].cellData);
				$(row).append($(cell));
			}
		}
		$(wrapper).append($(table).css({'position': 'absolute', 'left': Number(left)*ratio+'px', 'top': Number(top)*ratio+'px'}));
		return $(wrapper);
	}

  const doShowTemplateDesign = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
			let billFieldOptions = await common.doGetApi('/api/shop/template/billFieldOptions', {});
			localStorage.setItem('billFieldOptions', JSON.stringify(billFieldOptions));
      $(workAreaBox).empty();

      let controlTemplateForm = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let controlRow = $('<tr></tr>').css({'background-color': '#ddd', 'border': '2px solid grey'});
      $(controlTemplateForm).append($(controlRow));
      let templatTypeSelector = doCreateTemplateTypeSelector(shopData);

			let paperSizeSelector = doCreatePaperSizeSelector();

      let templateNameInput = $('<input type="text"/>').css({'width': '260px'});
			let previewTemplateCmd = $('<input type="button" value=" ดูตัวอย่าง "/>');
      let saveNewTemplateCmd = $('<input type="button" value=" บันทึก "/>');
      $(controlRow).append($('<td width="10%" align="left"><b>ประเภทเอกสาร</b></td>'));
      $(controlRow).append($('<td width="15%" align="left"></td>').append($(templatTypeSelector)));
      $(controlRow).append($('<td width="10%" align="left"><b>ชื่อเอกสารใหม่</b></td>'));
      $(controlRow).append($('<td width="25%" align="left"></td>').append($(templateNameInput)));
			$(controlRow).append($('<td width="8%" align="left"><b>ขนาดกระดาษ</b></td>'));
      $(controlRow).append($('<td width="10%" align="center"></td>').append($(paperSizeSelector)));
			$(controlRow).append($('<td width="*" align="center"></td>').append($(previewTemplateCmd)).append($(saveNewTemplateCmd).css({'margin-left': '10px'})));
      $(workAreaBox).empty().append($(controlTemplateForm));
      let designAreaBox = doCreateTemplateDesignArea();
      $(workAreaBox).append($(designAreaBox));
			let paperSizeValue = $(paperSizeSelector).val();

      doLoadCommandAction();

			let wrapper = $(designAreaBox).find('#report-container');

			$(templatTypeSelector).on('change', (evt)=>{
				let selectValue = $(templatTypeSelector).val();
				onTemplateTypeChange(evt, selectValue, shopData, templateNameInput, paperSizeSelector, wrapper);
			});

			$(paperSizeSelector).on('change', (evt)=>{
				let paperSize = $(paperSizeSelector).val();
				onPaperSizeChange(evt, paperSize, shopData, wrapper)
			});

			$(previewTemplateCmd).on('click', async (evt)=>{
				let paperSize = $(paperSizeSelector).val();
				let reportWrapperWidth = $("#report-container").width();
				let templateDesignElements = await doCollectElement(paperSize);
				let wrapperBoxWidth = 760;
		    let newHeight = undefined;
				let renderRatio = undefined;
				let newRatio = doCalRatio(paperSize);

				let wrapperBox = $("<div></div>");
			  $(wrapperBox).css({"position": "relative", "height": "100vh"});

				let doCreatGUIView = async function() {
					$(wrapperBox).empty();
					if (paperSize == 1){
						renderRatio = wrapperBoxWidth / reportWrapperWidth;
						newHeight = constant.A4Height * newRatio;
						$(wrapperBox).css({'margin-left': '0px', 'width': '100%'});
					}  else if (paperSize == 2){
						renderRatio = reportWrapperWidth / wrapperBoxWidth;
						newHeight = constant.SlipHeight * newRatio;
						let adjustLeft = (wrapperBoxWidth - constant.SlipWidth) / 2;
						$(wrapperBox).css({'margin-left': adjustLeft+'px', 'width': reportWrapperWidth+'px'});
					}

					let maxTop = await doRenderElement(shopData, wrapperBox, templateDesignElements, renderRatio, paperSize);
					maxTop = (Number(maxTop) * renderRatio) + 20;
					$(wrapperBox).css({'height': maxTop+'px', 'max-height': maxTop + 'px'});
				}
				let doCreatJSONView = function() {
					$.fn.json_beautify = function() {
				    this.each(function(){
			        var el = $(this);
	            var obj = JSON.parse(el.val());
	            var pretty = JSON.stringify(obj, undefined, 4);
			        el.val(pretty);
				    });
					};
					let textArea = $('<textarea cols="81" rows="25"></textarea>').css({'font-size': '26px'});
					$(textArea).val(JSON.stringify(templateDesignElements));
					$(textArea).json_beautify();
					$(wrapperBox).empty().append($(textArea));
				}

				const radalertoption = {
		      title: 'ตัวอย่างเอกสาร',
		      msg: $(wrapperBox),
		      width: wrapperBoxWidth + 'px',
					okLabel:  'มุมมองเท็กซ์',
					cancelLabel: 'ตกลง',
		      onOk: function(evt) {
						let isJSONView = $(wrapperBox).find('textarea');
						if ($(isJSONView).length > 0) {
							let jsonVal = $(isJSONView).val();
							try {
								templateDesignElements = JSON.parse(jsonVal);
							} catch(err) {
								console.log(err);
							}
							doCreatGUIView();
							$(radAlertBox.okCmd).val('มุมมองเท็กซ์');
						} else {
							doCreatJSONView();
							$(radAlertBox.okCmd).val('มุมมองกราฟฟิก');
						}
		      },
					onCancel: function(evt){
						let isJSONView = $(wrapperBox).find('textarea');
						if ($(isJSONView).length > 0) {
							let jsonVal = $(isJSONView).val();
							try {
								templateDesignElements = JSON.parse(jsonVal);
								let newTemplateDesignElements = [{Content: templateDesignElements}];
								doShowTemplateLoaded(shopData, newTemplateDesignElements, templateNameInput, paperSizeSelector, wrapper);
							} catch(err) {
								console.log(err);
							}
						}
	          radAlertBox.closeAlert();
					}
		    }

				doCreatGUIView();
				let radAlertBox = $('body').radalert(radalertoption);
		    //$(radAlertBox.cancelCmd).hide();

				$(radAlertBox.handle).draggable({
					containment: "parent"
				});
			});

			$(saveNewTemplateCmd).on('click', async(evt)=>{
				let paperSize = $(paperSizeSelector).val();
				let templateDesignElements = await doCollectElement(paperSize);
				let templateName = $(templateNameInput).val();
				let templatType = $(templatTypeSelector).val();
				let params = {data: {Name: templateName, TypeId: parseInt(templatType), Content: templateDesignElements, PaperSize: parseInt(paperSize)}, shopId: shopData.id};
				console.log(params);
				let templateRes = await common.doCallApi('/api/shop/template/save', params);
				console.log(templateRes);
        if (templateRes.status.code == 200) {
          $.notify("บันทึกรูปแบบเอกสารสำเร็จ", "success");
        } else if (templateRes.status.code == 201) {
          $.notify("ไม่สามารถบันทึกรูปแบบเอกสารได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
        } else {
          $.notify("เกิดข้อผิดพลาด ไม่สามารถบันทึกรูปแบบเอกสารได้", "error");
        }
			});

			$(templatTypeSelector).change();

      resolve();
    });
  }

	const doShowTemplateLoaded = function(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper) {
		$(wrapper).empty();
		let elements = templateItems[0].Content;
		const promiseList = new Promise(async function(resolve2, reject2){
			for (let i=0; i < elements.length; i++){
				let element = elements[i];
				let elementType = element.elementType;
				let elementCreated = elementProperty.doCreateElement(wrapper, elementType, element);
			}
			common.delay(900).then(()=>resolve2());
		});
		Promise.all([promiseList]).then((ob)=>{
			$(templateNameInput).val(templateItems[0].Name);
			$(paperSizeSelector).val(templateItems[0].PaperSize).change();
		});
	}

  const onTemplateTypeChange = async function(evt, typeValue, shopData, templateNameInput, paperSizeSelector, wrapper){
		let templateRes = await common.doCallApi('/api/shop/template/list/by/shop/' + shopData.id, {});
		let templateItems = templateRes.Records;
		if (templateItems.length > 0) {
			let typeFilters = await templateItems.filter((template)=>{
				if (typeValue == template.TypeId) {
					return template;
				}
			});
			if (typeFilters.length > 0) {
				doShowTemplateLoaded(shopData, typeFilters, templateNameInput, paperSizeSelector, wrapper);
			} else {
				//doCreateDefualTemplate
				templateRes = await common.doCallApi('/api/shop/template/select/1', {});
				templateItems = templateRes.Records;
				doShowTemplateLoaded(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper);
			}
		} else {
			//doCreateDefualTemplate
			templateRes = await common.doCallApi('/api/shop/template/select/1', {});
			templateItems = templateRes.Records;
			doShowTemplateLoaded(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper);
		}
  }

	const onPaperSizeChange = function(evt, paperSize, shopData, wrapper){
		resetContainer(paperSize);
	}

  return {
    doShowTemplateDesign
	}
}

},{"../../../home/mod/common-lib.js":2,"../../../home/mod/constant-lib.js":3,"./element-property-lib.js":10}],22:[function(require,module,exports){
module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);

	const userTableFields = [
		{fieldName: 'username', displayName: 'Username', width: '15%', align: 'left', inputSize: '30', verify: false},
		{fieldName: 'id', displayName: 'UserId', width: '5%', align: 'center', inputSize: '30', verify: false},
	];
  const userinfoTableFields = [
		{fieldName: 'User_NameEN', displayName: 'ชื่อ (ภาษาอังกฤษ)', width: '12%', align: 'left', inputSize: '30', verify: false, showHeader: false},
		{fieldName: 'User_LastNameEN', displayName: 'นามสกุล (ภาษาอังกฤษ)', width: '12%', align: 'left', inputSize: '30', verify: false, showHeader: false},
    {fieldName: 'User_NameTH', displayName: 'ชื่อ (ภาษาไทย)', width: '15%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'User_LastNameTH', displayName: 'นามสกุล (ภาษาไทย)', width: '15%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'User_Phone', displayName: 'โทรศัพท์', width: '10%', align: 'left', inputSize: '20', verify: true, showHeader: true},
		{fieldName: 'User_Email', displayName: 'อีเมล์', width: '10%', align: 'left', inputSize: '30', verify: false, showHeader: false},
		{fieldName: 'User_LineID', displayName: 'Line ID', width: '10%', align: 'center', inputSize: '30', verify: false, showHeader: false},
	];
  const usertypeTableFields = [
		{fieldName: 'UserType_Name', displayName: 'ประเภทผู้ใช้งาน', width: '15%', align: 'left', inputSize: '30', verify: true},
	];

  const doShowUserItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      let usertypeRes = await common.doCallApi('/api/shop/usertype/options', {});
      let usertypes = usertypeRes.Options;
      localStorage.setItem('usertypes', JSON.stringify(usertypes));
      $(workAreaBox).empty();
      let userRes = await common.doCallApi('/api/shop/user/list/by/shop/' + shopData.id, {});
			let userItems = userRes.Records;

      let titlePageBox = $('<div style="padding: 4px;">รายการผู้ใช้งานในร้านค้า</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			$(workAreaBox).append($(titlePageBox));
			let newUserCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let newUserCmd = $('<input type="button" value=" + New User " class="action-btn"/>');
			$(newUserCmd).on('click', (evt)=>{
				doOpenNewUserForm(shopData, workAreaBox);
			});
			$(newUserCmdBox).append($(newUserCmd))
			$(workAreaBox).append($(newUserCmdBox));

			let userTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < userTableFields.length; i++) {
				$(headerRow).append($('<td width="' + userTableFields[i].width + '" align="center"><b>' + userTableFields[i].displayName + '</b></td>'));
			}
      for (let i=0; i < userinfoTableFields.length; i++) {
        if (userinfoTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + userinfoTableFields[i].width + '" align="center"><b>' + userinfoTableFields[i].displayName + '</b></td>'));
        }
			}
      for (let i=0; i < usertypeTableFields.length; i++) {
				$(headerRow).append($('<td width="' + usertypeTableFields[i].width + '" align="center"><b>' + usertypeTableFields[i].displayName + '</b></td>'));
			}

			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(userTable).append($(headerRow));

      for (let x=0; x < userItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = userItems[x];
				for (let i=0; i < userTableFields.length; i++) {
					let field = $('<td align="' + userTableFields[i].align + '"></td>');
          $(field).text(item[userTableFields[i].fieldName]);
          $(itemRow).append($(field));
        }
        for (let i=0; i < userinfoTableFields.length; i++) {
          if (userinfoTableFields[i].showHeader) {
  					let field = $('<td align="' + userinfoTableFields[i].align + '"></td>');
            $(field).text(item.userinfo[userinfoTableFields[i].fieldName]);
            $(itemRow).append($(field));
          }
        }
        for (let i=0; i < usertypeTableFields.length; i++) {
					let field = $('<td align="' + usertypeTableFields[i].align + '"></td>');
          $(field).text(item.usertype[usertypeTableFields[i].fieldName]);
          $(itemRow).append($(field));
        }

        let commandCell = $('<td align="center"></td>');

				let editUserCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editUserCmd).on('click', (evt)=>{
					doOpenEditUserForm(shopData, workAreaBox, item);
				});
				let resetPasswordCmd = $('<input type="button" value=" Reset Passord " class="action-btn"/>').css({'margin-left': '8px'});
				$(resetPasswordCmd).on('click', (evt)=>{
					doResetPassword(shopData, workAreaBox, item.id);
				});
				let deleteUserCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteUserCmd).on('click', (evt)=>{
					doDeleteUser(shopData, workAreaBox, item.id);
				});

				$(commandCell).append($(editUserCmd));
				$(commandCell).append($(resetPasswordCmd));
				$(commandCell).append($(deleteUserCmd));
        $(itemRow).append($(commandCell));
				$(userTable).append($(itemRow));
      }
      $(workAreaBox).append($(userTable));
      resolve();
    });
  }

	const doCreateVerifyUsernameForm = function(){
		let usernameFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">Username <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let usernameValue = $('<input type="text" id="Username" size="30"/>');
		$(inputField).append($(usernameValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let passwordValue = $('<input type="password" id="Password" size="30"/>');
		$(inputField).append($(passwordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Retry Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let retrypasswordValue = $('<input type="password" id="RetryPassword" size="30"/>');
		$(inputField).append($(retrypasswordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		return $(usernameFormTable);
	}

	const doCreateResetPasswordForm = function(){
		let resetPasswordFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let passwordValue = $('<input type="password" id="Password" size="30"/>');
		$(inputField).append($(passwordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(resetPasswordFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Retry Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let retrypasswordValue = $('<input type="password" id="RetryPassword" size="30"/>');
		$(inputField).append($(retrypasswordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(resetPasswordFormTable).append($(fieldRow));

		return $(resetPasswordFormTable);
	}

	const doCreateUserRegisterForm = function(userData){
		let regFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < userinfoTableFields.length; i++) {
			let fieldRow = $('<tr></tr>');
			let labelField = $('<td width="40%" align="left">' + userinfoTableFields[i].displayName + (userinfoTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
			let inputValue = $('<input type="text" id="' + userinfoTableFields[i].fieldName + '" size="' + userinfoTableFields[i].inputSize + '"/>');
			if ((userData) && (userData.userinfo[userinfoTableFields[i].fieldName])) {
				$(inputValue).val(userData.userinfo[userinfoTableFields[i].fieldName]);
			}
			$(inputField).append($(inputValue));
			$(fieldRow).append($(labelField));
			$(fieldRow).append($(inputField));
			$(regFormTable).append($(fieldRow));
		}
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">ประเภทผู้ใช้งาน <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputValue = $('<select id="UsertypeId"></select>');
		let usertypes = JSON.parse(localStorage.getItem('usertypes'));
		//console.log(usertypes);
		usertypes.forEach((item, i) => {
			$(inputValue).append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'))
		});
		if ((userData) && (userData.usertypeId)) {
			$(inputValue).val(userData.usertypeId);
		} else {
			$(inputValue).val(3);
		}
		$(inputField).append($(inputValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(regFormTable).append($(fieldRow));

		return $(regFormTable);
	}

	const doVerifyUserForm = function(){
		let isVerify = true;
		let userinfoDataForm = {};
		for (let i=0; i < userinfoTableFields.length; i++) {
			let curValue = $('#'+userinfoTableFields[i].fieldName).val();
			if (userinfoTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+userinfoTableFields[i].fieldName).css({'border': ''});
					userinfoDataForm[userinfoTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+userinfoTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					userinfoDataForm[userinfoTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		userinfoDataForm.usertypeId = $('#UsertypeId').val();
		return userinfoDataForm;
	}

	const doOpenNewUserForm = function(shopData, workAreaBox) {
		let verifyUsernameForm = doCreateVerifyUsernameForm();
		let radNewUserFormBox = $('<div></div>');
		$(radNewUserFormBox).append($(verifyUsernameForm));
		const newuserformoption = {
			title: 'ตรวจสอบ Username',
			msg: $(radNewUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newUsername = $(verifyUsernameForm).find('#Username').val();
				let newPassword = $(verifyUsernameForm).find('#Password').val();
				let newRetryPassword = $(verifyUsernameForm).find('#RetryPassword').val();
				if (newUsername === '') {
					$(verifyUsernameForm).find('#Username').css({'border': '1px solid red'});
				} else {
					$(verifyUsernameForm).find('#Username').css({'border': ''});
					if (newPassword === '') {
						$(verifyUsernameForm).find('#Password').css({'border': '1px solid red'});
					} else {
						$(verifyUsernameForm).find('#Password').css({'border': ''});
						if (newRetryPassword === ''){
							$(verifyUsernameForm).find('#RetryPassword').css({'border': '1px solid red'});
						} else {
							$(verifyUsernameForm).find('#RetryPassword').css({'border': ''});
							if (newPassword !== newRetryPassword) {
								$(verifyUsernameForm).find('#Password').css({'border': '1px solid red'});
								$(verifyUsernameForm).find('#RetryPassword').css({'border': '1px solid red'});
							} else {
								$(verifyUsernameForm).find('#Password').css({'border': ''});
								$(verifyUsernameForm).find('#RetryPassword').css({'border': ''});
								let newUserFormObj = {username: newUsername, password: newPassword};
								let userRes = await common.doCallApi('/api/shop/user/verifyusername/' + newUsername, newUserFormObj);
								console.log(userRes);
								if (!userRes.result.result) {
									$(verifyUsernameForm).find('#Username').css({'border': ''});
									newUserFormBox.closeAlert();
									doOpenUserRegisterForm(shopData, workAreaBox, newUserFormObj);
								} else {
									$(verifyUsernameForm).find('#Username').css({'border': '1px solid red'});
									$.notify("Invalid Username", "error");
								}
							}
						}
					}
				}
			},
			onCancel: function(evt){
				newUserFormBox.closeAlert();
			}
		}
		let newUserFormBox = $('body').radalert(newuserformoption);
	}

	const doOpenUserRegisterForm = function(shopData, workAreaBox, newUsernameData){
		let newRegForm = doCreateUserRegisterForm();
		let radNewUserFormBox = $('<div></div>');
		$(radNewUserFormBox).append($(newRegForm));
		const newuserformoption = {
			title: 'เพิ่มผู้ใช้งานใหม่ของร้าน',
			msg: $(radNewUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newUserFormObj = doVerifyUserForm();
				console.log(newUserFormObj);
				if (newUserFormObj) {
					let hasValue = newUserFormObj.hasOwnProperty('User_NameTH');
					if (hasValue){
						newUserFormBox.closeAlert();
						newUserFormObj.username = newUsernameData.username;
						newUserFormObj.password = newUsernameData.password;
						newUserFormObj.shopId = shopData.id;
						let userRes = await common.doCallApi('/api/shop/user/add', newUserFormObj);
						if (userRes.status.code == 200) {
							$.notify("เพิ่มรายการผู้ใช้งานสำเร็จ", "success");
							await doShowUserItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถเพิ่มรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการผู้ใช้งานได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				newUserFormBox.closeAlert();
			}
		}
		let newUserFormBox = $('body').radalert(newuserformoption);
	}

	const doOpenEditUserForm = function(shopData, workAreaBox, userData){
		let editRegForm = doCreateUserRegisterForm(userData);
		let radEditUserFormBox = $('<div></div>');
		$(radEditUserFormBox).append($(editRegForm));
		const edituserformoption = {
			title: 'แก้ไขผู้ใช้งานของร้าน',
			msg: $(radEditUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editUserFormObj = doVerifyUserForm();
				if (editUserFormObj) {
					let hasValue = editUserFormObj.hasOwnProperty('User_NameTH');
					if (hasValue){
						editUserFormBox.closeAlert();
						let params = {data: editUserFormObj, id: userData.id, userinfoId: userData.userinfo.id};
						let userRes = await common.doCallApi('/api/shop/user/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการผู้ใช้งานสำเร็จ", "success");
							await doShowUserItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการผู้ใช้งานได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editUserFormBox.closeAlert();
			}
		}
		let editUserFormBox = $('body').radalert(edituserformoption);
	}

	const doResetPassword = function(shopData, workAreaBox, userId){
		let resetForm = doCreateResetPasswordForm();
		let radResetFormBox = $('<div></div>');
		$(radResetFormBox).append($(resetForm));
		const resetpasswordformoption = {
			title: 'Reset Password',
			msg: $(radResetFormBox),
			width: '420px',
			onOk: async function(evt) {
				let newPassword = $(resetForm).find('#Password').val();
				let newRetryPassword = $(resetForm).find('#RetryPassword').val();
				if (newPassword === '') {
					$(resetForm).find('#Password').css({'border': '1px solid red'});
				} else {
					$(resetForm).find('#Password').css({'border': ''});
					if (newRetryPassword === ''){
						$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
					} else {
						$(resetForm).find('#RetryPassword').css({'border': ''});
						if (newPassword !== newRetryPassword) {
							$(resetForm).find('#Password').css({'border': '1px solid red'});
							$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
						} else {
							$(resetForm).find('#Password').css({'border': ''});
							$(resetForm).find('#RetryPassword').css({'border': ''});
							let newPasswordFormObj = {userId: userId, password: newPassword};
							let userRes = await common.doCallApi('/api/shop/user/resetpassword', newPasswordFormObj);
							console.log(userRes);
							if (userRes.status.code == 200) {
								$(resetForm).find('#Password').css({'border': ''});
								$(resetForm).find('#RetryPassword').css({'border': ''});
								resetPasswordFormBox.closeAlert();
								await doShowUserItem(shopData, workAreaBox);
							} else {
								$(resetForm).find('#Password').css({'border': '1px solid red'});
								$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
								$.notify("Invalid Password", "error");
							}
						}
					}
				}
			},
			onCancel: function(evt){
				resetPasswordFormBox.closeAlert();
			}
		}
		let resetPasswordFormBox = $('body').radalert(resetpasswordformoption);
	}

	const doDeleteUser = function(shopData, workAreaBox, userId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบผู้ใช้งานรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบผู้ใช้งาน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบผู้ใช้งาน',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let userRes = await common.doCallApi('/api/shop/user/delete', {id: userId});
				if (userRes.status.code == 200) {
					$.notify("ลบรายการผู้ใช้งานรายการทีเลือกสำเร็จ", "success");
					let workingAreaBox = $('#WorkingAreaBox');
					await doShowUserItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการผู้ใช้งานได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowUserItem
	}
}

},{"../../../home/mod/common-lib.js":2}],23:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v3.7.1
 * https://jquery.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2023-08-28T13:37Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket trac-14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

		// Support: Chrome <=57, Firefox <=52
		// In some browsers, typeof returns "function" for HTML <object> elements
		// (i.e., `typeof document.createElement( "object" ) === "function"`).
		// We don't want to classify *any* DOM node as a function.
		// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
		// Plus for old WebKit, typeof returns "function" for HTML collections
		// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
		return typeof obj === "function" && typeof obj.nodeType !== "number" &&
			typeof obj.item !== "function";
	};


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var version = "3.7.1",

	rhtmlSuffix = /HTML$/i,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},


	// Retrieve the text value of an array of DOM nodes
	text: function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {

			// If no nodeType, this is expected to be an array
			while ( ( node = elem[ i++ ] ) ) {

				// Do not traverse comment nodes
				ret += jQuery.text( node );
			}
		}
		if ( nodeType === 1 || nodeType === 11 ) {
			return elem.textContent;
		}
		if ( nodeType === 9 ) {
			return elem.documentElement.textContent;
		}
		if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}

		// Do not include comment or processing instruction nodes

		return ret;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
						[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	isXMLDoc: function( elem ) {
		var namespace = elem && elem.namespaceURI,
			docElem = elem && ( elem.ownerDocument || elem ).documentElement;

		// Assume HTML when documentElement doesn't yet exist, such as inside
		// document fragments.
		return !rhtmlSuffix.test( namespace || docElem && docElem.nodeName || "HTML" );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}


function nodeName( elem, name ) {

	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

}
var pop = arr.pop;


var sort = arr.sort;


var splice = arr.splice;


var whitespace = "[\\x20\\t\\r\\n\\f]";


var rtrimCSS = new RegExp(
	"^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
	"g"
);




// Note: an element does not contain itself
jQuery.contains = function( a, b ) {
	var bup = b && b.parentNode;

	return a === bup || !!( bup && bup.nodeType === 1 && (

		// Support: IE 9 - 11+
		// IE doesn't have `contains` on SVG.
		a.contains ?
			a.contains( bup ) :
			a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
	) );
};




// CSS string/identifier serialization
// https://drafts.csswg.org/cssom/#common-serializing-idioms
var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;

function fcssescape( ch, asCodePoint ) {
	if ( asCodePoint ) {

		// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
		if ( ch === "\0" ) {
			return "\uFFFD";
		}

		// Control characters and (dependent upon position) numbers get escaped as code points
		return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
	}

	// Other potentially-special ASCII characters get backslash-escaped
	return "\\" + ch;
}

jQuery.escapeSelector = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};




var preferredDoc = document,
	pushNative = push;

( function() {

var i,
	Expr,
	outermostContext,
	sortInput,
	hasDuplicate,
	push = pushNative,

	// Local document vars
	document,
	documentElement,
	documentIsHTML,
	rbuggyQSA,
	matches,

	// Instance-specific data
	expando = jQuery.expando,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|" +
		"loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: https://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rleadingCombinator = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" +
		whitespace + "*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		ID: new RegExp( "^#(" + identifier + ")" ),
		CLASS: new RegExp( "^\\.(" + identifier + ")" ),
		TAG: new RegExp( "^(" + identifier + "|[*])" ),
		ATTR: new RegExp( "^" + attributes ),
		PSEUDO: new RegExp( "^" + pseudos ),
		CHILD: new RegExp(
			"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
				whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
				whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		bool: new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		needsContext: new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// https://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		if ( nonHex ) {

			// Strip the backslash prefix from a non-hex escape sequence
			return nonHex;
		}

		// Replace a hexadecimal escape sequence with the encoded Unicode code point
		// Support: IE <=11+
		// For values outside the Basic Multilingual Plane (BMP), manually construct a
		// surrogate pair
		return high < 0 ?
			String.fromCharCode( high + 0x10000 ) :
			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes; see `setDocument`.
	// Support: IE 9 - 11+, Edge 12 - 18+
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE/Edge.
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && nodeName( elem, "fieldset" );
		},
		{ dir: "parentNode", next: "legend" }
	);

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android <=4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = {
		apply: function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		},
		call: function( target ) {
			pushNative.apply( target, slice.call( arguments, 1 ) );
		}
	};
}

function find( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE 9 only
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								push.call( results, elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE 9 only
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							find.contains( context, elem ) &&
							elem.id === m ) {

							push.call( results, elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && context.getElementsByClassName ) {
					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( !nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rleadingCombinator.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when
					// strict-comparing two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( newContext != context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = jQuery.escapeSelector( nid );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrimCSS, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties
		// (see https://github.com/jquery/sizzle/issues/157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by jQuery selector module
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		return nodeName( elem, "input" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		return ( nodeName( elem, "input" ) || nodeName( elem, "button" ) ) &&
			elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11+
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a jQuery selector context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [node] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
function setDocument( node ) {
	var subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	documentElement = document.documentElement;
	documentIsHTML = !jQuery.isXMLDoc( document );

	// Support: iOS 7 only, IE 9 - 11+
	// Older browsers didn't support unprefixed `matches`.
	matches = documentElement.matches ||
		documentElement.webkitMatchesSelector ||
		documentElement.msMatchesSelector;

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors
	// (see trac-13936).
	// Limit the fix to IE & Edge Legacy; despite Edge 15+ implementing `matches`,
	// all IE 9+ and Edge Legacy versions implement `msMatchesSelector` as well.
	if ( documentElement.msMatchesSelector &&

		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 9 - 11+, Edge 12 - 18+
		subWindow.addEventListener( "unload", unloadHandler );
	}

	// Support: IE <10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		documentElement.appendChild( el ).id = jQuery.expando;
		return !document.getElementsByName ||
			!document.getElementsByName( jQuery.expando ).length;
	} );

	// Support: IE 9 only
	// Check to see if it's possible to do matchesSelector
	// on a disconnected node.
	support.disconnectedMatch = assert( function( el ) {
		return matches.call( el, "*" );
	} );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// IE/Edge don't support the :scope pseudo-class.
	support.scope = assert( function() {
		return document.querySelectorAll( ":scope" );
	} );

	// Support: Chrome 105 - 111 only, Safari 15.4 - 16.3 only
	// Make sure the `:has()` argument is parsed unforgivingly.
	// We include `*` in the test to detect buggy implementations that are
	// _selectively_ forgiving (specifically when the list includes at least
	// one valid selector).
	// Note that we treat complete lack of support for `:has()` as if it were
	// spec-compliant support, which is fine because use of `:has()` in such
	// environments will fail in the qSA path and fall back to jQuery traversal
	// anyway.
	support.cssHas = assert( function() {
		try {
			document.querySelector( ":has(*,:jqfake)" );
			return false;
		} catch ( e ) {
			return true;
		}
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter.ID = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find.ID = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter.ID =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find.ID = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find.TAG = function( tag, context ) {
		if ( typeof context.getElementsByTagName !== "undefined" ) {
			return context.getElementsByTagName( tag );

		// DocumentFragment nodes don't have gEBTN
		} else {
			return context.querySelectorAll( tag );
		}
	};

	// Class
	Expr.find.CLASS = function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	rbuggyQSA = [];

	// Build QSA regex
	// Regex strategy adopted from Diego Perini
	assert( function( el ) {

		var input;

		documentElement.appendChild( el ).innerHTML =
			"<a id='" + expando + "' href='' disabled='disabled'></a>" +
			"<select id='" + expando + "-\r\\' disabled='disabled'>" +
			"<option selected=''></option></select>";

		// Support: iOS <=7 - 8 only
		// Boolean attributes and "value" are not treated correctly in some XML documents
		if ( !el.querySelectorAll( "[selected]" ).length ) {
			rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
		}

		// Support: iOS <=7 - 8 only
		if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
			rbuggyQSA.push( "~=" );
		}

		// Support: iOS 8 only
		// https://bugs.webkit.org/show_bug.cgi?id=136851
		// In-page `selector#id sibling-combinator selector` fails
		if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
			rbuggyQSA.push( ".#.+[+~]" );
		}

		// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
		// In some of the document kinds, these selectors wouldn't work natively.
		// This is probably OK but for backwards compatibility we want to maintain
		// handling them through jQuery traversal in jQuery 3.x.
		if ( !el.querySelectorAll( ":checked" ).length ) {
			rbuggyQSA.push( ":checked" );
		}

		// Support: Windows 8 Native Apps
		// The type and name attributes are restricted during .innerHTML assignment
		input = document.createElement( "input" );
		input.setAttribute( "type", "hidden" );
		el.appendChild( input ).setAttribute( "name", "D" );

		// Support: IE 9 - 11+
		// IE's :disabled selector does not pick up the children of disabled fieldsets
		// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
		// In some of the document kinds, these selectors wouldn't work natively.
		// This is probably OK but for backwards compatibility we want to maintain
		// handling them through jQuery traversal in jQuery 3.x.
		documentElement.appendChild( el ).disabled = true;
		if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
			rbuggyQSA.push( ":enabled", ":disabled" );
		}

		// Support: IE 11+, Edge 15 - 18+
		// IE 11/Edge don't find elements on a `[name='']` query in some cases.
		// Adding a temporary attribute to the document before the selection works
		// around the issue.
		// Interestingly, IE 10 & older don't seem to have the issue.
		input = document.createElement( "input" );
		input.setAttribute( "name", "" );
		el.appendChild( input );
		if ( !el.querySelectorAll( "[name='']" ).length ) {
			rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
				whitespace + "*(?:''|\"\")" );
		}
	} );

	if ( !support.cssHas ) {

		// Support: Chrome 105 - 110+, Safari 15.4 - 16.3+
		// Our regular `try-catch` mechanism fails to detect natively-unsupported
		// pseudo-classes inside `:has()` (such as `:has(:contains("Foo"))`)
		// in browsers that parse the `:has()` argument as a forgiving selector list.
		// https://drafts.csswg.org/selectors/#relational now requires the argument
		// to be parsed unforgivingly, but browsers have not yet fully adjusted.
		rbuggyQSA.push( ":has" );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a === document || a.ownerDocument == preferredDoc &&
				find.contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b === document || b.ownerDocument == preferredDoc &&
				find.contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	};

	return document;
}

find.matches = function( expr, elements ) {
	return find( expr, null, null, elements );
};

find.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyQSA || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return find( expr, document, null, [ elem ] ).length > 0;
};

find.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return jQuery.contains( context, elem );
};


find.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (see trac-13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	if ( val !== undefined ) {
		return val;
	}

	return elem.getAttribute( name );
};

find.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
jQuery.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	//
	// Support: Android <=4.0+
	// Testing for detecting duplicates is unpredictable so instead assume we can't
	// depend on duplicate detection in all browsers without a stable sort.
	hasDuplicate = !support.sortStable;
	sortInput = !support.sortStable && slice.call( results, 0 );
	sort.call( results, sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			splice.call( results, duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

jQuery.fn.uniqueSort = function() {
	return this.pushStack( jQuery.uniqueSort( slice.apply( this ) ) );
};

Expr = jQuery.expr = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		ATTR: function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] || match[ 5 ] || "" )
				.replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		CHILD: function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					find.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" )
				);
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

			// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				find.error( match[ 0 ] );
			}

			return match;
		},

		PSEUDO: function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr.CHILD.test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		TAG: function( nodeNameSelector ) {
			var expectedNodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return nodeName( elem, expectedNodeName );
				};
		},

		CLASS: function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace + ")" + className +
					"(" + whitespace + "|$)" ) ) &&
				classCache( className, function( elem ) {
					return pattern.test(
						typeof elem.className === "string" && elem.className ||
							typeof elem.getAttribute !== "undefined" &&
								elem.getAttribute( "class" ) ||
							""
					);
				} );
		},

		ATTR: function( name, operator, check ) {
			return function( elem ) {
				var result = find.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				if ( operator === "=" ) {
					return result === check;
				}
				if ( operator === "!=" ) {
					return result !== check;
				}
				if ( operator === "^=" ) {
					return check && result.indexOf( check ) === 0;
				}
				if ( operator === "*=" ) {
					return check && result.indexOf( check ) > -1;
				}
				if ( operator === "$=" ) {
					return check && result.slice( -check.length ) === check;
				}
				if ( operator === "~=" ) {
					return ( " " + result.replace( rwhitespace, " " ) + " " )
						.indexOf( check ) > -1;
				}
				if ( operator === "|=" ) {
					return result === check || result.slice( 0, check.length + 1 ) === check + "-";
				}

				return false;
			};
		},

		CHILD: function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || ( parent[ expando ] = {} );
							cache = outerCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {
								outerCache = elem[ expando ] || ( elem[ expando ] = {} );
								cache = outerCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );
											outerCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		PSEUDO: function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// https://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					find.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as jQuery does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		not: markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrimCSS, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element
					// (see https://github.com/jquery/sizzle/issues/299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		has: markFunction( function( selector ) {
			return function( elem ) {
				return find( selector, elem ).length > 0;
			};
		} ),

		contains: markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || jQuery.text( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// https://www.w3.org/TR/selectors/#lang-pseudo
		lang: markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				find.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		target: function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		root: function( elem ) {
			return elem === documentElement;
		},

		focus: function( elem ) {
			return elem === safeActiveElement() &&
				document.hasFocus() &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		enabled: createDisabledPseudo( false ),
		disabled: createDisabledPseudo( true ),

		checked: function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			return ( nodeName( elem, "input" ) && !!elem.checked ) ||
				( nodeName( elem, "option" ) && !!elem.selected );
		},

		selected: function( elem ) {

			// Support: IE <=11+
			// Accessing the selectedIndex property
			// forces the browser to treat the default option as
			// selected when in an optgroup.
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		empty: function( elem ) {

			// https://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		parent: function( elem ) {
			return !Expr.pseudos.empty( elem );
		},

		// Element/input types
		header: function( elem ) {
			return rheader.test( elem.nodeName );
		},

		input: function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		button: function( elem ) {
			return nodeName( elem, "input" ) && elem.type === "button" ||
				nodeName( elem, "button" );
		},

		text: function( elem ) {
			var attr;
			return nodeName( elem, "input" ) && elem.type === "text" &&

				// Support: IE <10 only
				// New HTML5 attribute values (e.g., "search") appear
				// with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		first: createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		last: createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		eq: createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		even: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		odd: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		lt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i;

			if ( argument < 0 ) {
				i = argument + length;
			} else if ( argument > length ) {
				i = length;
			} else {
				i = argument;
			}

			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		gt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos.nth = Expr.pseudos.eq;

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rleadingCombinator.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrimCSS, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	if ( parseOnly ) {
		return soFar.length;
	}

	return soFar ?
		find.error( selector ) :

		// Cache the tokens
		tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						if ( skip && nodeName( elem, skip ) ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = outerCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							outerCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		find( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem, matcherOut,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed ||
				multipleContexts( selector || "*",
					context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems;

		if ( matcher ) {

			// If we have a postFinder, or filtered seed, or non-seed postFilter
			// or preexisting results,
			matcherOut = postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results;

			// Find primary matches
			matcher( matcherIn, matcherOut, context, xml );
		} else {
			matcherOut = matcherIn;
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf.call( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			var ret = ( !leadingRelative && ( xml || context != outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element
			// (see https://github.com/jquery/sizzle/issues/299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 )
							.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrimCSS, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find.TAG( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: iOS <=7 - 9 only
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching
			// elements by id. (see trac-14142)
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							push.call( results, elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					jQuery.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

function compile( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
}

/**
 * A low-level selection function that works with jQuery's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with jQuery selector compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find.ID(
				token.matches[ 0 ].replace( runescape, funescape ),
				context
			) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr.needsContext.test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) &&
						testContext( context.parentNode ) || context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
}

// One-time assignments

// Support: Android <=4.0 - 4.1+
// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Initialize against the default document
setDocument();

// Support: Android <=4.0 - 4.1+
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

jQuery.find = find;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.unique = jQuery.uniqueSort;

// These have always been private, but they used to be documented as part of
// Sizzle so let's maintain them for now for backwards compatibility purposes.
find.compile = compile;
find.select = select;
find.setDocument = setDocument;
find.tokenize = tokenize;

find.escape = jQuery.escapeSelector;
find.getText = jQuery.text;
find.isXML = jQuery.isXMLDoc;
find.selectors = jQuery.expr;
find.support = jQuery.support;
find.uniqueSort = jQuery.uniqueSort;

	/* eslint-enable */

} )();


var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (trac-9521)
	// Strict HTML recognition (trac-11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to jQuery#find
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.error );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the error, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getErrorHook ) {
									process.error = jQuery.Deferred.getErrorHook();

								// The deprecated alias of the above. While the name suggests
								// returning the stack, not an error instance, jQuery just passes
								// it directly to `console.warn` so both will work; an instance
								// just better cooperates with source maps.
								} else if ( jQuery.Deferred.getStackHook ) {
									process.error = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the primary Deferred
			primary = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						primary.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( primary.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return primary.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
		}

		return primary.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

// If `jQuery.Deferred.getErrorHook` is defined, `asyncError` is an error
// captured before the async barrier to get the original error cause
// which may otherwise be hidden.
jQuery.Deferred.exceptionHook = function( error, asyncError ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message,
			error.stack, asyncError );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See trac-6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (trac-9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see trac-8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (trac-14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (trac-11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (trac-14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (trac-13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (trac-15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (trac-12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
				dataPriv.get( this, "events" ) || Object.create( null )
			)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (trac-13208)
				// Don't process clicks on disabled elements (trac-6911, trac-8165, trac-11382, trac-11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (trac-13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
						return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
						return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", true );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, isSetup ) {

	// Missing `isSetup` indicates a trigger call, which must force setup through jQuery.event.add
	if ( !isSetup ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				if ( !saved ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					this[ type ]();
					result = dataPriv.get( this, type );
					dataPriv.set( this, type, false );

					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();

						return result;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering
				// the native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved ) {

				// ...and capture the result
				dataPriv.set( this, type, jQuery.event.trigger(
					saved[ 0 ],
					saved.slice( 1 ),
					this
				) );

				// Abort handling of the native event by all jQuery handlers while allowing
				// native handlers on the same element to run. On target, this is achieved
				// by stopping immediate propagation just on the jQuery event. However,
				// the native event is re-wrapped by a jQuery one on each level of the
				// propagation so the only way to stop it for jQuery is to stop it for
				// everyone via native `stopPropagation()`. This is not a problem for
				// focus/blur which don't bubble, but it does also stop click on checkboxes
				// and radios. We accept this limitation.
				event.stopPropagation();
				event.isImmediatePropagationStopped = returnTrue;
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (trac-504, trac-13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,
	which: true
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {

	function focusMappedHandler( nativeEvent ) {
		if ( document.documentMode ) {

			// Support: IE 11+
			// Attach a single focusin/focusout handler on the document while someone wants
			// focus/blur. This is because the former are synchronous in IE while the latter
			// are async. In other browsers, all those handlers are invoked synchronously.

			// `handle` from private data would already wrap the event, but we need
			// to change the `type` here.
			var handle = dataPriv.get( this, "handle" ),
				event = jQuery.event.fix( nativeEvent );
			event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
			event.isSimulated = true;

			// First, handle focusin/focusout
			handle( nativeEvent );

			// ...then, handle focus/blur
			//
			// focus/blur don't bubble while focusin/focusout do; simulate the former by only
			// invoking the handler at the lower level.
			if ( event.target === event.currentTarget ) {

				// The setup part calls `leverageNative`, which, in turn, calls
				// `jQuery.event.add`, so event handle will already have been set
				// by this point.
				handle( event );
			}
		} else {

			// For non-IE browsers, attach a single capturing handler on the document
			// while someone wants focusin/focusout.
			jQuery.event.simulate( delegateType, nativeEvent.target,
				jQuery.event.fix( nativeEvent ) );
		}
	}

	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			var attaches;

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, true );

			if ( document.documentMode ) {

				// Support: IE 9 - 11+
				// We use the same native handler for focusin & focus (and focusout & blur)
				// so we need to coordinate setup & teardown parts between those events.
				// Use `delegateType` as the key as `type` is already used by `leverageNative`.
				attaches = dataPriv.get( this, delegateType );
				if ( !attaches ) {
					this.addEventListener( delegateType, focusMappedHandler );
				}
				dataPriv.set( this, delegateType, ( attaches || 0 ) + 1 );
			} else {

				// Return false to allow normal processing in the caller
				return false;
			}
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		teardown: function() {
			var attaches;

			if ( document.documentMode ) {
				attaches = dataPriv.get( this, delegateType ) - 1;
				if ( !attaches ) {
					this.removeEventListener( delegateType, focusMappedHandler );
					dataPriv.remove( this, delegateType );
				} else {
					dataPriv.set( this, delegateType, attaches );
				}
			} else {

				// Return false to indicate standard teardown should be applied
				return false;
			}
		},

		// Suppress native focus or blur if we're currently inside
		// a leveraged native-event stack
		_default: function( event ) {
			return dataPriv.get( event.target, type );
		},

		delegateType: delegateType
	};

	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	//
	// Support: IE 9 - 11+
	// To preserve relative focusin/focus & focusout/blur event order guaranteed on the 3.x branch,
	// attach a single handler for both events in IE.
	jQuery.event.special[ delegateType ] = {
		setup: function() {

			// Handle: regular nodes (via `this.ownerDocument`), window
			// (via `this.document`) & document (via `this`).
			var doc = this.ownerDocument || this.document || this,
				dataHolder = document.documentMode ? this : doc,
				attaches = dataPriv.get( dataHolder, delegateType );

			// Support: IE 9 - 11+
			// We use the same native handler for focusin & focus (and focusout & blur)
			// so we need to coordinate setup & teardown parts between those events.
			// Use `delegateType` as the key as `type` is already used by `leverageNative`.
			if ( !attaches ) {
				if ( document.documentMode ) {
					this.addEventListener( delegateType, focusMappedHandler );
				} else {
					doc.addEventListener( type, focusMappedHandler, true );
				}
			}
			dataPriv.set( dataHolder, delegateType, ( attaches || 0 ) + 1 );
		},
		teardown: function() {
			var doc = this.ownerDocument || this.document || this,
				dataHolder = document.documentMode ? this : doc,
				attaches = dataPriv.get( dataHolder, delegateType ) - 1;

			if ( !attaches ) {
				if ( document.documentMode ) {
					this.removeEventListener( delegateType, focusMappedHandler );
				} else {
					doc.removeEventListener( type, focusMappedHandler, true );
				}
				dataPriv.remove( dataHolder, delegateType );
			} else {
				dataPriv.set( dataHolder, delegateType, attaches );
			}
		}
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,

	rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (trac-8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Re-enable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {

							// Unwrap a CDATA section containing script contents. This shouldn't be
							// needed as in XML documents they're already not visible when
							// inspecting element contents and in HTML documents they have no
							// meaning but we're preserving that logic for backwards compatibility.
							// This will be removed completely in 4.0. See gh-4904.
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew jQuery#find here for performance reasons:
			// https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var rcustomProp = /^--/;


var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (trac-15098, trac-14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (trac-8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		//
		// Support: Firefox 70+
		// Only Firefox includes border widths
		// in computed dimensions. (gh-4529)
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
				tr.style.cssText = "box-sizing:content-box;border:1px solid";

				// Support: Chrome 86+
				// Height set through cssText does not get applied.
				// Computed height then comes back as 0.
				tr.style.height = "1px";
				trChild.style.height = "9px";

				// Support: Android 8 Chrome 86+
				// In our bodyBackground.html iframe,
				// display for all div elements is set to "inline",
				// which causes a problem only in Android 8 Chrome 86.
				// Ensuring the div is `display: block`
				// gets around this issue.
				trChild.style.display = "block";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = ( parseInt( trStyle.height, 10 ) +
					parseInt( trStyle.borderTopWidth, 10 ) +
					parseInt( trStyle.borderBottomWidth, 10 ) ) === tr.offsetHeight;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		isCustomProp = rcustomProp.test( name ),

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, trac-12537)
	//   .css('--customProperty) (gh-3144)
	if ( computed ) {

		// Support: IE <=9 - 11+
		// IE only supports `"float"` in `getPropertyValue`; in computed styles
		// it's only available as `"cssFloat"`. We no longer modify properties
		// sent to `.css()` apart from camelCasing, so we need to check both.
		// Normally, this would create difference in behavior: if
		// `getPropertyValue` returns an empty string, the value returned
		// by `.css()` would be `undefined`. This is usually the case for
		// disconnected elements. However, in IE even disconnected elements
		// with no styles return `"none"` for `getPropertyValue( "float" )`
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( isCustomProp && ret ) {

			// Support: Firefox 105+, Chrome <=105+
			// Spec requires trimming whitespace for custom properties (gh-4926).
			// Firefox only trims leading whitespace. Chrome just collapses
			// both leading & trailing whitespace to a single space.
			//
			// Fall back to `undefined` if empty string returned.
			// This collapses a missing definition with property defined
			// and set to an empty string but there's no standard API
			// allowing us to differentiate them without a performance penalty
			// and returning `undefined` aligns with older jQuery.
			//
			// rtrimCSS treats U+000D CARRIAGE RETURN and U+000C FORM FEED
			// as whitespace while CSS does not, but this is not a problem
			// because CSS preprocessing replaces them with U+000A LINE FEED
			// (which *is* CSS whitespace)
			// https://www.w3.org/TR/css-syntax-3/#input-preprocessing
			ret = ret.replace( rtrimCSS, "$1" ) || undefined;
		}

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0,
		marginDelta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		// Count margin delta separately to only add it after scroll gutter adjustment.
		// This is needed to make negative margins work with `outerHeight( true )` (gh-3982).
		if ( box === "margin" ) {
			marginDelta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta + marginDelta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		animationIterationCount: true,
		aspectRatio: true,
		borderImageSlice: true,
		columnCount: true,
		flexGrow: true,
		flexShrink: true,
		fontWeight: true,
		gridArea: true,
		gridColumn: true,
		gridColumnEnd: true,
		gridColumnStart: true,
		gridRow: true,
		gridRowEnd: true,
		gridRowStart: true,
		lineHeight: true,
		opacity: true,
		order: true,
		orphans: true,
		scale: true,
		widows: true,
		zIndex: true,
		zoom: true,

		// SVG-related
		fillOpacity: true,
		floodOpacity: true,
		stopOpacity: true,
		strokeMiterlimit: true,
		strokeOpacity: true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (trac-7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug trac-9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (trac-7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
					swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, dimension, extra );
					} ) :
					getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
				jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

				/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (trac-12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
					animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};

		doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// Use proper attribute retrieval (trac-12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];
						if ( cur.indexOf( " " + className + " " ) < 0 ) {
							cur += className + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );

				// This expression is here for better compressibility (see addClass)
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];

						// Remove *all* instances
						while ( cur.indexOf( " " + className + " " ) > -1 ) {
							cur = cur.replace( " " + className + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var classNames, className, i, self,
			type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		classNames = classesToArray( value );

		return this.each( function() {
			if ( isValidValue ) {

				// Toggle individual class names
				self = jQuery( this );

				for ( i = 0; i < classNames.length; i++ ) {
					className = classNames[ i ];

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (trac-14686, trac-14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (trac-2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, parserErrorElem;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {}

	parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
	if ( !xml || parserErrorElem ) {
		jQuery.error( "Invalid XML: " + (
			parserErrorElem ?
				jQuery.map( parserErrorElem.childNodes, function( el ) {
					return el.textContent;
				} ).join( "\n" ) :
				data
		) );
	}
	return xml;
};


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (trac-9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (trac-9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (trac-6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} ).filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} ).map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// trac-7653, trac-8125, trac-8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (trac-10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );

originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes trac-9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (trac-10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket trac-12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (trac-15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// trac-9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script but not if jsonp
			if ( !isSuccess &&
				jQuery.inArray( "script", s.dataTypes ) > -1 &&
				jQuery.inArray( "json", s.dataTypes ) < 0 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (trac-11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// trac-1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see trac-8605, trac-14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// trac-14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( {
		padding: "inner" + name,
		content: type,
		"": "outer" + name
	}, function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this
			.on( "mouseenter", fnOver )
			.on( "mouseleave", fnOut || fnOver );
	}
} );

jQuery.each(
	( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	}
);




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
// Require that the "whitespace run" starts from a non-whitespace
// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "$1" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (trac-7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (trac-13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

},{}]},{},[5]);
