const APP_VERSION = "1.0.5";
const MAX_PHOTOS = 20;
const SOCIAL_PLATFORMS = [
  {
    id: "common",
    variants: [
      { id: "common-square", label: "1:1", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "common-portrait", label: "4:5", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "common-story", label: "9:16", size: "1080 x 1920", width: 1080, height: 1920 },
      { id: "common-landscape", label: "16:9", size: "1920 x 1080", width: 1920, height: 1080 },
      { id: "common-a4", label: "A4", size: "2480 x 3508", width: 2480, height: 3508 },
      { id: "common-a3", label: "A3（約 248 DPI）", size: "2896 x 4096", width: 2896, height: 4096 },
    ],
  },
  {
    id: "instagram",
    variants: [
      { id: "instagram-portrait-tall", label: "貼文直式 3:4", size: "1080 x 1440", width: 1080, height: 1440 },
      { id: "instagram-portrait", label: "貼文直式 4:5", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "instagram-square", label: "正方形", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "instagram-landscape", label: "橫式", size: "1080 x 566", width: 1080, height: 566 },
      { id: "instagram-story", label: "限動 / Reels", size: "1080 x 1920", width: 1080, height: 1920 },
    ],
  },
  {
    id: "facebook",
    variants: [
      { id: "facebook-portrait", label: "貼文直式", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "facebook-square", label: "正方形", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "facebook-link", label: "橫式 / 連結", size: "1200 x 630", width: 1200, height: 630 },
      { id: "facebook-story", label: "限動", size: "1080 x 1920", width: 1080, height: 1920 },
    ],
  },
  {
    id: "threads",
    variants: [
      { id: "threads-portrait", label: "建議直式", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "threads-square", label: "建議正方形", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "threads-landscape", label: "建議橫式", size: "1200 x 628", width: 1200, height: 628 },
    ],
  },
  {
    id: "x",
    variants: [{ id: "x-post", label: "貼文", size: "1200 x 675", width: 1200, height: 675 }],
  },
  {
    id: "tiktok",
    variants: [{ id: "tiktok-photo", label: "Photo Mode", size: "1080 x 1920", width: 1080, height: 1920 }],
  },
  {
    id: "linkedin",
    variants: [
      { id: "linkedin-portrait", label: "貼文直式", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "linkedin-square", label: "正方形", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "linkedin-link", label: "連結圖", size: "1200 x 627", width: 1200, height: 627 },
    ],
  },
  {
    id: "pinterest",
    variants: [{ id: "pinterest-pin", label: "標準 Pin", size: "1000 x 1500", width: 1000, height: 1500 }],
  },
  {
    id: "youtube",
    variants: [
      { id: "youtube-community", label: "社群貼文", size: "1200 x 1200", width: 1200, height: 1200 },
      { id: "youtube-banner", label: "頻道橫幅", size: "2560 x 1440", width: 2560, height: 1440 },
    ],
  },
];
const DEFAULT_PLATFORM = "common";
const DEFAULT_RATIO = "common-square";
const CUSTOM_SIZE_DEFAULT = 3000;
const CUSTOM_SIZE_MIN = 100;
const CUSTOM_SIZE_MAX = 4096;
const MAX_PHOTO_SIDE = 2560;
const MAX_TOTAL_PHOTO_PIXELS = 32_000_000;
const CUSTOM_SIZE_WARNING_TEXT = "最低要三位數";
const PLACEHOLDER_COLORS = ["#f8fafc", "#eef6ff", "#f3f8ef", "#fff4e6", "#fff0f5", "#f3f0ff"];
const MIN_FRAME_SIDE_BASE = 24;
const SELECTION_FRAME_INSET = 3;
const SELECTION_FRAME_WIDTH = 3.5;
const CENTER_SNAP_THRESHOLD = 6;
const EDGE_SNAP_THRESHOLD = 6;
const FRAME_TRANSITION_MS = 220;
const GAP_TRANSITION_MS = 120;
const EXPORT_PRESETS = Object.fromEntries(
  SOCIAL_PLATFORMS.flatMap((platform) =>
    platform.variants.map((variant) => [variant.id, [variant.width, variant.height]]),
  ),
);

const state = {
  platform: DEFAULT_PLATFORM,
  ratio: DEFAULT_RATIO,
  customWidth: CUSTOM_SIZE_DEFAULT,
  customHeight: CUSTOM_SIZE_DEFAULT,
  customSizeLocked: true,
  layout: "auto",
  tileOrientation: "landscape",
  gap: 0,
  radius: 0,
  background: "#ffffff",
  photos: [],
  selectedId: null,
  isResetting: false,
  isImporting: false,
  isExporting: false,
};

