// How lot statuses roll up into the three columns on the Project Locations
// table. Every LotStatus belongs to exactly one group, so
// cuts === incRoad + availableCuts always holds.
export const INC_ROAD_STATUSES = ["SOLD", "HOLD", "RESERVED"];
export const AVAILABLE_STATUSES = ["OPEN", "RE_OPEN", "RFO"];

export const emptyCounts = () => ({ cuts: 0, incRoad: 0, availableCuts: 0 });

// rows = result of prisma.lot.groupBy({ by: ['projectLocationId', 'status'], _count: { _all: true } })
//   e.g. [{ projectLocationId: 'a', status: 'SOLD', _count: { _all: 3 } }, ...]
// Returns a Map: projectLocationId -> { cuts, incRoad, availableCuts }
export function summarizeLotCounts(rows) {
  const byProject = new Map();

  for (const row of rows) {
    const counts = byProject.get(row.projectLocationId) ?? emptyCounts();
    const n = row._count._all;

    if (INC_ROAD_STATUSES.includes(row.status)) counts.incRoad += n;
    else if (AVAILABLE_STATUSES.includes(row.status)) counts.availableCuts += n;

    counts.cuts += n; // a status in neither group still counts as a cut
    byProject.set(row.projectLocationId, counts);
  }

  return byProject;
}
