import React from "react";
// import { Helmet } from "react-helmet";
// import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import WeOffer from "./WeOffer";

const Landing = () => {
  return (
    <div className="mx-auto min-h-dvh h-full w-full">
      {/* <LandingNavbar /> */}
      <HeroSection />
      <WeOffer />
    </div>
  );
};

export default Landing;
