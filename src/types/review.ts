import type { Course } from "./course";

export interface Review {
  id: number;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  course: Course;         // มาจาก backend แบบซ้อน
  createdAt: string;
  updatedAt: string;
}
