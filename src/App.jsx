import { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// Authentication imports
import Login from "./Authentication/Login.jsx";
import ForgetPassword from "./Authentication/ForgetPassword.jsx";
import ResetPassword from "./Authentication/ResetPassword.jsx";

// landing imports
const Landing = lazy(() => import("./Landing/Landing.jsx"));
// import Landing from "./Landing/Landing.jsx";

// Admin Dashboards imports
import AdminHome from "./Dashboards/AdminDashboard/AdminHome";
import AdminHelpDesk from "./Dashboards/AdminDashboard/AdminHelpDesk/AdminHelpDesk.jsx";
import AdminDashboard from "./Dashboards/AdminDashboard/AdminDashboard";
import ManagerManagementLayout from "./Dashboards/AdminDashboard/ManagePage/ManagerManagementLayout";
import ManagerAttendance from "./Dashboards/AdminDashboard/ManagePage/ManagerAttendance";
import ManagerAttendanceReset from "./Dashboards/AdminDashboard/ManagePage/ManagerAttendanceReset";
import ManagerChart from "./Dashboards/AdminDashboard/ManagePage/ManagerChart";
import ManagerList from "./Dashboards/AdminDashboard/ManagePage/ManagerList";
import ManagerLeavePolicies from "./Dashboards/AdminDashboard/ManagePage/ManagerLeavePolicies";
import ManagerLeave from "./Dashboards/AdminDashboard/ManagePage/ManagerLeave";
import ManagerPerformanceLayout from "./Dashboards/AdminDashboard/ManagerPerformancePage/ManagerPerformanceLoyout";
import ManagerPerformanceRivewList from "./Dashboards/AdminDashboard/ManagerPerformancePage/ManagerPerformanceReviewList";
import ManagerGoal from "./Dashboards/AdminDashboard/ManagerPerformancePage/ManagerGoal";
import ManagerFeedback from "./Dashboards/AdminDashboard/ManagerPerformancePage/ManagerFeedback";
import ManagerLateLoginReason from "./Dashboards/AdminDashboard/ManagePage/ManagerLateLoginReason";

import EmployeePerformanceLayout from "./Dashboards/AdminDashboard/EmployeePerformancePage/EmployeePerformanceLayout";
import EmployeePerformanceRivewList from "./Dashboards/AdminDashboard/EmployeePerformancePage/EmployeePerformanceReviewList";
import EmployeeGoal from "./Dashboards/AdminDashboard/EmployeePerformancePage/EmployeeGoal";
import EmployeeFeedback from "./Dashboards/AdminDashboard/EmployeePerformancePage/EmployeeFeedback";

import TrainingProgramLayout from "./Dashboards/AdminDashboard/ProgramPage/TrainingProgramLayout";
import Program from "./Dashboards/AdminDashboard/ProgramPage/Program";
import Enroll from "./Dashboards/AdminDashboard/ProgramPage/Enroll";
import Certificate from "./Dashboards/AdminDashboard/ProgramPage/Certificate";

import SupervisorManagementLayout from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorManagementLayout";
import SupervisorList from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorList";
import SupervisorLateLoginReason from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorLateLoginReason";

import SupervisorAttendance from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorAttendance";
import SupervisorAttendanceReset from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorAttendanceReset";
import SupervisorChart from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorChart";

// import SupervisorLeaveManagementLayout from "./Dashboards/AdminDashboard/SupervisorLeaveManage/SupervisorLeaveManagementLayout";
import SupervisorLeave from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorLeave";
import SupervisorLeavePolicies from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorLeavePolicies";

// import SupervisorPayrollManagementLayout from "./Dashboards/AdminDashboard/SupervisorPayrollManage/SupervisorPayrollManagementLayout";
import SupervisorSalary from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorSalary";
import SupervisorPayroll from "./Dashboards/AdminDashboard/SupervisorPage/SupervisorPayroll";

import EmployeeManagementLayout from "./Dashboards/AdminDashboard/EmployeePage/EmployeeManagementLayout";
import EmployeeList from "./Dashboards/AdminDashboard/EmployeePage/EmployeeList";
import EmployeeAttendance from "./Dashboards/AdminDashboard/EmployeePage/EmployeeAttendance";
import EmployeeAttendanceReset from "./Dashboards/AdminDashboard/EmployeePage/EmployeeAttendanceReset";
import EmployeeChart from "./Dashboards/AdminDashboard/EmployeePage/EmployeeChart";
import Department from "./Dashboards/AdminDashboard/Others/DepartmentPage/Department.jsx";
import News from "./Dashboards/AdminDashboard/Others/News/News.jsx";
import ProjectPage from "./Dashboards/AdminDashboard/ProjectManagement/ProjectPage/ProjectPage.jsx";
import Salary from "./Dashboards/AdminDashboard/EmployeePage/Salary";
import ManagerSalary from "./Dashboards/AdminDashboard/ManagePage/ManagerSalary";
import EmpLeave from "./Dashboards/AdminDashboard/EmployeePage/EmpLeave";
// import ManagerLeave from "./Dashboards/AdminDashboard/ManagerLeaveStatus/ManagerLeave";
import EmpLeavePolicies from "./Dashboards/AdminDashboard/EmployeePage/EmpLeavePolicies";
// import ManagerLeavePolicies from "./Dashboards/AdminDashboard/ManagerLeavePolicies/ManagerLeavePolicies";
import EmpPayroll from "./Dashboards/AdminDashboard/EmployeePage/EmpPayroll";
import ManagerPayroll from "./Dashboards/AdminDashboard/ManagePage/ManagerPayroll";
import ProjectReportPage from "./Dashboards/AdminDashboard/ProjectManagement/ProjectPage/ProjectReportPage.jsx";
import TeamCreationPage from "./Dashboards/AdminDashboard/ProjectManagement/TeamCreationPage/TeamCreationPage.jsx";
import TaskAssignmentPage from "./Dashboards/AdminDashboard/ProjectManagement/TaskAssignmentPage/TaskAssignmentPage.jsx";
import Feedback from "./Dashboards/AdminDashboard/AdminFeedBack/Feedback";
import RoleCreation from "./Dashboards/AdminDashboard/Others/RoleCreationPage/RoleCreation.jsx";
import Schedule from "./Dashboards/AdminDashboard/Others/RoleCreationPage/Schedule.jsx";
import Job from "./Dashboards/AdminDashboard/Others/RoleCreationPage/Job.jsx";
import CalendarEvent from "./Dashboards/AdminDashboard/Others/RoleCreationPage/CalendarEvent.jsx";
import Location from "./Dashboards/AdminDashboard/Others/LocationPage/Location.jsx";
import Shift from "./Dashboards/AdminDashboard/Others/ShiftPage/Shift.jsx";

import HRLayout from "./Dashboards/HrDashboard/HRLayout.jsx";
import HRManagementLayout from "./Dashboards/AdminDashboard/HRManagement/HRManagementLayout";
import ManagerHRAttendance from "./Dashboards/AdminDashboard/HRManagement/ManagerHRAttendance";
import ManagerHRAttendanceReset from "./Dashboards/AdminDashboard/HRManagement/ManagerHRAttendanceReset";
import ManagerHRChart from "./Dashboards/AdminDashboard/HRManagement/ManagerHRChart";
import ManagerHRList from "./Dashboards/AdminDashboard/HRManagement/ManagerHRList";
import ManagerHRLeave from "./Dashboards/AdminDashboard/HRManagement/ManagerHRLeave";
import ManagerHRLeavePolicies from "./Dashboards/AdminDashboard/HRManagement/ManagerHRLeavePolicies";
import ManagerHRSalary from "./Dashboards/AdminDashboard/HRManagement/ManagerHRSalary";
import ManagerHRPayroll from "./Dashboards/AdminDashboard/HRManagement/ManagerHRPayroll";
import ManagerHRLateLoginReason from "./Dashboards/AdminDashboard/HRManagement/ManagerHRLateLoginReason.jsx";


//AR Dashboards imports
import ARManagementLayout from "./Dashboards/AdminDashboard/ARManagement/ARManagementLayout";
import ManagerARAttendance from "./Dashboards/AdminDashboard/ARManagement/ManagerARAttendance";
import ManagerARAttendanceReset from "./Dashboards/AdminDashboard/ARManagement/ManagerARAttendanceReset";
import ManagerARChart from "./Dashboards/AdminDashboard/ARManagement/ManagerARChart";
import ManagerARList from "./Dashboards/AdminDashboard/ARManagement/ManagerARList";
import ManagerARLeave from "./Dashboards/AdminDashboard/ARManagement/ManagerARLeave";
import ManagerARLeavePolicies from "./Dashboards/AdminDashboard/ARManagement/ManagerARLeavePolicies";
import ManagerARSalary from "./Dashboards/AdminDashboard/ARManagement/ManagerARSalary";
import ManagerARPayroll from "./Dashboards/AdminDashboard/ARManagement/ManagerARPayroll";



//Account Dashboards imports


import AccountManagementLayout from "./Dashboards/AdminDashboard/AccountManagement/AccountManagementLayout";
import AccountManagementClientDash from "./Dashboards/AdminDashboard/AccountManagement/AccountClientDashboard.jsx";
import AccountManagementEmployeeDash from "./Dashboards/AdminDashboard/AccountManagement/AccountEmployeeDashboard.jsx";
// import AccountInvoices from "./Dashboards/AdminDashboard/AccountManagement/AccountInvoices.jsx";
import AccountReports from "./Dashboards/AdminDashboard/AccountManagement/AccountReports.jsx";
// import AccountBillings from "./Dashboards/AdminDashboard/AccountManagement/AccountBillings.jsx";

//employee dashboards imports

import EmployeeAccountManagementLayout from "./Dashboards/EmployeeDashboard/AccountManagement/AccountManagementLayout";
import EmployeeAccountManagementClientDash from "./Dashboards/EmployeeDashboard/AccountManagement/AccountClientDashboard.jsx";
//  import EmployeeAccountManagementEmployeeDash from "./Dashboards/EmployeeDashboard/AccountManagement/AccountEmployeeDashboard.jsx";
// import AccountInvoices from "./Dashboards/AdminDashboard/AccountManagement/AccountInvoices.jsx";
import EmployeeAccountReports from "./Dashboards/EmployeeDashboard/AccountManagement/AccountReports.jsx";
// import AccountBillings from "./Dashboards/AdminDashboard/AccountManagement/AccountBillings.jsx";



// Manager Dashboards imports
import ManagerDashboard from "./Dashboards/ManagerDashboard/ManagerDashboard.jsx";
import ManagerHelpDesk from "./Dashboards/ManagerDashboard/ManagerHelpDesk/ManagerHelpDesk.jsx";
import ManagerHome from "./Dashboards/ManagerDashboard/ManagerHome/MangerHome.jsx";
import ProjectManagement from "./Dashboards/ManagerDashboard/ProjectManagement/ProjectManagement.jsx";
import ProjectProcess from "./Dashboards/ManagerDashboard/ProjectProcess/ProjectProcess.jsx";
import ProjectTeamMember from "./Dashboards/ManagerDashboard/ProjectTeamMembers/ProjectTeamMember.jsx";
import EmployeeLeaveManagement from "./Dashboards/ManagerDashboard/EmployeeAttendanceManagement/EmployeeAttendanceManagementLayout.jsx";
import ManagerTaskManagement from "./Dashboards/ManagerDashboard/ManagerTaskManagement/ManagerTaskManagement.jsx";
import EmployeeTaskManagement from "./Dashboards/ManagerDashboard/EmployeeTaskManagement/EmployeeTaskManagement.jsx";
import ManagerProfile from "./Dashboards/ManagerDashboard/ManagerProfile/Content.jsx";
import ManagerKpiLayout from "./Dashboards/ManagerDashboard/KpiAndFeedBack/ManagerKpiLayout.jsx";
import ManagerPerformance from "./Dashboards/ManagerDashboard/KpiAndFeedBack/ManagerPerformance.jsx";
import ManagerGoals from "./Dashboards/ManagerDashboard/KpiAndFeedBack/ManagerGoals.jsx";
import MEmployeePerformance from "./Dashboards/ManagerDashboard/KpiAndFeedBack/MEmployeePerformance.jsx";
import MEmployeeGoal from "./Dashboards/ManagerDashboard/KpiAndFeedBack/MEmployeeGoal.jsx";
import MEmployeeFeedback from "./Dashboards/ManagerDashboard/KpiAndFeedBack/MEmployeeFeedback.jsx";
import ManagerPerformanceChart from "./Dashboards/ManagerDashboard/KpiAndFeedBack/ManagerPerformanceChart.jsx";
import ManagerTrainingCertification from "./Dashboards/ManagerDashboard/KpiAndFeedBack/ManagerTrainingCertification.jsx";
import ManagerAttendanceLayout from "./Dashboards/ManagerDashboard/ManagerAttandanceManagement/ManagerAttandanceLayout.jsx";
import ManagerLeaveManagement from "./Dashboards/ManagerDashboard/ManagerAttandanceManagement/LeaveManagement/ManagerLeaveManagement.jsx";
import ManagerAttendanceManagement from "./Dashboards/ManagerDashboard/ManagerAttandanceManagement/AttandanceManagement/ManagerAttendanceManagement.jsx";
import EmployeeAttendanceManagement from "./Dashboards/ManagerDashboard/EmployeeAttendanceManagement/EmployeeAttendance/EmployeeAttendanceManagement.jsx";
import EmployeePermissionHours from "./Dashboards/ManagerDashboard/EmployeeAttendanceManagement/EmployeePermissonHours/EmployeePermissionHours.jsx";
import MEmployeeLeaveManagement from "./Dashboards/ManagerDashboard/EmployeeAttendanceManagement/LeaveManagement/MEmployeeLeaveManagement.jsx";

// HR Dashboards imports
import HrDashboard from "./Dashboards/HrDashboard/HRDashboard/HrDashboard.jsx";
// import HRprocess from "./Dashboards/HrDashboard/HrProcess/HRprocess.jsx";
import HRonboarding from "./Dashboards/HrDashboard/HrOnboarding/HRonboarding.jsx";
import HrEmployees from "./Dashboards/HrDashboard/HrEmployees/HrEmployees.jsx";
// import HrAttendance from "./Dashboards/HrDashboard/HrAttendance/HrAttendance.jsx";
import HrShift from "./Dashboards/HrDashboard/HrShift/HrShift.jsx";
import HrOffers from "./Dashboards/HrDashboard/HrOffers/HrOffers.jsx";
import HrHelpDesk from "./Dashboards/HrDashboard/HrHelpDesk/HrHelpDesk.jsx";
import HrPayRoll from "./Dashboards/HrDashboard/HrPayroll/HrPayRoll.jsx";
import HrTickets from "./Dashboards/HrDashboard/HrTickets/HrTickets.jsx";
import HrManagerPerformanceLayout from "./Dashboards/HrDashboard/ManagerPerformancePage/HrManagerPerformanceLayout.jsx";
import HrEmployeePerformanceLayout from "./Dashboards/HrDashboard/EmployeePerformancePage/HrEmployeePerformanceLayout.jsx";
// import HrManagerChart from "./Dashboards/HrDashboard/HrAttendance/HrManagerChart.jsx";
// import HrEmployeeChart from "./Dashboards/HrDashboard/HrAttendance/HrEmployeeChart.jsx";
import Kpi_Layout from "./Dashboards/HrDashboard/KPI_Page/Kpi_Layout.jsx";
import HrProgram from "./Dashboards/HrDashboard/KPI_Page/HrProgram.jsx";
import HrTraining from "./Dashboards/HrDashboard/KPI_Page/HrTraining.jsx";
import HrEnroll from "./Dashboards/HrDashboard/KPI_Page/HrEnroll.jsx";
import HrCertificate from "./Dashboards/HrDashboard/KPI_Page/HrCertificate.jsx";
import HrLeaveHistory from "./Dashboards/HrDashboard/HrLeave/HrLeaveHistory.jsx";

// import HrManagerManagementLayout from "./Dashboards/HRDashboard/ManagerPage/HrManagerManagementLayout";
// import HrManagerAttendance from "./Dashboards/HRDashboard/ManagerPage/HrManagerAttendance";
// import HrManagerAttendanceReset from "./Dashboards/HRDashboard/ManagerPage/HrManagerAttendanceReset";

// import HrManagerList from "./Dashboards/HRDashboard/ManagerPage/HrManagerList";

// Supervisor Dashboards imports
import SupervisorLayout from "./Dashboards/SupervisorDashboard/SupervisorLayout.jsx";
import SupervisorHelpDesk from "./Dashboards/SupervisorDashboard/SupervisorHelpDesk/SupervisorHelpDesk.jsx";
import SpSupervisorDashboard from "./Dashboards/SupervisorDashboard/SpSupervisorDashboard/SpSupervisorDashboard.jsx";
import SpSupervisorProfile from "./Dashboards/SupervisorDashboard/Profile/Profile/SpSupervisorProfile.jsx";
import SpSupervisorTodo from "./Dashboards/SupervisorDashboard/Todo/Todo/SpSupervisorTodo.jsx";
import SpSupervisorAttendance from "./Dashboards/SupervisorDashboard/Attendance/SpSupervisorAttendance.jsx";
import SpSupervisorLeave from "./Dashboards/SupervisorDashboard/SupervisorLeave/SpSupervisorLeave.jsx";
import SpSupervisorNews from "./Dashboards/SupervisorDashboard/SpSupervisorNews/SpSupervisorNews.jsx";
import SpSupervisorRequest from "./Dashboards/SupervisorDashboard/ViewRequest/ViewRequest/Content.jsx";

import EmployeeDashboardLayout from "./Dashboards/EmployeeDashboard/EmployeeDashboardLayout.jsx";
import EmployeeDashboard from "./Dashboards/EmployeeDashboard/EmployeeDashboard/EmployeeDashboard.jsx";
import EmployeeTodo from "./Dashboards/EmployeeDashboard/EmployeeTodo/EmployeeTodo.jsx";
import EmployeeTask from "./Dashboards/EmployeeDashboard/EmployeeTask/EmployeeTask.jsx";
import EmployeeLeave from "./Dashboards/EmployeeDashboard/EmployeeLeave/EmployeeLeave.jsx";
import Employee_Attendance from "./Dashboards/EmployeeDashboard/EmployeeAttendance/Employee_Attendance.jsx";
import EmployeeSalary from "./Dashboards/EmployeeDashboard/EmployeeSalary/EmployeeSalary.jsx";
import EmployeeLateLoginReason from "./Dashboards/AdminDashboard/EmployeePage/EmployeeLateLoginReason";


import KPILayout from "./Dashboards/EmployeeDashboard/KPI_Page/KPILayout.jsx";
import TrainingCertification from "./Dashboards/EmployeeDashboard/TrainingCertification/TrainingCertification.jsx";
import PreformanceReviews from "./Dashboards/EmployeeDashboard/KPI_Page/PreformanceReviews.jsx";
import GoalSetting from "./Dashboards/EmployeeDashboard/KPI_Page/GoalSetting.jsx";
import FeedbackSystem from "./Dashboards/EmployeeDashboard/KPI_Page/FeedbackSystem.jsx";
import EmployeeHelpDesk from "./Dashboards/EmployeeDashboard/EmployeeHelpDesk/EmployeeHelpDesk.jsx";

import { ErrorPage } from "./ErrorPage/ErrorPage";
import { ChatProvider } from "./context/chatContext";
import HrManagerManagementLayout from "./Dashboards/HrDashboard/ManagerPage/HrManagerManagementLayout.jsx";
import HrManagerList from "./Dashboards/HrDashboard/ManagerPage/HrManagerList.jsx";
import HrManagerAttendance from "./Dashboards/HrDashboard/ManagerPage/HrManagerAttendance.jsx";
import HrManagerAttendanceReset from "./Dashboards/HrDashboard/ManagerPage/HrManagerAttendanceReset.jsx";
import ManagerHrChart from "./Dashboards/HrDashboard/ManagerPage/ManagerHrChart";
import ManagerHrLeavePolicies from "./Dashboards/HrDashboard/ManagerPage/ManagerHrLeavePolicies";
import ManagerHrLeave from "./Dashboards/HrDashboard/ManagerPage/ManagerHrLeave";
import ManagerHrSalary from "./Dashboards/HrDashboard/ManagerPage/ManagerHrSalary";
import ManagerHrPayroll from "./Dashboards/HrDashboard/ManagerPage/ManagerHrPayroll";
import HrSupervisorManagementLayout from "./Dashboards/HrDashboard/SupervisorPage/HrSupervisorManagementLayout.jsx";
import HrSupervisorAttendance from "./Dashboards/HrDashboard/SupervisorPage/HrSupervisorAttendance.jsx";
import HrSupervisorAttendanceReset from "./Dashboards/HrDashboard/SupervisorPage/HrSupervisorAttendanceReset.jsx";
import HrSupervisorChart from "./Dashboards/HrDashboard/SupervisorPage/HrSupervisorChart.jsx";
import HrSupervisorList from "./Dashboards/HrDashboard/SupervisorPage/HrSupervisorList.jsx";
import SupervisorHrLeave from "./Dashboards/HrDashboard/SupervisorPage/SupervisorHrLeave";
import SupervisorHrLeavePolicies from "./Dashboards/HrDashboard/SupervisorPage/SupervisorHrLeavePolicies";
import SupervisorHrSalary from "./Dashboards/HrDashboard/SupervisorPage/SupervisorHrSalary";
import SupervisorHrPayroll from "./Dashboards/HrDashboard/SupervisorPage/SupervisorHrPayroll";
import MManagerFeedback from "./Dashboards/ManagerDashboard/KpiAndFeedBack/MManagerFeedback.jsx";

import HRProgressLayout from "./Dashboards/HrDashboard/HrProcess/HRProgressLayout.jsx";
import ProcessEvent from "./Dashboards/HrDashboard/HrProcess/ProcessEvent.jsx";
import ProcessJob from "./Dashboards/HrDashboard/HrProcess/ProcessJob.jsx";
import ProcessSchedule from "./Dashboards/HrDashboard/HrProcess/ProcessSchedule.jsx";

import EmployeeHrManagement from "./Dashboards/HrDashboard/HrEmployees/EmployeeHrManagement.jsx";
import EmployeeHrAttendance from "./Dashboards/HrDashboard/HrEmployees/EmployeeHrAttendance.jsx";
import EmployeeHrAttendanceReset from "./Dashboards/HrDashboard/HrEmployees/EmployeeHrAttendanceReset.jsx";
import EmployeeHrChart from "./Dashboards/HrDashboard/HrEmployees/EmployeeHrChart.jsx";
import EmpHrLeavePolicies from "./Dashboards/HrDashboard/HrEmployees/EmpHrLeavePolicies.jsx";
import EmpHrLeave from "./Dashboards/HrDashboard/HrEmployees/EmpHrLeave.jsx";
import EmpHrSalary from "./Dashboards/HrDashboard/HrEmployees/EmpHrSalary.jsx";
import EmpHrPayroll from "./Dashboards/HrDashboard/HrEmployees/EmpHrPayroll.jsx";

import HrAttendanceLayout from "./Dashboards/HrDashboard/HrAttandanceManagement/HrAttandanceLayout.jsx";
import HrAttendanceManagement from "./Dashboards/HrDashboard/HrAttandanceManagement/AttandanceManagement/HrAttendanceManagement.jsx";
import HrLeaveManagement from "./Dashboards/HrDashboard/HrAttandanceManagement/LeaveManagement/HrLeaveManagement.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import AdminOtherLayout from "./Dashboards/AdminDashboard/Others/AdminOtherLayout.jsx";
import ProjectManagementLayout from "./Dashboards/AdminDashboard/ProjectManagement/ProjectManagementLayout.jsx";





//Employee Billing Page imports
import Billing from "./Dashboards/EmployeeDashboard/EmployeeBilling/Billing.jsx";
import Parties from "./Dashboards/EmployeeDashboard/EmployeeBilling/Partiespage/Parties.jsx";
import CreateParty from "./Dashboards/EmployeeDashboard/EmployeeBilling/Partiespage/CreateParty";
import PartyDetails from "./Dashboards/EmployeeDashboard/EmployeeBilling/Partiespage/Partydetails";
import CreateSalesInvoice from "./Dashboards/EmployeeDashboard/EmployeeBilling/Partiespage/CreateSalesInvoice";
import ItemsPage from "./Dashboards/EmployeeDashboard/EmployeeBilling/Items/ItemsPage";
import ItemDetails from "./Dashboards/EmployeeDashboard/EmployeeBilling/Items/ItemDetails";
import SalesInvoice from "./Dashboards/EmployeeDashboard/EmployeeBilling/Sales/SalesInvoice";
import PaymentIn from "./Dashboards/EmployeeDashboard/EmployeeBilling/PaymentIn/PaymentIn";
import Quotation from "./Dashboards/EmployeeDashboard/EmployeeBilling/Quotation/Quotation";
import QuotationEstimate from "./Dashboards/EmployeeDashboard/EmployeeBilling/Quotation/QuotationEstimate";
import ProformaInvoice from "./Dashboards/EmployeeDashboard/EmployeeBilling/Proformainvoice/ProformaInvoice";
import Invoice from "./Dashboards/EmployeeDashboard/EmployeeBilling/Proformainvoice/Invoice";
import CreditNote from "./Dashboards/EmployeeDashboard/EmployeeBilling/CreditNote/CreditNote";
import CreditInvoice from "./Dashboards/EmployeeDashboard/EmployeeBilling/CreditNote/CreditInvoice";
import PaymentList from "./Dashboards/EmployeeDashboard/EmployeeBilling/PaymentIn/PaymentList";
import CreateDeliverychallan from "./Dashboards/EmployeeDashboard/EmployeeBilling/DeliveryChallan/CreateDeliverychallan";
import DeliveryChallan from "./Dashboards/EmployeeDashboard/EmployeeBilling/DeliveryChallan/DeliveryChallan";


//Manager Billing Page imports
import ManagerBilling from "./Dashboards/ManagerDashboard/ManagerBilling/Billing.jsx";
import ManagerParties from "./Dashboards/ManagerDashboard/ManagerBilling/Partiespage/Parties.jsx";
import ManagerCreateParty from "./Dashboards/ManagerDashboard/ManagerBilling/Partiespage/CreateParty";
import ManagerPartyDetails from "./Dashboards/ManagerDashboard/ManagerBilling/Partiespage/Partydetails";
import ManagerCreateSalesInvoice from "./Dashboards/ManagerDashboard/ManagerBilling/Partiespage/CreateSalesInvoice";
import ManagerItemsPage from "./Dashboards/ManagerDashboard/ManagerBilling/Items/ItemsPage";
import ManagerItemDetails from "./Dashboards/ManagerDashboard/ManagerBilling/Items/ItemDetails";
import ManagerSalesInvoice from "./Dashboards/ManagerDashboard/ManagerBilling/Sales/SalesInvoice";
import ManagerPaymentIn from "./Dashboards/ManagerDashboard/ManagerBilling/PaymentIn/PaymentIn";
import ManagerQuotation from "./Dashboards/ManagerDashboard/ManagerBilling/Quotation/Quotation";
import ManagerQuotationEstimate from "./Dashboards/ManagerDashboard/ManagerBilling/Quotation/QuotationEstimate";
import ManagerProformaInvoice from "./Dashboards/ManagerDashboard/ManagerBilling/Proformainvoice/ProformaInvoice";
import ManagerInvoice from "./Dashboards/ManagerDashboard/ManagerBilling/Proformainvoice/Invoice";
import ManagerCreditNote from "./Dashboards/ManagerDashboard/ManagerBilling/CreditNote/CreditNote";
import ManagerCreditInvoice from "./Dashboards/ManagerDashboard/ManagerBilling/CreditNote/CreditInvoice";
import ManagerPaymentList from "./Dashboards/ManagerDashboard/ManagerBilling/PaymentIn/PaymentList";
import ManagerCreateDeliverychallan from "./Dashboards/ManagerDashboard/ManagerBilling/DeliveryChallan/CreateDeliverychallan";
import ManagerDeliveryChallan from "./Dashboards/ManagerDashboard/ManagerBilling/DeliveryChallan/DeliveryChallan";

//Admin Inventory Page imports
import AdminInventory from "./Dashboards/AdminDashboard/AdminInventory/Inventory.jsx";
import AdminItemsPage from "./Dashboards/AdminDashboard/AdminInventory/Items/ItemsPage.jsx";
import AdminItemDetails from "./Dashboards/AdminDashboard/AdminInventory/Items/ItemDetails.jsx";


export default function App() {
  return (
    // <>
    <main className="min-h-screen h-full w-full transition-all ease-in-out duration-300 antialiased bg-neutral-100">
      <Suspense>
        <Router>
          {/* <AuthProvider> */}
          <ChatProvider>
            <Routes>
              <Route index element={<Landing />} />
              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgetPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Admin Dashboard */}
              <Route path="admin" element={<AdminDashboard />}>

              {/* billing pages */}
              <Route path="inventory" element={<AdminInventory />}>
                  <Route index element={<AdminItemsPage />} />
                  
                  <Route path="itemspage" element={<AdminItemsPage />} />
                  <Route path="itemdetails/:id" element={<AdminItemDetails />} />
                  
                </Route>

               

               
              <Route path="helpdesk" element={<AdminHelpDesk />} />
                <Route index element={<AdminHome />} />
                <Route path="manager" element={<ManagerManagementLayout />}>
                  <Route index element={<ManagerList />} />
                  <Route path="managerList" element={<ManagerList />} />
                  <Route path="attendance" element={<ManagerAttendance />} />
                  <Route path="late-login-reason" element={<ManagerLateLoginReason />} />
                  <Route
                    path="attendanceReset"
                    element={<ManagerAttendanceReset />}
                  />
                  <Route path="chart" element={<ManagerChart />} />
                  

                  <Route
                    path="manager-leave-policies"
                    element={<ManagerLeavePolicies />}
                  />
                  <Route path="manager-leave" element={<ManagerLeave />} />
                  <Route path="manager-salary" element={<ManagerSalary />} />
                  <Route path="manager-payroll" element={<ManagerPayroll />} />
                </Route>
                <Route path="hr-management" element={<HRManagementLayout />}>
                  <Route index element={<ManagerHRList />} />
                  <Route path="attendance" element={<ManagerHRAttendance />} />
                  <Route
                    path="attendanceReset"
                    element={<ManagerHRAttendanceReset />}
                  />
                  <Route path="chart" element={<ManagerHRChart />} />
                  <Route path="hr-leave" element={<ManagerHRLeave />} />
                  <Route
                    path="hr-leave-policies"
                    element={<ManagerHRLeavePolicies />}
                  />
                  <Route path="hr-salary" element={<ManagerHRSalary />} />
                  <Route path="hr-payroll" element={<ManagerHRPayroll />} />
                </Route>

                <Route path="ar-management" element={<ARManagementLayout />}>
                  <Route index element={<ManagerARList />} />
                  <Route path="attendance" element={<ManagerARAttendance />} />
                  <Route
                    path="attendanceReset"
                    element={<ManagerARAttendanceReset />}
                  />
                  <Route path="chart" element={<ManagerARChart />} />
                  <Route path="ar-leave" element={<ManagerARLeave />} />
                  <Route
                    path="ar-leave-policies"
                    element={<ManagerARLeavePolicies />}
                  />
                  <Route path="ar-salary" element={<ManagerARSalary />} />
                  <Route path="ar-payroll" element={<ManagerARPayroll />} />
                </Route>

                <Route path="account-management" element={<AccountManagementLayout />}>
                  <Route index element={<AccountManagementClientDash />} />
                  <Route path="employeeDash" element={<AccountManagementEmployeeDash />} />
                  {/* <Route path="invoices" element={<AccountInvoices />} /> */}
                  <Route path="reports" element={<AccountReports />} />
                  {/* <Route path="billings" element={<AccountBillings />} /> */}
                  
                </Route>

              

                  


                <Route
                  path="kpi-manager"
                  element={<ManagerPerformanceLayout />}
                >
                  <Route index element={<ManagerPerformanceRivewList />} />
                  <Route
                    path="manager-performance"
                    element={<ManagerPerformanceRivewList />}
                  />
                  <Route path="manager-goal" element={<ManagerGoal />} />
                  <Route path="managerfeedback" element={<ManagerFeedback />} />
                </Route>
                <Route
                  path="training-programs"
                  element={<TrainingProgramLayout />}
                >
                  <Route index element={<Program />} />
                  <Route path="enroll" element={<Enroll />} />
                  <Route path="certificate" element={<Certificate />} />
                </Route>
                <Route
                  path="kpi-employee"
                  element={<EmployeePerformanceLayout />}
                >
                  <Route index element={<EmployeePerformanceRivewList />} />
                  <Route path="employee-goal" element={<EmployeeGoal />} />
                  <Route
                    path="employeefeedback"
                    element={<EmployeeFeedback />}
                  />
                </Route>
                <Route path="employee" element={<EmployeeManagementLayout />}>
                  <Route index element={<EmployeeList />} />
                  <Route path="attendance" element={<EmployeeAttendance />} />
                  <Route path="late-login-reason" element={<EmployeeLateLoginReason />} />
                  <Route
                    path="attendanceReset"
                    element={<EmployeeAttendanceReset />}
                  />
                  <Route path="chart" element={<EmployeeChart />} />
                  <Route
                    path="employee-leave-policies"
                    element={<EmpLeavePolicies />}
                  />
                  <Route path="employee-leave" element={<EmpLeave />} />
                  <Route path="employee-salary" element={<Salary />} />
                  <Route path="employee-payroll" element={<EmpPayroll />} />
                </Route>
                <Route
                  path="supervisor"
                  element={<SupervisorManagementLayout />}
                >
                  <Route index element={<SupervisorList />} />
                  <Route path="attendance" element={<SupervisorAttendance />} />
                  <Route path="late-login-reason" element={<SupervisorLateLoginReason />} />
                  <Route
                    path="attendanceReset"
                    element={<SupervisorAttendanceReset />}
                  />
                  <Route path="chart" element={<SupervisorChart />} />
                  <Route
                    path="supervisor-leave"
                    element={<SupervisorLeave />}
                  />
                  <Route
                    path="supervisor-leave-policies"
                    element={<SupervisorLeavePolicies />}
                  />
                  <Route
                    path="supervisor-salary"
                    element={<SupervisorSalary />}
                  />
                  <Route
                    path="supervisor-payroll"
                    element={<SupervisorPayroll />}
                  />
                </Route>
                <Route
                  path="projectManagement"
                  element={<ProjectManagementLayout />}
                >
                  <Route index element={<ProjectPage />} />
                  <Route path="project" element={<ProjectPage />}>
                    <Route path="report" element={<ProjectReportPage />} />
                  </Route>
                  <Route path="teamCreation" element={<TeamCreationPage />} />
                  <Route path="task" element={<TaskAssignmentPage />} />
                </Route>

                {/* <Route path="department" element={<Department />} /> */}
                {/* <Route path="news" element={<News />} /> */}

                {/* <Route path="roleCreation" element={<RoleCreation />} /> */}
                {/* <Route path="schedule" element={<Schedule />} /> */}
                <Route path="calendarevent" element={<CalendarEvent />} />
                <Route path="job" element={<Job />} />
                {/* <Route path="location" element={<Location />} /> */}
                {/* <Route path="shift" element={<Shift />} /> */}
                <Route path="feedback" element={<Feedback />} />
                {/* <Route path="profile" element={<AdminProfile />} /> */}
                <Route path="other" element={<AdminOtherLayout />}>
                  <Route index element={<RoleCreation />} />
                  <Route path="RoleCreation" element={<RoleCreation />} />
                  <Route path="department" element={<Department />} />
                  <Route path="news" element={<News />} />
                  <Route path="location" element={<Location />} />
                  <Route path="shift" element={<Shift />} />
                </Route>
                <Route path="*" element={<ErrorPage path={"/admin"} />} />
              </Route>

              {/* Manager Dashboard */}
              <Route path="manager" element={<ManagerDashboard />}>
              {/* billing pages */}
             <Route path="billing" element={<ManagerBilling />}>
                  <Route index element={<ManagerParties />} />
                  <Route path="createparty" element={<ManagerCreateParty />} />
                  <Route path="partydetails/:id" element={<ManagerPartyDetails />} />
                  <Route path="createsalesinvoice" element={<ManagerCreateSalesInvoice />} />
                  <Route path="itemspage" element={<ManagerItemsPage />} />
                  <Route path="itemdetails/:id" element={<ManagerItemDetails />} />
                  <Route path="salesinvoice" element={<ManagerSalesInvoice />} />
                  <Route path="paymentin" element={<ManagerPaymentIn />} />
                  <Route path="quotation" element={<ManagerQuotation />} />
                  <Route path="quotationestimate" element={<ManagerQuotationEstimate />} />
                  <Route path="proformainvoice" element={<ManagerProformaInvoice />} />
                  <Route path="invoice" element={<ManagerInvoice />} />
                  <Route path="creditnote" element={<ManagerCreditNote />} />
                  <Route path="creditinvoice" element={<ManagerCreditInvoice />} />
                  <Route path="paymentlist" element={<ManagerPaymentList />} />
                  <Route path="deliverychallen" element={<ManagerDeliveryChallan />} />
                  <Route path="createdeliverychallan" element={<ManagerCreateDeliverychallan />} />
                </Route>
                <Route index element={<ManagerHome />} />
                <Route
                  path="projectManagement"
                  element={<ProjectManagement />}
                />
                <Route path="ManagerTask" element={<ManagerTaskManagement />} />

                <Route path="helpDesk" element={<ManagerHelpDesk />} />

                

                <Route
                  path="EmployeeTask"
                  element={<EmployeeTaskManagement />}
                />

                <Route
                  path="ManagerAttendance"
                  element={<ManagerAttendanceLayout />}
                >
                  <Route path="" element={<ManagerAttendanceManagement />} />
                  <Route
                    path="AttendanceManagement"
                    element={<ManagerAttendanceManagement />}
                  />
                  <Route
                    path="LeaveManagement"
                    element={<ManagerLeaveManagement />}
                  />
                </Route>
                <Route
                  path="EmployeeAttendance"
                  element={<EmployeeLeaveManagement />}
                >
                  <Route index element={<EmployeeAttendanceManagement />} />
                  <Route
                    path="AttendanceManagement"
                    element={<EmployeeAttendanceManagement />}
                  />
                  <Route
                    path="LeaveManagement"
                    element={<MEmployeeLeaveManagement />}
                  />
                  <Route
                    path="permissionHours"
                    element={<EmployeePermissionHours />}
                  />
                </Route>

                <Route path="projectProcess" element={<ProjectProcess />} />
                <Route
                  path="projectTeamMembers"
                  element={<ProjectTeamMember />}
                />
                <Route path="ManagerKpi" element={<ManagerKpiLayout />}>
                  <Route index element={<ManagerPerformance />} />
                  <Route
                    path="managerReview"
                    element={<ManagerPerformance />}
                  />
                  <Route path="managerGoals" element={<ManagerGoals />} />
                  <Route
                    path="managerFeedback"
                    element={<MManagerFeedback />}
                  />
                  <Route
                    path="managerPerformanceChart"
                    element={<ManagerPerformanceChart />}
                  />
                  <Route
                    path="managerTrainingCertificate"
                    element={<ManagerTrainingCertification />}
                  />
                  <Route
                    path="employeeReview"
                    element={<MEmployeePerformance />}
                  />
                  <Route path="employeeGoals" element={<MEmployeeGoal />} />
                  <Route
                    path="employeeFeedback"
                    element={<MEmployeeFeedback />}
                  />
                </Route>
                <Route path="ManagerProfile" element={<ManagerProfile />} />
                <Route path="*" element={<ErrorPage path={"/manager"} />} />
              </Route>

              {/* HR Dashboard */}
              <Route path="hr" element={<HRLayout />}>
                <Route index element={<HrDashboard />} />
                <Route path="dashboard" element={<HrDashboard />} />
                <Route path="process" element={<HRProgressLayout />}>
                  <Route index element={<ProcessSchedule />} />
                  <Route path="schedule" element={<ProcessSchedule />} />
                  <Route path="job" element={<ProcessJob />} />
                  <Route path="event" element={<ProcessEvent />} />
                </Route>
                <Route path="onboarding" element={<HRonboarding />} />
                <Route path="employees" element={<HrEmployees />} />
                <Route path="attendance" element={<HrAttendanceLayout />}>
                  <Route index element={<HrAttendanceManagement />} />
                  <Route
                    path="attendance-table"
                    element={<HrAttendanceManagement />}
                  />
                  <Route path="leave" element={<HrLeaveManagement />} />
                </Route>
                {/* <Route path="attendance" element={<HrAttendanceLayout />}>
                    <Route index element={<HrAttendance />} />
                    <Route path="managerChart" element={<HrManagerChart />} />
                    <Route path="employeeChart" element={<HrEmployeeChart />} />
                  </Route> */}
                <Route path="LeaveManagement" element={<HrLeaveHistory />} />
                <Route path="hr-employee" element={<EmployeeHrManagement />}>
                  <Route index element={<HrEmployees />} />
                  <Route
                    path="employee-hr-attendance"
                    element={<EmployeeHrAttendance />}
                  />
                  <Route
                    path="employee-hr-attendanceReset"
                    element={<EmployeeHrAttendanceReset />}
                  />
                  <Route path="employee-chart" element={<EmployeeHrChart />} />
                  <Route
                    path="hr-employee-leave-policies"
                    element={<EmpHrLeavePolicies />}
                  />
                  <Route path="hr-employee-leave" element={<EmpHrLeave />} />
                  <Route path="hr-employee-salary" element={<EmpHrSalary />} />
                  <Route
                    path="hr-employee-payroll"
                    element={<EmpHrPayroll />}
                  />
                </Route>
                <Route path="hrManager" element={<HrManagerManagementLayout />}>
                  <Route index element={<HrManagerList />} />
                  <Route path="attendance" element={<HrManagerAttendance />} />
                  <Route
                    path="attendanceReset"
                    element={<HrManagerAttendanceReset />}
                  />
                  <Route path="chart" element={<ManagerHrChart />} />
                  <Route
                    path="manager-leave-policies"
                    element={<ManagerHrLeavePolicies />}
                  />
                  <Route path="late-login-reason" element={<ManagerHRLateLoginReason />} />
                  <Route path="manager-leave" element={<ManagerHrLeave />} />
                  <Route path="manager-salary" element={<ManagerHrSalary />} />
                  <Route
                    path="manager-payroll"
                    element={<ManagerHrPayroll />}
                  />
                </Route>
                <Route
                  path="hrsupervisor"
                  element={<HrSupervisorManagementLayout />}
                >
                  <Route index element={<HrSupervisorList />} />
                  <Route
                    path="attendance"
                    element={<HrSupervisorAttendance />}
                  />
                  <Route
                    path="attendanceReset"
                    element={<HrSupervisorAttendanceReset />}
                  />
                  <Route path="chart" element={<HrSupervisorChart />} />
                  <Route
                    path="supervisor-leave"
                    element={<SupervisorHrLeave />}
                  />
                  <Route
                    path="supervisor-leave-policies"
                    element={<SupervisorHrLeavePolicies />}
                  />
                  <Route
                    path="supervisor-salary"
                    element={<SupervisorHrSalary />}
                  />
                  <Route
                    path="supervisor-payroll"
                    element={<SupervisorHrPayroll />}
                  />
                </Route>
                <Route path="shift" element={<HrShift />} />
                <Route path="Offers" element={<HrOffers />} />
                <Route path="helpDesk" element={<HrHelpDesk />} />
                <Route path="payroll" element={<HrPayRoll />} />
                <Route path="tickets" element={<HrTickets />} />
                <Route
                  path="ManagerPerformance"
                  element={<HrManagerPerformanceLayout />}
                >
                  <Route index element={<ManagerPerformanceRivewList />} />
                  <Route path="manager-goal" element={<ManagerGoal />} />
                  <Route path="managerfeedback" element={<ManagerFeedback />} />
                </Route>
                <Route
                  path="EmployeePerformance"
                  element={<HrEmployeePerformanceLayout />}
                >
                  <Route index element={<EmployeePerformanceRivewList />} />
                  <Route path="employee-goal" element={<EmployeeGoal />} />
                  <Route
                    path="employeefeedback"
                    element={<EmployeeFeedback />}
                  />
                </Route>
                <Route path="kpi" element={<Kpi_Layout />}>
                  <Route index element={<HrProgram />} />
                  <Route path="program" element={<HrProgram />} />
                  <Route path="training" element={<HrTraining />} />
                  <Route path="enroll" element={<HrEnroll />} />
                  <Route path="certificate" element={<HrCertificate />} />
                </Route>
              </Route>

              {/* <Route path="/hr" element={<HRDashboard />}> */}
              {/* <Route path="/employeechart" element={<HrEmployeeChart />} />
                  <Route path="/managerchart" element={<HrManagerChart />} />
                  <Route path="/process" element={<Process />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/Manager" element={<Manager />} />
                  <Route path="/offer" element={<Offer />} />
                  <Route path="/onboarding" element={<OnBoarding />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/addemployee" element={<AddEmployee />} />
                  <Route path="/shift" element={<HrShift />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/helpDesk" element={<HelpDesk />} />
                  <Route path="/returnticket" element={<HelpDesk2 />} />
                  <Route path="/certificate" element={<Certificate />} />
                  <Route path="/enroll" element={<Enroll />} />
                  <Route path="/program" element={<Program />} />
                  <Route path="/training" element={<Training />} /> */}

              {/* <Route
                    path="kpi-manager"
                    element={<ManagerPerformanceLayout />}
                  >
                    <Route index element={<ManagerPerformanceRivewList />} />
                    <Route path="manager-goal" element={<ManagerGoal />} />
                    <Route
                      path="managerfeedback"
                      element={<HrManagerFeedback />}
                    />
                  </Route>
                  <Route
                    path="kpi-employee"
                    element={<EmployeePerformanceLayout />}
                  >
                    <Route index element={<EmployeePerformanceRivewList />} />
                    <Route path="employee-goal" element={<HrEmployeeGoal />} />
                    <Route
                      path="employeefeedback"
                      element={<HrEmployeeFeedback />}
                    />
                  </Route> */}
              {/* <Route path="*" element={<ErrorPage path={"/hr"} />} /> */}
              {/* </Route> */}

              {/* Supervisor Dashboard */}
              <Route path="supervisor" element={<SupervisorLayout />}>
                <Route index element={<SpSupervisorDashboard />} />
                <Route path="dashboard" element={<SpSupervisorDashboard />} />
                <Route path="Attendance" element={<SpSupervisorAttendance />} />
                <Route path="Profile" element={<SpSupervisorProfile />} />
                <Route path="LeaveManagement" element={<SpSupervisorLeave />} />
                <Route path="Todo" element={<SpSupervisorTodo />} />
                <Route path="News" element={<SpSupervisorNews />} />
                <Route path="viewRequest" element={<SpSupervisorRequest />} />
                <Route path="helpDesk" element={<SupervisorHelpDesk />} />
                <Route path="*" element={<ErrorPage path={"/supervisor"} />} />
              </Route>

             

              {/* Employee Dashboard */}
              <Route path="employee" element={<EmployeeDashboardLayout />}>
                {/* billing pages */}
                <Route path="billing" element={<Billing />}>
                  <Route index element={<Parties />} />
                  <Route path="createparty" element={<CreateParty />} />
                  <Route path="partydetails/:id" element={<PartyDetails />} />
                  <Route path="createsalesinvoice" element={<CreateSalesInvoice />} />
                  <Route path="itemspage" element={<ItemsPage />} />
                  <Route path="itemdetails/:id" element={<ItemDetails />} />
                  <Route path="salesinvoice" element={<SalesInvoice />} />
                  <Route path="paymentin" element={<PaymentIn />} />
                  <Route path="quotation" element={<Quotation />} />
                  <Route path="quotationestimate" element={<QuotationEstimate />} />
                  <Route path="proformainvoice" element={<ProformaInvoice />} />
                  <Route path="invoice" element={<Invoice />} />
                  <Route path="creditnote" element={<CreditNote />} />
                  <Route path="creditinvoice" element={<CreditInvoice />} />
                  <Route path="paymentlist" element={<PaymentList />} />
                  <Route path="deliverychallen" element={<DeliveryChallan />} />
                  <Route path="createdeliverychallan" element={<CreateDeliverychallan />} />
                </Route>


                <Route index element={<EmployeeDashboard />} />
                <Route path="task" element={<EmployeeTask />} />
                <Route path="todo" element={<EmployeeTodo />} />
                <Route path="attendance" element={<Employee_Attendance />} />
                <Route path="leave" element={<EmployeeLeave />} />
                <Route path="salary" element={<EmployeeSalary />} />
                <Route path="helpDesk" element={<EmployeeHelpDesk />} />

                  <Route path="account-management" element={<EmployeeAccountManagementLayout />}>
                  <Route index element={<EmployeeAccountManagementClientDash />} />
                  {/* <Route path="employeeDash" element={<EmployeeAccountManagementEmployeeDash />} /> */}
                  {/* <Route path="invoices" element={<AccountInvoices />} /> */}
                  <Route path="reports" element={<EmployeeAccountReports />} />
                  {/* <Route path="billings" element={<AccountBillings />} /> */}
                  
                </Route>
                
                <Route path="kpi" element={<KPILayout />}>
                  <Route index element={<PreformanceReviews />} />
                  <Route path="performance" element={<PreformanceReviews />} />
                  <Route path="goal" element={<GoalSetting />} />
                  <Route path="feedback" element={<FeedbackSystem />} />
                </Route>
                <Route
                  path="trainingCertification"
                  element={<TrainingCertification />}
                />
                <Route path="*" element={<ErrorPage path={`/employee`} />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<ErrorPage path={"/"} />} />
            </Routes>
          </ChatProvider>
          {/* </AuthProvider> */}
        </Router>
      </Suspense>
    </main>
    // </>
  );
}
