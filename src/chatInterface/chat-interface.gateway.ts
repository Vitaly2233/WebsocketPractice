import { HttpException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/dto/user.schema';
import { SocketClientDto } from 'src/chatInterface/dto/socket-client.dto';
import { MessageToClient } from 'src/messages/dto/message-to-client.dto';
import { MessageDocument } from 'src/messages/schemas/message.schema';
import { myReq } from './chat-interface.guard';
import { ConnectionsService } from './connection.service';
import { RoomDocument } from './shemas/room.schema';

@WebSocketGateway()
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject() private connectionsService: ConnectionsService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>, // @InjectModel('message') private messageModel: Model<MessageDocument>,
  ) {}

  @WebSocketServer() server;

  async handleConnection(client: SocketClientDto) {
    const { username } = await this.connectionsService.guardForNewConnected(
      client,
    );
    const chatIds: string[] = (
      await this.userModel.findOne({
        username: username,
      })
    )?.chats;
    if (!chatIds) return new HttpException("can't find the user", 404);
    // eslint-disable-next-line prefer-const
    let participants: Record<string, string[]> = {};
    for (const chat of chatIds) {
      const result = await this.roomModel.findById(chat);
      participants[chat] = result.participants;
    }
    client.emit('getChats', participants);
    // using guards for implementation?

    // await client.join(roomId);
    // delete client.rooms[client.id];
    // const messages = await this.messageModel.find({ room: roomId });
    // // eslint-disable-next-line prefer-const
    // let messagesToClient: MessageToClient[] = [];
    // for (const message of messages) {
    //   messagesToClient.push({ text: message.text, username: message.username });
    // }
    // const data = {
    //   participants: participants,
    //   messagesInRoom: messagesToClient,
    // };

    // client.emit('getData', data);
    // console.log('user ', client.id, ' is connected');
  }

  handleDisconnect(client: SocketClientDto) {
    throw new Error('Method not implemented.');
  }
  // @SubscribeMessage('findUsers')
  // async findUsers(
  //   @ConnectedSocket() client: SocketClientDto,
  //   @MessageBody() participants: string[],
  // ): Promise<WsException | FindUserDto> {
  //   const { username } = client.userData;
  //   participants.push(username);
  //   if (hasDuplicates(participants))
  //     throw new WsException('list of users contains dublicates');

  //   const newRoom = new this.roomModel({
  //     participants: [],
  //   });
  //   // eslint-disable-next-line prefer-const
  //   let declinedUsers: string[] = [];
  //   for (const participant of participants) {
  //     const result: UserDocument = await this.userModel.findOneAndUpdate(
  //       { username: participant },
  //       { $addToSet: { chats: newRoom._id } },
  //     );
  //     if (!result) {
  //       declinedUsers.push(participant);
  //       continue;
  //     }
  //     newRoom.participants.push(participant);
  //   }
  //   if (newRoom.participants.length < 2) {
  //     await this.userModel.findOneAndUpdate(
  //       { username: newRoom.participants[0] },
  //       { $pull: { chats: newRoom._id } },
  //     );
  //     throw new HttpException(
  //       'length of valid users must be greather than 1',
  //       404,
  //     );
  //   }
  //   await newRoom.save();

  //   const payload: FindUserDto = {
  //     particiants: participants,
  //     declinedUsers: declinedUsers,
  //   };
  //   this.server.to().emit('findUSer');
  // }
}

function hasDuplicates(arr: string[]) {
  return new Set(arr).size !== arr.length;
}
