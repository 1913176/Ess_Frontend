// import React from "react";
// import CalendarIcon from './../../../assets/Images/calendar (3).png';

const Main = () => {
  return (
    <div className="w-full p-3">
      <p className="mt-2 font-medium text-2xl leading-7">Leave</p>

      <div className="border border-gray-300 rounded-lg p-5 mt-3 bg-white w-full">
        <p className="p-4 font-medium text-2xl leading-7">Leave Request</p>

        <div className="border border-gray-300 rounded-xl p-4">
          <p className="p-2 font-medium text-lg leading-6">Start date</p>
          <div className="flex justify-around border border-gray-300 rounded-lg ">
            <p className="font-medium text-lg p-1 leading-6">01/June/2024 </p>
            <img src={CalendarIcon} alt="" className="w-[20px] h-[20px] mt-2" />
          </div>

          {/* 1st & 2nd half */}

          <div className="ms-36">
            <div className="flex border border-gray-300 rounded-lg mt-5 ">
              <div className="flex gap-52 items-center">
                <div className="p-1">
                  <p className="bg-blue-800 text-white px-10 py-1  rounded-lg font-semibold text-base leading-5">
                    1st Half
                  </p>
                </div>
                <p className="font-normal text-base leading-5">2nd Half</p>
              </div>
            </div>
          </div>
        </div>

        {/* end */}
        <div className="px-24">
          <p className="bg-gray-200 rounded-lg text-center p-1 mt-3 font-medium text-lg leading-6">
            3 Days
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 mt-8">
          <p className="p-2 font-medium text-lg leading-6">End Date</p>

          <div className="border border-gray-300 rounded-lg flex justify-around items-center">
            <p className="font-medium text-lg p-1 leading-6"> 03/June/2024</p>
            <img src={CalendarIcon} alt="" className="w-[20px] h-[20px]" />
          </div>

          {/* 1st ,2nd half */}

          <div className="pl-32">
            <div className="flex border border-gray-300 rounded-lg mt-5">
              <div className="flex gap-56 items-center">
                <div className="p-1">
                  <p className="bg-blue-800 text-white rounded-lg px-10 leading-5 py-1 font-semibold text-base">
                    {" "}
                    1st half{" "}
                  </p>
                </div>
                <p className="font-normal text-base leading-5">2nd Half</p>
              </div>
            </div>
          </div>
        </div>

        {/* end */}
        <div className="pl-5">
          <p className="mt-5 bg-gray-200 w-[100px] rounded-xl p-1 text-center font-semibold leading-6">
            proof.doc x
          </p>
        </div>

        <p className="text-blue-800 mt-1 pl-6 font-semibold text-lg leading-6">
          Upload proof
        </p>
        <p className="p-4 font-medium text-2xl leading-7">Note</p>

        <div className="border border-gray-300 rounded-lg p-4">
          <p className=" pb-16 text-gray-300 font-medium text-sm">
            please enter a note about time off
          </p>
        </div>

        <p className="mt-3 text-2xl font-medium leading-7">Notify</p>

        {/* footer */}

        <p className="mt-4 text-gray-300 text-xs font-medium">
          Note:These employee will be notified through email when your leave
          request is approved.
        </p>

        <div className="flex justify-center gap-5 mt-6">
          <span className="bg-gray-200 p-2 rounded-lg font-medium text-lg leading-6">
            cancel
          </span>
          <span className="bg-blue-800 rounded-lg p-2 text-white font-medium text-lg leading-6">
            Request Leave
          </span>
        </div>
      </div>
    </div>
  );
};

export default Main;
