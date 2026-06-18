import { create } from "zustand";
import type { Pet, MedicalRecord, Vaccination } from "@/types";

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  medicalRecords: MedicalRecord[];
  vaccinations: Vaccination[];
  loading: boolean;
  error: string | null;

  fetchPets: (search?: string) => Promise<void>;
  fetchPetById: (id: number) => Promise<void>;
  createPet: (petData: Partial<Pet> & { ownerName: string; ownerPhone: string }) => Promise<Pet>;
  updatePet: (id: number, petData: Partial<Pet>) => Promise<void>;
  fetchMedicalRecords: (petId: number) => Promise<void>;
  fetchVaccinations: (petId: number) => Promise<void>;
  addVaccination: (petId: number, data: Partial<Vaccination>) => Promise<void>;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  currentPet: null,
  medicalRecords: [],
  vaccinations: [],
  loading: false,
  error: null,

  fetchPets: async (search?: string) => {
    set({ loading: true });
    try {
      const url = search ? `/api/pets?search=${encodeURIComponent(search)}` : "/api/pets";
      const res = await fetch(url);
      const data = await res.json();
      set({ pets: data.data || [], loading: false });
    } catch (error) {
      set({ error: "获取宠物列表失败", loading: false });
    }
  },

  fetchPetById: async (id: number) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/pets/${id}`);
      const data = await res.json();
      set({ currentPet: data.data, loading: false });
    } catch (error) {
      set({ error: "获取宠物详情失败", loading: false });
    }
  },

  createPet: async (petData) => {
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petData),
    });
    const data = await res.json();
    if (data.success) {
      set((state) => ({ pets: [...state.pets, data.data] }));
      return data.data;
    }
    throw new Error(data.message || "创建失败");
  },

  updatePet: async (id: number, petData: Partial<Pet>) => {
    const res = await fetch(`/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petData),
    });
    const data = await res.json();
    if (data.success) {
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? data.data : p)),
        currentPet: state.currentPet?.id === id ? data.data : state.currentPet,
      }));
    }
  },

  fetchMedicalRecords: async (petId: number) => {
    try {
      const res = await fetch(`/api/pets/${petId}/medical-records`);
      const data = await res.json();
      set({ medicalRecords: data.data || [] });
    } catch (error) {
      set({ error: "获取就诊记录失败" });
    }
  },

  fetchVaccinations: async (petId: number) => {
    try {
      const res = await fetch(`/api/pets/${petId}/vaccinations`);
      const data = await res.json();
      set({ vaccinations: data.data || [] });
    } catch (error) {
      set({ error: "获取疫苗记录失败" });
    }
  },

  addVaccination: async (petId: number, data: Partial<Vaccination>) => {
    const res = await fetch("/api/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, petId }),
    });
    const result = await res.json();
    if (result.success) {
      set((state) => ({
        vaccinations: [...state.vaccinations, result.data],
      }));
    }
  },
}));
