import axios from "axios";

//const apiBaseUrl = "https://ess-backend-fg6m.onrender.com";

const apiBaseUrl = import.meta.env.VITE_BASE_API;

axios.defaults.withCredentials = true;
//---------------------- Auth Credentials start ----------------------
export const CommonLogin = async (payload) => {
  const response = await axios.post(`${apiBaseUrl}/common_login/`, payload);
  return response.data;
};
export const UserDetails = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/details/`);
  return response.data;
};

export async function CheckedInUsers() {
  const res = await axios.get(`${apiBaseUrl}/api/checked-in-users/`);
  return res.data;
}
//---------------------- Auth Credentials end ----------------------

// -------------------------project start-------------------------
export const GetProjects_status = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const managerId = userData?.manager_id;
  if (!managerId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/manager-projects/${managerId}/`);

  // FIX: Return only the array part
  return res.data.projects || [];
};


export const GetProjects = async () => {
  const res = await axios.get(`${apiBaseUrl}/projects/`);
  return await res.data;
};


// -------------------------project end-------------------------

// -------------------------project start-----------------------
export const GetAllTeams = async () => {
  const res = await axios.get(`${apiBaseUrl}/teams/`);
  return await res.data;
};
// -------------------------project end-------------------------

// --------------Ticket List -----------------

export const GetManagerTicketList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const managerId = userData?.manager_id;
  if (!managerId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/tickets/list/${managerId}/`);
  return res.data || [];
};

export const GetSupervisorTicketList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const supervisorId = userData?.supervisor_id;
  if (!supervisorId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/tickets/supervisor_list/${supervisorId}/`);
  return res.data || [];
};

export const GetHRTicketList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const hrId = userData?.hr_id;
  if (!hrId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/tickets/hr_list/${hrId}/`);
  return res.data || [];
};

export const GetEmployeeTicketList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const employeeId = userData?.employee_id;
  if (!employeeId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/tickets/employee_list/${employeeId}/`);
  return res.data || [];
};

