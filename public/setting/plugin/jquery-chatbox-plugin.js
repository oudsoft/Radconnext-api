/* jquery-chatbox-plugin.js */
(function ( $ ) {
  $.fn.chatbox = function( options ) {

    var settings = $.extend({
      topicId: 0,
      topicName: '',
      topicStatusId: 0,
      myId: '',
      myName: '',
      myDisplayName: '',
      audienceId: '',
      audienceName: '',
      wantBackup: false,
      externalClassStyle: {},
      sendMessageCallback: function(evt){ /* ... */},
      gotMessageCallback: function(evt){ /* ... */},
      resetUnReadMessageCallback: function(evt){ /* ... */}
    }, options );

    var $this = this;
    var messageInputHandle = undefined;
    var messageBoxHandle = undefined;

    /* Infrastructure Box */

    const formatDateStr = function(d) {
      var yy, mm, dd, hh, mn;
      yy = d.getFullYear();
      if (d.getMonth() + 1 < 10) {
        mm = '0' + (d.getMonth() + 1);
      } else {
        mm = '' + (d.getMonth() + 1);
      }
      if (d.getDate() < 10) {
        dd = '0' + d.getDate();
      } else {
        dd = '' + d.getDate();
      }
      if (d.getHours() < 10) {
        hh = '0' + d.getHours();
      } else {
        hh = '' + d.getHours();
      }
      if (d.getMinutes() < 10) {
        mn = '0' + d.getMinutes();
      } else {
        mn = '' + d.getMinutes();
      }
      var td = yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mn;
      return td;
    }

    const doCreateTitleBox = function(title){
      let titleBox = $('<div style="position: relative; width: 100%; padding: 2px; text-align: left; border: 1px solid grey; background-color: #020760; color: white;"></div>');
      let titleText = $('<span><b>' + title + '</b></span>');
      $(titleBox).append($(titleText));
      return $(titleBox);
    }
    const doCreateMessageBox = function(){
      let messageBox = $('<div id="MessageBoard" style="position: relative; width: 100%; padding: 2px; text-align: left; border: 1px solid grey; background-color: white; min-height:350px; max-height:350px; overflow: auto;"></div>');
      return $(messageBox);
    }
    const doCreateSendBox = function(sendMessageCallback){
      let sendBox = $('<div id="ChatSendBox" style="position: relative; width: 100%; padding: 2px; text-align: right; border: 1px solid grey; background-color: #020760; color: white;"></div>');
      let messageInput = $('<input type="text" style="border: 2px solid black; display: inline-block;"/>');
      $(messageInput).width('380');
      $(messageInput).appendTo($(sendBox));
      $this.messageInputHandle = messageInput;
      let sendCmd = $('<input type="button" value="Send" style="display: inline-block; margin-left: 10px;"/>');
      $(sendCmd).appendTo($(sendBox));
      $(sendCmd).on('click', function(evt){
        let userMessage = $(messageInput).val();
        if (userMessage) {
          $(messageInput).css({'border': '2px solid black'});
          let contextData = {topicId: settings.topicId, topicName: settings.topicName, myId: settings.myId, myName: settings.myName, audienceId: settings.audienceId, audienceName: settings.audienceName, topicStatusId: settings.topicStatusId};
          sendMessageCallback(userMessage, settings.audienceId, settings.myId, contextData).then(function(){
            doAppendNewMessage(userMessage, 0);
            doSaveMessageToLocal(userMessage, settings.myId, settings.topicId, 'read');
            $(messageInput).val('');
          });
        } else {
          $(messageInput).css({'border': '2px solid red'});
        }
      });
      $(messageInput).on('keypress',function(evt) {
        if(evt.which == 13) {
          $(sendCmd).click();
        };
      });

      return $(sendBox);
    }
    const doCreateMessageFragBox = function(msgData){
      let messageFrag = $('<div style="position: relative; width: 100%; margin-top: 5px; display: inline-block;"></div>');
      let messageBody = $('<div style="position: relative; padding: 4px; display: inline-block; border-radius: 8px;"></div>');
      $(messageBody).appendTo($(messageFrag));
      $(messageBody).text(msgData.msg);
      let messageInfo = $('<div style="position: relative; font-size: 14px;"></div>');
      $(messageInfo).appendTo($(messageFrag));
      let ownerInfo = $('<span></span>');
      $(ownerInfo).appendTo($(messageInfo));
      $(ownerInfo).text(msgData.ownerName);

      $(messageInfo).append($('<span>  </span>'));

      let timeInfo = $('<span></span>');
      $(timeInfo).appendTo($(messageInfo));
      let msgDate = new Date(msgData.time);
      let msgDateFmt = formatDateStr(msgDate)
      $(timeInfo).text(msgDateFmt);

      if (msgData.owner == 1){
        $(messageBody).css({'background-color': '#ccc'});
        //$(ownerInfo).css({'text-align': 'left'});
        $(messageFrag).css({'text-align': 'left'});
      } else {
        $(messageBody).css({'background-color': '#5BE841'});
        //$(ownerInfo).css({'text-align': 'right'});
        $(messageFrag).css({'text-align': 'right'});
      }
      return $(messageFrag);
    }
    /* Mechanimst */
    const doAppendNewMessage = function(msg, who){
      let msgData = {msg: msg, owner: who}
      if (who == 1){
        msgData.ownerName = settings.audienceName;
      } else {
        msgData.ownerName = settings.myDisplayName;
      }
      msgData.time = new Date();
      let messageFrag = doCreateMessageFragBox(msgData);
      $(messageBoxHandle).append($(messageFrag));
      doScrollDown();
    }
    const doScrollDown = function(){
      let messageBoard = document.getElementById('MessageBoard');
      if (messageBoard) {
        let messageBoxHeight = messageBoard.scrollHeight;
        $(messageBoxHandle).animate({ scrollTop:  messageBoxHeight}, 1000);
      }
    }
    const onReceiveMessage = function(msg, from, topicId){
      let chatboxVisible = $(chatBox).css('display');
      if ((chatboxVisible === '') || (chatboxVisible === 'block')) {
        if (topicId == settings.topicId) {
          if (from == settings.audienceId) {
            doAppendNewMessage(msg, 1);
          } else if (from === settings.myId) {
            doAppendNewMessage(msg, 0);
          }
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    const doSaveMessageToLocal = function(msg ,from, topicId, status){
  		let localMessage = localStorage.getItem('localmessage');
  		let localMessageJson = JSON.parse(localMessage);
  		if (localMessageJson) {
  			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
  		} else {
  			localMessageJson = [];
  			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
  		}
  		localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
  	}
    const doRestoreFromLocal = function(){
      let dfd = $.Deferred();
      let localMsgStorage = localStorage.getItem('localmessage');
      if ((localMsgStorage) && (localMsgStorage !== '')) {
        let localMessageJson = JSON.parse(localMsgStorage);
        //let localMessage = localMessageJson;
        //$('.footer').simplelog({myId: settings.myId, audienceId: settings.audienceId});
        //$('.footer').simplelog({test: JSON.stringify(localMessage)})
        doFindMessageOfTopic(localMessageJson, settings.topicId).then(function(localMessage){
    			if (localMessage) {
            for (let i=0; i < localMessage.length; i++) {
              let msgJson = localMessage[i];
              let from = msgJson.from;
              let topicId = msgJson.topicId;
              let msg = msgJson.msg;
              if (topicId == settings.topicId) {
                if (from === settings.audienceId) {
                  let isSuccess = onReceiveMessage(msg, from, topicId);
                  if (isSuccess) {
                    doDecreaseReddotEvent();
                    msgJson.status = 'read';
                  }
                } else if (from === settings.myId) {
                  onReceiveMessage(msg, settings.myId, topicId);
                }
              }
            }
            localStorage.setItem('localmessage', JSON.stringify(localMessage));
            setTimeout(function(){
              dfd.resolve();
            }, 2300)
          } else {
            dfd.resolve();
          }
        });
      } else {
        dfd.resolve();
      }
      return dfd.promise();
    }
    const doFindMessageOfTopic = function(orgMessage, topicId){
      var dfd = $.Deferred();
      if (orgMessage && (orgMessage.length > 0)) {
        let history = orgMessage.filter(function(item){
  				if (item.topicId == topicId) {
  					return item;
  				}
  			});
        dfd.resolve(history);
      } else {
        dfd.resolve([]);
      }
      return dfd.promise();
    }
    const doIncreaseReddotEvent = function(){
      settings.resetUnReadMessageCallback(settings.audienceId, 1);
    }
    const doDecreaseReddotEvent = function(){
      settings.resetUnReadMessageCallback(settings.audienceId, -1);
    }
    const doClearLocal = function(){
      localStorage.removeItem('localmessage');
    }
    const setTopicId = function(value){
      settings.topicId = value;
    }
    const setTopicName = function(value){
      settings.topicName = value;
    }
    const setTopicStatusId = function(value){
      settings.topicStatusId = value;
    }
    const setMyId = function(value){
      settings.myId = value;
    }
    const setMyName = function(value){
      settings.myName = value;
    }
    const setAudienceId = function(value){
      settings.audienceId = value;
    }
    const setAudienceName = function(value){
      settings.audienceName = value;
    }

    const init = function() {
      let chatBox = $('<div class="chatbox" style="position: relative; width: 98%; border: 1px solid grey; background-color: #ccc; margin-top: 10px;"></div>');
      let titleBox = doCreateTitleBox(settings.audienceName);
      let messageBox = doCreateMessageBox();
      messageBoxHandle = messageBox;
      let sendBox = doCreateSendBox(settings.sendMessageCallback);
      $(chatBox).prop('id', settings.audienceId);
      $(chatBox).append($(titleBox)).append($(messageBox)).append($(sendBox));
      return $(chatBox);
    }

    const chatBox = init();
    this.append($(chatBox));

    this.on('messagedrive', function(evt, data){
      let msg = data.msg;
      let from = data.from;
      let topicId = data.context.topicId;
      let showSuccess = onReceiveMessage(msg, from, topicId);
      if (!showSuccess) {
        doIncreaseReddotEvent();
      }
    });
    this.on('updatetopicstatus', function(evt, data){
      let newTopicStatusId = data.topicStatusId;
      settings.topicStatusId = newTopicStatusId;
    });
    /*
    pluginOption {
      topicId: 0,
      topicName: '',
      topicStatusId: 0,
      myId: '',
      myName: '',
      myDisplayName: '';
      audienceId: '',
      audienceName: '',
      externalClassStyle: {},
      sendMessageCallback: function(evt){},
      gotMessageCallback: function(evt){},
      resetUnReadMessageCallback: function(evt){}
    }
    */

    /* public method of plugin */
    var output = {
      settings: settings,
      chatBox: chatBox,
      setTopicId: setTopicId,
      setTopicName: setTopicName,
      setAudienceId: setAudienceId,
      setAudienceName: setAudienceName,
      gotMessage: onReceiveMessage,
      restoreLocal: doRestoreFromLocal,
      scrollDown: doScrollDown
    }

    return output;

  };
}( jQuery ));
