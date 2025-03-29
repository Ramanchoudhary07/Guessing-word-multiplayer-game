import { create } from "zustand";

interface UserStore {
  nickname: string;
  setNickname: (nickname: string) => void;
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  users: string[];
  setUsers: (users: string[]) => void;
  roomCode: string;
  setRoomCode: (roomCode: string) => void;
  host: boolean;
  setHost: (host: boolean) => void;
}

const useZustand = create<UserStore>((set) => ({
  nickname: "",
  setNickname: (nickname: string) => set({ nickname }),
  socket: null,
  setSocket: (socket: WebSocket | null) => set({ socket }),
  users: [],
  setUsers: (users: string[]) => set({ users }),
  roomCode: "",
  setRoomCode: (roomCode: string) => set({ roomCode }),
  host: false,
  setHost: (host: boolean) => set({ host }),
}));

export default useZustand;
