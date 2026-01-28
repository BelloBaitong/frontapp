export type CourseCategory = "ELECTIVE" | "GENERAL";

export interface PopularCourse {
  id: number;
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  credits: number;
  category: CourseCategory;
  imageUrl: string;      // อาจเป็น ""
  reviewCount: number;
  avgRating: number;
  score: number;
}
