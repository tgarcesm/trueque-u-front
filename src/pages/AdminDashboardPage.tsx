import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createUser,
  deleteUser,
  getAdminReports,
  getAdminUsers,
  hideListing,
  showListing,
  suspendUser,
  unsuspendUser,
  type AdminReport,
  type AdminUser,
  type CreateAdminUserPayload,
} from "../api/adminService.ts";
import AdminCreateUserModal from "../components/AdminCreateUserModal.tsx";
import CopyIdButton from "../components/CopyIdButton.tsx";
import ReportListingAction from "../components/ReportListingAction.tsx";
import ReportUserAction from "../components/ReportUserAction.tsx";
import Spinner from "../components/Spinner.tsx";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import {
  CARD,
  INPUT,
  PAGE_BG,
  TABLE_HEAD,
  TABLE_ROW_EVEN,
  TABLE_ROW_ODD,
} from "../utils/ui.ts";

type Tab = "reports" | "moderation" | "users";

const INPUT_CLASS = INPUT;

const SIDEBAR_ACTIVE =
  "shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition duration-200 lg:w-full lg:py-3 lg:text-left";
const SIDEBAR_INACTIVE =
  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-indigo-600 lg:w-full lg:py-3 lg:text-left";

function formatReportType(type: AdminReport["targetType"]): string {
  return type === 1 ? "Usuario" : "Publicación";
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

  const [unsuspendUserId, setUnsuspendUserId] = useState("");
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [unsuspendMsg, setUnsuspendMsg] = useState("");
  const [unsuspendError, setUnsuspendError] = useState("");

  const [showListingId, setShowListingId] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [showMsg, setShowMsg] = useState("");
  const [showError, setShowError] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userActionId, setUserActionId] = useState<string | null>(null);
  const [userRowError, setUserRowError] = useState("");
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchReports = useCallback(async (silent = false) => {
    if (!silent) {
      setReportsLoading(true);
      setReportsError("");
    }
    try {
      const data = await getAdminReports();
      setReports(data);
      if (silent) setReportsError("");
    } catch (err) {
      if (!silent) {
        setReportsError(
          err instanceof Error ? err.message : "No se pudieron cargar los reportes",
        );
      }
    } finally {
      if (!silent) setReportsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) {
      setUsersLoading(true);
      setUsersError("");
    }
    try {
      const data = await getAdminUsers();
      setUsers(data);
      if (silent) setUsersError("");
    } catch (err) {
      if (!silent) {
        setUsersError(
          err instanceof Error ? err.message : "No se pudieron cargar los usuarios",
        );
      }
    } finally {
      if (!silent) setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== "reports") return;
    void fetchReports(false);
  }, [tab, fetchReports]);

  useEffect(() => {
    if (tab !== "reports") return;

    const intervalId = window.setInterval(() => {
      void fetchReports(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [tab, fetchReports]);

  useEffect(() => {
    if (tab !== "users") return;
    void fetchUsers(false);
  }, [tab, fetchUsers]);

  useEffect(() => {
    if (tab !== "users") return;

    const intervalId = window.setInterval(() => {
      void fetchUsers(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [tab, fetchUsers]);

  async function handleCreateUser(payload: CreateAdminUserPayload) {
    setCreateUserLoading(true);
    setCreateUserError("");
    try {
      await createUser(payload);
      setCreateUserModalOpen(false);
      await fetchUsers(true);
    } catch (err) {
      setCreateUserError(
        err instanceof Error ? err.message : "No se pudo crear el usuario",
      );
    } finally {
      setCreateUserLoading(false);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este usuario?",
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    setUserRowError("");
    try {
      await deleteUser(user.id);
      await fetchUsers(true);
    } catch (err) {
      setUserRowError(
        err instanceof Error ? err.message : "No se pudo eliminar el usuario",
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  async function handleToggleAdminUser(user: AdminUser) {
    setUserActionId(user.id);
    setUserRowError("");
    try {
      if (user.isSuspended) {
        await unsuspendUser(user.id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isSuspended: false } : u,
          ),
        );
      } else {
        const reason =
          window.prompt("Motivo de suspensión:")?.trim() ?? "";
        if (reason.length < 3) return;
        await suspendUser(user.id, reason);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isSuspended: true } : u,
          ),
        );
      }
    } catch (err) {
      setUserRowError(
        err instanceof Error ? err.message : "No se pudo completar la acción",
      );
    } finally {
      setUserActionId(null);
    }
  }

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

  async function handleShowListing() {
    const id = showListingId.trim();
    if (!id) {
      setShowError("Ingresa el ID de la publicación.");
      setShowMsg("");
      return;
    }

    setShowLoading(true);
    setShowError("");
    setShowMsg("");
    try {
      await showListing(id);
      setShowMsg("Publicación reactivada correctamente.");
      setShowListingId("");
    } catch (err) {
      setShowError(
        err instanceof Error ? err.message : "No se pudo reactivar la publicación",
      );
    } finally {
      setShowLoading(false);
    }
  }

  async function handleUnsuspendUser() {
    const id = unsuspendUserId.trim();
    if (!id) {
      setUnsuspendError("Ingresa el ID del usuario.");
      setUnsuspendMsg("");
      return;
    }

    setUnsuspendLoading(true);
    setUnsuspendError("");
    setUnsuspendMsg("");
    try {
      await unsuspendUser(id);
      setUnsuspendMsg("Usuario reactivado correctamente.");
      setUnsuspendUserId("");
    } catch (err) {
      setUnsuspendError(
        err instanceof Error ? err.message : "No se pudo reactivar al usuario",
      );
    } finally {
      setUnsuspendLoading(false);
    }
  }

  return (
    <main className={`${PAGE_BG} px-3 py-6 sm:px-4 sm:py-8`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
        <aside
          className={`${CARD} w-full shrink-0 p-3 sm:p-4 lg:w-64 lg:sticky lg:top-24`}
          aria-label="Menú del panel"
        >
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-600 p-4 text-white lg:mb-6">
            <h1 className="text-base font-bold sm:text-lg">Panel admin</h1>
            <p className="mt-1 text-xs text-indigo-100">TruequeU</p>
          </div>
          <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              type="button"
              onClick={() => setTab("reports")}
              className={tab === "reports" ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}
            >
              Reportes
            </button>
            <button
              type="button"
              onClick={() => setTab("users")}
              className={tab === "users" ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}
            >
              Usuarios
            </button>
            <button
              type="button"
              onClick={() => setTab("moderation")}
              className={tab === "moderation" ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}
            >
              Moderación
            </button>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
        {tab === "reports" ? (
          <section className={`${CARD} p-6`}>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Reportes</h2>

            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
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
                    <tr className={`border-b border-slate-200 ${TABLE_HEAD}`}>
                      <th className="px-3 py-3 font-semibold">Tipo</th>
                      <th className="px-3 py-3 font-semibold">Ver</th>
                      <th className="px-3 py-3 font-semibold">ID reportado</th>
                      <th className="px-3 py-3 font-semibold">Motivo</th>
                      <th className="px-3 py-3 font-semibold">Comentario</th>
                      <th className="px-3 py-3 font-semibold">Fecha</th>
                      <th className="px-3 py-3 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr
                        key={report.reportId}
                        className={`border-b border-slate-100 transition hover:bg-indigo-50/40 ${index % 2 === 0 ? TABLE_ROW_ODD : TABLE_ROW_EVEN}`}
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              report.targetType === 0
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {formatReportType(report.targetType)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {report.targetType === 0 && report.reportedListingId ? (
                            <Link
                              to={`/listings/${report.reportedListingId}`}
                              className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 whitespace-nowrap"
                            >
                              Ver publicación
                            </Link>
                          ) : report.targetType === 1 && report.reportedUserId ? (
                            <Link
                              to={`/users/${report.reportedUserId}`}
                              className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 whitespace-nowrap"
                            >
                              Ver usuario
                            </Link>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {report.targetType === 0 && report.reportedListingId ? (
                            <CopyIdButton id={report.reportedListingId} />
                          ) : report.targetType === 1 && report.reportedUserId ? (
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
                          {report.targetType === 0 && report.reportedListingId ? (
                            <ReportListingAction
                              listingId={report.reportedListingId}
                              reportReason={report.reason}
                              reportComment={report.comment}
                            />
                          ) : report.targetType === 1 && report.reportedUserId ? (
                            <ReportUserAction
                              userId={report.reportedUserId}
                              reportReason={report.reason}
                              reportComment={report.comment}
                            />
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
        ) : tab === "users" ? (
          <section className={`${CARD} p-6`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-neutral-900">Usuarios</h2>
              <button
                type="button"
                onClick={() => {
                  setCreateUserError("");
                  setCreateUserModalOpen(true);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Crear usuario
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : usersError !== "" ? (
              <p className="text-sm text-red-600" role="alert">
                {usersError}
              </p>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-8">
                No hay usuarios registrados.
              </p>
            ) : (
              <>
                {userRowError !== "" ? (
                  <p className="mb-4 text-sm text-red-600" role="alert">
                    {userRowError}
                  </p>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className={`border-b border-slate-200 ${TABLE_HEAD}`}>
                        <th className="px-3 py-3 font-semibold">Nombre</th>
                        <th className="px-3 py-3 font-semibold">Email</th>
                        <th className="px-3 py-3 font-semibold">Programa</th>
                        <th className="px-3 py-3 font-semibold">Rating</th>
                        <th className="px-3 py-3 font-semibold">Estado</th>
                        <th className="px-3 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-slate-100 transition hover:bg-indigo-50/40 ${index % 2 === 0 ? TABLE_ROW_ODD : TABLE_ROW_EVEN}`}
                        >
                          <td className="px-3 py-3 font-medium text-neutral-900">
                            {user.fullName || "—"}
                          </td>
                          <td className="px-3 py-3 text-neutral-700">
                            {user.email || "—"}
                          </td>
                          <td className="px-3 py-3 text-neutral-700">
                            {user.programName || "—"}
                          </td>
                          <td className="px-3 py-3 text-neutral-800 whitespace-nowrap">
                            {user.rating.toFixed(1)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.isSuspended
                                  ? "bg-red-50 text-red-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {user.isSuspended ? "Suspendido" : "Activo"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void handleToggleAdminUser(user)}
                                disabled={
                                  userActionId === user.id ||
                                  deletingUserId === user.id
                                }
                                className={
                                  user.isSuspended
                                    ? "rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:opacity-50"
                                    : "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                                }
                              >
                                {userActionId === user.id
                                  ? "Procesando…"
                                  : user.isSuspended
                                    ? "Reactivar"
                                    : "Suspender"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteUser(user)}
                                disabled={
                                  deletingUserId === user.id ||
                                  userActionId === user.id
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {deletingUserId === user.id
                                  ? "Eliminando…"
                                  : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <AdminCreateUserModal
              open={createUserModalOpen}
              loading={createUserLoading}
              error={createUserError}
              onClose={() => {
                if (!createUserLoading) {
                  setCreateUserModalOpen(false);
                  setCreateUserError("");
                }
              }}
              onSubmit={handleCreateUser}
            />
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            <article className={`${CARD} p-6`}>
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

            <article className={`${CARD} p-6`}>
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

            <article className={`${CARD} p-6`}>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Reactivar usuario
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="unsuspend-user-id"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    ID del usuario
                  </label>
                  <input
                    id="unsuspend-user-id"
                    type="text"
                    value={unsuspendUserId}
                    onChange={(e) => setUnsuspendUserId(e.target.value)}
                    placeholder="ID del usuario"
                    className={INPUT_CLASS}
                    disabled={unsuspendLoading}
                  />
                </div>
                {unsuspendError !== "" ? (
                  <p className="text-sm text-red-600" role="alert">
                    {unsuspendError}
                  </p>
                ) : null}
                {unsuspendMsg !== "" ? (
                  <p className="text-sm text-green-600" role="status">
                    {unsuspendMsg}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleUnsuspendUser()}
                  disabled={unsuspendLoading}
                  className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unsuspendLoading ? "Reactivando..." : "Reactivar usuario"}
                </button>
              </div>
            </article>

            <article className={`${CARD} p-6`}>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Reactivar publicación
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="show-listing-id"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    ID del listing
                  </label>
                  <input
                    id="show-listing-id"
                    type="text"
                    value={showListingId}
                    onChange={(e) => setShowListingId(e.target.value)}
                    placeholder="bbbbbbbb-bbbb-bbbb-bbbb-..."
                    className={INPUT_CLASS}
                    disabled={showLoading}
                  />
                </div>
                {showError !== "" ? (
                  <p className="text-sm text-red-600" role="alert">
                    {showError}
                  </p>
                ) : null}
                {showMsg !== "" ? (
                  <p className="text-sm text-green-600" role="status">
                    {showMsg}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleShowListing()}
                  disabled={showLoading}
                  className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showLoading ? "Reactivando..." : "Reactivar publicación"}
                </button>
              </div>
            </article>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
