"use client";

import { useState } from "react";
import {
  Language,
  ChatMode,
  SourceChunk,
  sendGeneralChat,
  sendRAGChat,
  uploadDocument,
} from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
};

type AppMode = "general" | "rag";

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("general");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [chatMode, setChatMode] = useState<ChatMode>("student");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<string>("");

  async function handleUpload() {
    if (!selectedFile) {
      setUploadInfo("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setUploadInfo("");

    try {
      const data = await uploadDocument(selectedFile);

      setDocumentId(data.document_id);
      setDocumentName(data.file_name);
      setUploadInfo(
        `Uploaded successfully: ${data.file_name} | Pages: ${data.page_count} | Chunks: ${data.chunk_count}`
      );
      setAppMode("rag");
    } catch (error) {
      if (error instanceof Error) {
        setUploadInfo(error.message);
      } else {
        setUploadInfo("PDF upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    if (!message.trim()) return;

    if (appMode === "rag" && !documentId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please upload a PDF before asking document-based questions.",
        },
      ]);
      return;
    }

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      if (appMode === "general") {
        const data = await sendGeneralChat({
          message: userMessage,
          language,
          mode: chatMode,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
          },
        ]);
      } else {
        const data = await sendRAGChat({
          message: userMessage,
          language,
          document_id: documentId,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not connect to the backend. Please check if FastAPI is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            FirstGen AI
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            AI College Companion for First-Generation Students
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Ask simple college questions or upload university PDFs to get
            document-based answers about attendance, backlogs, placements, CGPA,
            electives, scholarships, and regulations.
          </p>
        </div>

        <div className="mb-4 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">
              Chat Type
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setAppMode("general")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  appMode === "general"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                General Chat
              </button>

              <button
                onClick={() => setAppMode("rag")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  appMode === "rag"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Ask Uploaded PDF
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">
              Language & Mode
            </p>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
              </select>

              <select
                value={chatMode}
                onChange={(e) => setChatMode(e.target.value as ChatMode)}
                disabled={appMode === "rag"}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="student">Student Mode</option>
                <option value="parent">Parent Mode</option>
              </select>
            </div>

            {appMode === "rag" && (
              <p className="mt-2 text-xs text-slate-400">
                Parent Mode is currently available only for General Chat.
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-300">
            Upload University PDF
          </p>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
              }}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>

          {uploadInfo && (
            <p className="mt-3 text-sm text-slate-300">{uploadInfo}</p>
          )}

          {documentId && (
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Active PDF:</span>{" "}
                {documentName}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">
                Document ID: {documentId}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-slate-400">
              {appMode === "general"
                ? "Ask: “What is a backlog?” or “What happens if attendance is below 75%?”"
                : "Upload a PDF, then ask: “Can I sit for placements with one backlog?”"}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((chat, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 ${
                    chat.role === "user"
                      ? "ml-auto max-w-xl bg-blue-600"
                      : "mr-auto max-w-3xl bg-slate-800"
                  }`}
                >
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-300">
                    {chat.role === "user" ? "You" : "FirstGen AI"}
                  </p>

                  <p className="whitespace-pre-wrap leading-relaxed">
                    {chat.content}
                  </p>

                  {chat.sources && chat.sources.length > 0 && (
                    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
                      <p className="mb-2 text-sm font-semibold text-slate-200">
                        Sources used
                      </p>

                      <div className="space-y-3">
                        {chat.sources.map((source, sourceIndex) => (
                          <div
                            key={sourceIndex}
                            className="rounded-md bg-slate-950 p-3 text-sm text-slate-300"
                          >
                            <p className="text-xs text-slate-500">
                              {source.file_name} | Chunk {source.chunk_index}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap">
                              {source.preview}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-2xl rounded-xl bg-slate-800 p-4 text-slate-300">
                  FirstGen AI is thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder={
              appMode === "general"
                ? "Ask a college question..."
                : "Ask a question from uploaded PDF..."
            }
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </section>
    </main>
  );
}