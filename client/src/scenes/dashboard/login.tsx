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
  // const { setUserId } = useAuth();
  // const navigation = useNavigation();
  const history = useNavigate();
  const navigate = useNavigate();
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
      <div className="left-side">Hi!</div>
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
      </div>
    </div>
  );
};

export default Login;
