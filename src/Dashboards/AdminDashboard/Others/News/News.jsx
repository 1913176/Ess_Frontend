import axios from "axios";
import { Edit2, Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const apiBaseUrl = process.env.VITE_BASE_API;

export default function News() {
  const [NewsList, setNewsList] = useState([]);
  const [NewsId, setNewsId] = useState("");
  const [addNewsPopup, setAddNewsPopup] = useState(false);
  const [updateNewsPopup, setUpdateNewsPopup] = useState(false);

  // Fetch News List
  const fetchNewsList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/news/view/`);
    setNewsList(data);
    console.log(data);
  };

  const HandleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/news/delete_news/${id}/`,
      );
      toast.success("News Deleted Successfully");
      fetchNewsList();
      console.log(response);
    } catch (error) {
      toast.error("Failed to Delete News");
      console.error(error);
    }
  };

  const HandleUpdate = (id) => {
    setUpdateNewsPopup(true);
    setNewsId(id);
  };

  useEffect(() => {
    fetchNewsList();
  }, []);

  return (
    <>
      <div className="location w-full p-4 flex flex-col gap-4 relative">
        <div className="location-Header flex w-full justify-between items-center">
          <h3 className="text-h3">News</h3>
          <Button
            className="primary-btn flex items-center gap-2 px-4"
            onClick={() => setAddNewsPopup((prev) => !prev)}
          >
            <Plus height={15} />
            News
          </Button>
        </div>
        <NewsTable
          NewsList={NewsList}
          HandleDelete={HandleDelete}
          HandleUpdate={HandleUpdate}
        />

        {addNewsPopup && (
          <AddNews
            setAddNewsPopup={setAddNewsPopup}
            fetchNewsList={fetchNewsList}
          />
        )}

        {updateNewsPopup && (
          <UpdateNews
            NewsId={NewsId}
            setUpdateNewsPopup={setUpdateNewsPopup}
            fetchNewsList={fetchNewsList}
          />
        )}
      </div>
    </>
  );
}

// NewsTable Component using MUI DataGrid
const NewsTable = ({ NewsList, HandleDelete, HandleUpdate }) => {
  // Columns definition for DataGrid
  const columns = [
    { field: "id", headerName: "NO", width: 100 },
    { field: "title", headerName: "Title", width: 250 },
    { field: "content", headerName: "Content", width: 350 },
    { field: "created_date", headerName: "Created Date", width: 200 },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2 justify-start items-center h-full w-full">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => HandleDelete(params.row.id)}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => HandleUpdate(params.row.id)}
          >
            Update
          </Button>
        </div>
      ),
    },
  ];

  // Data for DataGrid, needs to be in the format of an array of objects with 'id' property
  const rows = NewsList.map((news) => ({
    id: news.id,
    title: news.title,
    content: news.content,
    created_date: news.created_date,
  }));

  return (
    // <div className="bg-white/50" style={{ height: "100dvh", width: "100%" }}>
    //   <DataGrid
    //     rows={rows}
    //     columns={columns}
    //     pageSize={5}
    //     rowsPerPageOptions={[5]}
    //     disableSelectionOnClick
    //     checkboxSelection
    //   />
    // </div>
    <div className="border rounded-xl">
      <Table className="text-base font-normal">
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {NewsList.map((news, index) => (
            <TableRow>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{news.title}</TableCell>
              <TableCell>{news.content}</TableCell>
              <TableCell>{news.created_date}</TableCell>
              <TableCell>
                <div className="flex">
                  <Edit2
                    className="h-6 cursor-pointer"
                    onClick={() => HandleUpdate(news.id)}
                  />
                  <Trash
                    className="h-6 cursor-pointer"
                    onClick={() => HandleDelete(news.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// AddNews Component (Add News popup)
const AddNews = ({ setAddNewsPopup, fetchNewsList }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const HandleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: title,
      content: content,
    };
    console.log(data);
    try {
      const response = await axios.post(`${apiBaseUrl}/news/send/`, data);
      setAddNewsPopup(false);
      fetchNewsList();
      toast.success("News Added Successfully");

      console.log(response);
    } catch (error) {
      toast.error("Failed to Add News");
      console.error(error);
    }
  };

  return (
    <>
      <div
        className={
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50"
        }
      >
        <form>
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
            <h1 className="text-2xl font-semibold mb-6">Send News</h1>
            <div className="grid gap-6">
              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Title</label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Content</label>
                <input
                  type="text"
                  id="content"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="btn-primary w-full"
                  type="submit"
                  onClick={HandleSubmit}
                >
                  Send News
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

// UpdateNews Component (Update News popup)
const UpdateNews = ({ NewsId, setUpdateNewsPopup, fetchNewsList }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  console.log(NewsId);

  const HandleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: title,
      content: content,
    };
    console.log(data);
    try {
      const response = await axios.put(
        `${apiBaseUrl}/news/update_news/${NewsId}/`,
        data,
      );

      setUpdateNewsPopup(false);
      fetchNewsList();
      toast.success("News Updated Successfully");

      console.log(response);
    } catch (error) {
      toast.error("Failed to Update News");
      console.error(error);
    }
  };

  return (
    <>
      <div
        className={
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50"
        }
      >
        <form>
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
            <h1 className="text-2xl font-semibold mb-6">Update News</h1>
            <div className="grid gap-6">
              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Title</label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Content</label>
                <input
                  type="text"
                  id="content"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="btn-primary w-full"
                  type="submit"
                  onClick={HandleSubmit}
                >
                  Update News
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
