import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, VFSItem } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
export class VFSEntity extends IndexedEntity<VFSItem> {
  static readonly entityName = "vfs";
  static readonly indexName = "vfs_items";
  static readonly initialState: VFSItem = {
    id: "",
    name: "",
    type: "file",
    parentId: null,
    size: 0,
    updatedAt: 0
  };
  static seedData: VFSItem[] = [
    { id: "root-docs", name: "Documents", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
    { id: "root-desktop", name: "Desktop", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
    { id: "root-downloads", name: "Downloads", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
    { id: "welcome-txt", name: "Welcome.txt", type: "file", parentId: "root-docs", content: "Welcome to WebDash Cloud OS!", size: 28, updatedAt: Date.now() },
    { id: "desktop-readme", name: "Read Me.txt", type: "file", parentId: "root-desktop", content: "This is your cloud desktop. Drag files here to persist them across sessions.", size: 78, updatedAt: Date.now() }
  ];
}