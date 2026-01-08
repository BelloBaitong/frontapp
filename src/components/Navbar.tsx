import Link from "next/link"
import Image from "next/image"

import CustomButton from "./CustomButton"

const Navbar = () => {
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-transparent">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center
       sm:px-16 px-6 py-2">
        <h1 className="flex-1 text-left font-bold text-xl text-white">
          Recommendation Course
        </h1>


        <CustomButton 
          title ="เริ่มคุยกับAI"
            btnType="button"
            containerStyles="text-purple-500 font-bold rounded-full bg-white  min-w-[130px]"
            />
      </nav>
    </header>
  ) 
}

export default Navbar
