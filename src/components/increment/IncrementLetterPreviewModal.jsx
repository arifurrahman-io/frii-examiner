import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaExpand,
  FaPrint,
  FaSearchMinus,
  FaSearchPlus,
  FaTimes,
} from "react-icons/fa";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAGE_WIDTH_PX = (210 * 96) / 25.4;
const PAGE_HEIGHT_PX = (297 * 96) / 25.4;

const clampZoom = (value) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));

const IncrementLetterPreviewModal = ({ open, onClose, onPrint, children }) => {
  const viewportRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  const computeFitZoom = useCallback(() => {
    const node = viewportRef.current;
    if (!node) return 1;
    const width = Math.max(0, node.clientWidth - 32);
    const height = Math.max(0, node.clientHeight - 32);
    if (!width || !height) return 1;
    return clampZoom(Math.min(width / PAGE_WIDTH_PX, height / PAGE_HEIGHT_PX, 1));
  }, []);

  const fitToScreen = useCallback(() => {
    const next = computeFitZoom();
    setFitZoom(next);
    setZoom(next);
  }, [computeFitZoom]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(fitToScreen);
    return () => window.cancelAnimationFrame(frame);
  }, [open, fitToScreen]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((current) => clampZoom(current + ZOOM_STEP));
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom((current) => clampZoom(current - ZOOM_STEP));
      }
      if (event.key === "0") {
        event.preventDefault();
        fitToScreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, fitToScreen]);

  useEffect(() => {
    if (!open) return undefined;
    const node = viewportRef.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((current) => clampZoom(current + delta));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [open]);

  if (!open) return null;

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="il-preview-modal no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Letter preview"
    >
      <div className="il-preview-toolbar">
        <div className="il-preview-toolbar-copy">
          <p className="il-preview-title">Letter preview</p>
          <p className="il-preview-subtitle">A4 · pinch, slider, or Ctrl + scroll</p>
        </div>
        <div className="il-preview-zoom">
          <button
            type="button"
            className="il-preview-icon-btn"
            onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
            aria-label="Zoom out"
          >
            <FaSearchMinus />
          </button>
          <input
            className="il-preview-slider"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(event) => setZoom(clampZoom(Number(event.target.value)))}
            aria-label="Zoom level"
          />
          <span className="il-preview-zoom-label">{zoomPercent}%</span>
          <button
            type="button"
            className="il-preview-icon-btn"
            onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
            aria-label="Zoom in"
          >
            <FaSearchPlus />
          </button>
          <button
            type="button"
            className="il-preview-text-btn"
            onClick={fitToScreen}
          >
            <FaExpand />
            Fit
          </button>
          <button
            type="button"
            className="il-preview-text-btn"
            onClick={() => setZoom(1)}
          >
            100%
          </button>
        </div>
        <div className="il-preview-actions">
          <button type="button" className="il-preview-print-btn" onClick={onPrint}>
            <FaPrint />
            Print
          </button>
          <button
            type="button"
            className="il-preview-icon-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="il-preview-viewport"
        onClick={onClose}
      >
        <div
          className="il-preview-canvas"
          style={{
            width: `${PAGE_WIDTH_PX * zoom}px`,
            height: `${PAGE_HEIGHT_PX * zoom}px`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="il-preview-stage"
            style={{
              transform: `scale(${zoom})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncrementLetterPreviewModal;