//----- not used 
export const GetAdminTicketList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const adminId = userData?.user_id;
  if (!adminId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/admin/tickets/${adminId}/`);
  return res.data || [];
};

//---------------------Ticket Request List-----------------------------------

export const GetAdminTicketRequestList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const adminId = userData?.user_id; 
  if (!adminId) {
    return [];
  }
  const res = await axios.get(`${apiBaseUrl}/api/admin/tickets/${adminId}/`, {
    headers: {
      Accept: "application/json",
    },
  });
  return res.data?.length ? res.data : [];
};

export const GetHRTicketRequestList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const hrId = userData?.hr_id; 
  if (!hrId) {
    return [];
  }
  try {
    const res = await axios.get(`${apiBaseUrl}/api/hr/tickets/${hrId}/`, {
      headers: {
        Accept: "application/json",
      },
    });
    return res.data?.length ? res.data : [];
  } catch (error) {
    console.error("Error fetching HR tickets:", error);
    return [];
  }
};

export const GetSupervisorTicketRequestList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const supervisorId = userData?.supervisor_id; 
  if (!supervisorId) {
    return [];
  }
  try {
    const res = await axios.get(`${apiBaseUrl}/api/supervisor/tickets/${supervisorId}/`, {
      headers: {
        Accept: "application/json",
      },
    });
    return res.data?.length ? res.data : [];
  } catch (error) {
    console.error("Error fetching Supervisor tickets:", error);
    return [];
  }
};

export const GetEmployeeTicketRequestList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const employeeId = userData?.employee_id;
  if (!employeeId) {
    return [];
  }
  try {
    const res = await axios.get(`${apiBaseUrl}/api/employee/tickets/${employeeId}/`, {
      headers: {
        Accept: "application/json",
      },
    });
    return res.data?.length ? res.data : [];
  } catch (error) {
    console.error("Error fetching Employee tickets:", error);
    return [];
  }
};
export const GetManagerTicketRequestList = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const managerId = userData?.manager_id; 
  if (!managerId) {
    console.warn("No manager ID found in localStorage");
    return [];
  }
  try {
    const res = await axios.get(`${apiBaseUrl}/api/manager/tickets/${managerId}/`, {
      headers: {
        Accept: "application/json",
      },
    });
    return res.data?.length ? res.data : [];
  } catch (error) {
    console.error("Error fetching Manager tickets:", error);
    return [];
  }
};


// -------------------------Manager Task start-------------------------
export const GetEachManagerTask = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const managerId = userData?.manager_id;
  if (!managerId) {
    return [];
  }

  const res = await axios.get(`${apiBaseUrl}/manager-tasks/${managerId}/`);
  return res.data.tasks || [];
};


export async function GetManagerTask() {
  const response = await axios.get(`${apiBaseUrl}/get-task/`);
  return response.data;
}
// -------------------------Manager Task end-------------------------

// -------------------------Employee Task start-------------------------

export const GetEachEmployeeTask = async () => {
  const userData = JSON.parse(sessionStorage.getItem("userdata"));
  const managerId = userData?.manager_id;

  if (!managerId) {
    return [];
  }

  const res = await axios.get(`${apiBaseUrl}/employee-tasks/${managerId}/`);
  return res.data.tasks || [];
};





export async function GetEmployeeTasks() {
  const response = await axios.get(`${apiBaseUrl}/get_employeetasks/`);
  return await response.data;
}
// -------------------------Employee Task end-------------------------

// -------------------------news start-------------------------
export async function GetNews() {
  const response = await axios.get(`${apiBaseUrl}/news/view/`);
  return response.data;
}
// -------------------------news end-------------------------

// -------------------------location start-------------------------
export async function GetLocation() {
  const response = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
  return response.data;
}
// -------------------------location end-------------------------

// -------------------------Manager Start-------------------------

// Get All Managers
export async function GetAllManagers() {
  const res = await axios.get(`${apiBaseUrl}/api/manager_list/`);
  return res.data;
}

// Get Single Manager || manager Details
export async function GetManager(managerId) {
  const res = await axios.get(`${apiBaseUrl}/api/managers/get/${managerId}/`);
  return res.data;
}

// Add Manager
export async function AddManager(data) {
  const res = await axios.post(`${apiBaseUrl}/api/manager/add/`, data, {
    Headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Update Manager || Edit Manager
export async function UpdateManager({ managerId, data }) {
  const res = await axios.put(
    `${apiBaseUrl}/admin/managers/${managerId}/`,
    data,
    {
      Headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}

// Delete Manager
export async function DeleteManager(managerId) {
  const res = await axios.delete(
    `${apiBaseUrl}/admin/managers/delete/${managerId}/`,
  );
  return res.data;
}

// -------------------------Manager end-------------------------

// -------------------------Employee Start-------------------------

// Get All Employees
export async function GetAllEmployees() {
  const res = await axios.get(`${apiBaseUrl}/api/employee_list/`);
  return res.data;
}

// Get Single Employee Details by ID
export async function GetEmployee(employeeId) {
  const res = await axios.get(`${apiBaseUrl}/api/employees/get/${employeeId}/`);
  return res.data;
}

// Add Employee (Admin Route)
export async function AddEmployee(data) {
  const res = await axios.post(`${apiBaseUrl}/admin/employees/add/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Update Employee (Admin Route)
export async function UpdateEmployee({ employeeId, data }) {
  const res = await axios.put(
    `${apiBaseUrl}/admin/employees/${employeeId}/`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

// Delete Employee (Admin Route)
export async function DeleteEmployee(employeeId) {
  const res = await axios.delete(
    `${apiBaseUrl}/admin/employees/delete/${employeeId}/`
  );
  return res.data;
}

// -------------------------Employee End-------------------------

// -------------- HR Start ---------------------------------


export async function GetAllHRs() {
  const res = await axios.get(`${apiBaseUrl}/api/hr_list/`);
  return res.data;
}
 
export async function GetHR(hrId) {
  const res = await axios.get(`${apiBaseUrl}/api/hrs/get/${hrId}/`);
  return res.data;
}
 
export async function AddHR(data) {
  const res = await axios.post(`${apiBaseUrl}/admin/hrs/add/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
 
export async function UpdateHR({ hrId, data }) {
  const res = await axios.put(
    `${apiBaseUrl}/admin/hrs/${hrId}/`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}
 
export async function DeleteHR(hrId) {
  const res = await axios.delete(`${apiBaseUrl}/admin/hrs/delete/${hrId}/`);
  return res.data;
}

// -----------HR END--------------------------------------

// -------------------------Supervisor Start-------------------------

// Get All Supervisors
export async function GetAllSupervisors() {
  const res = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
  return res.data;
}
// Get Single Supervisor
export async function GetSupervisor(supervisorId) {
  const res = await axios.get(`${apiBaseUrl}/api/supervisors/get/${supervisorId}/`);
  return res.data;
}

// Add Supervisor
export async function AddSupervisor(data) {
  const res = await axios.post(`${apiBaseUrl}/admin/supervisor/add/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Update Supervisor
export async function UpdateSupervisor({ supervisorId, data }) {
  const res = await axios.put(`${apiBaseUrl}/admin/supervisor/${supervisorId}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Delete Supervisor
export async function DeleteSupervisor(supervisorId) {
  const res = await axios.delete(`${apiBaseUrl}/admin/supervisor/delete/${supervisorId}/`);
  return res.data;
}

// -------------------------Supervisor End-------------------------