let socket = null;

const auth = new Vue({
  el: '#auth',
  data: {
    status: '',
    username: '',
    password: '',
  },

  methods: {
    async setAuth() {
      document.getElementById('auth').hidden = false;
      document.getElementById('room').hidden = true;
      document.getElementById('interface').hidden = true;
    },

    async login() {
      const data = {
        username: this.username,
        password: this.password,
      };
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (
        response.status == 404 ||
        response.status == 400 ||
        response.status == 403
      ) {
        return (this.status = 'invalid username or password');
      }
      const token = await response.json();
      if (token.statusCode === 404) return this.status('user is not found');
      document.cookie = 'token=' + token.access_token;
      interface.setInterface();
    },

    async register() {
      const data = {
        username: this.username,
        password: this.password,
      };
      const result = await fetch('http://localhost:8080/auth/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (result.status == 400)
        return (this.status =
          'password must contain from 4 to 16 symbols, username too');
      this.status = 'success';
    },
  },
});

const interface = new Vue({
  el: '#interface',
  data: {
    usernames: '',
    roomName: '',
    username: '',
    status: '',
    connected: false,
  },

  created() {
    this.setInterface();
  },
  methods: {
    async setInterface() {
      if (!socket) {
        console.log('socket');
        socket = await io('http://localhost:8080/');
        setSocket();
      }
      socket.emit('getUserRooms');
      socket.emit('getUsername');
      document.getElementById('auth').hidden = true;
      document.getElementById('room').hidden = true;
      document.getElementById('interface').hidden = false;
    },
    async findUsers() {
      const users = this.usernames.split(' ');
      await socket.emit('createNewRoom', {
        participantUsernames: users,
        roomName: this.roomName,
      });
    },

    async openChat(mouse) {
      document.cookie = 'currentRoom=' + mouse.path[0].className;
      await socket.emit('connectToTheRoom');
      room.openChat();
    },

    async getChats(chats) {
      console.log(chats);
      // buttons with rooms
      $('#chats').remove();
      for (const chat of chats) {
        const [roomName, roomData] = Object.entries(chat)[0];

        const newButton = document.createElement('button');
        newButton.id = 'chats';
        console.log(roomData.id);
        newButton.className = `${roomData.id}`;
        newButton.innerHTML = roomName + ': ' + roomData.unread;
        newButton.addEventListener('click', this.openChat);
        document.body.appendChild(newButton);
      }
    },
  },
});

const room = new Vue({
  el: '#room',
  data: {
    name: '',
    text: '',
    messages: [],
    participants: [],
  },
  methods: {
    openChat() {
      document.getElementById('auth').hidden = true;
      $('#chats').remove();
      document.getElementById('interface').hidden = true;
      document.getElementById('room').hidden = false;
    },

    deleteAllMessages() {
      socket.emit('deleteAllMessages');
    },

    sendMessage() {
      if (this.validateInput()) {
        console.log(this.text);
        socket.emit('sendMessage', this.text);
        this.text = '';
      }
    },
    receivedMessage(message) {
      this.messages.push(message);
    },
    validateInput() {
      return this.text.length > 0;
    },

    closeChat() {
      deleteCookie('currentRoom');
      socket.emit('closeRoom');
      interface.setInterface();
    },
  },
});

// const test = new Vue({
//   el: '#test',
//   data: {
//     socket: '',
//   },
//   methods: {
//     async testGettingImages() {
//       socket = await io('http://localhost:8080/');
//       socket.emit('getUserRooms');
//       socket.on('getUserRooms', (data) => {
//         console.log('got all rooms: ', data);
//       });
//     },
//   },
// });

function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}
function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
}
function deleteCookie(name) {
  setCookie(name, '', -1);
}

const setSocket = () => {
  socket.on('connect', () => {
    console.log('connect');
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    auth.setAuth();
  });

  socket.on('getUserRooms', (data) => {
    interface.getChats(data);
  });

  socket.on('getAllMessages', (messages) => {
    room.messages = [];
    messages.forEach((element) => {
      room.receivedMessage(element);
    });
  });

  socket.on('getUsername', (username) => {
    if (!username) auth.setAuth();
    interface.username = username;
  });

  socket.on('newError', (error) => {
    console.log(error);
  });

  socket.on('newMessage', (message) => {
    room.receivedMessage(message);
  });

  socket.on('deleteAllMessages', (message) => {
    room.messages = [];
  });

  return true;
};
