const express = require("express");
const app = express();

// middleware to read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
