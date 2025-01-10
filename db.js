const mongoose = require('mongoose');
const uri = process.env.DB_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


mongoose.connect(uri, clientOptions);



const exerciseModel = mongoose.model('Exercise', new mongoose.Schema({
    userid: String,
    username: String,
    description: String,
    duration: Number,
    date: Date,
}));

const userModel = mongoose.model('User', new mongoose.Schema({
    username: String,
}));

module.exports = { exerciseModel, userModel };