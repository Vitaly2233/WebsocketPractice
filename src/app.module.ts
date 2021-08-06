import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserSchema } from './auth/Schema/user.schema';
import { ChatInterfaceModule } from './chat-interface/chat-interface.module';
import { RoomSchema } from './chat-interface/schema/room.schema';
import { MessageModule } from './messages/message.module';
import { MessageSchema } from './messages/schema/message.schema';
import { UserModule } from './user/user.module';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionGateway } from './connection/connection.gateway';
import config from './common/config';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${config.SERVER_HOST}/${config.DB.DB_NAME}`,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
      },
    ),
    AuthModule,
    ChatInterfaceModule,
    MessageModule,
    UserModule,
    ConnectionModule,
  ],
  providers: [ConnectionGateway],
})
export class AppModule {}
