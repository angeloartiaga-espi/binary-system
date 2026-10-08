import { useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";

import {
  createLotQuotation,
  updateLotQuotation,
} from "../../features/lotQuotations/lotQuotationsSlice";

const DEFAULT_INTEREST_RATE = 6.5;

// ==========================================
// CREATE FORM
// ==========================================

const createFormFromQuotation = (quotation, lotId) => {
  if (!quotation) {
    return {
      lotId: lotId || "",
      floorAreaSqm: "",
      totalContractPrice: "",
      downpayment: "",
      annualInterestRate: DEFAULT_INTEREST_RATE,
    };
  }

  return {
    lotId: quotation.lotId || lotId || "",
    floorAreaSqm: String(quotation.floorAreaSqm ?? ""),
    totalContractPrice: String(quotation.totalContractPrice ?? ""),
    downpayment: String(quotation.downpayment ?? ""),
    annualInterestRate: String(
      quotation.annualInterestRate ?? DEFAULT_INTEREST_RATE,
    ),
  };
};

// ==========================================
// CALCULATE MONTHLY AMORTIZATION
// ==========================================

const calculateMonthlyAmortization = (principal, annualInterestRate, years) => {
  const P = Number(principal);
  const annualRate = Number(annualInterestRate);

  if (!P || P <= 0) {
    return 0;
  }

  if (!annualRate || annualRate === 0) {
    return P / (years * 12);
  }

  const monthlyRate = annualRate / 100 / 12;

  const numberOfPayments = years * 12;

  const factor = Math.pow(1 + monthlyRate, numberOfPayments);

  return (P * monthlyRate * factor) / (factor - 1);
};

// ==========================================
// FORMAT CURRENCY
// ==========================================

const formatCurrency = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ==========================================
// COMPONENT
// ==========================================

export default function LotQuotationModal({
  lotId,
  existingQuotation,
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(existingQuotation);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [form, setForm] = useState(() =>
    createFormFromQuotation(existingQuotation, lotId),
  );

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // CALCULATED VALUES
  // ==========================================

  const totalContractPrice = Number(form.totalContractPrice) || 0;

  const downpayment = Number(form.downpayment) || 0;

  const interestRate = Number(form.annualInterestRate) || DEFAULT_INTEREST_RATE;

  // Balance

  const balance = Math.max(totalContractPrice - downpayment, 0);

  // 10 Years

  const amortization10 = calculateMonthlyAmortization(
    balance,
    interestRate,
    10,
  );

  // 15 Years

  const amortization15 = calculateMonthlyAmortization(
    balance,
    interestRate,
    15,
  );

  // 20 Years

  const amortization20 = calculateMonthlyAmortization(
    balance,
    interestRate,
    20,
  );

  // 25 Years

  const amortization25 = calculateMonthlyAmortization(
    balance,
    interestRate,
    25,
  );

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError(null);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      // --------------------------------------
      // LOT ID
      // --------------------------------------

      if (!form.lotId) {
        setError("Lot is required.");
        return;
      }

      // --------------------------------------
      // FLOOR AREA
      // --------------------------------------

      if (!form.floorAreaSqm) {
        setError("Floor area is required.");
        return;
      }

      const floorArea = Number(form.floorAreaSqm);

      if (!Number.isFinite(floorArea) || floorArea <= 0) {
        setError("Floor area must be greater than 0.");
        return;
      }

      // --------------------------------------
      // TOTAL CONTRACT PRICE
      // --------------------------------------

      if (!form.totalContractPrice) {
        setError("Total contract price is required.");
        return;
      }

      if (!Number.isFinite(totalContractPrice) || totalContractPrice <= 0) {
        setError("Total contract price must be greater than 0.");
        return;
      }

      // --------------------------------------
      // DOWNPAYMENT
      // --------------------------------------

      if (!form.downpayment) {
        setError("Downpayment is required.");
        return;
      }

      if (!Number.isFinite(downpayment) || downpayment < 0) {
        setError("Downpayment cannot be negative.");
        return;
      }

      if (downpayment > totalContractPrice) {
        setError("Downpayment cannot be greater than total contract price.");
        return;
      }

      // --------------------------------------
      // PAYLOAD
      // --------------------------------------

      const payload = {
        lotId: form.lotId,

        floorAreaSqm: floorArea,

        totalContractPrice: totalContractPrice,

        downpayment: downpayment,

        // Automatically calculated
        balance: Number(balance.toFixed(2)),

        annualInterestRate: interestRate,

        // Automatically calculated
        monthlyAmortization10Years: Number(amortization10.toFixed(2)),

        monthlyAmortization15Years: Number(amortization15.toFixed(2)),

        monthlyAmortization20Years: Number(amortization20.toFixed(2)),

        monthlyAmortization25Years: Number(amortization25.toFixed(2)),
      };

      // --------------------------------------
      // CREATE / UPDATE
      // --------------------------------------

      let action;

      if (isEdit) {
        action = await dispatch(
          updateLotQuotation({
            id: existingQuotation.id,
            data: payload,
          }),
        );
      } else {
        action = await dispatch(createLotQuotation(payload));
      }

      // --------------------------------------
      // ERROR HANDLING
      // --------------------------------------

      if (action.error) {
        setError(
          action.payload ||
            action.error?.message ||
            "Something went wrong while saving the quotation.",
        );

        return;
      }

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      onSaved();
    } catch (err) {
      setError(
        err?.message || "Something went wrong while saving the quotation.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Modal
      title={isEdit ? "Edit Lot Quotation" : "Add New Lot Quotation"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FLOOR AREA */}

        <FormInput
          label="Floor Area (sqm)"
          type="number"
          step="0.01"
          min="0"
          name="floorAreaSqm"
          value={form.floorAreaSqm}
          onChange={handleChange}
          placeholder="Enter floor area"
          required
        />

        {/* TOTAL CONTRACT PRICE */}

        <FormInput
          label="Total Contract Price"
          type="number"
          step="0.01"
          min="0"
          name="totalContractPrice"
          value={form.totalContractPrice}
          onChange={handleChange}
          placeholder="Enter total contract price"
          required
        />

        {/* DOWNPAYMENT */}

        <FormInput
          label="Downpayment"
          type="number"
          step="0.01"
          min="0"
          name="downpayment"
          value={form.downpayment}
          onChange={handleChange}
          placeholder="Enter downpayment"
          required
        />

        {/* BALANCE */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Balance
          </label>

          <input
            type="text"
            value={`₱ ${formatCurrency(balance)}`}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700"
          />

          <p className="mt-1 text-xs text-gray-500">
            Automatically calculated from total contract price minus
            downpayment.
          </p>
        </div>

        {/* INTEREST RATE */}

        <FormInput
          label="Annual Interest Rate (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          name="annualInterestRate"
          value={form.annualInterestRate}
          onChange={handleChange}
          placeholder="6.50"
          required
        />

        {/* MONTHLY AMORTIZATION */}

        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Monthly Amortization
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 10 YEARS */}

            <FormInput
              label="10 Years"
              value={`₱ ${formatCurrency(amortization10)}`}
              readOnly
            />

            {/* 15 YEARS */}

            <FormInput
              label="15 Years"
              value={`₱ ${formatCurrency(amortization15)}`}
              readOnly
            />

            {/* 20 YEARS */}

            <FormInput
              label="20 Years"
              value={`₱ ${formatCurrency(amortization20)}`}
              readOnly
            />

            {/* 25 YEARS */}

            <FormInput
              label="25 Years"
              value={`₱ ${formatCurrency(amortization25)}`}
              readOnly
            />
          </div>
        </div>

        {/* BUTTONS */}

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
            {saving
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Quotation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
