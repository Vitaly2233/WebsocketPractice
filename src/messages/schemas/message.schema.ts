import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Room } from 'src/chatInterface/shemas/room.schema';

export type MessageDocument = Message & mongoose.Document;

@Schema()
export class Message {
  @Prop()
  username: string;

  @Prop()
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'room', required: true })
  room: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
