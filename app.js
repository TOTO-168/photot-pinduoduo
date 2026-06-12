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
      { id: "common-a3", label: "A3", size: "3508 x 4961", width: 3508, height: 4961 },
    ],
  },
  {
    id: "instagram",
    variants: [
      { id: "instagram-portrait", label: "貼文直式", size: "1080 x 1350", width: 1080, height: 1350 },
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
      { id: "threads-portrait", label: "貼文直式", size: "1080 x 1350", width: 1080, height: 1350 },
      { id: "threads-square", label: "正方形", size: "1080 x 1080", width: 1080, height: 1080 },
      { id: "threads-landscape", label: "橫式", size: "1200 x 628", width: 1200, height: 628 },
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
const EXPORT_PRESETS = Object.fromEntries(
  SOCIAL_PLATFORMS.flatMap((platform) =>
    platform.variants.map((variant) => [variant.id, [variant.width, variant.height]]),
  ),
);

const state = {
  platform: DEFAULT_PLATFORM,
  ratio: DEFAULT_RATIO,
  customWidth: 1600,
  customHeight: 1600,
  layout: "auto",
  gap: 18,
  radius: 24,
  border: 0,
  background: "#f5f5f7",
  photos: [],
  selectedId: null,
};

const els = {
  body: document.body,
  topbar: document.querySelector(".topbar"),
  input: document.querySelector("#photoInput"),
  canvas: document.querySelector("#collageCanvas"),
  canvasFrame: document.querySelector("#canvasFrame"),
  stageArea: document.querySelector(".stage-area"),
  clearDemo: document.querySelector("#clearDemo"),
  ratioSubmenu: document.querySelector("#ratioSubmenu"),
  customSize: document.querySelector("#customSize"),
  customWidth: document.querySelector("#customWidth"),
  customHeight: document.querySelector("#customHeight"),
  gapRange: document.querySelector("#gapRange"),
  gapValue: document.querySelector("#gapValue"),
  radiusRange: document.querySelector("#radiusRange"),
  radiusValue: document.querySelector("#radiusValue"),
  borderRange: document.querySelector("#borderRange"),
  borderValue: document.querySelector("#borderValue"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomValue: document.querySelector("#zoomValue"),
  moveBack: document.querySelector("#moveBack"),
  moveNext: document.querySelector("#moveNext"),
  removePhoto: document.querySelector("#removePhoto"),
  shuffleLayout: document.querySelector("#shuffleLayout"),
  exportToggle: document.querySelector("#exportToggle"),
  exportMenu: document.querySelector("#exportMenu"),
  exportOptions: document.querySelectorAll("[data-export-format]"),
};

let preview = { width: 0, height: 0, dpr: 1 };
let rafId = 0;
let dragState = null;
let ratioSubmenuKey = "";
let stableMobileViewport = { width: 0, height: 0 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function uid() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function selectedPhoto() {
  return state.photos.find((photo) => photo.id === state.selectedId) || state.photos[0] || null;
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

function getExportSize() {
  if (state.ratio === "custom") {
    return {
      width: clamp(Number(state.customWidth) || 1600, 320, 4096),
      height: clamp(Number(state.customHeight) || 1600, 320, 4096),
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

function createImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function photoDefaults(img, index, source, name, src) {
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

function drawSampleScene(ctx, index, width, height) {
  const palettes = [
    ["#91c8ff", "#e9f6ff", "#ffb703", "#1565c0"],
    ["#ffd6e7", "#fff1f6", "#ff2d55", "#6d28d9"],
    ["#c6f6d5", "#eefdf3", "#34c759", "#166534"],
    ["#ffe7c2", "#fff7ed", "#ff9f0a", "#7c2d12"],
    ["#b8f3ff", "#f0fdff", "#00c7be", "#155e75"],
    ["#d7d2ff", "#f5f3ff", "#5856d6", "#312e81"],
  ];
  const [a, b, c, d] = palettes[index % palettes.length];
  const sky = ctx.createLinearGradient(0, 0, width, height);
  sky.addColorStop(0, a);
  sky.addColorStop(1, b);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(width * (0.2 + (index % 3) * 0.22), height * 0.22, width * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (index % 3 === 0) {
    ctx.fillStyle = d;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width * 0.28, height * 0.42);
    ctx.lineTo(width * 0.52, height * 0.82);
    ctx.lineTo(width * 0.76, height * 0.48);
    ctx.lineTo(width, height * 0.82);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  } else if (index % 3 === 1) {
    ctx.fillStyle = "rgba(255,255,255,0.74)";
    roundedRect(ctx, width * 0.16, height * 0.2, width * 0.68, height * 0.52, 54);
    ctx.fill();
    ctx.fillStyle = d;
    roundedRect(ctx, width * 0.27, height * 0.31, width * 0.46, height * 0.1, 36);
    ctx.fill();
    roundedRect(ctx, width * 0.22, height * 0.48, width * 0.56, height * 0.08, 30);
    ctx.fill();
    ctx.fillStyle = c;
    roundedRect(ctx, width * 0.34, height * 0.62, width * 0.32, height * 0.08, 30);
    ctx.fill();
  } else {
    ctx.fillStyle = d;
    for (let i = 0; i < 7; i += 1) {
      const x = width * (0.06 + i * 0.14);
      const h = height * (0.22 + ((i + index) % 4) * 0.08);
      roundedRect(ctx, x, height - h, width * 0.09, h, 22);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    for (let i = 0; i < 12; i += 1) {
      ctx.fillRect(width * (0.1 + (i % 6) * 0.14), height * (0.58 + Math.floor(i / 6) * 0.12), 18, 18);
    }
  }

  const gloss = ctx.createLinearGradient(0, 0, width, 0);
  gloss.addColorStop(0, "rgba(255,255,255,0.25)");
  gloss.addColorStop(0.52, "rgba(255,255,255,0)");
  gloss.addColorStop(1, "rgba(255,255,255,0.2)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, width, height);
}

async function createDemoPhotos() {
  const photos = [];
  for (let index = 0; index < 6; index += 1) {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 900;
    sampleCanvas.height = index % 2 ? 1120 : 900;
    const ctx = sampleCanvas.getContext("2d");
    drawSampleScene(ctx, index, sampleCanvas.width, sampleCanvas.height);
    const src = sampleCanvas.toDataURL("image/jpeg", 0.92);
    const img = await createImage(src);
    photos.push(photoDefaults(img, index, "demo", `範例 ${index + 1}`, src));
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
  const outer = gap;
  const innerW = width - outer * 2;
  const innerH = height - outer * 2;
  const cellW = (innerW - gap * (cols - 1)) / cols;
  const cellH = (innerH - gap * (rows - 1)) / rows;
  return {
    x: outer + col * (cellW + gap),
    y: outer + row * (cellH + gap),
    w: cellW * colSpan + gap * (colSpan - 1),
    h: cellH * rowSpan + gap * (rowSpan - 1),
  };
}

function makeAutoFrames(count, width, height, gap) {
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

function coverImageMetrics(photo, frame) {
  const base = Math.max(frame.w / photo.img.width, frame.h / photo.img.height);
  const scale = base * photo.zoom;
  const drawW = photo.img.width * scale;
  const drawH = photo.img.height * scale;
  const x = frame.x + frame.w / 2 - drawW / 2 + photo.offsetX * frame.w;
  const y = frame.y + frame.h / 2 - drawH / 2 + photo.offsetY * frame.h;
  return { x, y, drawW, drawH };
}

function strokeFrame(ctx, frame, radius, border, selected, exporting) {
  if (border > 0) {
    ctx.save();
    roundedRect(ctx, frame.x + border / 2, frame.y + border / 2, frame.w - border, frame.h - border, radius);
    ctx.lineWidth = border;
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.stroke();
    ctx.restore();
  }

  if (selected && !exporting) {
    ctx.save();
    roundedRect(ctx, frame.x - 4, frame.y - 4, frame.w + 8, frame.h + 8, radius + 5);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#007aff";
    ctx.stroke();
    ctx.restore();
  }
}

function drawPhotoFrame(ctx, photo, frame, canvasWidth, canvasHeight, exporting = false) {
  const radius = Math.min(scaledSetting(state.radius, canvasWidth, canvasHeight), frame.w / 2, frame.h / 2);
  const border = scaledSetting(state.border, canvasWidth, canvasHeight);
  ctx.save();
  roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, radius);
  ctx.clip();
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
  const metrics = coverImageMetrics(photo, frame);
  ctx.drawImage(photo.img, metrics.x, metrics.y, metrics.drawW, metrics.drawH);
  ctx.restore();

  strokeFrame(ctx, frame, radius, border, photo.id === state.selectedId, exporting);
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

function drawCollage(ctx, width, height, options = {}) {
  const exporting = Boolean(options.exporting);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = state.background;
  ctx.fillRect(0, 0, width, height);

  if (!state.photos.length) {
    drawEmptyState(ctx, width, height);
    return;
  }

  const frames = getFrames(state.photos.length, width, height);
  state.photos.forEach((photo, index) => {
    drawPhotoFrame(ctx, photo, frames[index], width, height, exporting);
  });
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
  const frameWidthSource = isMobile ? els.canvasFrame.parentElement.clientWidth : els.canvasFrame.clientWidth;
  const availableW = Math.max(180, frameWidthSource - padX);
  const availableH = Math.max(180, viewportHeight * (isMobile ? mobilePreviewRatio : 0.76) - padY);
  let width = Math.min(availableW, 880);
  let height = width / aspect;

  if (height > availableH) {
    height = availableH;
    width = height * aspect;
  }

  preview.width = Math.round(width);
  preview.height = Math.round(height);
  preview.dpr = Math.min(window.devicePixelRatio || 1, 2.5);

  els.canvas.style.width = `${preview.width}px`;
  els.canvas.style.height = `${preview.height}px`;
  els.canvas.width = Math.round(preview.width * preview.dpr);
  els.canvas.height = Math.round(preview.height * preview.dpr);

  const ctx = els.canvas.getContext("2d");
  ctx.setTransform(preview.dpr, 0, 0, preview.dpr, 0, 0);
  drawCollage(ctx, preview.width, preview.height);
  syncMobileStageLock();
}

function syncMobileStageLock() {
  document.documentElement.style.removeProperty("--mobile-stage-top");
  document.documentElement.style.removeProperty("--mobile-fixed-stack-height");
  document.documentElement.style.removeProperty("--mobile-fixed-stack-space");
}

function scheduleRender() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    resizeCanvas();
    updateControls();
  });
}

function updateButtons(selector, activeValue, dataKey) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button.dataset[dataKey] === activeValue);
  });
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
    button.classList.toggle("is-active", variant.id === state.ratio);

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
    button.classList.toggle("is-active", state.ratio !== "custom" && button.dataset.platform === state.platform);
  });
  updateButtons("[data-ratio]", state.ratio, "ratio");
}

function hasOnlyDemoPhotos() {
  return state.photos.length > 0 && state.photos.every((photo) => photo.source === "demo");
}

function updateControls() {
  els.clearDemo.textContent = hasOnlyDemoPhotos() ? "清空範例" : "清空照片";
  els.clearDemo.disabled = state.photos.length === 0;
  els.customSize.classList.toggle("is-open", state.ratio === "custom");
  els.exportToggle.disabled = state.photos.length === 0;
  if (state.photos.length === 0) closeExportMenu();

  renderRatioSubmenu();
  syncRatioButtons();
  updateButtons("[data-layout]", state.layout, "layout");
  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.color === state.background);
  });

  els.gapRange.value = state.gap;
  els.gapValue.value = state.gap;
  els.radiusRange.value = state.radius;
  els.radiusValue.value = state.radius;
  els.borderRange.value = state.border;
  els.borderValue.value = state.border;
  els.customWidth.value = state.customWidth;
  els.customHeight.value = state.customHeight;

  const photo = selectedPhoto();
  const hasPhoto = Boolean(photo);
  [els.zoomRange, els.moveBack, els.moveNext, els.removePhoto].forEach((control) => {
    control.disabled = !hasPhoto;
  });

  if (photo) {
    els.zoomRange.value = Math.round(photo.zoom * 100);
    els.zoomValue.value = Math.round(photo.zoom * 100);
  }
}

async function addFiles(fileList) {
  const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  if (hasOnlyDemoPhotos()) {
    state.photos = [];
    state.selectedId = null;
  }

  const availableSlots = MAX_PHOTOS - state.photos.length;
  const accepted = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    window.alert(`最多一次保留 ${MAX_PHOTOS} 張照片。`);
  }

  for (const file of accepted) {
    const src = URL.createObjectURL(file);
    try {
      const img = await createImage(src);
      const photo = photoDefaults(img, state.photos.length, "user", file.name || `照片 ${state.photos.length + 1}`, src);
      state.photos.push(photo);
      state.selectedId = photo.id;
    } catch {
      URL.revokeObjectURL(src);
    }
  }

  scheduleRender();
}

