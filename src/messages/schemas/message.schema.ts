import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop()
  name: string;

  @Prop()
  text: string;

  @Prop()
  date: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
