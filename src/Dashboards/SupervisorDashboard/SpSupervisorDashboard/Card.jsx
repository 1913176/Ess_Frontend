import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CounterCards from "@/components/CounterCards";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { User, User2 } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const Card = () => {
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  axios.defaults.withCredentials = true;
  const token = JSON.parse(sessionStorage.getItem("loginUser"));

  const fetchCardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${apiBaseUrl}/supervisor_dashboard/`);
      console.log(res.data);

      const transformedData = [
        {
          title: "Total Present Days",
          count: res.data.total_present_days || 0,
          percentage: "+10%",
          timeline: "Than Last Year",
        },
        // {
        //   title: "Total Absent Days",
        //   count: res.data.leave_balance.total_absent_days || 0,
        //   percentage: "+10%",
        //   timeline: "Than Last Year",
        // },
        // {
        //   title: "Leave Balance",
        //   count: res.data.leave_balance.total_leave_days || 0,
        //   percentage: "-10%",
        //   timeline: "Than Last Month",
        // },
        // {
        //   title: "Permission Hours",
        //   count: `${res.data.total_permission_hours || 0} hrs`,
        //   percentage: "+10%",
        //   timeline: "Than Last Year",
        // },
      ];

      setCardData(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch card data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const Total_present = {
    title: "Total Present Days",
    logo: <User2 />,
    count: cardData.total_present_days || 0,
  };
  const Total_absent_days = {
    title: "Total Absent Days",
    logo: <User2 />,
    count: cardData.leave_balance?.total_absent_days || 0,
  };
  const Total_leave_balance = {
    title: "Total Leave Balance",
    logo: <User2 />,
    count:
      cardData.leave_balance?.total_absent_days +
        cardData.leave_balance?.total_leave_days || 0,
  };

  const Total_Ticket_count = {
    title: "Total Tickets",
    logo: <User2 />,
    count: cardData.leave_balance?.total_absent_days || 0,
  };

  useEffect(() => {
    fetchCardData();
  }, []);

  // if (loading) {

  // if (error) {
  //   return (
  //     <div>
  //       <p>Error: {error}</p>
  //       <button onClick={fetchCardData}>Retry</button>
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      <CounterCards {...Total_present} />
      <CounterCards {...Total_absent_days} />
      <CounterCards {...Total_leave_balance} />
      <CounterCards {...Total_Ticket_count} />
    </div>
  );
};

export default Card;
