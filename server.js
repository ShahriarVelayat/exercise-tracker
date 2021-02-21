const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const User = require("./models/user.model");
const Exercise = require("./models/exercise.model");
const bodyParser = require("body-parser");
var moment = require("moment"); // require

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/api/exercise/users", (req, res) => {
  User.find().then(function (user) {
    res.json(user);
  });
});

app.get("/api/exercise/log", (req, res) => {
  if (!req.query.userId) {
    res.json({ error: "required field is not set" });
    return;
  }
  User.findById(req.query.userId).then(function (user) {
    var queryy = {};

    if (!user) {
      return res.sendStatus(404);
    }
    if (typeof req.query.limit !== "undefined") {
      var limit = req.query.limit;
    }
    if (typeof req.query.from !== "undefined") {
      queryy.date = {};

      var from = req.query.from;
      queryy.date.$gte = Date.parse(from);
    }

    if (typeof req.query.to !== "undefined") {
      if (!queryy.date) queryy.date = {};

      var to = req.query.to;
      queryy.date.$lte = Date.parse(to);
    }
    queryy.user = user;

    Exercise.find(queryy)
      .limit(Number(limit))
      .then((results) => {
        res.json({
          _id: user._id,
          username: user.username,
          count: results.length,
          log: results,
        });
      });
  });
});

app.post("/api/exercise/new-user", (req, res) => {
  console.log(!req.body.username);
  if (!req.query.username && !req.body.username) {
    res.json({ error: "username is not set" });
    return;
  }

  const user = new User({
    username: req.query.username || req.body.username,
  }).save((err, doc) => {
    if (err) res.json({ error: "user name already exists" });
    res.json(doc);
  });
});

app.post("/api/exercise/add", (req, res) => {
  if (!req.query.userId && !req.body.userId) {
    res.json({ error: "required field is not set" });
    return;
  }
  if (!req.query.description && !req.body.description) {
    res.json({ error: "required field is not set" });
    return;
  }
  if (!req.query.duration && !req.body.duration) {
    res.json({ error: "duration field is not set" });
    return;
  }
  User.findById(req.query.userId || req.body.userId, (err, user) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    console.log(req.query.date || req.body.date);
    const exercise = new Exercise({
      user: user,
      duration: req.query.duration || req.body.duration,
      description: req.query.description || req.body.description,
      date: Date.parse(req.query.date || req.body.date) || Date.now(),
    }).save((err, doc) => {
      console.log({
        _id: user._id,
        username: user.username,
        date: moment(doc.date).format("ddd MMM D yyyy"),
        duration: doc.duration,
        description: doc.description,
      })
      if (err) res.json(err);
      res.json({
        _id: user._id,
        username: user.username,
        date: moment(doc.date).format("ddd MMM D yyyy"),
        duration: doc.duration,
        description: doc.description,
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
