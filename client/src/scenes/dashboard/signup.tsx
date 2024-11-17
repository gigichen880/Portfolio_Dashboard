import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAuth } from "../AuthContext"; // Adjust the path to your AuthContext file
import "./login.css";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      console.log(JSON.stringify({ username, phone, email, password }));
      const response = await fetch("http://localhost:1337/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone, email, password }),
      });
      const data = await response.json();

      if (data === "accountExist") {
        alert("Account Exists");
      } else if (data === "usernameExist") {
        alert("Username Exists");
      } else if (data.message === "newUser") {
        alert("Signup Successful");

        navigate("/");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred while signing up. Please try again later.");
    }
  };

  return (
    <div className="page">
      <div className="left-side">
        <h1>Hello</h1>
      </div>
      <div className="container">
        <h1 className="title">Sign Up</h1>
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <input className="submitButton" type="submit" onClick={handleSignup} />
      </div>
    </div>
  );
};

export default Signup;