const els = {
  body: document.body,
  appVersion: document.querySelector("#appVersion"),
  topbar: document.querySelector(".topbar"),
  input: document.querySelector("#photoInput"),
  replaceInput: document.querySelector("#replaceInput"),
  addPhotoButton: document.querySelector("#addPhotoButton"),
  replacePhotoButton: document.querySelector("#replacePhotoButton"),
  canvas: document.querySelector("#collageCanvas"),
  canvasStatus: document.querySelector("#canvasStatus"),
  canvasFrame: document.querySelector("#canvasFrame"),
  stageArea: document.querySelector(".stage-area"),
  clearButton: document.querySelector("#clearButton"),
  ratioSubmenu: document.querySelector("#ratioSubmenu"),
  customSize: document.querySelector("#customSize"),
  customWidth: document.querySelector("#customWidth"),
  customHeight: document.querySelector("#customHeight"),
  customSizeLock: document.querySelector("#customSizeLock"),
  customSizeWarning: document.querySelector("#customSizeWarning"),
  gapRange: document.querySelector("#gapRange"),
  gapValue: document.querySelector("#gapValue"),
  radiusRange: document.querySelector("#radiusRange"),
  radiusValue: document.querySelector("#radiusValue"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomValue: document.querySelector("#zoomValue"),
  zoomRow: document.querySelector("#zoomRow"),
  exportToggle: document.querySelector("#exportToggle"),
  exportMenu: document.querySelector("#exportMenu"),
  exportOptions: document.querySelectorAll("[data-export-format]"),
};

let preview = { width: 0, height: 0, dpr: 1 };
let rafId = 0;
let renderNeedsResize = false;
let renderNeedsControls = false;
let dragState = null;
let pinchState = null;
let activePointers = new Map();
let alignmentGuide = {
  active: false,
  centerX: false,
  centerY: false,
  edgeLeft: false,
  edgeRight: false,
  edgeTop: false,
  edgeBottom: false,
};
let replaceButtonVisible = false;
let ratioSubmenuKey = "";
let stableMobileViewport = { width: 0, height: 0 };
let customSizeEditSnapshot = null;
let previewTransitionTimer = 0;
let replaceButtonTrackRaf = 0;
let photoMutationToken = 0;
let lastRenderedFrameSet = { frames: [], width: 0, height: 0, count: 0 };
let frameTransition = {
  active: false,
  pendingDuration: 0,
  from: [],
  to: [],
  width: 0,
  height: 0,
  count: 0,
  start: 0,
  duration: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOut(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function normalizeCustomSize(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return CUSTOM_SIZE_DEFAULT;
  return clamp(Math.round(number), CUSTOM_SIZE_MIN, CUSTOM_SIZE_MAX);
}

function fitImageSize(width, height, maxSide = MAX_PHOTO_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function maxPhotoSideForCount(count) {
  return Math.min(MAX_PHOTO_SIDE, Math.floor(Math.sqrt(MAX_TOTAL_PHOTO_PIXELS / Math.max(1, count))));
}

function uid() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function nextPhotoMutationToken() {
  photoMutationToken += 1;
  return photoMutationToken;
}

function isCurrentPhotoMutation(token) {
  return token === photoMutationToken;
}

function cloneFrames(frames) {
  return frames.map((frame) => ({ ...frame }));
}

function interpolateFrame(from, to, progress) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    w: from.w + (to.w - from.w) * progress,
    h: from.h + (to.h - from.h) * progress,
  };
}

function sameFrameContext(frameSet, count, width, height) {
  return (
    frameSet.count === count &&
    frameSet.frames.length === count &&
    Math.abs(frameSet.width - width) < 1 &&
    Math.abs(frameSet.height - height) < 1
  );
}

function isCustomSizeInput(input) {
  return input === els.customWidth || input === els.customHeight;
}

function customSizeFieldForInput(input) {
  return input === els.customHeight ? "customHeight" : "customWidth";
}

function pairedCustomSizeInput(input) {
  return input === els.customWidth ? els.customHeight : els.customWidth;
}

function sanitizeCustomSizeInput(input) {
  const sanitized = input.value.replace(/\D/g, "");
  if (input.value !== sanitized) input.value = sanitized;
  return sanitized;
}

function customSizeNumberFromInput(input) {
  const value = sanitizeCustomSizeInput(input);
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function beginCustomSizeEdit() {
  customSizeEditSnapshot = {
    customWidth: state.customWidth,
    customHeight: state.customHeight,
    locked: state.customSizeLocked,
  };
}

function showCustomSizeWarning(inputs = [], message = CUSTOM_SIZE_WARNING_TEXT) {
  els.customSize.classList.add("has-warning");
  els.customSizeWarning.textContent = message;
  els.customWidth.removeAttribute("aria-invalid");
  els.customHeight.removeAttribute("aria-invalid");
  inputs.forEach((input) => input.setAttribute("aria-invalid", "true"));
}

function clearCustomSizeWarning() {
  els.customSize.classList.remove("has-warning");
  els.customSizeWarning.textContent = "";
  els.customWidth.removeAttribute("aria-invalid");
  els.customHeight.removeAttribute("aria-invalid");
}

function setCustomSizeValue(input, value) {
  const field = customSizeFieldForInput(input);
  const nextValue = normalizeCustomSize(value);
  state[field] = nextValue;

  if (state.customSizeLocked) {
    state.customWidth = nextValue;
    state.customHeight = nextValue;
  }

  scheduleRender();
}

function syncCustomSizeControls(force = false) {
  const activeInput = isCustomSizeInput(document.activeElement) ? document.activeElement : null;
  if (force || activeInput !== els.customWidth) els.customWidth.value = state.customWidth;
  if (force || activeInput !== els.customHeight) els.customHeight.value = state.customHeight;

  if (!force && state.customSizeLocked && activeInput) {
    pairedCustomSizeInput(activeInput).value = activeInput.value;
  }

  els.customSizeLock.classList.toggle("is-locked", state.customSizeLocked);
  els.customSizeLock.setAttribute("aria-pressed", String(state.customSizeLocked));
  els.customSizeLock.setAttribute("aria-label", state.customSizeLocked ? "取消同步長寬" : "同步長寬");
}

function revertCustomSizeInput(input) {
  const snapshot = customSizeEditSnapshot || {
    customWidth: state.customWidth,
    customHeight: state.customHeight,
    locked: state.customSizeLocked,
  };
  const field = customSizeFieldForInput(input);

  if (snapshot.locked || state.customSizeLocked) {
    state.customWidth = snapshot.customWidth;
    state.customHeight = snapshot.customHeight;
  } else {
    state[field] = snapshot[field];
  }

  customSizeEditSnapshot = null;
  syncCustomSizeControls(true);
  showCustomSizeWarning([], `已恢復原尺寸，${CUSTOM_SIZE_WARNING_TEXT}`);
  scheduleRender();
}

function commitCustomSizeInput(input) {
  const value = customSizeNumberFromInput(input);
  if (value === null || value < CUSTOM_SIZE_MIN) {
    revertCustomSizeInput(input);
    return false;
  }

  setCustomSizeValue(input, value);
  customSizeEditSnapshot = null;
  syncCustomSizeControls(true);
  clearCustomSizeWarning();
  return true;
}

function handleCustomSizeInput(input) {
  if (!customSizeEditSnapshot) beginCustomSizeEdit();

  const value = customSizeNumberFromInput(input);
  if (state.customSizeLocked) {
    pairedCustomSizeInput(input).value = input.value;
  }

  if (value === null || value < CUSTOM_SIZE_MIN) {
    showCustomSizeWarning(state.customSizeLocked ? [els.customWidth, els.customHeight] : [input]);
    return;
  }

  clearCustomSizeWarning();
  setCustomSizeValue(input, value);
}

function selectedPhotoIndex() {
  return state.photos.findIndex((photo) => photo.id === state.selectedId);
}

function selectedPhoto() {
  const index = selectedPhotoIndex();
  return index >= 0 ? state.photos[index] : null;
}

function setCanvasStatus(message) {
  if (els.canvasStatus) els.canvasStatus.textContent = message;
}

function announceSelectedPhoto() {
  const index = selectedPhotoIndex();
  const photo = selectedPhoto();
  if (!photo || index < 0) return;
  setCanvasStatus(`已選取第 ${index + 1} 張，共 ${state.photos.length} 張；縮放 ${Math.round(photo.zoom * 100)}%。`);
}

function selectPhotoAtIndex(index) {
  if (!state.photos.length) return null;
  const normalizedIndex = (index + state.photos.length) % state.photos.length;
  const photo = state.photos[normalizedIndex];
  state.selectedId = photo.id;
  replaceButtonVisible = true;
  resetAlignmentGuide();
  announceSelectedPhoto();
  scheduleRender({ resize: false });
  return photo;
}

function clearPhotoSelection() {
  state.selectedId = null;
  replaceButtonVisible = false;
  dragState = null;
  pinchState = null;
  resetAlignmentGuide();
  setCanvasStatus("已取消選取照片。");
  scheduleRender({ resize: false });
}

function platformById(platformId) {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === platformId) || SOCIAL_PLATFORMS[0];
}

function platformForRatio(ratio) {
  return SOCIAL_PLATFORMS.find((platform) => platform.variants.some((variant) => variant.id === ratio)) || null;
}

function mobileViewportHeight() {
  if (window.innerWidth > 760) return window.innerHeight;

  const width = Math.round(window.innerWidth);
  const height = Math.round(window.innerHeight);
  const widthChanged = Math.abs(width - stableMobileViewport.width) > 24;
  const orientationChanged = stableMobileViewport.height && Math.abs(height - stableMobileViewport.height) > 180;
  if (!stableMobileViewport.height || widthChanged || orientationChanged) {
    stableMobileViewport = { width, height };
  }
  return stableMobileViewport.height;
}

function resetMobileViewportLock() {
  stableMobileViewport = { width: 0, height: 0 };
}

function currentTransitionFrames(now = performance.now()) {
  if (!frameTransition.active) return null;

  const progress = clamp((now - frameTransition.start) / Math.max(1, frameTransition.duration), 0, 1);
  const eased = easeInOut(progress);
  const frames = frameTransition.to.map((frame, index) => interpolateFrame(frameTransition.from[index], frame, eased));

  if (progress >= 1) {
    frameTransition.active = false;
    return cloneFrames(frameTransition.to);
  }

  return frames;
}

function displayFrames(count, width, height) {
  const animatedFrames = currentTransitionFrames();
  if (
    animatedFrames &&
    frameTransition.count === count &&
    Math.abs(frameTransition.width - width) < 1 &&
    Math.abs(frameTransition.height - height) < 1
  ) {
    return animatedFrames;
  }

  if (sameFrameContext(lastRenderedFrameSet, count, width, height)) {
    return cloneFrames(lastRenderedFrameSet.frames);
  }

  return getFrames(count, width, height);
}

function beginFrameTransition(duration = FRAME_TRANSITION_MS) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  frameTransition.pendingDuration = Math.max(frameTransition.pendingDuration, duration);
  trackReplaceButton(duration + 80);
}

function animatePreviewTransition() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  clearTimeout(previewTransitionTimer);
  els.canvasFrame.classList.remove("is-preview-transitioning");
  void els.canvasFrame.offsetWidth;
  els.canvasFrame.classList.add("is-preview-transitioning");
  trackReplaceButton(460);
  previewTransitionTimer = window.setTimeout(() => {
    els.canvasFrame.classList.remove("is-preview-transitioning");
    syncReplaceButton();
  }, 420);
}

function getExportSize() {
  if (state.ratio === "custom") {
    return {
      width: normalizeCustomSize(state.customWidth),
      height: normalizeCustomSize(state.customHeight),
    };
  }

  const [width, height] = EXPORT_PRESETS[state.ratio] || EXPORT_PRESETS[DEFAULT_RATIO];
  return { width, height };
}

function canvasScale(width, height) {
  return Math.min(width, height) / 720;
}

function scaledSetting(value, width, height) {
  return value * canvasScale(width, height);
}

function minFrameSide(width, height) {
  return Math.max(8, MIN_FRAME_SIDE_BASE * canvasScale(width, height));
}

function createImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function createUserImage(file, maxSide = MAX_PHOTO_SIDE) {
  const src = URL.createObjectURL(file);

  try {
    const img = await createImage(src);
    const size = fitImageSize(img.width, img.height, maxSide);
    if (size.width === img.width && size.height === img.height) return { img, src };

    // ponytail: cap total photo pixels for mobile; raise the budget only if measured export quality requires it.
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.getContext("2d").drawImage(img, 0, 0, size.width, size.height);
    URL.revokeObjectURL(src);
    return { img: canvas, src: "" };
  } catch (error) {
    URL.revokeObjectURL(src);
    throw error;
  }
}

function releasePhotoImage(photo) {
  if (photo.src) URL.revokeObjectURL(photo.src);
  if (photo.img instanceof HTMLCanvasElement) {
    photo.img.width = 0;
    photo.img.height = 0;
  }
}

function resizePhotoImage(photo, maxSide) {
  const size = fitImageSize(photo.img.width, photo.img.height, maxSide);
  if (size.width === photo.img.width && size.height === photo.img.height) return;

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d").drawImage(photo.img, 0, 0, size.width, size.height);
  releasePhotoImage(photo);
  photo.img = canvas;
  photo.src = "";
}

