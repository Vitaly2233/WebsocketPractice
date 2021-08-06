import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/Schema/user.schema';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
