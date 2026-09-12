import { Link } from 'react-router-dom';

// Placeholder only — replace with the real landing page design later.
export default function Landing() {
    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center text-center px-6">
            <span className="text-brand-gold text-4xl mb-4">⌂</span>
            <h1 className="font-serif text-3xl text-brand-dark mb-2">
                ESTATE SITE PROPERTIES INC.
            </h1>
            <p className="text-gray-600 mb-8">Landing page coming soon.</p>

            <div className="flex gap-4">
                <Link
                    to="/login"
                    className="border border-brand-dark text-brand-dark font-semibold px-6 py-2 rounded-md"
                >
                    Sign in
                </Link>
                <Link
                    to="/register"
                    className="bg-brand-gold text-brand-dark font-semibold px-6 py-2 rounded-md"
                >
                    Create account
                </Link>
            </div>
        </div>
    );
}