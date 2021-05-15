const VIDEO_EXTENSIONS = [
  "3g2",
  "3gp",
  "avi",
  "flv",
  "mkv",
  "mk3d",
  "mov",
  "mp2",
  "mp4",
  "m4v",
  "mpe",
  "mpeg",
  "mpg",
  "mpv",
  "webm",
  "wmv",
  "ogm",
  "divx"
];
const SUBTITLE_EXTENSIONS = [
  "aqt",
  "gsub",
  "jss",
  "sub",
  "ttxt",
  "pjs",
  "psb",
  "rt",
  "smi",
  "slt",
  "ssf",
  "srt",
  "ssa",
  "ass",
  "usf",
  "idx",
  "vtt"
];
const DISK_EXTENSIONS = [
  "iso",
  "m2ts",
  "ts",
  "vob"
]

export function isVideo(filename: string) {
  return isExtension(filename, VIDEO_EXTENSIONS);
}

export function isSubtitle(filename: string) {
  return isExtension(filename, SUBTITLE_EXTENSIONS);
}

export function isDisk(filename: string) {
  return isExtension(filename, DISK_EXTENSIONS);
}

function isExtension(filename: string, extensions: string[]) {
  const extensionMatch = filename.match(/\.(\w{2,4})$/);
  return extensionMatch && extensions.includes(extensionMatch[1].toLowerCase());
}