function enforcePhotoPixelBudget(photos) {
  const maxSide = maxPhotoSideForCount(photos.length);
  photos.forEach((photo) => {
    if (photo.source === "user") resizePhotoImage(photo, maxSide);
  });
}

function photoDefaults(img, source, name, src) {
  return {
    id: uid(),
    name,
    src,
    source,
    img,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

function drawPlaceholderFill(ctx, index, width, height) {
  ctx.fillStyle = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  ctx.fillRect(0, 0, width, height);
}

function drawPlaceholderNumber(ctx, frame, number, fontSize) {
  const text = String(number);
  ctx.save();
  ctx.fillStyle = "rgba(17, 24, 39, 0.72)";
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const measuredWidth = ctx.measureText(text).width;
  const targetWidth = fontSize * 0.62;
  const scaleX = measuredWidth > 0 ? clamp(targetWidth / measuredWidth, 1, 1.35) : 1;
  ctx.translate(frame.x + frame.w / 2, frame.y + frame.h / 2);
  ctx.scale(scaleX, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

async function createDemoPhotos() {
  const photos = [];
  for (let index = 0; index < 6; index += 1) {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 900;
    sampleCanvas.height = 900;
    const ctx = sampleCanvas.getContext("2d");
    drawPlaceholderFill(ctx, index, sampleCanvas.width, sampleCanvas.height);
    const src = sampleCanvas.toDataURL("image/jpeg", 0.92);
    const img = await createImage(src);
    photos.push(photoDefaults(img, "demo", `位置 ${index + 1}`, src));
  }
  return photos;
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function gridRect(col, row, colSpan, rowSpan, cols, rows, width, height, gap) {
  const { safeGap, outer, innerW, innerH } = gridMetrics(cols, rows, width, height, gap);
  const cellW = (innerW - safeGap * (cols - 1)) / cols;
  const cellH = (innerH - safeGap * (rows - 1)) / rows;
  return {
    x: outer + col * (cellW + safeGap),
    y: outer + row * (cellH + safeGap),
    w: cellW * colSpan + safeGap * (colSpan - 1),
    h: cellH * rowSpan + safeGap * (rowSpan - 1),
  };
}

function gridMetrics(cols, rows, width, height, gap) {
  const minimumFrameSide = Math.min(minFrameSide(width, height), width / cols, height / rows);
  const maxGapX = Math.max(0, (width - minimumFrameSide * cols) / (cols + 1));
  const maxGapY = Math.max(0, (height - minimumFrameSide * rows) / (rows + 1));
  const safeGap = Math.min(gap, maxGapX, maxGapY);
  const outer = safeGap;
  return {
    safeGap,
    outer,
    innerW: width - outer * 2,
    innerH: height - outer * 2,
  };
}

function distributeIntoGroups(count, groups) {
  const base = Math.floor(count / groups);
  let remainder = count % groups;
  return Array.from({ length: groups }, () => {
    const size = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return size;
  });
}

function makePackedRows(count, rowCount, width, height, gap) {
  const rowSizes = distributeIntoGroups(count, rowCount);
  const maxCols = Math.max(...rowSizes);
  const { safeGap, outer, innerW, innerH } = gridMetrics(maxCols, rowCount, width, height, gap);
  const rowH = (innerH - safeGap * (rowCount - 1)) / rowCount;
  const frames = [];

  rowSizes.forEach((cols, row) => {
    const cellW = (innerW - safeGap * (cols - 1)) / cols;
    for (let col = 0; col < cols; col += 1) {
      frames.push({
        x: outer + col * (cellW + safeGap),
        y: outer + row * (rowH + safeGap),
        w: cellW,
        h: rowH,
      });
    }
  });

  return frames;
}

function sortFramesByReadingOrder(frames) {
  return frames.slice().sort((a, b) => {
    if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
    return a.x - b.x;
  });
}

function makePackedColumns(count, colCount, width, height, gap) {
  const columnSizes = distributeIntoGroups(count, colCount);
  const maxRows = Math.max(...columnSizes);
  const { safeGap, outer, innerW, innerH } = gridMetrics(colCount, maxRows, width, height, gap);
  const colW = (innerW - safeGap * (colCount - 1)) / colCount;
  const frames = [];

  columnSizes.forEach((rows, col) => {
    const cellH = (innerH - safeGap * (rows - 1)) / rows;
    for (let row = 0; row < rows; row += 1) {
      frames.push({
        x: outer + col * (colW + safeGap),
        y: outer + row * (cellH + safeGap),
        w: colW,
        h: cellH,
      });
    }
  });

  return sortFramesByReadingOrder(frames);
}

function frameLayoutScore(frames, targetAspect) {
  const areas = frames.map((frame) => frame.w * frame.h);
  const minArea = Math.max(1, Math.min(...areas));
  const maxArea = Math.max(...areas);
  const aspectScore =
    frames.reduce((total, frame) => total + Math.abs(Math.log(frame.w / frame.h / targetAspect)), 0) / frames.length;
  const areaPenalty = Math.log(maxArea / minArea) * 0.14;
  return aspectScore + areaPenalty;
}

function choosePackedFrames(count, width, height, gap, orientation) {
  const target = orientation === "landscape" ? 1.45 : 1 / 1.45;
  let bestFrames = [];
  let bestScore = Infinity;

  for (let groups = 1; groups <= count; groups += 1) {
    const frames =
      orientation === "landscape"
        ? makePackedRows(count, groups, width, height, gap)
        : makePackedColumns(count, groups, width, height, gap);
    const groupPenalty = Math.abs(groups - Math.sqrt(count)) * 0.04;
    const score = frameLayoutScore(frames, target) + groupPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestFrames = frames;
    }
  }

  return bestFrames;
}

function makeOrientedFrames(count, width, height, gap, orientation) {
  return choosePackedFrames(count, width, height, gap, orientation);
}

function makeAutoFrames(count, width, height, gap) {
  if (state.tileOrientation === "portrait" || state.tileOrientation === "landscape") {
    return makeOrientedFrames(count, width, height, gap, state.tileOrientation);
  }

  const aspect = width / height;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
  const rows = Math.max(1, Math.ceil(count / cols));
  return Array.from({ length: count }, (_, index) =>
    gridRect(index % cols, Math.floor(index / cols), 1, 1, cols, rows, width, height, gap),
  );
}

function makeLineFrames(count, width, height, gap, direction) {
  if (direction === "rows") {
    return Array.from({ length: count }, (_, index) =>
      gridRect(0, index, 1, 1, 1, count, width, height, gap),
    );
  }
  return Array.from({ length: count }, (_, index) =>
    gridRect(index, 0, 1, 1, count, 1, width, height, gap),
  );
}

function firstEmptyCell(occupied, cols, rows) {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!occupied[`${col}:${row}`]) return { col, row };
    }
  }
  return { col: 0, row: rows - 1 };
}

function occupy(occupied, col, row, colSpan, rowSpan) {
  for (let y = row; y < row + rowSpan; y += 1) {
    for (let x = col; x < col + colSpan; x += 1) {
      occupied[`${x}:${y}`] = true;
    }
  }
}

function makeMosaicFrames(count, width, height, gap) {
  if (count <= 2) {
    return width >= height
      ? makeLineFrames(count, width, height, gap, "columns")
      : makeLineFrames(count, width, height, gap, "rows");
  }

  if (count === 3) {
    if (width >= height) {
      return [
        gridRect(0, 0, 2, 2, 3, 2, width, height, gap),
        gridRect(2, 0, 1, 1, 3, 2, width, height, gap),
        gridRect(2, 1, 1, 1, 3, 2, width, height, gap),
      ];
    }
    return [
      gridRect(0, 0, 2, 2, 2, 3, width, height, gap),
      gridRect(0, 2, 1, 1, 2, 3, width, height, gap),
      gridRect(1, 2, 1, 1, 2, 3, width, height, gap),
    ];
  }

  if (count === 4) {
    return makeAutoFrames(count, width, height, gap);
  }

  const aspect = width / height;
  const cols = aspect > 1.35 ? 5 : aspect < 0.75 ? 3 : 4;
  const rows = Math.ceil((count + 3) / cols);
  const occupied = {};
  const frames = [gridRect(0, 0, 2, 2, cols, rows, width, height, gap)];
  occupy(occupied, 0, 0, 2, 2);

  for (let index = 1; index < count; index += 1) {
    const cell = firstEmptyCell(occupied, cols, rows);
    frames.push(gridRect(cell.col, cell.row, 1, 1, cols, rows, width, height, gap));
    occupy(occupied, cell.col, cell.row, 1, 1);
  }

  return frames;
}

function getFrames(count, width, height) {
  const gap = Math.min(scaledSetting(state.gap, width, height), Math.min(width, height) / 9);
  if (!count) return [];
  if (state.layout === "rows") return makeLineFrames(count, width, height, gap, "rows");
  if (state.layout === "columns") return makeLineFrames(count, width, height, gap, "columns");
  if (state.layout === "mosaic") return makeMosaicFrames(count, width, height, gap);
  return makeAutoFrames(count, width, height, gap);
}

function coverImageMetrics(photo, frame, offsets = photo) {
  const base = Math.max(frame.w / photo.img.width, frame.h / photo.img.height);
  const scale = base * photo.zoom;
  const drawW = photo.img.width * scale;
  const drawH = photo.img.height * scale;
  const x = frame.x + frame.w / 2 - drawW / 2 + offsets.offsetX * frame.w;
  const y = frame.y + frame.h / 2 - drawH / 2 + offsets.offsetY * frame.h;
  return { x, y, drawW, drawH };
}

function photoPanLimits(photo, frame) {
  const base = Math.max(frame.w / photo.img.width, frame.h / photo.img.height);
  const scale = base * photo.zoom;
  const drawW = photo.img.width * scale;
  const drawH = photo.img.height * scale;
  return {
    x: Math.max(0, (drawW - frame.w) / (2 * Math.max(1, frame.w))),
    y: Math.max(0, (drawH - frame.h) / (2 * Math.max(1, frame.h))),
  };
}

function snapThreshold(pixelThreshold, frameSide, maxRatio) {
  return Math.min(maxRatio, Math.max(pixelThreshold / Math.max(1, frameSide), 0.001));
}

function snapAxisOffset(rawValue, limit, frameSide, centerPixelThreshold, edgePixelThreshold) {
  if (limit <= 0.0001) {
    return { rawValue: 0, value: 0, snap: "center" };
  }

  const clamped = clamp(rawValue, -limit, limit);
  const centerThreshold = snapThreshold(centerPixelThreshold, frameSide, 0.04);
  const edgeThreshold = snapThreshold(edgePixelThreshold, frameSide, 0.04);
  const candidates = [];

  if (Math.abs(clamped) <= centerThreshold) {
    candidates.push({ snap: "center", value: 0, distance: Math.abs(clamped) });
  }
  if (limit - clamped <= edgeThreshold) {
    candidates.push({ snap: "positiveEdge", value: limit, distance: limit - clamped });
  }
  if (clamped + limit <= edgeThreshold) {
    candidates.push({ snap: "negativeEdge", value: -limit, distance: clamped + limit });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  const snap = candidates[0];
  return {
    rawValue: clamped,
    value: snap ? snap.value : clamped,
    snap: snap?.snap || "",
  };
}

function resetAlignmentGuide() {
  alignmentGuide.active = false;
  alignmentGuide.centerX = false;
  alignmentGuide.centerY = false;
  alignmentGuide.edgeLeft = false;
  alignmentGuide.edgeRight = false;
  alignmentGuide.edgeTop = false;
  alignmentGuide.edgeBottom = false;
}

function applyPhotoBoundsAndSnap(photo, frame, rawOffsetX = photo.offsetX, rawOffsetY = photo.offsetY, showGuide = false) {
  const limits = photoPanLimits(photo, frame);
  const x = snapAxisOffset(rawOffsetX, limits.x, frame.w, CENTER_SNAP_THRESHOLD, EDGE_SNAP_THRESHOLD);
  const y = snapAxisOffset(rawOffsetY, limits.y, frame.h, CENTER_SNAP_THRESHOLD, EDGE_SNAP_THRESHOLD);

  photo.offsetX = x.value;
  photo.offsetY = y.value;
  alignmentGuide.active = showGuide;
  alignmentGuide.centerX = x.snap === "center";
  alignmentGuide.centerY = y.snap === "center";
  alignmentGuide.edgeLeft = x.snap === "positiveEdge";
  alignmentGuide.edgeRight = x.snap === "negativeEdge";
  alignmentGuide.edgeTop = y.snap === "positiveEdge";
  alignmentGuide.edgeBottom = y.snap === "negativeEdge";

  return {
    rawOffsetX: x.rawValue,
    rawOffsetY: y.rawValue,
  };
}

function constrainedPhotoOffsets(photo, frame) {
  const limits = photoPanLimits(photo, frame);
  return {
    offsetX: clamp(photo.offsetX, -limits.x, limits.x),
    offsetY: clamp(photo.offsetY, -limits.y, limits.y),
  };
}

function constrainPhotoToFrame(photo, frame) {
  const offsets = constrainedPhotoOffsets(photo, frame);
  photo.offsetX = offsets.offsetX;
  photo.offsetY = offsets.offsetY;
}

function strokeSelectedFrame(ctx, frame, photoRadius) {
  const inset = SELECTION_FRAME_INSET;
  const radius = Math.min(
    Math.max(0, photoRadius - inset),
    Math.max(0, (frame.w - inset * 2) / 2),
    Math.max(0, (frame.h - inset * 2) / 2),
  );
  ctx.save();
  roundedRect(ctx, frame.x + inset, frame.y + inset, frame.w - inset * 2, frame.h - inset * 2, radius);
  ctx.lineWidth = SELECTION_FRAME_WIDTH;
  ctx.strokeStyle = "#007aff";
  ctx.stroke();
  ctx.restore();
}

function strokeGuideLine(ctx, fromX, fromY, toX, toY, snapped) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = snapped ? 2.75 : 1.8;
  ctx.strokeStyle = snapped ? "rgba(0, 122, 255, 0.92)" : "rgba(0, 122, 255, 0.46)";
  ctx.setLineDash(snapped ? [] : [7, 7]);
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0, 122, 255, 0.28)";
  ctx.shadowBlur = snapped ? 10 : 4;
  ctx.stroke();
  ctx.restore();
}

