import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateHRManager = ({
  open,
  setOpen,
  hrId,
  ShiftList,
  DepartmentList,
  fetchHrList,
}) => {
  const [HrData, setHrData] = useState({
    hr_name: "",
    email: "",
    gender: "",
    dob: "",
    hr_image: null,
    hr_id: "",
    username: "",
    plain_password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [LocationList, setLocationList] = useState([]);

  const streamOptions = [
    "Process",
    "Onboarding",
    "Manager Management",
    "Employee Management",
    "Supervisor Management",
    "Leave Management",
    "Attendance",
    "Shift",
    "Offers",
    "Help Desk",
    "Tickets",
    "Manager Performance",
    "Employee Performance",
    "Manpower Planning",
    "Payroll",
    "Performance",
    "Recruitment",
    "Onboarding1",
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  // Fetch locations when component mounts
  useEffect(() => {
  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/admin/overall-location/`
      );
      setLocationList(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    }
  };
  fetchLocations();
}, []);


  useEffect(() => {
    const fetchHrData = async () => {
      if (!hrId) return;

      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/get-hrs/${hrId}/`);

        // Parse streams if it's a string
        let streams = {};
        if (data.streams) {
          console.log(data.streams, "Data streams");
          if (typeof data.streams === "string") {
            try {
              streams = JSON.parse(data.streams);
            } catch (parseError) {
              console.error("Error parsing streams:", parseError);
              streams = {};
            }
          } else {
            streams = data.streams;
          }
        }

        setHrData({
          hr_name: data.hr_name || "",
          email: data.email || "",
          gender: data.gender || "",
          dob: data.dob || "",
          hr_image: null,
          hr_id: data.hr_id || "",
          username: data.username || "",
          plain_password: data.plain_password || "",
          department: data.department || "",
          shift: data.shift || "",
          hired_date: data.hired_date || "",
          streams: streams,
          location: data.location || "",
        });
      } catch (err) {
        console.error("Error fetching HR data:", err);
        toast.error("Failed to load HR data.");
      }
    };

    fetchHrData();
  }, [hrId]);

  const handleStreamChange = (stream) => {
    setHrData((prev) => {
      const newStreams = { ...prev.streams };
      if (newStreams[stream]) {
        delete newStreams[stream];
      } else {
        newStreams[stream] = [];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const handleSubComponentChange = (stream, subComponent) => {
    setHrData((prev) => {
      const newStreams = { ...prev.streams };
      const currentSubComponents = newStreams[stream] || [];
      if (currentSubComponents.includes(subComponent)) {
        newStreams[stream] = currentSubComponents.filter(
          (sc) => sc !== subComponent,
        );
      } else {
        newStreams[stream] = [...currentSubComponents, subComponent];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]*$/.test(HrData.hr_name))
      newErrors.hr_name = "Name should only contain alphabets and spaces";

    if (!/^[A-Za-z\s]*$/.test(HrData.username))
      newErrors.username = "Username should only contain alphabets and spaces";

    const today = new Date().toISOString().split("T")[0];
    if (HrData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (HrData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (HrData.plain_password && HrData.plain_password.length < 8)
      newErrors.plain_password = "Password must be at least 8 characters";

    if (!HrData.location) newErrors.location = "Please select a location";

    if (Object.keys(HrData.streams).length === 0) {
      newErrors.streams = "Please select at least one stream";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Show specific error messages
      if (errors.streams) toast.error(errors.streams);
      if (errors.location) toast.error(errors.location);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(HrData).forEach(([key, value]) => {
      if (key === "hr_image" && !value) return;
      if (key === "hr_id") return;
      if (key === "password" && value === "") return;

      if (key === "streams") {
        formData.append("streams", JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.put(`${apiBaseUrl}/admin/hrs/${hrId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("HR updated successfully");
      fetchHrList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({
          username: Array.isArray(err.username)
            ? err.username[0]
            : err.username,
        });
      } else if (err?.email) {
        setErrors({
          email: Array.isArray(err.email) ? err.email[0] : err.email,
        });
      } else if (err?.plain_password) {
        setErrors({
          plain_password: Array.isArray(err.plain_password)
            ? err.plain_password[0]
            : err.plain_password,
        });
      } else if (err?.streams) {
        setErrors({ streams: err.streams });
      } else if (err?.location) {
        setErrors({ location: err.location });
      } else {
        toast.error("Failed to update HR.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Update HR
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={handleSubmit}>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.hr_name}
                      onChange={(e) =>
                        setHrData({ ...HrData, hr_name: e.target.value })
                      }
                    />
                    {errors.hr_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.hr_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="col-span-2">
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.email}
                      onChange={(e) =>
                        setHrData({ ...HrData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={HrData.gender}
                    onChange={(e) =>
                      setHrData({ ...HrData, gender: e.target.value })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Stream Section */}
                <div className="grid grid-cols-3 items-start gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Stream
                  </label>
                  <div className="col-span-2 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {streamOptions.map((stream) => (
                      <div key={stream} className="mb-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!HrData.streams[stream]}
                            onChange={() => handleStreamChange(stream)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {stream}
                          </span>
                        </label>
                        {HrData.streams[stream] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label
                                key={subComponent}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={HrData.streams[stream]?.includes(
                                    subComponent,
                                  )}
                                  onChange={() =>
                                    handleSubComponentChange(
                                      stream,
                                      subComponent,
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-600">
                                  {subComponent}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {errors.streams && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.streams}
                      </p>
                    )}
                  </div>
                </div>

                {/* DOB */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.dob}
                      onChange={(e) =>
                        setHrData({ ...HrData, dob: e.target.value })
                      }
                    />
                    {errors.dob && (
                      <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    onChange={(e) =>
                      setHrData({ ...HrData, hr_image: e.target.files[0] })
                    }
                  />
                </div>

                {/* HR ID */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 col-span-2"
                    value={HrData.hr_id}
                    disabled
                  />
                </div>

                {/* Username */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.username}
                      onChange={(e) =>
                        setHrData({ ...HrData, username: e.target.value })
                      }
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="col-span-2 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      value={HrData.plain_password}
                      onChange={(e) =>
                        setHrData({ ...HrData, plain_password: e.target.value })
                      }
                      placeholder="Enter new password (optional)"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                    {errors.plain_password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.plain_password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="col-span-2">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.location}
                      onChange={(e) =>
                        setHrData({ ...HrData, location: e.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Location
                      </option>
                      {LocationList.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={HrData.department}
                    onChange={(e) =>
                      setHrData({ ...HrData, department: e.target.value })
                    }
                  >
                    <option value="">Select Department</option>
                    {DepartmentList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shift */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={HrData.shift}
                    onChange={(e) =>
                      setHrData({ ...HrData, shift: e.target.value })
                    }
                  >
                    <option value="">Select Shift</option>
                    {ShiftList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shift_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hired Date */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Hired Date
                  </label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HrData.hired_date}
                      onChange={(e) =>
                        setHrData({ ...HrData, hired_date: e.target.value })
                      }
                    />
                    {errors.hired_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.hired_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateHRManager;