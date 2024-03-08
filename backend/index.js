import express from "express";
import mysql from "mysql";
import cookieparser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
const saltRounds = 10;
// importing packages

const app = express();
app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.static(`public`));

//const upload = multer({ storage: multer.memoryStorage() });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
// middlewares

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "vamsi143",
  database: "beatit", // write databse name here
});

const isUserexists = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: "fail", message: "no tokens/user donst logged in" });
  } else {
    jwt.verify(token, "my-secret-json-web-token-key", (err, decoded) => {
      if (err)
        res.json({
          status: "fail",
          message: "no valid token/user dosent logged in",
        });
      else {
        req.name = decoded.name;
        next();
      }
    });
  }
};

app.get("/getuser", isUserexists, (req, res) => {
  return res.json({
    status: "pass",
    message: "valid token exists",
    name: req.name,
  });
});

app.post("/getprofile", (req, res) => {
  const sqlQuery = "SELECT * FROM beatit.users WHERE username = ?";
  db.query(sqlQuery, [req.body.username], (err, result) => {
    if (err) {
      res.json({ status: "fail", message: "sql error" });
    }
    if (result.length > 0) {
      res.json({
        status: "pass",
        message: "fetched profile success",
        profile: result[0].profile,
      });
    }
  });
});

app.post("/addbeat", (req, res) => {
  const sqlQuery =
    "INSERT INTO beatit.beats (beat_user, beat_content, beat_likes, beat_date) VALUES (?,?,?,?)";
  db.query(
    sqlQuery,
    [req.body.name, req.body.content, req.body.likes, req.body.date],
    (err, result) => {
      if (err) {
        res.json({ status: "fail", message: err });
      } else {
        res.json({ status: "pass", message: "data added" });
      }
    }
  );
});

app.post("/getbeats", (req, res) => {
  const sqlQuery =
    "SELECT * FROM beatit.beats WHERE beat_user = ? ORDER BY beat_id DESC";
  db.query(sqlQuery, [req.body.name], (err, result) => {
    if (err) {
      res.json({ status: "fail", message: err });
    }
    if (result.length > 0) {
      const b = result.map((beat) => ({
        id: beat.beat_id,
        content: beat.beat_content,
        name: beat.beat_user,
        likes: beat.beat_likes,
        date: beat.beat_date,
      }));
      res.json({ status: "pass", message: "beats found", beats: b });
    } else {
      res.json({ status: "fail", message: "no beats found on user name" });
    }
  });
});

app.get("/getallbeats", (req, res) => {
  const sqlQuery = "SELECT * FROM beatit.beats ORDER BY beat_id DESC";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      res.json({ status: "fail", message: err });
      console.log(err);
      return ;
    }
    if (result.length > 0) {
      const b = result.map((beat) => ({
        id: beat.beat_id,
        content: beat.beat_content,
        name: beat.beat_user,
        likes: beat.beat_likes,
        date: beat.beat_date,
      }));
      res.json({ status: "pass", message: "beats found", beats: b });
    } else {
      res.json({ status: "fail", message: "no beats found on user name" });
    }
  });
});

app.delete("/deletebeat/:id", (req, res) => {
  const sqlQuery = "DELETE FROM beatit.beats WHERE beat_id = ?";
  db.query(sqlQuery, [req.params.id], (err, result) => {
    if (err) {
      res.json({ status: "fail", message: err });
    } else {
      res.json({ status: "pass", message: "delete success" });
    }
  });
});

app.put("/updatebeat", (req, res) => {
  const sqlQuery = "UPDATE beatit.beats SET beat_content = ? WHERE beat_id = ?";
  db.query(sqlQuery, [req.body.content, req.body.id], (err, result) => {
    if (err) {
      res.json({ status: "fail", message: err });
    } else {
      res.json({ status: "pass", message: "update success" });
    }
  });
});

// app.post("/getbeatscount", (req, res) => {
//   const sqlQuery =
//     "SELECT COUNT(beat_content) AS cnt FROM beatit.beats WHERE beat_user = ?";
//   db.query(sqlQuery, [req.body.name], (err, result) => {
//     if (err) {
//       res.json({ status: "fail", message: err });
//     } else {
//       res.json({
//         status: "pass",
//         message: "success getting count",
//         count: result[0].cnt,
//       });
//     }
//   });
// });

app.post("/login", (req, res) => {
  const name = req.body.name;
  const pass = req.body.pass;
  const sqlQuery = "SELECT * FROM beatit.users WHERE username = ?";
  db.query(sqlQuery, name, (err, result) => {
    if (err) {
      res.json({ status: "fail", message: "SQL error" });
      return ;
    }
    if (result.length > 0) {
      bcrypt.compare(pass, result[0].password, (error, response) => {
        if (response) {
          const token = jwt.sign({ name }, "my-secret-json-web-token-key", {
            expiresIn: "1d",
          });
          res.cookie("token", token);
          res.json({
            status: "pass",
            message: "logged in",
            user: name,
          });
        } else {
          res.send({
            status: "fail",
            message: "wrong username/password",
          });
        }
      });
    } else {
      res.send({
        status: "fail",
        message: "user dosent exists",
      });
    }
  });
});

app.post("/userexists", (req, res) => {
  const sqlQuery = "SELECT * FROM beatit.users WHERE username = ?";
  db.query(sqlQuery, [req.body.username], (err, result) => {
    if (err) {
      res.json({ status: "fail", message: "sql error" });
    }
    if (result.length > 0) {
      res.json({ status: "pass", message: "user exists" });
    }
  });
});

app.post("/register", upload.single("picture"), (req, res) => {
  let picture = req.file ? req.file.filename : "";
  // console.log(picture);
  const password = req.body.pass;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    } else {
      const sqlQuery =
        "INSERT INTO beatit.users (username, email, password, profile) VALUES (?,?,?,?)";
      db.query(
        sqlQuery,
        [req.body.user, req.body.email, hash, picture],
        (err, result) => {
          if (err) {
            res.json({ status: "fail", message: "user already exists" });
          } else {
            res.json({ status: "pass", message: "user registered" });
          }
        }
      );
    }
  });
});

// app.post()

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: "pass" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`running at port: ${PORT}`);
});
