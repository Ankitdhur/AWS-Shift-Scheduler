import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "react-calendar";
import * as XLSX from "xlsx";
import { ChevronDown, ChevronUp, MenuIcon } from "lucide-react";
import {motion} from "framer-motion";
import "react-calendar/dist/Calendar.css";

const shiftLegend = {
  M: "Morning Shift",
  A: "Afternoon Shift",
  N: "Night Shift",
  G: "General Shift",
};

const shiftTimings = {
  M: "7:00 AM - 4:00 PM",
  A: "2:30 PM - 11:30 PM",
  N: "10:30 PM - 7:30 AM",
  G: "9:30 AM - 6:30 PM",
};

const shiftCodes = ["M", "A", "N", "G"];

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employeeData, setEmployeeData] = useState([]);
  const [expandedShift, setExpandedShift] = useState(null);
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!jsonData.length || !jsonData[0]) {
        alert("The uploaded Excel sheet is empty or invalid.");
        return;
      }

      const dateColumns = Object.keys(jsonData[0]).filter(key => key !== "Resource Name");

      const transformed = jsonData.map((row) => {
        const { "Resource Name": name, ...dates } = row;
        const schedule = {};

        dateColumns.forEach((dateKey) => {
          const parsedDate = new Date(dateKey);
          if (!isNaN(parsedDate)) {
            const normDate = format(parsedDate, "yyyy-MM-dd");
            schedule[normDate] = row[dateKey];
          }
        });

        return { name, schedule };
      });

      setEmployeeData(transformed);
    };

    if (file) reader.readAsArrayBuffer(file);
  };

  const getEmployeesForShift = (shiftCode) => {
    return employeeData.filter((emp) => emp.schedule[formattedDate] === shiftCode);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] pt-24 pb-10">
      {/* Header */}
<div className="fixed top-0 left-0 right-0 z-20">
  <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
    <div className="flex items-center justify-between w-[60%]">
      <img
        src="https://realcash.in/img/axis-max-life-insurance-logosvg-1.png"
        alt="Axis Logo"
        className="h-10"
      />
      <motion.h1
      className="text-xl md:text-2xl font-bold text-[#9A145D] tracking-tight"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2, ease: "easeOut",type: "spring" }}
    >AWS Employee Shift Schedule
    </motion.h1>
    </div>
    <MenuIcon className="text-[#9A145D]" />
  </header>
  <hr className="h-[2px] bg-[#9A145D] border-0 m-0 p-0" />
  <hr className="h-[1.5px] bg-blue-700 border-0 m-0 p-0" />
</div>
      

      {/* File Upload */}
      <div className="max-w-2xl mx-auto mb-8">
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Upload Shift Excel File
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#0088CC] focus:outline-none"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="bg-white p-4 rounded-2xl shadow w-full md:w-1/3">
          <h2 className="text-lg font-semibold text-blue-700 mb-3">Select Date</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
            maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)}
            className="react-calendar border-none text-sm"
          />
        </div>

        {/* Shift Information */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Shifts on {formattedDate}
          </h2>

          {shiftCodes.map((code) => {
            const isOpen = expandedShift === code;
            const employees = getEmployeesForShift(code);

            return (
              <div key={code} className="mb-4 bg-white rounded-xl shadow border">
                <button
                  onClick={() =>
                    setExpandedShift((prev) => (prev === code ? null : code))
                  }
                  className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-[#f0faff] rounded-t-xl transition-all"
                >
                  <div>
                    <p className="text-base font-medium text-[#9A145D]">
                      {shiftLegend[code]} ({code})
                    </p>
                    <p className="text-sm text-gray-500">{shiftTimings[code]}</p>
                  </div>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isOpen && (
                  <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                    {employees.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        {employees.map((emp) => (
                          <li key={emp.name}>{emp.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No employees in this shift.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
