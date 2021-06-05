import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/Schema/user.schema';
import { Message } from 'src/messages/schema/message.schema';

export type RoomDocument = Room & mongoose.Document;

@Schema()
export class Room {
  @Prop({
    default: [],
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    ref: 'user',
  })
  participants: mongoose.PopulatedDoc<User | string>[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: mongoose.PopulatedDoc<Message | string>[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
