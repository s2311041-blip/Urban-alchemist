export const createStudioSlice = (set, get) => ({
  studioHistory: [],
  studioHistoryIndex: -1,

  initStudioHistory: (scale, offset, material, shape) => {
    set({
      studioHistory: [[JSON.parse(JSON.stringify(scale)), JSON.parse(JSON.stringify(offset)), material, shape]],
      studioHistoryIndex: 0,
    });
  },

  pushStudioHistory: (scale, offset, material, shape) => {
    const { studioHistory, studioHistoryIndex } = get();
    const last = studioHistory[studioHistoryIndex];
    if (last
        && last[0][0] === scale[0] && last[0][1] === scale[1] && last[0][2] === scale[2]
        && last[1][0] === offset[0] && last[1][1] === offset[1] && last[1][2] === offset[2]
        && last[2] === material && last[3] === shape) {
      return;
    }
    const nextHistory = studioHistory.slice(0, studioHistoryIndex + 1);
    set({
      studioHistory: [...nextHistory, [JSON.parse(JSON.stringify(scale)), JSON.parse(JSON.stringify(offset)), material, shape]],
      studioHistoryIndex: nextHistory.length,
    });
  },

  undoStudio: () => {
    const { studioHistory, studioHistoryIndex } = get();
    if (studioHistoryIndex > 0) {
      const nextIdx = studioHistoryIndex - 1;
      const [scale, offset, material, shape] = studioHistory[nextIdx];
      set({
        studioScale: [...scale],
        studioPositionOffset: [...offset],
        studioMaterial: material,
        studioShape: shape,
        studioHistoryIndex: nextIdx,
      });
    }
  },

  redoStudio: () => {
    const { studioHistory, studioHistoryIndex } = get();
    if (studioHistoryIndex < studioHistory.length - 1) {
      const nextIdx = studioHistoryIndex + 1;
      const [scale, offset, material, shape] = studioHistory[nextIdx];
      set({
        studioScale: [...scale],
        studioPositionOffset: [...offset],
        studioMaterial: material,
        studioShape: shape,
        studioHistoryIndex: nextIdx,
      });
    }
  },

  sizeAdjustHistory: [],
  sizeAdjustHistoryIndex: -1,

  initSizeAdjustHistory: (scale, offset) => {
    set({
      sizeAdjustHistory: [[JSON.parse(JSON.stringify(scale)), JSON.parse(JSON.stringify(offset))]],
      sizeAdjustHistoryIndex: 0,
    });
  },

  pushSizeAdjustHistory: (scale, offset) => {
    const { sizeAdjustHistory, sizeAdjustHistoryIndex } = get();
    const last = sizeAdjustHistory[sizeAdjustHistoryIndex];
    if (last
        && last[0][0] === scale[0] && last[0][1] === scale[1] && last[0][2] === scale[2]
        && last[1][0] === offset[0] && last[1][1] === offset[1] && last[1][2] === offset[2]) {
      return;
    }
    const nextHistory = sizeAdjustHistory.slice(0, sizeAdjustHistoryIndex + 1);
    set({
      sizeAdjustHistory: [...nextHistory, [JSON.parse(JSON.stringify(scale)), JSON.parse(JSON.stringify(offset))]],
      sizeAdjustHistoryIndex: nextHistory.length,
    });
  },

  undoSizeAdjust: () => {
    const { sizeAdjustHistory, sizeAdjustHistoryIndex } = get();
    if (sizeAdjustHistoryIndex > 0) {
      const nextIdx = sizeAdjustHistoryIndex - 1;
      const [scale, offset] = sizeAdjustHistory[nextIdx];
      set({
        selectedScale: [...scale],
        previewPositionOffset: [...offset],
        sizeAdjustHistoryIndex: nextIdx,
      });
    }
  },

  redoSizeAdjust: () => {
    const { sizeAdjustHistory, sizeAdjustHistoryIndex } = get();
    if (sizeAdjustHistoryIndex < sizeAdjustHistory.length - 1) {
      const nextIdx = sizeAdjustHistoryIndex + 1;
      const [scale, offset] = sizeAdjustHistory[nextIdx];
      set({
        selectedScale: [...scale],
        previewPositionOffset: [...offset],
        sizeAdjustHistoryIndex: nextIdx,
      });
    }
  },
});
