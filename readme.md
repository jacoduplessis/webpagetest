# webpagetest

![build status](https://travis-ci.org/jacoduplessis/webpagetest.svg?branch=master)

A script to use headless chrome to analyze a page.

```
node index.js http://www.example.com
```

You need a recent version of Node.

### Notes

There is some code to infer content type from extension 
because of chrome/puppeteer bug. 

https://github.com/GoogleChrome/puppeteer/issues/734

### TODO

**display**
- content size & requests by domain
- percentages
- requests flow chart

**features**
- cold cache vs reload
- data usage when page remains open
- load as mobile device