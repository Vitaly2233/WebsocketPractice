let socket = '';

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
      socket = await io('http://localhost:8080/');
      setSocket();
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
      // buttons with rooms
      $('#chats').empty();
      for (const chat of chats) {
        const [roomName, roomData] = Object.entries(chat)[0];

        const newButton = document.createElement('button');
        newButton.id = 'chats';
        newButton.className = `${roomData.id}`;
        newButton.innerHTML = roomName;
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
      const buttons = document.querySelectorAll('#chats');
      for (let button of buttons) {
        button.hidden = true;
      }
      document.getElementById('interface').hidden = true;
      document.getElementById('room').hidden = false;
    },

    deleteAllMessages() {
      socket.emit('deleteAllMessages');
    },

    sendMessage() {
      if (this.validateInput()) {
        console.log(this.text);
        // socket.emit('sendMessage', this.text);
        // this.text = '';
      }
    },
    receivedMessage(message) {
      this.messages.push(message);
    },
    validateInput() {
      return this.text.length > 0;
    },

    // closeChat() {
    //   socket.disconnect();
    //   interface.setInterface();
    // },
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

function getCookieValueByName(cookie, name) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
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

  socket.on('getUsername', (username) => {
    if (!username) auth.setAuth();
    interface.username = username;
  });

  socket.on('newError', (error) => {
    console.log(error);
  });

  socket.on('sendMessage', (message) => {
    room.receivedMessage(message);
  });

  socket.on('deleteAllMessages', (message) => {
    room.messages = [];
  });

  return true;
};
