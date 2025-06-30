import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_BASE_API || process.env.VITE_BASE_API;

export default function Department() {
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [updateDepartmentOpen, setUpdateDepartmentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch Department List
  const fetchDepartmentList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/admin/overall-departments/`,
      );
      setDepartmentList(data);
    } catch (error) {
      toast.error("Failed to Fetch Departments");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/departments/delete/${id}/`);
      toast.success("Department Deleted Successfully");
      fetchDepartmentList();
    } catch (error) {
      toast.error("Failed to Delete Department");
      console.error(error);
    }
  };

  const handleUpdate = (id) => {
    setUpdateDepartmentOpen(true);
    setDepartmentId(id);
  };

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  // Pagination logic
  const paginatedData = departmentList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const totalPages = Math.ceil(departmentList.length / rowsPerPage);

  return (
    <div className="w-full p-4 flex flex-col gap-4 relative">
      <div className="flex w-full justify-between items-center">
        <h3 className="">Department</h3>
        <Button
          onClick={() => setAddDepartmentOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="rounded-md border">
        <Table className="text-base font-normal">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Department ID</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.id}</TableCell>
                  <TableCell>{department.department_id}</TableCell>
                  <TableCell>{department.department_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate(department.id)}
                        className="flex items-center gap-1"
                      >
                        <Pencil className="h-4 w-4" /> Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No departments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AddDepartment
        open={addDepartmentOpen}
        setOpen={setAddDepartmentOpen}
        fetchDepartmentList={fetchDepartmentList}
      />

      <UpdateDepartment
        open={updateDepartmentOpen}
        setOpen={setUpdateDepartmentOpen}
        departmentId={departmentId}
        fetchDepartmentList={fetchDepartmentList}
      />
    </div>
  );
}

// Add Department Form
const AddDepartment = ({ open, setOpen, fetchDepartmentList }) => {
  const [department_id, setDepartment_id] = useState("");
  const [department_name, setDepartment_name] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBaseUrl}/admin/departments/`, {
        department_id,
        department_name,
      });
      setOpen(false);
      fetchDepartmentList();
      toast.success("Department Added Successfully");
      // Reset form
      setDepartment_id("");
      setDepartment_name("");
    } catch (error) {
      toast.error("Failed to Add Department");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="department_id">Department ID</Label>
            <Input
              id="department_id"
              placeholder="Enter department ID"
              value={department_id}
              onChange={(e) => setDepartment_id(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department_name">Department Name</Label>
            <Input
              id="department_name"
              placeholder="Enter department name"
              value={department_name}
              onChange={(e) => setDepartment_name(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Update Department Form
const UpdateDepartment = ({
  open,
  setOpen,
  departmentId,
  fetchDepartmentList,
}) => {
  const [department_id, setDepartment_id] = useState("");
  const [department_name, setDepartment_name] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (departmentId && open) {
      // Fetch the department details when the dialog opens
      const fetchDepartmentDetails = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${apiBaseUrl}/admin/get-departments/${departmentId}/`,
          );
          const departmentData = response.data.data;
          setDepartment_id(departmentData.department_id);
          setDepartment_name(departmentData.department_name);
        } catch (error) {
          toast.error("Failed to Fetch Department Data");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchDepartmentDetails();
    }
  }, [departmentId, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      department_id: department_id,
      department_name: department_name,
    };

    try {
      await axios.put(`${apiBaseUrl}/admin/departments/${departmentId}/`, data);
      setOpen(false);
      fetchDepartmentList();
      toast.success("Department Updated Successfully");
    } catch (error) {
      toast.error("Failed to Update Department");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="update_department_id">Department ID</Label>
            <Input
              id="update_department_id"
              placeholder="Enter department ID"
              value={department_id}
              onChange={(e) => setDepartment_id(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="update_department_name">Department Name</Label>
            <Input
              id="update_department_name"
              placeholder="Enter department name"
              value={department_name}
              onChange={(e) => setDepartment_name(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Update Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
