import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './messages/message.module';
import { UserModule } from './user/user.module';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionGateway } from './connection/connection.gateway';
import { RoomModule } from './room/room.module';
import { ServerModule } from './server/server.module';
import config from './common/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${config.SERVER_HOST}/${config.DB.DB_NAME}`,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
      },
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    AuthModule,
    MessageModule,
    UserModule,
    ConnectionModule,
    RoomModule,
    ServerModule,
  ],
  providers: [ConnectionGateway],
})
export class AppModule {}
