import { HttpException, Inject, UseGuards } from '@nestjs/common';
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
import { ChatInterfaceGuard } from './chat-interface.guard';
import { ConnectionsService } from './connection.service';
import { RoomDocument } from './shemas/room.schema';

@UseGuards(ChatInterfaceGuard)
@WebSocketGateway()
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private connectionsService: ConnectionsService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>, // @InjectModel('message') private messageModel: Model<MessageDocument>,
  ) {}

  @WebSocketServer() server;

  async handleConnection(client: SocketClientDto) {
    console.log('connected');

    // const { username } = await this.connectionsService.guardForNewConnected(
    //   client,
    // );
    // const roomIds: string[] = (
    //   await this.userModel.findOne({
    //     username: username,
    //   })
    // )?.chats;
    // // eslint-disable-next-line prefer-const
    // let participants: Record<string, string[]> = {};
    // for (const room of roomIds) {
    //   const result = await this.roomModel.findById(room);
    //   participants[room] = result.participants;
    // }
    // client.emit('getChats', participants);
  }
  async handleDisconnect(client: SocketClientDto) {
    // await this.connectionsService.deleteActiveConnected(client);
    // console.log('user ', client.id, ' is disconected');
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
