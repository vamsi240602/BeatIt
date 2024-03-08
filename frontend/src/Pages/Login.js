import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [errmessage, setErrmessage] = useState("");

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleLogin = (e) => {
    e.preventDefault();
    if (name === "" || pass === "") {
      if (name === "" && pass === "") {
        setErrmessage("Please fill username and password");
      } else {
        if (name === "") {
          setErrmessage("Please fill username");
        } else {
          setErrmessage("Please fill password");
        }
      }
    } else {
      axios
        .post("http://localhost:3001/login", {
          name: name,
          pass: pass,
        })
        .then((res) => {
          if (res.data.status === "pass") {
            console.log(`user logged in: ${res.data.user}`);
            navigate("/");
          } else {
            setErrmessage(res.data.message);
          }
        });
    }
  };

  function handleNavhome() {
    navigate("/");
  }

  function handleNavRegis() {
    navigate("/register");
  }

  return (
    <div className="container">
      <div className="login-container login-container-add-margin">
        <div className="login-logo">
          Welcome to <i>Beat it!</i>
        </div>
        <div className="login-type">
          <i>Log in</i>
        </div>
        <form>
          <input
            placeholder="Username"
            onChange={(e) => setName(e.target.value)}
          ></input>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPass(e.target.value)}
          ></input>
          <button type="submit" onClick={handleLogin}>
            Login
          </button>
          <button id="surf" onClick={handleNavhome}>
            Surf Anonymously
          </button>
          <button className="reg" onClick={handleNavRegis}>
            New user? Sign up
          </button>
        </form>
        {errmessage && (
          <div className="loginerror">
            <i>{errmessage}</i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
