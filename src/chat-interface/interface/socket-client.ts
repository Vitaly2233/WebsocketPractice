import { UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from '../schema/room.schema';
import { IUserData } from './user-data.dto';

export interface ISocketClient {
  userData: IUserData;
  handshake?: {
    headers?: {
      cookie?: string;
    };
  };
  id: string;
  join(value: string): Promise<void>;

  rooms: any;

  emit<T>(message: string, ...T: any): T;

  to(sendToWhom: string): ISocketClient;

  disconnect(): any;
}
