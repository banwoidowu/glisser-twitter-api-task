CREATE DATABASE tweet_queries;

CREATE TABLE queries(
query_id SERIAL PRIMARY KEY,
hashtag VARCHAR(280),
run_at TIMESTAMP default now()
)