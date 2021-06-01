import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatInterfaceGuard } from './chat-interface.guard';
import { ChatInterfaceService } from './chat-interface.service';

@UseGuards(ChatInterfaceGuard)
@Controller('interface')
export class ChatInterfaceController {
  constructor(private chatInterfaceService: ChatInterfaceService) {}
  @Get('get_users')
  getUsers(@Req() reqest) {
    // return this.chatInterfaceService.getUsers();
    return true;
  }

  @Post('find_users')
  findUserByUsername(@Body() body: string[]) {
    return this.chatInterfaceService.findUsers(body);
  }
}
