// Static shell only — data wiring is a later phase (see README §13).
// Placeholder data — replace with API calls in the wiring phase.
const stats = [
  { label: "Personal volume", value: "—", hint: "This pay period" },
  { label: "Team members", value: "—", hint: "Left + right legs" },
  { label: "Open leads", value: "—", hint: "Buyers and sellers" },
  { label: "Pending commission", value: "—", hint: "Not yet paid out" },
];

const legs = { left: 0, right: 0, carryover: 0 };

const pipeline = [
  "New lead",
  "Site visit",
  "Negotiation",
  "Reserved",
  "Closed",
];

function Card({ title, action, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-brand-dark">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const total = legs.left + legs.right;
  const leftShare = total ? (legs.left / total) * 100 : 50;

  return (
    <div className="space-y-6 p-8">
      <header>
        <h1 className="font-serif text-2xl text-brand-dark">Good morning 👋</h1>
        <p className="text-gray-600">
          Dashboard data wiring comes in a later phase.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 font-serif text-3xl text-brand-dark">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <Card title="Binary leg balance">
        <div className="flex items-end justify-between text-sm">
          <div>
            <p className="text-gray-500">Left leg</p>
            <p className="font-serif text-2xl text-brand-dark">
              {legs.left.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Right leg</p>
            <p className="font-serif text-2xl text-brand-dark">
              {legs.right.toLocaleString()}
            </p>
          </div>
        </div>
        <div
          className="mt-3 flex h-3 overflow-hidden rounded-full bg-gray-100"
          role="img"
          aria-label={`Left leg ${Math.round(leftShare)} percent, right leg ${Math.round(100 - leftShare)} percent`}
        >
          <div className="bg-brand-dark" style={{ width: `${leftShare}%` }} />
          <div
            className="bg-gray-400"
            style={{ width: `${100 - leftShare}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Carryover: {legs.carryover.toLocaleString()} · Commission pays on the
          weaker leg.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Deal pipeline">
          <ol className="grid grid-cols-5 gap-2">
            {pipeline.map((stage) => (
              <li
                key={stage}
                className="rounded-md bg-gray-50 px-2 py-3 text-center"
              >
                <p className="font-serif text-xl text-brand-dark">0</p>
                <p className="text-xs text-gray-500">{stage}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Recent commissions">
          <EmptyState>
            No commissions yet. Closed deals and team volume will show up here.
          </EmptyState>
        </Card>

        <Card title="Recent leads">
          <EmptyState>
            No leads yet. Add your first lead to start tracking it.
          </EmptyState>
        </Card>

        <Card title="Newest team members">
          <EmptyState>
            No one has joined your team yet. Share your referral link to invite
            someone.
          </EmptyState>
        </Card>
      </div>
    </div>
  );
}