function strokeAlignmentGuides(ctx, frame) {
  if (!alignmentGuide.active) return;

  const x = frame.x + frame.w / 2;
  const y = frame.y + frame.h / 2;
  const xInset = Math.min(18, Math.max(8, frame.w * 0.08));
  const yInset = Math.min(18, Math.max(8, frame.h * 0.08));
  strokeGuideLine(ctx, x, frame.y + yInset, x, frame.y + frame.h - yInset, alignmentGuide.centerX);
  strokeGuideLine(ctx, frame.x + xInset, y, frame.x + frame.w - xInset, y, alignmentGuide.centerY);

  const edgeInset = Math.min(14, Math.max(6, Math.min(frame.w, frame.h) * 0.05));
  if (alignmentGuide.edgeLeft) {
    strokeGuideLine(ctx, frame.x + 1.5, frame.y + edgeInset, frame.x + 1.5, frame.y + frame.h - edgeInset, true);
  }
  if (alignmentGuide.edgeRight) {
    strokeGuideLine(ctx, frame.x + frame.w - 1.5, frame.y + edgeInset, frame.x + frame.w - 1.5, frame.y + frame.h - edgeInset, true);
  }
  if (alignmentGuide.edgeTop) {
    strokeGuideLine(ctx, frame.x + edgeInset, frame.y + 1.5, frame.x + frame.w - edgeInset, frame.y + 1.5, true);
  }
  if (alignmentGuide.edgeBottom) {
    strokeGuideLine(ctx, frame.x + edgeInset, frame.y + frame.h - 1.5, frame.x + frame.w - edgeInset, frame.y + frame.h - 1.5, true);
  }
}

function placeholderFontSize(frames, canvasWidth, canvasHeight) {
  const smallestFrameSide = frames.reduce((smallest, frame) => Math.min(smallest, frame.w, frame.h), Infinity);
  const canvasSide = Math.min(canvasWidth, canvasHeight);
  return Math.round(Math.max(18, Math.min(smallestFrameSide * 0.42, canvasSide * 0.16)));
}

function drawPhotoFrame(ctx, photo, frame, canvasWidth, canvasHeight, placeholderNumber = null, fontSize = 0) {
  const radius = Math.min(scaledSetting(state.radius, canvasWidth, canvasHeight), frame.w / 2, frame.h / 2);
  const offsets = constrainedPhotoOffsets(photo, frame);
  ctx.save();
  roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, radius);
  ctx.clip();
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
  const metrics = coverImageMetrics(photo, frame, offsets);
  ctx.drawImage(photo.img, metrics.x, metrics.y, metrics.drawW, metrics.drawH);
  ctx.restore();

  if (photo.source === "demo" && placeholderNumber !== null) {
    drawPlaceholderNumber(ctx, frame, placeholderNumber, fontSize);
  }
}

function drawEmptyState(ctx, width, height) {
  const frames = makeAutoFrames(6, width, height, Math.min(scaledSetting(state.gap || 18, width, height), Math.min(width, height) / 10));
  ctx.save();
  frames.forEach((frame, index) => {
    const gradient = ctx.createLinearGradient(frame.x, frame.y, frame.x + frame.w, frame.y + frame.h);
    gradient.addColorStop(0, `hsla(${205 + index * 28}, 85%, 78%, 0.42)`);
    gradient.addColorStop(1, `hsla(${340 - index * 18}, 88%, 82%, 0.34)`);
    roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, Math.min(scaledSetting(state.radius, width, height), frame.w / 2, frame.h / 2));
    ctx.fillStyle = gradient;
    ctx.fill();
  });
  ctx.restore();
}

