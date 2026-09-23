import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/Modal";
import { useCreateUser } from "../hooks/useUsers";
import { userCreateSchema, type UserCreateValues } from "../schemas/userForms";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

export function UserCreateModal({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserCreateValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { roleName: "USER" },
  });

  const onSubmit = async (v: UserCreateValues) => {
    setServerError(null);
    try {
      await createUser.mutateAsync(v);
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu użytkownika");
    }
  };

  return (
    <Modal open title="Nowy użytkownik" onClose={onClose}>
      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Login</label>
          <input className={inputCls} {...register("username")} placeholder="np. jkowalski" />
          {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Hasło</label>
          <input type="password" className={inputCls} {...register("password")} placeholder="min. 6 znaków" />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Imię i nazwisko</label>
          <input className={inputCls} {...register("fullName")} placeholder="Jan Kowalski" />
          {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Rola</label>
          <select className={inputCls} {...register("roleName")}>
            <option value="USER">USER - pracownik</option>
            <option value="MANAGER">MANAGER - kierownik</option>
            <option value="ADMIN">ADMIN - administrator</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Utwórz użytkownika"}
          </button>
        </div>
      </form>
    </Modal>
  );
}