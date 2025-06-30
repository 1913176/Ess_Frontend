import AddTask from "../../components/AddTask";
import CounterCards from "../../components/CounterCards";
// import News from "../../components/News";
// import ProjectStatistics from "../../components/ProjectStatistics";
// import TaskTable from "../../components/TaskTable";
// import UpcomingDeadline from "../../components/UpcomingDeadline";

export default function Dashboard() {
  return (
    <>
      <div className="main-dashboard-wrapper grid grid-cols-2 lg:grid-cols-4 auto-rows-[130px] h-full w-full gap-4 p-4 overflow-y-auto">
        <div className="box grid sm:grid-cols-2 md:grid-cols-3 col-span-2 row-span-6 sm:row-span-3 md:row-span-2 lg:col-span-3 gap-4">
          {/* Counter Cards */}
          <CounterCards {...total_project} />
        </div>

        {/* Add Task */}
        <div
          className="box row-span-2
        col-span-2 sm:col-span-1 lg:col-span-1"
        >
          <AddTask />
        </div>

        {/* Project Statistics */}
        <div
          className="box row-span-2
        col-span-2 sm:col-span-1 lg:col-span-2 "
        >
          {/* <ProjectStatistics data={chartData} /> */}
        </div>

        {/* Task Table */}
        <div className="box row-span-2 col-span-2 lg:col-span-2">
          {/* <TaskTable /> */}
        </div>

        {/* News */}
        <div className="box row-span-2 col-span-2 sm:col-span-1 sm:row-span-3 lg:col-span-1">
          {/* <News news={news_data} /> */}
        </div>

        {/* Upcoming Deadline */}
        <div className="box row-span-3 col-span-2 sm:col-span-1 lg:col-span-3">
          {/* <UpcomingDeadline upcoming_data={deadline_projects} /> */}
        </div>
      </div>
    </>
  );
}
