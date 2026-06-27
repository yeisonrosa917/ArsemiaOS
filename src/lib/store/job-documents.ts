"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DocumentTemplateMeta } from "./company-config";

/**
 * Per-job document instances. References a template and tracks signing state.
 * Real e-signature ships later — for now we record demo "marked signed" timestamps
 * with the actor name so the workflow is real even without legal infra.
 */

export type JobDocumentStatus =
  | "draft"
  | "ready"
  | "sent"
  | "partially_signed"
  | "signed"
  | "voided";

export interface JobDocumentSignature {
  role: "customer" | "foreman";
  name: string;
  signedAt: string;
  /** Optional dataURL placeholder. Not used in this phase. */
  imageRef?: string;
}

export interface JobDocumentInstance {
  id: string;
  jobId: string;
  templateId: string;
  type: DocumentTemplateMeta["type"];
  title: string;
  status: JobDocumentStatus;
  generatedAt: string;
  sentAt?: string;
  signedAt?: string;
  signatures: JobDocumentSignature[];
  /** Snapshot of template content at the time the document was generated. */
  snapshotContent: string;
  notes?: string;
}

interface JobDocumentsState {
  items: JobDocumentInstance[];
  generate: (input: {
    jobId: string;
    template: DocumentTemplateMeta;
  }) => JobDocumentInstance;
  markSent: (id: string, by: string) => JobDocumentInstance | undefined;
  signAs: (
    id: string,
    role: "customer" | "foreman",
    name: string,
  ) => JobDocumentInstance | undefined;
  voidDoc: (id: string) => JobDocumentInstance | undefined;
  remove: (id: string) => void;
  forJob: (jobId: string) => JobDocumentInstance[];
}

const now = () => new Date().toISOString();

export const useJobDocuments = create<JobDocumentsState>()(
  persist(
    (set, get) => ({
      items: [],
      generate: ({ jobId, template }) => {
        const doc: JobDocumentInstance = {
          id: `doc_${Math.random().toString(36).slice(2, 9)}`,
          jobId,
          templateId: template.id,
          type: template.type,
          title: template.title,
          status: "ready",
          generatedAt: now(),
          signatures: [],
          snapshotContent: template.content,
        };
        set((s) => ({ items: [doc, ...s.items] }));
        return doc;
      },
      markSent: (id, by) => {
        let updated: JobDocumentInstance | undefined;
        set((s) => ({
          items: s.items.map((d) => {
            if (d.id !== id) return d;
            updated = { ...d, status: "sent", sentAt: now(), notes: by };
            return updated;
          }),
        }));
        return updated;
      },
      signAs: (id, role, name) => {
        let updated: JobDocumentInstance | undefined;
        set((s) => ({
          items: s.items.map((d) => {
            if (d.id !== id) return d;
            const signatures = [
              ...d.signatures.filter((sig) => sig.role !== role),
              { role, name, signedAt: now() },
            ];
            const hasCustomer = signatures.some((sg) => sg.role === "customer");
            const hasForeman = signatures.some((sg) => sg.role === "foreman");
            const status: JobDocumentStatus =
              hasCustomer && hasForeman
                ? "signed"
                : "partially_signed";
            updated = {
              ...d,
              signatures,
              status,
              signedAt: status === "signed" ? now() : d.signedAt,
            };
            return updated;
          }),
        }));
        return updated;
      },
      voidDoc: (id) => {
        let updated: JobDocumentInstance | undefined;
        set((s) => ({
          items: s.items.map((d) => {
            if (d.id !== id) return d;
            updated = { ...d, status: "voided" };
            return updated;
          }),
        }));
        return updated;
      },
      remove: (id) =>
        set((s) => ({ items: s.items.filter((d) => d.id !== id) })),
      forJob: (jobId) => get().items.filter((d) => d.jobId === jobId),
    }),
    {
      name: "arsemia.job-documents.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
