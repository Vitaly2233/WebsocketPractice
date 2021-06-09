import { HttpException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import * as mongoose from 'mongoose';
import { Room } from 'src/chat-interface/schema/room.schema';

interface additionalMethod {
  ownMethod(): any;
}
export type UserDocument = User & mongoose.Document & additionalMethod;
export type UnreadMessage = { id: string; count: number };

@Schema()
export class User {
  @Prop({
    unique: true,
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  })
  _id: mongoose.ObjectId | string;

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
  unread: UnreadMessage[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.post('save', async (error, doc, next) => {
  const user = await mongoose
    .model('user')
    .findById('60bc7b1f3effc50f0013e19a');
  console.log(user._id);
  if (error.code == 11000) {
    console.log('error occured');
    throw new HttpException('user with the username is already exists', 400);
  } else {
    console.log(error);
  }
  await next();
});
