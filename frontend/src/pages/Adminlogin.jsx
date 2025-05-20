import React from "react";
import "./../styles/Login.css";
import { FaUserShield, FaLock } from "react-icons/fa";

const AdminLogin = () => {
  return (
    <div className="login-container">
      <form className="login-form">
        <h2><FaUserShield /> Admin Login</h2>
        <div className="input-icon">
          <FaUserShield />
          <input type="text" placeholder="Admin Username" required />
        </div>
        <div className="input-icon">
          <FaLock />
          <input type="password" placeholder="Password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
