const puppeteer = require('puppeteer')
const utils = require('./utils')


const pageURL = process.argv[2]

process.on('unhandledRejection', (err) => {  
  console.error("Unhandled Rejection")
  console.error(err)
  process.exit(1)
})

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
    requests.push(req)
  })

  page.on('requestfinished', req => {
    finished.push(req)
  })

  page.on('response', (res) => {
    responses.push(res)
  })

  const networkTimeout = 1000
  const startTime = +(new Date())
  await page.goto(pageURL, {
    waitUntil: 'networkidle',
    networkIdleTimeout: networkTimeout,
  });

  const duration = (+(new Date()) - networkTimeout - startTime) / 1000 + ' s'

  const cookies = await page.cookies()

  const typeSummaries = await utils.getTypeSummaries(responses)
  const cookieSummary = utils.getCookieSummary(cookies)
  const statusCodeSummary = utils.getStatusCodeSummary(responses)
  const hostSummary = utils.getHostSummary(responses)

  const totalSize = await utils.getTotalHumanSize(responses)

  console.log("Summary\n-------\n")
  console.log("Load time", duration)
  console.log("# Cookies", cookies.length)
  console.log("# Requests", requests.length)
  console.log("# Responses", responses.length)
  console.log("Total Size", totalSize)
  console.log("\n-------\n")

  console.log(`### Requests per Host (${Object.keys(hostSummary).length}) ###\n`)
  console.log(hostSummary)
  console.log()

  console.log("### Status Codes ###\n")
  console.log(statusCodeSummary)
  console.log()

  console.log(`### Cookies (${cookies.length}) ###\n`)
  console.log(cookieSummary)
  console.log()

  typeSummaries.forEach(s => {
    if (!s.text) return
    console.log(`### ${s.type} (${s.count}) ###\n\n${s.text}\nSize: ${s.size}\n\n`)
  })


  await browser.close()

})()
