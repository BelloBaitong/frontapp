export type CourseCategory = "ELECTIVE" | "GENERAL";

export type Course = {
  id: number;
  courseCode: string;
  courseName: string;
  courseNameTh: string;
  courseNameEn?: string | null;
  description?: string | null;
  credits: number;
  imageUrl?: string | null;
  category: CourseCategory;
  createdAt: string; // NestJS ส่งเป็น ISO string
  avgRating?: number;
  reviewCount?: number;

};
