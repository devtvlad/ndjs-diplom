export enum Role {
  Client = 'client',
  Admin = 'admin',
  Manager = 'manager',
}

export interface UserRO {
  id: string;
  email: string;
  name: string;
  contactPhone: string;
}
