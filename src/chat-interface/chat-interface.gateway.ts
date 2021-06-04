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
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageToClient } from 'src/messages/dto/message-to-client.dto';
import { MessageDocument } from 'src/messages/schemas/message.schema';
import { ConnectionsService } from './connection.service';
import { RoomDocument } from './shemas/room.schema';

@UseGuards(TokenGuard)
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

  async handleConnection(client: ISocketClient) {
    await this.connectionsService.handleConnection(client);
  }
  async handleDisconnect(client: ISocketClient) {
    // await this.connectionsService.deleteActiveConnected(client);
    // console.log('user ', client.id, ' is disconected');
  }

  @SubscribeMessage('findUsers')
  async findUsers(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() participants: string[],
  ): Promise<any> {
    // const { username } = client.userData;
    // participants.push(username);
    // const newRoom = new this.roomModel({
    //   participants: participants,
    // });
    // for (const participant of participants) {
    // }
  }

  @SubscribeMessage('connectToTheRoom')
  connectToTheRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() roomId: string[],
  ) {
    console.log('connected to the room');
  }

  @SubscribeMessage('test')
  async test() {
    // const res = await this.userModel.findById('60b781f8c12d612b78872abf');
    // const ress = await res.populate('rooms');
  }
}

function hasDuplicates(arr: string[]) {
  return new Set(arr).size !== arr.length;
}
