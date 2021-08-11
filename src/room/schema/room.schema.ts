import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Message } from 'src/messages/schema/message.schema';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  _id: Types._ObjectId | string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    default: [],
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    ref: 'user',
  })
  participants: User[] | Types._ObjectId[];

  @Prop({
    required: true,
    ref: 'user',
  })
  online: User[] | Types._ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: Message[] | Types._ObjectId[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
