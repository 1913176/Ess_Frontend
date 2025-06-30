import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HrProgram = ({ setisprogrampopup }) => {
  const [programs, setPrograms] = useState([]);
  const baseApiUrl = import.meta.env.VITE_BASE_API;

  useEffect(() => {
    fetch(`${baseApiUrl}/training_programs/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched training programs:", data);
        setPrograms(data);
      })
      .catch((error) =>
        console.error("Error fetching training programs:", error),
      );
  }, []);

  return (
    <div>
      {/* content start */}
      <div className="p-2 ms-2 rounded-lg">
        <div
          className="d-flex justify-content-between"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p className="p-2 font-semibold text-lg leading-6">
            Training Program
          </p>
          <Link
            className="p-1 bg-blue-400 font-medium text-white border border-gray-300 rounded-lg text-center py-2"
            to="/training"
          >
            Create Program
          </Link>
        </div>
        <table className="border border-gray-300 rounded-lg p-2">
          <thead className="font-medium text-base border-b border-gray-300">
            <tr>
              <th className="w-[150px] p-2">ID</th>
              <th className="w-[150px] p-2">Name</th>
              <th className="w-[150px] p-2">Start Date</th>
              <th className="w-[150px] p-2">End Date</th>
              <th className="w-[150px] p-2">Training Incharge</th>
              <th className="w-[150px] p-2">To Manager</th>
              <th className="w-[150px] p-2">To Employees</th>
              <th className="w-[150px] p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {programs.length > 0 ? (
              programs.map((program) => (
                <tr key={program.id}>
                  <td className="w-[150px] p-2">{program.id}</td>
                  <td className="w-[150px] p-2">{program.name}</td>
                  <td className="w-[150px] p-2">{program.start_date}</td>
                  <td className="w-[150px] p-2">{program.end_date}</td>
                  <td className="w-[150px] p-2">{program.training_incharge}</td>
                  <td className="w-[150px] p-2">
                    {program.to_manager ? "True" : "False"}
                  </td>
                  <td className="w-[150px] p-2">
                    {program.to_employees ? "True" : "False"}
                  </td>
                  <td className="flex flex-col d-flex p-2 gap-2">
                    <button
                      onClick={() => setisprogrampopup((prev) => !prev)}
                      className="bg-yellow-400 px-2 rounded-lg py-1 w-[80px] text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setisprogrampopup((prev) => !prev)}
                      className="bg-red-800 rounded-lg text-white px-2 py-1 w-[80px] text-center"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-2">
                  No training programs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button
          onClick={() => setisprogrampopup((prev) => !prev)}
          className="px-2 py-1 bg-blue-400 font-medium text-base mt-2 border border-gray-300 rounded-lg text-center w-[80px]"
        >
          Close
        </button>
      </div>
      {/* content end */}
    </div>
  );
};

export default HrProgram;
