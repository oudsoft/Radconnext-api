/*test-sip.js*/
// Create our JsSIP instance and run it:

//var socket = new JsSIP.WebSocketInterface('wss://192.168.99.9:8089/ws');
var socket = new JsSIP.WebSocketInterface('wss://202.28.68.6:8089/ws');
//var socket = new WebSocket('wss://radconnext.me:8089/ws'/*, { rejectUnauthorized: false }*/);
var configuration = {
  sockets  : [ socket ],
  authorization_user: '2002',
  uri      : 'sip:2002@202.28.68.6',
  password : 'qwerty2002',
  ws_servers        : 'wss://202.28.68.6:8089/ws',
  realm             : '202.28.68.6',
  display_name      : '2002',
  contact_uri       : 'sip:2002@202.28.68.6'
};
socket.onmessage = function(msgEvt){
  let data = JSON.parse(msgEvt.data);
  console.log(data);
}

var ua = new JsSIP.UA(configuration);

ua.on('connected', function(e){
  console.log('Your are ready connected to your socket.', e);
});

ua.on('registered', function(e){
  console.log('Your are ready registered.', e);
});

ua.on('unregistered', function(e){
  console.log('Your are ready unregistered.', e);
});

ua.on('registrationFailed', function(e){
  console.log('Your are registrationFailed.', e);
});

ua.on('disconnected', function(e){
  console.log('Your are ready dis-connected.', e);
});

ua.start();

// Register callbacks to desired call events
var eventHandlers = {
  'progress': function(e) {
    console.log('call is in progress');
  },
  'failed': function(e) {
    console.log('call failed with cause: ', e/*.data.cause*/);
  },
  'started': function(e){
    console.log('started');
    var rtcSession = e.sender;
    if (rtcSession.getRemoteStreams().length > 0) {
      console.log(rtcSession.getRemoteStreams());
      //remoteView.src = window.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
    }
  },
  'newRTCSession': function(data) {
    var session = data.session;
    if(session.direction === 'outgoing'){
      console.log('stream outgoing  -------->');
      session.on('connecting', function() {
        console.log('CONNECT');
      });
      session.on('peerconnection', function(e) {
        console.log('1accepted');
      });
      session.on('ended', console.log('completeSession'));
      session.on('failed', console.log('completeSession'));
      session.on('accepted',function(e) {
        console.log('accepted')
      });
      session.on('confirmed',function(e){
        console.log('CONFIRM STREAM');
      });
    }
  },
  'ended': function(e) {
    console.log('call ended with cause: ', e/*.data.cause*/);
  },
  'confirmed': function(e) {
    console.log('call confirmed');
  }
};

var options = {
  'eventHandlers': eventHandlers,
  //'mediaConstraints' : { 'audio': true, 'video': false }
   'mediaType': { 'audio': true, 'video': false }
};

//var session = ua.call('sip:2000@202.28.68.6', options);

var session = ua.call('0835077746', options);
console.log(session);

session.on('addstream',function(evt) {
  console.log('Reached in Add Stream', evt)
  document.getElementById('RemoteAudio').src = window.URL.createObjectURL(evt.stream)
})
//https://gist.github.com/echohes/a15fcef59e78271d7a3acb0df480b6b6
//https://github.com/versatica/JsSIP/issues/545
//https://gist.github.com/dtolb/79e813d45fac6488e4c67993b393ddda

var callOptions = {
  mediaConstraints: {
    audio: true, // only audio calls
    video: false
  }
};

ua.on("newRTCSession", function(data){
    var session = data.session;

    if (session.direction === "incoming") {
        // incoming call here
        session.on("accepted",function(){
            // the call has answered
        });
        session.on("confirmed",function(){
            // this handler will be called for incoming calls too
        });
        session.on("ended",function(){
            // the call has ended
        });
        session.on("failed",function(){
            // unable to establish the call
        });
        session.on('addstream', function(e){
            // set remote audio stream (to listen to remote audio)
            // remoteAudio is <audio> element on page
            var remoteAudio = document.getElementById("RemoteAudio");
            remoteAudio.src = window.URL.createObjectURL(e.stream);
            remoteAudio.play();
        });

        // Answer call
        session.answer(callOptions);

        // Reject call (or hang up it)
        session.terminate();
    }
});
