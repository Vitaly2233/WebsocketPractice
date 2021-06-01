import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/dto/user.schema';
import { ChatInterfaceController } from './chat-interface.controller';
import { ChatInterfaceService } from './chat-interface.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  providers: [ChatInterfaceService],
  controllers: [ChatInterfaceController],
})
export class ChatInterfaceModule {}