function setPlatform(platformId) {
  const platform = platformById(platformId);
  state.platform = platform.id;
  if (!platform.variants.some((variant) => variant.id === state.ratio)) {
    state.ratio = platform.variants[0].id;
  }
  closeExportMenu();
  scheduleRender();
}

function setRatio(ratio) {
  state.ratio = ratio;
  const platform = platformForRatio(ratio);
  if (platform) state.platform = platform.id;
  closeExportMenu();
  scheduleRender();
}

function setSelectedNumber(key, value) {
  const photo = selectedPhoto();
  if (!photo) return;
  if (key === "zoom") photo.zoom = clamp(value, 1, 2.6);
  scheduleRender();
}

function moveSelected(step) {
  const index = state.photos.findIndex((photo) => photo.id === state.selectedId);
  if (index < 0) return;
  const nextIndex = clamp(index + step, 0, state.photos.length - 1);
  if (nextIndex === index) return;
  const [photo] = state.photos.splice(index, 1);
  state.photos.splice(nextIndex, 0, photo);
  scheduleRender();
}

function removeSelected() {
  const index = state.photos.findIndex((photo) => photo.id === state.selectedId);
  if (index < 0) return;
  const [removed] = state.photos.splice(index, 1);
  if (removed.source === "user") URL.revokeObjectURL(removed.src);
  state.selectedId = state.photos[Math.min(index, state.photos.length - 1)]?.id || null;
  scheduleRender();
}

