// Reusable shell matching the two auth screenshots: dark-green left panel
// with logo + heading, cream right panel with the form.
export default function SplitAuthLayout({ heading, children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="md:w-2/5 bg-brand-dark text-white p-10 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-16">
                        <span className="text-brand-gold text-2xl">⌂</span>
                        <div>
                            <p className="font-bold tracking-wide">ESTATE SITE PROPERTIES INC.</p>
                            <p className="text-xs text-gray-300">Your Dream Home. Our Completion.</p>
                        </div>
                    </div>
                    <h1 className="font-serif text-3xl leading-snug">{heading}</h1>
                </div>
                <p className="text-xs text-gray-400">© 2026 Estate Site Properties Inc. All rights reserved.</p>
            </div>

            <div className="md:w-3/5 bg-brand-cream flex items-center justify-center p-8">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
