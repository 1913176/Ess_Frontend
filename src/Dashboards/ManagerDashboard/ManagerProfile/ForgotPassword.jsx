// import React from 'react'

// const ForgotPassword = () => {
//   return (
//       <div className='w-[420px] bg-white shadow-md rounded-lg p-2'>
//           <p className='p-2'>Forgot Password</p>
//           <p className='p-1'>Enter your Email</p>
//           <input type="text" className='p-1 border border-gray-300 rounded-md w-[400px]' />
//           <p className='p-1 rounded-md bg-blue-400 w-[150px] text-white text-center mt-2'>Send reset Link</p>
//     </div>
//   )
// }

// export default ForgotPassword

import React, { useState } from "react";

const ForgotPassword = () => {
  // State for email input and confirmation message
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle sending reset link
  const handleSendResetLink = () => {
    if (!email) {
      setMessage("Please enter your email.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("Please enter a valid email address.");
    } else {
      setMessage("Reset link has been sent to your email!");
      setEmail(""); // Clear the input after submission
    }
  };

  return (
    <div className="w-[420px] bg-white shadow-md rounded-lg p-2">
      <p className="p-2">Forgot Password</p>
      <p className="p-1">Enter your Email</p>
      <input
        type="text"
        value={email}
        onChange={handleInputChange}
        placeholder="Enter your email"
        className="p-1 border border-gray-300 rounded-md w-[400px]"
      />
      <p
        onClick={handleSendResetLink}
        className="p-1 rounded-md bg-blue-400 w-[150px] text-white text-center mt-2 cursor-pointer"
      >
        Send Reset Link
      </p>
      {/* Show confirmation or error message */}
      {message && (
        <p className="mt-2 text-sm text-center text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default ForgotPassword;
