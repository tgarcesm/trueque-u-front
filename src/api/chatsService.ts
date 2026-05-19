import { API_URL, authFetch } from "./config.ts";
import type { ChatMessage } from "../types/index.ts";

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const res = await authFetch(`${API_URL}/chats/${chatId}/messages`);
    if (!res.ok) throw new Error("No se pudieron obtener los mensajes");
    return res.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudieron obtener los mensajes");
  }
}

export async function startChat(listingId: string): Promise<{ id: string }> {
  try {
    const res = await authFetch(`${API_URL}/chats/start`, {
      method: "POST",
      body: JSON.stringify({ listingId }),
    });
    if (!res.ok) throw new Error("No se pudo iniciar el chat");
    const data = await res.json();
    return { id: data.chatThreadId };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo iniciar el chat");
  }
}

export async function sendMessage(chatId: string, text: string): Promise<ChatMessage> {
  try {
    const res = await authFetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("No se pudo enviar el mensaje");
    return res.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo enviar el mensaje");
  }
}