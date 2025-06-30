import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { CardContent, CardHeader } from "@mui/material";
axios.defaults.withCredentials = true;
export default function News() {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>News</CardTitle>
        </CardHeader>
        <CardContent>
          {news.map((item, index) => {
            return <News_card {...item} key={index} />;
          })}
        </CardContent>
      </Card>
      {/* <div className="bg-white h-full rounded-lg p-4 flex flex-col gap-4">
        <div className="top flex justify-between items-start">
          <h1 className="text-xl">News</h1>
          <p className="text-sm py-1 px-3 border-[.5px] border-blue-900 rounded-3xl">
            Views
          </p>
        </div>
        <div className="flex flex-col gap-4 overflow-y-scroll">
          {news.map((item, index) => {
            return <News_card {...item} key={index} />;
          })}
        </div>
      </div> */}
    </>
  );
}
const News_card = (props) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
        </CardHeader>
        <CardDescription>{props.date}</CardDescription>
      </Card>
      <div className="flex flex-col">
        <div className="flex flex-col gap-2 border-[.5px] rounded-lg p-2">
          <h3>{props.news}</h3>
          <div className="flex items-center text-sm text-zinc-400 gap-2">
            <div className=" flex items-center gap-2">
              <img src="/images/calendar.svg" alt="date" />
              <p>{props.date}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
