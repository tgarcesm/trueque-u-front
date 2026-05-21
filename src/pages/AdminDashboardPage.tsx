import { useEffect, useState } from "react";
import {
  getAdminReports,
  hideListing,
  suspendUser,
  type AdminReport,
} from "../api/adminService.ts";
import CopyIdButton from "../components/CopyIdButton.tsx";

type Tab = "reports" | "moderation";

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const TAB_ACTIVE =
  "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm";
const TAB_INACTIVE =
  "rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50";

function formatReportType(type: AdminReport["targetType"]): string {
  return type === "listing" ? "Publicación" : "Usuario";
}

function prefillHideListing(
  listingId: string,
  reason: string,
  setHideListingId: (v: string) => void,
  setHideReason: (v: string) => void,
  setTab: (t: Tab) => void,
) {
  setHideListingId(listingId);
  setHideReason(reason);
  setTab("moderation");
}

function prefillSuspendUser(
  userId: string,
  reason: string,
  setSuspendUserId: (v: string) => void,
  setSuspendReason: (v: string) => void,
  setTab: (t: Tab) => void,
) {
  setSuspendUserId(userId);
  setSuspendReason(reason);
  setTab("moderation");
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("reports");

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const [hideListingId, setHideListingId] = useState("");
  const [hideReason, setHideReason] = useState("");
  const [hideLoading, setHideLoading] = useState(false);
  const [hideMsg, setHideMsg] = useState("");
  const [hideError, setHideError] = useState("");

  const [suspendUserId, setSuspendUserId] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendMsg, setSuspendMsg] = useState("");
  const [suspendError, setSuspendError] = useState("");

  useEffect(() => {
    if (tab !== "reports") return;

    async function fetchReports() {
      setReportsLoading(true);
      setReportsError("");
      try {
        const data = await getAdminReports();
        setReports(data);
      } catch (err) {
        setReportsError(
          err instanceof Error ? err.message : "No se pudieron cargar los reportes",
        );
      } finally {
        setReportsLoading(false);
      }
    }

    void fetchReports();
  }, [tab]);

  async function handleHideListing() {
    const id = hideListingId.trim();
    const reason = hideReason.trim();
    if (!id || !reason) {
      setHideError("Ingresa el ID de la publicación y el motivo.");
      setHideMsg("");
      return;
    }

    setHideLoading(true);
    setHideError("");
    setHideMsg("");
    try {
      await hideListing(id, reason);
      setHideMsg("Publicación ocultada correctamente.");
      setHideListingId("");
      setHideReason("");
    } catch (err) {
      setHideError(
        err instanceof Error ? err.message : "No se pudo ocultar la publicación",
      );
    } finally {
      setHideLoading(false);
    }
  }

  async function handleSuspendUser() {
    const id = suspendUserId.trim();
    const reason = suspendReason.trim();
    if (!id || !reason) {
      setSuspendError("Ingresa el ID del usuario y el motivo.");
      setSuspendMsg("");
      return;
    }

    setSuspendLoading(true);
    setSuspendError("");
    setSuspendMsg("");
    try {
      await suspendUser(id, reason);
      setSuspendMsg("Usuario suspendido correctamente.");
      setSuspendUserId("");
      setSuspendReason("");
    } catch (err) {
      setSuspendError(
        err instanceof Error ? err.message : "No se pudo suspender al usuario",
      );
    } finally {
      setSuspendLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
          <p className="mt-1 text-sm text-white/80">
            Reportes y moderación de la plataforma
          </p>
        </section>

        <nav
          aria-label="Secciones del panel"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={tab === "reports" ? TAB_ACTIVE : TAB_INACTIVE}
          >
            Reportes
          </button>
          <button
            type="button"
            onClick={() => setTab("moderation")}
            className={tab === "moderation" ? TAB_ACTIVE : TAB_INACTIVE}
          >
            Moderación
          </button>
        </nav>

        {tab === "reports" ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Reportes</h2>

            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              </div>
            ) : reportsError !== "" ? (
              <p className="text-sm text-red-600" role="alert">
                {reportsError}
              </p>
            ) : reports.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-8">
                No hay reportes registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-600">
                      <th className="px-3 py-3 font-semibold">Tipo</th>
                      <th className="px-3 py-3 font-semibold">ID reportado</th>
                      <th className="px-3 py-3 font-semibold">Motivo</th>
                      <th className="px-3 py-3 font-semibold">Comentario</th>
                      <th className="px-3 py-3 font-semibold">Fecha</th>
                      <th className="px-3 py-3 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.reportId}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              report.targetType === "listing"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {formatReportType(report.targetType)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {report.targetType === "listing" &&
                          report.reportedListingId ? (
                            <CopyIdButton id={report.reportedListingId} />
                          ) : report.targetType === "user" &&
                            report.reportedUserId ? (
                            <CopyIdButton id={report.reportedUserId} />
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-neutral-800">{report.reason}</td>
                        <td className="px-3 py-3 text-neutral-600 max-w-xs">
                          <span className="line-clamp-2">{report.comment}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-neutral-600">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-3 py-3">
                          {report.targetType === "listing" &&
                          report.reportedListingId ? (
                            <button
                              type="button"
                              onClick={() =>
                                prefillHideListing(
                                  report.reportedListingId!,
                                  report.reason,
                                  setHideListingId,
                                  setHideReason,
                                  setTab,
                                )
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                            >
                              Ocultar listing
                            </button>
                          ) : report.targetType === "user" &&
                            report.reportedUserId ? (
                            <button
                              type="button"
                              onClick={() =>
                                prefillSuspendUser(
                                  report.reportedUserId!,
                                  report.reason,
                                  setSuspendUserId,
                                  setSuspendReason,
                                  setTab,
                                )
                              }
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                            >
                              Suspender usuario
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Ocultar publicación
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="hide-listing-id"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    ID del listing
                  </label>
                  <input
                    id="hide-listing-id"
                    type="text"
                    value={hideListingId}
                    onChange={(e) => setHideListingId(e.target.value)}
                    placeholder="bbbbbbbb-bbbb-bbbb-bbbb-..."
                    className={INPUT_CLASS}
                    disabled={hideLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="hide-reason"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Motivo
                  </label>
                  <input
                    id="hide-reason"
                    type="text"
                    value={hideReason}
                    onChange={(e) => setHideReason(e.target.value)}
                    placeholder="Motivo de moderación"
                    className={INPUT_CLASS}
                    disabled={hideLoading}
                  />
                </div>
                {hideError !== "" ? (
                  <p className="text-sm text-red-600" role="alert">
                    {hideError}
                  </p>
                ) : null}
                {hideMsg !== "" ? (
                  <p className="text-sm text-green-600" role="status">
                    {hideMsg}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleHideListing()}
                  disabled={hideLoading}
                  className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {hideLoading ? "Ocultando..." : "Ocultar listing"}
                </button>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Suspender usuario
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="suspend-user-id"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    ID del usuario
                  </label>
                  <input
                    id="suspend-user-id"
                    type="text"
                    value={suspendUserId}
                    onChange={(e) => setSuspendUserId(e.target.value)}
                    placeholder="ID del usuario"
                    className={INPUT_CLASS}
                    disabled={suspendLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="suspend-reason"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Motivo
                  </label>
                  <input
                    id="suspend-reason"
                    type="text"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Motivo de suspensión"
                    className={INPUT_CLASS}
                    disabled={suspendLoading}
                  />
                </div>
                {suspendError !== "" ? (
                  <p className="text-sm text-red-600" role="alert">
                    {suspendError}
                  </p>
                ) : null}
                {suspendMsg !== "" ? (
                  <p className="text-sm text-green-600" role="status">
                    {suspendMsg}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleSuspendUser()}
                  disabled={suspendLoading}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suspendLoading ? "Suspendiendo..." : "Suspender usuario"}
                </button>
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
