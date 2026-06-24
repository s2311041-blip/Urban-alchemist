import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  buildAnnotationFromDraft,
  annotationToExportRecord,
} from '../utils/normalizeAnnotation';
import { validateDraftForSubmit, mapPostErrorMessage } from '../utils/postValidation';
import {
  fetchAnnotations,
  postAnnotation,
  deleteAnnotation,
  mergeAnnotations,
  getApiMode,
} from '../api/annotationsClient';

const STORAGE_KEY = 'urban_alchemist_ar_rq2_v2';

const getLocalAuthorId = () => {
  const key = 'urban_alchemist_ar_author_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `user-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

export const useArPostingStore = create(
  persist(
    (set, get) => ({
      authorId: getLocalAuthorId(),
      profileTags: [],
      totalPoints: 0,
      annotations: [],
      deletedAnnotationIds: [],
      syncStatus: 'idle',
      lastSyncAt: null,
      helpSeenOnce: false,

      setAuthorId: (authorId) => {
        if (authorId) set({ authorId });
      },

      markHelpSeen: () => set({ helpSeenOnce: true }),

      setProfileTags: (tags) => set({ profileTags: tags }),

      syncAnnotations: async (geo) => {
        set({ syncStatus: 'syncing' });
        try {
          const remote = await fetchAnnotations({ geo });
          const authorId = get().authorId;
          set((state) => ({
            annotations: mergeAnnotations(state.annotations, remote, state.deletedAnnotationIds).map((a) => ({
              ...a,
              isMine: a.authorId === authorId,
            })),
            syncStatus: 'ok',
            lastSyncAt: Date.now(),
          }));
        } catch {
          set({ syncStatus: 'error' });
        }
      },

      submitDraft: async (draft) => {
        const errors = validateDraftForSubmit(draft);
        if (errors.length > 0) {
          throw new Error(errors[0]);
        }

        const { authorId, profileTags } = get();
        const record = buildAnnotationFromDraft(draft, { authorId, profileTags });
        record.authorId = authorId;
        record.isMine = true;

        try {
          const saved = await postAnnotation(record);
          const finalRecord = { ...record, ...saved, isMine: true };

          set((state) => ({
            annotations: [finalRecord, ...state.annotations.filter((a) => a.id !== finalRecord.id)],
            totalPoints: state.totalPoints + finalRecord.pointsAwarded,
          }));

          get().syncAnnotations(draft.authorGeo);
          return finalRecord;
        } catch (err) {
          throw new Error(mapPostErrorMessage(err));
        }
      },

      updateDraft: async (id, draft) => {
        const errors = validateDraftForSubmit(draft);
        if (errors.length > 0) {
          throw new Error(errors[0]);
        }

        const { authorId, profileTags, annotations } = get();
        const existing = annotations.find((a) => a.id === id);
        if (!existing || existing.authorId !== authorId) {
          throw new Error('not allowed');
        }
        const record = buildAnnotationFromDraft(draft, {
          authorId,
          profileTags,
          existingId: id,
          existingCreatedAt: existing.createdAt,
        });
        record.authorId = authorId;
        record.isMine = true;
        record.pointsAwarded = existing.pointsAwarded;
        record.photoStoragePath = existing.photoStoragePath;

        try {
          const saved = await postAnnotation(record);
          const finalRecord = { ...record, ...saved, isMine: true };

          set((state) => ({
            annotations: state.annotations.map((a) => (a.id === id ? finalRecord : a)),
          }));

          get().syncAnnotations(draft.authorGeo ?? existing.authorGeo);
          return finalRecord;
        } catch (err) {
          throw new Error(mapPostErrorMessage(err));
        }
      },

      removeAnnotation: async (id) => {
        const existing = get().annotations.find((a) => a.id === id);
        await deleteAnnotation(id, existing?.photoStoragePath);
        set((state) => ({
          deletedAnnotationIds: state.deletedAnnotationIds.includes(id)
            ? state.deletedAnnotationIds
            : [...state.deletedAnnotationIds, id],
          annotations: state.annotations.filter((a) => a.id !== id),
        }));
      },

      exportJson: () => {
        const { annotations, profileTags, totalPoints, authorId } = get();
        return JSON.stringify({
          schema: 'urban-alchemist-ar-rq1-v2',
          version: 2,
          apiMode: getApiMode(),
          exportedAt: new Date().toISOString(),
          authorId,
          profileTags,
          totalPoints,
          annotations: annotations.map(annotationToExportRecord),
        }, null, 2);
      },

      downloadExport: () => {
        const json = get().exportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ar-koto-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        authorId: state.authorId,
        profileTags: state.profileTags,
        totalPoints: state.totalPoints,
        annotations: state.annotations,
        deletedAnnotationIds: state.deletedAnnotationIds,
        helpSeenOnce: state.helpSeenOnce,
      }),
    },
  ),
);
