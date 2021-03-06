import { UserDocument } from 'src/user/schema/user.schema';
import { RoomDocument } from '../../room/schema/room.schema';
import { IUserData } from './user-data.dto';

export interface ISocketClient {
  userData: IUserData;
  handshake?: {
    headers?: {
      cookie?: string;
    };
  };
  id: string;

  join(value: string, callback?: Function): Promise<void>;

  leave(roomName: string, callback?: Function): Promise<void>;

  rooms: any;

  emit<T>(message: string, ...T: any): T;

  to(sendToWhom: string): ISocketClient;

  disconnect(): false;
}
