import { UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from '../schema/room.schema';

export interface ISocketClient {
  userData: {
    room?: RoomDocument;
    user?: UserDocument;
    token?: string;
  };
  handshake?: {
    headers?: {
      cookie?: string;
    };
  };
  id: string;
  join(value: string): Promise<void>;

  rooms: any;

  emit(message: string, data: any): any;

  to(sendToWhom: string): ISocketClient;

  disconnect(): any;
}
