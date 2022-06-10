const { getTweets } = require("../utils/getTweets");

const searchTweets = async (req, res, next) => {
  const hashtag = req.params.hashtag;
  try {
    res.json(await getTweets(hashtag));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchTweets,
};