function resetSelected() {
  const photo = selectedPhoto();
  if (!photo) return;
  photo.zoom = 1;
  photo.offsetX = 0;
  photo.offsetY = 0;
  scheduleRender();
}

function shufflePhotos() {
  for (let index = state.photos.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [state.photos[index], state.photos[swap]] = [state.photos[swap], state.photos[index]];
  }
  scheduleRender();
}

function canvasPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * preview.width,
    y: ((event.clientY - rect.top) / rect.height) * preview.height,
  };
}

function hitGrid(point) {
  const frames = getFrames(state.photos.length, preview.width, preview.height);
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index];
    if (point.x >= frame.x && point.x <= frame.x + frame.w && point.y >= frame.y && point.y <= frame.y + frame.h) {
      return { photo: state.photos[index], frame };
    }
  }
  return null;
}

function startCanvasDrag(event) {
  if (!state.photos.length) return;
  const point = canvasPoint(event);
  const hit = hitGrid(point);
  if (!hit) return;

  state.selectedId = hit.photo.id;
  dragState = {
    id: hit.photo.id,
    type: "grid-pan",
    lastX: point.x,
    lastY: point.y,
    frame: hit.frame,
  };
  els.canvas.setPointerCapture(event.pointerId);
  scheduleRender();
}

function moveCanvasDrag(event) {
  if (!dragState) return;
  const photo = selectedPhoto();
  if (!photo || photo.id !== dragState.id) return;

  const point = canvasPoint(event);
  const dx = point.x - dragState.lastX;
  const dy = point.y - dragState.lastY;

  photo.offsetX = clamp(photo.offsetX + dx / Math.max(1, dragState.frame.w), -0.9, 0.9);
  photo.offsetY = clamp(photo.offsetY + dy / Math.max(1, dragState.frame.h), -0.9, 0.9);

  dragState.lastX = point.x;
  dragState.lastY = point.y;
  scheduleRender();
}

