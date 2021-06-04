// const auth = new Vue({
//   el: '#auth',
//   data: {
//     status: '',
//     username: '',
//     password: '',
//   },
//   methods: {
//     async login() {
//       const data = {
//         username: this.username,
//         password: this.password,
//       };
//       const response = await fetch('http://localhost:8080/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });
//       if (response.status == 404 || response.status == 400) {
//         return (this.status = 'invalid username or password');
//       }
//       const token = await response.json();
//       if (token.statusCode === 404) return this.status('user is not found');
//       document.cookie = 'token=' + token.access_token;
//       interface.setInterface();
//     },

//     async register() {
//       const data = {
//         username: this.username,
//         password: this.password,
//       };
//       const result = await fetch('http://localhost:8080/auth/registration', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });
//       if (result.status == 400)
//         return (this.status =
//           'password must contain from 4 to 16 symbols, username too');
//       this.status = 'success';
//     },
//   },
// });

// const interface = new Vue({
//   el: '#interface',
//   data: {
//     usernames: '',
//     username: '',
//     status: '',
//     socket: '',
//   },
//   methods: {
//     async setInterface() {
//       this.username = auth.username;
//       this.getChats();
//       document.getElementById('auth').hidden = true;
//       document.getElementById('room').hidden = true;
//       document.getElementById('interface').hidden = false;
//     },

//     async getChats() {
//       this.socket = await io('http://localhost:8080/');
//       if (!this.socket)
//         return (interface.status =
//           "can't open the chat, you're probably not authorized");

//       this.

//       const chats = await result.json();
//       Object.entries(chats).map((chats) => {
//         const roomId = chats[0];
//         $('#chats').empty();
//         const newButton = document.createElement('button');
//         newButton.className = 'chats-button ' + roomId;
//         newButton.innerHTML = chats[1];
//         newButton.addEventListener('click', this.openChat);
//         document.body.appendChild(newButton);
//       });
//     },
//     async openChat(mouse) {
//       document.cookie = 'currentRoom=' + mouse.path[0].className.split(' ')[1];
//       document.cookie = 'username=' + this.username;
//       room.createSockets();
//     },

//     async findUsers() {
//       const users = this.usernames.split(' ');
//       const result = await (
//         await fetch('http://localhost:8080/interface/find_users', {
//           method: 'POST',
//           body: JSON.stringify(users),
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         })
//       ).json();
//       if (result.statusCode === 404)
//         return (this.status = 'cannot find the users');
//       this.getChats();
//     },
//   },
// });

// const chat = new Vue({
//   el: '#chat',
//   data: {
//     name: '',
//     text: '',
//     messages: [],
//     participants: [],
//     socket: null,
//   },
//   methods: {
//     openChat() {
//       document.getElementById('auth').hidden = true;
//       const buttons = document.getElementsByClassName('chats-button');
//       for (let button of buttons) {
//         button.hidden = true;
//       }
//       document.getElementById('interface').hidden = true;
//       document.getElementById('chat').hidden = false;
//     },

//     deleteAllMessages() {
//       this.socket.emit('deleteAllMessages');
//     },

//     sendMessage() {
//       if (this.validateInput()) {
//         this.socket.emit('sendMessage', this.text);
//         this.text = '';
//       }
//     },
//     receivedMessage(message) {
//       this.messages.push(message);
//     },
//     validateInput() {
//       return this.text.length > 0;
//     },

//     async createSockets() {
//       this.socket.on('getData', (data) => {
//         this.participants = data.participants;
//         const messages = data.messagesInRoom;
//         for (const message of messages) {
//           this.receivedMessage(message);
//         }
//       });

//       this.socket.on('sendMessage', (message) => {
//         this.receivedMessage(message);
//       });

//       this.socket.on('deleteAllMessages', (message) => {
//         this.messages = [];
//       });

//       this.openChat();
//     },

//     closeChat() {
//       this.socket.disconnect();
//       interface.setInterface();
//     },
//   },
// });

const test = new Vue({
  el: '#test',
  data: {
    socket: '',
  },
  methods: {
    async testGettingImages() {
      this.socket = await io('http://localhost:8080/');
      this.socket.emit('test2');
      this.socket.on('newError', (data) => {
        console.log(data);
      });
    },
  },
});
