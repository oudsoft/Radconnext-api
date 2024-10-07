/* player-tools.js */

const pBoxStyle = {'position': 'absolute', 'width': '32%', 'height': '50px', 'background-color': '#fefefe', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '2px'};

$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/fabric.js"></script>');
$('head').append('<link rel="stylesheet" href="https://radconnext.tech/lib/jquery-ui.min.css" type="text/css" />');
$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/jquery-ui.min.js"></script>');
setTimeout(()=>{
	$('head').append('<link href="https://radconnext.tech/lib/tui-image-editor.min.css" rel="stylesheet">');
	$('head').append('<link href="https://radconnext.tech/lib/tui-color-picker.css" rel="stylesheet">');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-code-snippet.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-color-picker.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-image-editor.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/simpleUpload.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/setting/plugin/jqury-readystate-plugin.js"></script>');
	$('head').append('<link rel="stylesheet" href="https://radconnext.tech/stylesheets/style.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="https://radconnext.tech/case/css/scanpart.css" type="text/css" />');

	$('head').append('<script type="text/javascript" src="https://radconnext.tech/shop/lib/player.js?ty=kim"></script>');
	//$('head').append('<script type="text/javascript" src="../lib/player.js?ty=kim"></script>');

	$('head').append('<script type="text/javascript" src="https://radconnext.tech/shop/lib/imageeditor.js?tt=mo9i456f"></script>');
	setTimeout(()=>{
		let myPBox = $('<div id="PBox" tabindex="1"></div>');
		$(myPBox).css(pBoxStyle);
		myPlayerHandle = $(myPBox).player({timeDelay: 7, ggFontColor: 'red', imgSize: 330, iconRootPath: 'https://radconnext.tech/', backgroundColor: 'grey'});

		$(myPBox).draggable({containment: 'parent'});
		$(myPBox).resizable({containment: 'parent',
			stop: function(evt) {
				evt.stopPropagation();
				$(this).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
			}
		});
		$(myPBox).on('click', (evt)=>{
			evt.stopPropagation();
			$(myPBox).focus();
			//$(this).focus();
		});
		$('body').append($(myPBox));
		$(myPBox).focus();
		$('body').css({'width': '100%', 'heigth': '100%'});

		setTimeout(()=>{
			//$("#FileSrcListBox").resizable(/*{minHeight: 100, minWidth: 200}*/);
			//$("#FileSourceList").resizable(/*{minHeight: 100,	minWidth: 200}*/);
			$(myPBox.fileList).resizable();
			$(myPBox.fileSrc).resizable();
		}, 1000);
	}, 1500);
}, 1500);

/*

//sudo ln -s /home/oudsoft/ggg/doubleclick-001/ /var/www/html/ggg/

http://localhost/ggg/doubleclick-001/doubleclick-263.png

$('body').css({'background-image': 'url("http://localhost/ggg/doubleclick-001/doubleclick-632.png")', 'background-repeat': 'no-repea'});

gsettings get org.gnome.desktop.background picture-uri
gsettings set org.gnome.desktop.background picture-uri file:///home/oudsoft/ggg/doubleclick-001/doubleclick-632.png
*/

/*

let clockCounter = undefined;
let milli = 1000;
let min = 1;
let max = 817;
let imgDomain = 'http://localhost/ggg/doubleclick-001/';
let imgFileName = 'doubleclick-632.png';
let imgURL = imgDomain + imgFileName;
let imgFileNameBox = $('<span></span>').text(imgFileName);
let digitClockBox = $('<span>60</span>');

$('body').css({'background-image': 'url("' + imgURL + '")', 'background-repeat': 'no-repea'});
let labelBox =$('<div id="ImgName"></div>').css({'position': 'relative', 'top':'95%', 'left': '10px'});
$(labelBox).append($(imgFileNameBox)).append($(digitClockBox).css({'margin-left': '10px', 'color': 'white'}));
$('body').append($(labelBox));

const delay = function(t) {
	return new Promise(function(resolve) {
		if (clockCounter) {
			window.clearTimeout(clockCounter);
		}
		clockCounter = setTimeout(function() {
			resolve(clockCounter);
		}, t);
	});
}

const changeBackground = function() {
	let n = Math.floor(Math.random() * (max - min + 1)) + min;
	let imgNo = String(n).padStart(3, '0');
	imgFileName = 'doubleclick-' + imgNo + '.png';
	imgURL = imgDomain + imgFileName;
	$('body').css({'background-image': 'url("' + imgURL + '")', 'background-repeat': 'no-repea'});
	$(imgFileNameBox).text(imgFileName);
}

const clockCount = function(){
	delay(milli).then(()=>{
		let clickMin = $(digitClockBox).text();
		clickMin = Number(clickMin);
		if (clickMin < 1) {
			clickMin = 60;
		} else {
			clickMin = clickMin - 1;
		}
		clickMin = String(clickMin).padStart(2, '0');
		$(digitClockBox).text(clickMin);
		if (clickMin < 10) {
			$(digitClockBox).css({'color': 'red'});
		} else {
			$(digitClockBox).css({'color': 'white'});
		}
		clockCount();
	});
}

const playBackground = function(ms) {
	$(digitClockBox).text('60');
	clockCount();
	let milliSec = ms * milli;
	setTimeout(() =>{
		$(digitClockBox).text('60');
		//clockCount();
		changeBackground();
		playBackground(ms);
	}, milliSec);
}

playBackground(60);

*/

/*
https://radconnext.tech/shop/share/?id=fce4d4f4-35cb
*/

/*
(function() {
	var po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = true;
	po.src = 'https://radconnext.tech/shop/lib/jquery.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);
})();
*/
