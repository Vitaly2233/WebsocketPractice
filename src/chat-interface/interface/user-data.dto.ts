import { UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from '../schema/room.schema';

export interface IUserData {
  readonly room?: RoomDocument;
  readonly user?: UserDocument;
  readonly token?: string;
}
