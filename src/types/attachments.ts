export type AttachmentStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  key?: string;
  url?: string;
  status: AttachmentStatus;
  file?: File;
  error?: string;
  temporary?: boolean;
}
