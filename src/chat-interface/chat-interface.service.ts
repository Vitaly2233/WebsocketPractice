import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageService } from 'src/messages/message.service';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { RoomDocument } from './schema/room.schema';

@Injectable()
export class ChatInterfaceService {
  private activeConnected: string[] = [];

  constructor(
    private jwtService: JwtService,
    private messsageService: MessageService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async handleConnection(client: ISocketClient) {
    // if user is already connecteed to this room, add checking if he's in the room
    // const cookie: string | undefined = client?.handshake?.headers?.cookie;
    // if (!cookie)
    //   return client.emit('newError', { message: 'cookie is missing' });
    // const token: string | undefined = getCookieValueByName(cookie, 'token');

    // let verifiedData: ITokenData;
    // try {
    //   verifiedData = await this.jwtService.verify(token);
    // } catch (e) {
    //   return client.emit('newError', { message: "you're not authorized" });
    // }

    const username = 'qqqq';
    if (!username)
      return client.emit('newError', { message: 'cookie is missing' });

    const user = await this.userModel.findOne({ username: username });
    if (!user) return client.emit('newError', { message: 'user is not found' });

    const userPopulated = await user.populate('rooms').execPopulate();
    console.log(userPopulated);

    // this.activeConnected.push(client.id);
    // const roomId: string = getCookieValueByName(cookie, 'currentRoom');
    // if (roomId) {
    //   // if user is already connecteed to this room, add checking if he's in the room
    //   this.messsageService.getAllMessages(client, 'da');
    // }
    // const participants: Record<string, string[]> = {};
    // for (const userRoomId of userRoomIds) {
    //   const result: RoomDocument = await this.roomModel.findById(userRoomId);
    //   if (!result)
    //     return client.emit('newError', {
    //       message: "you're not into the room",
    //     });
    //   participants[userRoomId] = result.participants;
    // }
    // client.emit('getChats', participants);
  }

  async deleteActiveConnected(client: ISocketClient) {
    client.rooms = {};
    await client.join(client.id);
  }
}
