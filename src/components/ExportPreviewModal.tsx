"use client";

import { Link2, X } from "lucide-react";
import { useState } from "react";
import {
  BlueskyIcon,
  BlueskyShareButton,
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
  XShareButton,
} from "react-share";

import styles from "./ExportPreviewModal.module.css";

type ExportPreviewModalProps = {
  description?: string;
  fileName: string;
  imageAlt?: string;
  imageSrc: string;
  isTouchDevice: boolean;
  onClose: () => void;
  onSaveImage?: () => void | Promise<void>;
  pixelatedPreview?: boolean;
  emailBody?: string;
  emailSubject?: string;
  facebookHashtag?: string;
  shareUrl: string;
  shareHeading?: string;
  socialTitle?: string;
  title?: string;
};

export function ExportPreviewModal({
  description = "Preview your PNG, then download it or share it here.",
  emailBody = "Check out this Hypno Spiral export:",
  emailSubject = "Hypno Spiral export",
  facebookHashtag = "#HypnoSpiral",
  fileName,
  imageAlt = "Export preview",
  imageSrc,
  isTouchDevice,
  onClose,
  onSaveImage,
  pixelatedPreview = false,
  shareUrl,
  shareHeading = "Share Anywhere",
  socialTitle = "Check out this Hypno Spiral export.",
  title = "Export preview",
}: ExportPreviewModalProps) {
  const [copyLinkLabel, setCopyLinkLabel] = useState("Copy Link");

  return (
    <div
      className={`${styles.modal} fixed inset-0 z-100 flex items-end justify-center bg-black/82 px-2 py-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6`}
    >
      <div
        className={`${styles.card} flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-4xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-white shadow-[0_32px_120px_rgba(0,0,0,0.6)] ring-1 ring-black/30 sm:max-h-208 sm:rounded-3xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/3 px-4 pb-3 pt-4 sm:px-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
              Export Preview
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-white/62">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/85 transition hover:bg-white/12 hover:text-white"
            aria-label="Close export preview"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={`${styles.body} min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-5 sm:pb-5`}
        >
          <div
            className={`${styles.imageShell} rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.24)_100%)] p-2 shadow-inner shadow-black/30 sm:p-3`}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className={`${styles.image} mx-auto block rounded-[1.15rem] border border-white/8 bg-black object-contain ${
                pixelatedPreview
                  ? "h-auto max-h-[38vh] w-auto max-w-full sm:max-h-[52vh]"
                  : "max-h-[38vh] w-full sm:max-h-[52vh]"
              }`}
              style={
                pixelatedPreview ? { imageRendering: "pixelated" } : undefined
              }
            />
          </div>

          <div className={styles.sidebar}>
            <div className="mt-4">
              {isTouchDevice ? (
                <button
                  type="button"
                  onClick={onSaveImage}
                  className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Download PNG
                </button>
              ) : (
                <a
                  href={imageSrc}
                  download={fileName}
                  className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Download PNG
                </a>
              )}
            </div>

            <div className="mt-5">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-white/42">
                {shareHeading}
              </p>
              <div className="grid grid-cols-3 gap-3 rounded-[1.6rem] border border-white/8 bg-white/3 p-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      setCopyLinkLabel("Copied");
                      window.setTimeout(
                        () => setCopyLinkLabel("Copy Link"),
                        1600,
                      );
                    } catch {}
                  }}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                    <Link2 size={18} />
                  </div>
                  <span>{copyLinkLabel}</span>
                </button>

                <XShareButton
                  url={shareUrl}
                  title={socialTitle}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <XIcon size={44} round />
                  <span>X</span>
                </XShareButton>

                <RedditShareButton
                  url={shareUrl}
                  title={socialTitle}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <RedditIcon size={44} round />
                  <span>Reddit</span>
                </RedditShareButton>

                <BlueskyShareButton
                  url={shareUrl}
                  title={socialTitle}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <BlueskyIcon size={44} round />
                  <span>Bluesky</span>
                </BlueskyShareButton>

                <WhatsappShareButton
                  url={shareUrl}
                  title={socialTitle}
                  separator=" "
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <WhatsappIcon size={44} round />
                  <span>WhatsApp</span>
                </WhatsappShareButton>

                <TelegramShareButton
                  url={shareUrl}
                  title={socialTitle}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <TelegramIcon size={44} round />
                  <span>Telegram</span>
                </TelegramShareButton>

                <FacebookShareButton
                  url={shareUrl}
                  hashtag={facebookHashtag}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <FacebookIcon size={44} round />
                  <span>Facebook</span>
                </FacebookShareButton>

                <EmailShareButton
                  url={shareUrl}
                  subject={emailSubject}
                  body={emailBody}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-[11px] text-white/72 transition hover:bg-white/4 hover:text-white"
                >
                  <EmailIcon size={44} round />
                  <span>Email</span>
                </EmailShareButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
