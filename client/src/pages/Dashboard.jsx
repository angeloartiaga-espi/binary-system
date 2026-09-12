// Static shell only — data wiring is a later phase (see README §13).
export default function Dashboard() {
    return (
        <div className="p-8">
            <h1 className="font-serif text-2xl text-brand-dark">Good morning 👋</h1>
            <p className="text-gray-600">Dashboard data wiring comes in a later phase.</p>
        </div>
    );
}
