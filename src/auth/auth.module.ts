import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { secretValue } from 'src/constants/jwt.constants';
import { MessageModule } from 'src/messages/message.module';
import { MessageService } from 'src/messages/message.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from './Schema/user.schema';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),

    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