function endCanvasDrag(event) {
  if (!dragState) return;
  try {
    els.canvas.releasePointerCapture(event.pointerId);
  } catch {
    // Pointer capture can already be released by the browser.
  }
  dragState = null;
}

function handleWheel(event) {
  const photo = selectedPhoto();
  if (!photo) return;
  event.preventDefault();
  const nextZoom = photo.zoom + (event.deltaY > 0 ? -0.04 : 0.04);
  photo.zoom = clamp(nextZoom, 1, 2.6);
  scheduleRender();
}

function exportCollage(format) {
  if (!state.photos.length) return;
  const { width, height } = getExportSize();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext("2d");
  drawCollage(ctx, width, height, { exporting: true });

  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const ext = format === "jpg" ? "jpg" : "png";
  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Photot拼多多-${Date.now()}.${ext}`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    mime,
    format === "jpg" ? 0.94 : undefined,
  );
}

function toggleExportMenu() {
  if (!state.photos.length) return;
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
      scheduleRender();
    });
  });

  document.querySelectorAll(".swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.background = button.dataset.color;
      scheduleRender();
    });
  });

  els.customWidth.addEventListener("input", () => {
    state.customWidth = clamp(Number(els.customWidth.value) || 1600, 320, 4096);
    scheduleRender();
  });

  els.customHeight.addEventListener("input", () => {
    state.customHeight = clamp(Number(els.customHeight.value) || 1600, 320, 4096);
    scheduleRender();
  });

  els.gapRange.addEventListener("input", () => {
    state.gap = Number(els.gapRange.value);
    scheduleRender();
  });

  els.radiusRange.addEventListener("input", () => {
    state.radius = Number(els.radiusRange.value);
    scheduleRender();
  });

  els.borderRange.addEventListener("input", () => {
    state.border = Number(els.borderRange.value);
    scheduleRender();
  });

  els.zoomRange.addEventListener("input", () => setSelectedNumber("zoom", Number(els.zoomRange.value) / 100));

  els.moveBack.addEventListener("click", () => moveSelected(-1));
  els.moveNext.addEventListener("click", () => moveSelected(1));
  els.removePhoto.addEventListener("click", removeSelected);
  els.shuffleLayout.addEventListener("click", shufflePhotos);

  els.clearDemo.addEventListener("click", () => {
    state.photos.forEach((photo) => {
      if (photo.source === "user") URL.revokeObjectURL(photo.src);
    });
    state.photos = [];
    state.selectedId = null;
    scheduleRender();
  });

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

  window.addEventListener("resize", scheduleRender);
  window.addEventListener("orientationchange", () => {
    resetMobileViewportLock();
    scheduleRender();
  });
  window.addEventListener("scroll", closeExportMenu, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExportMenu();
    if (event.key === "Delete" || event.key === "Backspace") {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT") return;
      removeSelected();
    }
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
  bindEvents();
  closeExportMenu();
  state.photos = await createDemoPhotos();
  state.selectedId = state.photos[0]?.id || null;
  scheduleRender();
}

init();
