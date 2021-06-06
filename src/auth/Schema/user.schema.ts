import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Room } from 'src/chat-interface/schema/room.schema';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
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
  rooms: mongoose.PopulatedDoc<Room | string>[];

  @Prop()
  unread: [
    {
      roomId: string;
      counter: number;
    },
  ];
}

export const UserSchema = SchemaFactory.createForClass(User);
