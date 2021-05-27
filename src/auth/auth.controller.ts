import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './dto/user.schema';

@Controller('auth')
export class AuthController {
  constructor(@Inject() private authService: AuthService) {}

  @Post('registration')
  register(@Body() body: User) {
    this.authService.register(body);
  }
}
