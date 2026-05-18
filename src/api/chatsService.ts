import type { ChatMessage } from "../types/index.ts";
import chats from "../mocks/chats.json";

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    return chats.filter((m) => m.chatId === chatId) as ChatMessage[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudieron obtener los mensajes");
  }
}

export async function startChat(listingId: string): Promise<{ id: string }> {
  try {
    // Con mock: busca si ya existe un chat para ese listing
    const existing = chats.find((m) => m.chatId === `chat-${listingId}`);
    if (existing) {
      return { id: `chat-${listingId}` };
    }
    // Si no existe, devuelve chat-1 como fallback del mock
    return { id: "chat-1" };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo iniciar el chat");
  }
}