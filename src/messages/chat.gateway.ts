import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas/message.schema';
import { MessageDto } from './dto/message.dto';
import { UseGuards } from '@nestjs/common';
// import { ChatGuard } from './chat.guard';
import { UserDocument } from 'src/auth/dto/user.schema';
// import { RoomDocument } from './schemas/rooms.schema';
// import { ActiveConnectionsService } from './active-connections.service';

// @UseGuards(ChatGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  constructor(
    @InjectModel('ms') private messages: Model<MessageDocument>, // @InjectModel('room') private rooms: Model<RoomDocument>,
  ) // @InjectModel('user') private users: Model<UserDocument>,
  // private activeConnections: ActiveConnectionsService,
  {}

  async handleConnection(client: any, ...args: any[]) {
    // this.activeConnections.addConnection(client);
    // console.log('Active connectted users', this.activeConnections.getActive());
  }

  @WebSocketServer() server: Server;

  // @SubscribeMessage('getUsersRooms')
  // async getUserRooms(@ConnectedSocket() client) {
  //   const user = await this.users.findOne({ username: client.data.username });
  //   const roomIds = user.rooms;
  //   const userRooms: Array<string[]> = [];

  //   for (const roomId of roomIds) {
  //     const room = await this.rooms.findById(roomId);
  //     const participantsOfTheRoom = room?.participants;

  //     if (!participantsOfTheRoom) throw new WsException('user is not found');

  //     userRooms.push(participantsOfTheRoom);
  //   }

  //   client.emit('getUsersRooms', userRooms);
  // }

  // @SubscribeMessage('findUSer')
  // async findUser(
  //   @ConnectedSocket() client,
  //   @MessageBody() participants: string[],
  // ) {
  //   participants.push(client.data.username);
  //   if (hasDuplicates(participants))
  //     throw new WsException('Payload has dublicates');
  //   const newRoom = new this.rooms({
  //     participants: participants,
  //   });

  //   console.log(participants);

  // adding to each user new room and if they're connected, sending it to them
  // participants.forEach(async (otherUser) => {
  //   try {
  //     await this.users.findOneAndUpdate(
  //       {
  //         username: otherUser,
  //       },
  //       { $addToSet: { rooms: newRoom._id } },
  //     );
  //   } catch (e) {
  //     return;
  //   }
  //   // if user is now connected, sending that they're connected to the new room also to the client
  //   if (this.activeConnections.getActive()[otherUser]) {
  //     this.server
  //       .to(this.activeConnections.getActive()[otherUser])
  //       .emit('addNewRoom', newRoom.participants);
  //   }
  // });
  // await newRoom.save();
  // }
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload): void {
    new this.messages({
      name: payload.name,
      text: payload.text,
      date: Date.now(),
    }).save();
    this.server.emit('msgToServer', payload);
  }

  @SubscribeMessage('getAllMessages')
  async getAllMessages(@ConnectedSocket() client) {
    const messages: MessageDto[] = await this.messages.find({});
    client.emit('getAllMessages', messages);
  }

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(@ConnectedSocket() client) {
    await this.messages.deleteMany({});
    this.server.emit('deleteAllMessages');
  }
}

function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}