function startPendingFrameTransition(targetFrames, count, width, height) {
  if (!frameTransition.pendingDuration) return;

  const duration = frameTransition.pendingDuration;
  frameTransition.pendingDuration = 0;

  const fromFrames =
    frameTransition.active &&
    frameTransition.count === count &&
    Math.abs(frameTransition.width - width) < 1 &&
    Math.abs(frameTransition.height - height) < 1
      ? currentTransitionFrames()
      : sameFrameContext(lastRenderedFrameSet, count, width, height)
        ? cloneFrames(lastRenderedFrameSet.frames)
        : null;

  if (!fromFrames || fromFrames.length !== targetFrames.length) return;

  frameTransition.active = true;
  frameTransition.from = cloneFrames(fromFrames);
  frameTransition.to = cloneFrames(targetFrames);
  frameTransition.width = width;
  frameTransition.height = height;
  frameTransition.count = count;
  frameTransition.start = performance.now();
  frameTransition.duration = duration;
}

function framesForCollage(count, width, height, exporting) {
  const targetFrames = getFrames(count, width, height);
  if (exporting) return targetFrames;

  startPendingFrameTransition(targetFrames, count, width, height);

  const animatedFrames = currentTransitionFrames();
  const frames =
    animatedFrames &&
    frameTransition.count === count &&
    Math.abs(frameTransition.width - width) < 1 &&
    Math.abs(frameTransition.height - height) < 1
      ? animatedFrames
      : targetFrames;

  lastRenderedFrameSet = {
    frames: cloneFrames(frames),
    width,
    height,
    count,
  };

  if (frameTransition.active) scheduleCanvasRender();
  return frames;
}

function drawCollage(ctx, width, height, options = {}) {
  const exporting = Boolean(options.exporting);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = state.background;
  ctx.fillRect(0, 0, width, height);

  if (!state.photos.length) {
    drawEmptyState(ctx, width, height);
    return;
  }

  const frames = framesForCollage(state.photos.length, width, height, exporting);
  const demoFontSize = placeholderFontSize(frames, width, height);
  state.photos.forEach((photo, index) => {
    drawPhotoFrame(ctx, photo, frames[index], width, height, index + 1, demoFontSize);
  });

  const selectedIndex = selectedPhotoIndex();
  if (!exporting && selectedIndex >= 0 && frames[selectedIndex]) {
    const frame = frames[selectedIndex];
    const photoRadius = Math.min(scaledSetting(state.radius, width, height), frame.w / 2, frame.h / 2);
    strokeAlignmentGuides(ctx, frame);
    strokeSelectedFrame(ctx, frame, photoRadius);
  }
}

function resizeCanvas() {
  const { width: exportW, height: exportH } = getExportSize();
  const aspect = exportW / exportH;
  const frameStyle = getComputedStyle(els.canvasFrame);
  const padX = parseFloat(frameStyle.paddingLeft) + parseFloat(frameStyle.paddingRight);
  const padY = parseFloat(frameStyle.paddingTop) + parseFloat(frameStyle.paddingBottom);
  const isMobile = window.innerWidth <= 760;
  const viewportHeight = isMobile ? mobileViewportHeight() : window.innerHeight;
  const mobilePreviewRatio = viewportHeight < 740 ? 0.5 : 0.58;
  const frameWidthSource = els.canvasFrame.parentElement.clientWidth;
  const availableW = Math.max(180, frameWidthSource - padX);
  const availableH = Math.max(180, viewportHeight * (isMobile ? mobilePreviewRatio : 0.76) - padY);
  let width = Math.min(availableW, 880);
  let height = width / aspect;

  if (height > availableH) {
    height = availableH;
    width = height * aspect;
  }

  const nextWidth = Math.round(width);
  const nextHeight = Math.round(height);
  const nextDpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const backingWidth = Math.round(nextWidth * nextDpr);
  const backingHeight = Math.round(nextHeight * nextDpr);
  const cssChanged = preview.width !== nextWidth || preview.height !== nextHeight;
  const backingChanged = els.canvas.width !== backingWidth || els.canvas.height !== backingHeight;

  preview.width = nextWidth;
  preview.height = nextHeight;
  preview.dpr = nextDpr;

  if (cssChanged) {
    els.canvas.style.width = `${preview.width}px`;
    els.canvas.style.height = `${preview.height}px`;
  }
  if (backingChanged) {
    els.canvas.width = backingWidth;
    els.canvas.height = backingHeight;
  }

  drawPreview();
}

function drawPreview() {
  if (!preview.width || !preview.height) return;
  const ctx = els.canvas.getContext("2d");
  ctx.setTransform(preview.dpr, 0, 0, preview.dpr, 0, 0);
  drawCollage(ctx, preview.width, preview.height);
  syncReplaceButton();
}

function scheduleRender({ resize = true, controls = true } = {}) {
  renderNeedsResize ||= resize;
  renderNeedsControls ||= controls;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const shouldResize = renderNeedsResize || !preview.width;
    const shouldUpdateControls = renderNeedsControls;
    renderNeedsResize = false;
    renderNeedsControls = false;
    if (shouldResize) resizeCanvas();
    else drawPreview();
    if (shouldUpdateControls) updateControls();
  });
}

function scheduleCanvasRender() {
  scheduleRender({ resize: false, controls: false });
}

