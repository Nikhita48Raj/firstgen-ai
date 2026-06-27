"use client";

import { useState } from "react";
import { generateCareerRecommendations } from "@/lib/api";
import type { Language } from "@/lib/api";

export default function CareerPage() {
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [skills, setSkills] = useState("");
    const [interests, setInterests] = useState("");
    const [strengths, setStrengths] = useState("");
    const [language, setLanguage] = useState<Language>("English");
    const [recommendations, setRecommendations] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    function parseList(value: string) {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    async function handleGenerate() {
        setInfo("");
        setRecommendations("");

        if (!branch.trim() || !year.trim() || !cgpa.trim()) {
            setInfo("Please fill branch, year, and CGPA.");
            return;
        }

        const cgpaNumber = Number(cgpa);

        if (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
            setInfo("Please enter a valid CGPA between 0 and 10.");
            return;
        }

        setLoading(true);

        try {
            const data = await generateCareerRecommendations({
                branch,
                year,
                cgpa: cgpaNumber,
                skills: parseList(skills),
                interests: parseList(interests),
                strengths: parseList(strengths),
                language,
            });

            setRecommendations(data.recommendations);
            setInfo(data.message);
        } catch (error) {
            setInfo(
                error instanceof Error
                    ? error.message
                    : "Could not generate career recommendations."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
            <section className="mx-auto max-w-5xl">
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-blue-400 hover:bg-slate-900 hover:text-blue-300"
                    >
                        ← Back to FirstGen AI
                    </a>

                    <a
                        href="/advisor"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-900 hover:text-emerald-300"
                    >
                        Open Advisor
                    </a>

                    <a
                        href="/resume"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-purple-400 hover:bg-slate-900 hover:text-purple-300"
                    >
                        Open Resume Analyzer
                    </a>
                </div>

                <div className="mb-8 mt-8">
                    <p className="mb-2 text-sm font-medium text-cyan-400">
                        FirstGen AI Career Engine
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Career Recommendation Engine
                    </h1>

                    <p className="mt-4 max-w-3xl text-slate-300">
                        Get suitable career paths based on your branch, CGPA, skills,
                        interests, and strengths.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="Branch: CSE, ECE, BCA, B.Com..."
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        />

                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Year/Semester: 2nd Year"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        />

                        <input
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="CGPA: 8.1"
                            inputMode="decimal"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        />

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        >
                            <option value="English">English</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Telugu">Telugu</option>
                        </select>
                    </div>

                    <input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Skills: Python, React, SQL"
                        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <input
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Interests: AI, Cybersecurity, Web Development"
                        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <input
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        placeholder="Strengths: Communication, Problem Solving"
                        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Separate skills, interests, and strengths using commas.
                    </p>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-6 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Generating..." : "Generate Career Recommendations"}
                    </button>

                    {info && <p className="mt-4 text-sm text-slate-300">{info}</p>}
                </div>

                {recommendations && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-400">
                            Career Recommendations
                        </p>

                        <div className="whitespace-pre-wrap leading-relaxed text-slate-100">
                            {recommendations}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}