import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { RespondentProfile } from '@/components/research/profile/types';

interface ProfileState {
  profiles: RespondentProfile[];
  selectedProfile: RespondentProfile | null;
  selectedProfileIndex: number | null;
  regenerationsLeft: number;
  setProfiles: (profiles: RespondentProfile[]) => void;
  addProfile: (profile: RespondentProfile) => void;
  selectProfile: (index: number | null) => void;
  decrementRegenerations: () => void;
  resetRegenerations: () => void;
}

type ProfilePersist = {
  profiles: RespondentProfile[];
  selectedProfile: RespondentProfile | null;
  selectedProfileIndex: number | null;
  regenerationsLeft: number;
};

type PersistConfig = PersistOptions<ProfileState, ProfilePersist>;

const persistConfig: PersistConfig = {
  name: 'kori-profile-storage',
  // Only persist these fields
  partialize: (state) => ({
    profiles: state.profiles,
    selectedProfile: state.selectedProfile,
    selectedProfileIndex: state.selectedProfileIndex,
    regenerationsLeft: state.regenerationsLeft
  })
};

const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      selectedProfile: null,
      selectedProfileIndex: null,
      regenerationsLeft: 3,
      
      setProfiles: (profiles) => set((state) => { 
        let newSelectedProfileIndex = null;
        let newSelectedProfile = null;
        
        // Maintain selection if possible
        if (state.selectedProfile) {
          const index = profiles.findIndex(p => 
            p.name === state.selectedProfile?.name && 
            p.age === state.selectedProfile?.age && 
            p.occupation === state.selectedProfile?.occupation
          );
          
          if (index !== -1) {
            newSelectedProfileIndex = index;
            newSelectedProfile = profiles[index];
          }
        }
        
        return {
          profiles,
          selectedProfileIndex: newSelectedProfileIndex,
          selectedProfile: newSelectedProfile
        };
      }),
      
      addProfile: (profile) => set((state) => ({
        profiles: [...state.profiles, profile]
      })),
      
      selectProfile: (index) => set((state) => {
        if (index === null) {
          return { selectedProfile: null, selectedProfileIndex: null };
        }
        
        if (index >= 0 && index < state.profiles.length) {
          return {
            selectedProfile: state.profiles[index],
            selectedProfileIndex: index
          };
        }
        
        return state;
      }),
      
      decrementRegenerations: () => set((state) => ({
        regenerationsLeft: Math.max(0, state.regenerationsLeft - 1)
      })),
      
      resetRegenerations: () => set({
        regenerationsLeft: 3
      })
    }),
    persistConfig
  )
);

export default useProfileStore;