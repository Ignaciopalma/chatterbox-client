// YOUR CODE HERE:

// PARSE_APP_ID: wPfavNOxOKTzlXiMq9r226nSo5Vl5aMFfEcvAupE
// PARSE_API_KEY: eCGqXWtDjoZofGzf785KvSODrUrXURbL6JCQqaHj

//  Robot server
//  App ID: 2ef3d2c5e858caa0f408245343948b1473cac982
//  API Key: c4585920fd5f002e861bcb48a7f9a61f8893ee43

// 1. create a chat app
// 2. everybody can post
// 3. conect api
// 4. post to that api
// 5. get what ever is being updated
// 6. create chat rooms
// 7. user can change rooms
// 8. allow users to make friends by ci¡licking on the name
// 9. all messages send by friends should be displayed bold

//var escape = require('escape-html');
var username = window.location.search.slice(10);
var friends = [];
var roomname;
var roomList = {lobby: true};

var app = {
  server: 'http://parse.hrr.hackreactor.com/chatterbox/classes/messages',

  init: function() {
    roomname = 'lobby';

    app.fetch(function(messages) {
      for (var i = messages.length - 1; i >= 0; i--) {
        app.renderMessage(messages[i]);
      }
    });

    setInterval(function() {
      app.fetch.call(this, function(messages) {
        if (messages.length) {
          if ($('#chats').children().length === 0 || $('#chats').children()[0].id !== messages[0].objectId) {
            for (var i = messages.length - 1; i >= 0; i--) {
              app.renderMessage(messages[i]);
            }
          }
        }
      });
    }, 1000);
  },

  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function() {
        app.fetch(function(messages) {
          for (var i = messages.length - 1; i >= 0; i--) {
            app.renderMessage(messages[i]);
          }
        });
      },
      error: function() {
        console.log(arguments);
      }
    });
  },

  fetch: function(callback) {
    $.ajax({
      url: app.server,
      type: 'GET',
      data: 'order=-createdAt',
      success: function(messages) {
        app.renderRoomList(messages.results);
        var roomMessages = messages.results.filter(function(message) {
          return (message.roomname === roomname || (message.roomname === undefined && roomname === 'lobby'));
        });
        callback(roomMessages);
      },
      error: function() {
        console.log('request failed.');
      }
    });
  },

  clearMessages: function() {
    $('#chats').children().remove();
  },

  renderMessage: function(message) {
    var $chat = $('<div class="messageDiv"/>').attr('id', message.objectId);
    var $username = $('<p class="username"/>');
    $username.text(message.username + ': ').appendTo($chat);
    var $message = $('<p id="message-feed"/>');
    $message.text(message.text).appendTo($chat);

    app.handleUsernameClick(message.objectId);

    if (friends.includes(message.username + ':')) {
      $('#' + message.objectId).addClass('friend');
    }

    $('#chats').prepend($chat);
  },

  renderRoomList: function(messages) {
    messages.forEach(function(message) {
      if (!roomList[message.roomname]) {
        roomList[message.roomname] = true;
        app.renderRoom(message.roomname);
      }
    });
  },

  renderRoom: function(name) {
    $('#roomSelect').append("<option>" + name + "</option>");
  },

  handleSubmit: function() {
    var text = $('#message')[0].value;
    app.send({username: username, text: text, roomname: roomname || 'lobby'});
    $('#message')[0].value = '';

  },

  handleUsernameClick: function(ID) {
    $('#' + ID).children('.username').on('click', function(user) {
      friends.push(this.innerHTML);
    });
  }
};

$(document).ready(function() {
  app.init();

  $('#send').on('submit', function(event) {
    event.preventDefault();
    app.handleSubmit();
  });

  $('#roomSelect').on('change', function() {
    roomname = $('#roomSelect')[0].value;

    if ( roomname === 'new-room' ) {
      roomname = prompt('Type the room name');
      if (roomname) {
        $('#roomSelect').append('<option selected>' + roomname + '</option>');
      } else {
        roomname = 'lobby';
      }
    }

    $('#chats').children().remove();

    app.fetch(function(messages) {
      for (var i = messages.length - 1; i >= 0; i--) {
        app.renderMessage(messages[i]);
      }
    });
  });

  $('.username').on('click', function(user) {
    friends.push(user.innerHTML);
  });
});


