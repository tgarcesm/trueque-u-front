import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ChatMessage } from "../types/index.ts";
import { getChatMessages } from "../api/chatsService.ts";

const CURRENT_USER_ID = "1";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function fetchMessages(chatId: string) {
      setLoading(true);
      setError("");
      try {
        const data = await getChatMessages(chatId);
        setMessages(data);
      } catch (err) {
        setMessages([]);
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los mensajes",
        );
      } finally {
        setLoading(false);
      }
    }

    const chatId = id?.trim();
    if (!chatId) {
      setMessages([]);
      setError("");
      setLoading(false);
      return;
    }

    void fetchMessages(chatId);
  }, [id]);

  function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const chatId = id?.trim();
    const text = newMessage.trim();
    if (!chatId || text === "") return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: CURRENT_USER_ID,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  }

  const isSendDisabled = newMessage.trim() === "";

  return (
    <main className="flex min-h-screen flex-col bg-neutral-100">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="border-b border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/listings")}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            ← Volver
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {loading ? (
            <p className="p-4 text-neutral-700">Cargando...</p>
          ) : error !== "" ? (
            <p className="p-4 text-red-600" role="alert">
              {error}
            </p>
          ) : (
            <section
              aria-label="Mensajes"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-28"
            >
              {messages.length === 0 ? (
                <p className="text-center text-neutral-600">
                  No hay mensajes aún
                </p>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === CURRENT_USER_ID;
                  return (
                    <article
                      key={message.id}
                      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          isOwn
                            ? "max-w-[min(85%,24rem)] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-white shadow-sm"
                            : "max-w-[min(85%,24rem)] rounded-2xl rounded-bl-md bg-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm"
                        }
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-snug">
                          {message.content}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          )}

          <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 py-3 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.06)]">
            <form
              className="flex gap-2"
              onSubmit={(e) => handleSend(e)}
              noValidate
            >
              <input
                type="text"
                name="newMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
                autoComplete="off"
                aria-label="Nuevo mensaje"
              />
              <button
                type="submit"
                disabled={isSendDisabled}
                className="shrink-0 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
