import { useState } from "react";
import { useUsers, useActivateUser, useDeactivateUser } from "../hooks/useUsers";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { UserCreateModal } from "../components/UserCreateModal";
import { UserRoleModal } from "../components/UserRoleModal";
import { UserPasswordModal } from "../components/UserPasswordModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Modal } from "@/shared/components/Modal";
import { ApiError } from "@/shared/services/apiClient";
import type { UserResponse } from "../types/user";

export function UsersView() {
  const { data: users, isLoading, isError } = useUsers();
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<UserResponse | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserResponse | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<UserResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDeactivate = () => {
    if (!deactivateUser) return;
    deactivate.mutate(deactivateUser.id, {
      onSuccess: () => setDeactivateUser(null),
      onError: (err) => {
        setDeactivateUser(null);
        setErrorMessage(err instanceof ApiError ? err.detail : "Błąd dezaktywacji");
      },
    });
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError) return <p className="text-red-600">Błąd ładowania użytkowników.</p>;

  const activeCount = users?.filter((u) => u.enabled).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Użytkownicy</h1>
          <p className="text-sm text-gray-400 mt-1">
            {users?.length ?? 0} kont · {activeCount} aktywnych
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Nowy użytkownik
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-medium">Użytkownik</th>
              <th className="px-5 py-3 font-medium">Rola</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar fullName={u.fullName} username={u.username} />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 truncate">{u.fullName}</div>
                      <div className="text-xs text-gray-400 font-mono">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><RoleBadge role={u.roleName} /></td>
                <td className="px-5 py-3">
                  {u.enabled ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aktywny
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Nieaktywny
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setRoleUser(u)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
                      Edytuj
                    </button>
                    <button onClick={() => setPasswordUser(u)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
                      Hasło
                    </button>
                    {u.enabled ? (
                      <button onClick={() => setDeactivateUser(u)}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded cursor-pointer">
                        Dezaktywuj
                      </button>
                    ) : (
                      <button onClick={() => activate.mutate(u.id)}
                        disabled={activate.isPending}
                        className="px-2.5 py-1 text-xs text-green-700 hover:bg-green-50 rounded cursor-pointer disabled:opacity-40">
                        Aktywuj
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && <UserCreateModal onClose={() => setCreateOpen(false)} />}
      {roleUser && <UserRoleModal user={roleUser} onClose={() => setRoleUser(null)} />}
      {passwordUser && <UserPasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />}

      <ConfirmModal
        open={deactivateUser !== null}
        title="Dezaktywować użytkownika?"
        message={deactivateUser ? `Konto „${deactivateUser.username}" zostanie zablokowane a użytkownik nie będzie mógł się zalogować.` : ""}
        confirmLabel="Dezaktywuj"
        danger
        loading={deactivate.isPending}
        onConfirm={onDeactivate}
        onCancel={() => setDeactivateUser(null)}
      />

      <Modal open={errorMessage !== null} title="Nie można wykonać operacji" onClose={() => setErrorMessage(null)}>
        <div className="flex gap-3 mb-5">
          <span className="text-red-500 text-2xl leading-none">⚠</span>
          <p className="text-sm text-gray-800">{errorMessage}</p>
        </div>
        <div className="flex justify-end">
          <button onClick={() => setErrorMessage(null)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">OK</button>
        </div>
      </Modal>
    </div>
  );
}