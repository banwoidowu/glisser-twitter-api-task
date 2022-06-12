const pool = require("../db");
const moment = require("moment");

const recordQuery = async (hashtag) => {
  await pool.query("INSERT INTO queries (hashtag) VALUES ($1) RETURNING *", [
    hashtag,
  ]);
};

const checkQueriesRunWithinLast15Minutes = async () => {
  const queries = await pool.query(
    "SELECT * FROM queries WHERE run_at >= NOW() - INTERVAL '15 minutes'"
  );

  const recordsFound = queries.rows.length;
  if (recordsFound > 8) {
    //We send 100 queries to the tweets/ api endpoint to get the additional data for our tweets by hashtag
    //As the upper limit is 900 queries before we hit the rate limit, we should be blocking further requests
    //When we know we've made more than 8 consecutive queries.
    //This will essentially now allow the 9th query to run as we record the query in the db before checking
    // the db for the amount of successful queries run in the past 15 mins
    // Doing this will to allow for the unusual situation that another record has been tun and inserted into the db after this query started to run

    const firstRunIn15Minutes = queries.rows[0].run_at;
    const timeUntilNewQueryAcceptance = new Date(
      firstRunIn15Minutes.getTime() + 15 * 60000
    );

    const now = new Date().toISOString();

    const endTime = moment(timeUntilNewQueryAcceptance);
    const startTime = moment(now);
    const duration = moment.duration(endTime.diff(startTime));
    const minutes = parseFloat(duration.asMinutes().toFixed(1));

    return {
      status: 429,
      message: `Too many queries, please try again in ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      }`,
    };
  }

  return null;
};

module.exports = {
  recordQuery,
  checkQueriesRunWithinLast15Minutes,
};
