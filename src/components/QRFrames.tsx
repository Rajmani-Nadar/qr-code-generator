"use client";

import type { ChangeEvent } from "react";
import {
  qrFrameOptions,
  type QRFrameSettings,
} from "@/types/qr";

type QRFramesProps = {
  value: QRFrameSettings;
  onChange: (value: QRFrameSettings) => void;
};

export default function QRFrames({ value, onChange }: QRFramesProps) {
  const selectedOption = qrFrameOptions.find(({ id }) => id === value.style);
  const hasText = selectedOption?.defaultText !== undefined &&
    selectedOption.defaultText !== "";

  const updateColor = (
    key: "color" | "textColor",
    event: ChangeEvent<HTMLInputElement>,
  ) => onChange({ ...value, [key]: event.target.value });

  return (
    <section className="frames-section" aria-labelledby="frames-heading">
      <div className="frames-heading">
        <h3 id="frames-heading">Frames</h3>
        <span className="optional-label">OPTIONAL</span>
      </div>
      <div className="frame-selector" role="group" aria-label="Choose a QR code frame">
        {qrFrameOptions.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`frame-option${value.style === option.id ? " selected" : ""}`}
            aria-label={`${option.label} frame`}
            aria-pressed={value.style === option.id}
            onClick={() => {
              if (value.style === option.id) return;
              onChange({
                ...value,
                style: option.id,
                text: option.defaultText,
              });
            }}
          >
            <span className={`frame-thumbnail frame-${option.treatment}`} aria-hidden="true">
              <span className="frame-thumb-qr">
                <i /><i /><i /><i /><i /><i /><i /><i /><i />
              </span>
              {option.defaultText && <span className="frame-thumb-label">{option.defaultText}</span>}
            </span>
            <span className="frame-option-label">{option.label}</span>
            {value.style === option.id && <span className="frame-selected-label">Selected</span>}
          </button>
        ))}
      </div>
      {hasText && (
        <div className="frame-customization">
          <div className="field">
            <label className="field-label" htmlFor="frame-text">Frame text</label>
            <input
              id="frame-text"
              className="text-input"
              type="text"
              value={value.text}
              maxLength={30}
              placeholder="SCAN ME"
              onChange={(event) => onChange({ ...value, text: event.target.value })}
            />
            <p className="field-hint">Optional · {value.text.length}/30 characters</p>
          </div>
          <div className="color-row frame-color-row">
            <FrameColorControl
              id="frame-color"
              label="Frame color"
              value={value.color}
              onChange={(event) => updateColor("color", event)}
            />
            <FrameColorControl
              id="frame-text-color"
              label="Frame text color"
              value={value.textColor}
              onChange={(event) => updateColor("textColor", event)}
            />
          </div>
        </div>
      )}
      {!hasText && value.style !== "none" && (
        <div className="color-row frame-color-row">
          <FrameColorControl
            id="frame-color"
            label="Frame color"
            value={value.color}
            onChange={(event) => updateColor("color", event)}
          />
        </div>
      )}
    </section>
  );
}

function FrameColorControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="color-control">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="color-input-wrap">
        <input
          id={id}
          className="color-picker"
          type="color"
          value={value}
          onChange={onChange}
          aria-label={label}
        />
        <span>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
