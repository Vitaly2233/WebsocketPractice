import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatInterfaceModule } from './chat-interface/chat-interface.module';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MessageModule,
    AuthModule,
    ChatInterfaceModule,
  ],
})
export class AppModule {}
