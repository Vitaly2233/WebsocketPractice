import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserSchema } from './auth/Schema/user.schema';
import { ChatInterfaceModule } from './chat-interface/chat-interface.module';
import { RoomSchema } from './chat-interface/schema/room.schema';
import { MessageModule } from './messages/message.module';
import { MessageSchema } from './messages/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest', {
      useCreateIndex: true,
    }),
    AuthModule,
    ChatInterfaceModule,
    MessageModule,
  ],
})
export class AppModule {}
