## Here we are using arcjet for rate limiting

What is Arcjet?
Arcjet is a service that helps you protect your app or API from abuse — think of it like a security guard or bouncer for your server.

You can use it to:

- lock too many requests from the same person (aka rate limiting)
- Prevent bots from spamming your endpoints
- Add protection to forms, image uploads, AI APIs, etc.
- It’s especially useful when you're using expensive APIs (like Gemini AI) and want to avoid someone draining your API quota.

What is Rate Limiting?
Imagine you’re running a juice shop
One customer can only order 2 juices per minute, so things stay fair and you don’t get overwhelmed.
If someone tries to order 50 juices in a second, you say: “Whoa, chill! Come back later.”

That’s rate limiting:
It controls how often someone can make a request to your server within a set time.

## Why Use It With Gemini AI Uploads?

Your image-to-AI feature costs time and money (because of the Gemini API). You don’t want:

- A spam bot uploading 1000 car images
- A user accidentally spamming the button
- So you wrap your API like:

## Example

import { rateLimit } from '@arcjet/next';

export const processCarImageWithAI = rateLimit({
limit: 3, // max 3 requests
interval: '10m', // per 10 minutes
})(async function (file) {
// your Gemini image AI logic
});

## Note:

Here we are adding rate limiting on ai search with respect to user ip address only allow user to make 10 request per hour

1.  go to documentation and choose rate limiting
    Link: https://docs.arcjet.com/rate-limiting/quick-start?f=next-js

2.  install arcjet
    npm i @arcjet/next @arcjet/inspect

3.  Login to arcject console using google and copy the api key and paste in the env file
    Link: https://app.arcjet.com/sites/site_01jqth7zk2ftjv6g9enqac97ns/sdk-configuration?first-install

4.  Here we are using tokenBucket algorithm for this implementation
    NOTE:
    Token bucket
    ***
    This algorithm is based on a bucket filled with a specific number of tokens. Each request withdraws a token from the bucket and the bucket is refilled at a fixed rate. Once the bucket is empty, the client is blocked until the bucket refills.
5.  Copy the algorithm from docmentation inside of the lib folder create a "arcjet.js " file
    Link: https://docs.arcjet.com/rate-limiting/algorithms

    Example code :

        import arcjet, { tokenBucket } from '@arcjet/next';

const aj = arcjet({
key: process.env.ARCJET_KEY,
characteristics: ['ip.src'], // track requests by IP address
rules: [
tokenBucket({
mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
refillRate: 10, // refill 10 tokens per interval
interval: 3600, // 1 hr interval
capacity: 10, // bucket maximum capacity of 10 tokens
}),
],
});

export default aj;

6. go the action folder .since we are using action folder for our api calls.Create a "home.js " file
