import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtTokenDto } from './dto/token.dto';
import { User } from './dto/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  register(@Body() body: User) {
    return this.authService.register(body);
  }
  @Post('login')
  login(@Body() body: User): Promise<JwtTokenDto | HttpException> {
    return this.authService.login(body);
  }
}