function updateButtons(selector, activeValue, dataKey) {
  document.querySelectorAll(selector).forEach((button) => {
    const isActive = button.dataset[dataKey] === activeValue;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncOrientationButtons() {
  const isAutoLayout = state.layout === "auto";
  document.querySelectorAll("[data-tile-orientation]").forEach((button) => {
    const isActive = isAutoLayout && button.dataset.tileOrientation === state.tileOrientation;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelector("#orientationButtons")?.classList.toggle("is-passive", !isAutoLayout);
}

function renderRatioSubmenu() {
  const platform = platformById(state.platform);
  const key = state.ratio === "custom" ? "custom" : `${platform.id}:${state.ratio}`;
  if (key === ratioSubmenuKey) return;

  ratioSubmenuKey = key;
  els.ratioSubmenu.replaceChildren();
  els.ratioSubmenu.hidden = state.ratio === "custom";
  if (els.ratioSubmenu.hidden) return;

  platform.variants.forEach((variant) => {
    const button = document.createElement("button");
    button.className = "variant-chip";
    button.type = "button";
    button.dataset.ratio = variant.id;
    button.title = variant.size;
    const isActive = variant.id === state.ratio;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    const label = document.createElement("span");
    label.textContent = variant.label;
    const size = document.createElement("small");
    size.textContent = variant.size;
    button.append(label, size);

    button.addEventListener("click", () => setRatio(variant.id));
    els.ratioSubmenu.append(button);
  });
}

function syncRatioButtons() {
  document.querySelectorAll("[data-platform]").forEach((button) => {
    const isActive = state.ratio !== "custom" && button.dataset.platform === state.platform;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updateButtons("[data-ratio]", state.ratio, "ratio");
}

function hasOnlyDemoPhotos() {
  return state.photos.length > 0 && state.photos.every((photo) => photo.source === "demo");
}

function revokeUserPhotoUrls(photos = state.photos) {
  photos.forEach((photo) => {
    if (photo.source === "user") releasePhotoImage(photo);
  });
}

function clearPhotos() {
  if (state.isResetting || state.isImporting || state.isExporting) return;
  nextPhotoMutationToken();
  const previousPhotos = state.photos.slice();
  state.photos = [];
  state.selectedId = null;
  dragState = null;
  pinchState = null;
  activePointers.clear();
  resetAlignmentGuide();
  replaceButtonVisible = false;
  setCanvasStatus("已清除所有照片。");
  closeExportMenu();
  revokeUserPhotoUrls(previousPhotos);
  scheduleRender();
}

async function loadDemoPhotos() {
  if (state.isResetting || state.isExporting) return;
  const token = nextPhotoMutationToken();
  state.isResetting = true;
  state.isImporting = false;
  closeExportMenu();
  const previousPhotos = state.photos.slice();
  state.selectedId = null;
  dragState = null;
  pinchState = null;
  activePointers.clear();
  resetAlignmentGuide();
  replaceButtonVisible = false;
  updateControls();
  scheduleRender();

  try {
    const demoPhotos = await createDemoPhotos();
    if (!isCurrentPhotoMutation(token)) return;
    state.photos = demoPhotos;
    revokeUserPhotoUrls(previousPhotos);
  } finally {
    state.isResetting = false;
    scheduleRender();
  }
}

function syncReplaceButton() {
  const selectedIndex = selectedPhotoIndex();
  if (!replaceButtonVisible || selectedIndex < 0 || !state.photos.length || !preview.width || !preview.height) {
    els.replacePhotoButton.hidden = true;
    els.canvasFrame.classList.remove("has-selected-photo");
    return;
  }

  const frames = displayFrames(state.photos.length, preview.width, preview.height);
  const frame = frames[selectedIndex];
  if (!frame) {
    els.replacePhotoButton.hidden = true;
    els.canvasFrame.classList.remove("has-selected-photo");
    return;
  }

  const canvasRect = els.canvas.getBoundingClientRect();
  const frameRect = els.canvasFrame.getBoundingClientRect();
  const scaleX = canvasRect.width / preview.width;
  const scaleY = canvasRect.height / preview.height;
  const inset = Math.min(8, Math.max(4, Math.min(frame.w * scaleX, frame.h * scaleY) * 0.08));
  const left = canvasRect.left - frameRect.left + frame.x * scaleX + inset;
  const top = canvasRect.top - frameRect.top + frame.y * scaleY + inset;
  const buttonStyle = getComputedStyle(els.replacePhotoButton);
  const buttonWidth = parseFloat(buttonStyle.width) || 44;
  const buttonHeight = parseFloat(buttonStyle.height) || 44;
  const safeLeft = clamp(left, 2, Math.max(2, frameRect.width - buttonWidth - 2));
  const safeTop = clamp(top, 2, Math.max(2, frameRect.height - buttonHeight - 2));

  els.replacePhotoButton.style.setProperty("--replace-x", `${Math.round(safeLeft)}px`);
  els.replacePhotoButton.style.setProperty("--replace-y", `${Math.round(safeTop)}px`);
  els.replacePhotoButton.hidden = false;
  els.canvasFrame.classList.add("has-selected-photo");
}

function trackReplaceButton(duration = 300) {
  cancelAnimationFrame(replaceButtonTrackRaf);
  const endAt = performance.now() + duration;

  function tick() {
    syncReplaceButton();
    if (performance.now() < endAt) {
      replaceButtonTrackRaf = requestAnimationFrame(tick);
    }
  }

  tick();
}

function updateControls() {
  const isBusy = state.isResetting || state.isImporting || state.isExporting;
  els.clearButton.textContent = "清除";
  els.clearButton.disabled = state.photos.length === 0 || isBusy;
  els.addPhotoButton.disabled = isBusy;
  els.replacePhotoButton.disabled = isBusy || selectedPhotoIndex() < 0;
  const isCustomSizeOpen = state.ratio === "custom";
  els.customSize.classList.toggle("is-open", isCustomSizeOpen);
  els.customSize.hidden = !isCustomSizeOpen;
  els.customSize.setAttribute("aria-hidden", String(!isCustomSizeOpen));
  els.exportToggle.disabled = state.photos.length === 0 || isBusy;
  els.exportOptions.forEach((button) => {
    button.disabled = isBusy;
  });
  if (state.photos.length === 0 || isBusy) closeExportMenu();

  renderRatioSubmenu();
  syncRatioButtons();
  updateButtons("[data-layout]", state.layout, "layout");
  syncOrientationButtons();
  document.querySelectorAll(".swatch").forEach((button) => {
    const isActive = button.dataset.color === state.background;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  els.gapRange.value = state.gap;
  els.gapValue.value = state.gap;
  els.radiusRange.value = state.radius;
  els.radiusValue.value = state.radius;
  syncCustomSizeControls();

  const photo = selectedPhoto();
  const hasPhoto = Boolean(photo);
  els.zoomRange.disabled = !hasPhoto;
  els.zoomRow.classList.toggle("is-disabled", !hasPhoto);
  els.zoomRow.setAttribute("aria-disabled", String(!hasPhoto));

  if (photo) {
    const zoomAmount = Math.round((photo.zoom - 1) * 100);
    els.zoomRange.value = zoomAmount;
    els.zoomValue.value = zoomAmount;
  }
}

async function addFiles(fileList) {
  if (state.isResetting || state.isImporting || state.isExporting) return;
  const allFiles = Array.from(fileList);
  const files = allFiles.filter((file) => file.type.startsWith("image/"));
  if (!files.length) {
    window.alert("請選擇可讀取的圖片檔案。");
    return;
  }

  const shouldReplaceDemo = hasOnlyDemoPhotos();
  const basePhotos = shouldReplaceDemo ? [] : state.photos.slice();
  const previousPhotos = shouldReplaceDemo ? state.photos.slice() : [];
  const availableSlots = Math.max(0, MAX_PHOTOS - basePhotos.length);
  const accepted = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    window.alert(`最多一次保留 ${MAX_PHOTOS} 張照片。`);
  }
  if (!accepted.length) return;

  const token = nextPhotoMutationToken();
  const loadedPhotos = [];
  const importMaxSide = maxPhotoSideForCount(basePhotos.length + accepted.length);
  let failedCount = allFiles.length - files.length;
  let portraitCount = 0;
  let landscapeCount = 0;
  state.isImporting = true;
  closeExportMenu();
  updateControls();

  try {
    for (const file of accepted) {
      try {
        const image = await createUserImage(file, importMaxSide);
        if (!isCurrentPhotoMutation(token)) {
          releasePhotoImage(image);
          return;
        }

        if (image.img.width >= image.img.height) {
          landscapeCount += 1;
        } else {
          portraitCount += 1;
        }

        const photo = photoDefaults(
          image.img,
          "user",
          file.name || `照片 ${basePhotos.length + loadedPhotos.length + 1}`,
          image.src,
        );
        loadedPhotos.push(photo);
      } catch (error) {
        failedCount += 1;
        console.warn(`無法讀取圖片：${file.name || "未命名檔案"}`, error);
      }
    }

    if (!isCurrentPhotoMutation(token)) return;
    if (!loadedPhotos.length) {
      if (failedCount) window.alert(`${failedCount} 張照片無法讀取，請改用 PNG、JPG 或瀏覽器支援的圖片格式。`);
      return;
    }

    const nextPhotos = basePhotos.concat(loadedPhotos);
    enforcePhotoPixelBudget(nextPhotos);
    state.photos = nextPhotos;
    state.selectedId = loadedPhotos[loadedPhotos.length - 1].id;
    replaceButtonVisible = true;
    announceSelectedPhoto();
    revokeUserPhotoUrls(previousPhotos);

    const loadedCount = portraitCount + landscapeCount;
    if (loadedCount > 1 && state.layout === "auto" && portraitCount !== landscapeCount) {
      state.tileOrientation = landscapeCount > portraitCount ? "landscape" : "portrait";
    }
    if (failedCount) window.alert(`${failedCount} 張照片無法讀取，其餘照片已成功加入。`);
  } finally {
    if (!isCurrentPhotoMutation(token)) revokeUserPhotoUrls(loadedPhotos);
    if (isCurrentPhotoMutation(token)) state.isImporting = false;
    scheduleRender();
  }
}

async function replaceSelectedPhoto(fileList) {
  if (state.isResetting || state.isImporting || state.isExporting) return;
  const file = Array.from(fileList).find((item) => item.type.startsWith("image/"));
  const selectedIndex = selectedPhotoIndex();
  if (!file || selectedIndex < 0) return;

  const previousPhoto = state.photos[selectedIndex];
  const token = nextPhotoMutationToken();
  state.isImporting = true;
  closeExportMenu();
  updateControls();

  try {
    const image = await createUserImage(file, maxPhotoSideForCount(state.photos.length));
    if (!isCurrentPhotoMutation(token)) {
      releasePhotoImage(image);
      return;
    }

    const currentIndex = state.photos.findIndex((photo) => photo.id === previousPhoto.id);
    if (currentIndex < 0) {
      releasePhotoImage(image);
      return;
    }

    if (previousPhoto.source === "user") releasePhotoImage(previousPhoto);

    const nextPhoto = photoDefaults(
      image.img,
      "user",
      file.name || previousPhoto.name || `照片 ${currentIndex + 1}`,
      image.src,
    );
    nextPhoto.id = previousPhoto.id;
    state.photos[currentIndex] = nextPhoto;
    enforcePhotoPixelBudget(state.photos);
    state.selectedId = nextPhoto.id;
    replaceButtonVisible = true;
    announceSelectedPhoto();
  } catch (error) {
    console.warn(`無法重新匯入圖片：${file.name || "未命名檔案"}`, error);
    window.alert("這張照片無法讀取，原本的照片已保留。請改用 PNG、JPG 或瀏覽器支援的圖片格式。");
  } finally {
    if (isCurrentPhotoMutation(token)) state.isImporting = false;
    scheduleRender();
  }
}

function setPlatform(platformId) {
  const platform = platformById(platformId);
  state.platform = platform.id;
  if (!platform.variants.some((variant) => variant.id === state.ratio)) {
    state.ratio = platform.variants[0].id;
  }
  closeExportMenu();
  clearCustomSizeWarning();
  animatePreviewTransition();
  scheduleRender();
}

function setRatio(ratio) {
  state.ratio = ratio;
  const platform = platformForRatio(ratio);
  if (platform) state.platform = platform.id;
  closeExportMenu();
  clearCustomSizeWarning();
  animatePreviewTransition();
  scheduleRender();
}

function setSelectedNumber(key, value) {
  const photo = selectedPhoto();
  if (!photo) return;
  if (key === "zoom") photo.zoom = clamp(1 + value / 100, 1, 2.6);
  constrainSelectedPhotoToFrame();
  syncZoomControls();
  scheduleCanvasRender();
}

function resetSelected() {
  const photo = selectedPhoto();
  if (!photo) return;
  photo.zoom = 1;
  photo.offsetX = 0;
  photo.offsetY = 0;
  syncZoomControls();
  scheduleCanvasRender();
}

function canvasPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * preview.width,
    y: ((event.clientY - rect.top) / rect.height) * preview.height,
  };
}

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointerMidpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function selectedFrame() {
  const selectedIndex = selectedPhotoIndex();
  if (selectedIndex < 0) return null;
  const frames = displayFrames(state.photos.length, preview.width, preview.height);
  return frames[selectedIndex] || null;
}

function constrainSelectedPhotoToFrame() {
  const photo = selectedPhoto();
  const frame = selectedFrame();
  if (photo && frame) constrainPhotoToFrame(photo, frame);
}

function syncZoomControls() {
  const photo = selectedPhoto();
  if (!photo) return;
  const zoomAmount = Math.round((photo.zoom - 1) * 100);
  els.zoomRange.value = zoomAmount;
  els.zoomValue.value = zoomAmount;
}

function hitGrid(point) {
  const frames = displayFrames(state.photos.length, preview.width, preview.height);
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index];
    if (point.x >= frame.x && point.x <= frame.x + frame.w && point.y >= frame.y && point.y <= frame.y + frame.h) {
      return { photo: state.photos[index], frame };
    }
  }
  return null;
}

function clearSelectionFromFrameBlank(event) {
  if (!state.selectedId) return;
  if (event.target === els.canvas || event.target.closest(".canvas-add-button, .canvas-replace-button")) return;
  clearPhotoSelection();
}

function clearSelectionFromStageBlank(event) {
  if (!state.selectedId) return;
  if (event.target.closest(".canvas-frame, .canvas-toolbar")) return;
  clearPhotoSelection();
}

function startCanvasDrag(event) {
  if (!state.photos.length) return;
  event.preventDefault();
  const point = canvasPoint(event);
  activePointers.set(event.pointerId, point);

  const hit = hitGrid(point);
  if (!hit && activePointers.size === 1) {
    activePointers.delete(event.pointerId);
    clearPhotoSelection();
    return;
  }

  if (hit && activePointers.size === 1) {
    state.selectedId = hit.photo.id;
    replaceButtonVisible = true;
    announceSelectedPhoto();
    const offsets = applyPhotoBoundsAndSnap(hit.photo, hit.frame, hit.photo.offsetX, hit.photo.offsetY, true);
    dragState = {
      id: hit.photo.id,
      pointerId: event.pointerId,
      lastX: point.x,
      lastY: point.y,
      frame: hit.frame,
      rawOffsetX: offsets.rawOffsetX,
      rawOffsetY: offsets.rawOffsetY,
    };
  }

  els.canvas.setPointerCapture(event.pointerId);
  if (activePointers.size >= 2) beginPinchGesture();
  scheduleRender({ resize: false });
}

function beginPinchGesture() {
  const photo = selectedPhoto();
  const frame = selectedFrame();
  const points = Array.from(activePointers.values());
  if (!photo || !frame || points.length < 2) return;

  const [first, second] = points;
  const distance = Math.max(1, pointerDistance(first, second));
  dragState = null;
  pinchState = {
    id: photo.id,
    frame,
    startDistance: distance,
    startZoom: photo.zoom,
    lastCenter: pointerMidpoint(first, second),
    rawOffsetX: photo.offsetX,
    rawOffsetY: photo.offsetY,
  };
  const offsets = applyPhotoBoundsAndSnap(photo, frame, photo.offsetX, photo.offsetY, true);
  pinchState.rawOffsetX = offsets.rawOffsetX;
  pinchState.rawOffsetY = offsets.rawOffsetY;
}

function updatePinchGesture() {
  const photo = selectedPhoto();
  if (!pinchState || !photo || photo.id !== pinchState.id || activePointers.size < 2) return;

  const points = Array.from(activePointers.values());
  const [first, second] = points;
  const distance = Math.max(1, pointerDistance(first, second));
  const center = pointerMidpoint(first, second);
  const zoomRatio = distance / pinchState.startDistance;
  photo.zoom = clamp(pinchState.startZoom * zoomRatio, 1, 2.6);
  pinchState.rawOffsetX = clamp(
    pinchState.rawOffsetX + (center.x - pinchState.lastCenter.x) / Math.max(1, pinchState.frame.w),
    -0.9,
    0.9,
  );
  pinchState.rawOffsetY = clamp(
    pinchState.rawOffsetY + (center.y - pinchState.lastCenter.y) / Math.max(1, pinchState.frame.h),
    -0.9,
    0.9,
  );
  photo.offsetX = pinchState.rawOffsetX;
  photo.offsetY = pinchState.rawOffsetY;
  pinchState.lastCenter = center;
  const offsets = applyPhotoBoundsAndSnap(photo, pinchState.frame, pinchState.rawOffsetX, pinchState.rawOffsetY, true);
  pinchState.rawOffsetX = offsets.rawOffsetX;
  pinchState.rawOffsetY = offsets.rawOffsetY;
  syncZoomControls();
  scheduleCanvasRender();
}

function moveCanvasDrag(event) {
  if (!activePointers.has(event.pointerId)) return;
  event.preventDefault();
  activePointers.set(event.pointerId, canvasPoint(event));

  if (pinchState || activePointers.size >= 2) {
    if (!pinchState) beginPinchGesture();
    updatePinchGesture();
    return;
  }

  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const photo = selectedPhoto();
  if (!photo || photo.id !== dragState.id) return;

  const point = activePointers.get(event.pointerId);
  const dx = point.x - dragState.lastX;
  const dy = point.y - dragState.lastY;

  dragState.rawOffsetX = clamp(dragState.rawOffsetX + dx / Math.max(1, dragState.frame.w), -0.9, 0.9);
  dragState.rawOffsetY = clamp(dragState.rawOffsetY + dy / Math.max(1, dragState.frame.h), -0.9, 0.9);
  photo.offsetX = dragState.rawOffsetX;
  photo.offsetY = dragState.rawOffsetY;
  const offsets = applyPhotoBoundsAndSnap(photo, dragState.frame, dragState.rawOffsetX, dragState.rawOffsetY, true);
  dragState.rawOffsetX = offsets.rawOffsetX;
  dragState.rawOffsetY = offsets.rawOffsetY;

  dragState.lastX = point.x;
  dragState.lastY = point.y;
  scheduleCanvasRender();
}

function endCanvasDrag(event) {
  activePointers.delete(event.pointerId);
  try {
    els.canvas.releasePointerCapture(event.pointerId);
  } catch {
    // Pointer capture can already be released by the browser.
  }

  if (activePointers.size >= 2) {
    beginPinchGesture();
    scheduleCanvasRender();
    return;
  }

  pinchState = null;
  if (activePointers.size === 1) {
    const photo = selectedPhoto();
    const frame = selectedFrame();
    const [pointerId, point] = activePointers.entries().next().value;
    if (photo && frame) {
      const offsets = applyPhotoBoundsAndSnap(photo, frame, photo.offsetX, photo.offsetY, true);
      dragState = {
        id: photo.id,
        pointerId,
        lastX: point.x,
        lastY: point.y,
        frame,
        rawOffsetX: offsets.rawOffsetX,
        rawOffsetY: offsets.rawOffsetY,
      };
      scheduleCanvasRender();
      return;
    }
  }

  dragState = null;
  resetAlignmentGuide();
  scheduleCanvasRender();
}

function handleWheel(event) {
  const photo = selectedPhoto();
  if (!photo) return;
  event.preventDefault();
  const nextZoom = photo.zoom + (event.deltaY > 0 ? -0.04 : 0.04);
  photo.zoom = clamp(nextZoom, 1, 2.6);
  constrainSelectedPhotoToFrame();
  syncZoomControls();
  scheduleCanvasRender();
}

function handleCanvasKeydown(event) {
  if (!state.photos.length) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const currentIndex = selectedPhotoIndex();
    selectPhotoAtIndex(currentIndex < 0 ? 0 : currentIndex + (event.shiftKey ? -1 : 1));
    return;
  }

  if (["PageUp", "[", "PageDown", "]", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const currentIndex = selectedPhotoIndex();
    if (event.key === "Home") selectPhotoAtIndex(0);
    else if (event.key === "End") selectPhotoAtIndex(state.photos.length - 1);
    else selectPhotoAtIndex(currentIndex < 0 ? 0 : currentIndex + (["PageUp", "["].includes(event.key) ? -1 : 1));
    return;
  }

  if (event.key === "Escape") {
    if (state.selectedId) {
      event.preventDefault();
      clearPhotoSelection();
    }
    return;
  }

  const editKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_", "0"];
  if (!editKeys.includes(event.key)) return;
  event.preventDefault();
  if (!selectedPhoto()) selectPhotoAtIndex(0);

  const photo = selectedPhoto();
  const frame = selectedFrame();
  if (!photo || !frame) return;

  if (event.key.startsWith("Arrow")) {
    const step = event.shiftKey ? 0.05 : 0.02;
    if (event.key === "ArrowLeft") photo.offsetX -= step;
    if (event.key === "ArrowRight") photo.offsetX += step;
    if (event.key === "ArrowUp") photo.offsetY -= step;
    if (event.key === "ArrowDown") photo.offsetY += step;
    constrainPhotoToFrame(photo, frame);
  } else if (["+", "="].includes(event.key)) {
    photo.zoom = clamp(photo.zoom + 0.04, 1, 2.6);
    constrainPhotoToFrame(photo, frame);
  } else if (["-", "_"].includes(event.key)) {
    photo.zoom = clamp(photo.zoom - 0.04, 1, 2.6);
    constrainPhotoToFrame(photo, frame);
  } else {
    resetSelected();
  }

  syncZoomControls();
  announceSelectedPhoto();
  scheduleCanvasRender();
}

function createExportCanvas() {
  const { width, height } = getExportSize();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext("2d");
  drawCollage(ctx, width, height, { exporting: true });
  return exportCanvas;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Export failed."));
        }
      },
      mime,
      quality,
    );
  });
}

