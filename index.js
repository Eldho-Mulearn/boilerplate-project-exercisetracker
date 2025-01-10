const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { exerciseModel, userModel } = require('./db.js');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/users', async (req, res) => {
  if (!req.body || !req.body.username) {
    res.json({ error: 'Username is required' });
    return;
  }
  const user = new userModel({ username: req.body.username });
  await user.save();
  res.json(user);
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  if (!req.body.description || !req.body.duration) {
    res.json({ error: 'Description and duration are required' });
    return;
  }
  const user = await userModel.findById(req.params._id);
  if (!user) {
    res.json({ error: 'User not found' });
    return;
  }
  const exercise = new exerciseModel({
    username: user.username,
    userid: user._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date) : new Date()
  });
  await exercise.save();
  res.json({_id: user._id, username: user.username, description: exercise.description, duration: exercise.duration, date: exercise.date.toDateString()});
})
app.get('/api/users/:_id/logs', async (req, res) => {
  const user = await userModel.findById(req.params._id);
  if (!user) {
    res.json({ error: 'User not found' });
    return;
  }
  const { from, to, limit } = req.query;
  let query = { userid: user._id };
  if (from) {
    query.date = { ...query.date, $gte: new Date(from) };
  }
  if (to) {
    query.date = { ...query.date, $lte: new Date(to) };
  }

  query = exerciseModel.find(query);

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  let log = await query.lean();
  let count = log.length;

  log = log.map(exo => ({
    description: exo.description,
    duration: exo.duration,
    date: exo.date.toDateString()
  }));
  res.json({
    _id: user._id,
    username: user.username,
    count: count,
    log: log
  });
});

app.get('/api/users', async (req, res) => {
  const users = await userModel.find({});
  res.json(users);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
