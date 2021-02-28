const urlQueryToObject = function(url) {
  let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
    return paramPair.split(/=(.+)?/).slice(0, 2);
  }).reduce(function (obj, pairArray) {
    obj[pairArray[0]] = pairArray[1];
    return obj;
  }, {});
  return result;
}

const inputStyleClass = {"font-family": "THSarabunNew", "font-size": "24px"};

const doCallApi = function (apiurl, params) {
 var dfd = $.Deferred();
  $.post(apiurl, params, function(data){
    dfd.resolve(data);
  }).fail(function(error) {
    dfd.reject(error);
  });
  return dfd.promise();
}

function isIE () {
  var myUA = navigator.userAgent.toLowerCase();
  return (myUA.indexOf('msie') != -1) ? parseInt(myUA.split('msie')[1]) : false;
}

const browser = function() {
  const test = function(regexp) {return regexp.test(window.navigator.userAgent)}
  switch (true) {
    case test(/edg/i): return "Microsoft Edge";
    case test(/trident/i): return "Microsoft Internet Explorer";
    case test(/firefox|fxios/i): return "Mozilla Firefox";
    case test(/opr\//i): return "Opera";
    case test(/ucbrowser/i): return "UC Browser";
    case test(/samsungbrowser/i): return "Samsung Browser";
    case test(/chrome|chromium|crios/i): return "Google Chrome";
    case test(/safari/i): return "Apple Safari";
    default: return "Other";
  }
}

const browserSupport = function(ua){
  if ((ua === 'Google Chrome') || (ua === 'Microsoft Edge') || (ua === 'Mozilla Firefox')) {
    return true;
  } else if (ua === 'Microsoft Internet Explorer') {
    if (isIE() >= 11) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

const initPage = function() {
  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));
  $('body').loading({overlay: $("#overlay"), stoppable: true});

  let queryObj = urlQueryToObject(window.location.href);
  if (queryObj.caseId) {
    $('body').loading('start');

    let ua = browser();
    let canSupport = browserSupport(ua);
    if (canSupport) {
      let yourToken = localStorage.getItem('token');
      if (yourToken) {
        //chat room
      } else {
        //login
      }
    } else {
      alert('เว็บบราวส์เซอร์ของคุณไม่รองรับการติดต่อรังสีแพทย์ผ่านทางการส่งข้อความ\nโปรดใชเว็บบราวส์เซอร์ที่สนับสนุน ดังนี้\nGoogle Chrome, MS Edge, Firefox หรือ IE เวอร์ชั่น 11 ขึ้นไป');
    }

    /*
    1. check caseId
    2. check UA
    3. check Token
    */
    $('body').loading('stop');
  } else {
    let yourCaseId = prompt('โปรดระบุรหัสเคส\nรหัสเคสจะปรากฎอยู่ด้านล่างรายงานผลอ่าน', '');
		if (yourCaseId){


      $('body').loading('stop');
    } else {
      alert('Sorry.');
      $('body').loading('stop');
    }
  }
}

$(document).ready(function() {
	initPage();
});
