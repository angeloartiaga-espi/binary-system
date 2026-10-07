import { useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import Modal from "../../components/Modal";

import { createLot, updateLot } from "../../features/lots/lotsSlice";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "SOLD", label: "Sold" },
  { value: "RE_OPEN", label: "Re-open" },
  { value: "HOLD", label: "Hold" },
  { value: "RESERVED", label: "Reserved" },
  { value: "RFO", label: "RFO" },
];

const createFormFromLot = (lot) => {
  if (!lot) {
    return {
      lotNumber: "",
      lotAreaSqm: "",
      status: "OPEN",
      remarks: "",
    };
  }

  return {
    lotNumber: lot.lotNumber || "",
    lotAreaSqm: String(lot.lotAreaSqm ?? ""),
    status: lot.status || "OPEN",
    remarks: lot.remarks || "",
  };
};

export default function LotFormModal({
  projectLocationId,
  existingLot,
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(existingLot);

  const [form, setForm] = useState(() => createFormFromLot(existingLot));

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      // -----------------------------
      // VALIDATION
      // -----------------------------

      if (!form.lotNumber.trim()) {
        setError("Lot number is required.");
        return;
      }

      if (!form.lotAreaSqm) {
        setError("Lot area is required.");
        return;
      }

      const lotArea = Number(form.lotAreaSqm);

      if (!Number.isFinite(lotArea) || lotArea <= 0) {
        setError("Lot area must be greater than 0.");
        return;
      }

      // -----------------------------
      // PAYLOAD
      // -----------------------------

      const payload = {
        lotNumber: form.lotNumber.trim(),
        lotAreaSqm: form.lotAreaSqm,
        status: form.status,
        remarks: form.remarks.trim() || undefined,
      };

      // -----------------------------
      // CREATE / UPDATE
      // -----------------------------

      let action;

      if (isEdit) {
        action = await dispatch(
          updateLot({
            id: existingLot.id,
            payload,
          }),
        );
      } else {
        action = await dispatch(
          createLot({
            ...payload,
            projectLocationId,
          }),
        );
      }

      // -----------------------------
      // ERROR HANDLING
      // -----------------------------

      if (action.error) {
        setError(
          action.payload ||
            action.error?.message ||
            "Something went wrong while saving the lot.",
        );

        return;
      }

      // -----------------------------
      // SUCCESS
      // -----------------------------

      onSaved();
    } catch (err) {
      setError(err?.message || "Something went wrong while saving the lot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Lot" : "Add New Lot"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <FormInput
          label="Lot Number"
          name="lotNumber"
          value={form.lotNumber}
          onChange={handleChange}
          placeholder="e.g. Lot 1, Block 1 Lot 5"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Lot Area (sqm)"
            type="number"
            step="0.01"
            min="0"
            name="lotAreaSqm"
            value={form.lotAreaSqm}
            onChange={handleChange}
            placeholder="Enter lot area"
            required
          />

          <FormSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            placeholder={null}
          />
        </div>

        <FormInput
          label="Remarks (Optional)"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Enter remarks"
        />

        <div className="flex gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-[#004369] px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Lot"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
