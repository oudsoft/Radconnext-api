//*editor-tools.js */
const doOpenEditor = function(fileURL){
  let w = 470;
  let h = 720;
  var editorbox = $('<div id="EditorBox"></div>');
  $(editorbox).css({ 'position': 'absolute', 'width': '60%', 'background-color': '#fefefe', 'padding': '5px', 'border': '2px solid #888', 'z-index': '55', 'text-align': 'center', 'top': '4px;'});
  $(editorbox).css({ 'font-family': 'EkkamaiStandard', 'font-size': '18px'});
  $('body').append($(editorbox));
  let previewPopup = $('<div id="PopupPreview"></div>');
  $(previewPopup).css({ 'position': 'absolute', 'z-index': '559', 'text-align': 'center', 'top': '4px'});
  $('body').append($(previewPopup));

  $(editorbox).append($('<canvas id="CaptureCanvas" width="100%" height="auto" style="position: relative; margin-top: 4px;"/>'));

  let canvas = document.getElementById('CaptureCanvas');
  let ctx =  canvas.getContext('2d');
  ctx.canvas.width = w;
  ctx.canvas.height = h;

  let pluginOption = {
    canvas: canvas,
    cWidth: w,
    cHeight: h,
    imageInit: fileURL,
    uploadApiUrl: '/api/shop/upload/share'
  };

  const myEditor = $(editorbox).imageeditor(pluginOption);
  $(editorbox).resizable({
    containment: 'parent',
    stop: function(evt) {
      $(this).css({'width': evt.target.clientWidth, 'height': evt.target.clientHeight});
    }
  });

  $(editorbox).draggable({
    containment: "parent",
    stop: function(evt) {
      $(this).css({'min-height': '60px'});
    }
  });
}
