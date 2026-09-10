import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  useCustomer, usePayerAddresses, useReceiverAddresses,
  useDeactivateCustomer, useActivateCustomer,
  useSetDefaultPayer, useSetDefaultReceiver,
} from "../hooks/useCustomers";
import type { AddressResponse } from "../types/customer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { AddAddressModal } from "@/features/customers/components/AddAddressModal";

export function CustomerDetailsView() {
  const { id } = useParams();
  const customerId = id ? Number(id) : null;
  const navigate = useNavigate();

  const { data: customer, isLoading, isError } = useCustomer(customerId);
  const { data: payers } = usePayerAddresses(customerId);
  const { data: receivers } = useReceiverAddresses(customerId);

  const deactivate = useDeactivateCustomer();
  const activate = useActivateCustomer();
  const setDefaultPayer = useSetDefaultPayer();
  const setDefaultReceiver = useSetDefaultReceiver();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addrModal, setAddrModal] = useState<"payer" | "receiver" | null>(null);

  const onConfirmDeactivate = () => {
    if (!customer) return;
    deactivate.mutate(customer.id, { onSuccess: () => setConfirmOpen(false) });
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !customer) return <p className="text-red-600">Nie znaleziono klienta.</p>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/customers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        {customer.active
          ? <span className="text-green-700 text-sm">aktywny</span>
          : <span className="text-gray-400 text-sm">nieaktywny</span>}

        {customer.active ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-3 py-1"
          >
            Dezaktywuj
          </button>
        ) : (
          <button
            onClick={() => activate.mutate(customer.id)}
            disabled={activate.isPending}
            className="ml-auto text-green-700 hover:text-green-900 text-sm border border-green-300 rounded px-3 py-1 disabled:opacity-40"
          >
            Aktywuj
          </button>
        )}
      </div>

      {/* dane podstawowe */}
      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="font-medium text-gray-600 mb-3">Dane</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">NIP</dt>
          <dd>{customer.nip ?? "—"}</dd>
          <dt className="text-gray-500">E-mail</dt>
          <dd>{customer.email}</dd>
          <dt className="text-gray-500">Utworzono</dt>
          <dd>{new Date(customer.createdAt).toLocaleString("pl-PL")}</dd>
        </dl>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddressList
          title="Adresy płatnika"
          addresses={payers}
          defaultId={customer.defaultPayerId}
          onAdd={() => setAddrModal("payer")}
          onSetDefault={(addressId) => setDefaultPayer.mutate({ id: customer.id, addressId })}
        />
        <AddressList
          title="Adresy odbiorcy"
          addresses={receivers}
          defaultId={customer.defaultReceiverId}
          onAdd={() => setAddrModal("receiver")}
          onSetDefault={(addressId) => setDefaultReceiver.mutate({ id: customer.id, addressId })}
        />
      </div>

      {/* dodawanie adresu */}
      {addrModal && (
        <AddAddressModal
          open
          customerId={customer.id}
          type={addrModal}
          onClose={() => setAddrModal(null)}
        />
      )}

      {/* potwierdzenie dezaktywacji */}
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
    </div>
  );
}

function AddressList({
  title, addresses, defaultId, onAdd, onSetDefault,
}: {
  title: string;
  addresses: AddressResponse[] | undefined;
  defaultId: number | null;
  onAdd: () => void;
  onSetDefault: (addressId: number) => void;
}) {
  return (
    <section className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-gray-600">{title}</h2>
        <button onClick={onAdd} className="text-blue-600 hover:text-blue-800 text-sm">
          + Dodaj adres
        </button>
      </div>
      {!addresses || addresses.length === 0 ? (
        <p className="text-gray-400 text-sm">Brak adresów.</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="text-sm border rounded p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.street}</span>
                {a.id === defaultId ? (
                  <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">domyślny</span>
                ) : (
                  <button
                    onClick={() => onSetDefault(a.id)}
                    className="ml-auto text-xs text-gray-500 hover:text-blue-700"
                  >
                    Ustaw domyślny
                  </button>
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