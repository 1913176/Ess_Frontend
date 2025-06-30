import React, { useState } from "react";

const Content = () => {
  const [tabledata, settabledata] = useState([
    {
      id: 1,
      name: "",
      date: "",
      action: "",
    },
  ]);

  return (
    <div>
      {/* content start */}
      <p>Certificate</p>
      <div className="p-2">
        <table className="w-full border border-gray-300 p-2">
          <thead className="border-b border-gray-300 p-2">
            <td className="p-2">Certificate Name</td>
            <td className="p-2">Certificate Date</td>
            <td className="p-2">Action</td>
          </thead>
          <tbody>
            {tabledata.length > 0 ? (
              tabledata.map((cert) => (
                <tr key={cert.id}>
                  <td className="p-2">{cert.name}</td>
                  <td className="p-2">{cert.date}</td>
                  <td className="p-2">{cert.action} </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-2 text-center text-gray-500">
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* content start */}
    </div>
  );
};

export default Content;
