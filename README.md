# FirstGen AI

FirstGen AI is an AI-powered college companion designed for first-generation Indian college students and parents.

It helps students understand college rules, academic policies, placements, resumes, career paths, and academic risks in simple language.

## Problem

Many first-generation college students do not have family guidance for understanding:

- Backlogs
- Attendance requirements
- CGPA/GPA
- Credits
- Electives
- Internships
- Placements
- Scholarships
- Academic regulations
- Resume preparation
- Career planning

FirstGen AI solves this by acting as a multilingual AI mentor for students and parents.

## Key Features

### 1. AI Chatbot

Students can ask general college questions such as:

- What is a backlog?
- What happens if attendance is below 75%?
- How does CGPA work?
- How do placements work?

### 2. Parent Mode

Explains college concepts in simple language for parents who have not attended college.

### 3. University PDF RAG

Students can upload university PDFs such as:

- Academic regulations
- Placement policies
- Student handbooks

The AI answers questions using the uploaded document context.

### 4. PDF Simplifier

Converts complex academic rules into simple student-friendly or parent-friendly explanations.

### 5. Personalized Academic Advisor

Generates a personalized roadmap based on:

- Branch
- Year
- CGPA
- Skills
- Career goal

### 6. Resume Analyzer

Analyzes resume PDFs and provides:

- Resume score
- ATS friendliness
- Missing skills
- Project suggestions
- Internship readiness
- 7-day improvement plan

### 7. Career Recommendation Engine

Suggests suitable career paths based on:

- Branch
- CGPA
- Skills
- Interests
- Strengths

### 8. Student Risk Prediction

Predicts:

- Attendance risk
- Backlog risk
- Placement readiness
- Overall academic risk

Uses rule-based scoring plus AI explanation.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python

### AI

- Gemini API
- Gemini Embeddings

### RAG

- ChromaDB
- PDF text extraction
- Vector search

### PDF Processing

- pypdf

## Project Architecture

```text
firstgen-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── vectorstore/
│   ├── uploads/
│   ├── chroma_db/
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── lib/
│   └── package.json
│
└── README.md