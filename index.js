const puppeteer = require('puppeteer');
const utils = require('./utils');
const { URL } = require('url')

const pageURL = process.argv[2]

if (!pageURL) {
  console.log("Please specify a URL.")
  console.log("Usage: node index.js http://www.example.com")
  process.exit(1)
}

;(async () => {
  const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome-unstable'});
  const page = await browser.newPage();
  
  const requests = []
  const responses = []
  const finished = []

  page.on('request', req => {

    requests.push({
      headers: req.headers,
      ok: req.ok,
      url: req.url,
      type: req.resourceType,
      method: req.method,
    })

  })

  page.on('requestfinished', req => {
    finished.push(req)
  })

  page.on('response', (res) => {
    responses.push({
      status: res.status,
      url: res.url,
      ok: res.ok,
      headers: res.headers,
      request: res.request(),
    })
  })

  await page.goto(pageURL, {
    waitUntil: 'networkidle',
    networkIdleTimeout: 5000,
  });
  const cookies = await page.cookies()

  const summaries = utils.TYPES.map(type => {
    const rs = responses.filter(r => utils.inferType(r) === type) 
    return {
      type: type,
      size: utils.getTotalHumanSize(rs),
      count: rs.length,
      summary: rs.reduce((agg, r) => {
        return agg + `${r.url} - [${r.status}] - ${r.headers['content-length'] || '---'}\n` 
      }, '')
    }
    
  })

  const cookieSummary = cookies.reduce((agg, cookie) => {
    return agg + `[${cookie.domain}] ${cookie.name}: ${cookie.value}\n`
  }, '')
  
  const statusCodeSummary = responses.reduce((obj, response) => {
    const existing = obj[response.status] || 0
    obj[response.status] = existing + 1
    return obj
  }, {})

  const hostSummary = responses.reduce((obj, response) => {
    const u = new URL(response.url)
    const host = u.hostname
    if (!host) return obj
    const existing = obj[host] || 0
    obj[host] = existing + 1
    return obj
  }, {})

  console.log("Summary\n-------\n")
  console.log("Cookies", cookies.length)
  console.log("Requests", requests.length)
  console.log("Responses", responses.length)
  console.log("Total Size", utils.getTotalHumanSize(responses))
  console.log("\n-------\n")

  console.log(`### Requests per Host (${Object.keys(hostSummary).length}) ###\n`)
  console.log(utils.formatObject(hostSummary))
  console.log()

  console.log("### Status Codes ###\n")
  console.log(utils.formatObject(statusCodeSummary))
  console.log()

  console.log(`### Cookies (${cookies.length}) ###\n`)
  console.log(cookieSummary)
  console.log()

  summaries.forEach(s => {
    if (!s.summary) return
    console.log(`### ${s.type} (${s.count}) ###\n\n${s.summary}\nSize: ${s.size}\n\n`)
  })
  browser.close();

})()
