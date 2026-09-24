import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { useResetPassword } from "../hooks/useUsers";
import { passwordResetSchema, type PasswordResetValues } from "../schemas/userForms";
import { ApiError } from "@/shared/services/apiClient";
import type { UserResponse } from "../types/user";

export function UserPasswordModal({ user, onClose }: { user: UserResponse; onClose: () => void }) {
  const reset = useResetPassword();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (v: PasswordResetValues) => {
    setServerError(null);
    try {
      await reset.mutateAsync({ id: user.id, body: v });
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zmiany hasła");
    }
  };

  return (
    <Modal open title={`Reset hasła: ${user.username}`} onClose={onClose}>
      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Nowe hasło</label>
          <input type="password" className={inputCls} {...register("newPassword")} placeholder="min. 6 znaków" />
          {errors.newPassword && <p className="text-red-600 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Ustaw hasło"}
          </button>
        </div>
      </form>
    </Modal>
  );
}