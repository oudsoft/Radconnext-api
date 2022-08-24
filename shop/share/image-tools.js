/* image-tools.js */
(function($) {
  $.fn.imagecrop = function( options ) {
    var settings = $.extend({
      cropWidth: 200,
      cropHeight: 200,
      scale: 1.0,
      uploadUrl: '/api/shop/upload/share'
    }, options );

    const $this = this;
    const waterMarkText = 'Double Click';
    const waterMarkFontSize = 54;
    const waterMarkFontColor = 'white';
    const videoConstraints = {video: {displaySurface: "application", height: 1080, width: 1920 }};

    let imgSrcFullSizeWidth = 0;
    let imgSrcFullSizeHeight = 0;

    const genUniqueID = function () {
  		function s4() {
  			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  		}
  		return s4() + s4() + s4();
  	}

    const base64ToBlob = function (base64, mime) {
    	mime = mime || '';
    	var sliceSize = 1024;
    	var byteChars = window.atob(base64);
    	var byteArrays = [];
    	for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
    		var slice = byteChars.slice(offset, offset + sliceSize);
    		var byteNumbers = new Array(slice.length);
    		for (var i = 0; i < slice.length; i++) {
    			byteNumbers[i] = slice.charCodeAt(i);
    		}
    		var byteArray = new Uint8Array(byteNumbers);
    		byteArrays.push(byteArray);
    	}
    	return new Blob(byteArrays, {type: mime});
    }

    const doOpenFileChooser = function(){
      $('#ImageSrcBox').remove();
      let fileChooser = $('<input type="file" accept="image/png, image/jpeg, image/webp"/>');
      $(fileChooser).css({'display': 'none'});
      settings.scale = 1.0;
      $(fileChooser).on('change', (evt)=> {
        let selectedFiles = evt.currentTarget.files;
        let fileURL = window.URL.createObjectURL(selectedFiles[0]);
        doCreateImageTools(fileURL);
      });
      $(fileChooser).click();
    }

    const doCreateImageTools = function(fileURL){
      $('#CropBox').remove();
      $('#CropCanvas').remove();
      let cropCanvas = $('<canvas id="CropCanvas"></canvas>').css({'display': 'none'});
      $this.append($(cropCanvas));
      let imageSrcBox = $('<div id="ImageSrcBox"></div>');
      let imageSrc = doCreateSourceImage(fileURL);
      $(imageSrc).css({'position': 'relative', 'cursor': 'crosshair', 'transform': 'scale('+ settings.scale + ')'});
      $(imageSrc).on('click', (evt)=>{
        let pos = $('#LayoutBox').offset();
        let x = undefined;
        let y = undefined;
        if (settings.scale == 1.0) {
          x = (pos.left - imageSrc.offsetLeft);
          y = (pos.top - imageSrc.offsetTop);
        } else{
          x = (pos.left - imageSrc.offsetLeft) * (imgSrcFullSizeWidth/imageSrc.width);
          y = (pos.top - imageSrc.offsetTop) * (imgSrcFullSizeHeight/imageSrc.height);
        }

        let cropCanvas = document.getElementById('CropCanvas');

        cropCanvas.width = settings.cropWidth;
        cropCanvas.height = settings.cropHeight;

        let ctx = cropCanvas.getContext('2d');
        ctx.drawImage(imageSrc, x, y, settings.cropWidth, settings.cropHeight, 0, 0, settings.cropWidth, settings.cropHeight);
        let dataURL = cropCanvas.toDataURL("image/png", 0.9);
        let cropImage = doCreateCropImage(dataURL);

        let stampTextCmd = $('<input type="button" value="Stamp"/>');
        $(stampTextCmd).on('click', (evt)=>{
          evt.stopPropagation();
          let tempCanvas = document.createElement('canvas');
          tempCanvas.width = cropImage.width;
          tempCanvas.height = cropImage.height;
          let tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(cropImage, 0, 0);
          //let size = tempCtx.measureText(waterMarkText);
          let tx = settings.cropWidth - 4;
          let ty = settings.cropHeight - 4;
          tempCtx.font = waterMarkFontSize + 'px EkkamaiStandard';
          //tempCtx.globalAlpha = .50;
          tempCtx.fillStyle = waterMarkFontColor;
          tempCtx.translate(tx, ty);
          tempCtx.rotate(-Math.PI / 2);
          tempCtx.translate(-tx, -ty);
          tempCtx.fillText(waterMarkText, tx, ty);
          let tempDataURL = tempCanvas.toDataURL("image/png", 0.9);
          let tempCropImage = doCreateCropImage(tempDataURL);
          $(cropImage).remove();
          $(cropImageBox).append($(tempCropImage));
          dataURL = tempDataURL;
        });
        let editImageCmd = $('<input type="button" value="Edit"/>').css({'margin-left': '10px'})
        $(editImageCmd).on('click', (evt)=>{
          evt.stopPropagation();
          let w = settings.cropWidth;
          let h = settings.cropHeight;
          var editorbox = $('<div id="EditorBox"></div>');
          $(editorbox).css({ 'position': 'absolute', 'width': '80%', 'min-height': '650px', 'background-color': '#fefefe', 'padding': '5px', 'border': '2px solid #888', 'z-index': '55', 'text-align': 'center', 'margin-left': '10%'});
          $(editorbox).css({ 'font-family': 'EkkamaiStandard', 'font-size': '18px'});
          $('body').append($(editorbox).css({'top': '10px'}));
          let pluginOption = {
            canvas: cropCanvas,
            cWidth: w,
            cHeight: h,
            imageInit: dataURL,
            uploadApiUrl: settings.uploadUrl
          };

          const myEditor = $(editorbox).imageeditor(pluginOption);
          $(editorbox).resizable({
            containment: 'parent',
            stop: function(evt) {
              $(this).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
            }
          });
          $('body').css({'min-height': '1250px'});
        });

        let downloadCropImageCmd = $('<input type="button" value="Download"/>').css({'margin-left': '10px'});
        $(downloadCropImageCmd).on('click', (evt)=>{
          evt.stopPropagation();
          let localFilename = JSON.parse(localStorage.getItem('lastFilename'));
          let lastFilename = undefined;
          if (!localFilename) {
            lastFilename = 'download-01';
          } else {
            lastFilename = localFilename.name;
          }
          let fileName = prompt("ชื่อไฟล์", lastFilename);
          if (fileName !== '') {
            localStorage.setItem('lastFilename', JSON.stringify({name: fileName}));
            let tempLink = document.createElement('a');
            let downloadFileName = fileName + '.png';
            tempLink.download = downloadFileName;
            tempLink.href = dataURL;
            tempLink.click();
          }
        });
        let uploadCropImageCmd = $('<input type="button" value="Upload"/>').css({'margin-left': '10px'});
        $(uploadCropImageCmd).on('click', (evt)=>{
          evt.stopPropagation();
          var base64ImageContent = dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
          var blob = base64ToBlob(base64ImageContent, 'image/png');
          var formData = new FormData();
          formData.append('picture', blob);
          $.ajax({
            url: settings.uploadUrl,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formData}).done(function(data){
              console.log(data);
              window.open(data.shareLink, '_blank');
            }
          );
        });
        let removeCmd = $('<input type="button" value="Remove"/>').css({'margin-left': '10px'});
        $(removeCmd).on('click', (evt)=>{
          evt.stopPropagation();
          $(cropBox).remove();
        });
        let cropImageBox = $('<div></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'center', 'border': '2px solid green'});
        let cropImageCmdBox = $('<div></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'right'});

        $(cropImageCmdBox).append($(stampTextCmd)).append($(editImageCmd)).append($(downloadCropImageCmd)).append($(uploadCropImageCmd)).append($(removeCmd));
        $(cropImageBox).append($(cropImageCmdBox)).append($(cropImage));
        let cropBox = $('<div id="CropBox"></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'left'});
        $(cropBox).append($(cropImageBox));
        $this.append($(cropBox));
        $(imageSrc).slideUp('slow');
        $(cropBox).on('click', (evt)=>{
          if ($(imageSrc).css('display') === 'none') {
            $(imageSrc).slideDown('slow');
          } else {
            $(imageSrc).slideUp('slow');
          }
        })
      });
      let layoutBox = doCreateLayoutBox();
      $(imageSrcBox).append($(imageSrc)).append($(layoutBox));
      //$this.append($(imageSrcBox));
      $('body').append($(imageSrcBox));
      $('body').css({'width': '100%', 'heigth': '100%'});
      return $(imageSrcBox);
    }

    const doCreateSourceImage = function(imageUrl) {
      let srcImg = new Image();
      srcImg.id = 'ImageSrc'
      srcImg.src = imageUrl;
      srcImg.onload = function(x) {
        imgSrcFullSizeWidth = srcImg.width;
        imgSrcFullSizeHeight = srcImg.height;
        console.log('loaded!!');
        $('body').css({'width': imgSrcFullSizeWidth + 'px', 'heigth': imgSrcFullSizeHeight + 'px'});
      }
      return srcImg;
    }

    const doCreateCropImage = function(imageUrl) {
      let cropImg = new Image();
      cropImg.id = 'CropImg';
      cropImg.src = imageUrl;
      cropImg.onload = function() {
        console.log('success!!');
      }
      return cropImg;
    }

    const doCreateWHInputBox = function(inputCallback, zoomCallback){
      let whInputBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'top': '-15px'});;
      let wInput = $('<input type="number" id="WInput"/>').val(settings.cropWidth).css({'position': 'relative', 'display': 'inline-block', 'width': '60px', 'margin-left': '10px'});
      let hInput = $('<input type="number" id="HInput"/>').val(settings.cropHeight).css({'position': 'relative', 'display': 'inline-block', 'width': '60px', 'margin-left': '10px'});
      let applyCmd = $('<input type="button" value="Apply" id="ApplyCmd"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
      $(applyCmd).on('click', (evt)=>{
        let w = $(wInput).val();
        let h = $(hInput).val();
        inputCallback(evt, w, h);
      });
      let wLabel = $('<span>X:</span>').css({'display': 'inline-block', 'width': '20px', 'margin-left': '10px'});
      let hLabel = $('<span>Y:</span>').css({'display': 'inline-block', 'width': '20px', 'margin-left': '10px'});
      let zoomInCmd = $('<input type="button" value="Zoom-In"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
      $(zoomInCmd).on('click', (evt)=>{
        let curValue = Number(settings.scale);
        settings.scale = curValue - 0.05;
        zoomCallback(settings.scale);
      });
      let zoomValue = $('<span id="ZoomValue"></span>').text((settings.scale * 100).toFixed(2) + '%').css({'display': 'inline-block', 'width': '60px', 'margin-left': '10px'});
      let zoomOutCmd = $('<input type="button" value="Zoom-Out"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
      $(zoomOutCmd).on('click', (evt)=>{
        let curValue = Number(settings.scale);
        settings.scale = curValue + 0.05;
        zoomCallback(settings.scale);
      });
      let zoomResetCmd = $('<input type="button" value="Reset" id="ZoomResetCmd"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
      $(zoomResetCmd).on('click', (evt)=>{
        settings.scale = 1.0;
        zoomCallback(settings.scale);
      });
      $(wInput).on('keypress',function(evt) {
        if(evt.which == 13) {
          $(applyCmd).click();
        }
      });
      $(hInput).on('keypress',function(evt) {
        if(evt.which == 13) {
          $(applyCmd).click();
        }
      });
      $(whInputBox).append($(wLabel)).append($(wInput)).append($(hLabel)).append($(hInput)).append($(applyCmd));
      return $(whInputBox).append($(zoomInCmd)).append($(zoomValue)).append($(zoomOutCmd)).append($(zoomResetCmd));
    }

    const doCreateLayoutBox = function(){
      let layoutBox = $('<div id="LayoutBox"></div>').css({'position': 'absolute', 'border': '1px dashed red', 'background-color': 'rgba(255, 0, 0, 0.3)', 'top': '60px', 'left': '0px'});
      $(layoutBox).css({'width': (settings.cropWidth * settings.scale) + 'px', 'height': (settings.cropHeight * settings.scale) + 'px'});
      $(layoutBox).draggable({containment: 'parent'});
      $(layoutBox).resizable({
        containment: 'body',
        stop: function(evt){
          let w = evt.target.clientWidth;
          let h = evt.target.clientHeight;
          settings.cropWidth = w / settings.scale;
          settings.cropHeight = h / settings.scale;
          $('#WInput').val(settings.cropWidth);
          $('#HInput').val(settings.cropHeight);
        }
      });
      return $(layoutBox);
    }

    const doCreateCaptureCmd = function(){
      let hsIcon = new Image();
      hsIcon.src = '/images/screen-capture-icon.png';
      $(hsIcon).css({'position': 'relative', "width": '40px', "height": 'auto', "cursor": 'pointer', "padding": '2px', 'top': '24px', 'margin-left': '20px'});
      $(hsIcon).css({'border': '4px solid #ddd', 'border-radius': '5px', 'margin': '4px'});
      $(hsIcon).prop('data-toggle', 'tooltip');
      $(hsIcon).prop('title', 'Capture Sreen');
      $(hsIcon).hover(()=>{
        $(hsIcon).css({'border': '4px solid grey'});
      },()=>{
        $(hsIcon).css({'border': '4px solid #ddd'});
      });
      $(hsIcon).on("click", function(evt){
        onCaptureClick(evt);
  		});
      return $(hsIcon);
    }

    const onCaptureClick = async function(evt) {
      await openDisplayMedia(invokeGetDisplayMedia, doGetScreenSignalError);
    }

    const openDisplayMedia = function(successCallback, errorCallback){
      return new Promise(function(resolve, reject) {
        if(navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia(videoConstraints).then(successCallback).catch(errorCallback);
        } else {
          navigator.getDisplayMedia(videoConstraints).then(successCallback).catch(errorCallback);
        }
        resolve();
      });
    }

    const doGetScreenSignalError = function(evt) {
      var error = {
    		name: evt.name || 'UnKnown',
    		message: evt.message || 'UnKnown',
    		stack: evt.stack || 'UnKnown'
    	};
    	if(error.name === 'PermissionDeniedError') {
    		if(location.protocol !== 'https:') {
    			error.message = 'Please use HTTPs.';
    			error.stack   = 'HTTPs is required.';
    		}
    	}
    	console.error(error.name);
    	console.error(error.message);
    	console.error(error.stack);
    }

    const invokeGetDisplayMedia = function(stream){
      $('#ImageSrcBox').remove();
      $("body").append($('<video id="CaptureVideo" width="520" height="290" autoplay/>'));
      $("body").append($('<canvas id="CaptureCanvas" width="100%" height="auto"/>'));
  		let canvas = document.getElementById('CaptureCanvas');
  		let video = document.getElementById('CaptureVideo');
  		let ctx =  canvas.getContext('2d');
  		let vw, vh;
      video.srcObject = stream;

      video.addEventListener( "loadedmetadata", function (evt) {
        vw = this.videoWidth;
        vh = this.videoHeight;
        video.width = vw;
        video.height = vh;

        ctx.canvas.width = vw;
        ctx.canvas.height = vh;

        imgSrcFullSizeWidth = vw;
        imgSrcFullSizeHeight = vh;

        $('#WInput').val(400);
        $('#HInput').val(600);
        $('#ApplyCmd').click();

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var dataURL = canvas.toDataURL("image/png", 1.0);

        doCreateImageTools(dataURL);
        $('#ZoomResetCmd').click();
        if (video.srcObject){
    			video.srcObject.getTracks().forEach(function(track) {
    				track.stop();
    			});
    			video.srcObject = null;
          $('#CaptureVideo').remove();
    		}

        $('#CaptureCanvas').remove();

      }, false);
    }

    const init = function() {
      let fileChooserCmd = $('<img data-toggle="tooltip" title="Open"/>');
      $(fileChooserCmd).attr('src', '/images/open-file-icon.png');
      $(fileChooserCmd).css({'position': 'relative', 'width': '40px', 'height': 'auto', 'cursor': 'pointer', 'padding': '4px', 'top': '10px', 'margin-left': '10px'});
      $(fileChooserCmd).on('click', (evt)=>{
        doOpenFileChooser(evt);
      });
      let cropInputBox = doCreateWHInputBox((evt, w, h)=>{
        settings.cropWidth = Number(w);
        settings.cropHeight = Number(h);
        console.log(settings);
        $('#LayoutBox').width(settings.cropWidth * settings.scale);
        $('#LayoutBox').height(settings.cropHeight * settings.scale);
      }, (scale)=>{
        let newW = (imgSrcFullSizeWidth * scale) + 'px';
        $('#ImageSrc').css({'width': '' + newW + '', 'height': 'auto'});
        $('#ImageSrc').parent().css({'border': '1px solid red'});
        $('#ZoomValue').text((settings.scale * 100).toFixed(2) + '%');

        let pos = $('#LayoutBox').offset();
        //console.log(pos);

        let newPos = {top: (pos.top * scale), left: (pos.left * scale)};

        $('#LayoutBox').width(settings.cropWidth * scale);
        $('#LayoutBox').height(settings.cropHeight * scale);
        $('#LayoutBox').offset(newPos);
      });
      let captureScreenCmd = doCreateCaptureCmd();
      $(cropInputBox).prepend($(fileChooserCmd).css({'display': 'inline-block'}));
      $(cropInputBox).append($(captureScreenCmd).css({'display': 'inline-block'}));
      $this.append($(cropInputBox));
    }

    init();

    var output = {
      settings: settings,
      handle: this,
      doCreateImageTools: doCreateImageTools
    }

    return output;

  };

})(jQuery);
/*
(()=>{

  const cropImageBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'border': '2px solid grey', 'background-color': '#ddd', 'text-align': 'left'});

  const cropOption = {cropWidth: 400, cropHeight: 750};
  const myCropImageBox = $(cropImageBox).imagecrop(cropOption);

  $('body').append($(cropImageBox));

  return myCropImageBox;

})();
*/
