import { collaborators } from "../Data";

export default function AddTask() {
  return (
    <>
      <div className="bg-white rounded-lg h-full flex flex-col  items-center p-4">
        <form className="flex flex-col gap-2 h-full justify-between items-start">
          <h1>New Project</h1>
          <>
            <div className="grid gap-1 w-full">
              <input
                type="text"
                className="input text-sm px-4 py-2 bg-blue-50 rounded-md outline-none tracking-wide leading-none"
                placeholder="Tittle"
              />
              {/* <input
                type="text"
                className="input px-4 py-2 bg-blue-50 rounded-md outline-none tracking-wide leading-none"
                placeholder="Deadline"
              /> */}
            </div>
            <div className="collaborators grid gap-4">
              {/* <p className="text-sm font-[900]">Add Collaborator</p> */}
              <div className="collaborator flex flex-wrap w-full gap-2 overflow-y-scroll">
                {collaborators.map((collaborator) => {
                  return (
                    <div
                      className="flex items-center bg-blue-50 w-fit rounded-full p-1 px-2 gap-2 "
                      key={collaborator.id}
                    >
                      <img
                        src={collaborator.avatar}
                        alt={collaborator.alt}
                        height={30}
                        width={30}
                      />
                      <p className="text-[8px] tracking-tight">
                        {collaborator.name}
                      </p>
                      <button className="rotate-45 text-lg font-bold">+</button>
                    </div>
                  );
                })}
              </div>
              <button className="flex items-center bg-blue-50 w-fit rounded-full py-1 px-3  text-xl">
                +
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2 leading-none font-normal text-sm bg-blue-600 text-white tracking-wide rounded-md hover:bg-blue-700"
            >
              Add Project
            </button>
          </>
        </form>
      </div>
    </>
  );
}
