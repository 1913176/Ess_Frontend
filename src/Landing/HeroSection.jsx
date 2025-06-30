import React from "react";
import { MoveUpRight, Users } from "lucide-react";
import bg from "../assets/bg.mp4";
import LandingNavbar from "./LandingNavbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <>
      <div className="herosection items-center relative">
        <LandingNavbar />
        <div className="absolute -z-10 w-full h-full left-0 top-0">
          <div className="relative w-full h-full">
            <video
              // src={bg}
              // type="mp4"
              className="object-cover w-full h-full"
              autoPlay
              muted
              loop
              loading="lazy"
            >
              <source src={bg} type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="hero-content flex flex-col justify-center items-center text-center min-h-dvh py-16">
            <h1 className="hero-title flex gap-4 text-[10px] lg:text-xs items-center border-collapse font-medium uppercase tracking-wider mb-4 text-slate-600 bg-slate-100/60 p-2 px-3 rounded-full border-slate-200 border-2">
              <Users width={15} />
              Employee Self Service Portal
            </h1>
            <div className="flex flex-col mt-10 items-center justify-center">
              <p className="hero-subtitle text-slate-100 text-3xl lg:text-6xl font-medium mb-6 leading-tight">
                Simplify Your Work Life, Empower Your Journey
              </p>
              <p className="hero-description mt-0 lg:mt-6 text-slate-200 text-base lg:text-xl max-w-3xl mx-auto">
                Access your employment details, update your profile, and handle
                administrative tasks seamlessly
              </p>
              <button className="flex items-center bg-blue-600/80 mt-16 text-white p-1 gap-2 rounded-full">
                <p className="px-3 uppercase text-sm">Start</p>
                <span className="p-2 py-3 bg-blue-500/80 rounded-full">
                  <MoveUpRight height={15} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
