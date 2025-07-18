// import React from 'react';
// import daysIcon from './../../../assets/Images/Days.png';
// import letIcon from "./../../../assets/Images/Lets-icons_order (1).png";


const Main1 = () => {
  return (
    <div className="w-full p-3">
      <div className="mt-11">
        <div className="border border-gray-300 rounded-xl p-2 bg-gray-100 h-full">
          <div className="bg-white p-2 rounded-lg">
            <div className="flex items-center justify-around p-2 border-b border-gray-300">
              <p>June 2024</p>
              <p>&lt; &gt;</p>
            </div>

            <table className="w-full">
              <thead>
                <tr>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    SUN
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    MON
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    TUE
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    WED
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    THU
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    FRI{" "}
                  </td>
                  <td className="text-center p-5 font-normal text-gray-400 text-lg leading-3">
                    SAT
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <div className="ms-8 ">
                    <img src={daysIcon} alt="" className="pt-5 pl-2  font-medium text-lg leading-7" />
                  </div>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    2
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    3
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    4
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    5
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    6
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    7
                  </td>
                </tr>

                {/* 2rd row */}

                <tr>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    8
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    9
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    10
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    11
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    12
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    13
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    14
                  </td>
                </tr>

                {/* 3th row */}

                <tr>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    15
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    16
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    17
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    18
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    19
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    20
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    21
                  </td>
                </tr>

                {/* 4th row */}

                <tr>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    22
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    23
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    24
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    25
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    26
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    27
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    28
                  </td>
                </tr>

                {/* 5th row */}

                <tr>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    29
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    30
                  </td>
                  <td className="text-center p-5 font-medium text-lg leading-7">
                    31
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* border  */}
        </div>

        {/* for bal leavel */}

        <div className="border border-gray-300 bg-white rounded-lg w-full p-2 mt-3">
          <div className="gap-4 p-3 flex flex-col">
            <p className="text-2xl font-medium leading-7 mt-1">Leave Balance</p>

            <div className="border border-gray-300 rounded-lg p-4 mt-1">
              <div className="flex justify-between">
                <p className="text-lg font-semibold leading-5">Casual Leave</p>
                <img src={letIcon} alt="" />
              </div>
              <p className="font-bold text-2xl pl-5 leading-10">8</p>
            </div>

            {/* 2nd border */}

            <div className="border border-gray-300 rounded-lg p-4 mt-2">
              <div className="flex justify-between">
                <p className="text-lg font-semibold leading-5">
                  previlliged leave
                </p>
                <img src={letIcon} alt="" />
              </div>
              <p className="font-bold text-2xl pl-5">5</p>
            </div>

            {/* 3rd border */}

            <div className="border border-gray-300 rounded-lg p-4 mt-2">
              <div className="flex justify-between">
                <p className="text-lg font-semibold leading-5">sick leave</p>
                <img src={letIcon} alt="" />
              </div>
              <p className="font-bold text-2xl pl-5">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main1
