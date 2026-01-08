"use client";

import { CourseCard,ReviewCard } from "@/components";

const popularCourses = [
  {
    code: "05506045",
    titleEn: "MACHINE LEARNING",
    titleTh: "การเรียนรู้ของเครื่องจักร",
    rating: 5.0,
    imageSrc: "/ml.png", // ใส่ชื่อไฟล์จริงใน public
  },
  {
    code: "05506056",
    titleEn: "SOFTWARE TESTING",
    titleTh: "การทดสอบซอฟต์แวร์",
    rating: 5.0,
    imageSrc: "/testing.png",
  },
  {
    code: "05506108",
    titleEn: "SOFTWARE DESIGN",
    titleTh: "การออกแบบซอฟต์แวร์",
    rating: 5.0,
    imageSrc: "/design.png",
  },
  {
    code: "90642211",
    titleEn: "CODING WITH PYTHON",
    titleTh: "เขียนโค้ดด้วยไพทอน",
    rating: 5.0,
    imageSrc: "/python.png",
  },
];

const courseReviews = [
  {
    courseCode: "05506045",
    courseName: "MACHINE LEARNING",
    studentName: "Name",
    comment: "เหมาะกับคนชอบความท้าทาย วิชานี้เข้มข้นแต่สนุก",
    rating: 5,
  },
  {
    courseCode: "05506056",
    courseName: "SOFTWARE TESTING",
    studentName: "Name",
    comment: "สอยยากนิดนึง แต่ได้ความรู้แน่นเรื่องระบบทดสอบ",
    rating: 4,
  },
  {
    courseCode: "05506108",
    courseName: "SOFTWARE DESIGN",
    studentName: "Name",
    comment: "เป็นวิชาที่ช่วยต่อยอดทักษะได้ดีมาก",
    rating: 5,
  },
  {
    courseCode: "90642211",
    courseName: "CODING WITH PYTHON",
    studentName: "Name",
    comment: "เนื้อหาน่าสนใจ เข้าใจง่าย อาจารย์สอนดี",
    rating: 5,
  },
];

const HomeSection = () => {
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
          <div className="w-full sm:w-[70%] bg-white/95 rounded-full shadow-lg flex items-center gap-4 px-6 py-3">
            <span className="text-2xl text-[#B58AE6]">🔍</span>
            <input
              type="text"
              placeholder="วิชา...."
              className="flex-1 bg-transparent outline-none text-[#777] placeholder:text-[#D1D1D1] text-base"
            />
          </div>
        </div>

        {/* รายวิชายอดฮิต */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white drop-shadow-sm">
            รายวิชายอดฮิต
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {popularCourses.map((course) => (
              <CourseCard key={course.code} {...course} />
            ))}
          </div>
        </section>

        {/* รายวิชา (เปล่า ๆ รอข้อมูลจริง) */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white drop-shadow-sm">
            รายวิชา
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-[24px] bg-white/60 border border-white/60 min-h-[230px]"
              />
            ))}
          </div>
        </section>

        {/* รีวิวจากนักศึกษา */}
         {/* รีวิวรายวิชา */}
      <section className="flex flex-col gap-4 mt-8">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#E2C4FF] drop-shadow-sm">
          รีวิวรายวิชา
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {courseReviews.map((review) => (
            <ReviewCard key={review.courseCode + review.studentName} {...review} />
          ))}
        </div>
      </section>
      </section>
    </main>
  );
};

export default HomeSection;
