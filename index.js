const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const allowCors = require("./allowCors")

const app = express();
app.use(express.json());
app.use('/api', allowCors)

const CHAT_ENGINE_PROJECT_ID = "";
const CHAT_ENGINE_PRIVATE_KEY = "";
const JWT_SECRET = "your_secret_key"; // Replace with your secret key

// Middleware to check the JWT and authenticate the user
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // If the JWT is valid, set the username in the request object for future use
    req.username = decoded.username;
    next();
  });
};


app.post("/login", async (req, res) => {
  const { username, secret } = req.body;

  // Fetch this user from Chat Engine in this project!
  // Docs at rest.chatengine.io
  try {
    const r = await axios.get("https://api.chatengine.io/users/me/", {
      headers: {
        "Project-ID": "b5854010-b7ae-46d7-b63d-6d2537e4c9cb",
        "User-Name": username,
        "User-Secret": secret,
      },
    });

    if (r.status === 200) {
      // User is authenticated, generate a JWT token with 12-hour expiration
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
      return res.status(200).json({ token });
    } else {
      return res.status(r.status).json(r.data);
    }
  } catch (e) {
    return res.status(e.response.status).json(e.response.data);
  }
 
});

app.get("/chat", authenticateUser, (req, res) => {
    // Serve the chat page here for authenticated users
    const username = req.username;
    res.send(`Welcome to the chat, ${username}!`);
  });

// vvv On port 3001!
app.listen(3001);
