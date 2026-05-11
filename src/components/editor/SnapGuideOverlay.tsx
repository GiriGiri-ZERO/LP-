"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/store/editor";

export function SnapGuideOverlay() {
  const snapGuides = useEditorStore((s) => s.snapGuides);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const hasGuide = snapGuides.x !== undefined || snapGuides.y !== undefined;
  if (!hasGuide) return null;

  return createPortal(
    <>
      {snapGuides.x !== undefined && (
        <div
          style={{
            position: "fixed",
            left: snapGuides.x,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "#3b82f6",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
      {snapGuides.y !== undefined && (
        <div
          style={{
            position: "fixed",
            top: snapGuides.y,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "#3b82f6",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
    </>,
    document.body,
  );
}
