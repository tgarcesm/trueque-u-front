import { API_URL, authFetch } from "./config.ts";
import type { ChatMessage, ChatThread } from "../types/index.ts";

function mapChatThread(raw: Record<string, unknown>): ChatThread {
  return {
    id: String(raw.chatThreadId ?? raw.ChatThreadId ?? ""),
    listingId: String(raw.listingId ?? raw.ListingId ?? ""),
    buyerId: String(raw.buyerId ?? raw.BuyerId ?? ""),
    sellerId: String(raw.sellerId ?? raw.SellerId ?? ""),
    listingTitle: String(raw.listingTitle ?? raw.ListingTitle ?? ""),
    listingIsHidden: Boolean(raw.listingIsHidden ?? raw.ListingIsHidden),
    lastMessageText:
      raw.lastMessageText != null || raw.LastMessageText != null
        ? String(raw.lastMessageText ?? raw.LastMessageText)
        : null,
    lastMessageSentAt:
      raw.lastMessageSentAt != null || raw.LastMessageSentAt != null
        ? String(raw.lastMessageSentAt ?? raw.LastMessageSentAt)
        : null,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
  };
}

export async function getMyChats(): Promise<ChatThread[]> {
  try {
    const res = await authFetch(`${API_URL}/chats`);
    if (!res.ok) throw new Error("No se pudieron cargar los chats");
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    return items.map((item) =>
      mapChatThread(item as Record<string, unknown>),
    );
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudieron cargar los chats");
  }
}

export async function getChatThread(chatId: string): Promise<ChatThread | null> {
  const chats = await getMyChats();
  return chats.find((c) => c.id === chatId) ?? null;
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const res = await authFetch(`${API_URL}/chats/${chatId}/messages`);
    if (!res.ok) throw new Error("No se pudieron obtener los mensajes");
    const data = await res.json();
    return data.map((m: any) => ({
      id: m.chatMessageId,
      chatId: m.threadId,
      senderId: m.senderId,
      content: m.text,
      createdAt: m.sentAt,
    }));
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
    const m = await res.json();
    return {
      id: m.chatMessageId,
      chatId: m.threadId,
      senderId: m.senderId,
      content: m.text,
      createdAt: m.sentAt,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo enviar el mensaje");
  }
}