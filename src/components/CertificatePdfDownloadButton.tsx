"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

type CertificatePdfDownloadButtonProps = {
  certificateId: string;
  targetId?: string;
  className?: string;
};

export default function CertificatePdfDownloadButton({
  certificateId,
  targetId = "certificate",
  className,
}: CertificatePdfDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error("Certificate preview was not found.");
      }

      if ("fonts" in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const scale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/png", 1);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
      pdf.save(`SkillBridge-Certificate-${certificateId}.pdf`);
    } catch (downloadError) {
      console.error("[certificate-pdf] Download failed", downloadError);
      setError("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className={
          className ||
          "w-full rounded-2xl bg-[#10b981] px-5 py-4 text-sm text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors cursor-pointer shadow-[0_12px_20px_rgba(16,185,129,0.24)] disabled:opacity-70 disabled:cursor-not-allowed"
        }
      >
        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {isDownloading ? "Generating PDF..." : "Download PDF"}
      </button>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
