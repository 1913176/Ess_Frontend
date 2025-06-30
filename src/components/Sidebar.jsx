// import React from "react";
// import { NavLink, useLocation } from "react-router-dom";

// const Sidebar = ({ NavPaths }) => {
//   const location = useLocation();

//   return (
//     <div className="sticky top-0 z-10 left-0 bg-slate-100 text-sm p-2">
//       <ul className="list-none p-0">
//         {NavPaths.map((NavPath) => (
//           <NavLink
//             key={NavPath.label}
//             to={NavPath.path}
//             className={({ isActive }) =>
//               `py-2.5 px-2.5 my-1.5  lg:pr-10 flex items-center space-x-2 cursor-pointer text-slate-800 hover:bg-blue-500 hover:text-white rounded no-underline ${
//                 isActive ? "bg-primary text-white" : "bg-transparent"
//               }`
//             }>
//             <span className="text-xl">{NavPath.icon}</span>

//             <span className="hidden lg:block">{NavPath.label}</span>
//           </NavLink>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ NavPaths }) => {
  const location = useLocation();

  return (
    <div className="sticky top-0 z-10 left-0 bg-white text-sm">
      <ul className="list-none p-0 flex border flex-wrap">
        {NavPaths.map((NavPath, index) => (
          <NavLink
            // key={NavPath.label}
            key={index}
            to={NavPath.path}
            className={({ isActive }) =>
              `py-2.5 px-2.5 leading-10 tracking-wide grid place-items-center space-x-2 cursor-pointer text-slate-800 hover:border-b-2 border-b-blue-600  font-medium text-base no-underline ${
                isActive
                  ? "border-b-2 border-b-blue-600 text-primary"
                  : "bg-transparent"
              }`
            }
          >
            {/* <span className="text-xl">{NavPath.icon}</span> */}

            <span>{NavPath.label}</span>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
