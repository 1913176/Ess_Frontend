import React from "react";

const Card = () => {
  return (
    <div>
      <p className="p-3 font-medium text-2xl leading-7">Assigned task</p>

      <div className="border border-slate-300 h-full rounded-xl bg-slate-200 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center p-2 gap-2 ">
            <img src="" alt="" />
            <p className="font-bold text-xl leading-6">Assigned Task</p>
            <p className="text-gray-500 font-bold text-xl">(8)</p>
          </div>
          <img src="\task img\Button Icon.png" alt="" className="p-2" />
        </div>

        {/* card */}

        <div className="p-2">
          <div className="bg-white rounded-lg p-3">
            <span className="text-green-400 p-1 bg-green-100 font-semibold text-sm px-2 rounded-lg leading-4 ">
              Important
            </span>
            <p className="p-1 mt-3 text-lg font-semibold leading-5">
              Machine Learning Progress
            </p>
            <div className="flex justify-between mt-2">
              <p className="leadind-5 font-medium text-sm text-gray-400 p-1">
                progress
              </p>
              <p className="font-bold leading-5 text-sm">52%</p>
            </div>
            <img className="mt-1" src="" alt="" />

            <div>
              <div className="flex justify-between mt-3 items-center">
                <img src=".\task img\Avatar Group.png" alt="" />
                <img src=".\task img\ChatTeardropDots.png" alt="" />
                <p className="font-semibold text-base leading-7">11</p>
                <img src=".\task img\CheckCircle.png" alt="" />
                <p className="font-semibold text-base leading-7">187</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Card;
