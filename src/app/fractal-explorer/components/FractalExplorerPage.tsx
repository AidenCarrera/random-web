"use client";

import { ExportPreviewModal } from "@/components/ExportPreviewModal";
import { useFractalExplorer } from "../hooks/useFractalExplorer";
import { AudioPrompt } from "./AudioPrompt";
import { CoordinatesOverlay } from "./CoordinatesOverlay";
import { FractalCanvas } from "./FractalCanvas";
import { SettingsPanel } from "./SettingsPanel";

export function FractalExplorerPage() {
  const explorer = useFractalExplorer();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050611] font-sans select-none overscroll-none">
      <FractalCanvas explorer={explorer} />
      <CoordinatesOverlay explorer={explorer} />
      <SettingsPanel explorer={explorer} />
      <AudioPrompt explorer={explorer} />
      {explorer.exportSnapshot ? (
        <ExportPreviewModal
          description="Preview your fractal, then download the PNG or share Fractal Explorer."
          emailBody="Explore this fractal and create your own with Fractal Explorer:"
          emailSubject="Fractal Explorer snapshot"
          facebookHashtag="#FractalExplorer"
          fileName={explorer.exportSnapshot.fileName}
          imageAlt="Fractal Explorer export preview"
          imageSrc={explorer.exportSnapshot.imageSrc}
          isTouchDevice={explorer.isTouchDevice}
          onClose={explorer.closeExportPreview}
          onSaveImage={explorer.saveExportImage}
          shareHeading="Share this fractal"
          shareUrl={explorer.shareUrl}
          socialTitle="Explore this fractal in Fractal Explorer."
          title="Fractal snapshot"
        />
      ) : null}
    </div>
  );
}
