const express = require("express");
const twitterRoutes = require("./routes/twiitterRoutes");
const app = express();
require("dotenv").config();

app.use("/tweets", twitterRoutes);

app.listen(process.env.PORT || 3000);
