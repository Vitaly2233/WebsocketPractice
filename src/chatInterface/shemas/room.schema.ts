import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop()
  participants: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'ms',
    default: [],
  })
  messages: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
