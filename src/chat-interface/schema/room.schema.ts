import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { User } from 'src/auth/Schema/user.schema';
import { Message } from 'src/messages/schema/message.schema';
import { ISocketClient } from '../interface/socket-client';

export type RoomDocument = Room & mongoose.Document;

export interface isOnline {
  user?: mongoose.PopulatedDoc<User | mongoose.Schema.Types.ObjectId | string>;
  status?: boolean;
}

@Schema()
export class Room {
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
    required: true,
    ref: 'user',
  })
  isOnline: isOnline[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: mongoose.PopulatedDoc<Message | mongoose.Schema.Types.ObjectId>[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.post('save', (error, next, data) => {
  if (error) console.log('error occured');
});

const handleE11000 = function (error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
};

RoomSchema.post('save', handleE11000);
RoomSchema.post('update', handleE11000);
RoomSchema.post('findOneAndUpdate', handleE11000);
RoomSchema.post('insertMany', handleE11000);
