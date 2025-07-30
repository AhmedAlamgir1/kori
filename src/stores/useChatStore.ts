import { create } from 'zustand';

interface ChatStore {
  chatId: string | null;
  setChatId: (id: string) => void;
  chats: any[];
  setChats: (chats: any[]) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
}

export const useChatStore = create<ChatStore>(set => ({
  chatId: null,
  setChatId: (id: string) => set({ chatId: id }),
  chats: [],
  setChats: (chats) => set({ chats }),
  selectedChatId: null,
  setSelectedChatId: (id: string) => set({ selectedChatId: id }),
})); 