const express = require("express");
const router = express.Router();
const twitterController = require("../controllers/tweetsController");

router.get("/:hashtag", twitterController.searchTweets);

module.exports = router;
