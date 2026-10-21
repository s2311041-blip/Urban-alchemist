import React, { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';

const panelStyle = {
  marginBottom: 16,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(79, 195, 247, 0.08)',
  border: '1px solid rgba(79, 195, 247, 0.25)',
};

const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 10,
  border: 'none',
  fontSize: 13,
  fontWeight: 'bold',
  cursor: 'pointer',
};

export function QuestImportPanel({ importArAnnotations }) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const runImport = async (fn) => {
    setLoading(true);
    setLastResult(null);
    try {
      const result = await fn();
      setLastResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      runImport(() => importArAnnotations({ jsonText: String(reader.result ?? '') }));
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, color: '#90caf9', fontWeight: 'bold', marginBottom: 6 }}>
        AR 投稿を取り込む（ファシリ）
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#b0bec5', lineHeight: 1.5 }}>
        JSON に書き出した Bad 投稿を、島上の不満として載せます。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => fileRef.current?.click()}
          style={{
            ...btnStyle,
            background: 'rgba(255,255,255,0.1)',
            color: '#eceff1',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <Loader2 size={16} /> : <FileUp size={16} />}
          JSON ファイル
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
      {lastResult && !lastResult.error && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#a5d6a7' }}>
          取り込み: {lastResult.imported} 件 / スキップ: {lastResult.skipped} 件
        </p>
      )}
      {lastResult?.error && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#ef9a9a' }}>
          {lastResult.error}
        </p>
      )}
    </div>
  );
}
