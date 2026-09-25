import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { username } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 text-2xl">
          ⛔
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Błąd 403</p>
        <h1 className="text-2xl font-semibold text-gray-800 mt-1">Brak dostępu</h1>
        <p className="text-sm text-gray-500 mt-3">
          Konto <span className="font-medium text-gray-700">{username}</span> nie ma uprawnień do tej strony.
          Jeśli uważasz, że to błąd, skontaktuj się z administratorem.
        </p>

        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
            ← Wróć
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer">
            Przejdź do pulpitu
          </button>
        </div>
      </div>
    </div>
  );
}