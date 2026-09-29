import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import SplitAuthLayout from "../components/SplitAuthLayout";
import FormInput from "../components/FormInput";
import { loginUser } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <SplitAuthLayout heading="Welcome back to the portal where your listings, leads and closings live in one place.">
      <h2 className="font-serif text-2xl mb-1">Sign in to your account</h2>
      <p className="text-gray-600 mb-6">
        Enter your details to access your dashboard.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-linear-to-r from-brand-gold to-yellow-600 text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm mt-4">
          New to Estate Site Properties?{" "}
          <Link to="/register" className="font-semibold text-brand-dark">
            Create an account
          </Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}
