import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/Schema/user.schema';
import { Message } from 'src/messages/schema/message.schema';

export type RoomDocument = Room & mongoose.Document;

@Schema()
export class Room {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
  })
  _id: mongoose.Schema.Types.ObjectId | string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    default: 'myRoom',
  })
  roomName: string;

  @Prop({
    default: [],
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    ref: 'user',
  })
  participants: mongoose.PopulatedDoc<User | mongoose.Schema.Types.ObjectId>[];

  @Prop({
    default: [],
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    ref: 'user',
  })
  online: mongoose.PopulatedDoc<User | mongoose.Schema.Types.ObjectId>[];

  @Prop({
    default: [],
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    ref: 'user',
  })
  offline: mongoose.PopulatedDoc<User | mongoose.Schema.Types.ObjectId>[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: mongoose.PopulatedDoc<Message | mongoose.Schema.Types.ObjectId>[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
