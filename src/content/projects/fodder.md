---
name: Fodder
url: https://fodder.declanlscott.com
repo: https://github.com/declanlscott/fodder
blurb: Find your flavor of the day
order: 1
---

I built **Fodder** to solve a problem I found myself having when a certain midwestern restaurant discontinued their mobile app. I used the app primarily for one reason — to check their "flavor of the day". Of course, there is no official API for this information, so I had to develop my own solution. With this project, I learned that it often takes three implementations to get to the correct one. Was it worth all the effort for an app with such a specific purpose? Undeniably the answer is no, but that doesn't mean I didn't have fun and learn a lot along the way.

My first implementation was in **Next.js** hosted on Vercel, and while it worked I found it to be too slow due to the backend being a serverless Node.js environment leading to slow cold starts. I then did a full rewrite using a **React** Single Page Application (SPA) with backend Lambda functions written in **Go**, and cached in **Redis**. While this was an overall performance improvement and my first real exposure to Go, Redis, and Terraform, it also increased the complexity of the codebase. The third implementation was much simpler with the whole backend API being a single **Cloudflare** Worker written in **TypeScript** using the Hono web framework. Instead of caching data in Redis, I realized it also made more sense to use the web platform and set a cache header on API responses.

Unfortunately, this solution wouldn't last long as I suspect the (global) Cloudflare Worker IP was blocked, so I needed to find yet another solution. Luckily, I had just discovered a new lightweight JavaScript runtime called [LLRT](https://github.com/awslabs/llrt), or Low Latency Runtime. This allowed me, with relatively minimal effort, port over my existing Hono API code to AWS Lambda and CloudFront while remaining performant with fast cold starts. I documented an [architecture diagram](https://github.com/declanlscott/fodder/blob/main/architecture.png) for this project as well if you want to see how all the pieces come together.
