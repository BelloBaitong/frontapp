// src/types/userProfile.ts

export type StudyYear = 1 | 2 | 3 | 4;

export type DifficultyPreference = "easy" | "medium" | "hard";
export type LearningStyle = "project" | "theory" | "balanced";

export type UserProfile = {
  year: StudyYear;
  interests: string[];
  careerGoals: string[];
  difficultyPreference: DifficultyPreference;
  learningStyle: LearningStyle;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export const DEFAULT_INTERESTS = [
  "AI / Machine Learning",
  "Computer Vision",
  "Data Science",
  "Web Development",
  "Mobile App",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UX/UI",
  "Software Testing",
  "Game Development",
  "IoT",
] as const;

export const DEFAULT_CAREER_GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Data Scientist",
  "ML Engineer",
  "QA Engineer",
  "DevOps Engineer",
  "Cybersecurity Specialist",
  "Product Manager",
  "Researcher",
] as const;