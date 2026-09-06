"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditsBlock } from "./credits-block";
import { track } from "@/lib/analytics/track";

export interface PlayerTrack {
  title: string;
  durationSeconds?: number;
  streamUrl?: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Track listing + preview player shown on every product/release page (not
 * the gated Digital Artifact experience). Two distinct actions on purpose:
 * clicking a track plays just that one track; "Play" always (re)starts
 * the whole release from track 1 and auto-advances through it.
 *
 * `description`/`credits`, when given, render as Description/Credits
 * buttons next to Play on small screens only (`md:hidden`) — the full
 * text already renders inline elsewhere on the page for larger
 * viewports, this is just a compact mobile affordance via a modal.
 */
export function TrackPlayer({
  tracks,
  releaseHandle,
  description,
  credits,
}: {
  tracks: PlayerTrack[];
  releaseHandle: string;
  description?: string;
  credits?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQueueMode, setIsQueueMode] = useState(false);

  const hasAnyStream = tracks.some((t) => t.streamUrl);

  function startTrack(index: number, queueMode: boolean) {
    const audio = audioRef.current;
    const trackToPlay = tracks[index];
    if (!audio || !trackToPlay?.streamUrl) return;

    audio.src = trackToPlay.streamUrl;
    setCurrentIndex(index);
    setIsQueueMode(queueMode);
    void audio.play();
    track({ name: "track_preview_play", properties: { releaseHandle, track: trackToPlay.title, queueMode } });
  }

  /** Row click: toggle pause/resume if it's already the active track, otherwise play just that track. */
  function handleRowClick(index: number) {
    const audio = audioRef.current;
    if (currentIndex === index && audio) {
      if (isPlaying) audio.pause();
      else void audio.play();
      return;
    }
    startTrack(index, false);
  }

  /** Play button: always (re)starts the whole release from track 1. */
  function handlePlayClick() {
    const firstPlayable = tracks.findIndex((t) => t.streamUrl);
    if (firstPlayable !== -1) startTrack(firstPlayable, true);
  }

  function handleEnded() {
    if (!isQueueMode || currentIndex === null) {
      setIsPlaying(false);
      return;
    }
    const nextIndex = tracks.findIndex((t, i) => i > currentIndex && t.streamUrl);
    if (nextIndex !== -1) {
      startTrack(nextIndex, true);
    } else {
      setIsPlaying(false);
      setIsQueueMode(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="w-fit gap-2" disabled={!hasAnyStream} onClick={handlePlayClick}>
          <Play className="size-4" />
          Play
        </Button>

        {description && (
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" className="md:hidden" />}>
              Description
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Description</DialogTitle>
              </DialogHeader>
              <div
                className="prose prose-sm max-h-[60vh] max-w-none overflow-y-auto text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </DialogContent>
          </Dialog>
        )}

        {credits && (
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" className="md:hidden" />}>
              Credits
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credits</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <CreditsBlock credits={credits} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ol className="flex flex-col divide-y">
        {tracks.map((t, i) => {
          const isCurrent = currentIndex === i;
          return (
            <li key={`${t.title}-${i}`} className="flex items-center gap-3 py-2 text-sm">
              <button
                type="button"
                onClick={() => handleRowClick(i)}
                disabled={!t.streamUrl}
                aria-label={isCurrent && isPlaying ? `Pause ${t.title}` : `Play ${t.title}`}
                className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isCurrent && isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
              </button>
              <span className="w-5 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
              <span className={`flex-1 ${isCurrent ? "font-medium" : ""}`}>{t.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDuration(t.durationSeconds)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
