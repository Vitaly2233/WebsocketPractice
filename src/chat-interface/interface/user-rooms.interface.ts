import { ObjectId } from 'mongoose';

type RoomName = string;
export type IUserRoom = Record<RoomName, { id?: ObjectId; unread?: number }>;
