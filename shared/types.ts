export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
export interface VFSItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  size: number;
  updatedAt: number;
}
export interface CreateVFSItemRequest {
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
}
export interface UpdateVFSItemRequest {
  name?: string;
  parentId?: string | null;
  content?: string;
}