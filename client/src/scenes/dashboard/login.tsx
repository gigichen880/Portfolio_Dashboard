import { Box, useMediaQuery, ThemeProvider, Typography } from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "../../theme";
import axios from "axios";
import "./login.css";
import { Link } from "react-router-dom";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);
  // const { setUserId } = useAuth();
  // const navigation = useNavigation();
  const history = useNavigate();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger the typing effect
    const timer = setTimeout(() => {
      setTypingFinished(true);
    }, 4000); // Wait for 4 seconds (duration of the animation)

    return () => clearTimeout(timer);
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (email == "") {
      alert("Email is empty!");
      return;
    }
    if (password == "") {
      alert("Password is empty!");
      return;
    }

    try {
      console.log(email, password);
      await axios
        .post("http://localhost:1337/login", {
          email: email,
          password: password,
        })
        .then((res) => {
          console.log(res);
          if (res.data == "notmatch") {
            alert("Wrong password");
            return;
          } else if (res.data == "notexist") {
            alert("User does not exist");
            return;
          } else {
            navigate("/");
          }
        })
        .catch((e) => {
          alert("An error occured");
          console.log(e);
        });
    } catch (e) {
      alert("An error occured");
      console.log(e);
    }
  }

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
        <h1 className="title">Login</h1>

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input className="submitButton" type="submit" onClick={submit} />
        <Link to="/signup" className="link">
          No account yet? Create one
        </Link>
      </div>
    </div>
  );
};

export default Login;
