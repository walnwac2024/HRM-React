// features/employees/components/AdditionalInformation.js
import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

/**
 * Usage:
 * <AdditionalInformation form={form} set={set} errors={errors} showError={showError} markTouched={markTouched} />
 * - If you pass {form, set, errors, showError, markTouched} from AddEmployeeModal, this component is controlled
 *   and will display validation (Gender required).
 * - If you only pass {form, set}, it still works as a controlled form, but error UI won't show unless you pass the helpers.
 * - If you pass nothing, it manages local state (useful for quick UI preview).
 */
export default function AdditionalInformation({
  form,
  set,
  errors = {},
  showError = () => false,
  markTouched = () => () => {},
}) {
  const isControlled = !!form && !!set;

  const [local, setLocal] = useState({
    maritalStatus: "",
    gender: "",
    dob: "",
    placeOfBirth: "",
    cnicNo: "",
    cnicExpiry: "",
    cnicIssued: "",
    religion: "",
    // Bank
    bankAccountNo: "",
    bankAccountTitle: "",
    bankName: "",
    bankBranchCode: "",
    // Contact
    address: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    // Emergency
    emergencyPerson: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    // Lists
    education: [],
    positions: [],
    // Note
    note: "",
  });

  const state = isControlled ? form : local;
  const apply = (name) => (eOrValue) => {
    const v =
      eOrValue && eOrValue.target ? eOrValue.target.value : eOrValue ?? "";
    if (isControlled) {
      set(name)(v);
    } else {
      setLocal((s) => ({ ...s, [name]: v }));
    }
  };

  // Dynamic lists (education & positions)
  const addEducation = () =>
    apply("education")([
      ...(state.education ?? []),
      { degree: "", institute: "", year: "" },
    ]);
  const editEducation = (idx, key) => (e) => {
    const v = e.target.value;
    const list = [...(state.education ?? [])];
    list[idx] = { ...list[idx], [key]: v };
    apply("education")(list);
  };
  const removeEducation = (idx) =>
    apply("education")((state.education ?? []).filter((_, i) => i !== idx));

  const addPosition = () =>
    apply("positions")([
      ...(state.positions ?? []),
      { title: "", company: "", from: "", to: "" },
    ]);
  const editPosition = (idx, key) => (e) => {
    const v = e.target.value;
    const list = [...(state.positions ?? [])];
    list[idx] = { ...list[idx], [key]: v };
    apply("positions")(list);
  };
  const removePosition = (idx) =>
    apply("positions")((state.positions ?? []).filter((_, i) => i !== idx));

  const baseInput =
    "w-full h-9 border rounded px-3 focus:ring-customRed focus:border-customRed";
  const normalBorder = "border-slate-300";
  const errorBorder = "border-customRed";
  const sectionHeader =
    "text-[13px] font-semibold text-slate-700 bg-gray-100 border border-slate-200 rounded px-3 py-2";

  return (
    <div className="space-y-6">
      {/* Top grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Marital Status:">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={state.maritalStatus ?? ""}
            onChange={apply("maritalStatus")}
          >
            <option value="">Select One</option>
            <option>Single</option>
            <option>Married</option>
          </select>
        </Field>

        {/* Gender (required + validation UI) */}
        <Field
          label="Gender:"
          required
          error={showError("gender") && errors.gender}
        >
          <select
            className={`${baseInput} ${
              showError("gender") ? errorBorder : normalBorder
            } px-2`}
            value={state.gender ?? ""}
            onChange={apply("gender")}
            onBlur={markTouched("gender")}
            aria-invalid={showError("gender") ? "true" : "false"}
          >
            <option value="">Select One</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Date Of Birth:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={state.dob ?? ""}
            onChange={apply("dob")}
          />
        </Field>

        <Field label="Place Of Birth:">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.placeOfBirth ?? ""}
            onChange={apply("placeOfBirth")}
          />
        </Field>

        <Field label="Cnic No:">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.cnicNo ?? ""}
            onChange={apply("cnicNo")}
          />
        </Field>

        <Field label="Cnic Expiry Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={state.cnicExpiry ?? ""}
            onChange={apply("cnicExpiry")}
          />
        </Field>

        <Field label="Cnic Issuance Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={state.cnicIssued ?? ""}
            onChange={apply("cnicIssued")}
          />
        </Field>

        <Field label="Religion:">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={state.religion ?? ""}
            onChange={apply("religion")}
          >
            <option value="">Select One</option>
            <option>Islam</option>
            <option>Christianity</option>
            <option>Hinduism</option>
            <option>Sikhism</option>
            <option>Buddhism</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      {/* Bank Information */}
      <div className={sectionHeader}>Bank Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Account #">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.bankAccountNo ?? ""}
            onChange={apply("bankAccountNo")}
          />
        </Field>
        <Field label="Account Title">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.bankAccountTitle ?? ""}
            onChange={apply("bankAccountTitle")}
          />
        </Field>
        <Field label="Bank">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.bankName ?? ""}
            onChange={apply("bankName")}
          />
        </Field>
        <Field label="Branch Code">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.bankBranchCode ?? ""}
            onChange={apply("bankBranchCode")}
          />
        </Field>
      </div>

      {/* Contact Information */}
      <div className={sectionHeader}>Contact Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Address">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.address ?? ""}
            onChange={apply("address")}
          />
        </Field>
        <Field label="Country">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={state.country ?? ""}
            onChange={apply("country")}
          >
            <option value="">Select One</option>
            <option>Pakistan</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Saudi Arabia</option>
            <option>UAE</option>
          </select>
        </Field>
        <Field label="City">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={state.city ?? ""}
            onChange={apply("city")}
          >
            <option value="">Select One</option>
            <option>Karachi</option>
            <option>Lahore</option>
            <option>Islamabad</option>
            <option>Riyadh</option>
            <option>Dubai</option>
          </select>
        </Field>
        <Field label="State">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.state ?? ""}
            onChange={apply("state")}
          />
        </Field>
        <Field label="ZipCode">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.zipCode ?? ""}
            onChange={apply("zipCode")}
          />
        </Field>
      </div>

      {/* Emergency Contact Information */}
      <div className={sectionHeader}>Emergency Contact Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Emergency Contact Person">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.emergencyPerson ?? ""}
            onChange={apply("emergencyPerson")}
          />
        </Field>
        <Field label="Relationship">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.emergencyRelationship ?? ""}
            onChange={apply("emergencyRelationship")}
          />
        </Field>
        <Field label="Phone/Mobile No.">
          <input
            className={`${baseInput} ${normalBorder}`}
            value={state.emergencyPhone ?? ""}
            onChange={apply("emergencyPhone")}
          />
        </Field>
      </div>

      {/* Academic Information */}
      <div className={sectionHeader}>Academic Information</div>
      <button
        type="button"
        onClick={addEducation}
        className="text-customRed text-sm inline-flex items-center gap-2"
      >
        <FaPlus className="text-xs" /> Add Education
      </button>
      {(state.education ?? []).length > 0 && (
        <div className="mt-3 space-y-3">
          {(state.education ?? []).map((ed, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <Field label="Degree">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={ed.degree}
                  onChange={editEducation(i, "degree")}
                />
              </Field>
              <Field label="Institute">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={ed.institute}
                  onChange={editEducation(i, "institute")}
                />
              </Field>
              <Field label="Year">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={ed.year}
                  onChange={editEducation(i, "year")}
                />
              </Field>
              <div className="h-9">
                <button
                  type="button"
                  onClick={() => removeEducation(i)}
                  className="h-9 w-full rounded border border-slate-300 hover:bg-slate-50 inline-flex items-center justify-center gap-2 text-sm"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Work History */}
      <div className={sectionHeader}>Work History</div>
      <button
        type="button"
        onClick={addPosition}
        className="text-customRed text-sm inline-flex items-center gap-2"
      >
        <FaPlus className="text-xs" /> Add Position
      </button>
      {(state.positions ?? []).length > 0 && (
        <div className="mt-3 space-y-3">
          {(state.positions ?? []).map((pos, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
            >
              <Field label="Position Title">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={pos.title}
                  onChange={editPosition(i, "title")}
                />
              </Field>
              <Field label="Company">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={pos.company}
                  onChange={editPosition(i, "company")}
                />
              </Field>
              <Field label="From">
                <input
                  type="date"
                  className={`${baseInput} ${normalBorder}`}
                  value={pos.from}
                  onChange={editPosition(i, "from")}
                />
              </Field>
              <Field label="To">
                <input
                  type="date"
                  className={`${baseInput} ${normalBorder}`}
                  value={pos.to}
                  onChange={editPosition(i, "to")}
                />
              </Field>
              <div className="h-9">
                <button
                  type="button"
                  onClick={() => removePosition(i)}
                  className="h-9 w-full rounded border border-slate-300 hover:bg-slate-50 inline-flex items-center justify-center gap-2 text-sm"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      <div className={sectionHeader}>Note</div>
      <textarea
        rows={3}
        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-customRed focus:border-customRed"
        placeholder="Type Note"
        value={state.note ?? ""}
        onChange={apply("note")}
      />
    </div>
  );
}

/* ---- small helper ---- */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label} {required && <span className="text-customRed align-middle">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[12px] text-customRed">{error}</p>
      ) : null}
    </div>
  );
}
