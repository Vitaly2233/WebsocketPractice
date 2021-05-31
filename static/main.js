const interface = new Vue({
  el: '#interface',
  data: {
    status: '',
    username: '',
    password: '',
  },
  methods: {
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
      if (response.status == 404) {
        this.status = 'invalid username or password';
      }
      const token = await response.json();
      document.cookie = 'token=' + token.access_token;
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

const chat = new Vue({
  el: '#chat',
  data: {
    title: 'chat',
    name: '',
    text: '',
    messages: [],
    socket: null,
  },
  methods: {
    sendMessage() {
      if (this.validateInput()) {
        const message = {
          name: this.name,
          text: this.text,
        };
        this.socket.emit('msgToServer', message);
        this.text = '';
      }
    },
    receivedMessage(message) {
      this.messages.push(message);
    },
    validateInput() {
      return this.name.length > 0 && this.text.length > 0;
    },

    deleteAllMessages() {
      this.socket.emit('deleteAllMessages');
    },

    createSockets() {
      this.socket = io('http://localhost:8080');

      this.socket.on('sendMesssageToAll', (message) => {
        this.receivedMessage(message);
      });

      this.socket.on('getAllMessages', (data) => {
        this.messages = data;
      });

      this.socket.on('deleteAllMessages', () => {
        this.messages = [];
      });
    },
  },
});
