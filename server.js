const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const User = require("./models/user.model");
const Exercise = require("./models/exercise.model");

var mongoose = require("mongoose");
var connection = mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/exercise/log", (req, res) => {
  if (!req.query.userId) {
    res.json({ error: "required field is not set" });
    return;
  }
  User.findById(req.query.userId).then(function (user) {
    if (!user) {
      return res.sendStatus(404);
    }
    if (typeof req.query.limit !== "undefined") {
      var limit = req.query.limit;
    }

    if (typeof req.query.from !== "undefined") {
      var from = req.query.from;
    }

    if (typeof req.query.to !== "undefined") {
      var to = req.query.to;
    }

    Exercise.find({ user: user })
      .limit(Number(limit))
      .then((results) => {
        res.json({ 
          _id : user._id,
          username :user.username,
          count : results.length,
          log : results
        });
      });
  });
});

app.post("/api/exercise/new-user", (req, res) => {
  if (!req.query.username) {
    res.json({ error: "username is not set" });
    return;
  }
  const user = new User({
    username: req.query.username,
  }).save((err, doc) => {
    if (err) res.json({ error: "user name already exists" });
    res.json(doc);
  });
});

app.post("/api/exercise/add", (req, res) => {
  if (!req.query.userId || !req.query.duration || !req.query.description) {
    res.json({ error: "required field is not set" });
    return;
  }
  User.findById(req.query.userId).then(function (user) {
    if (!user) {
      return res.sendStatus(404);
    }
    const exercise = new Exercise({
      user: user,
      duration: req.query.duration,
      description: req.query.description,
      date: new Date(req.query.date),
    }).save((err, doc) => {
      if (err) res.json(err);
      res.json({
        username: doc.user.username,
        duration: doc.duration,
        date: doc.date,
        description: doc.description,
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
