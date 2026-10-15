// Must match server/src/modules/project-locations/locations.js.
export const LOCATIONS = ["Baguio", "La Union"];

export const LOCATION_OPTIONS = LOCATIONS.map((value) => ({
  value,
  label: value,
}));
