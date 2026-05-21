export interface User {
  id: string;
  name: string;
  program: string;
  email: string;
  rating: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  location: string;
  status: "available" | "reserved" | "sold";
  images: string[];
  sellerId: string;
  isHidden?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  listingTitle: string;
  listingIsHidden: boolean;
  lastMessageText: string | null;
  lastMessageSentAt: string | null;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  title: string;
}