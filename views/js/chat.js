// オブジェクト名
const CONTENT_OBJECT_NAME_HEADER = '#content-';
const MESSAGES_OBJECT_NAME = 'messages';
const HEADER_OBJECT_NAME = 'header';
const INPUT_OBJECT_NAME = 'input';
const ROOM_NO_POSIT = 7;    // ルームリストからRoom#を取得する際の取得開始位置
let cnt = 0;
let myRoom;

// ウィジェットDOM
const DOM_AGENT_WIDGET = "" +
'<div class="content" id="content-">' +
'  <div class="header" name="header"></div>' +
'  <div class="messages" name="messages"></div>' +
'  <div class="form" name="form">' +
'    <input type="text"   class="input" name="input" />' +
'    <input type="button" class="btn" name="btn_fin" value="Fin" />' +
'    <input type="button" class="btn" name="btn_send" value="Snd" />' +
'  </div>' +
'</div>';

$(document).ready(function(){

    chatSocket.on('front chat message', (msg, roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });
    chatSocket.on('front refresh', (roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').empty();
        $(contentDomId).find('[name='+ HEADER_OBJECT_NAME + ']').append('Room # ' + roomId);
        cnt++;
        myRoom = roomId;
    });


    // 【クライアント リスナー＠chat】１．部屋を跨いでメッセージ送信
    chatSocket.on('front over room', (msg, roomId, userType) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });

    // 【クライアント リスナー＠chat&status】２．NameSpaceを跨いでメッセージ送信
    statusSocket.on('front over namespace from ns-chat', (msg) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + myRoom;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });
    chatSocket.on('front over namespace from ns-status', (msg) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + myRoom;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });

    //【クライアント リスナー＠chat&status】３．部屋＋NameSpaceを跨いでメッセージ送信
    statusSocket.on('front over mix from ns-chat', (msg, roomId) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });
    chatSocket.on('front over mix from ns-status', (msg, roomId) => {
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;
        $(contentDomId).find('[name='+ MESSAGES_OBJECT_NAME + ']').append($('<li>').text(msg));
        displayBottom(contentDomId);
    });
    
    /////////////
    // イベント //
    /////////////
    $(document).on('click', '[name=btn_send]', function() {
        let contentDomId = '#' + $(this).parent().parent().attr('id');
        let message = $(this).parent().parent().find('[name=' + INPUT_OBJECT_NAME + ']').val();
        let roomId =  getChildID(contentDomId);
    
        chatSocket.emit('back chat message', roomId, message);
        $(contentDomId).find('[name='+ INPUT_OBJECT_NAME + ']').val('');
    });
    $(document).on('click', '.room_list_div', function(){
        let roomInfo = $(this).text().trim();
        let roomId = roomInfo.
            substr(ROOM_NO_POSIT, roomInfo.indexOf(':') - (ROOM_NO_POSIT + 1)).trim();
        let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;        
        if (cnt) return false;
        createWidget(roomId);
        chatSocket.emit('join room chat', roomId);
        statusSocket.emit('join room status', roomId);
    });

    // 【クリック イベント】１．部屋を跨いでメッセージ送信
    $(document).on('click', '[name=btn_msg]', function(){
        chatSocket.emit('back over room', myRoom);
    });

    // 【クリック イベント】２．NameSpaceを跨いでメッセージ送信
    $(document).on('click', '[name=btn_ns]', function(){
        chatSocket.emit('back over namespace from ns-chat');
        statusSocket.emit('back over namespace from ns-status');
    });

    // 【クリック イベント】３．部屋＋NameSpaceを跨いでメッセージ送信
    $(document).on('click', '[name=btn_mix]', function(){
        chatSocket.emit('back over mix from ns-chat', myRoom);
        statusSocket.emit('back over mix from ns-status', myRoom);
    });

});

// 関数
var createWidget = function(roomId) {
    let contentDomId = CONTENT_OBJECT_NAME_HEADER + roomId;       
    if ($(contentDomId).attr('id') === undefined) {
        let obj = $(DOM_AGENT_WIDGET).appendTo('#parent');
        obj.attr("id", "content-" + roomId);
    }
}
var getChildID = function(val) {
    if (val === undefined || val === null) {
        throw new Error("Error Content DomId is null.");
        return false;
    }
    return val.substr(val.indexOf('-') + 1);
}
var displayBottom = function(domId) {
    $(domId).find('[name='+ MESSAGES_OBJECT_NAME + ']').
        scrollTop($(domId).find('[name='+ MESSAGES_OBJECT_NAME + ']').prop('scrollHeight'));
}
