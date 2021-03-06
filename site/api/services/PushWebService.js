var _ = require('lodash');
var io = require('socket.io').listen(3000);

var userSockets = {};

module.exports = {
  init: function () {
    initPushSocketServer();
  },

  pushSpecialUserWebb: function (username, msg) {
    if (userSockets.hasOwnProperty(username)) {
      _.forEach(userSockets[username], function (socketPair) {
        _.values(socketPair)[0].emit('push_to_' + username, {data: msg});
      })
    }
  },
  pushDevStatusChangelUserWeb: function (username, msg) {
      console.log('PushWebService_pushDevStatusChangelUserWeb 执行了....');
      console.log(username+' '+userSockets.hasOwnProperty(username));//false
      if (userSockets.hasOwnProperty(username)) {
          _.forEach(userSockets[username], function (socketPair) {
              _.values(socketPair)[0].emit('dev_push_to_' + username, {data: msg});
              console.log("data:",msg);
          })
      }
  }
}

function initPushSocketServer() {
  io.sockets.on('connection', function (socket) {
    socket.on('login', function (obj) {
      var username = obj.username;
      console.log('login ' + username);
      socket.name = username;
      //not included. add
      if (!userSockets.hasOwnProperty(username)) {
        userSockets[username] = {};
      }
      if (!userSockets[username].hasOwnProperty(socket.id)) {
        userSockets[username][socket.id] = socket;
      }
    });

    socket.on('disconnect', function () {
      if(undefined != socket.name && userSockets.hasOwnProperty(socket.name)){
        if (userSockets[socket.name].hasOwnProperty(socket.id)) {
          delete userSockets[socket.name][socket.id];
          console.log('delete ' + socket.name + ' ' + socket.id);
        }
      }
    })
  });
}