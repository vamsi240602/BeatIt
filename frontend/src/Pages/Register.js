import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errmessage, setErrmessage] = useState("");
  const [picture, setPicture] = useState("");

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleRegister = (e) => {
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
    } else if (pass.length < 6) {
      setErrmessage("Password must be min of 6 characters");
    } else {
      const formData = new FormData();
      formData.append("user", name);
      formData.append("email", email);
      formData.append("pass", pass);
      formData.append("picture", picture);
      axios
        .post("http://localhost:3001/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.status === "pass") {
            console.log("user registered");
            navigate("/login");
          } else {
            //console.log(res.data.message);
            setErrmessage(res.data.message);
          }
        });
    }
  };

  function handleNavhome() {
    navigate("/");
  }

  function handleNavLogin() {
    navigate("/login");
  }

  return (
    <>
      <div className="container">
        <div className="login-container">
          <div className="login-logo">
            Welcome to <i>Beat it!</i>
          </div>
          <div className="login-type">
            <i>Register</i>
          </div>
          <form>
            <input
              placeholder="Username"
              onChange={(e) => setName(e.target.value)}
            ></input>
            <input
              placeholder="Email (optional)"
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPass(e.target.value)}
            ></input>
            <label>👇Choose profile picture</label>
            <input
              type="file"
              onChange={(e) => setPicture(e.target.files[0])}
            ></input>
            <button type="submit" onClick={handleRegister}>
              Register
            </button>
            <button id="surf" onClick={handleNavhome}>
              Surf Anonymously
            </button>
            <button id="reg" onClick={handleNavLogin}>
              Already an user? Log in
            </button>
          </form>
          {errmessage && (
            <div className="loginerror">
              <i>{errmessage}</i>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
