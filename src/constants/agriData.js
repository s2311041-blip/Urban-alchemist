export const AGRI_SHAPES = ['farm_plot', 'rice_paddy', 'garden_bed'];

export const AGRI_CONNECTABLE_SHAPES = ['farm_plot', 'rice_paddy'];
export const AGRI_COLORABLE_SHAPES = ['farm_plot', 'rice_paddy', 'garden_bed'];

export const isAgriShape = (shape) => AGRI_SHAPES.includes(shape);
export const isConnectableAgriShape = (shape) => AGRI_CONNECTABLE_SHAPES.includes(shape);
export const isColorableAgriShape = (shape) => AGRI_COLORABLE_SHAPES.includes(shape);

export const DEFAULT_AGRI_COLORS = {
  farm_plot: '#8d6e63',
  rice_paddy: '#4fc3f7',
  garden_bed: '#a1887f',
};

export const AGRI_META = {
  farm_plot: {
    label: '畑',
    icon: '🌾',
    defaultMaterial: 'sand',
    defaultScale: [1, 1, 1],
  },
  rice_paddy: {
    label: '田んぼ',
    icon: '🍚',
    defaultMaterial: 'water',
    defaultScale: [1, 1, 1],
  },
  garden_bed: {
    label: '菜園',
    icon: '🥬',
    defaultMaterial: 'grass',
    defaultScale: [1, 1, 1],
  },
};

export const AGRI_COLOR_PRESETS = {
  farm_plot: ['#8d6e63', '#a1887f', '#6d4c41', '#d7ccc8'],
  rice_paddy: ['#4fc3f7', '#81d4fa', '#26a69a', '#b3e5fc'],
  garden_bed: ['#a1887f', '#8d6e63', '#795548', '#bcaaa4'],
};
