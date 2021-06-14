import {
  Body,
  Controller,
  HttpException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { JwtTokenDto } from './dto/token.dto';
import { RemovePasswordInterceptor } from './interceptor/remove-password.interceptor';
import { User, UserDocument } from './Schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(RemovePasswordInterceptor)
  @Post('registration')
  register(@Body() body: AuthDto): Promise<UserDocument> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: User): Promise<JwtTokenDto | HttpException> {
    return this.authService.login(body);
  }
}
