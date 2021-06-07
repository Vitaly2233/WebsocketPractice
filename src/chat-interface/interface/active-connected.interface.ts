import { ObjectId } from 'mongoose';

type socketId = string;

export type IActiveConnected = Record<socketId, ObjectId>[];
