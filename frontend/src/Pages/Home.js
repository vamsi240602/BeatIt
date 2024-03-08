import React, { useEffect, useState } from "react";
import Beat from "../Components/Beat";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [beats, setBeats] = useState([]);
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  useEffect(() => {
    // console.log("username fetched");
    axios
      .get("http://localhost:3001/getuser")
      .then((res) => {
        if (res.data.status === "pass") {
          setUser(res.data.name);
        } else {
          console.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error(error.message);
      });

    // console.log("beats fetched");
    axios.get("http://localhost:3001/getallbeats").then((res) => {
      if (res.data.status === "pass") {
        setBeats(res.data.beats);
        console.log(beats);
      } else {
        console.error(res.data.message);
      }
    });
  }, []);

  function handleNavprofile() {
    navigate(`/${user}`);
  }

  function handleNavLogin() {
    navigate("/login");
  }

  function handleDeletebeat(beat_id) {
    // console.log(`${beat_id} deleted`);
    setBeats(beats.filter((beat) => beat.id !== beat_id));
  }

  return (
    <div className="container">
      <div className="beat-container">
        <div className="home-username">
          Hello, <i>{user ? user : "Random user"}</i>
        </div>
        <div className="home-nav">
          <div>All beats</div>
          {user ? (
            <button onClick={handleNavprofile}>Go to my Profile</button>
          ) : (
            <button onClick={handleNavLogin}>Log in</button>
          )}
        </div>
        {beats.map((beat) => {
          return (
            <Beat
              key={beat.id}
              id={beat.id}
              content={beat.content}
              name={beat.name}
              likes={beat.likes}
              date={beat.date}
              onDeletebeat={handleDeletebeat}
              // onUpdatebeat={handleUpdatebeat}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Home;
