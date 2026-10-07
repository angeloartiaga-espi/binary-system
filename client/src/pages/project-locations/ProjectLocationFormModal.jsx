import { useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import Modal from "../../components/Modal";

import {
  createProjectLocation,
  updateProjectLocation,
} from "../../features/projectLocations/projectLocationsSlice";

const STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
];

const createEmptyForm = () => ({
  projectName: "",
  location: "",
  totalLotAreaSqm: "",
  description: "",
  status: "ACTIVE",
});

const createFormFromProject = (project) => {
  if (!project) {
    return createEmptyForm();
  }

  return {
    projectName: project.projectName || "",
    location: project.location || "",
    totalLotAreaSqm: String(project.totalLotAreaSqm ?? ""),
    description: project.description || "",
    status: project.status || "ACTIVE",
  };
};

// existingProject is null when adding,
// or a project object when editing.
export default function ProjectLocationFormModal({
  existingProject,
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(existingProject);

  const [form, setForm] = useState(() =>
    createFormFromProject(existingProject),
  );

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      // Basic validation
      if (!form.projectName.trim()) {
        setError("Project name is required.");
        setSaving(false);
        return;
      }

      if (!form.location.trim()) {
        setError("Location is required.");
        setSaving(false);
        return;
      }

      if (!form.totalLotAreaSqm) {
        setError("Total lot area is required.");
        setSaving(false);
        return;
      }

      const totalLotArea = Number(form.totalLotAreaSqm);

      if (!Number.isFinite(totalLotArea) || totalLotArea <= 0) {
        setError("Total lot area must be greater than 0.");
        setSaving(false);
        return;
      }

      const payload = {
        projectName: form.projectName.trim(),
        location: form.location.trim(),
        totalLotAreaSqm: form.totalLotAreaSqm,
        description: form.description.trim() || undefined,
        status: form.status,
      };

      let action;

      if (isEdit) {
        action = await dispatch(
          updateProjectLocation({
            id: existingProject.id,
            payload,
          }),
        );
      } else {
        action = await dispatch(createProjectLocation(payload));
      }

      if (action.error) {
        setError(
          action.payload ||
            action.error?.message ||
            "Something went wrong while saving the project.",
        );

        return;
      }

      onSaved();
    } catch (err) {
      setError(
        err?.message || "Something went wrong while saving the project.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Project Location" : "Add Project Location"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Project Name */}
        <FormInput
          label="Project Name"
          name="projectName"
          value={form.projectName}
          onChange={handleChange}
          placeholder="Enter project name"
          required
        />

        {/* Location */}
        <FormInput
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Enter project location"
          required
        />

        {/* Total Lot Area */}
        <FormInput
          label="Total Lot Area (sqm)"
          name="totalLotAreaSqm"
          type="number"
          value={form.totalLotAreaSqm}
          onChange={handleChange}
          placeholder="Enter total lot area"
          min="0"
          step="0.01"
          required
        />

        {/* Status */}
        <FormSelect
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
        />

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter project description"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#004369] focus:ring-1 focus:ring-[#004369]"
          />
        </div>

        {/* Inventory Information */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Lot Inventory</p>

          <p className="mt-1 text-xs text-gray-500">
            Cuts, Inc. Road and Available Cuts are automatically calculated
            based on the status of the project's lots.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Cuts, Inc. Road</span>

              <p className="mt-1 text-gray-500">SOLD + HOLD + RESERVED</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Available Cuts</span>

              <p className="mt-1 text-gray-500">OPEN + RE_OPEN + RFO</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#004369] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Project"
                : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
