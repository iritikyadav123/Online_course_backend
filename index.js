const express = require('express');
const bodyParser = require('body-parser');
const adminRouter = require('./Route/admin');
const userRouter = require('./Route/user');
const app = express();



// Middleware for parsing request bodies
app.use(bodyParser.json());

// Routes
app.use("/admin", adminRouter);
app.use("/user", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Environment configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
