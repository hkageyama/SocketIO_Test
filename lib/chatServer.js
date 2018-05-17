const socketio = require('socket.io');

let chatIo;
let statusIo;

let chatServer = {
  connectSocket: function(server, app) {

    socketioServer = socketio.listen(server)
    statusIo = socketioServer.of('/status');
    statusIo.on('connection', function (socket) {

      socket.on('join room status', (roomId) => {
        socket.join(roomId);
      });

      //【サーバー リスナー＠status】２．NameSpaceを跨いでメッセージ送信
      socket.on('back over namespace from ns-status', () => {
          chatIo.emit('front over namespace from ns-status', 'status->chat msg to all');
      });

      //【サーバー リスナー＠status】３．部屋＋NameSpaceを跨いでメッセージ送信
      socket.on('back over mix from ns-status', (roomId) => {
        let toRoom = '1';
        if (roomId == toRoom) toRoom = '2';
        chatIo.to(toRoom).emit('front over mix from ns-status', 
          'status->chat msg to rm#' + toRoom + ' from rm#' + roomId, toRoom);
      });
      
    });

    chatIo = socketioServer.of('/chat');
    chatIo.on('connection', function (socket) {

      socket.on('back chat message', (roomId, value) => {
          chatIo.to(roomId).emit('front chat message',
            socket.id + '：' + value, roomId, socket.handshake.query['userType']);
      });

      socket.on('join room chat', (roomId) => {
          socket.join(roomId);
          chatIo.to(roomId).emit('front refresh', roomId, socket.handshake.query['userType']);
      });

      //【サーバー リスナー＠chat】１．部屋を跨いでメッセージ送信
      socket.on('back over room', (roomId) => {
          let toRoom = '1';
          if (roomId == '1') toRoom = '2';
          chatIo.to(toRoom).emit('front over room',
            'msg to rm#' + toRoom + ' from rm#' + roomId, toRoom);
      });

      //【サーバー リスナー＠chat】２．NameSpaceを跨いでメッセージ送信
      socket.on('back over namespace from ns-chat', () => {
          statusIo.emit('front over namespace from ns-chat', 'chat->status msg to all');
      });

      //【サーバー リスナー＠chat】３．部屋＋NameSpaceを跨いでメッセージ送信
      socket.on('back over mix from ns-chat', (roomId) => {
          let toRoom = '1';
          if (roomId == toRoom) toRoom = '2';
          statusIo.to(toRoom).emit('front over mix from ns-chat',
            'chat->status msg to rm#' + toRoom + ' from rm#' + roomId, toRoom);
      });

    });
  },

  openAgentForm: function(res, chatId) {
    let obj = [];
    for (let i = 0; i < 2; i++) {
      obj.push({'room_id': i + 1, 'visitor_id': 'test_' + (i + 1)});
    }
    res.render('agent', {lists: obj, chatId:chatId});
  }
}
module.exports = chatServer;
