(function ( $ ) {
  $.fn.sipphoneincome = function( options ) {

    let settings = $.extend({
      onRejectCallCallback: undefined,
      onAcceptCallCallback: undefined,
      onEndCallCallback: undefined
    }, options );

    let $this = this;

    let incomeRowHandle = undefined;
    let answerRowHandle = undefined;

    const doGetIncomeRowHandle = function(){
      return $(incomeRowHandle);
    }

    const doGetAnswerRowHandle = function(){
      return $(answerRowHandle)
    }

    const doCreateIncomeCallRow = function(onRejectCallClick, onAcceptCallClick){
      let row = $('<tr></tr>');
      let leftCol = $('<td width="50%" align="center"></td>');
      let rightCol = $('<td width="*" align="center"></td>');
      let rejectCallCmd = $('<input type="button" value=" ไม่รับสาย "/>');
      let acceptCallCmd = $('<input type="button" value=" รับสาย "/>');
      $(rejectCallCmd).on('click', (evt)=>{
        onRejectCallClick(evt);
      });
      $(acceptCallCmd).on('click', (evt)=>{
        onAcceptCallClick(evt);
      });
      $(leftCol).append($(rejectCallCmd));
      $(rightCol).append($(acceptCallCmd));
      return $(row).append($(leftCol)).append($(rightCol));
    }

    const doCreateCallAnswerRow = function(onEndCallClick){
      let row = $('<tr></tr>');
      let singleCol = $('<td colspan="2" align="center"></td>');
      let endCallCmd = $('<input type="button" value=" วางสาย "/>');
      $(endCallCmd).on('click', (evt)=>{
        onEndCallClick(evt);
      });
      $(singleCol).append($(endCallCmd));
      return $(row).append($(singleCol));
    }

    const init = function(onRejectAction, onAcceptAction, onEndAction) {
      let sipPhoneBox = $('<div></div>');
      let tableBox = $('<table width="100%"></table>');
      incomeRowHandle = doCreateIncomeCallRow(onRejectAction, onAcceptAction);
      answerRowHandle = doCreateCallAnswerRow(onEndAction);
      $(answerRowHandle).css({'display': 'none'});
      $(tableBox).append($(incomeRowHandle)).append($(answerRowHandle));
      return $(sipPhoneBox).append($(tableBox));
    }

    const sipPhone = init(settings.onRejectCallCallback, settings.onAcceptCallCallback, settings.onEndCallCallback);
    this.append($(sipPhone));

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      getIncomeRowHandle: doGetIncomeRowHandle,
      getAnswerRowHandle: doGetAnswerRowHandle
    }

    return output;

  };
}( jQuery ));
