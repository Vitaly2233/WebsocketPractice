import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User, UserDocument } from 'src/user/Schema/user.schema';
import { Message } from 'src/messages/schema/message.schema';

export type RoomDocument = Room & Document;

export interface isOnline {
  user?: User | Types._ObjectId;
  status?: boolean;
}

@Schema()
export class Room {
  _id: Types._ObjectId | string;

  @Prop({
    type: String,
    required: true,
    default: 'myRoom',
  })
  roomName: string;

  @Prop({
    default: [],
    type: [{ type: Types._ObjectId }],
    required: true,
    ref: 'user',
  })
  participants: User[] | Types._ObjectId[];

  @Prop({
    default: [],
    required: true,
    ref: 'user',
  })
  isOnline: isOnline[];

  @Prop({
    type: [{ type: Types._ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: Message[] | Types._ObjectId[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.post('save', (error, next, data) => {
  if (error) console.log('error occured in room saving');
});