function exportFileName(ext) {
  return `Photot拼多多-${Date.now()}.${ext}`;
}

function downloadBlob(blob, ext) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = exportFileName(ext);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareOrDownloadBlob(blob) {
  if (typeof File !== "function" || typeof navigator.share !== "function") {
    downloadBlob(blob, "png");
    return;
  }

  const file = new File([blob], exportFileName("png"), { type: "image/png" });
  const shareData = {
    files: [file],
    title: "Photot拼多多",
  };

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  downloadBlob(blob, "png");
}

async function exportCollage(format) {
  if (!state.photos.length || state.isResetting || state.isImporting || state.isExporting) return;
  state.isExporting = true;
  updateControls();

  try {
    const exportCanvas = createExportCanvas();
    if (format === "share") {
      const blob = await canvasToBlob(exportCanvas, "image/png");
      await shareOrDownloadBlob(blob);
      return;
    }

    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const ext = format === "jpg" ? "jpg" : "png";
    const blob = await canvasToBlob(exportCanvas, mime, format === "jpg" ? 0.94 : undefined);
    downloadBlob(blob, ext);
  } catch {
    window.alert("輸出失敗，請再試一次。");
  } finally {
    state.isExporting = false;
    updateControls();
  }
}

function toggleExportMenu() {
  if (!state.photos.length || state.isResetting || state.isImporting || state.isExporting) return;
  setExportMenuOpen(!els.exportMenu.classList.contains("is-open"));
}

