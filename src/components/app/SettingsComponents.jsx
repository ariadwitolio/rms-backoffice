import { useState } from "react";
import { Toggle, LabButton } from "../ui/Primitives.jsx";

export function FeatureCard({ label, title, copy, tone, onOpen }) {
  return (
    <article className={`feature-card feature-card--${tone}`}>
      <p className="feature-card__label type-description-strong">{label}</p>
      <p className="feature-card__value type-title-1">{title}</p>
      <p className="feature-card__meta type-subtitle-2">{copy}</p>
      <LabButton
        label="Open Module"
        variant="secondary"
        size="small"
        onClick={onOpen}
      />
    </article>
  );
}

export function SettingsToggle({ label, copy, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__copy">
        <p className="type-title-3">{label}</p>
        <p className="type-body text-secondary">{copy}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

export function CreatePanelStepTabs({ steps, activeStep, onStepSelect }) {
  if (!steps?.length) return null;

  return (
    <div className="catalog-create-side-panel__stepbar" role="tablist">
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          className={`catalog-create-side-panel__step type-title-3${activeStep === index ? " is-active" : ""
            }`}
          onClick={() => onStepSelect(index)}
          role="tab"
          aria-selected={activeStep === index}
        >
          <span className="catalog-create-side-panel__step-index type-body-bold">
            {index + 1}
          </span>
          <span>{step.label}</span>
        </button>
      ))}
    </div>
  );
}

export function CreatePanelFooter({
  isFirstStep,
  isLastStep,
  onCancel,
  onBack,
  onNext,
  onSubmit,
  submitLabel,
}) {
  if (isFirstStep && isLastStep) {
    return (
      <div className="catalog-create-side-panel__footer-actions" style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          type="button"
          className="lab-button lab-button--medium lab-button--danger-outline"
          style={{ flex: 1 }}
          onClick={onCancel}
        >
          <span className="type-subtitle-2">Cancel</span>
        </button>
        <button
          type="button"
          className="lab-button lab-button--primary lab-button--medium"
          style={{ flex: 1 }}
          onClick={onSubmit}
        >
          <span className="type-subtitle-2">{submitLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-create-side-panel__footer-actions">
      {isFirstStep ? (
        <button
          type="button"
          className="catalog-create-side-panel__footer-link catalog-create-side-panel__footer-link--danger type-title-3"
          onClick={onCancel}
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          className="catalog-create-side-panel__footer-link type-title-3"
          onClick={onBack}
        >
          Back
        </button>
      )}
      <div className="catalog-create-side-panel__footer-actions-end">
        {isLastStep ? (
          <LabButton
            label={submitLabel}
            variant="primary"
            size="medium"
            onClick={onSubmit}
          />
        ) : (
          <button
            type="button"
            className="catalog-create-side-panel__footer-link type-title-3"
            onClick={onNext}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

