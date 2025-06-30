import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddCertificate from "./AddCertificate";
import UpdateCertificate from "./UpdateCertificate";

const apiBaseUrl = process.env.VITE_BASE_API;

const Certificate = () => {
  const [certificateList, setCertificateList] = useState([]);
  const [enrollList, setEnrollList] = useState([]);
  const [addCertificatePopup, setAddCertificatePopup] = useState(false);
  const [updateCertificatePopup, setUpdateCertificatePopup] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Fetch the review list from the API
  const fetchCertificateList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/certificates/`);
      setCertificateList(
        data.map((certificate) => ({
          id: certificate.id,
          certification_name: certificate.certification_name, // Extract manager_name
          participation: certificate.participation,
          certification_date: certificate.certification_date,
          certification_file: certificate.certification_file,
        })),
      );
    } catch (error) {
      console.error("Error fetching certificate list:", error);
    }
  };

  // Fetch the manager list from the API
  const fetchEnrollList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/training_progress/`);
      setEnrollList(data);
    } catch (error) {
      console.error("Error fetching enroll list:", error);
    }
  };

  useEffect(() => {
    fetchCertificateList();
    fetchEnrollList();
  }, []);

  // Handle editing a review
  const handleEdit = (row) => {
    setSelectedCertificate(row);
    setUpdateCertificatePopup(true);
  };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_certificate/${row.id}/`);
      toast.success(`Manager goal ID ${row.id} deleted successfully.`);
      fetchCertificateList();
    } catch (error) {
      toast.error("Failed to delete certificate.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "certification_name",
      headerName: "Certificatin Name",
      width: 200,
    },
    { field: "participation", headerName: "Participation", width: 200 },
    { field: "certification_date", headerName: "Certificate Date", width: 150 },
    { field: "certification_file", headerName: "Certificate File", width: 150 },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => handleEdit(params.row)}
          >
            <Edit />
          </button>
          <button
            className="btn-danger"
            onClick={() => handleDelete(params.row)}
          >
            <Trash2Icon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="h-full min-h-screen p-6 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Certificate List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddCertificatePopup(true)}
          >
            <UserPlus size={20} />
            Add Certificate
          </button>
        </div>

        <DataGrid
          className="z-10"
          rows={certificateList}
          columns={columns}
          getRowId={(row) => row.id} // Ensure unique ID is used
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 6,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        />

        {/* Add Manager Review Modal */}
        {addCertificatePopup && (
          <AddCertificate
            setAddCertificatePopup={setAddCertificatePopup}
            EnrollList={enrollList}
            fetchCertificateList={fetchCertificateList}
          />
        )}

        {/* Update Manager Review Modal */}
        {updateCertificatePopup && selectedCertificate && (
          <UpdateCertificate
            setUpdateCertificatePopup={setUpdateCertificatePopup}
            certificateId={selectedCertificate.id} // Pass reviewId explicitly
            EnrollList={enrollList}
            fetchCertificateList={fetchCertificateList}
          />
        )}
      </div>
    </>
  );
};

export default Certificate;
