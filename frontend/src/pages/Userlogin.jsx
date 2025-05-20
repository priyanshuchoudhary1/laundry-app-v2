import React from "react";
import "./../styles/Login.css";
import { FaUser, FaLock } from "react-icons/fa";

const UserLogin = () => {
  return (
    <div className="login-container">
      <form className="login-form">
        <h2><FaUser /> User Login</h2>
        <div className="input-icon">
          <FaUser />
          <input type="email" placeholder="Email" required />
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

export default UserLogin;
