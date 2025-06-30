import React, { useEffect, useState } from "react";
import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

export default function RoleCreation() {
  const [RoleList, setRoleList] = useState([]);
  const [RoleId, setRoleId] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [roleData, setRoleData] = useState({ role_id: "", role_name: "" });

  // Fetch role list
  const fetchRoleList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/roles/list/`);
      setRoleList(data.roles || []);
    } catch (error) {
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchRoleList();
  }, []);

  // Handle Delete Role
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_role/${id}/`);
      toast.success("Role Deleted Successfully");
      fetchRoleList(); // Refresh after deletion
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  // Handle Add Role
  const handleAddRole = async () => {
    if (!roleData.role_id || !roleData.role_name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/create-role/`, roleData);
      toast.success("Role Added Successfully");
      setOpenAddDialog(false);
      setRoleData({ role_id: "", role_name: "" });
      fetchRoleList();
    } catch (error) {
      toast.error("Failed to add role");
    }
  };

  // Handle Update Role
  const handleUpdateRole = async () => {
    if (!roleData.role_id || !roleData.role_name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await axios.put(`${apiBaseUrl}/edit_role/${RoleId}/`, roleData);
      toast.success("Role Updated Successfully");
      setOpenUpdateDialog(false);
      setRoleData({ role_id: "", role_name: "" });
      fetchRoleList();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  // Open Update Dialog
  const handleOpenUpdate = (role) => {
    setRoleData({ role_id: role.role_id, role_name: role.role_name });
    setRoleId(role.id);
    setOpenUpdateDialog(true);
  };

  // DataGrid Columns
  const columns = [
    { field: "id", headerName: "No", width: 90 },
    { field: "role_id", headerName: "Role ID", width: 150 },
    { field: "role_name", headerName: "Role Name", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            color="primary"
            onClick={() => handleOpenUpdate(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    // <div className="w-full p-4">
    //   <div className="flex justify-between items-center mb-4">
    //     <h3 className="text-lg font-semibold">Role Management</h3>
    //     <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAddDialog(true)}>
    //       Add Role
    //     </Button>
    //   </div>

    //   <DataGrid
    //     rows={RoleList}
    //     columns={columns}
    //     pageSize={5}
    //     autoHeight
    //     disableSelectionOnClick
    //   />

    //   {/* Add Role Dialog */}
    //   <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
    //     <DialogTitle>Add Role</DialogTitle>
    //     <DialogContent>
    //       <TextField
    //         label="Role ID"
    //         fullWidth
    //         margin="dense"
    //         value={roleData.role_id}
    //         onChange={(e) => setRoleData({ ...roleData, role_id: e.target.value })}
    //       />
    //       <TextField
    //         label="Role Name"
    //         fullWidth
    //         margin="dense"
    //         value={roleData.role_name}
    //         onChange={(e) => setRoleData({ ...roleData, role_name: e.target.value })}
    //       />
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
    //       <Button onClick={handleAddRole} variant="contained">
    //         Add
    //       </Button>
    //     </DialogActions>
    //   </Dialog>

    //   {/* Update Role Dialog */}
    //   <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
    //     <DialogTitle>Update Role</DialogTitle>
    //     <DialogContent>
    //       <TextField
    //         label="Role ID"
    //         fullWidth
    //         margin="dense"
    //         value={roleData.role_id}
    //         onChange={(e) => setRoleData({ ...roleData, role_id: e.target.value })}
    //       />
    //       <TextField
    //         label="Role Name"
    //         fullWidth
    //         margin="dense"
    //         value={roleData.role_name}
    //         onChange={(e) => setRoleData({ ...roleData, role_name: e.target.value })}
    //       />
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
    //       <Button onClick={handleUpdateRole} variant="contained">
    //         Update
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    // </div>

    <>
      <div className="p-4 flex flex-col gap-4">
        <div className="header flex justify-between items-center">
          <h1>Role Managements</h1>
          <Button onClick={() => setOpenAddDialog(true)}>Add</Button>
        </div>
        <div className="border rounded-lg font-medium text-base">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Role Id</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RoleList.map((role, index) => (
                <TableRow key={role.id} className="font-medium text-base">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{role.role_id}</TableCell>
                  <TableCell>{role.role_name}</TableCell>
                  <TableCell>
                    <div className="flex">
                      <Edit2
                        className="h-6 cursor-pointer"
                        onClick={() => handleOpenUpdate(role)}
                      />
                      <Trash
                        className="h-6 cursor-pointer"
                        onClick={() => handleDelete(role.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Add Role Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Role ID"
            fullWidth
            margin="dense"
            value={roleData.role_id}
            onChange={(e) =>
              setRoleData({ ...roleData, role_id: e.target.value })
            }
          />
          <TextField
            label="Role Name"
            fullWidth
            margin="dense"
            value={roleData.role_name}
            onChange={(e) =>
              setRoleData({ ...roleData, role_name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRole} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* Update Role Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
      >
        <DialogTitle>Update Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Role ID"
            fullWidth
            margin="dense"
            value={roleData.role_id}
            onChange={(e) =>
              setRoleData({ ...roleData, role_id: e.target.value })
            }
          />
          <TextField
            label="Role Name"
            fullWidth
            margin="dense"
            value={roleData.role_name}
            onChange={(e) =>
              setRoleData({ ...roleData, role_name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
