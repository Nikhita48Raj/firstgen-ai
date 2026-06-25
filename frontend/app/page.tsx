"use client";

import { useState } from "react";
import { sendGeneralChat } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<
    "English" | "Tamil" | "Hindi" | "Telugu"
  >("English");
  const [mode, setMode] = useState<"student" | "parent">("student");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;

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
      const data = await sendGeneralChat({
        message: userMessage,
        language,
        mode,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
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
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            FirstGen AI
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            AI College Companion for First-Generation Students
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Ask simple questions about backlogs, attendance, CGPA, placements,
            electives, scholarships, and college rules.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row">
          <select
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value as "English" | "Tamil" | "Hindi" | "Telugu"
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white"
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
          </select>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "student" | "parent")}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white"
          >
            <option value="student">Student Mode</option>
            <option value="parent">Parent Mode</option>
          </select>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-slate-400">
              Ask: “What is a backlog?” or “What happens if attendance is below
              75%?”
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((chat, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 ${
                    chat.role === "user"
                      ? "ml-auto max-w-xl bg-blue-600"
                      : "mr-auto max-w-2xl bg-slate-800"
                  }`}
                >
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-300">
                    {chat.role === "user" ? "You" : "FirstGen AI"}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {chat.content}
                  </p>
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
            placeholder="Ask a college question..."
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