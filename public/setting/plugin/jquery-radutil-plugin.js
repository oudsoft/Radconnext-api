/*jquery-radutil-plugin.js*/
(function ( $ ) {

	const overlayStyle = { 'position': 'fixed', 'z-index': '13', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto', 'background-color': 'rgb(0,0,0)', 'background-color': 'rgba(0,0,0,0.4)'};
	const contentStyle = { 'background-color': '#fefefe', 'margin': '15% auto', 'padding': '10px', 'border': '1px solid #888', /*'min-width': '420px', 'max-width': '820px', */ 'font-family': 'THSarabunNew', 'font-size': '24px', 'line-height': '26px'};
  const cmdButtonStyle = {'padding': '3px', 'cursor': 'pointer', 'border': '1px solid white', 'color': 'white', 'background-color': 'blue'};

  const figgerIcon = $('<img src="/images/figger-right-icon.png" width="30px" height="auto"/>');

  $.fn.radalert = function( options ) {

    var settings = $.extend({
      title: '',
      msg: '',
      width: '520px',
      height: 'auto'
    }, options );

    var $this = this;
    var alertBox = undefined;
    var overlay = undefined;
    var okCmd = undefined;
    var cancelCmd = undefined;

    const doCreateOverlay = function(){
      overlay = $('<div></div>');
      $(overlay).css(overlayStyle);
      return $(overlay);
    }

    const doCreateTitleBar = function(){
      let titleBar = $('<div style="position: relative; background-color: #02069B; color: white; border: 2px solid grey; min-height: 28px;"></div>');
      let titleTextBox = $('<span style="display: inline-block; margin-left: 8px;"></span>');
      $(titleTextBox).append(settings.title);
      $(figgerIcon).css({'margin-top': '5px'})
      return $(titleBar).append($(figgerIcon)).append($(titleTextBox));
    }

    const doCreateMsgView = function(msg){
      let msgView = $('<div></div>');
      if (msg.jquery){
        $(msgView).append($(msg));
      } else {
        $(msgView).html(msg);
      }
      return $(msgView);
    }

    const doCreateCmdView = function(){
      let cmdBar = $('<div style="position: relative; width: 100%; padding: 4px; text-align: center;"></div>');
      okCmd = $('<input type="button" value=" ตกลง "/>');
      cancelCmd = $('<input type="button" value=" ยกเลิก "/>');
      $(okCmd).css({'background-color': 'green', 'color': 'white'});
      $(cancelCmd).css({'background-color': 'red', 'color': 'white'});
      $(okCmd).on('click', function(evt){
        settings.onOk(evt);
        //doCloseAlert();
      });
      $(cancelCmd).on('click', function(evt){
        settings.onCancel(evt);
        doCloseAlert();
      });
      return $(cmdBar).append($(okCmd)).append($('<span>  </span>')).append($(cancelCmd));
    }

    const doCreateAlertBox = function(msg){
      alertBox = $('<div></div>');
      $(alertBox).css(contentStyle);
      $(alertBox).css({width: settings.width, height: settings.heigth});
      let titleBox = doCreateTitleBar();
      alertBox.append($(titleBox));
      let msgBox = doCreateMsgView(msg);
      alertBox.append($(msgBox));
      alertBox.append($('<hr/>'));
      let cmdBox = doCreateCmdView();
      alertBox.append($(cmdBox));
      return $(alertBox);
    }

    const init = function() {
      let coverPage = doCreateOverlay();
      let msgBox = doCreateAlertBox(settings.msg);
      $(coverPage).append($(msgBox));
      return $(coverPage);
    }

    const doCloseAlert = function(){
      if (overlay) {
        $(overlay).remove();
      }
    }

    let radalert = init();
    this.append($(radalert));

    /*
    input options
    {
      title,
      msg,
      onOk,
      onCancel
    }
    */
    /* public method of plugin */
    let output = {
      overlay: overlay,
      alertBox: alertBox,
      okCmd: okCmd,
      cancelCmd: cancelCmd,
      settings: settings,
      closeAlert: doCloseAlert
    }

    return output;
  }

}( jQuery ));
