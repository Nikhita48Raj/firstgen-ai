"use client";

import { useState } from "react";
import { generateRoadmap } from "@/lib/api";
import type { Language } from "@/lib/api";

export default function AdvisorPage() {
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [roadmap, setRoadmap] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerateRoadmap() {
    setInfo("");
    setRoadmap("");

    if (!branch.trim() || !year.trim() || !cgpa.trim() || !careerGoal.trim()) {
      setInfo("Please fill branch, year, CGPA, and career goal.");
      return;
    }

    const cgpaNumber = Number(cgpa);

    if (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
      setInfo("Please enter a valid CGPA between 0 and 10.");
      return;
    }

    setLoading(true);

    try {
      const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const data = await generateRoadmap({
        branch,
        year,
        cgpa: cgpaNumber,
        skills: skillList,
        career_goal: careerGoal,
        language,
      });

      setRoadmap(data.roadmap);
      setInfo(data.message);
    } catch (error) {
      setInfo(
        error instanceof Error ? error.message : "Could not generate roadmap."
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
            FirstGen AI Advisor
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Personalized Academic Roadmap
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Enter your academic details and career goal. FirstGen AI will create
            a practical roadmap for skills, projects, internships, and
            placements.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Branch
              </label>
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Example: CSE, ECE, B.Com, BCA"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Year / Semester
              </label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Example: 2nd Year / 4th Semester"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                CGPA
              </label>
              <input
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="Example: 8.1"
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
              Current Skills
            </label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Example: Python, React, SQL, Machine Learning"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate skills using commas.
            </p>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Career Goal
            </label>
            <input
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="Example: Software Engineering internship, Data Scientist, Cybersecurity"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating Roadmap..." : "Generate Roadmap"}
          </button>

          {info && <p className="mt-4 text-sm text-slate-300">{info}</p>}
        </div>

        {roadmap && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
              Your Personalized Roadmap
            </p>

            <div className="whitespace-pre-wrap leading-relaxed text-slate-100">
              {roadmap}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}