import { UserDocument } from 'src/user/schema/user.schema';
import { RoomDocument } from '../../room/schema/room.schema';

export interface IUserData {
  room?: RoomDocument;
  readonly user?: UserDocument;
  readonly token?: string;
}
