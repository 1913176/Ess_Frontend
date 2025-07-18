const ReplayTicket = ({ setIsReplayOpen, SelectedTicketData }) => {
  const [replyText, setReplyText] = useState("");
  const [managersCache, setManagersCache] = useState("");
  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  //  const findManager = async (id) => {
  //    if (id === "null") {
  //     //  return null;
  //      console.log(id);

  //    } else {
  //      // setManagersCache(id)
  //      console.log(id);

  //    }
  //   //  if (managersCache[id]) {
  //     //  return managersCache[id]; // Use cached manager name
  //   //  }

  //   //  const res = await axios.get(`${baseApiUrl}/api/managers/${id}/`);
  //   //  const managerName = res.data.manager_name;
  //   //  setManagersCache((prev) => ({ ...prev, [id]: managerName })); // Cache manager name
  //   //  return managerName;
  //  };
  const handleReplySubmit = async () => {
    // if (!ticketId || !replyText) {
    //   toast.error("Please select a ticket and enter a reply.");
    //   return;
    // }

    try {
      const baseApiUrl = import.meta.env.VITE_BASE_API;
      const apiUrl = `${baseApiUrl}/tickets/add/`;
      const response = await axios.post(apiUrl, {
        ticketId,
        replyText,
      });

      if (response.status === 200) {
        toast.success("Reply added successfully!");
        setReplyText(""); // Clear the reply input after success
        setTicketId(null); // Reset ticket ID
      }
    } catch (error) {
      toast.error("Error adding reply. Please try again.");
      console.error("Error posting reply:", error);
    }
  };
  return (
    <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h6 className="font-bold text-xl mb-4">Reply Ticket</h6>
          {/* Ticket details (you can replace the static text with dynamic content) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p>
                <strong className="text-gray-700">Ticket ID:</strong>{" "}
                {SelectedTicketData.id || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Employee Name:</strong> Arun
              </p>
              <p>
                <strong className="text-gray-700">
                  Requested Ticket: {SelectedTicketData.title}{" "}
                </strong>
              </p>
              <p>
                <strong className="text-gray-700">
                  Requested Ticket:{" "}
                  {/* {SelectedTicketData.assigned_to || "null"} */}
                  {/* {SelectedTicketData.assigned_to === "null"
                    ? "null"
                    : findManager(SelectedTicketData.assigned_to)} */}
                  {SelectedTicketData.assigned_to}
                </strong>
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Created On:</strong> Nov 22,
                2024
              </p>
              <p>
                <strong className="text-gray-700">Last Updated:</strong> Nov 25,
                2024
              </p>
            </div>
          </div>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-md mb-4"
            rows="4"
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Please enter a reply"
          />
          <div className="flex justify-end space-x-4">
            <button
              className="bg-gray-400 text-white py-2 px-6 rounded-md"
              onClick={() => {
                setReplyText(""), setIsReplayOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white py-2 px-6 rounded-md"
              onClick={handleReplySubmit}
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
HrTickets.jsx

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TaskChart = ({ activeTab }) => {
  // Sample data
  const data = [
    { name: "Jan", value: 60 },
    { name: "Feb", value: 80 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 50 },
    { name: "May", value: 60 },
    { name: "Jun", value: 90 },
    { name: "Jul", value: 80 },
    { name: "Aug", value: 100 },
    { name: "Sep", value: 70 },
    { name: "Oct", value: 60 },
    { name: "Nov", value: 80 },
    { name: "Dec", value: 90 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#352CFD" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#352CFD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#352CFD"
            strokeWidth={2}
            fill="url(#colorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskChart;