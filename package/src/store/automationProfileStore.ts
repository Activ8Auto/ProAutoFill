// store/automationProfileStore.ts
import { create } from "zustand";
import { getProfiles, createProfile, deleteProfile } from "../lib/api";
import { DiagnosisEntry } from "@/types/diagnosis";
import { useAuthStore } from "@/store/authStore";

export interface FunctionLevel {
  level: string;
  weight: number;
}

export interface AutomationProfile {
  id: string;
  name: string;
  targetHours: number;
  selectedDate: string;
  minWait: number;
  maxWait: number;
  runHeadless: boolean;
  maxDiagnoses: number;
  siteType: string;
  rotation: string;
  faculty: string;
  visitType: string;
  gender: {
    gender: string;
    weight: number;
  }[];
  race: {
    race: string;
    weight: number;
  }[];
  siteLocation: string;
  cptCode: string;
  student_function_weights: FunctionLevel[];
  complexity: {
    level: string;
    weight: number;
  }[];
  durationOptions: string[];
  durationWeights: number[];
  diagnoses: DiagnosisEntry[];
  preceptor: string;
  userId: string;
  age_ranges: {
    range: string;
    weight: number;
  }[];
  dNumber?: string; // Optional, from profile_info
  chamberlainPassword?: string;
}

export interface AutomationProfileStore {
  profiles: AutomationProfile[];
  selectedProfile?: AutomationProfile;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: AutomationProfile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  selectProfile: (id: string) => void;
}

export const useAutomationProfileStore = create<AutomationProfileStore>(
  (set, get) => ({
    profiles: [],
    selectedProfile: undefined,

    fetchProfiles: async () => {
      try {
        const { token } = useAuthStore.getState(); // Get token from auth store
        if (!token) {
          console.error("No token available, redirecting to login");
          window.location.href = "/authentication/login";
          return;
        }
        console.log("Fetching profiles with token:", token);
        const profiles = await getProfiles(token); // Pass token to getProfiles
        console.log("Fetched profiles:", profiles);
        set({ profiles });
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },

    addProfile: async (profile: AutomationProfile) => {
      try {
        const { token } = useAuthStore.getState(); // Get token for createProfile
        if (!token) {
          console.error("No token available for adding profile");
          return;
        }
        const newProfile = await createProfile(profile, token); // Pass token
        set((state) => ({ profiles: [...state.profiles, newProfile] }));
      } catch (error) {
        console.error("Error adding profile:", error);
      }
    },

    removeProfile: async (id: string) => {
      try {
        const { token } = useAuthStore.getState(); // Get token for deleteProfile
        if (!token) {
          console.error("No token available for deleting profile");
          return;
        }
        await deleteProfile(id, token); // Pass token
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }));
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    },

    selectProfile: (id: string) => {
      const profile = get().profiles.find((p) => p.id === id);
      set({ selectedProfile: profile });
    },
  })
);