//$('head').append('<script src="https://radconnext.info/lib/jquery.js"></script>');
$('head').append('<script src="https://radconnext.info/lib/jquery-ui.min.js"></script>');
$('head').append('<link rel="stylesheet" href="https://radconnext.info/lib/jquery-ui.min.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="https://radconnext.info/stylesheets/style.css" type="text/css" />');
$('head').append('<script type="text/javascript" src="https://radconnext.info/lib/fabric.js"></script>');
setTimeout(()=>{
	$('head').append('<link href="https://radconnext.info/lib/tui-image-editor.min.css" rel="stylesheet">');
	$('head').append('<link href="https://radconnext.info/lib/tui-color-picker.css" rel="stylesheet">');
	$('head').append('<script type="text/javascript" src="https://radconnext.info/lib/tui-code-snippet.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.info/lib/tui-color-picker.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.info/lib/tui-image-editor.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.info/lib/simpleUpload.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.info/setting/plugin/jqury-readystate-plugin.js"></script>');

	$('head').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/RecordRTC/5.5.9/RecordRTC.js"></script>');
	$('head').append('<script src="https://www.webrtc-experiment.com/screenshot.js"></script>');

	$('head').append('<link rel="stylesheet" href="https://radconnext.info/stylesheets/style.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/scanpart.css" type="text/css" />');
	//$('head').append('<script src="https://radconnext.info/lib/player.js?t=jyoky"></script>');
	$('head').append('<script src="https://radconnext.info/lib/player.js?ty=mjxokyh"></script>');

	setTimeout(()=>{
		let myPBox = $('<div id="PBox" tabindex="1"></div>');
		$(myPBox).css({'position': 'absolute', 'width': '50%', 'min-height': '50px;', 'max-height': '50px', 'background-color': '#fefefe', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '100px'});
		let myPlayerHandle = $(myPBox).player({timeDelay: 7, ggFontColor: 'red', imgSize: 330});
		$('body').append($(myPBox));

		$(myPBox).draggable({containment: "body"});
		$(myPBox).resizable({containment: 'body',
			stop: function(evt) {
				$(myPBox).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
			}
		});
		$(myPBox).on('keydown', (evt)=>{
			//console.log(evt.keyCode);
			//console.log(evt.which);
			switch (evt.keyCode) {
				case 39:
					/* Arrow Right */
					myPlayerHandle.next();
				break;
				case 37:
					/* Arrow Left */
					myPlayerHandle.prev();
				break;
				case 38:
					/* Arrow Up */
					myPlayerHandle.settings.imgSize += 10;
					$(myPlayerHandle.player).find('video').css({'width': myPlayerHandle.settings.imgSize});
					$(myPlayerHandle.player).find('#ImagePreview').css({'width': myPlayerHandle.settings.imgSize});
				break;
				case 40:
					/* Arrow Down */
					myPlayerHandle.settings.imgSize -= 10;
					$(myPlayerHandle.player).find('video').css({'width': myPlayerHandle.settings.imgSize});
					$(myPlayerHandle.player).find('#ImagePreview').css({'width': myPlayerHandle.settings.imgSize});
				break;
			}
		});

		$(myPBox).focus();
	}, 1500);
}, 3300);

/*
$.getScript( "https://radconnext.info/js/main.js", function( code, textStatus, jqxhr ) {
	//let execResult = eval(code);
});

*/
