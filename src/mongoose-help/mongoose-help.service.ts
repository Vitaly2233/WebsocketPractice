import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { MessageDocument } from 'src/messages/schema/message.schema';
import { ICreateRoomRes } from './interface/create-room.interface';
import { IMessageFrontend } from 'src/messages/interface/message-frontend';

@Injectable()
export class MongooseHelpService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
    private connectionService: ConnectionService,
  ) {}
}
