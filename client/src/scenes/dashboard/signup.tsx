import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAuth } from "../AuthContext"; // Adjust the path to your AuthContext file
import "./login.css";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Link,
} from "react-router-dom";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);
  const requirements = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    number: /\d/,
    special: /[@$!%*?&]/,
    length: /.{8,}/,
  };

  // State to track validation
  const [validation, setValidation] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });
  const navigate = useNavigate();
  useEffect(() => {
    // Trigger the typing effect
    const timer = setTimeout(() => {
      setTypingFinished(true);
    }, 4000); // Wait for 4 seconds (duration of the animation)

    return () => clearTimeout(timer);
  }, []);
  // Handle password validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);

    // Check each requirement
    const newValidation = {
      lowercase: requirements.lowercase.test(value),
      uppercase: requirements.uppercase.test(value),
      number: requirements.number.test(value),
      special: requirements.special.test(value),
      length: requirements.length.test(value),
    };

    setValidation(newValidation);
  };
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
      console.log("????", data);

      if (data === "accountExist") {
        alert("Account Exists");
      } else if (data === "usernameExist") {
        alert("Username Exists");
      } else if (data.message === "newUser") {
        alert("Signup Successful");
        const alertType = "null";
        navigate("/", {
          state: { username, phone, email, password, alertType },
        });
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
        {typingFinished ? (
          <div className="fixed-text">Welcome Fellow Investors</div>
        ) : (
          <div className="typing-animation">Welcome Fellow Investors</div>
        )}
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
          onChange={(e) => handlePasswordChange(e.target.value)}
          type="password"
        />

        {/* Password Requirements */}
        <div className="password-requirements">
          <ul>
            <li className={validation.lowercase ? "valid" : "invalid"}>
              {validation.lowercase ? "✓" : "✗"} At least one lowercase letter
            </li>
            <li className={validation.uppercase ? "valid" : "invalid"}>
              {validation.uppercase ? "✓" : "✗"} At least one uppercase letter
            </li>
            <li className={validation.number ? "valid" : "invalid"}>
              {validation.number ? "✓" : "✗"} At least one number
            </li>
            <li className={validation.special ? "valid" : "invalid"}>
              {validation.special ? "✓" : "✗"} At least one special character
              (@$!%*?&)
            </li>
            <li className={validation.length ? "valid" : "invalid"}>
              {validation.length ? "✓" : "✗"} Minimum 8 characters
            </li>
          </ul>
        </div>

        <input className="submitButton" type="submit" onClick={handleSignup} />
        <Link to="/login" className="link">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
