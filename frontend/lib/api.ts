export type Language = "English" | "Tamil" | "Hindi" | "Telugu";

export type ChatMode = "student" | "parent";

export type GeneralChatRequest = {
  message: string;
  language: Language;
  mode: ChatMode;
};

export type GeneralChatResponse = {
  answer: string;
};

export type DocumentUploadResponse = {
  document_id: string;
  file_name: string;
  saved_path: string;
  page_count: number;
  chunk_count: number;
  chroma_collection: string;
  extracted_text_preview: string;
  message: string;
};

export type RAGChatRequest = {
  message: string;
  language: Language;
  document_id: string | null;
};

export type SourceChunk = {
  document_id: string | null;
  file_name: string | null;
  chunk_index: number | null;
  preview: string;
};

export type RAGChatResponse = {
  answer: string;
  source_count: number;
  sources: SourceChunk[];
};

export type SimplifyResponse = {
  simplified_text: string;
  language: string;
  audience: string;
  message: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

export async function sendGeneralChat(
  data: GeneralChatRequest
): Promise<GeneralChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/general`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from FirstGen AI backend");
  }

  return response.json();
}

export async function uploadDocument(
  file: File
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "PDF upload failed");
  }

  return response.json();
}

export async function sendRAGChat(
  data: RAGChatRequest
): Promise<RAGChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/rag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to get RAG response from FirstGen AI backend");
  }

  return response.json();
}

export async function simplifyText(data: {
  text: string;
  language: Language;
  audience: ChatMode;
}): Promise<SimplifyResponse> {
  const response = await fetch(`${API_BASE_URL}/simplify/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Text simplification failed");
  }

  return response.json();
}

export async function simplifyPDF(data: {
  file: File;
  language: Language;
  audience: ChatMode;
}): Promise<SimplifyResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("language", data.language);
  formData.append("audience", data.audience);

  const response = await fetch(`${API_BASE_URL}/simplify/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "PDF simplification failed");
  }

  return response.json();
}