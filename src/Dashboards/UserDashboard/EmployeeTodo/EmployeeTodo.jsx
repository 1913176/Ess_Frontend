"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const EmployeeTodo = () => {
  const [todos, setTodos] = useState([
    // {
    //   id: 1,
    //   title: "Test Final Present",
    //   timeStart: "09:00",
    //   timeEnd: "10:30",
    //   color: "#4CAF50",
    //   date: new Date().toISOString().split("T")[0],
    //   attendees: 5,
    //   icon: "document",
    // },
    // {
    //   id: 2,
    //   title: "Finishing Web AI",
    //   timeStart: "08:30",
    //   timeEnd: "10:00",
    //   color: "#2196F3",
    //   date: new Date().toISOString().split("T")[0],
    //   attendees: 8,
    //   icon: "web",
    // },
  ])
  const [newTodo, setNewTodo] = useState("")
  const [newTimeStart, setNewTimeStart] = useState("09:00")
  const [newTimeEnd, setNewTimeEnd] = useState("10:00")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#2C87F2")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingTodo, setEditingTodo] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [viewingTodo, setViewingTodo] = useState(null)

  // Generate all 24 hours time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysOfWeek = () => {
    const days = []
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - currentDate.getDay())
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const daysOfWeek = getDaysOfWeek()

  const getYearRange = () => {
    const currentYear = new Date().getFullYear()
    // Return a range of 100 years (50 years before and 49 years after current year)
    return Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)
  }

  const handleCreateOrUpdateTodo = () => {
    if (!newTodo.trim()) {
      alert("Please enter a title")
      return
    }
    if (newTimeStart >= newTimeEnd) {
      alert("End time must be after start time")
      return
    }

    const todoData = {
      id: editingTodo ? editingTodo.id : Date.now(),
      title: newTodo,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      color: selectedColor,
      date: selectedDate.toISOString().split("T")[0],
      attendees: Math.floor(Math.random() * 5) + 3, // Random number of attendees for demo
      icon: editingTodo ? editingTodo.icon : "document",
    }

    if (editingTodo) {
      setTodos((prev) => prev.map((todo) => (todo.id === editingTodo.id ? todoData : todo)))
    } else {
      setTodos((prev) => [...prev, todoData])
    }

    setNewTodo("")
    setNewTimeStart("09:00")
    setNewTimeEnd("10:00")
    setSelectedColor("#2C87F2")
    setShowCreateForm(false)
    setEditingTodo(null)
  }

  const handleEditTodo = (todo) => {
    setEditingTodo(todo)
    setNewTodo(todo.title)
    setNewTimeStart(todo.timeStart)
    setNewTimeEnd(todo.timeEnd)
    setSelectedColor(todo.color)
    setSelectedDate(new Date(todo.date))
    setShowCreateForm(true)
    setViewingTodo(null)
  }

  const handleViewTodo = (todo) => {
    setViewingTodo(todo)
  }

  const handleDeleteTodo = (id) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
      setViewingTodo(null)
    }
  }

  const handleAddTodo = (date, time, timeIndex) => {
    setSelectedDate(date)
    setNewTimeStart(time)
    // Set default end time to 1 hour later
    const [hours, minutes] = time.split(":").map(Number)
    const endHour = (hours + 1) % 24
    const endTime = `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    setNewTimeEnd(endTime)
    setShowCreateForm(true)
    setEditingTodo(null)
  }

  const filteredTodos = todos.filter((todo) => 
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTodosForDay = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return filteredTodos.filter((todo) => todo.date === dateStr)
  }

  const showPreviousWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }

  const showNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }

  const handleMonthChange = (monthIndex) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(monthIndex)
      return newDate
    })
    setShowDatePicker(false)
  }

  const handleYearChange = (year) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(year)
      return newDate
    })
    setShowDatePicker(false)
  }

  const formatDateRange = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    return `${startOfWeek.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })} - ${endOfWeek.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`
  }

  // Format time to AM/PM format
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Use filteredTodos instead of todos for display
  const displayTodos = filteredTodos

  const getDisplayTodosForDay = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return displayTodos.filter((todo) => todo.date === dateStr)
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "meeting":
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <Calendar className="w-3 h-3" />
          </div>
        )
      case "web":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <Calendar className="w-3 h-3" />
          </div>
        )
      case "photo":
        return (
          <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
            <Camera className="w-3 h-3" />
          </div>
        )
      case "feedback":
        return (
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
            <Clock className="w-3 h-3" />
          </div>
        )
      case "document":
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-500">
            <FileText className="w-3 h-3" />
          </div>
        )
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-500">
            <Calendar className="w-3 h-3" />
          </div>
        )
    }
  }

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Find the closest time slot for a given time
  const findClosestTimeSlot = (timeStr) => {
    const minutes = timeToMinutes(timeStr)
    const hourSlot = Math.floor(minutes / 60)
    return timeSlots[hourSlot]
  }

  // Calculate the row span for a task based on its duration
  const calculateRowSpan = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)

    // Handle cases where end time is on the next day
    let duration = endMinutes - startMinutes
    if (duration < 0) {
      duration += 24 * 60
    }

    // Calculate how many hour slots this spans
    return Math.ceil(duration / 60)
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto py-4 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Calendar</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                // Create a text representation of todos
                const todoText = displayTodos
                  .map(
                    (todo) =>
                      `${todo.title}\nDate: ${new Date(todo.date).toLocaleDateString()}\nTime: ${formatTime(todo.timeStart)} - ${formatTime(todo.timeEnd)}\n\n`,
                  )
                  .join("")

                // Create a blob and download link
                const blob = new Blob([todoText], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "calendar-todos.txt"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                if (todos.length === 0 && displayTodos.length > 0) {
                  alert("Please create your own todos first before deleting.")
                } else if (todos.length > 0) {
                  if (window.confirm("Are you sure you want to delete all todos?")) {
                    setTodos([])
                  }
                } else {
                  alert("No todos to delete.")
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete All Todos
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search todos..."
                className="pl-8 w-[200px] h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                setShowCreateForm(true)
                setEditingTodo(null)
              }}
            >
              Create Todo
            </Button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <div>
            <div className="flex items-center gap-4">
              <h2
                className="text-2xl font-bold cursor-pointer hover:text-blue-600 flex items-center gap-2"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
                <Edit className="w-4 h-4" />
              </h2>
              {showDatePicker && (
                <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg p-4 z-10 border">
                  <div className="flex justify-between items-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentDate(new Date())
                        setShowDatePicker(false)
                      }}
                    >
                      Today
                    </Button>
                    <div className="flex gap-2">
                      <select
                        className="p-2 border rounded"
                        value={currentDate.getMonth()}
                        onChange={(e) => handleMonthChange(Number.parseInt(e.target.value))}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        className="p-2 border rounded"
                        value={currentDate.getFullYear()}
                        onChange={(e) => handleYearChange(Number.parseInt(e.target.value))}
                      >
                        {getYearRange().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowDatePicker(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="text-xs font-medium text-gray-500 p-2">
                        {day}
                      </div>
                    ))}
                    {(() => {
                      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                      const days = []

                      // Add empty cells for days before the first day of the month
                      for (let i = 0; i < firstDay.getDay(); i++) {
                        days.push(<div key={`empty-${i}`} className="p-2"></div>)
                      }

                      // Add days of the month
                      for (let i = 1; i <= lastDay.getDate(); i++) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
                        const isToday = date.toDateString() === new Date().toDateString()

                        days.push(
                          <button
                            key={i}
                            className={`p-2 rounded-full w-8 h-8 flex items-center justify-center ${
                              isToday ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              const newDate = new Date(currentDate)
                              newDate.setDate(i)
                              setCurrentDate(newDate)
                              setShowDatePicker(false)
                            }}
                          >
                            {i}
                          </button>,
                        )
                      }

                      return days
                    })()}
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-500">{formatDateRange()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={showPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={showNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="relative">
          {/* Header row */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 text-center border-r">
              <span className="text-sm font-medium text-gray-500">GMT+7</span>
            </div>
            {daysOfWeek.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = index === 2 // Tuesday is selected in the example
              return (
                <div
                  key={index}
                  className={`p-3 text-center border-r ${isSelected ? "border-b-2 border-b-blue-500" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-500" : "text-gray-500"}`}>
                      {date.toLocaleDateString("en-US", { weekday: "long" })}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-500" : ""}`}>{date.getDate()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time slots and events */}
          <div className="relative">
            {/* Movable time indicator line */}
            <div
              className="absolute left-0 w-full border-t-2 border-blue-500 cursor-ns-resize z-20 flex items-center"
              style={{ top: "160px" }} // Default position at 2 AM (2 * 80px)
              onMouseDown={(e) => {
                const startY = e.clientY
                const lineElement = e.currentTarget
                const initialTop = Number.parseInt(lineElement.style.top || "160")

                const handleMouseMove = (moveEvent) => {
                  const deltaY = moveEvent.clientY - startY
                  const newTop = initialTop + deltaY
                  if (newTop >= 0 && newTop <= 1920) {
                    // 24 hours * 80px
                    lineElement.style.top = `${newTop}px`

                    // Update time label
                    const hour = Math.floor(newTop / 80)
                    const minute = Math.floor(((newTop % 80) / 80) * 60)
                    const timeLabel = document.getElementById("time-indicator-label")
                    if (timeLabel) {
                      const ampm = hour >= 12 ? "PM" : "AM"
                      const hour12 = hour % 12 || 12
                      timeLabel.textContent = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`
                    }
                  }
                }

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove)
                  document.removeEventListener("mouseup", handleMouseUp)
                }

                document.addEventListener("mousemove", handleMouseMove)
                document.addEventListener("mouseup", handleMouseUp)
              }}
            >
              <div className="absolute -left-1 -top-2 w-4 h-4 bg-blue-500 rounded-full"></div>
              <div
                id="time-indicator-label"
                className="absolute -left-16 -top-3 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              >
                2:00 AM
              </div>
            </div>

            {/* Time slots */}
            {timeSlots.map((time, timeIndex) => {
              const hour = timeIndex
              const displayHour = hour
              const ampm = hour >= 12 ? "PM" : "AM"

              return (
                <div key={time} className="grid grid-cols-8 border-b relative">
                  {/* Time column */}
                  <div className="p-3 border-r text-center relative">
                    <span className="text-sm text-gray-500">
                      {displayHour} {ampm}
                    </span>
                  </div>

                  {/* Day columns */}
                  {daysOfWeek.map((date, dayIndex) => {
                    return (
                      <div
                        key={`${time}-${dayIndex}`}
                        className="p-2 border-r min-h-[80px] relative"
                        onClick={() => handleAddTodo(date, `${hour.toString().padStart(2, "0")}:00`, timeIndex)}
                      >
                        {/* Empty cell content */}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Overlay the events on top of the grid */}
            {displayTodos.map((todo) => {
              // Convert times to determine position
              const [startHour, startMinute] = todo.timeStart.split(":").map(Number)
              const [endHour, endMinute] = todo.timeEnd.split(":").map(Number)

              // Calculate position and height
              const topPosition = startHour * 80 + (startMinute / 60) * 80
              const duration = (endHour - startHour) * 60 + (endMinute - startMinute)
              const height = (duration / 60) * 80

              // Find which day column this belongs to
              const todoDate = new Date(todo.date)
              const dayIndex = daysOfWeek.findIndex(
                (day) => day.toISOString().split("T")[0] === todoDate.toISOString().split("T")[0],
              )

              if (dayIndex === -1) return null

              // Calculate left position (which day column)
              const leftPosition = (dayIndex + 1) * (100 / 8) // +1 because of the time column

              return (
                <div
                  key={todo.id}
                  className="absolute rounded-md border shadow-sm p-2 mx-2 z-10 cursor-pointer overflow-hidden"
                  style={{
                    top: `${topPosition}px`,
                    height: `${height}px`,
                    left: `${leftPosition}%`,
                    width: `calc(${100 / 8}% - 16px)`,
                    backgroundColor: "white",
                    borderColor: todo.color,
                    borderLeftWidth: "3px",
                  }}
                  onClick={() => handleViewTodo(todo)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getEventIcon(todo.icon)}
                    <span className="text-sm font-medium truncate">{todo.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(todo.timeStart)} - {formatTime(todo.timeEnd)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Create/Edit Todo Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTodo ? "Edit Todo" : "Create Todo"}</DialogTitle>
              <p className="text-gray-500 text-sm mt-1">
                {editingTodo ? "Modify the todo details below" : "Fill in the data below to add a todo"}
              </p>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title Todo</label>
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Enter todo title"
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <Input
                    type="date"
                    className="flex-1"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <Input
                      type="time"
                      className="flex-1"
                      value={newTimeStart}
                      onChange={(e) => setNewTimeStart(e.target.value)}
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="flex items-center flex-1">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <Input
                      type="time"
                      className="flex-1"
                      value={newTimeEnd}
                      onChange={(e) => setNewTimeEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingTodo(null)
                    setNewTodo("")
                    setNewTimeStart("09:00")
                    setNewTimeEnd("10:00")
                    setSelectedColor("#2C87F2")
                  }}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleCreateOrUpdateTodo}>
                  {editingTodo ? "Update" : "Continue"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Todo Modal */}
        <Dialog open={!!viewingTodo} onOpenChange={(open) => !open && setViewingTodo(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Todo Details</DialogTitle>
            </DialogHeader>

            {viewingTodo && (
              <div className="py-4">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${viewingTodo.color}20`, color: viewingTodo.color }}
                    >
                      {getEventIcon(viewingTodo.icon)}
                    </div>
                    <h3 className="text-lg font-semibold">{viewingTodo.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-sm">
                          {new Date(viewingTodo.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="text-sm">
                          {formatTime(viewingTodo.timeStart)} - {formatTime(viewingTodo.timeEnd)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeleteTodo(viewingTodo.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleEditTodo(viewingTodo)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Missing components that need to be defined
const Bell = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

const ChevronDown = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const ChevronLeft = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

const ChevronRight = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

const Download = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

const Camera = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

const FileText = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}

export default EmployeeTodo