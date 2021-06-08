import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import * as mongoose from 'mongoose';
import { Room } from 'src/chat-interface/schema/room.schema';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
  @Prop({
    unique: true,
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  })
  _id: mongoose.ObjectId;

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
  rooms: mongoose.PopulatedDoc<Room | mongoose.ObjectId>[];

  @Prop()
  unread: mongoose.PopulatedDoc<mongoose.ObjectId | mongoose.Number>[];
}

export const UserSchema = SchemaFactory.createForClass(User);
