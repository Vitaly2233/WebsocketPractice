import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Room } from 'src/room/schema/room.schema';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'room', required: true })
  room: Types._ObjectId | Room;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
