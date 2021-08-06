import { forwardRef, Module } from '@nestjs/common';
import { MessageModule } from 'src/messages/message.module';
import { ChatInterfaceGateWay } from './chat-interface.gateway';
import { ChatInterfaceService } from './chat-interface.service';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [AuthModule, ConnectionModule, forwardRef(() => MessageModule)],
  providers: [ChatInterfaceGateWay, ChatInterfaceService],
})
export class ChatInterfaceModule {}
