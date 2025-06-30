import axios from "axios";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import { DataGrid } from "@mui/x-data-grid";
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
// } from "@mui/material";
// import { Delete, Edit } from "@mui/icons-material";
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
import { Input } from "@/components/ui/input";
const apiBaseUrl = process.env.VITE_BASE_API;

const Shift = () => {
  const [ShiftList, setShiftList] = useState([]);
  const [ShiftId, setShiftId] = useState(null);
  const [addShiftPopup, setAddShiftPopup] = useState(false);
  const [updateShiftPopup, setUpdateShiftPopup] = useState(false);
  const [shiftData, setShiftData] = useState({
    shift_number: "",
    shift_start_time: "",
    shift_end_time: "",
  });

  // Fetch shifts from API
  const fetchShiftList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
      setShiftList(data);
    } catch (error) {
      console.error("Failed to fetch shifts", error);
    }
  };

  // Auto-refresh shift list every 5 seconds
  useEffect(() => {
    fetchShiftList(); // Initial fetch
    const interval = setInterval(fetchShiftList, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/shifts/delete/${id}/`);
      toast.success("Shift Deleted Successfully");
      fetchShiftList();
    } catch (error) {
      toast.error("Failed to Delete Shift");
      console.error(error);
    }
  };

  const handleUpdate = (id) => {
    const shift = ShiftList.find((s) => s.id === id);
    setShiftData(shift);
    setShiftId(id);
    setUpdateShiftPopup(true);
  };

  const handleAddShift = () => {
    setShiftData({
      shift_number: "",
      shift_start_time: "",
      shift_end_time: "",
    });
    setAddShiftPopup(true);
  };

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    try {
      if (isUpdate) {
        await axios.put(`${apiBaseUrl}/admin/shifts/${ShiftId}/`, shiftData);
        toast.success("Shift Updated Successfully");
      } else {
        await axios.post(`${apiBaseUrl}/admin/shifts/`, shiftData);
        toast.success("Shift Added Successfully");
      }
      setAddShiftPopup(false);
      setUpdateShiftPopup(false);
      fetchShiftList(); // Refresh immediately
    } catch (error) {
      toast.error(`Failed to ${isUpdate ? "Update" : "Add"} Shift`);
      console.error(error);
    }
  };

  const columns = [
    { field: "id", headerName: "No", width: 90 },
    { field: "shift_number", headerName: "Shift ID", width: 150 },
    { field: "shift_start_time", headerName: "Shift Start", width: 180 },
    { field: "shift_end_time", headerName: "Shift End", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Edit />}
            onClick={() => handleUpdate(params.row.id)}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<Delete />}
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="location w-full h-full p-4 flex flex-col gap-4">
      <div className="location-Header flex w-full justify-between items-center">
        <h3 className="text-h3">Shift</h3>
        <Button color="primary" startIcon={<Plus />} onClick={handleAddShift}>
          Add Shift
        </Button>
      </div>

      <div className="w-full h-full border rounded-md bg-background">
        <Table className="text-base font-normal">
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Shift Id</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ShiftList.map((shift, index) => (
              <TableRow key={shift.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{shift.shift_number}</TableCell>
                <TableCell>{shift.shift_start_time}</TableCell>
                <TableCell>{shift.shift_end_time}</TableCell>
                <TableCell>
                  <div className="flex gap-4">
                    <Button onClick={() => handleUpdate(shift.id)}>Edit</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(shift.id)}
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
      {/* <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={ShiftList}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div> */}

      {/* Add Shift Dialog */}
      <Dialog open={addShiftPopup} setOpen={setAddShiftPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Shift Number"
            value={shiftData.shift_number}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_number: e.target.value })
            }
          />
          <Input
            type="time"
            placeholder="Shift Start Time"
            value={shiftData.shift_start_time}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_start_time: e.target.value })
            }
          />
          <Input
            type="time"
            placeholder="Shift End Time"
            value={shiftData.shift_end_time}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_end_time: e.target.value })
            }
          />
          <DialogFooter>
            <DialogClose>
              <Button
                variant="secondary"
                onClick={() => setAddShiftPopup(false)}
                color="secondary"
              >
                Cancel
              </Button>
              <Button onClick={(e) => handleSubmit(e, false)} color="primary">
                Add
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Shift Dialog */}
      <Dialog
        open={updateShiftPopup}
        // onClose={() => setUpdateShiftPopup(false)}>
        setOpen={setUpdateShiftPopup}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shift</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Shift Number"
            value={shiftData.shift_number}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_number: e.target.value })
            }
          />
          <Input
            type="time"
            placeholder="Shift Start Time"
            value={shiftData.shift_start_time}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_start_time: e.target.value })
            }
          />
          <Input
            type="time"
            placeholder="Shift End Time"
            value={shiftData.shift_end_time}
            onChange={(e) =>
              setShiftData({ ...shiftData, shift_end_time: e.target.value })
            }
          />
          <DialogFooter>
            <DialogClose>
              <Button
                variant="secondary"
                onClick={() => setUpdateShiftPopup(false)}
                color="secondary"
              >
                Cancel
              </Button>
              <Button onClick={(e) => handleSubmit(e, true)} color="primary">
                Update
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shift;
