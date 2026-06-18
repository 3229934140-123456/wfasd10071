import { create } from "zustand";
import type { MedicalRecord, Prescription } from "@/types";

interface MedicalState {
  records: MedicalRecord[];
  currentRecord: MedicalRecord | null;
  currentPrescription: Prescription | null;
  loading: boolean;

  fetchRecords: (filters?: { date?: string; status?: string; doctorId?: number }) => Promise<void>;
  fetchRecordById: (id: number) => Promise<void>;
  createRecord: (data: Partial<MedicalRecord> & { petId: number }) => Promise<MedicalRecord>;
  updateRecord: (id: number, data: Partial<MedicalRecord>) => Promise<void>;
  createPrescription: (data: { medicalRecordId: number; items: Array<{ medicineId: number; dosage: number; frequency: string; durationDays: number; instructions: string }>; notes?: string }) => Promise<void>;
  fetchPrescription: (recordId: number) => Promise<void>;
}

export const useMedicalStore = create<MedicalState>((set) => ({
  records: [],
  currentRecord: null,
  currentPrescription: null,
  loading: false,

  fetchRecords: async (filters) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.set("date", filters.date);
      if (filters?.status) params.set("status", filters.status);
      const res = await fetch(`/api/medical-records?${params.toString()}`);
      const data = await res.json();
      set({ records: data.data || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchRecordById: async (id: number) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/medical-records/${id}`);
      const data = await res.json();
      set({ currentRecord: data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createRecord: async (data) => {
    const res = await fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({ records: [result.data, ...state.records] }));
      return result.data;
    }
    throw new Error(result.message || "创建失败");
  },

  updateRecord: async (id, data) => {
    const res = await fetch(`/api/medical-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? result.data : r)),
        currentRecord: state.currentRecord?.id === id ? result.data : state.currentRecord,
      }));
    }
  },

  createPrescription: async (data) => {
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set({ currentPrescription: result.data });
    }
  },

  fetchPrescription: async (recordId: number) => {
    try {
      const res = await fetch(`/api/medical-records/${recordId}/prescription`);
      const data = await res.json();
      set({ currentPrescription: data.data });
    } catch {
      // ignore
    }
  },
}));
