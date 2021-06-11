import { UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';

export interface ICreateRoomRes {
  status?: boolean;
  newRoom?: RoomDocument;
  participantDocuments?: UserDocument[];
}
