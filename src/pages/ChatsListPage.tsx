import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyChats } from "../api/chatsService.ts";
import type { ChatThread } from "../types/index.ts";
import { getCurrentUserId } from "../utils/auth.ts";
import Spinner from "../components/Spinner.tsx";
import { CHAT_POLL_INTERVAL_MS } from "../utils/polling.ts";
import { CARD, PAGE_BG } from "../utils/ui.ts";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function ChatsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingFilter = searchParams.get("listingId")?.trim() ?? "";
  const currentUserId = getCurrentUserId();

  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChats = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getMyChats();
      setChats(data);
      if (silent) setError("");
    } catch (err) {
      if (!silent) {
        setChats([]);
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los chats",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchChats(false);
  }, [fetchChats]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchChats(true);
    }, CHAT_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchChats]);

  const filteredChats = useMemo(() => {
    if (!listingFilter) return chats;
    return chats.filter((c) => c.listingId === listingFilter);
  }, [chats, listingFilter]);

  function getOtherPartyLabel(chat: ChatThread): string {
    if (chat.buyerId === currentUserId) return "Vendedor";
    if (chat.sellerId === currentUserId) return "Comprador";
    return "Conversación";
  }

  return (
    <main className={`${PAGE_BG} px-4 py-8`}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold tracking-tight">Mis chats</h1>
          <p className="mt-1 text-sm text-white/80">
            {listingFilter
              ? "Conversaciones sobre esta publicación"
              : "Todas tus conversaciones como comprador o vendedor"}
          </p>
          {listingFilter ? (
            <button
              type="button"
              onClick={() => navigate("/chats")}
              className="mt-3 text-sm font-medium text-white/90 underline hover:text-white"
            >
              Ver todos los chats
            </button>
          ) : null}
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="rounded-xl bg-red-50 p-6 text-red-600" role="alert">
            {error}
          </p>
        ) : filteredChats.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-neutral-500 shadow-sm">
            {listingFilter
              ? "No hay chats sobre esta publicación todavía."
              : "Aún no tienes conversaciones."}
          </p>
        ) : (
          <ul className={`${CARD} divide-y divide-slate-100 overflow-hidden`}>
            {filteredChats.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="flex w-full flex-col gap-1 px-5 py-4 text-left transition duration-200 hover:bg-indigo-50/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-neutral-900 line-clamp-1">
                      {chat.listingTitle || "Publicación"}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {formatDate(chat.lastMessageSentAt ?? chat.createdAt)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-indigo-600">
                    {getOtherPartyLabel(chat)}
                    {chat.listingIsHidden ? " · Publicación oculta" : ""}
                  </span>
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    {chat.lastMessageText ?? "Sin mensajes aún"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
