export interface SupportRequestForClientRO {
  id: string;
  createdAt: string;
  isActive: boolean;
  hasNewMessages: boolean;
}

export interface SupportRequestForManagerRO {
  id: string;
  createdAt: string;
  isActive: boolean;
  hasNewMessages: boolean;
  client: {
    id: string;
    name: string;
    email: string;
    contactPhone: string;
  };
}

export interface MessageRO {
  id: string;
  createdAt: string;
  text: string;
  readAt: string;
  author: {
    id: string;
    name: string;
  };
}

export interface ReadMessagesRO {
  success: boolean;
}
