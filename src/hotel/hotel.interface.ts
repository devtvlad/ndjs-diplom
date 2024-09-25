import { ObjectId } from 'mongoose';

export interface HotelRoomRO {
  id: ObjectId;
  description: string;
  images: string[];
  hotel: {
    id: ObjectId;
    title: string;
  };
}

export interface HotelRoomDetailRO {
  id: ObjectId;
  description: string;
  images: string[];
  hotel: {
    id: ObjectId;
    title: string;
    description: string;
  };
}

export interface HotelRO {
  id: ObjectId;
  title: string;
  description: string;
}

export interface CreateOrUpdateHotelRoomRO {
  id: ObjectId;
  description: string;
  images: string[];
  isEnabled: boolean;
  hotel: {
    id: ObjectId;
    title: string;
    description: string;
  };
}
