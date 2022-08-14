/* player-tools.js */

const pBoxStyle = {'position': 'absolute', 'width': '45%', 'height': 'fit-content', 'background-color': '#fefefe', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '2px'};

const pBoxOnKeyDownEvt = function(evt, handle) {
	console.log(handle);
	//console.log(evt.keyCode);
	//console.log(evt.which);
	switch (evt.keyCode) {
		case 39:
			/* Arrow Right */
			handle.next();
		break;
		case 37:
			/* Arrow Left */
			handle.prev();
		break;
		case 38:
			/* Arrow Up */
			handle.settings.imgSize += 10;
			$(handle.player).find('video').css({'width': handle.settings.imgSize});
			$(handle.player).find('#ImagePreview').css({'width': handle.settings.imgSize});
		break;
		case 40:
			/* Arrow Down */
			handle.settings.imgSize -= 10;
			$(handle.player).find('video').css({'width': handle.settings.imgSize});
			$(handle.player).find('#ImagePreview').css({'width': handle.settings.imgSize});
		break;
	}
}

$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/fabric.js"></script>');
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
	//$('head').append('<script type="text/javascript" src="/shop/lib/player.js?ty=6451k10"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/shop/lib/player.js?ty=6451k10"></script>');
	//$('head').append('<script type="text/javascript" src="/shop/lib/imageeditor.js?tt=mo9i456f"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/shop/lib/imageeditor.js?tt=mo9i456f"></script>');
	setTimeout(()=>{
		myPBox = $('<div id="PBox" tabindex="1"></div>');
		$(myPBox).css(pBoxStyle);
		myPlayerHandle = $(myPBox).player({timeDelay: 7, ggFontColor: 'red', imgSize: 330, iconRootPath: 'https://radconnext.tech/'});

		$(myPBox).draggable({containment: "parent"});
		$(myPBox).resizable({containment: 'parent',
			stop: function(evt) {
				$(myPBox).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
			}
		});
		$(myPBox).on('click', (evt)=>{
			$(myPBox).focus();
		});
		$(myPBox).on('keydown', (evt)=>{
			pBoxOnKeyDownEvt(evt, myPlayerHandle);
		});

		$('body').append($(myPBox));
		$(myPBox).focus();
		$('body').css({'width': '100%', 'heigth': '100%'});
	}, 500);
}, 500);

/*
let myPBox2 = $('<div id="PBox" tabindex="2"></div>');
$(myPBox2).css(pBoxStyle);
let myPlayerHandle2 = $(myPBox2).player({timeDelay: 7, ggFontColor: 'red', imgSize: 330, iconRootPath: 'https://radconnext.tech/', backgroundColor: 'grey'});

$(myPBox2).draggable({containment: "parent"});
$(myPBox2).resizable({containment: 'parent',
	stop: function(evt) {
		$(myPBox2).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
	}
});
$(myPBox2).on('click', (evt)=>{
	$(myPBox2).focus();
});
$(myPBox2).on('keydown', (evt)=>{
	pBoxOnKeyDownEvt(evt, myPlayerHandle2);
});

$('body').append($(myPBox2));
$(myPBox2).find('#PlayerBox').css({'backgroud-color': 'grey'});
$(myPBox2).focus();
*/

/*
$.getScript( "/shop/share/player-tools.js", function( code, textStatus, jqxhr ) {
	//let execResult = eval(code);
});

*/

/*
(function() {
	var po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = true;
	po.src = /shop/lib/jquery.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);
})();
*/
