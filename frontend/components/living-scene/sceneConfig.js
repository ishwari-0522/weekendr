/**
 * Reusable configuration schema for the Living Scene Engine.
 * Allows addition of future templates without engine modifications.
 */
export const LIGHTING_PRESETS = {
  Morning: {
    brightness: 'brightness-105',
    shadowOpacity: 0.25,
    warmth: 'sepia-[10%]',
    ambientTint: 'bg-blue-500/5',
    skyColor: 'from-blue-900/40 to-slate-900'
  },
  Afternoon: {
    brightness: 'brightness-100',
    shadowOpacity: 0.35,
    warmth: 'sepia-0',
    ambientTint: 'bg-transparent',
    skyColor: 'from-sky-950 to-slate-950'
  },
  'Golden Hour': {
    brightness: 'brightness-95',
    shadowOpacity: 0.4,
    warmth: 'sepia-[30%] saturate-120',
    ambientTint: 'bg-amber-500/10',
    skyColor: 'from-amber-950/40 to-slate-950'
  },
  Evening: {
    brightness: 'brightness-90',
    shadowOpacity: 0.45,
    warmth: 'sepia-[15%]',
    ambientTint: 'bg-purple-950/10',
    skyColor: 'from-purple-950/30 to-slate-950'
  },
  Night: {
    brightness: 'brightness-75',
    shadowOpacity: 0.6,
    warmth: 'sepia-0 hue-rotate-15',
    ambientTint: 'bg-indigo-950/25',
    skyColor: 'from-indigo-950/40 to-[#080b11]'
  },
  Rain: {
    brightness: 'brightness-80',
    shadowOpacity: 0.2,
    warmth: 'sepia-0 grayscale-[20%]',
    ambientTint: 'bg-slate-950/30',
    skyColor: 'from-slate-900/60 to-[#080b11]'
  },
  Cloudy: {
    brightness: 'brightness-90',
    shadowOpacity: 0.2,
    warmth: 'sepia-[5%] grayscale-[10%]',
    ambientTint: 'bg-slate-800/10',
    skyColor: 'from-slate-800/20 to-slate-950'
  }
};

export const DEFAULT_SCENE_CONFIG = {
  sceneName: 'Default Ecosystem',
  groundType: 'flat-slab',
  lighting: 'Afternoon',
  camera: {
    floatAmplitude: 4, // max 4px
    rotationAmplitude: 0.4 // max 0.4deg
  },
  buildings: [
    { id: 'b1', name: 'Building Alpha', x: 25, y: 35, width: 20, height: 30, color: 'bg-slate-700/80 border-slate-600' },
    { id: 'b2', name: 'Building Beta', x: 60, y: 40, width: 15, height: 25, color: 'bg-slate-800/80 border-slate-700' }
  ],
  nature: [
    { id: 'n1', type: 'tree', x: 15, y: 65, size: 14, color: 'bg-emerald-800/90' },
    { id: 'n2', type: 'bush', x: 45, y: 70, size: 8, color: 'bg-green-900/90' },
    { id: 'n3', type: 'pond', x: 50, y: 20, width: 25, height: 12, color: 'bg-blue-950/40 border-blue-900/30' }
  ],
  characters: [
    { id: 'c1', x: 35, y: 60, scale: 1, direction: 'right', state: 'idle' },
    { id: 'c2', x: 50, y: 65, scale: 0.95, direction: 'left', state: 'observing' }
  ],
  ambientEffects: {
    steam: true,
    leaves: true,
    birds: true,
    waterRipples: true,
    lightParticles: false
  },
  interactionZones: [
    { id: 'z1', label: 'Primary Plaza', x: 40, y: 55, radius: 15 }
  ]
};

export const SCENE_CONFIGS = {
  "Coffee & Conversations": {
    sceneName: "Coffee & Conversations",
    groundType: "flat-clay",
    lighting: "Golden Hour",
    camera: {
      floatAmplitude: 4,
      rotationAmplitude: 0.4
    },
    paths: [
      { id: "path-cafe-bookstore", fromX: 24, fromY: 65, toX: 43, toY: 67 },
      { id: "path-cafe-fountain", fromX: 52, fromY: 67, toX: 74, toY: 60 }
    ],
    buildings: [
      { id: "cafe", name: "Café", x: 42, y: 32, width: 24, height: 34, color: "bg-orange-950/20 border-orange-900/35 text-orange-200" },
      { id: "bookstore", name: "Books", x: 14, y: 40, width: 20, height: 28, color: "bg-amber-950/20 border-amber-900/35 text-amber-200" }
    ],
    nature: [
      { id: "fountain", type: "pond", x: 74, y: 45, width: 18, height: 12, color: "bg-cyan-900/30 border-cyan-800/20 text-cyan-300" },
      { id: "t1", type: "tree", x: 10, y: 24, size: 16, color: "bg-emerald-800/80" },
      { id: "t2", type: "tree", x: 48, y: 22, size: 14, color: "bg-emerald-900/90" },
      { id: "t3", type: "tree", x: 80, y: 28, size: 18, color: "bg-emerald-800/80" },
      { id: "bush1", type: "bush", x: 34, y: 68, size: 8, color: "bg-emerald-900/60" },
      { id: "bench1", type: "bench", x: 44, y: 70, width: 8, height: 4 },
      { id: "bench2", type: "bench", x: 64, y: 64, width: 8, height: 4 },
      { id: "bench3", type: "bench", x: 22, y: 68, width: 8, height: 4 },
      { id: "lamp1", type: "lamp", x: 38, y: 52 },
      { id: "lamp2", type: "lamp", x: 70, y: 54 },
      { id: "bike", type: "bicycle", x: 36, y: 65 },
      { id: "chalkboard", type: "chalkboard", x: 48, y: 63 }
    ],
    characters: [
      { id: "char-reading", x: 24, y: 67, scale: 0.95, direction: "right", state: "idle" }, // reading on bookstore bench
      { id: "char-chatting1", x: 42, y: 69, scale: 1.0, direction: "right", state: "idle" }, // chatting at cafe bench
      { id: "char-chatting2", x: 48, y: 69, scale: 0.95, direction: "left", state: "idle" },
      { id: "char-walking", x: 62, y: 63, scale: 0.9, direction: "left", state: "walking" } // walking near fountain
    ],
    ambientEffects: {
      steam: true,
      leaves: true,
      birds: true,
      waterRipples: true,
      lightParticles: false
    },
    interactionZones: [
      { id: "chalkboard-cta", label: "↓ Step In", x: 10, y: 74, radius: 10 }
    ]
  }
};

export default {
  LIGHTING_PRESETS,
  DEFAULT_SCENE_CONFIG,
  SCENE_CONFIGS
};
