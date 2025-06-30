import React from "react";

const Card2 = () => {
  return (
    <div>
      <div className="border border-slate-300 bg-slate-200 rounded-xl mt-14 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center p-2 gap-2">
            <img src=".\task img\_Dot (1).png" alt="" />
            <p className="font-bold text-xl leading-6">Review</p>
            <p className="text-gray-500 font-bold text-xl">(8)</p>
          </div>
          <img src="\task img\Button Icon.png" alt="" className="p-2" />
        </div>

        {/* for card 1 */}
        <div className="p-2">
          <div className="bg-white rounded-lg p-3 ">
            <span className="p-1 text-green-400 font-semibold text-sm px-2 bg-green-100 rounded-full leading-4">
              Important
            </span>
            <p className="p-1 mt-3 text-lg font-semibold leading-5">
              Machine Learning Progress
            </p>
            <div className="flex justify-between mt-2">
              <p className="p-1 leadind-5 font-medium text-sm text-gray-400">
                progress
              </p>
              <p className="font-bold leading-5 text-sm">52%</p>
            </div>
            <img
              className="mt-1"
              src=".\task img\Progress Bar Container.png"
              alt=""
            />

            <div>
              <div className="flex justify-between mt-3 items-center ">
                <img src=".\task img\Avatar Group.png" alt="" />
                <img src=".\task img\ChatTeardropDots.png" alt="" />
                <p className="font-semibold text-base leading-7">11</p>
                <img src=".\task img\CheckCircle.png" alt="" />
                <p className="font-semibold text-base leading-7">187</p>
              </div>
            </div>
          </div>
        </div>
        {/* card 2 */}
        <div className="p-2">
          <div className="bg-white rounded-lg p-3">
            <span className="p-1 text-green-400 font-semibold text-sm px-2 leading-4 bg-green-100 rounded-full">
              important
            </span>
            <p className="p-1 mt-3 text-lg font-semibold leading-5">
              Machine learning progress
            </p>
            <div className="flex justify-between mt-2">
              <p className="leadind-5 font-medium text-sm text-gray-400">
                progress
              </p>
              <p className="font-bold leading-5 text-sm">52%</p>
            </div>

            <img
              className="p-1"
              src=".\task img\Progress Bar Container.png"
              alt=""
            />

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
        {/* for card 3 */}
        <div className="p-2">
          <div className="bg-white rounded-lg p-3">
            <span className="p-1 text-green-400 px-2 font-semibold text-sm leading-4 bg-green-100 rounded-full">
              important
            </span>
            <p className="p-1 mt-3 text-lg font-semibold leading-5">
              Machine Learning Progress
            </p>
            <div className="flex justify-between mt-2">
              <p className="p-1 leadind-5 font-medium text-sm text-gray-400">
                progress
              </p>
              <p className="font-bold leading-5 text-sm">52%</p>
            </div>
            <img
              className="p-1"
              src=".\task img\Progress Bar Container.png"
              alt=""
            />

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

export default Card2;
