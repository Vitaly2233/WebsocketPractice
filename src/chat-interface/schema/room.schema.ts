import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type RoomDocument = Room & mongoose.Document;

@Schema()
export class Room {
  @Prop()
  participants: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'message',
    default: [],
  })
  messages: string[];

  @Prop()
  unread: [
    {
      roomId: string;
      counter: number;
    },
  ];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
