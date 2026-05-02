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
