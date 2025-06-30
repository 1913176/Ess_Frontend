export default function UpcomingDeadline({ upcoming_data }) {
  const datas = upcoming_data;

  return (
    <div className="bg-white h-full rounded-lg px-4">
      <div className="title p-4">Upcoming Deadline</div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-scroll h-[350px]">
        {datas.map((data, index) => {
          return <Deadline {...data} key={index} className="drop-shadow-lg" />;
        })}
      </div>
    </div>
  );
}

const Deadline = (props) => {
  return (
    <div className="deadline max-w-[300px] flex flex-col gap-6 p-4 rounded-md text-black border-[1px] border-blue-100 shadow-lg">
      <div className="top flex justify-between items-center">
        <div className="date text-blue-600 text-xs bg-blue-100 py-1 px-3 rounded-full">
          {props.project_assigned_Date}
        </div>
        <div className="deadline-menu px-2">
          <img src="/images/menu_3point.svg" alt="menu" />
        </div>
      </div>
      <div className="med flex flex-col items-center">
        <h1 className="text-2xl leading-none">{props.project_name}</h1>
        <p className="text-sm">{props.project_progress}</p>
      </div>
      <div className="bottom flex flex-col gap-4">
        <div className="progress-bar flex flex-col gap-2">
          <div className="progress-bar-top flex justify-between">
            <p className="text-sm">progress</p>
            <div className="progress-percentage text-sm">
              {props.project_progress_status}%
            </div>
          </div>
          <div className="h-3 relative">
            <div className="progress-bar-total h-2 bg-red-50 rounded-full relative" />
            <div
              className="progress-bar-fill top-0 left-0 bg-blue-600 h-2 absolute z-10 rounded-full"
              style={{ width: `${props.project_progress_status}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="collaborator flex items-center gap-4">
            <div className="members flex">
              {props.project_members.map((img) => {
                return (
                  <img
                    src={img.avatar}
                    alt={img.name}
                    height={24}
                    width={24}
                    key={img.id}
                    className="rounded-full"
                  />
                );
              })}
            </div>
            <button className="bg-blue-600 text-2xl leading-none text-white px-2 py-1 rounded-full">
              +
            </button>
          </div>
          <div className="deadline text-blue-600 text-xs bg-blue-100 py-1 px-3 rounded-full">
            {props.project_due_in_days} Days
          </div>
        </div>
      </div>
    </div>
  );
};
