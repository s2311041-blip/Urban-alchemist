import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useArPostingStore } from './store/useArPostingStore';
import { initArBackend } from './api/annotationsClient';
import { ArHomeScreen } from './components/ArHomeScreen';
import { ArRecordChooseScreen } from './components/ArRecordChooseScreen';
import { ArViewHubScreen } from './components/ArViewHubScreen';
import { ArPostFlow } from './components/ArPostFlow';
import { ArMapView } from './components/ArMapView';
import { ArHelpSheet } from './components/ArHelpSheet';
import { ArFieldGuide } from './components/ArFieldGuide';
import { ArLiveView } from './components/ArLiveView';

export function ArPostingApp() {
  const [screen, setScreen] = useState('home');
  const [helpOpen, setHelpOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [postEntry, setPostEntry] = useState(null);
  const [bootReady, setBootReady] = useState(false);

  const {
    authorId,
    annotations,
    totalPoints,
    helpSeenOnce,
    markHelpSeen,
    setAuthorId,
    syncAnnotations,
    submitDraft,
    updateDraft,
    removeAnnotation,
    downloadExport,
    getAvailablePoints,
    likeAnnotationById,
  } = useArPostingStore(useShallow((s) => ({
    authorId: s.authorId,
    annotations: s.annotations,
    totalPoints: s.totalPoints,
    helpSeenOnce: s.helpSeenOnce,
    markHelpSeen: s.markHelpSeen,
    setAuthorId: s.setAuthorId,
    syncAnnotations: s.syncAnnotations,
    submitDraft: s.submitDraft,
    updateDraft: s.updateDraft,
    removeAnnotation: s.removeAnnotation,
    downloadExport: s.downloadExport,
    getAvailablePoints: s.getAvailablePoints,
    likeAnnotationById: s.likeAnnotationById,
  })));

  useEffect(() => {
    let cancelled = false;
    const boot = (async () => {
      try {
        const { authorId: cloudAuthorId } = await initArBackend();
        if (!cancelled && cloudAuthorId) setAuthorId(cloudAuthorId);
        await syncAnnotations();
      } catch {
        // 同期失敗はホーム以外では黙って継続
      } finally {
        if (!cancelled) setBootReady(true);
      }
    })();

    const timeout = setTimeout(() => {
      if (!cancelled) setBootReady(true);
    }, 10000);

    boot.finally(() => clearTimeout(timeout));

    const id = setInterval(() => syncAnnotations(), 10000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
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

  const goHome = () => {
    setScreen('home');
    setEditTarget(null);
    setPostEntry(null);
  };

  const goView = () => {
    setScreen('view');
    setEditTarget(null);
    setPostEntry(null);
  };

  const startPost = (entry) => {
    setPostEntry(entry);
    setScreen('post');
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
        background: '#f8fafc',
        color: '#334155',
        fontSize: 15,
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
          onRecord={() => setScreen('record')}
          onView={goView}
          onHelp={() => setHelpOpen(true)}
        />
        {helpOpen && <ArHelpSheet onClose={() => setHelpOpen(false)} />}
      </>
    );
  }

  if (screen === 'record') {
    return (
      <ArRecordChooseScreen
        onChoose={startPost}
        onBack={goHome}
      />
    );
  }

  if (screen === 'view') {
    return (
      <ArViewHubScreen
        pinCount={myCount}
        totalPoints={totalPoints}
        availablePoints={getAvailablePoints()}
        onBrowse={() => setScreen('browse')}
        onMap={() => setScreen('map')}
        onGuide={() => setScreen('guide')}
        onBack={goHome}
      />
    );
  }

  if (screen === 'post' || screen === 'edit') {
    return (
      <ArPostFlow
        annotations={mineMarked}
        authorId={authorId}
        postEntry={screen === 'post' ? postEntry : null}
        editTarget={screen === 'edit' ? editTarget : null}
        onSubmit={submitDraft}
        onUpdate={updateDraft}
        onCancel={screen === 'edit' ? goView : () => setScreen('record')}
        onDone={goHome}
        onViewAfterPost={goView}
      />
    );
  }

  return (
    <>
      {screen === 'browse' && (
        <ArLiveView
          annotations={mineMarked}
          authorId={authorId}
          mode="view"
          onClose={goView}
        />
      )}

      {screen === 'map' && (
        <ArMapView
          annotations={mineMarked}
          authorId={authorId}
          onClose={goView}
          onEditMine={startEdit}
        />
      )}

      {screen === 'guide' && (
        <ArFieldGuide
          annotations={mineMarked}
          authorId={authorId}
          totalPoints={totalPoints}
          availablePoints={getAvailablePoints()}
          onLike={async (id) => {
            try {
              await likeAnnotationById(id);
            } catch (err) {
              console.warn('like failed', err?.message ?? err);
            }
          }}
          onExport={downloadExport}
          onDelete={removeAnnotation}
          onEdit={startEdit}
          onClose={goView}
        />
      )}

      {helpOpen && <ArHelpSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
