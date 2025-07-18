import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleReset = () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage("A reset link has been sent to your email.");
    }, 1000);
  };

  return (
    <div className="p-4 max-w-md mx-auto border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-lg font-bold mb-2">Forgot Password</h1>
      <p className="text-sm mb-2">Enter your email to receive a reset link.</p>
      <input
        type="email"
        value={email}
        onChange={handleInputChange}
        className="w-full border border-gray-300 rounded-md p-2 mb-2"
        placeholder="Enter your email"
      />
      <button
        onClick={handleReset}
        className="bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600"
      >
        Send Reset Link
      </button>
      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
