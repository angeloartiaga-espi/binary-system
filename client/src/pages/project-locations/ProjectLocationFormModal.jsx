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
  roadAreaSqm: "",
  availableLotAreaSqm: "",
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
    roadAreaSqm: project.roadAreaSqm != null ? String(project.roadAreaSqm) : "",
    availableLotAreaSqm:
      project.availableLotAreaSqm != null
        ? String(project.availableLotAreaSqm)
        : "",
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

  const [availableTouched, setAvailableTouched] = useState(
    Boolean(existingProject?.availableLotAreaSqm),
  );

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Handle all form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user manually changes available lot area,
    // don't automatically calculate it anymore.
    if (name === "availableLotAreaSqm") {
      setAvailableTouched(true);

      setForm((prev) => ({
        ...prev,
        availableLotAreaSqm: value,
      }));

      return;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      // Automatically calculate:
      // Available Lot Area = Total Lot Area - Road Area
      if (
        !availableTouched &&
        (name === "totalLotAreaSqm" || name === "roadAreaSqm")
      ) {
        const total =
          name === "totalLotAreaSqm"
            ? Number(value)
            : Number(prev.totalLotAreaSqm);

        const road =
          name === "roadAreaSqm"
            ? Number(value) || 0
            : Number(prev.roadAreaSqm) || 0;

        if (Number.isFinite(total) && total >= 0) {
          const available = total - road;

          next.availableLotAreaSqm = available >= 0 ? String(available) : "0";
        } else {
          next.availableLotAreaSqm = "";
        }
      }

      return next;
    });
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

      // Make sure available area is not greater than total area
      const totalLotArea = Number(form.totalLotAreaSqm);
      const roadArea = Number(form.roadAreaSqm) || 0;
      const availableLotArea = Number(form.availableLotAreaSqm) || 0;

      if (roadArea > totalLotArea) {
        setError("Road area cannot be greater than the total lot area.");
        setSaving(false);
        return;
      }

      if (availableLotArea > totalLotArea) {
        setError(
          "Available lot area cannot be greater than the total lot area.",
        );
        setSaving(false);
        return;
      }

      const payload = {
        projectName: form.projectName.trim(),
        location: form.location.trim(),
        totalLotAreaSqm: form.totalLotAreaSqm,
        roadAreaSqm: form.roadAreaSqm || undefined,
        availableLotAreaSqm: form.availableLotAreaSqm || undefined,
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

        {/* Road Area */}
        <FormInput
          label="Road Area (sqm)"
          name="roadAreaSqm"
          type="number"
          value={form.roadAreaSqm}
          onChange={handleChange}
          placeholder="Enter road area"
          min="0"
          step="0.01"
        />

        {/* Available Lot Area */}
        <FormInput
          label="Available Lot Area (sqm)"
          name="availableLotAreaSqm"
          type="number"
          value={form.availableLotAreaSqm}
          onChange={handleChange}
          placeholder="Automatically calculated"
          min="0"
          step="0.01"
        />

        <p className="-mt-3 text-xs text-gray-500">
          Available lot area is automatically calculated as:
          <br />
          <span className="font-medium">Total Lot Area − Road Area</span>
        </p>

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
