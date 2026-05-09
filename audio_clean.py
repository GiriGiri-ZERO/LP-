#!/usr/bin/env python3
"""
Audio cleaner: removes silence (>=0.3s) and filler words using Whisper + FFmpeg.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

FILLERS_JA = [
    r"えー+", r"あの+", r"まあ+", r"そのー+", r"えっと+", r"なんか",
    r"うーん+", r"んー+",
]
FILLERS_EN = [
    r"\buh+\b", r"\bum+\b", r"\blike\b", r"\byou know\b", r"\bkind of\b",
    r"\bsort of\b", r"\bbasically\b",
]
FILLER_PATTERN = re.compile(
    "|".join(FILLERS_JA + FILLERS_EN),
    re.IGNORECASE,
)

PADDING = 0.05  # seconds of padding to keep around filler words


def run(cmd, **kwargs):
    result = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if result.returncode != 0:
        print(f"ERROR: {' '.join(str(c) for c in cmd)}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)
    return result


def transcribe(audio_path):
    import whisper
    print("Loading Whisper model (small)...")
    model = whisper.load_model("small")
    print("Transcribing...")
    result = model.transcribe(audio_path, word_timestamps=True, language=None)
    return result


def find_filler_segments(transcription):
    """Return list of (start, end) time ranges that are filler words."""
    segments = []
    for seg in transcription.get("segments", []):
        for word_info in seg.get("words", []):
            word = word_info.get("word", "").strip()
            if FILLER_PATTERN.fullmatch(word):
                start = max(0, word_info["start"] - PADDING)
                end = word_info["end"] + PADDING
                segments.append((start, end))
    # Merge overlapping segments
    merged = []
    for s, e in sorted(segments):
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append([s, e])
    return merged


def remove_silence(input_path, output_path, min_silence=0.3, silence_thresh=-40):
    """Use FFmpeg silenceremove to strip silence >= min_silence seconds."""
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-af", (
            f"silenceremove="
            f"stop_periods=-1:"
            f"stop_duration={min_silence}:"
            f"stop_threshold={silence_thresh}dB"
        ),
        output_path,
    ]
    print("Removing silence with FFmpeg...")
    run(cmd)


def get_duration(path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True,
    )
    return float(result.stdout.strip())


def cut_segments(input_path, cut_list, output_path):
    """Keep everything EXCEPT the time ranges in cut_list."""
    if not cut_list:
        import shutil
        shutil.copy(input_path, output_path)
        return

    duration = get_duration(input_path)
    # Build keep segments (inverse of cut_list)
    keep = []
    prev = 0.0
    for s, e in sorted(cut_list):
        if s > prev:
            keep.append((prev, s))
        prev = e
    if prev < duration:
        keep.append((prev, duration))

    if not keep:
        print("WARNING: Nothing to keep after filler removal.", file=sys.stderr)
        import shutil
        shutil.copy(input_path, output_path)
        return

    with tempfile.TemporaryDirectory() as tmpdir:
        parts = []
        for i, (s, e) in enumerate(keep):
            part = os.path.join(tmpdir, f"part_{i:04d}.mp3")
            run(["ffmpeg", "-y", "-i", input_path,
                 "-ss", str(s), "-to", str(e),
                 "-c", "copy", part])
            parts.append(part)

        list_file = os.path.join(tmpdir, "concat.txt")
        with open(list_file, "w") as f:
            for p in parts:
                f.write(f"file '{p}'\n")

        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0",
             "-i", list_file, "-c", "copy", output_path])


def main():
    parser = argparse.ArgumentParser(description="Remove silence and fillers from audio.")
    parser.add_argument("input", help="Input audio file")
    parser.add_argument("-o", "--output", help="Output file (default: input_cleaned.mp3)")
    parser.add_argument("--silence", type=float, default=0.3,
                        help="Minimum silence duration to remove (seconds, default: 0.3)")
    parser.add_argument("--no-filler", action="store_true",
                        help="Skip filler word removal")
    args = parser.parse_args()

    input_path = args.input
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    base, ext = os.path.splitext(input_path)
    output_path = args.output or f"{base}_cleaned{ext}"

    with tempfile.TemporaryDirectory() as tmpdir:
        silence_removed = os.path.join(tmpdir, "silence_removed.mp3")
        remove_silence(input_path, silence_removed, min_silence=args.silence)

        if args.no_filler:
            import shutil
            shutil.copy(silence_removed, output_path)
        else:
            transcription = transcribe(silence_removed)
            filler_segs = find_filler_segments(transcription)
            print(f"Found {len(filler_segs)} filler segment(s) to remove.")
            if filler_segs:
                for s, e in filler_segs:
                    word_text = []
                    for seg in transcription.get("segments", []):
                        for w in seg.get("words", []):
                            if w["start"] >= s - PADDING and w["end"] <= e + PADDING:
                                word_text.append(w["word"].strip())
                    print(f"  [{s:.2f}s - {e:.2f}s] '{' '.join(word_text)}'")
            cut_segments(silence_removed, filler_segs, output_path)

    orig_dur = get_duration(input_path)
    out_dur = get_duration(output_path)
    print(f"\nDone: {output_path}")
    print(f"  Original : {orig_dur:.1f}s")
    print(f"  Cleaned  : {out_dur:.1f}s  (removed {orig_dur - out_dur:.1f}s)")


if __name__ == "__main__":
    main()
