(function ( $ ) {

  $.ajaxSetup({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
    }
  });

  $.fn.scanpart = function( options ) {
    // switchToggle Clear/Load Json ให้ถูก
    // item common=R ให้ load to main when selectMainJson.length > 1 item

    const inputStyleClass = {"font-family": "THSarabunNew", "font-size": "24px"};
    const modalStyleClass = {"display": "none", "position": "fixed", "z-index": "1", "left": "0",	"top": "0",	"width": "100%", "min-height": "100%", "overflow": "auto",	"background-color": "rgb(0,0,0)",	"background-color": "rgba(0,0,0,0.4)" };
    const modalContentWrapperClass = {"width": "60%", "background-color": "white"};
    const modalHeaderClass = {"width": "100%", "height": "auto", "background-color": options.headerBackgroundColor, "color": "white", "padding": "4px", "text-align": "left"};
    const modalContentClass = {"width": "100%", "height": "auto", "background-color": "white", "padding": "4px", "text-align": "left"};
    const modalFooterClass = {"font-size": "30px", "width": "100%", "height": "auto", "background-color": options.headBackgroundColor, "padding": "4px", "text-align": "center"};
    // This is the easiest way to have default options.
    var settings = $.extend({
      // These are the defaults.

    }, options );

    var $this = this;
    var originJson = undefined;
    var mainJson = undefined;
    var optionJson = undefined;
    var selectedMainJson = undefined;
    var selectedOptionJson = undefined;
    var inputKeyHandle = undefined;

    const init = function() {
      //var iconCmd = $('<input type="button" value="เพิ่ม/ลด/แก้ไข Scan Part"/>');
      let iconCmd = $('<img/>')
      //$(iconCmd).attr('src', settings.iconCmdUrl);
      $(iconCmd).attr('src', '/images/plus-sign-green-icon.png');
      $(iconCmd).attr('title', 'เพิ่ม/ลด/แก้ไข Scan Part');
      $(iconCmd).css({'cursor': 'pointer', 'width': '35px', 'height': 'auto'});
      $(iconCmd).on('click', (evt)=>{
        doShowDialog();
      });
      $this.selectedMainJson = [];
      $this.selectedOptionJson = [];
      $this.inputKeyHandle = undefined;
      return $(iconCmd);
    }

    const setBoxToCenter = function(box) {
      $(box).css("position","absolute");
      $(box).css("top", "10px");
      //$(box).css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 8) + $(window).scrollTop()) + "px");
      $(box).css("left", Math.max(0, (($(window).width() - $(box).outerWidth()) / 4) +  $(window).scrollLeft()) + "px");
    }

    const doLoadOriginScanpart = function(params){
      return new Promise(function(resolve, reject) {
  			let loadUrl = settings.loadOriginUrl;
  			$.post(loadUrl, params, function(data){
  				resolve(data);
  			}).fail(function(error) {
  				reject(error);
  			});
  		});
    }

    const doSaveNewScanpartItem = function(params){
      return new Promise(function(resolve, reject) {
  			let addUrl = settings.addScanpartItemUrl;
  			$.post(addUrl, params, function(data){
  				resolve(data);
  			}).fail(function(error) {
  				reject(error);
  			});
  		});
    }

    const doGetNormalMainScanpart = function(originScanparts){
      return new Promise(async function(resolve, reject) {
        let normalScanparts = await originScanparts.filter((item)=>{
          if (item.Common === 'B') { return item;}
        });
        resolve(normalScanparts);
      });
    }

    const doGetNormalAllScanpart = function(originScanparts){
      return new Promise(async function(resolve, reject) {
        let allScanparts = await originScanparts.filter((item)=>{
          if ((item.Common === 'B') || (item.Common === 'S')) { return item;}
        });
        resolve(allScanparts);
      });
    }

    const doGetOptionScanpart = function(originScanparts){
      return new Promise(async function(resolve, reject) {
        let optionScanparts = await originScanparts.filter((item)=>{
          if (item.Common === 'R') { return item;}
        });
        resolve(optionScanparts);
      });
    }

    const doGetSearchByKey = function(key){
      return new Promise(function(resolve, reject) {
        let founds = [];
        var promiseList = new Promise(function(resolve2, reject2){
          $this.mainJson.forEach((item)=>{
            let posFound;
            if (Number(key) > 0) {
              posFound = item.Code.indexOf(key);
              if (posFound >= 0) {
                founds.push(item);
              }
            } else if (key === '*') {
              founds = $this.mainJson;
            } else {
              let keyUpper = key.toUpperCase();
              let itemUpper = item.Name.toUpperCase();
              posFound = itemUpper.indexOf(keyUpper);
              if (posFound >= 0) {
                founds.push(item);
              }
            }
          });
          setTimeout(()=>{
            resolve2(founds);
          }, 500);
        });
				Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
      });
    }

    const doGetItemByCodeFromMain = function(code) {
      return new Promise(function(resolve, reject) {
        let promiseList = new Promise(function(resolve2, reject2){
          let foundIndex;
          let foundItems = $this.mainJson.filter((item , index)=>{
            //if ((item) && (item.Code === code)) {
            if ((item.Code === code)) {
              foundIndex = index;
              return item;
            }
            setTimeout(()=>{
              resolve2({foundIndex, foundItem: foundItems[0]});
            }, 500);
          });
        });
        Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
      });
    }

    const doGetItemByCodeFromSelectedMain = function(code) {
      return new Promise(function(resolve, reject) {
        let foundIndex;
        let promiseList = new Promise(function(resolve2, reject2){
          let foundItems = $this.selectedMainJson.filter((item , index)=>{
            if (item.Code === code) {
              foundIndex = index;
              return item;
            }
          });
          setTimeout(()=>{
            resolve2({foundIndex, foundItem: foundItems[0]});
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
      });
    }

    const doRemoveItemFromMainAt = function(itemIndex) {
      $this.mainJson.splice(itemIndex, 1);
    }

    const doRemoveItemFromSelectedMainAt = function(itemIndex) {
      $this.selectedMainJson.splice(itemIndex, 1);
    }

    const doRemoveOpionFromMain = function() {
      return new Promise(function(resolve, reject) {
        let promiseList = new Promise(function(resolve2, reject2){
          $this.optionJson.foeEach(async (item) => {
            let foundItem = await doGetItemByCodeFromMain(item.Code);
            if (foundItem) {
              doRemoveItemFromMainAt(foundItem.itemIndex);
            }
          });
          setTimeout(()=>{
            resolve2($this.selectedMainJson);
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
      });
    }

    const formatNumberWithCommas = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const doCreateModalDialog = function(){
      let mainModal = $('<div id="ScanPart-Dialog"></div>');
      $(mainModal).css(modalStyleClass);
      return $(mainModal);
    }

    const doCreateToggleSwitch = function() {
      let toggleSwitch = $('<label class="switch"></label>');
      let input = $('<input type="checkbox">');
      let slider = $('<span class="slider"></span>');
      $(toggleSwitch).append($(input));
      $(toggleSwitch).append($(slider));
      $(input).on('click', async (evt)=>{

        let key = $($this.inputKeyHandle).val();

        let isOn = $(input).prop('checked');
        if (isOn) {
          $this.mainJson = await doGetNormalAllScanpart($this.originJson);
        } else {
          $this.mainJson = await doGetNormalMainScanpart($this.originJson);
        }
        if ($this.selectedMainJson.length > 0) {
          $this.mainJson = $this.mainJson.concat($this.optionJson);
        }
        if (key) {
          let eventData = {searchKey: key};
          $($this.inputKeyHandle).trigger('startsearch', [eventData]);
        }
      });
      return $(toggleSwitch);
    }

    const doCreateFoundList = function(foundItems, key) {
      return new Promise(async function(resolve, reject) {
        let foundListBox = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
        let headerFieldRow = doCreateHeaderField();
        $(headerFieldRow).find('#NoHeaderField').css({'width': '10%'});
        $(headerFieldRow).find('#CodeHeaderField').css({'width': '15%'});
        $(headerFieldRow).find('#NameHeaderField').css({'width': '50%'});
        $(headerFieldRow).appendTo($(foundListBox));
        await foundItems.forEach((item, i) => {
          let itemRow = $('<div style="display: table-row; width: 100%; cursor: pointer; border: 2px solid ' + settings.headerBackgroundColor + ';" class="item-list"></div>');
          $(itemRow).appendTo($(foundListBox));
          let itemCell = $('<div style="display: table-cell; padding: 4px;">' + (i+1) + '.</div>');
          $(itemCell).appendTo($(itemRow));
          itemCell = $('<div style="display: table-cell; padding: 4px;">' + item.Code + '</div>');
          $(itemCell).appendTo($(itemRow));
          itemCell = $('<div style="display: table-cell; padding: 4px;">' + item.Name.replace(key, '<span class="search-mark">' + key + '</span>') + '</div>');
          $(itemCell).appendTo($(itemRow));
          itemCell = $('<div style="display: table-cell;  padding: 4px;">' + formatNumberWithCommas(item.Price) + '</div>');
          $(itemCell).appendTo($(itemRow));
          $(itemRow).on('click', (evt)=>{
            let eventData = {code: item.Code, searchKey: key};
            $(itemRow).trigger('selectitem', [eventData]);
          });
        });
        let createNewItemRow = $('<div style="display: table-row; width: 100%; cursor: pointer; border: 2px solid ' + settings.headerBackgroundColor + ';" class="item-list"></div>');
        let createNewItemCell = $('<div style="display: table-cell; padding: 4px;"></div>');
        $(createNewItemCell).appendTo($(createNewItemRow));
        createNewItemCell = $('<div style="display: table-cell; padding: 4px;"></div>');
        $(createNewItemCell).appendTo($(createNewItemRow));
        createNewItemCell = $('<div style="display: table-cell; padding: 4px; width: 100%; text-align: center;">ไม่มีรายการที่ฉันต้องการเลือก</div>');
        $(createNewItemCell).appendTo($(createNewItemRow));
        createNewItemCell = $('<div style="display: table-cell; padding: 4px;"></div>');
        $(createNewItemCell).appendTo($(createNewItemRow));
        $(createNewItemRow).appendTo($(foundListBox));

        $(createNewItemRow).on('click', (evt)=>{
          let eventData = {};
          $(createNewItemRow).trigger('createnewitem', [eventData]);
        });
        resolve($(foundListBox));
      });
    }

    const doAddSelectedItem = function(modalContent, code, key){
      return new Promise(async function(resolve, reject) {
        let targetItem = await doGetItemByCodeFromMain(code);
        if (targetItem.foundItem) {

          let haveList = await $this.selectedMainJson.find((item)=>{
            if (item.Code == code) return item
          });

          if (!haveList) {
            $this.selectedMainJson.push(targetItem.foundItem);
          } else if (haveList.Code === '44140') {
            $this.selectedMainJson.push(targetItem.foundItem);
          }

          doRemoveItemFromMainAt(targetItem.foundIndex);
          if ($this.selectedMainJson.length == 1) {
            $this.mainJson = $this.mainJson.concat($this.optionJson);
          }

          let selectedList = await doCreateSelectedListBox(key);

          $(modalContent).find('#SelectedItemBox').empty().append($(selectedList));
          //let eventData = {searchKey: key};
          //$(modalContent).find('#SearchScanPart').trigger('startsearch', [eventData]);
        } else {
          /*
          console.log(code);
          console.log($this.mainJson);
          console.log($this.selectedMainJson);
          */
        }
        resolve($this.selectedMainJson);
      });
    }

    const doCreateHeaderField = function() {
      let headerFieldRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: ' + settings.headerBackgroundColor + '; color: white;"></div>');
      let fieldCell = $('<div id="NoHeaderField" style="display: table-cell; padding: 4px;">ลำดับที่</div>');
      $(fieldCell).appendTo($(headerFieldRow));
      fieldCell = $('<div id="CodeHeaderField" style="display: table-cell; padding: 4px;">รหัส</div>');
      $(fieldCell).appendTo($(headerFieldRow));
      fieldCell = $('<div id="NameHeaderField" style="display: table-cell; padding: 4px;">ชื่อ</div>');
      $(fieldCell).appendTo($(headerFieldRow));
      fieldCell = $('<div id="PriceHeaderField" style="display: table-cell; padding: 4px;">ราคา</div>');
      $(fieldCell).appendTo($(headerFieldRow));
      fieldCell = $('<div id="CmdHeaderField" style="display: table-cell; padding: 4px;"></div>');
      $(fieldCell).appendTo($(headerFieldRow));
      return $(headerFieldRow);
    }

    const doCreateSelectedListBox = function(key){
      return new Promise(async function(resolve, reject) {
        let selectedBox = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
        let headerFieldRow = doCreateHeaderField();
        $(headerFieldRow).append($('<div style="display: table-cell; padding: 4px;"></div>'));
        $(headerFieldRow).appendTo($(selectedBox));
        var promiseList = new Promise(function(resolve2, reject2){
          for (let i = 0; i < $this.selectedMainJson.length; i++) {
            let item = $this.selectedMainJson[i];
            if (item) {
              let itemRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: #ccc;"></div>');
              $(itemRow).appendTo($(selectedBox));
              let itemCell = $('<div style="display: table-cell; padding: 4px; text-align: center;">' + (i+1) + '.</div>');
              $(itemCell).appendTo($(itemRow));
              itemCell = $('<div style="display: table-cell; padding: 4px;">' + item.Code + '</div>');
              $(itemCell).appendTo($(itemRow));
              itemCell = $('<div style="display: table-cell; padding: 4px;">' + item.Name + '</div>');
              $(itemCell).appendTo($(itemRow));
              itemCell = $('<div style="display: table-cell; padding: 4px;">' + formatNumberWithCommas(item.Price) + '</div>');
              $(itemCell).appendTo($(itemRow));
              //let removeCmd = $('<div style="display: table-cell;" class="remove-item">X</div>');
              itemCell = $('<div style="display: table-cell; padding: 4px;"></div>');
              $(itemCell).appendTo($(itemRow));
              let removeCmd = $('<img/>')
              $(removeCmd).attr('src', '/images/minus-sign-red-icon.png');
              $(removeCmd).attr('title', 'ลบ Scan Part');
              $(removeCmd).css({'cursor': 'pointer', 'width': '25px', 'height': 'auto'});
              $(removeCmd).appendTo($(itemCell));
              $(removeCmd).on('click', (evt)=>{
                let eventData = {code: item.Code, searchKey: key};
                $(itemRow).trigger('removeitem', [eventData]);
              });
            }
          }
          setTimeout(()=>{
            resolve2($(selectedBox));
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
          resolve(ob[0]);
        });
      });
    }

    const doCreateSearchForm = function(){
      //const searchView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
      const searchView = $('<div style="width: 100%;"></div>');
      let searchForm = $('<div style="display: table-row; width: 100%;"></div>');
      $(searchForm).appendTo($(searchView));
      $(searchForm).css({'border': '1px solid #ccc'});
      let searchIcon = $('<img width="30" height="auto" src="/images/search-icon.png"/>');
      $(searchIcon).css({'margin-top': '4px'});
      let searchInputBox = $('<input type="text" id="SearchScanPart" class="search-input"/>');

      $this.inputKeyHandle = $(searchInputBox);

      $(searchInputBox).css({'border': ''});
      let cellForm = $('<div style="display: table-cell; vertical-align: middle;"></div>');
      $(cellForm).append($(searchIcon)).appendTo($(searchForm));
      cellForm = $('<div style="display: table-cell"></div>');
      $(cellForm).append($(searchInputBox)).appendTo($(searchForm));
      cellForm = $('<div style="display: table-cell; vertical-align: middle;"></div>');
      let toggleSwitch = doCreateToggleSwitch();
      $(cellForm).append($(toggleSwitch)).appendTo($(searchForm));
      $(searchInputBox).on('keyup', (evt)=>{
        let key = $(searchInputBox).val();
        eventData = {searchKey: key};
        $(searchInputBox).trigger('startsearch', [eventData]);
      });
      let guideToggle = $('<span style="padding-left: 8px;">แสดงรายการเลือกทั้งหมด</span>');
      $(searchForm).append($(guideToggle));

      //let searchCommand = $('<div style="width: 100%;"></div>');
      //$(searchCommand).appendTo($(searchView));
      /*
      $(searchInputBox).on('focusout', (evt)=>{
        console.log('test');
        $('#SeachResultBox').hide();
      });

      $(searchInputBox).on('focus', (evt)=>{
        console.log('test2');
        $('#SeachResultBox').show();
      });
      */
      return $(searchView);
    }

    const doCreateControlModal = function(){
      let modalControlBox = $('<div style="width: 100%; padding: 4px; text-align: center;"></div>');
      //$(modalControlBox).css(modalFooterClass);
      //$(searchView).append($(modalControlBox));

      let okCmd = $('<input type="button" value=" OK "class="action-btn"/>');
      $(okCmd).appendTo($(modalControlBox));
      $(modalControlBox).append('<span>  </span>');
      let cancelCmd = $('<input type="button" value=" Cancel "/>');
      $(cancelCmd).appendTo($(modalControlBox));

      $(cancelCmd).on('click', (evt)=>{
        eventData = {};
        $(cancelCmd).trigger('closedialog', [eventData]);
      });

      $(okCmd).on('click', async (evt)=>{
        /*
        if ($this.selectedMainJson.length > 0) {
          let selectedListBox = await doCreateSelectedListBox('');
          eventData = {selectedData: $this.selectedMainJson, selectedBox: selectedListBox};
          settings.successCallback(eventData);
          $(okCmd).trigger('closedialog', [eventData]);
        } else {
          $.notify('ต้องเลือก Scan Part อย่างน้อย 1 รายการก่อน', 'warn');
        }
        */
        let selectedListBox = await doCreateSelectedListBox('');
        eventData = {selectedData: $this.selectedMainJson, selectedBox: selectedListBox};
        settings.successCallback(eventData);
        $(okCmd).trigger('closedialog', [eventData]);
      });
      return $(modalControlBox)
    }

    const doCreateModalContent = function(){
      return new Promise(async function(resolve, reject) {
        let modalWrapper = $('<div></div>');
        $(modalWrapper).css(modalContentWrapperClass);
        $(modalWrapper).css(settings.externalStyle);
        let modalHeader = $('<div><h3>ส่วนที่ตรวจ (Scan Part)</h3></div>');
        $(modalHeader).css(modalHeaderClass);
        $(modalWrapper).append($(modalHeader));

        let callParams = {};
        let originRecords = await doLoadOriginScanpart(callParams);
        $this.originJson = originRecords.Records
        //console.log($this.originJson);
        $this.mainJson = await doGetNormalMainScanpart($this.originJson);
        // console.log($this.mainJson);
        $this.optionJson = await doGetOptionScanpart($this.originJson)
        //console.log($this.optionJson);

        let modalContent = $('<div id="ModalContent"></div>');
        let guideBox = $('<divstyle="width: 100%; padding: 10px; margin-top: 10px; background: #ddd;>โปรดค้นหา Scan Part ที่ต้องการเพิ่มลงในเคส โดยพิมพ์ชื่อ Scan Part และเลือกรายการที่ต้องการจากที่ปรากฎขึ้นมา</div>');
        $(guideBox).appendTo($(modalContent));
        let selectedItemBox = $('<div id="SelectedItemBox"></div>');
        $(modalContent).append($(selectedItemBox));
        let searchForm = doCreateSearchForm();
        $(modalContent).append($(searchForm));
        let seachResultBox = $('<div id="SeachResultBox"></div>');
        $(modalContent).append($(seachResultBox));

        let controModal = doCreateControlModal();
        $(modalContent).append($(controModal));

        $(modalContent).css(modalContentClass);
        $(modalWrapper).append($(modalContent));

        resolve($(modalWrapper));
      });
    }

    const doCreateNewScanpartForm = function(){
      let modalWrapper = $('<div id="CreateNewItemForm"></div>');
      $(modalWrapper).css(modalContentWrapperClass);
      $(modalWrapper).css(settings.externalStyle);
      let modalHeader = $('<div><h3>New Scan Part Item.</h3></div>');
      $(modalHeader).css(modalHeaderClass);
      $(modalWrapper).append($(modalHeader));

      let scanpartForm = $('<div style="display: table; width: 100%; border-collapse: collapse; padding: 5px;"></div>');
      $(scanpartForm).appendTo($(modalWrapper));
      let scanpartRow = $('<div style="display: table-row; width: 100%;"></div>');
      $(scanpartRow).appendTo($(scanpartForm));
      let cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;">Code</div>');
      $(cellForm).appendTo($(scanpartRow));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;"></div>');
      let codeInput = $('<input type="text" id="CodeInput"/>');
      $(codeInput).appendTo($(cellForm));
      $(cellForm).appendTo($(scanpartRow));

      scanpartRow = $('<div style="display: table-row; width: 100%;"></div>');
      $(scanpartRow).appendTo($(scanpartForm));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;">Name</div>');
      $(cellForm).appendTo($(scanpartRow));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;"></div>');
      let nameInput = $('<input type="text" id="NameInput"/>');
      $(nameInput).appendTo($(cellForm));
      $(cellForm).appendTo($(scanpartRow));

      scanpartRow = $('<div style="display: table-row; width: 100%;"></div>');
      $(scanpartRow).appendTo($(scanpartForm));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;">Unit</div>');
      $(cellForm).appendTo($(scanpartRow));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;"></div>');
      let unitInput = $('<input type="text" id="UnitInput"/>');
      $(unitInput).appendTo($(cellForm));
      $(cellForm).appendTo($(scanpartRow));

      scanpartRow = $('<div style="display: table-row; width: 100%;"></div>');
      $(scanpartRow).appendTo($(scanpartForm));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;">Price</div>');
      $(cellForm).appendTo($(scanpartRow));
      cellForm = $('<div style="display: table-cell; vertical-align: middle; padding: 4px;"></div>');
      let priceInput = $('<input type="number" id="PriceInput"/>');
      $(priceInput).appendTo($(cellForm));
      $(cellForm).appendTo($(scanpartRow));

      let modalFooter = $('<div></div>');
      $(modalFooter).css(modalFooterClass);
      $(modalWrapper).append($(modalFooter));

      let okCmd = $('<input type="button" value=" OK "/>');
      $(okCmd).appendTo($(modalFooter));
      $(modalFooter).append('<span>  </span>');
      let cancelCmd = $('<input type="button" value=" Cancel "/>');
      $(cancelCmd).appendTo($(modalFooter));

      $(cancelCmd).on('click', (evt)=>{
        eventData = {};
        $(modalWrapper).trigger('closenewitemdialog', [eventData]);
      });

      $(okCmd).on('click', (evt)=>{
        let codeValue = $(codeInput).val();
        let nameValue = $(nameInput).val();
        let unitValue = $(unitInput).val();
        let priceValue = $(priceInput).val();

        if (codeValue === '') {
          $(codeInput).css('border', '1px solid red');
        } else if (nameValue === '') {
          $(codeInput).css('border', '');
          $(nameInput).css('border', '1px solid red');
        } else if (unitValue === '') {
          $(nameInput).css('border', '');
          $(unitInput).css('border', '1px solid red');
        } else if (parseFloat(priceValue) < 0) {
          $(unitInput).css('border', '');
          $(priceInput).css('border', '1px solid red');
        } else {
          $(priceInput).css('border', '');
          let addItemData = {Code: codeValue, Name: nameValue, Unit: unitValue, Price: priceValue, Common: 'R', RefPoint: '', Modality: 'CT', MajorType: 'etc'};
          doSaveNewScanpartItem(addItemData).then((addResponse)=>{
            if (addResponse.status.code == 200) {
              alert('บันทึกสำเร็จ');
            } else {
              alert('บันทึกขัดข้อง');
            }
            $(modalWrapper).trigger('closenewitemdialog', [eventData]);
          }).catch(function(err) {
            console.log(err);
          });
        }
      });

      return $(modalWrapper);
    }

    const doShowDialog = async function(){
      let mainModal = doCreateModalDialog();
      let content = await doCreateModalContent();
      $(content).draggable({
	       containment: "parent",
      });
      $(mainModal).append($(content));
      $('body').append($(mainModal));

      setBoxToCenter(content);
      $(mainModal).show();
      //$(mainModal).find('#SearchScanPart').focus();
      $(mainModal).on('closedialog', (evt, data)=>{
        $(mainModal).remove();
      });
      $(mainModal).on('startsearch', async (evt, data)=>{
        let key = data.searchKey;
        let foundItems = await doGetSearchByKey(key);
        let foundList = await doCreateFoundList(foundItems, key);
        let searchResultbox = $(content).find('#SeachResultBox');
        $(searchResultbox).empty().append($(foundList));
        $(searchResultbox).show();
      });
      $(mainModal).on('selectitem', async (evt, data)=>{
        let code = data.code;
        let key = data.searchKey;
        await doAddSelectedItem(content, code, key);
        let searchResultbox = $(content).find('#SeachResultBox');
        $(searchResultbox).hide();
        let searchInputtbox = $(content).find('#SearchScanPart');
        $(searchInputtbox).val('');
      });
      $(mainModal).on('removeitem', async (evt, data)=>{
        let code = data.code;
        let key = data.searchKey;
        let targetItem = await doGetItemByCodeFromSelectedMain(code);
        $this.mainJson.push(targetItem.foundItem);
        if ($this.selectedMainJson.length == 0) {
          await doRemoveOpionFromMain();
        };
        doRemoveItemFromSelectedMainAt(targetItem.foundIndex);
        let selectedList = await doCreateSelectedListBox(key);
        $(content).find('#SelectedItemBox').empty().append($(selectedList));
        //let eventData = {searchKey: key};
        //$(content).find('#SearchScanPart').trigger('startsearch', [eventData]);
      });
      $(mainModal).on('createnewitem', async (evt, data)=>{
        $(content).remove();
        let newItemForm = doCreateNewScanpartForm();
        $(mainModal).append($(newItemForm));
        //$(newItemForm).center();
        setBoxToCenter(newItemForm);
      });
      $(mainModal).on('closenewitemdialog', async (evt, data)=>{
        $(mainModal).find('#CreateNewItemForm').remove();
        doShowDialog();
        setBoxToCenter(content);
      });

      settings.updateSelectedItem(content);

      $this.selectedMainJson.forEach(async (item, i) => {
        let foundItem = await doGetItemByCodeFromMain(item.Code);
        if (foundItem) {
          doRemoveItemFromMainAt(foundItem.itemIndex);
        }
      });
    }

    let scanpartButton = init();
    this.append($(scanpartButton));

    /* public method of plugin */
    let output = {
      hello: function(world) {return formatNumberWithCommas(world)},
      settings: function() {return settings},
      getOriginJson: function(){ return originJson},
      getMainJson: function(){ return mainJson},
      getOptionJson: function() {return optionJson},
      getSelectedMainJson: function() {return $this.selectedMainJson},
      setSelectedMainJson: function(value) { $this.selectedMainJson = value },
      addSelectedItem: function(content, code, key){doAddSelectedItem(content, code, key)},
      getSelectedListBox: async function(key) {
        let listBox = await doCreateSelectedListBox(key);
        return $(listBox);
      },
      joinOptionToMain: function() {
        $this.mainJson = $this.mainJson.concat($this.optionJson);
      },
      getItemByCodeFromMain: function(code){
        return new Promise(async function(resolve, reject) {
          doGetItemByCodeFromMain(code).then((mainItems)=>{
            resolve(mainItems);
          })
        });
      },
      removeItemFromMainAt: function(atIndex){
        doRemoveItemFromMainAt(atIndex);
      }
      /*
      ยังมีปัญหาเรื่อง remove รายการที่ถูกเลือกไปแล้ว ออกจาก main
      */
    }

    return output;
  };

}( jQuery ));
