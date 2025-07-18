"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TicketChart() {
  const [view, setView] = useState("monthly")

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Ticket Timelines</CardTitle>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px] w-full">
          {/* This is a placeholder for the chart. In a real implementation, you would use a charting library like Chart.js, Recharts, etc. */}
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500">Ticket Timeline Chart</p>
              <p className="text-sm text-gray-400">Data visualization would appear here</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full text-sm text-gray-500">
          <span>Total Tickets: 1,245</span>
          <span>Avg. Resolution Time: 2.3 days</span>
        </div>
      </CardFooter>
    </Card>
  )
}
