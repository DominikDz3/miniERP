import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  useCustomer, usePayerAddresses, useReceiverAddresses,
  useDeactivateCustomer, useActivateCustomer,
  useSetDefaultPayer, useSetDefaultReceiver,
  useRemovePayer, useRemoveReceiver,
} from "../hooks/useCustomers";
import type { AddressResponse } from "../types/customer";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ApiError } from "@/shared/services/apiClient";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { AddressModal } from "@/features/customers/components/AddressModal";
import { EditCustomerModal } from "@/features/customers/components/EditCustomerModal";
import { CustomerOrderHistory } from "@/features/customers/components/CustomerOrderHistory";

type AddressType = "payer" | "receiver";

export function CustomerDetailsView() {
  const { id } = useParams();
  const customerId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const canWrite = hasAuthority("CLIENT_WRITE");

  const { data: customer, isLoading, isError } = useCustomer(customerId);
  const { data: payers } = usePayerAddresses(customerId);
  const { data: receivers } = useReceiverAddresses(customerId);

  const deactivate = useDeactivateCustomer();
  const activate = useActivateCustomer();
  const setDefaultPayer = useSetDefaultPayer();
  const setDefaultReceiver = useSetDefaultReceiver();
  const removePayer = useRemovePayer();
  const removeReceiver = useRemoveReceiver();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addrModal, setAddrModal] = useState<{ type: AddressType; address: AddressResponse | null } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ type: AddressType; address: AddressResponse } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const onConfirmDeactivate = () => {
    if (!customer) return;
    deactivate.mutate(customer.id, { onSuccess: () => setConfirmOpen(false) });
  };

  const onConfirmRemove = () => {
    if (!customer || !removeTarget) return;
    setActionError(null);
    const vars = { id: customer.id, addressId: removeTarget.address.id };
    const callbacks = {
      onSuccess: () => setRemoveTarget(null),
      onError: (err: Error) => {
        setRemoveTarget(null);
        setActionError(err instanceof ApiError ? err.detail : "Błąd usuwania adresu");
      },
    };
    if (removeTarget.type === "payer") {
      removePayer.mutate(vars, callbacks);
    } else {
      removeReceiver.mutate(vars, callbacks);
    }
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !customer) return <p className="text-red-600">Nie znaleziono klienta.</p>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/customers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        {customer.active ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aktywny
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Nieaktywny
          </span>
        )}

        {canWrite && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1.5 cursor-pointer">
              Edytuj
            </button>
            {customer.active ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="text-sm text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer">
                Dezaktywuj
              </button>
            ) : (
              <button
                onClick={() => activate.mutate(customer.id)}
                disabled={activate.isPending}
                className="text-sm text-green-700 hover:bg-green-50 rounded-lg px-3 py-1.5 disabled:opacity-40 cursor-pointer">
                Aktywuj
              </button>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{actionError}</p>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Dane</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">NIP</dt>
          <dd className="text-gray-800">{customer.nip ?? "—"}</dd>
          <dt className="text-gray-500">E-mail</dt>
          <dd className="text-gray-800">{customer.email}</dd>
          <dt className="text-gray-500">Utworzono</dt>
          <dd className="text-gray-800">{new Date(customer.createdAt).toLocaleString("pl-PL")}</dd>
        </dl>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddressList
          title="Adresy płatnika"
          addresses={payers}
          defaultId={customer.defaultPayerId}
          canWrite={canWrite}
          onAdd={() => setAddrModal({ type: "payer", address: null })}
          onEdit={(a) => setAddrModal({ type: "payer", address: a })}
          onRemove={(a) => setRemoveTarget({ type: "payer", address: a })}
          onSetDefault={(addressId) => setDefaultPayer.mutate({ id: customer.id, addressId })}
        />
        <AddressList
          title="Adresy odbiorcy"
          addresses={receivers}
          defaultId={customer.defaultReceiverId}
          canWrite={canWrite}
          onAdd={() => setAddrModal({ type: "receiver", address: null })}
          onEdit={(a) => setAddrModal({ type: "receiver", address: a })}
          onRemove={(a) => setRemoveTarget({ type: "receiver", address: a })}
          onSetDefault={(addressId) => setDefaultReceiver.mutate({ id: customer.id, addressId })}
        />
      </div>

      {hasAuthority("SALES_READ") && <CustomerOrderHistory customerId={customer.id} />}

      {addrModal && (
        <AddressModal
          customerId={customer.id}
          type={addrModal.type}
          address={addrModal.address}
          onClose={() => setAddrModal(null)}
        />
      )}

      {editOpen && (
        <EditCustomerModal customer={customer} onClose={() => setEditOpen(false)} />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Dezaktywować klienta?"
        message={`Klient „${customer.name}" zostanie oznaczony jako nieaktywny. Możesz go później przywrócić.`}
        confirmLabel="Dezaktywuj"
        danger
        loading={deactivate.isPending}
        onConfirm={onConfirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmModal
        open={removeTarget !== null}
        title="Usunąć adres?"
        message={removeTarget ? `Adres „${removeTarget.address.street}, ${removeTarget.address.city}" zniknie z listy. Stare zamówienia zachowają ten adres.` : ""}
        confirmLabel="Usuń"
        danger
        loading={removePayer.isPending || removeReceiver.isPending}
        onConfirm={onConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function AddressList({
  title, addresses, defaultId, canWrite, onAdd, onEdit, onRemove, onSetDefault,
}: {
  title: string;
  addresses: AddressResponse[] | undefined;
  defaultId: number | null;
  canWrite: boolean;
  onAdd: () => void;
  onEdit: (address: AddressResponse) => void;
  onRemove: (address: AddressResponse) => void;
  onSetDefault: (addressId: number) => void;
}) {
  const canRemove = addresses !== undefined && addresses.length > 1;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500">{title}</h2>
        {canWrite && (
          <button onClick={onAdd} className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
            + Dodaj adres
          </button>
        )}
      </div>
      {!addresses || addresses.length === 0 ? (
        <p className="text-gray-400 text-sm">Brak adresów.</p>
      ) : (
        <ul className="space-y-2">
          {addresses.map((a) => (
            <li key={a.id} className="text-sm border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{a.street}</span>
                {a.id === defaultId && (
                  <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">domyślny</span>
                )}
                {canWrite && (
                  <div className="ml-auto flex gap-3">
                    {a.id !== defaultId && (
                      <button
                        onClick={() => onSetDefault(a.id)}
                        className="text-xs text-gray-400 hover:text-blue-700 cursor-pointer">
                        Ustaw domyślny
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(a)}
                      className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer">
                      Edytuj
                    </button>
                    {canRemove && (
                      <button
                        onClick={() => onRemove(a)}
                        className="text-xs text-gray-400 hover:text-red-600 cursor-pointer">
                        Usuń
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="text-gray-600">{a.postalCode} {a.city}, {a.country}</div>
              {a.phone && <div className="text-gray-500 mt-1">tel. {a.phone}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}