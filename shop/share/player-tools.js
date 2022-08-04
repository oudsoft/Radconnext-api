/* player-tools.js */
//let domainNameUrl = 'https://' + window.location.hostname;
//let domainNameUrl = 'https://localhost:4443'
//console.log(domainNameUrl);
//$('head').append('<script src="' + domainNameUrl + '/lib/jquery.js"></script>');
$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/fabric.js"></script>');
setTimeout(()=>{
	$('head').append('<link href="https://radconnext.tech/lib/tui-image-editor.min.css" rel="stylesheet">');
	$('head').append('<link href="https://radconnext.tech/lib/tui-color-picker.css" rel="stylesheet">');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-code-snippet.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-color-picker.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/tui-image-editor.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/lib/simpleUpload.min.js"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/setting/plugin/jqury-readystate-plugin.js"></script>');

	$('head').append('<script src="https://radconnext.tech/lib/RecordRTC.min.js"></script>');

	$('head').append('<link rel="stylesheet" href="https://radconnext.tech/stylesheets/style.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="https://radconnext.tech/case/css/scanpart.css" type="text/css" />');
	$('head').append('<script src="https://radconnext.tech/shop/lib/player.js?ty=67x1k10"></script>');
	$('head').append('<script type="text/javascript" src="https://radconnext.tech/shop/lib/imageeditor.js?tt=mo9i456f"></script>');
	setTimeout(()=>{
		let myPBox = $('<div id="PBox" tabindex="1"></div>');
		$(myPBox).css({'position': 'absolute', 'width': '45%', 'min-height': '50px;', 'max-height': '50px', 'background-color': '#fefefe', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '100px'});
		let myPlayerHandle = $(myPBox).player({timeDelay: 7, ggFontColor: 'red', imgSize: 330});
		$('body').append($(myPBox));

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
	}, 500);
}, 1500);
