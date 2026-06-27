"use client";

import { useState } from "react";
import { predictStudentRisk } from "@/lib/api";
import type { Language, RiskSummary } from "@/lib/api";

export default function RiskPage() {
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [attendance, setAttendance] = useState("");
    const [backlogs, setBacklogs] = useState("");
    const [internalMarks, setInternalMarks] = useState("");
    const [skills, setSkills] = useState("");
    const [projectCount, setProjectCount] = useState("");
    const [internshipCount, setInternshipCount] = useState("");
    const [targetRole, setTargetRole] = useState("Software Engineering Internship");
    const [language, setLanguage] = useState<Language>("English");

    const [summary, setSummary] = useState<RiskSummary | null>(null);
    const [explanation, setExplanation] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    function parseList(value: string) {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    async function handlePredictRisk() {
        setInfo("");
        setSummary(null);
        setExplanation("");

        if (!branch.trim() || !year.trim() || !cgpa.trim() || !attendance.trim()) {
            setInfo("Please fill branch, year, CGPA, and attendance.");
            return;
        }

        const cgpaNumber = Number(cgpa);
        const attendanceNumber = Number(attendance);
        const backlogNumber = Number(backlogs || 0);
        const projectNumber = Number(projectCount || 0);
        const internshipNumber = Number(internshipCount || 0);
        const internalMarksNumber = internalMarks.trim()
            ? Number(internalMarks)
            : null;

        if (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
            setInfo("Please enter a valid CGPA between 0 and 10.");
            return;
        }

        if (
            Number.isNaN(attendanceNumber) ||
            attendanceNumber < 0 ||
            attendanceNumber > 100
        ) {
            setInfo("Please enter valid attendance between 0 and 100.");
            return;
        }

        setLoading(true);

        try {
            const data = await predictStudentRisk({
                branch,
                year,
                cgpa: cgpaNumber,
                attendance_percent: attendanceNumber,
                active_backlogs: backlogNumber,
                internal_marks_average: internalMarksNumber,
                skills: parseList(skills),
                project_count: projectNumber,
                internship_count: internshipNumber,
                target_role: targetRole,
                language,
            });

            setSummary(data.summary);
            setExplanation(data.explanation);
            setInfo(data.message);
        } catch (error) {
            setInfo(
                error instanceof Error ? error.message : "Could not predict risk."
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
                        href="/career"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-cyan-400 hover:bg-slate-900 hover:text-cyan-300"
                    >
                        Open Career Engine
                    </a>
                </div>

                <div className="mb-8 mt-8">
                    <p className="mb-2 text-sm font-medium text-red-400">
                        FirstGen AI Risk Predictor
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Student Risk Prediction
                    </h1>

                    <p className="mt-4 max-w-3xl text-slate-300">
                        Predict attendance risk, backlog risk, and placement readiness using
                        academic details and AI explanation.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="Branch: CSE, ECE, BCA, B.Com"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Year/Semester: 2nd Year"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="CGPA: 7.2"
                            inputMode="decimal"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={attendance}
                            onChange={(e) => setAttendance(e.target.value)}
                            placeholder="Attendance %: 68"
                            inputMode="decimal"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={backlogs}
                            onChange={(e) => setBacklogs(e.target.value)}
                            placeholder="Active Backlogs: 1"
                            inputMode="numeric"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={internalMarks}
                            onChange={(e) => setInternalMarks(e.target.value)}
                            placeholder="Internal Marks Average: 62"
                            inputMode="decimal"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={projectCount}
                            onChange={(e) => setProjectCount(e.target.value)}
                            placeholder="Project Count: 1"
                            inputMode="numeric"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={internshipCount}
                            onChange={(e) => setInternshipCount(e.target.value)}
                            placeholder="Internship Count: 0"
                            inputMode="numeric"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <input
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Target Role"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                        />

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
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
                        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"
                    />

                    <button
                        onClick={handlePredictRisk}
                        disabled={loading}
                        className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Predicting..." : "Predict Risk"}
                    </button>

                    {info && <p className="mt-4 text-sm text-slate-300">{info}</p>}
                </div>

                {summary && (
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-400">Attendance Risk</p>
                            <p className="mt-2 text-2xl font-bold">{summary.attendance_risk}</p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-400">Backlog Risk</p>
                            <p className="mt-2 text-2xl font-bold">{summary.backlog_risk}</p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-400">Placement Score</p>
                            <p className="mt-2 text-2xl font-bold">
                                {summary.placement_readiness_score}/100
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-400">Overall Risk</p>
                            <p className="mt-2 text-2xl font-bold">{summary.overall_risk}</p>
                        </div>
                    </div>
                )}

                {explanation && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400">
                            AI Explanation
                        </p>

                        <div className="whitespace-pre-wrap leading-relaxed text-slate-100">
                            {explanation}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}