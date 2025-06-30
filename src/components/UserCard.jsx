import { Ellipsis, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const apiBaseUrl = import.meta.env.VITE_BASE_API;

export default function UserCard({ user }) {
  const image =
    user.hr_image || user.manager_image || user.employee_image || user.supervisor_image || "/default-avatar.png";
  const name = user.hr_name || user.manager_name || user.employee_name || user.supervisor_name || "User";
  const id = user.hr_id || user.manager_id || user.employee_id || user.supervisor_id || "VLT001";
  const role = user.role || (user.hr_id && "HR Manager") || (user.supervisor_id && "Supervisor") || "Employee";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <p className="bg-green-200 text-sm text-green-700 rounded-full border border-green-700 px-2 py-1">
            <span>Active</span>
          </p>
          <span>
            <Ellipsis />
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="flex flex-col justify-center items-center">
          <img
            className="size-32 object-cover object-center rounded-full border"
            src={`${apiBaseUrl}${image}`}
            alt={name}
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          <p>{id}</p>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{role}</CardDescription>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-6 bg-blue-50 p-3 rounded-lg border border-primary-foreground">
          <div className="flex justify-between">
            <div>
              <CardDescription>Department</CardDescription>
              <CardTitle>{user.department || "IT"}</CardTitle>
            </div>
            <div>
              <CardDescription>Date Hired</CardDescription>
              <CardTitle>{user.hired_date || "01/01/2024"}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail /> <p>{user.email || "example@email.com"}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
