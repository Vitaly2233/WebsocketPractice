import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatInterfaceGuard, myReq } from './chat-interface.guard';
import { ChatInterfaceService } from './chat-interface.service';
import { Request } from 'express';
import { FindUserDto } from './dto/find-user.dto';

@UseGuards(ChatInterfaceGuard)
@Controller('interface')
export class ChatInterfaceController {
  constructor(private chatInterfaceService: ChatInterfaceService) {}
  @Get('get_chats')
  getChats(
    @Req() req: Request,
  ): Promise<Record<string, string[]> | HttpException> {
    return this.chatInterfaceService.getChats(req);
  }

  @Post('find_users')
  findUserByUsername(
    @Body() body: string[],
    @Req() req: myReq,
  ): Promise<FindUserDto | HttpException> {
    const username = req.userData.username;
    return this.chatInterfaceService.findUsers(body, username);
  }
}
