"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/** Track listing + preview player shown on every product/release page (not the gated Digital Artifact experience). */
export function TrackPlayer({ tracks, releaseHandle }: { tracks: PlayerTrack[]; releaseHandle: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hasAnyStream = tracks.some((t) => t.streamUrl);

  function playTrack(index: number) {
    const audio = audioRef.current;
    const trackToPlay = tracks[index];
    if (!audio || !trackToPlay?.streamUrl) return;

    if (currentIndex === index) {
      if (isPlaying) {
        audio.pause();
      } else {
        void audio.play();
      }
      return;
    }

    audio.src = trackToPlay.streamUrl;
    setCurrentIndex(index);
    void audio.play();
    track({ name: "track_preview_play", properties: { releaseHandle, track: trackToPlay.title } });
  }

  function playFromStart() {
    const firstPlayable = tracks.findIndex((t) => t.streamUrl);
    if (firstPlayable !== -1) playTrack(firstPlayable);
  }

  function handleEnded() {
    if (currentIndex === null) return;
    const nextIndex = tracks.findIndex((t, i) => i > currentIndex && t.streamUrl);
    if (nextIndex !== -1) {
      playTrack(nextIndex);
    } else {
      setIsPlaying(false);
      setCurrentIndex(null);
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

      <Button
        variant="outline"
        size="sm"
        className="w-fit gap-2"
        disabled={!hasAnyStream}
        onClick={() => {
          if (currentIndex !== null && isPlaying) {
            audioRef.current?.pause();
          } else if (currentIndex !== null) {
            void audioRef.current?.play();
          } else {
            playFromStart();
          }
        }}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        {isPlaying ? "Pause" : "Stream"}
      </Button>

      <ol className="flex flex-col divide-y">
        {tracks.map((t, i) => {
          const isCurrent = currentIndex === i;
          return (
            <li key={`${t.title}-${i}`} className="flex items-center gap-3 py-2 text-sm">
              <button
                type="button"
                onClick={() => playTrack(i)}
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
