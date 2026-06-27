"use client";

import { useState } from "react";
import { analyzeResume } from "@/lib/api";
import type { Language } from "@/lib/api";

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [targetRole, setTargetRole] = useState(
        "Software Engineering Internship"
    );
    const [language, setLanguage] = useState<Language>("English");
    const [analysis, setAnalysis] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAnalyzeResume() {
        setInfo("");
        setAnalysis("");

        if (!file) {
            setInfo("Please upload your resume PDF.");
            return;
        }

        if (!targetRole.trim()) {
            setInfo("Please enter your target role.");
            return;
        }

        setLoading(true);

        try {
            const data = await analyzeResume({
                file,
                target_role: targetRole,
                language,
            });

            setAnalysis(data.analysis);
            setInfo(data.message);
        } catch (error) {
            setInfo(
                error instanceof Error ? error.message : "Could not analyze resume."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
            <section className="mx-auto max-w-5xl">
                <a href="/" className="text-sm text-blue-400 hover:text-blue-300">
                    ← Back to FirstGen AI
                </a>

                <div className="mb-8 mt-6">
                    <p className="mb-2 text-sm font-medium text-blue-400">
                        FirstGen AI Resume Analyzer
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight">
                        AI Resume Analyzer for Internships
                    </h1>

                    <p className="mt-4 max-w-3xl text-slate-300">
                        Upload your resume PDF and get an ATS-style score, missing skills,
                        project suggestions, and a 7-day improvement plan.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                                Target Role
                            </label>
                            <input
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="Example: Software Engineering Internship"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Telugu">Telugu</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-semibold text-slate-300">
                            Resume PDF
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                                const selectedFile = e.target.files?.[0] || null;
                                setFile(selectedFile);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                        />
                    </div>

                    <button
                        onClick={handleAnalyzeResume}
                        disabled={loading}
                        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Analyzing Resume..." : "Analyze Resume"}
                    </button>

                    {info && <p className="mt-4 text-sm text-slate-300">{info}</p>}
                </div>

                {analysis && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
                            Resume Analysis
                        </p>

                        <div className="whitespace-pre-wrap leading-relaxed text-slate-100">
                            {analysis}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}