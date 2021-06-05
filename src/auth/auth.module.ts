import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { secretValue } from 'src/constants/jwt.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from './Schema/user.schema';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forFeatureAsync([
      {
        name: 'user',
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', function () {
            console.log('saved user data');
          });
          return schema;
        },
      },
    ]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