function closeExportMenu() {
  setExportMenuOpen(false);
}

function setExportMenuOpen(isOpen) {
  els.exportMenu.hidden = !isOpen;
  els.exportMenu.classList.toggle("is-open", isOpen);
  els.exportMenu.setAttribute("aria-hidden", String(!isOpen));
  els.exportToggle.setAttribute("aria-expanded", String(isOpen));
}

function bindEvents() {
  els.input.addEventListener("change", (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  });

  els.replaceInput.addEventListener("change", (event) => {
    replaceSelectedPhoto(event.target.files);
    event.target.value = "";
  });

  els.addPhotoButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.isResetting || state.isImporting || state.isExporting) return;
    els.input.click();
  });

  els.replacePhotoButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (selectedPhotoIndex() < 0 || state.isResetting || state.isImporting || state.isExporting) return;
    els.replaceInput.click();
  });

  document.querySelectorAll("[data-platform]").forEach((button) => {
    button.addEventListener("click", () => setPlatform(button.dataset.platform));
  });

  document.querySelectorAll("[data-ratio]").forEach((button) => {
    button.addEventListener("click", () => {
      closeExportMenu();
      setRatio(button.dataset.ratio);
    });
  });

  document.querySelectorAll("[data-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      state.layout = button.dataset.layout;
      beginFrameTransition(FRAME_TRANSITION_MS);
      animatePreviewTransition();
      scheduleRender({ resize: false });
    });
  });

  document.querySelectorAll("[data-tile-orientation]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tileOrientation = button.dataset.tileOrientation;
      state.layout = "auto";
      beginFrameTransition(FRAME_TRANSITION_MS);
      animatePreviewTransition();
      scheduleRender({ resize: false });
    });
  });

  document.querySelectorAll(".swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.background = button.dataset.color;
      scheduleRender({ resize: false });
    });
  });

  [els.customWidth, els.customHeight].forEach((input) => {
    input.addEventListener("focus", beginCustomSizeEdit);
    input.addEventListener("input", () => handleCustomSizeInput(input));
    input.addEventListener("blur", () => commitCustomSizeInput(input));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      input.blur();
    });
  });

  els.customSizeLock.addEventListener("click", () => {
    if (isCustomSizeInput(document.activeElement)) commitCustomSizeInput(document.activeElement);

    state.customSizeLocked = !state.customSizeLocked;
    if (state.customSizeLocked) {
      state.customHeight = state.customWidth;
    }

    clearCustomSizeWarning();
    syncCustomSizeControls(true);
    scheduleRender();
  });

  els.gapRange.addEventListener("input", () => {
    state.gap = Number(els.gapRange.value);
    els.gapValue.value = state.gap;
    beginFrameTransition(GAP_TRANSITION_MS);
    scheduleCanvasRender();
  });

  els.radiusRange.addEventListener("input", () => {
    state.radius = Number(els.radiusRange.value);
    els.radiusValue.value = state.radius;
    scheduleCanvasRender();
  });

  els.zoomRange.addEventListener("input", () => setSelectedNumber("zoom", Number(els.zoomRange.value)));

  els.clearButton.addEventListener("click", clearPhotos);

  els.exportToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleExportMenu();
  });

  els.exportOptions.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      exportCollage(button.dataset.exportFormat);
      closeExportMenu();
    });
  });

  els.canvas.addEventListener("pointerdown", startCanvasDrag);
  els.canvas.addEventListener("pointermove", moveCanvasDrag);
  els.canvas.addEventListener("pointerup", endCanvasDrag);
  els.canvas.addEventListener("pointercancel", endCanvasDrag);
  els.canvas.addEventListener("wheel", handleWheel, { passive: false });
  els.canvas.addEventListener("dblclick", resetSelected);
  els.canvas.addEventListener("keydown", handleCanvasKeydown);
  els.canvasFrame.addEventListener("pointerdown", clearSelectionFromFrameBlank);
  els.stageArea.addEventListener("pointerdown", clearSelectionFromStageBlank);

  window.addEventListener("resize", () => scheduleRender());
  window.addEventListener("orientationchange", () => {
    resetMobileViewportLock();
    scheduleRender();
  });
  window.addEventListener("scroll", closeExportMenu, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExportMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".export-control")) closeExportMenu();
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.target.closest(".export-control")) closeExportMenu();
    },
    true,
  );

  document.addEventListener("dragover", (event) => event.preventDefault());
  document.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  });
}

async function init() {
  if (els.appVersion) els.appVersion.textContent = `v${APP_VERSION}`;
  bindEvents();
  closeExportMenu();
  await loadDemoPhotos();

  if (new URLSearchParams(window.location.search).has("self-test")) {
    const fitted = fitImageSize(6000, 3000);
    if (fitted.width !== 2560 || fitted.height !== 1280) throw new Error("Image resize self-check failed.");
    if (maxPhotoSideForCount(MAX_PHOTOS) ** 2 * MAX_PHOTOS > MAX_TOTAL_PHOTO_PIXELS) {
      throw new Error("Photo memory budget self-check failed.");
    }
    const testPhoto = { source: "user", src: "", img: document.createElement("canvas") };
    testPhoto.img.width = 200;
    testPhoto.img.height = 100;
    resizePhotoImage(testPhoto, 100);
    if (testPhoto.img.width !== 100 || testPhoto.img.height !== 50) {
      throw new Error("Photo resize self-check failed.");
    }
    releasePhotoImage(testPhoto);
    if (Object.values(EXPORT_PRESETS).some(([width, height]) => width > CUSTOM_SIZE_MAX || height > CUSTOM_SIZE_MAX)) {
      throw new Error("Export size self-check failed.");
    }
    const testFrames = makeMosaicFrames(MAX_PHOTOS, 1080, 1080, 18);
    if (
      testFrames.length !== MAX_PHOTOS ||
      testFrames.some((frame) =>
        [frame.x, frame.y, frame.w, frame.h].some((value) => !Number.isFinite(value) || value < 0),
      )
    ) {
      throw new Error("Layout self-check failed.");
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (window.innerWidth > 760 && state.ratio === DEFAULT_RATIO) {
      const parentWidth = els.canvasFrame.parentElement.clientWidth;
      const frameStyle = getComputedStyle(els.canvasFrame);
      const padX = parseFloat(frameStyle.paddingLeft) + parseFloat(frameStyle.paddingRight);
      const padY = parseFloat(frameStyle.paddingTop) + parseFloat(frameStyle.paddingBottom);
      const expectedWidth = Math.min(
        880,
        Math.max(180, parentWidth - padX),
        Math.max(180, window.innerHeight * 0.76 - padY),
      );
      if (Math.abs(preview.width - expectedWidth) > 2) {
        throw new Error("Desktop preview size self-check failed.");
      }
    }
    console.info("Photot拼多多 self-check passed.");
  }
}

init();
