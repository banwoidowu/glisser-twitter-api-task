# Glisser Technical Task - Banwo Idowu

## My approach

In order to complete this task, I set up a REST API using Node.js and Express.
This API has a single route that accepts a twitter hashtag as a parameter. I then query two separate endpoints
on the Twitter API. The first being the `tweets/search` endpoint which returns 100 of the 
most recent tweets including that hashtag. However, this only returns
the tweet ID and the tweet text. In order to get the rest of the data required such as the
user image, creation date and username, I have to use the `tweets/:id` endpoint. This endpoint is
then called with each ID of the 100 tweets fetched in the previous call. 

In order to prevent  this API from calling the Twitter API excessively, I've used a Redis
cache to store the result of successful queries. Queries are cached for an hour When a subsequent request
is made, the cache is checked before making and calls to the Twitter API.
This is beneficial as it prevents this service from making unnecessary calls to 
the Twitter API and significantly improves the response time for any client of this API.

In order to prevent this endpoint from hitting the Twitter rate limit, 
I've stored all queries in a postgres database. This stores the hashtag and the
time that the query was made. When a new query comes in, the API will do a 
lookup on the database for all queries run within the past 15 minutes. If there are more than 8
then the API responds with a 429 status and requests that the user waits for the appropriate amount
of time before making a new query. The reason I look for more than 8 queries run in the
past 15 minutes is because I essentially make 101 requests for every successful response. As I first get a list
of 100 recent tweets then make 100 subsequent queries to get additional details for each one.
The `tweets/search` endpoint has a rate limit of 450 requests per 15 minutes and the `tweets/:id` endpoint has a 
limit of 900 per 15 minutes. Limiting as I have done here should keep this API safe from hitting the Twitter rate limit.

## Potential Improvements

Ideally, I would have liked to add tests for this API. These would have been both unit and integration tests. However, 
due to time constraints, I have not done so on this occasion, but I am happy to revisit. The tests would have
tested that we are receiving the correct responses for specific inputs. For example, I expect a cached result if I 
am making the same query more than once within the TTL of the cache entry, I also expect that the Twitter API would be called
should I not have a cache entry and I'd expect that I'd receive a 409 response if I've made more than 8 non-cached requests
within 15 minutes. I could also test the data shape of the response that I get on a successful query, however, this may
be less helpful as the response object is not one that I have control over as I am calling out to an external service that
determines its own response shapes. 

Lines 50-55 in the `getTweets` file shows the logic for getting additional information for each returned tweet from the `tweets/:id` endpoint. This uses a `Promise.all()`. This may raise future issues if different use cases appeared for the API and the data returned
needed to match the order of the ids returned from the initial `tweets/search` call. As the responses may be out of order
from the original array, some form or sorting/organising logic would have to be done on the result. `Promise.all()` is also an all or nothing
approach to fetching data. If one of those calls should fail, they all would. This may not always be the desired approach as partial success,
at times, may be better than no results at all. However, for the current requirements, it works.

## Technologies used
- twitter-api-v2
- redis
- postgres
- moment.js
- express.js
- dotenv