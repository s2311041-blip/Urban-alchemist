const isFiniteVec3 = (pos) => Array.isArray(pos) && pos.length >= 3 && pos.every(Number.isFinite);

const distance2D = (a, b) => Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[2] ?? 0) - (b[2] ?? 0));

export const buildFerryRoutesFromDocks = (placedBlocks = [], islandChunks = [], getChunkKindAtPos) => {
  const docks = (Array.isArray(placedBlocks) ? placedBlocks : []).filter(
    (block) => block?.shape === 'ferry_dock' && typeof block?.id === 'string' && isFiniteVec3(block?.pos),
  );
  if (docks.length === 0) return [];

  const dockWithKind = docks.map((dock) => ({
    dock,
    kind: typeof getChunkKindAtPos === 'function' ? getChunkKindAtPos(dock.pos, islandChunks) : null,
  }));
  const mainDocks = dockWithKind.filter((entry) => entry.kind === 'main').map((entry) => entry.dock);
  const remoteDocks = dockWithKind.filter((entry) => entry.kind === 'remote').map((entry) => entry.dock);

  const usedRemoteIds = new Set();
  const routes = [];

  // main <-> remote を優先して active route を生成
  mainDocks.forEach((mainDock) => {
    const nearestRemote = remoteDocks
      .filter((remoteDock) => !usedRemoteIds.has(remoteDock.id))
      .sort((a, b) => distance2D(mainDock.pos, a.pos) - distance2D(mainDock.pos, b.pos))[0];

    if (!nearestRemote) return;
    usedRemoteIds.add(nearestRemote.id);
    routes.push({
      id: `route_${mainDock.id}_${nearestRemote.id}`,
      status: 'active',
      stopIds: [mainDock.id, nearestRemote.id],
      chunkKinds: ['main', 'remote'],
    });
  });

  // 余った dock は planned route として保存（UI で未接続を扱える）
  const activeStopIds = new Set(routes.flatMap((route) => route.stopIds));
  dockWithKind.forEach(({ dock, kind }) => {
    if (activeStopIds.has(dock.id)) return;
    routes.push({
      id: `planned_${dock.id}`,
      status: 'planned',
      stopIds: [dock.id],
      chunkKinds: kind ? [kind] : [],
    });
  });

  return routes;
};
