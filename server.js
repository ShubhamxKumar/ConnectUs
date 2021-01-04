const express = require('express');
const server = express();
const connectDB = require('./config/db').connectDB;

const userRoute = require('./routes/UserRoute/index').route;
const postRoute = require('./routes/PostRoute/index').route;

server.use(express.json())
server.use(express.urlencoded({extended:true}));

//Connect to the MongoDB database.
connectDB();

const port = process.env.PORT || 5000;

server.use('/api/user', userRoute);
server.use('/api/post', postRoute);

server.listen(port, () => {
    console.log(`Server up and running on: ${port}`);
});