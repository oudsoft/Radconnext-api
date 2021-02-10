/* jquery-custom-select-plugin.js */
(function ( $ ) {
  $.fn.customselect = function( options ) {

    var settings = $.extend({

    }, options );

    var $this = this;
    var selectedIndex = 0;
    var defualtDisplay = {name: "เลือกรังสีแพทย์"};
    var selectOptions = [defualtDisplay];
    var selectOptionDisplay = undefined;

    const arrowUp = function(){
      let arrow = $('<span class="arrow"></span>');
      $(arrow).css({'width': '0', 'height': '0', 'border-left': '10px solid transparent', 'border-right': '10px solid transparent', 'border-bottom': '10px solid black', 'margin-top': '13px', 'margin-right': '5px'});
      return $(arrow);
    }

    const arrowDown = function(){
      let arrow = $('<span class="arrow"></span>');
      $(arrow).css({'width': '0', 'height': '0', 'border-left': '10px solid transparent', 'border-right': '10px solid transparent', 'border-top': '10px solid black', 'margin-top': '13px', 'margin-right': '5px'});
      return $(arrow);
    }

    const circleBox = function(bkColor){
      let circle = $('<span style="height: 25px; width: 25px; border: 1px solid #ccc; border-radius: 50%; display: inline-block; margin-left: 4px;"></span>');
      $(circle).css('background-color', bkColor);
      return $(circle);
    }

    const rectBox = function(bkColor){
      let rect = $('<span style="width: 25px; height: 25px; border: 1px solid #ccc; display: inline-block; margin-left: 4px;"></span>');
      $(rect).css('background-color', bkColor);
      return $(rect);
    }

    const minuteValueBox = function(minuteValue){
      let minuteBox = $('<span class="minute-value" style="display: table-cell; margin-left: 5px;"></span>');
      $(minuteBox).text('Live ' + minuteValue + ' Min. ago');
      return $(minuteBox);
    }

    const doRenderSelectedOption = function(){
      let selectedOption = selectOptions[selectedIndex];
      selectedOptionDisplay = $('<span class="displayText"></span>')
      $(selectedOptionDisplay).append($('<span>' + selectedOption.name + '</span>'));
      let readyBox = undefined;
      let screenBox = undefined;
      let minuteBox = undefined;
      if (selectedOption.state) {
        if (selectedOption.state.readyState == 0) {
          readyBox = circleBox('grey');
        } else {
          readyBox = circleBox('green');
        }
        $(readyBox).css('margin-left', '10px');
        $(selectedOptionDisplay).append($(readyBox));
        if (selectedOption.state.screenState.online == 0) {
          screenBox = rectBox('grey');
        } else if (selectedOption.state.screenState.online == 1) {
          if (selectedOption.state.screenState.state == 0) {
            screenBox = rectBox('green');
          } else {
            screenBox = rectBox('yellow');
          }
          minuteBox = $('<span class="minute-value"></span>');
          $(minuteBox).text('Live ' + selectedOption.state.screenState.minute + ' Min. ago');
          $(minuteBox).css('margin-left', '10px');
        }
        $(selectedOptionDisplay).append($(screenBox));
        if(minuteBox){
          $(selectedOptionDisplay).append($(minuteBox));
        }
      }
      return $(selectedOptionDisplay);
    }

    const doRenderOptionItem = function(optionItem, clickCallback) {
      let li = $('<li style="display: table-row;"><span style="display: table-cell;">' + optionItem.name + '</span></li>');
      let readyBox = undefined;
      let screenBox = undefined;
      let minuteBox = undefined;
      if (optionItem.state) {
        if (optionItem.state.readyState == 0) {
          readyBox = circleBox('grey');
        } else {
          readyBox = circleBox('green');
        }
        $(li).append($(readyBox));
        if (optionItem.state.screenState.online == 0) {
          screenBox = rectBox('grey');
        } else if (optionItem.state.screenState.online == 1) {
          if (optionItem.state.screenState.state == 0) {
            screenBox = rectBox('green');
          } else {
            screenBox = rectBox('yellow');
          }
          minuteBox = minuteValueBox(optionItem.state.screenState.minute);
        }
        $(li).append($(screenBox));
        if(minuteBox){
          $(li).append($(minuteBox));
        }
      }
      $(li).on('click', (evt)=>{
        clickCallback(evt);
      });
      return $(li);
    }

    const doRenderSelectOptions = function(){
      let ul = $('<ul class="select-ul"></ul>');
      let selectBoxWidth = settings.externalStyle.width;
      let selectBoxHeight = settings.externalStyle.height;
      $(ul).css('width', selectBoxWidth);
      $(ul).css('top', selectBoxHeight);
      if (selectOptions.length > 0){
        for (let i=0; i<selectOptions.length; i++){
          let selectOption = selectOptions[i];
          let li = doRenderOptionItem(selectOption, (evt)=>{
            let arrowSpan = $(selectorHandle).find('span.arrow');
            $(arrowSpan).remove();
            let arrowdown = arrowDown();
            $(arrowdown).css({'float': 'right'});
            selectedIndex = i;
            let thisOption = selectOptions[selectedIndex];
            let selectedDisplay = doRenderSelectedOption();
            $(selectorHandle).find('span.displayText').empty().append($(selectedDisplay));
            $(arrowdown).insertBefore($(selectOptionDisplay));
            $(li).parent().hide();
            $(selectOptionDisplay).toggle();
          });
          $(li).appendTo($(ul));
        }
      }
      return $(ul);
    }

    const doFindIndexOf = function(ofId){
      return new Promise(async function(resolve, reject) {
        let foundIndex = -1;
        let foundItem = await selectOptions.find((item, index)=>{
          if (item.radioId == ofId) {
            foundIndex = index;
            return item;
          }
        });
        resolve(foundIndex);
      });
    }

    const doSetSelectOptions = function(value){
      selectOptions = value;
      let defualtOption = selectOptions[selectedIndex];
      let defualtDisplay = doRenderSelectedOption(defualtOption);
      selectOptionDisplay = doRenderSelectOptions();
      $(selectorHandle).find('ul').remove();
      let arrow = arrowDown();
      $(arrow).css({'float': 'right'});
      $(selectorHandle).empty().append($(defualtDisplay)).append($(arrow)).append($(selectOptionDisplay));
    }

    const doGetSelectOptions = function(){
      return selectOptions;
    }

    const doGetRadioSelected = function(){
      let selectedOption = selectOptions[selectedIndex];
      return selectedOption;
    }

    const doSetRadioSelected = function(value){
      selectedIndex = value;
    }

    const doPreLoadOptions = function(){
      return new Promise(async function(resolve, reject) {
        settings.startLoad();
        await $.post(settings.loadOptionsUrl, {}, function(responseData){
          let newSelectOptions = [];
          let radioes = responseData.Records;
          const promiseList = new Promise(function(resolve, reject) {
            for (let i=0; i<radioes.length; i++) {
              let selectOption = {
                radioId: radioes[i].user.id,
                name: radioes[i].user.userinfo.User_NameTH + ' ' + radioes[i].user.userinfo.User_LastNameTH,
                state: radioes[i].currentState
              };
              newSelectOptions.push(selectOption);
            }
            setTimeout(()=> {
              resolve(newSelectOptions);
            },400);
          });
          Promise.all([promiseList]).then(async (ob)=> {
            selectOptions = ob[0];
            $(selectorHandle).find('ul').remove();
            selectOptionDisplay = doRenderSelectOptions();
            $(selectorHandle).append($(selectOptionDisplay));
            $(selectOptionDisplay).show();
            settings.stopLoad();
            resolve(ob[0]);
          });
        });
      });
    }

    const init = function() {
      let slectorBox = $('<div style="position: relative; border: 1px solid black; border-radius: 4px; background-color: #ccc;"></div>');
      $(slectorBox).css(settings.externalStyle);
      let defualtOption = selectOptions[selectedIndex];
      let defualtDisplay = doRenderSelectedOption(defualtOption);
      selectOptionDisplay = doRenderSelectOptions();
      let arrowdown = arrowDown();
      $(arrowdown).css({'float': 'right',});
      $(slectorBox).on('click', async (evt)=>{
        $(selectOptionDisplay).toggle();
        $(selectorHandle).find('span.arrow').remove();
        if ($('ul').css('display') === 'block'){
          let arrowup = arrowUp();
          $(arrowup).css({'float': 'right',});
          $(arrowup).insertBefore($('ul'));

          await doPreLoadOptions();
        } else {
          let arrowdo = arrowDown();
          $(arrowdo).css({'float': 'right',});
          $(arrowdo).insertBefore($('ul'));
        }
      });
      return $(slectorBox).append($(defualtDisplay)).append($(arrowdown)).append($(selectOptionDisplay));
    }

    /*
    pluginOption {

    }

    */

    const selectorHandle = init();
    this.append($(selectorHandle));

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      getSelectedIndex: doGetRadioSelected,
      setSelectedIndex: doSetRadioSelected,
      setSelectOptions: doSetSelectOptions,
      loadOptions: doPreLoadOptions,
      findIndexOf: doFindIndexOf,
      renderSelectedOption: doRenderSelectedOption,
      selectedIndex: selectedIndex
    }

    return output;

  };
}( jQuery ));
