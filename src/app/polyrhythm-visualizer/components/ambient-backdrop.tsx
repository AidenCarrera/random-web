"use client";

import { memo } from "react";

/**
 * Static page background: gradient washes, contour lines and film grain. Memoed
 * because the playhead re-renders the page on every frame and none of this
 * moves.
 */
export const AmbientBackdrop = memo(function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#17121b_0%,#0d1317_48%,#171018_100%)]" />
      <div className="absolute -left-64 -top-80 h-224 w-4xl rounded-full bg-[radial-gradient(circle,rgba(252,140,116,0.12)_0%,rgba(252,140,116,0.04)_38%,transparent_70%)] blur-2xl" />
      <div className="absolute -bottom-80 -right-56 h-216 w-216 rounded-full bg-[radial-gradient(circle,rgba(64,196,187,0.1)_0%,rgba(64,196,187,0.03)_40%,transparent_70%)] blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-304 w-304 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[42%] bg-[repeating-radial-gradient(ellipse_at_center,transparent_0_42px,rgba(250,249,246,0.035)_43px_44px)] opacity-70" />
      <svg
        className="absolute inset-x-0 top-[8%] h-[76%] w-full opacity-35"
        viewBox="0 0 1600 900"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M-120 530C170 260 390 690 690 390S1220 210 1720 500"
          stroke="#fc8c74"
          strokeWidth="2"
        />
        <path
          d="M-140 590C180 320 420 740 735 440S1260 270 1740 560"
          stroke="#f59851"
          strokeOpacity="0.55"
        />
        <path
          d="M-160 650C210 390 455 790 780 500S1300 340 1760 620"
          stroke="#40c4bb"
          strokeOpacity="0.48"
        />
        <path
          d="M-180 710C240 470 500 840 830 560S1350 420 1780 680"
          stroke="#7e7aeb"
          strokeOpacity="0.42"
        />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20180%20180%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%27.9%27%20numOctaves%3D%274%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23n%29%27%20opacity%3D%27.9%27%2F%3E%3C%2Fsvg%3E')",
        }}
      />
    </div>
  );
});
