import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Message } from 'src/messages/schema/message.schema';

@Injectable()
export class ServerService {
  @WebSocketServer() server;

  sendMessageToRoom(roomName: string, message: Message) {
    this.server.to(roomName).emit('newMessage', message);
  }
}
