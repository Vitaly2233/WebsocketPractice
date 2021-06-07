import {
  Body,
  Controller,
  HttpException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtTokenDto } from './dto/token.dto';
import { RemovePasswordInterceptor } from './remove-password.interceptor';
import { User, UserDocument } from './Schema/user.schema';

@Controller('auth')
@UseInterceptors(RemovePasswordInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  register(@Body() body: User): Promise<UserDocument> {
    return this.authService.register(body);
  }
  @Post('login')
  login(@Body() body: User): Promise<JwtTokenDto | HttpException> {
    return this.authService.login(body);
  }
}
