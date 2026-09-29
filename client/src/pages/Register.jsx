import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import SplitAuthLayout from "../components/SplitAuthLayout";
import FormInput from "../components/FormInput";
import PrivacyNotice from "../components/PrivacyNotice";

import { registerUser } from "../features/auth/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    // Basic Information
    firstName: "",
    middleName: "",
    lastName: "",

    // Contact Information
    phone: "",
    otherContact: "",

    // Address
    city: "",
    country: "",

    // Personal Information
    birthdate: "",
    placeOfBirth: "",
    civilStatus: "",
    gender: "",

    // Tax Information
    taxIdentificationNumber: "",

    // Spouse Information
    spouseName: "",

    // Account Information
    email: "",
    password: "",
    confirmPassword: "",

    // Referral
    referrerCode: "",
  });

  const [idImage, setIdImage] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const [referrer, setReferrer] = useState(null);
  const [referrerLoading, setReferrerLoading] = useState(false);
  const [referrerError, setReferrerError] = useState("");

  useEffect(() => {
    const code = form.referrerCode.trim();

    if (!code) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setReferrerLoading(true);
        setReferrerError("");
        setReferrer(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/referrer/${encodeURIComponent(code)}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Referral code not found");
        }

        setReferrer(result.data);
      } catch (error) {
        setReferrerError(error.message);
      } finally {
        setReferrerLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.referrerCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Calculate age from birthdate.
  // Age is NOT stored in the database.
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";

    const today = new Date();
    const birthDate = new Date(birthdate);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "";
  };

  const age = calculateAge(form.birthdate);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) return;

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.append("privacyConsent", "true");

    if (idImage) {
      data.append("idImage", idImage);
    }

    const result = await dispatch(registerUser(data));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <SplitAuthLayout heading="Build your career with ESPI. Join the team shaping how families find home.">
      <h2 className="font-serif text-2xl mb-1">Create your account</h2>

      <p className="text-gray-600 mb-6">
        Set up access to manage listings, leads and clients.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* ==========================================
            BASIC INFORMATION
        ========================================== */}

        <h3 className="font-semibold text-lg mb-3">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Middle name"
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
          />

          <FormInput
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        {/* ==========================================
            CONTACT INFORMATION
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Contact number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <FormInput
            label="Other contact number"
            name="otherContact"
            value={form.otherContact}
            onChange={handleChange}
          />
        </div>

        <FormInput
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* ==========================================
            ADDRESS
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">Address</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <FormInput
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
          />
        </div>

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="Birthdate"
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
            />

            {age !== "" && (
              <p className="text-sm text-gray-500 mt-1">Age: {age}</p>
            )}
          </div>

          <FormInput
            label="Place of birth"
            name="placeOfBirth"
            value={form.placeOfBirth}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Civil status
            </label>

            <select
              name="civilStatus"
              value={form.civilStatus}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select civil status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="WIDOWED">Widowed</option>
              <option value="DIVORCED">Divorced</option>
              <option value="SEPARATED">Separated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* ==========================================
            TAX & SPOUSE INFORMATION
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">
          Additional Information
        </h3>

        <FormInput
          label="Tax Identification Number"
          name="taxIdentificationNumber"
          value={form.taxIdentificationNumber}
          onChange={handleChange}
        />

        <FormInput
          label="Name of spouse"
          name="spouseName"
          value={form.spouseName}
          onChange={handleChange}
        />

        {/* ==========================================
            REFERRAL
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">Referral</h3>

        <div className="mb-4">
          <FormInput
            label="Referral code"
            name="referrerCode"
            value={form.referrerCode}
            onChange={handleChange}
            placeholder="Enter referral code"
          />

          {referrerLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Checking referral code...
            </p>
          )}

          {referrer && !referrerLoading && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Referred by: {referrer.name}
            </p>
          )}

          {referrerError && !referrerLoading && (
            <p className="mt-1 text-sm text-red-600">✕ {referrerError}</p>
          )}
        </div>

        {/* ==========================================
            ACCOUNT SECURITY
        ========================================== */}

        <h3 className="font-semibold text-lg mt-6 mb-3">Account Security</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* ==========================================
            ID UPLOAD
        ========================================== */}

        <div className="mb-4 mt-6">
          <label className="block text-sm font-medium mb-1">
            Upload ID image
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setIdImage(e.target.files[0] || null)}
          />

          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: JPG, JPEG, PNG, PDF
          </p>
        </div>

        {/* ==========================================
            PRIVACY NOTICE
        ========================================== */}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Privacy Notice
          </label>

          <PrivacyNotice />
        </div>

        <label className="flex items-start gap-2 mb-6 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />

          <span>I agree to the Terms and Privacy Policy</span>
        </label>

        {/* ==========================================
            SUBMIT
        ========================================== */}

        <button
          type="submit"
          disabled={!agreed || status === "loading"}
          className="w-full bg-linear-to-r from-brand-gold to-yellow-600 text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
        >
          {status === "loading" ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm mt-4">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand-dark">
            Sign in instead
          </Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
