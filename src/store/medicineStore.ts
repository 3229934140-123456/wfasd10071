import { create } from "zustand";
import type { Medicine, StockRecord } from "@/types";

interface MedicineState {
  medicines: Medicine[];
  lowStockMedicines: Medicine[];
  stockRecords: StockRecord[];
  loading: boolean;

  fetchMedicines: (search?: string) => Promise<void>;
  fetchLowStock: () => Promise<void>;
  addMedicine: (data: Partial<Medicine>) => Promise<void>;
  updateMedicine: (id: number, data: Partial<Medicine>) => Promise<void>;
  stockIn: (id: number, data: { quantity: number; batchNumber?: string; expiryDate?: string; supplier?: string }) => Promise<void>;
  fetchStockRecords: (medicineId?: number) => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set) => ({
  medicines: [],
  lowStockMedicines: [],
  stockRecords: [],
  loading: false,

  fetchMedicines: async (search?: string) => {
    set({ loading: true });
    try {
      const url = search ? `/api/medicines?search=${encodeURIComponent(search)}` : "/api/medicines";
      const res = await fetch(url);
      const data = await res.json();
      set({ medicines: data.data || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchLowStock: async () => {
    try {
      const res = await fetch("/api/medicines/low-stock");
      const data = await res.json();
      set({ lowStockMedicines: data.data || [] });
    } catch {
      // ignore
    }
  },

  addMedicine: async (data) => {
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({ medicines: [...state.medicines, result.data] }));
    }
  },

  updateMedicine: async (id, data) => {
    const res = await fetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({
        medicines: state.medicines.map((m) => (m.id === id ? result.data : m)),
      }));
    }
  },

  stockIn: async (id, data) => {
    const res = await fetch(`/api/medicines/${id}/stock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({
        medicines: state.medicines.map((m) =>
          m.id === id ? { ...m, stockQuantity: m.stockQuantity + data.quantity } : m
        ),
      }));
    }
  },

  fetchStockRecords: async (medicineId?: number) => {
    try {
      const url = medicineId ? `/api/stock-records?medicineId=${medicineId}` : "/api/stock-records";
      const res = await fetch(url);
      const data = await res.json();
      set({ stockRecords: data.data || [] });
    } catch {
      // ignore
    }
  },
}));
