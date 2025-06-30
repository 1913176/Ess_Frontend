import axios from "axios";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
const apiBaseUrl = process.env.VITE_BASE_API;

export default function Location() {
  const [LocationList, setLocationList] = useState([]);
  const [LocationId, setLocationId] = useState("");
  const [addLocationPopup, setAddLocationPopup] = useState(false);
  const [updateLocationPopup, setUpdateLocationPopup] = useState(false);

  // Fetch Location List
  const fetchLocationList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
      setLocationList(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const HandleDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/locations/delete/${id}/`);
      toast.success("Location Deleted Successfully");
      fetchLocationList();
    } catch (error) {
      toast.error("Failed to Delete Location");
      console.error(error);
    }
  };

  const HandleUpdate = (id) => {
    setLocationId(id);
    setUpdateLocationPopup(true);
  };

  useEffect(() => {
    fetchLocationList();
  }, []);

  return (
    <div className="location w-full p-4 flex flex-col gap-4 relative">
      <div className="location-Header flex w-full justify-between items-center">
        <h3 className="text-h3">Location</h3>
        <Button
          className="primary-btn"
          onClick={() => setAddLocationPopup(true)}
        >
          <Plus height={15} />
          Add Location
        </Button>
      </div>
      {/* <div className="bg-white/50" style={{ height: "100dvh", width: "100%" }}>
        <DataGrid rows={LocationList} columns={columns} pageSize={5} />
      </div> */}
      <div className="border rounded-md bg-background h-full">
        <Table className="table-auto text-base font-normal">
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Location ID</TableHead>
              <TableHead>Location Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LocationList.map((location, index) => (
              <TableRow key={location.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{location.location_id}</TableCell>
                <TableCell>{location.location_name}</TableCell>
                <TableCell>
                  <div className="flex gap-4">
                    <Button onClick={() => HandleUpdate(location.id)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => HandleDelete(location.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {addLocationPopup && (
        <AddLocation
          open={addLocationPopup}
          setOpen={setAddLocationPopup}
          setAddLocationPopup={setAddLocationPopup}
          fetchLocationList={fetchLocationList}
        />
      )}
      {updateLocationPopup && (
        <UpdateLocation
          open={updateLocationPopup}
          LocationId={LocationId}
          setOpen={setUpdateLocationPopup}
          fetchLocationList={fetchLocationList}
        />
      )}
    </div>
  );
}

const AddLocation = ({ open, setOpen, fetchLocationList }) => {
  const [location_id, setLocation_id] = useState("");
  const [location_name, setLocation_name] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    // Location Name validation (Only alphabets allowed)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!location_name.trim()) {
      newErrors.location_name = "Location Name is required";
    } else if (!nameRegex.test(location_name)) {
      newErrors.location_name = "Only alphabets are allowed";
    }

    if (!location_id.trim()) {
      newErrors.location_id = "Location ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = { location_id, location_name };

    try {
      await axios.post(`${apiBaseUrl}/admin/locations/`, data);
      setOpen(false);
      fetchLocationList();
      toast.success("Location Added Successfully");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          location_id: "Location ID already exists",
        }));
      } else {
        toast.error("Failed to Add Location");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={HandleSubmit}>
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4">
            <h1 className="text-2xl font-semibold mb-6">Add Location</h1>

            <div className="grid gap-6">
              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Location ID</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.location_id ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                  placeholder="Location ID"
                  value={location_id}
                  onChange={(e) => setLocation_id(e.target.value)}
                />
                {errors.location_id && (
                  <p className="text-red-500 text-xs">{errors.location_id}</p>
                )}
              </div>

              <div className="grid grid-cols-3 items-center gap-6">
                <label className="text-sm">Location Name</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.location_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                  placeholder="Location Name"
                  value={location_name}
                  onChange={(e) => setLocation_name(e.target.value)}
                />
                {errors.location_name && (
                  <p className="text-red-500 text-xs">{errors.location_name}</p>
                )}
              </div>
              <DialogFooter>
                <div className="flex gap-20">
                  <DialogClose>
                    <Button
                      className="secondary-btn-sm"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button className="primary-btn" type="submit">
                    Add Location
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UpdateLocation = ({
  open,
  setOpen,
  LocationId,
  // setUpdateLocationPopup,
  fetchLocationList,
}) => {
  const [location_id, setLocation_id] = useState("");
  const [location_name, setLocation_name] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch location details using LocationId
    const fetchLocationDetails = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/admin/show-location/${LocationId}/`,
        );
        setLocation_id(response.data.location_id);
        setLocation_name(response.data.location_name);
      } catch (error) {
        console.error("Error fetching location details:", error);
        toast.error("Failed to fetch location details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [LocationId]);

  const validateForm = () => {
    let newErrors = {};

    // Ensure location name is not empty and contains only letters
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!location_name.trim()) {
      newErrors.location_name = "Location Name is required.";
    } else if (!nameRegex.test(location_name)) {
      newErrors.location_name = "Only alphabets are allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = { location_id, location_name };

    try {
      await axios.put(`${apiBaseUrl}/admin/locations/${LocationId}/`, data);
      setOpen(false);
      fetchLocationList();
      toast.success("Location Updated Successfully.");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update location.");
    }
  };

  // if (loading) {
  //   return (
  //     <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
  //       <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
  //         <h1 className="text-2xl font-semibold mb-6">Update Location</h1>
  //         <p className="text-center text-gray-600">
  //           Loading location details...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={HandleSubmit}>
          <div className="grid gap-6">
            {/* Editable Location ID Field */}
            <div className="grid grid-cols-3 items-center gap-6">
              <label className="text-sm">Location ID</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                value={location_id}
                onChange={(e) => setLocation_id(e.target.value)}
              />
            </div>

            {/* Editable Location Name Field */}
            <div className="grid grid-cols-3 items-center gap-6">
              <label className="text-sm">Location Name</label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-md border ${
                  errors.location_name ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                placeholder="Location Name"
                value={location_name}
                onChange={(e) => setLocation_name(e.target.value)}
              />
              {errors.location_name && (
                <p className="text-red-500 text-xs">{errors.location_name}</p>
              )}
            </div>

            <DialogFooter>
              <div className="flex gap-30">
                <Button className="primary-btn" type="submit">
                  Update Location
                </Button>
                <DialogClose>
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
