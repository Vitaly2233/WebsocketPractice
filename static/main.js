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
      console.log('setting token');
      document.cookie = 'token=' + token.access_token;
      await interface.setInterface();
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
      if (!socket?.connected) {
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
      console.log('chat is opened');
      document.cookie = 'currentRoom=' + mouse.path[0].className;
      console.log('cookies on oppening chats', document.cookie);
      socket.emit('connectToTheRoom');
    },

    async getChats(chats) {
      // buttons with rooms
      $('#chats').remove();
      for (const chat of chats) {
        const [roomName, roomData] = Object.entries(chat)[0];

        const newButton = document.createElement('button');
        newButton.id = 'chats';
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
      console.log('deleting cookie');
      console.log(document.cookie);
      delete_cookie('currentRoom', '', '');
      console.log(document.cookie);
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
// })

const setSocket = () => {
  socket.on('connect', () => {
    console.log('connect');
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    auth.setAuth();
  });

  socket.on('getUserRooms', async (data) => {
    await interface.getChats(data);
  });

  socket.on('getAllMessages', (messages) => {
    room.messages = [];
    messages.forEach((element) => {
      room.receivedMessage(element);
    });
    room.openChat();
  });

  socket.on('getUsername', (username) => {
    console.log('gotted username');
    if (!username) auth.setAuth();
    interface.username = username;
  });

  socket.on('getParticipants', (participants) => {
    room.participants = participants.join();
  });

  socket.on('newError', (error) => {
    console.log(error);
  });

  socket.on('newMessage', (message) => {
    console.log('got new message', message);
    if (document.getElementById('interface').hidden) {
      room.receivedMessage(message);
    }
    socket.emit('getUserRooms');
  });

  socket.on('deleteAllMessages', (message) => {
    room.messages = [];
  });

  return true;
};

function delete_cookie(name, path, domain) {
  if (get_cookie(name)) {
    document.cookie =
      name +
      '=' +
      (path ? ';path=' + path : '') +
      (domain ? ';domain=' + domain : '') +
      ';expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}

function get_cookie(name) {
  return document.cookie.split(';').some((c) => {
    return c.trim().startsWith(name + '=');
  });
}
