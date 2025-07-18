import React, { useEffect, useState } from "react";
import axios from "axios";
const apiBaseUrl = process.env.VITE_BASE_API;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EmployeeSalary = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchSalaryAndBonus = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(
        sessionStorage.getItem("userdata") || "{}"
      )?.employee_id;
      if (!userId) throw new Error("User ID not found");

      const response = await axios.get(`${apiBaseUrl}/salary/history/${userId}`);
      const allSalaryData = response.data || [];
      const allBonusData = response.data.bonus || [];

      // Optional: Filter based on selectedMonth and selectedYear if needed
      const filteredSalary = allSalaryData.filter((entry) => {
        const date = new Date(entry.effective_date);
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      });

      setSalaryData(filteredSalary);
      setBonusData(allBonusData); // Update this to filter by month/year if needed
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryAndBonus();
  }, [selectedMonth, selectedYear]);

  if (loading)
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  const totalBonus = salaryData.reduce(
    (sum, bonus) => sum + parseFloat(bonus.bonus || 0),
    0
  );
  const annualSalary = salaryData[0]?.annual_salary || 0;
  const totalSalary = parseFloat(annualSalary) + totalBonus;

  return (
    <div className="p-2">
      <p className="font-medium text-2xl leading-7 mt-2">My Salary</p>

      {/* Filter Dropdown */}
      <div className="flex gap-4 mt-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border p-2 rounded-md"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border p-2 rounded-md"
        >
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Info Message */}
      <p className="mt-3 text-gray-400 font-medium text-sm leading-4">
        "Income and tax liability are currently being computed according to the
        old income tax regime. To learn more or switch to the new income tax
        regime"
        <span className="text-blue-800"> Click Here</span>
      </p>

      {/* Salary Card Display */}
      <div className="border border-gray-300 rounded-xl bg-white p-8 pb-24 mt-5">
        {/* ... Keep your existing JSX content unchanged */}
        {/* Render salary details using salaryData and bonusData */}
      </div>
    </div>
  );
};

export default EmployeeSalary;
