import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar } from "lucide-react";
// import calendarIcon from "./../../../assets/Images/calendar (2).png";
const apiBaseUrl = process.env.VITE_BASE_API;
const News = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");

  // Fetch news data from backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/news/view/`);
        setNews(response.data); // Set news data
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news h-full bg-white p-4 min-w-[350px] shadow-md rounded-lg">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between gap-10">
          <p className="font-semibold text-base">News</p>
          <p className="font-medium text-base cursor-pointer">View All</p>
        </div>

        {error && <div className="text-red-500 text-center">{error}</div>}

        {news.length > 0 ? (
          news.map((item) => (
            <div key={item.id} className="p-5 border border-white-100">
              <p className="font-semibold text-base">{item.title}</p>
              <div className="flex gap-4">
                {/* <img src={calendarIcon} alt="Calendar Icon" /> */}
                <Calendar />
                <p className="font-normal text-base text-gray-500">
                  {new Date(item.date).toLocaleDateString()} {item.author}
                </p>
              </div>
            </div>
          ))
        ) : !error ? (
          <p className="text-center text-gray-500">No news available.</p>
        ) : null}
      </div>
    </div>
  );
};

export default News;
