import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ChatMessage, ChatThread } from "../types/index.ts";
import {
  getChatMessages,
  getChatThread,
  sendMessage,
} from "../api/chatsService.ts";
import { reportUser } from "../api/reportsService.ts";
import ReportModal from "../components/ReportModal.tsx";
import Spinner from "../components/Spinner.tsx";
import { getCurrentUserId } from "../utils/auth.ts";
import { CHAT_POLL_INTERVAL_MS } from "../utils/polling.ts";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const [reportError, setReportError] = useState("");

  const currentUserId = getCurrentUserId();

  const otherUserId =
    thread && currentUserId
      ? thread.buyerId === currentUserId
        ? thread.sellerId
        : thread.sellerId === currentUserId
          ? thread.buyerId
          : null
      : null;

  useEffect(() => {
    const chatId = id?.trim();
    if (!chatId) {
      setThread(null);
      return;
    }
    void getChatThread(chatId)
      .then(setThread)
      .catch(() => setThread(null));
  }, [id]);

  const fetchMessages = useCallback(
    async (silent = false) => {
      const chatId = id?.trim();
      if (!chatId) {
        setMessages([]);
        if (!silent) {
          setError("");
          setLoading(false);
        }
        return;
      }

      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await getChatMessages(chatId);
        setMessages(data);
        if (silent) setError("");
      } catch (err) {
        if (!silent) {
          setMessages([]);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los mensajes",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void fetchMessages(false);
  }, [fetchMessages]);

  useEffect(() => {
    const chatId = id?.trim();
    if (!chatId) return;

    const intervalId = window.setInterval(() => {
      void getChatThread(chatId)
        .then(setThread)
        .catch(() => setThread(null));
      void fetchMessages(true);
    }, CHAT_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [id, fetchMessages]);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const chatId = id?.trim();
    const text = newMessage.trim();
    if (!chatId || text === "") return;

    setSending(true);
    try {
      const msg = await sendMessage(chatId, text);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  }

  const isSendDisabled = newMessage.trim() === "" || sending;

  async function handleReportUser(reason: string, comment: string) {
    if (!otherUserId) return;
    setReportLoading(true);
    setReportError("");
    setReportMsg("");
    try {
      await reportUser(otherUserId, reason, comment);
      setReportModalOpen(false);
      setReportMsg("Reporte enviado correctamente.");
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "No se pudo enviar el reporte",
      );
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[#f8fafc] sm:min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col sm:shadow-xl">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-indigo-700 to-blue-600 px-4 py-4 text-white shadow-md">
          <button
            type="button"
            onClick={() => navigate("/chats")}
            className="rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold transition duration-200 hover:bg-white/25"
          >
            ← Chats
          </button>
          <div className="min-w-0 flex-1 px-2 text-center">
            <p className="truncate text-sm font-bold">
              {thread?.listingTitle || "Conversación"}
            </p>
          </div>
          {otherUserId ? (
            <button
              type="button"
              onClick={() => {
                setReportError("");
                setReportMsg("");
                setReportModalOpen(true);
              }}
              className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              Reportar
            </button>
          ) : (
            <span className="w-20" />
          )}
        </header>

        {reportMsg !== "" ? (
          <p className="bg-emerald-50 px-4 py-2 text-sm text-emerald-700" role="status">
            {reportMsg}
          </p>
        ) : null}
        {reportError !== "" ? (
          <p className="bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
            {reportError}
          </p>
        ) : null}

        <div className="relative flex min-h-0 flex-1 flex-col tu-chat-bg">
          {loading ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <Spinner />
            </div>
          ) : error !== "" ? (
            <p className="p-4 text-red-600" role="alert">
              {error}
            </p>
          ) : (
            <section
              aria-label="Mensajes"
              className="flex-1 space-y-2 overflow-y-auto px-4 py-5 pb-28"
            >
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  No hay mensajes aún. ¡Envía el primero!
                </p>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  return (
                    <article
                      key={message.id}
                      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          isOwn
                            ? "max-w-[min(85%,20rem)] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-blue-500 px-4 py-2.5 text-white shadow-md shadow-indigo-500/20"
                            : "max-w-[min(85%,20rem)] rounded-2xl rounded-bl-sm border border-slate-200/80 bg-white px-4 py-2.5 text-slate-800 shadow-sm"
                        }
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          )}

          <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
            <form
              className="flex gap-2"
              onSubmit={(e) => void handleSend(e)}
              noValidate
            >
              <input
                type="text"
                name="newMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                autoComplete="off"
                aria-label="Nuevo mensaje"
              />
              <button
                type="submit"
                disabled={isSendDisabled}
                className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "…" : "Enviar"}
              </button>
            </form>
          </div>
        </div>

        <ReportModal
          open={reportModalOpen}
          loading={reportLoading}
          title="Reportar usuario"
          description="Indica el motivo y un comentario (mínimo 3 caracteres cada uno)."
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReportUser}
        />
      </div>
    </main>
  );
}
