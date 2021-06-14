import { HttpException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import * as mongoose from 'mongoose';
import { IUserRoom } from 'src/chat-interface/interface/user-rooms.interface';
import { Room } from 'src/chat-interface/schema/room.schema';

export type UnreadMessage = { id: string; count: number };

@Schema()
export class User {
  @Prop({
    unique: true,
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  })
  _id: mongoose.ObjectId | string;

  @IsString()
  @Length(4, 16)
  @Prop({ unique: true })
  username: string;

  @IsString()
  @Length(4, 16)
  @Prop()
  password: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'room',
    default: [],
  })
  rooms: mongoose.PopulatedDoc<IUserRoom | mongoose.ObjectId>[];

  @Prop()
  unread: UnreadMessage[];
}

export type UserDocument = User & mongoose.Document;

export const UserSchema = SchemaFactory.createForClass(User);
