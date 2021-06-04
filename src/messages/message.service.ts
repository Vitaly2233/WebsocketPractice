import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
  ) {}

  @UseGuards(new TokenGuard())
  getAllMessages(client: ISocketClient, roomId: string) {
    // const rooms:MessageDocument[] = await this.messageModel.find({room: roomId});
    // client.emit('')
    console.log('got all messages');
  }
}
