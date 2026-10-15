import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import Modal from "../../components/Modal";

import { LOCATIONS, LOCATION_OPTIONS } from "../../constants/locations.js";

import {
  createProjectLocation,
  updateProjectLocation,
} from "../../features/projectLocations/projectLocationsSlice";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "COMPLETED"].map((value) => ({
  value,
  label: value,
}));

const makeEmptyForm = (location = "") => ({
  projectName: "",
  location,
  totalLotAreaSqm: "",
  description: "",
  status: "ACTIVE",
});

const makeFormFromProject = (project) => ({
  projectName: project.projectName ?? "",
  location: project.location ?? "",
  totalLotAreaSqm: String(project.totalLotAreaSqm ?? ""),
  description: project.description ?? "",
  status: project.status || "ACTIVE",
});

export default function ProjectLocationFormModal({
  existingProject,
  defaultLocation = "",
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();
  const isEdit = Boolean(existingProject);

  // Preserve a legacy location when editing an existing project.
  const locationOptions = useMemo(() => {
    const currentLocation = existingProject?.location;

    if (currentLocation && !LOCATIONS.includes(currentLocation)) {
      return [
        ...LOCATION_OPTIONS,
        {
          value: currentLocation,
          label: `${currentLocation} (current)`,
        },
      ];
    }

    return LOCATION_OPTIONS;
  }, [existingProject]);

  // Initialize the form from the selected project or current location tab.
  const [form, setForm] = useState(() =>
    existingProject
      ? makeFormFromProject(existingProject)
      : makeEmptyForm(defaultLocation),
  );

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...form,
        totalLotAreaSqm: Number(form.totalLotAreaSqm),
      };

      const action = isEdit
        ? await dispatch(
            updateProjectLocation({
              id: existingProject.id,
              payload,
            }),
          )
        : await dispatch(createProjectLocation(payload));

      if (action.meta?.requestStatus === "rejected" || action.error) {
        setError(action.payload || "Unable to save the project location.");
        return;
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit project location" : "Add new project location"}
      onClose={onClose}
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {typeof error === "string"
            ? error
            : "Unable to save the project location. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project Information */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormInput
              label="Project name"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              required
            />
          </div>

          <FormSelect
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            options={locationOptions}
            placeholder="Select location"
            required
          />

          <FormInput
            label="Total lot area (sqm)"
            type="number"
            step="0.01"
            min="0"
            name="totalLotAreaSqm"
            value={form.totalLotAreaSqm}
            onChange={handleChange}
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

          <FormInput
            label="Description (optional)"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Automatic Lot Count Information */}
        <div className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <i className="fa-solid fa-circle-info mt-0.5 text-[#004369]" />

          <p className="text-xs leading-relaxed text-gray-600">
            Cuts, Inc. Road and Available Cuts are automatically calculated from
            this project's lots.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-md border border-gray-300 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-brand-gold py-2.5 font-semibold text-brand-dark transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create project"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
