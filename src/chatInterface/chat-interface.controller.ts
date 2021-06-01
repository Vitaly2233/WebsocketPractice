import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatInterfaceGuard } from './chat-interface.guard';
import { ChatInterfaceService } from './chat-interface.service';
import { Request } from 'express';

@UseGuards(ChatInterfaceGuard)
@Controller('interface')
export class ChatInterfaceController {
  constructor(private chatInterfaceService: ChatInterfaceService) {}
  @Get('get_chats')
  getChats(@Req() req: Request): Promise<string[] | HttpException> {
    return this.chatInterfaceService.getChats(req);
  }

  @Post('find_users')
  findUserByUsername(
    @Body() body: string[],
  ): Promise<string[] | HttpException> {
    return this.chatInterfaceService.findUsers(body);
  }
}
