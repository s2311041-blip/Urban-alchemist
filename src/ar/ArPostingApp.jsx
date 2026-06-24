import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useArPostingStore } from './store/useArPostingStore';
import { initArBackend } from './api/annotationsClient';
import { ArHomeScreen } from './components/ArHomeScreen';
import { ArPostFlow } from './components/ArPostFlow';
import { ArMapView } from './components/ArMapView';
import { ArHelpSheet } from './components/ArHelpSheet';
import { ArFieldGuide } from './components/ArFieldGuide';

export function ArPostingApp() {
  const [screen, setScreen] = useState('home');
  const [helpOpen, setHelpOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [bootReady, setBootReady] = useState(false);

  const {
    authorId,
    annotations,
    totalPoints,
    syncStatus,
    lastSyncAt,
    helpSeenOnce,
    markHelpSeen,
    setAuthorId,
    syncAnnotations,
    submitDraft,
    updateDraft,
    removeAnnotation,
    downloadExport,
  } = useArPostingStore(useShallow((s) => ({
    authorId: s.authorId,
    annotations: s.annotations,
    totalPoints: s.totalPoints,
    syncStatus: s.syncStatus,
    lastSyncAt: s.lastSyncAt,
    helpSeenOnce: s.helpSeenOnce,
    markHelpSeen: s.markHelpSeen,
    setAuthorId: s.setAuthorId,
    syncAnnotations: s.syncAnnotations,
    submitDraft: s.submitDraft,
    updateDraft: s.updateDraft,
    removeAnnotation: s.removeAnnotation,
    downloadExport: s.downloadExport,
  })));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { authorId: cloudAuthorId } = await initArBackend();
        if (!cancelled && cloudAuthorId) setAuthorId(cloudAuthorId);
        await syncAnnotations();
      } finally {
        if (!cancelled) setBootReady(true);
      }
    })();
    const id = setInterval(() => syncAnnotations(), 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setAuthorId, syncAnnotations]);

  useEffect(() => {
    if (!helpSeenOnce) {
      setHelpOpen(true);
      markHelpSeen();
    }
  }, [helpSeenOnce, markHelpSeen]);

  const mineMarked = annotations.map((a) => ({
    ...a,
    isMine: a.authorId === authorId,
  }));

  const myCount = mineMarked.filter((a) => a.isMine).length;
  const recentItems = mineMarked.slice(0, 6);

  const goHome = () => {
    setScreen('home');
    setEditTarget(null);
  };

  const startEdit = (annotation) => {
    setEditTarget(annotation);
    setScreen('edit');
  };

  if (!bootReady && screen === 'home') {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: '#060d18',
        color: '#90a4ae',
      }}
      >
        接続中…
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <>
        <ArHomeScreen
          totalPoints={totalPoints}
          pinCount={myCount}
          allPinCount={mineMarked.length}
          syncStatus={syncStatus}
          lastSyncAt={lastSyncAt}
          onSync={() => syncAnnotations()}
          recentItems={recentItems}
          onNavigate={setScreen}
          onHelp={() => setHelpOpen(true)}
        />
        {helpOpen && <ArHelpSheet onClose={() => setHelpOpen(false)} />}
      </>
    );
  }

  if (screen === 'post' || screen === 'edit') {
    return (
      <ArPostFlow
        annotations={mineMarked}
        authorId={authorId}
        editTarget={screen === 'edit' ? editTarget : null}
        onSubmit={submitDraft}
        onUpdate={updateDraft}
        onCancel={goHome}
        onDone={goHome}
      />
    );
  }

  return (
    <>
      {screen === 'map' && (
        <ArMapView
          annotations={mineMarked}
          authorId={authorId}
          onClose={goHome}
          onEditMine={startEdit}
        />
      )}

      {screen === 'guide' && (
        <ArFieldGuide
          annotations={mineMarked}
          authorId={authorId}
          totalPoints={totalPoints}
          onExport={downloadExport}
          onDelete={removeAnnotation}
          onEdit={startEdit}
          onClose={goHome}
        />
      )}

      {helpOpen && <ArHelpSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
