export interface ServerFileResponse {
  apo_file_nm?: string;
  apo_download_url?: string;
  filePath?: string;
  filedownload?: string;
  filename?: string;
  fileurl?: string;
}

export interface FileResponse extends ServerFileResponse {
  file?: File | null;
}
