import { Types } from "mongoose";


type RoomName = string;
export type IUserRoomResponse = Record<
  RoomName,
  { id?: Types._ObjectId | string; unread?: number }
>;
