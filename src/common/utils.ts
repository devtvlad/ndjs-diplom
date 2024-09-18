import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from '../user/user.interface';
import { User } from '../user/user.schema';

export const checkUserAdminRole = (user: User) => {
  if (user.role !== Role.Admin) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
  }
};

export const checkUserClientRole = (user: User) => {
  if (user.role !== Role.Client) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
  }
};

export const checkUserManagerRole = (user: User) => {
  if (user.role !== Role.Manager) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
  }
};
