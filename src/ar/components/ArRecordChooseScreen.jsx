import React, { useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';
import { fileToJpegDataUrl, libraryPhotoErrorMessage } from '../utils/libraryPhoto';

export function ArRecordChooseScreen({ onChoose, onBack }) {
  const libraryInputRef = useRef(null);
  const [readingLibrary, setReadingLibrary] = useState(false);

  const chooseLibraryPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setReadingLibrary(true);
    try {
      const photo = await fileToJpegDataUrl(file);
      onChoose({ kind: 'free', prompt: null, photoSource: 'library', photo });
    } catch (error) {
      alert(libraryPhotoErrorMessage(error));
    } finally {
      setReadingLibrary(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <header style={styles.header}>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            <ChevronLeft size={20} />
            ホーム
          </button>
          <h1 style={styles.title}>写真の選び方</h1>
          <p style={styles.lead}>その場で写真を撮るか、スマホに入っている写真から選びます</p>
          <div style={styles.howto}>
            <div>① 気になるところを中心に合わせて撮影</div>
            <div>② 簡単な質問に答えて完了</div>
            <div style={styles.howtoNote}>※場所は現在地（GPS）、または地図から指定できます</div>
          </div>
        </header>

        <button
          type="button"
          onClick={() => onChoose({ kind: 'free', prompt: null })}
          style={styles.freeCard}
        >
          <div style={styles.cardHead}>
            <Camera size={18} color={AR_HOME.primary} />
            <span style={{ ...styles.cardEyebrow, color: AR_HOME.primary }}>カメラで撮る</span>
          </div>
          <p style={styles.promptQuestion}>
            気になった場所をその場で撮影します
          </p>
          <div style={styles.ctaRow}>
            <Camera size={18} />
            カメラを開く
            <ChevronRight size={18} />
          </div>
        </button>

        <div style={styles.libraryCard}>
          <div style={styles.cardHead}>
            <Image size={18} color={AR_HOME.free} />
            <span style={{ ...styles.cardEyebrow, color: AR_HOME.free }}>撮った写真を使う</span>
          </div>
          <p style={styles.promptQuestion}>
            スマホに保存してある写真から選びます
          </p>
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            disabled={readingLibrary}
            style={{ ...styles.ctaRow, width: '100%', border: 'none', color: AR_HOME.free, background: AR_HOME.freeSoft }}
          >
            <Image size={18} />
            {readingLibrary ? '読み込み中…' : '写真を選ぶ'}
            {!readingLibrary && <ChevronRight size={18} />}
          </button>
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            onChange={chooseLibraryPhoto}
            style={styles.hiddenFile}
            aria-label="写真を選ぶ"
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    height: '100dvh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    background: AR_HOME.bg,
    color: AR_HOME.text,
  },
  inner: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '16px 18px 40px',
    paddingBottom: AR_HOME.safeBottom,
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'none',
    background: 'none',
    color: AR_HOME.primary,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '4px 0 12px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 800,
    color: AR_HOME.text,
  },
  lead: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
    fontWeight: 600,
  },
  howto: {
    margin: '12px 0 0',
    padding: '12px 14px',
    borderRadius: 12,
    background: AR_HOME.primarySoft,
    color: AR_HOME.text,
    fontSize: 14,
    lineHeight: 1.55,
    fontWeight: 600,
  },
  howtoNote: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
  },
  freeCard: {
    width: '100%',
    textAlign: 'left',
    background: AR_HOME.surface,
    border: `2px solid ${AR_HOME.primary}`,
    borderRadius: AR_HOME.radius,
    padding: '16px',
    cursor: 'pointer',
    marginBottom: 12,
  },
  libraryCard: {
    width: '100%',
    textAlign: 'left',
    background: AR_HOME.surface,
    border: `2px solid ${AR_HOME.free}`,
    borderRadius: AR_HOME.radius,
    padding: '16px',
  },
  hiddenFile: {
    display: 'none',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardEyebrow: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    color: AR_HOME.standing,
  },
  promptQuestion: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
  },
  ctaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 12,
    background: AR_HOME.primarySoft,
    color: AR_HOME.primary,
    fontSize: 15,
    fontWeight: 800,
  },
};
