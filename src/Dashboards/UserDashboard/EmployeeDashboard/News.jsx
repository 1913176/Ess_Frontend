import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiCalendar } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const News = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/news/view/`);
        setAnnouncements(response.data);
      } catch (err) {
        setError("Failed to fetch announcements.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return "";
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
        {!loading && !error && announcements.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {announcements.length} {announcements.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
        {/* Adjusted space between entries to space-y-25 to match top and bottom gaps */}
        <div className="space-y-25 relative">
          {loading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex">
                <div className="flex items-start mr-4 relative">
                  {/* Date on left */}
                  <div className="text-xs text-gray-500 mr-2 mt-[5px] w-[30px]">
                    <Skeleton width={30} height={12} />
                  </div>
                  {/* Calendar icon with individual vertical line below */}
                  <div className="flex flex-col items-center relative">
                    <div className="z-10 bg-white p-2 rounded-full border-2 border-gray-300">
                      <FiCalendar className="text-gray-400 text-lg" />
                    </div>
                    {/* Individual thick black vertical line (4px) below icon */}
                    {index < 4 && ( // Don't show line for the last skeleton
                      <div className="absolute top-[40px] h-[20px] w-[4px] bg-black left-1/2 transform -translate-x-1/2"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <Skeleton width={120} height={16} className="mb-2" />
                  <Skeleton width="100%" height={14} count={2} />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center flex flex-col items-center">
              <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No announcements available
            </div>
          ) : (
            announcements.map((item, index) => (
              <div key={item.id} className="flex group hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="flex items-start mr-4 relative">
                  {/* Date on left */}
                  <div className="text-xs text-gray-500 mr-2 mt-[5px] w-[30px] group-hover:text-blue-600 transition-colors">
                    {formatDate(item.created_date)}
                  </div>
                  {/* Calendar icon with individual vertical line below */}
                  <div className="flex flex-col items-center relative">
                    <div className="z-10 bg-white p-2 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors">
                      <FiCalendar className="text-gray-400 text-lg group-hover:text-blue-500 transition-colors" />
                    </div>
                    {/* Individual thick black vertical line (4px) below icon */}
                    {index < announcements.length - 1 && ( // Don't show line for the last announcement
                      <div className="absolute top-[40px] h-[20px] w-[4px] bg-black left-1/2 transform -translate-x-1/2"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {truncateText(item.content)}
                  </p>
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Read more
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default News;