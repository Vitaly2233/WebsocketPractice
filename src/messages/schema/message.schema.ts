import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Types._ObjectId, ref: 'room', required: true })
  room: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
