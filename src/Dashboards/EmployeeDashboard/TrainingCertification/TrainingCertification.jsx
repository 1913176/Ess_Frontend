import { DownloadCloud, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const TrainingCertification = () => {
  const userInfo = JSON.parse(localStorage.getItem('userdata'));
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [filteredTrainingPrograms, setFilteredTrainingPrograms] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('training');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("This year"); // Changed default to "This year"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summaryStats, setSummaryStats] = useState({
    availableTrainings: 0,
    enrolledTrainings: 0,
    completedCertifications: 0,
    expiredCertifications: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [programsResponse, certsResponse] = await Promise.all([
          axios.get(`${apiBaseUrl}/training_programs/`),
          axios.get(`${apiBaseUrl}/employee_dashboard_certificates/${userInfo.username}/`)
        ]);
        const programs = programsResponse.data;
        const certs = certsResponse.data;
        setTrainingPrograms(programs);
        setFilteredTrainingPrograms(programs);
        setCertifications(certs);
        setFilteredCertifications(certs);
        calculateSummaryStats(programs, certs);
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo.username]);

  const calculateSummaryStats = (trainings, certs) => {
    const today = new Date();
    const expiredCerts = certs.filter(cert => 
      cert.expiry_date && new Date(cert.expiry_date) < today
    ).length;
    
    setSummaryStats({
      availableTrainings: trainings.length,
      enrolledTrainings: trainings.filter(t => t.enrolled).length,
      completedCertifications: certs.length,
      expiredCertifications: expiredCerts
    });
  };

  useEffect(() => {
    let filteredPrograms = [...trainingPrograms];
    let filteredCerts = [...certifications];

    if (searchTerm) {
      filteredPrograms = filteredPrograms.filter(program => 
        program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.training_incharge?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredCerts = filteredCerts.filter(cert =>
        cert.certification_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.participation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    if (selectedFilter === "Last 7 days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredPrograms = filteredPrograms.filter(program => {
        const programDate = new Date(program.start_date);
        return programDate >= sevenDaysAgo && programDate <= now;
      });
      filteredCerts = filteredCerts.filter(cert => {
        const certDate = new Date(cert.certification_date);
        return certDate >= sevenDaysAgo && certDate <= now;
      });
    } else if (selectedFilter === "This month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredPrograms = filteredPrograms.filter(program => {
        const programDate = new Date(program.start_date);
        return programDate >= firstDay && programDate <= now;
      });
      filteredCerts = filteredCerts.filter(cert => {
        const certDate = new Date(cert.certification_date);
        return certDate >= firstDay && certDate <= now;
      });
    } else if (selectedFilter === "Last month") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      filteredPrograms = filteredPrograms.filter(program => {
        const programDate = new Date(program.start_date);
        return programDate >= lastMonthStart && programDate <= lastMonthEnd;
      });
      filteredCerts = filteredCerts.filter(cert => {
        const certDate = new Date(cert.certification_date);
        return certDate >= lastMonthStart && certDate <= lastMonthEnd;
      });
    } else if (selectedFilter === "This year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31); // Include full year
      filteredPrograms = filteredPrograms.filter(program => {
        const programDate = new Date(program.start_date);
        return programDate >= yearStart && programDate <= yearEnd;
      });
      filteredCerts = filteredCerts.filter(cert => {
        const certDate = new Date(cert.certification_date);
        return certDate >= yearStart && certDate <= yearEnd;
      });
    } else if (selectedFilter === "Custom range" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filteredPrograms = filteredPrograms.filter(program => {
        const programDate = new Date(program.start_date);
        return programDate >= start && programDate <= end;
      });
      filteredCerts = filteredCerts.filter(cert => {
        const certDate = new Date(cert.certification_date);
        return certDate >= start && certDate <= end;
      });
    }

    setFilteredTrainingPrograms(filteredPrograms);
    setFilteredCertifications(filteredCerts);
    calculateSummaryStats(filteredPrograms, filteredCerts);
  }, [searchTerm, startDate, endDate, selectedFilter, trainingPrograms, certifications]);

  const HandleEnroll = async (program_id) => {
    try {
      const payload = { program_id, employee_username: userInfo.username };
      await axios.post(`${apiBaseUrl}/enroll_employee/`, payload);
      toast.success("Enrolled successfully");
    } catch (error) {
      toast.error("Failed to enroll");
    }
  };

  const handleDownload = (pdfPath, certName) => {
    // Download implementation
  };

  const handleSort = (key, isCertification = false) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const dataToSort = isCertification ? [...filteredCertifications] : [...filteredTrainingPrograms];
    const sortedData = dataToSort.sort((a, b) => {
      if (key === 'sno') {
        return direction === 'asc' ? a.index - b.index : b.index - a.index;
      }
      if (key === 'date') {
        const dateA = isCertification ? a.certification_date : a.start_date;
        const dateB = isCertification ? b.certification_date : b.start_date;
        return direction === 'asc' 
          ? new Date(dateA) - new Date(dateB) 
          : new Date(dateB) - new Date(dateA);
      }
      if (key === 'name') {
        const nameA = isCertification ? a.certification_name : a.name;
        const nameB = isCertification ? b.certification_name : b.name;
        return direction === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
      return 0;
    });

    if (isCertification) {
      setFilteredCertifications(sortedData);
    } else {
      setFilteredTrainingPrograms(sortedData);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom range") {
      setStartDate("");
      setEndDate("");
      setIsDropdownOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      setSelectedFilter("Custom range");
      setIsDropdownOpen(false);
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedFilter("This year"); // Reset to "This year" instead of "Last 7 days"
    setStartDate("");
    setEndDate("");
    setFilteredTrainingPrograms(trainingPrograms);
    setFilteredCertifications(certifications);
    calculateSummaryStats(trainingPrograms, certifications);
  };

  return (
    <div className="attendance-container p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row justify-between p-4">
          <div>
            <h5 className="font-semibold text-lg mb-1">Training & Certification Summary</h5>
            <p className="text-gray-500 text-sm">Your training and certification records</p>
          </div>
          <div className="flex items-center mt-3 md:mt-0">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
              Employee: {userInfo.username}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
            <div className="p-4 text-center border-r">
              <p className="text-gray-500 text-sm">Available Trainings</p>
              <p className="text-xl sm:text-2xl font-semibold">
                {summaryStats.availableTrainings}
                <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                  {Math.round((summaryStats.availableTrainings / (summaryStats.availableTrainings || 1)) * 100)}%
                </span>
              </p>
            </div>
            <div className="p-4 text-center border-r">
              <p className="text-gray-500 text-sm">Enrolled Trainings</p>
              <p className="text-xl sm:text-2xl font-semibold">
                {summaryStats.enrolledTrainings}
                <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                  {Math.round((summaryStats.enrolledTrainings / (summaryStats.availableTrainings || 1)) * 100)}%
                </span>
              </p>
            </div>
            <div className="p-4 text-center border-r">
              <p className="text-gray-500 text-sm">Completed Certs</p>
              <p className="text-xl sm:text-2xl font-semibold">
                {summaryStats.completedCertifications}
                <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                  {Math.round((summaryStats.completedCertifications / (summaryStats.completedCertifications + summaryStats.expiredCertifications || 1)) * 100)}%
                </span>
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">Expired Certs</p>
              <p className="text-xl sm:text-2xl font-semibold">
                {summaryStats.expiredCertifications}
                <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                  {Math.round((summaryStats.expiredCertifications / (summaryStats.completedCertifications + summaryStats.expiredCertifications || 1)) * 100)}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h5 className="font-semibold text-lg">
              {activeTab === 'training' ? 'Training Programs' : 'Certifications'} Records
            </h5>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <Button 
              variant={activeTab === 'training' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('training')}
            >
              Training Programs ({filteredTrainingPrograms.length})
            </Button>
            <Button 
              variant={activeTab === 'certification' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('certification')}
            >
              Certifications ({filteredCertifications.length})
            </Button>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
              <input 
                type="text" 
                className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="relative">
              <button
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <i className="fas fa-filter mr-2"></i> Filter by Date
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 right-0 bg-white rounded-lg shadow-xl p-4 w-72">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-purple-600">
                      <i className="far fa-calendar-alt mr-2"></i>Date Filter
                    </span>
                    <i 
                      className="fas fa-times text-gray-500 cursor-pointer" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></i>
                  </div>

                  {["Last 7 days", "This month", "Last month", "This year", "Custom range"].map((option) => (
                    <div
                      key={option}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedFilter === option ? "bg-gray-200 text-purple-600" : ""
                      }`}
                      onClick={() => handleFilterSelect(option)}
                    >
                      <i className={`far ${option === "Last 7 days" ? "fa-clock" : 
                        option === "This month" ? "fa-calendar" : 
                        option === "Last month" ? "fa-calendar-week" : 
                        option === "This year" ? "fa-calendar-alt" : "fa-calendar-check"} mr-2`}></i>
                      {option}
                    </div>
                  ))}

                  {selectedFilter === "Custom range" && (
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <div>
                          <label className="text-xs text-gray-500">From</label>
                          <input
                            type="date"
                            className="w-full border rounded p-1 text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">To</label>
                          <input
                            type="date"
                            className="w-full border rounded p-1 text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded w-full"
                        onClick={handleApplyCustomRange}
                        disabled={!startDate || !endDate}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={handleResetFilter}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {loading && <p className="text-center text-blue-500 my-4">Loading data...</p>}
          {error && <p className="text-center text-red-500 my-4">{error}</p>}
          
          {!loading && !error && activeTab === 'training' && (
            <>
              {filteredTrainingPrograms.length === 0 ? (
                <p className="text-center text-gray-500 my-4">No training programs available</p>
              ) : (
                <>
                  <div className="sm:hidden space-y-4 py-2">
                    {filteredTrainingPrograms.map((program, index) => (
                      <div key={program.program_id} className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{program.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Incharge</p>
                            <p>{program.training_incharge}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p>{new Date(program.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p>{new Date(program.end_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Button 
                              variant="contained" 
                              size="small"
                              startIcon={<Plus className="h-4" />}
                              onClick={() => HandleEnroll(program.program_id)}
                            >
                              Enroll
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-200">
                          <TableHead onClick={() => handleSort('sno')} className="cursor-pointer">
                            S.No {getSortIcon('sno')}
                          </TableHead>
                          <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                            Training Name {getSortIcon('name')}
                          </TableHead>
                          <TableHead>
                            Incharge ID
                          </TableHead>
                          <TableHead onClick={() => handleSort('date')} className="cursor-pointer">
                            Start Date {getSortIcon('date')}
                          </TableHead>
                          <TableHead>
                            End Date
                          </TableHead>
                          <TableHead>
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrainingPrograms.map((program, index) => (
                          <TableRow key={program.program_id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{program.name}</TableCell>
                            <TableCell>{program.training_incharge}</TableCell>
                            <TableCell>{new Date(program.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(program.end_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                size="small"
                                startIcon={<Plus className="h-4" />}
                                onClick={() => HandleEnroll(program.program_id)}
                              >
                                Enroll
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !error && activeTab === 'certification' && (
            <>
              {filteredCertifications.length === 0 ? (
                <p className="text-center text-gray-500 my-4">No certifications available</p>
              ) : (
                <>
                  <div className="sm:hidden space-y-4 py-2">
                    {filteredCertifications.map((cert, index) => (
                      <div key={cert.id} className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{cert.certification_name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Issued Date</p>
                            <p>{new Date(cert.certification_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Participation</p>
                            <p>{cert.participation}</p>
                          </div>
                          <div>
                            <Button 
                              variant="contained" 
                              size="small"
                              startIcon={<DownloadCloud className="h-4" />}
                              onClick={() => handleDownload(cert.certification_file, cert.certification_name)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-200">
                          <TableHead onClick={() => handleSort('sno', true)} className="cursor-pointer">
                            S.No {getSortIcon('sno')}
                          </TableHead>
                          <TableHead onClick={() => handleSort('name', true)} className="cursor-pointer">
                            Certification {getSortIcon('name')}
                          </TableHead>
                          <TableHead onClick={() => handleSort('date', true)} className="cursor-pointer">
                            Issued Date {getSortIcon('date')}
                          </TableHead>
                          <TableHead>
                            Participation
                          </TableHead>
                          <TableHead>
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCertifications.map((cert, index) => (
                          <TableRow key={cert.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{cert.certification_name}</TableCell>
                            <TableCell>{new Date(cert.certification_date).toLocaleDateString()}</TableCell>
                            <TableCell>{cert.participation}</TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                size="small"
                                startIcon={<DownloadCloud className="h-4" />}
                                onClick={() => handleDownload(cert.certification_file, cert.certification_name)}
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !error && (filteredTrainingPrograms.length > 0 || filteredCertifications.length > 0) && (
            <div className="flex justify-end items centers mt-4 flex-wrap">
              <div className="flex space-x-1">
                <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 border rounded text-sm bg-blue-500 text-white">1</button>
                <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">3</button>
                <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingCertification;