const userRouter = require('./routes/userRoutes');
const express = require("express");
const app = express();

app.use('/api/users', userRouter);

// ...existing code...  
// ...existing code...

