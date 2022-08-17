/* image-tools.js */
(function($) {
  $.fn.imagecrop = function( options ) {
    var settings = $.extend({
      cropWidth: 200,
      cropHeight: 200,
      scale: 1.0
    }, options );

    const $this = this;

    let imgSrcFullSizeWidth = 0;
    let imgSrcFullSizeHeight = 0;

    const genUniqueID = function () {
  		function s4() {
  			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  		}
  		return s4() + s4() + s4();
  	}

    const doOpenFileChooser = function(){
      $('#ImageSrcBox').remove();
      let fileChooser = $('<input type="file" accept="image/png, image/jpeg, image/webp"/>');
      $(fileChooser).css({'display': 'none'});
      settings.scale = 1.0;
      let imageSrcBox = $('<div id="ImageSrcBox"></div>');
      $(fileChooser).on('change', (evt)=> {
        let selectedFiles = evt.currentTarget.files;
        let fileURL = window.URL.createObjectURL(selectedFiles[0]);
        let imageSrc = doCreateSourceImage(fileURL);
        $(imageSrc).css({'position': 'relative', 'cursor': 'crosshair', 'transform': 'scale('+ settings.scale + ')'});
        $(imageSrc).on('click', (evt)=>{
          $('#CropBox').remove();
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
          let fileCode = genUniqueID();
          let downloadCropImageCmd = $('<input type="button" value="Download"/>');
          $(downloadCropImageCmd).on('click', (evt)=>{
            let tempLink = document.createElement('a');
            let fileName = fileCode + '.png';
            tempLink.download = fileName;
            tempLink.href = dataURL;
            tempLink.click();
          });
          let uploadCropImageCmd = $('<input type="button" value="Upload"/>').css({'margin-left': '10px'});
          $(uploadCropImageCmd).on('click', (evt)=>{

          });
          let removeCmd = $('<input type="button" value="Remove"/>').css({'margin-left': '10px'});
          $(removeCmd).on('click', (evt)=>{
            $(cropBox).remove();
          });
          let cropImageBox = $('<div></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'center', 'border': '2px solid green'});
          let cropImageCmdBox = $('<div></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'center'});
          $(cropImageBox).append($(cropImage));
          $(cropImageCmdBox).append($(downloadCropImageCmd)).append($(uploadCropImageCmd)).append($(removeCmd));
          let cropBox = $('<div id="CropBox"></div>').css({'width': '100%', 'height': 'auto', 'text-align': 'left'});
          $(cropBox).append($(cropImageBox)).append($(cropImageCmdBox));
          $this.append($(cropBox));
        });

        let layoutBox = doCreateLayoutBox();

        $(imageSrcBox).append($(imageSrc)).append($(layoutBox));
        $this.append($(imageSrcBox));
        $('body').css({'width': '100%', 'heigth': '100%'});
      });
      $(fileChooser).click();
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
      let applyCmd = $('<input type="button" value="Apply"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
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
      let zoomResetCmd = $('<input type="button" value="Reset"/>').css({'position': 'relative', 'display': 'inline-block', 'width': '100px', 'margin-left': '10px'});
      $(zoomResetCmd).on('click', (evt)=>{
        settings.scale = 1.0;
        zoomCallback(settings.scale);
      });
      $(whInputBox).append($(wLabel)).append($(wInput)).append($(hLabel)).append($(hInput)).append($(applyCmd));
      return $(whInputBox).append($(zoomInCmd)).append($(zoomValue)).append($(zoomOutCmd)).append($(zoomResetCmd));
    }

    const doCreateLayoutBox = function(){
      let layoutBox = $('<div id="LayoutBox"></div>').css({'position': 'absolute', 'border': '1px dashed red', 'background-color': 'rgba(255, 0, 0, 0.3)', 'top': '60px', 'left': '0px'});
      $(layoutBox).css({'width': (settings.cropWidth * settings.scale) + 'px', 'height': (settings.cropHeight * settings.scale) + 'px'});
      $(layoutBox).draggable({containment: 'body'});
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
      $(cropInputBox).prepend($(fileChooserCmd).css({'display': 'inline-block'}));
      $this.append($(cropInputBox));
      let cropCanvas = $('<canvas id="CropCanvas"></canvas>').css({'display': 'none'});
      $this.append($(cropCanvas));
    }

    init();

    var output = {
      settings: settings,
      handle: this,
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
