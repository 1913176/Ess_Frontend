import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Images/ess_logo.png";
import { MoveUpRight } from "lucide-react";
const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isScrollBar, setIsScrollBar] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrollBar(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <div
        className={`navbar fixed top-0 left-0 w-full transition-all duration-300 ${isScrollBar ? `backdrop-blur-lg` : `bg-transparent`}`}
      >
        <div className="container mx-auto w-full px-2 md:px-0">
          <div className="flex w-full justify-between items-center py-4">
            <img src={logo} alt="ess-Logo" height={32} width={32} />
            <button
              className="bg-blue-600 text-white tracking-wider p-1 rounded-full
          flex gap-2 items-center   hover:bg-blue-800"
              onClick={() => navigate("/login")}
            >
              <p className="px-2">login</p>
              <span className="p-3 px-2 rounded-full bg-blue-500 ">
                <MoveUpRight height={15} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingNavbar;
