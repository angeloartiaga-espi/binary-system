import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";

import {
  fetchLotQuotations,
  deleteLotQuotation,
} from "../../features/lotQuotations/lotQuotationsSlice";

import LotQuotationModal from "./LotQuotationModal";
import ConfirmDialog from "../../components/ConfirmDialog";

const numberFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const currencyFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export default function LotQuotationList() {
  const { lotId } = useParams();
  const dispatch = useDispatch();

  const { quotations, pagination, loading, error } = useSelector(
    (state) => state.lotQuotations,
  );

  const [search, setSearch] = useState("");

  const [formModalQuotation, setFormModalQuotation] = useState(undefined);
  // undefined = closed
  // null = add
  // quotation object = edit

  const [quotationToDelete, setQuotationToDelete] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // FETCH QUOTATIONS
  // ==========================================

  useEffect(() => {
    if (!lotId) return;

    dispatch(
      fetchLotQuotations({
        lotId,
        page: 1,
        search,
      }),
    );
  }, [dispatch, lotId, search]);

  // ==========================================
  // REFRESH
  // ==========================================

  const refresh = () => {
    dispatch(
      fetchLotQuotations({
        lotId,
        page: 1,
        search,
      }),
    );
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleConfirmDelete = async () => {
    if (!quotationToDelete) return;

    setDeleting(true);

    const action = await dispatch(deleteLotQuotation(quotationToDelete.id));

    setDeleting(false);

    if (!action.error) {
      setQuotationToDelete(null);
      refresh();
    }
  };

  // ==========================================
  // MODAL SAVED
  // ==========================================

  const handleSaved = () => {
    setFormModalQuotation(undefined);
    refresh();
  };

  return (
    <div className="p-8">
      {/* BACK */}

      <Link to={-1} className="text-sm text-brand-dark/70 hover:underline">
        ← Back to Lots
      </Link>

      {/* HEADER */}

      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brand-dark">
            Lot Quotations
          </h1>

          <p className="text-sm text-gray-500">
            Manage quotations for this lot.
          </p>
        </div>

        <button
          onClick={() => setFormModalQuotation(null)}
          className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold"
        >
          Add new quotation
        </button>
      </div>

      {/* SEARCH */}

      <input
        placeholder="Search by lot number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
      />

      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load quotations."}
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Floor Area (sqm)</th>

              <th className="p-3">Total Contract Price</th>

              <th className="p-3">Downpayment</th>

              <th className="p-3">Balance</th>

              <th className="p-3">Interest</th>

              <th className="p-3">10 Years</th>

              <th className="p-3">15 Years</th>

              <th className="p-3">20 Years</th>

              <th className="p-3">25 Years</th>

              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="p-3" colSpan={10}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && quotations.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={10}>
                  No quotations yet for this lot.
                </td>
              </tr>
            )}

            {!loading &&
              quotations.map((quotation) => (
                <tr key={quotation.id} className="border-b last:border-0">
                  {/* FLOOR AREA */}

                  <td className="p-3 font-medium">
                    {numberFmt(quotation.floorAreaSqm)}
                  </td>

                  {/* CONTRACT PRICE */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.totalContractPrice)}
                  </td>

                  {/* DOWNPAYMENT */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.downpayment)}
                  </td>

                  {/* BALANCE */}

                  <td className="p-3">₱ {currencyFmt(quotation.balance)}</td>

                  {/* INTEREST */}

                  <td className="p-3">
                    {numberFmt(quotation.annualInterestRate)}%
                  </td>

                  {/* 10 YEARS */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.monthlyAmortization10Years)}
                  </td>

                  {/* 15 YEARS */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.monthlyAmortization15Years)}
                  </td>

                  {/* 20 YEARS */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.monthlyAmortization20Years)}
                  </td>

                  {/* 25 YEARS */}

                  <td className="p-3">
                    ₱ {currencyFmt(quotation.monthlyAmortization25Years)}
                  </td>

                  {/* ACTIONS */}

                  <td className="p-3 space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => setFormModalQuotation(quotation)}
                      className="text-brand-dark font-medium hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setQuotationToDelete(quotation)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <p className="text-sm text-gray-500 mt-3">
        Page {pagination?.page || 1} of {pagination?.totalPages || 1}
      </p>

      {/* ADD / EDIT MODAL */}

      {formModalQuotation !== undefined && (
        <LotQuotationModal
          lotId={lotId}
          existingQuotation={formModalQuotation}
          onClose={() => setFormModalQuotation(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* DELETE CONFIRMATION */}

      {quotationToDelete && (
        <ConfirmDialog
          title="Delete quotation"
          message="Are you sure you want to delete this quotation? This can't be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setQuotationToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
