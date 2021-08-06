import { UserDocument } from 'src/user/Schema/user.schema';
import { RoomDocument } from '../../room/schema/room.schema';

export interface IUserData {
  readonly room?: RoomDocument;
  readonly user?: UserDocument;
  readonly token?: string;
}
