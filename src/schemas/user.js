"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
    id: ObjectId,
    email: String,
    nickname: String
});

module.exports = user;