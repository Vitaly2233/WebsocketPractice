const app = new Vue({
  el: '#app',
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
  },
  created() {
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

    this.socket.on('test', () => {
      console.log('test is called');
    });
  },
});
