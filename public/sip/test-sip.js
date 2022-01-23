/*test-sip.js*/
// Create our JsSIP instance and run it:

//var socket = new JsSIP.WebSocketInterface('wss://192.168.99.9:8089/ws');
var socket = new JsSIP.WebSocketInterface('wss://radconnext.tech');
var configuration = {
  sockets  : [ socket ],
  uri      : 'sip:2000@radconnext.me',
  password : 'qwerty2000'
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
  'ended': function(e) {
    console.log('call ended with cause: ', e/*.data.cause*/);
  },
  'confirmed': function(e) {
    console.log('call confirmed');
  }
};

var options = {
  'eventHandlers'    : eventHandlers,
  'mediaConstraints' : { 'audio': true, 'video': true }
};

var session = ua.call('sip:2001@radconnext.me', options);
