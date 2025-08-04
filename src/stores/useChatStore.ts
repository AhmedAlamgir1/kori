import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  chatId: string | null;
  setChatId: (id: string) => void;
  chats: any[];
  setChats: (chats: any[]) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
}
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chatId: null,
      setChatId: (id: string) => set({ chatId: id }),
      chats: [],
      setChats: (chats) => set({ chats }),
      selectedChatId: null,
      setSelectedChatId: (id: string) => set({ selectedChatId: id }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chats: state.chats,
        selectedChatId: state.selectedChatId,
        chatId: state.chatId,
      }),
    }
  )
);