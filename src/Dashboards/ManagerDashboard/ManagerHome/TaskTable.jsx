import { modules_data } from "../Data";
// import "locomotive-scroll/dist/locomotive-scroll.css";

export default function TaskTable() {
  return (
    <div className="bg-white h-full rounded-lg p-4 overflow-hidden">
      <h1 className="text-2xl">Task</h1>
      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-5 justify-between">
            <th className="py-2">Project Name</th>
            <th className="py-2">Timeline</th>
            <th className="py-2"> Members</th>
            <th className="py-2">Status</th>
            <th className="py-2">Details</th>
          </tr>
        </thead>
        <tbody className="text-xs overflow-y-scroll">
          <>
            {modules_data.map((module) => {
              return (
                <tr
                  className="grid grid-cols-5 justify-between gap-4"
                  key={module.id}
                >
                  <td className="flex justify-center items-center">
                    {module.name}
                  </td>
                  <td className="flex justify-center items-center text-center">
                    {module.timeLine}
                  </td>
                  <td className="flex justify-center items-center">
                    {module.members_imgs.map((imgs) => {
                      return (
                        <img
                          src={imgs.img}
                          height={25}
                          width={25}
                          key={imgs.img}
                          className="h-fit"
                        />
                      );
                    })}
                  </td>
                  <td className="flex justify-center items-center">
                    {module.status}
                  </td>
                  <td className="flex justify-center items-center">
                    <button className="px-2 py-1 rounded-md bg-blue-600 text-white ">
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </>
        </tbody>
      </table>
    </div>
  );
}
