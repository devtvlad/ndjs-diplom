import { ObjectId } from 'mongoose';

export interface AuthRO {
  id: ObjectId;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}
