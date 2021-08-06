import { config as configuration } from 'dotenv-flow';
import * as path from 'path';

const root = path.join.bind(this, __dirname);
configuration({ path: root('../../') });

export default {
  SERVER_PORT: process.env.SERVER_PORT || 5001,
  SERVER_HOST: process.env.SERVER_HOST,
  DB: {
    DB_NAME: process.env.DATABASE_NAME,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRE,
    IGNORE_EXPIRATION: true,
  },
  ROLES: [
    { name: 'Admin', description: 'Admin role of the platform' },
    { name: 'Manager', description: 'Manager role of the platform' },
    { name: 'Customer', description: 'Customer role of the platform' },
  ],
  EMAIL: {
    SENDER_ADDRESS: 'registration-no-reply@tros.vrealsoft.com',
    ADMIN_ADDRESS: 'security-warning-no-reply@tros.vrealsoft.com',
    PASSWORD_SUBJECT: 'Recover password on TROS',
    RECOVER_PASSWORD_SUBJECT: 'Password recovery - warning',
    REGISTRATION_SUBJECT: 'Registration on TROS',
    REGISTRATION_MANAGER_SUBJECT: 'Manager registration on TROS',
    RESEND_PASSWORD_SUBJECT: 'Your password on TROS has been updated',
  },
};
