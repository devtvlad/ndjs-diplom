import { ObjectId } from 'mongoose';
import { Role } from '../user/user.interface';

export interface LoginUserRO {
  token: string;
  email: string;
  name: string;
  contactPhone: string;
}

export interface CreateUserRO {
  id: ObjectId;
  email: string;
  name: string;
  contactPhone: string;
  role: Role;
}

export interface RegisterClientRO {
  token: string;
  id: ObjectId;
  email: string;
  name: string;
}
