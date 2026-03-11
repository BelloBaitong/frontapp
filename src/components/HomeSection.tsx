"use client";

import { CourseCard,ReviewCard,CourseSearchBox } from "@/components";
import type { Course } from "@/types/course";
import Link from "next/link";
import ViewAllButton from "@/components/ViewAllButton";
import type { PopularCourse } from "@/types/popularcourse";
import type { Review } from "@/types/review";
import { getRecommendedCourses } from "@/lib/api";
import { useEffect, useState } from "react";

const HomeSection = ({ courses, popularCourses,reviews }:
   { courses: Course[]; popularCourses: PopularCourse[]; reviews: Review[]
    }) => {
    const dbCourses = courses.map((c) => ({
    code: c.courseCode,
    titleEn: c.courseNameEn ?? c.courseName ?? "-",      // ถ้ามี EN ให้ใช้ EN
    titleTh: c.courseNameTh ?? c.description ?? "-",     // ถ้ามี TH ให้ใช้ TH
    rating: 5.0, // ตอนนี้หลังบ้านยังไม่มี rating -> ใส่คงที่ไปก่อน
    imageSrc: c.imageUrl ?? "", 
}));
const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

useEffect(() => {
  async function loadRecommendations() {
    try {
      // ดึง userId จาก localStorage
      const userId = localStorage.getItem("userId");

      // ตรวจสอบว่า userId มีค่าไหม
      if (!userId) {
        throw new Error("User ID is required");
      }

      // แปลง userId เป็น number และตรวจสอบว่าแปลงสำเร็จ
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) {
        throw new Error("Invalid User ID");
      }

      // ส่ง userId ไปในคำขอ API โดยแปลงเป็น number
      const data: any = await getRecommendedCourses({ userId: userIdNum });
      console.log("recommendation response:", data);
      console.log("courses length:", data?.courses?.length);

      const mapped = (data?.courses ?? []).map((c: any) => ({
        code: c.courseCode,
        titleEn: c.courseNameEn ?? c.courseName ?? "_",
        titleTh: c.courseNameTh ?? "_",
        rating: c.avgRating ?? 5,
        imageSrc: c.imageUrl ?? ""
      }));

      setRecommendedCourses(mapped);
    } catch (err) {
      console.error("recommendation error", err);
    }
  }

  loadRecommendations();
}, []);

  const popularCards = (popularCourses?.length ? popularCourses : []).map((c: any) => ({
    code: c.courseCode ?? c.code,
    titleEn: c.courseNameEn ?? c.titleEn ?? "-",
    titleTh: c.courseNameTh ?? c.titleTh ?? "-",
    rating: Number(c.avgRating ?? c.rating ?? 0) || 0,
    imageSrc: (c.imageUrl && c.imageUrl.trim().length > 0) ? c.imageUrl : "",
  }));

  const reviewCards = (reviews?.length ? reviews : []).map((r) => ({
  courseCode: r.course?.courseCode ?? "-", // ✅ รหัสวิชาจาก course ที่ซ้อนมา
  courseName: r.course?.courseNameEn ?? r.course?.courseNameTh ?? "-", // ✅ ชื่อวิชา
  userName: r.isAnonymous ? "ไม่ระบุชื่อ" : (r.userName ?? r.userEmail ?? "ผู้ใช้"), // ✅ ยังไม่มีชื่อ user จริงก็ใส่ชั่วคราว
  comment: r.comment ?? "",
  rating: Number(r.rating ?? 0) || 0,
}));



  return (
    <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
      <section className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* หัวข้อใหญ่ */}
        <div className="w-full flex justify-center">
          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            ค้นหารายวิชาที่สนใจ
          </h1>
        </div>

        {/* กล่องค้นหา */}
        <div className="w-full flex justify-center">
          <div className="w-full sm:w-[70%]">
      
            <CourseSearchBox placeholder="วิชา..." />
            
          </div>
        </div>

        {/* รายวิชายอดฮิต */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white drop-shadow-sm">
            รายวิชายอดฮิต
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
           {popularCards.map((course) => (
                  <div key={course.code}>
                    <Link href={`/courses/${course.code}`}>
                      <CourseCard {...course} />
                    </Link>
                  </div>
                ))}         
          </div>
        </section>

        {/* รายวิชา (เปล่า ๆ รอข้อมูลจริง) */}
        <section className="flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-white drop-shadow-sm">
                รายวิชาสำหรับคุณ
              </h2>

              <ViewAllButton href="/course" />
           </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
           {(recommendedCourses.length ? recommendedCourses : dbCourses.slice(0,8)).map((course) => (
                <div key={course.code}>
                <CourseCard {...course} />
                </div>
              ))}
           </div>
        </section>

        {/* รีวิวจากนักศึกษา */}
         {/* รีวิวรายวิชา */}
      <section className="flex flex-col gap-4 mt-8">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#ffffff] drop-shadow-sm">
          รีวิวรายวิชา
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {reviewCards.map((review, index) => (
                <ReviewCard key={`${review.courseCode}-${index}`} {...review} />
              ))}        
            </div>
      </section>
      </section>
    </main>
  );
};

export default HomeSection;
