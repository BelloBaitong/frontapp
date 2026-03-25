// src/types/userProfile.ts

export type StudyYear = 1 | 2 | 3 | 4;

export type UserProfile = {
  year: StudyYear;
  interests: string[];
  careerGoals: string[];
  completedCourseIds?: number[];

  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_INTERESTS = [
  "AI / Machine Learning",
  "Data / Analytics",
  "Software Development",
  "Web Development",
  "Mobile Development",
  "Frontend / UI Development",
  "Backend / API Development",
  "Cloud / DevOps / Infrastructure",
  "Cybersecurity",
  "Software Engineering",
  "Software Testing / QA",
  "UX / UI Design",
  "Game Development",
  "Computer Systems / OS",
  "Networks / Distributed Systems",
  "Databases",
  "IoT / Embedded Systems",
  "Robotics / Automation",
  "Product / Project Management",
  "Research / Academic Work",
  "Startup / Entrepreneurship",
  "Industry Applications",
] as const;

export const DEFAULT_CAREER_GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Mobile Developer",
  "QA Engineer / Software Tester",
  "Cloud / DevOps Engineer",
  "Cybersecurity Specialist",
  "Data Analyst / BI",
  "Data Scientist",
  "Data Engineer",
  "AI / ML Engineer",
  "Researcher / Research Engineer",
  "Game Developer",
  "UX/UI / Product Designer",
  "Product Manager",
  "Project Manager",
  "Business / Systems Analyst",
  "Solutions Architect",
  "Database Administrator",
  "Network Engineer",
  "IoT Engineer",
  "Embedded Systems Engineer",
  "Robotics Engineer",
  "Technical Consultant",
  "Academic / Lecturer",
  "Startup Founder",
] as const;