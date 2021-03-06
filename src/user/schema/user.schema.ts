import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import { Types, Document } from 'mongoose';
import { Room } from 'src/room/schema/room.schema';
import * as mongoose from 'mongoose';

type RoomId = string;
type count = number;

export type UnreadMessage = Record<RoomId, count>;

@Schema()
export class User {
  _id: Types._ObjectId | string;

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
  rooms: Room[] | Types._ObjectId[];

  @Prop({ default: {}, type: Object })
  unread: UnreadMessage;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
