const { URL } = require('url')

const TYPES = ["Document","Stylesheet","Image","Media","Font","Script","TextTrack","XHR","Fetch","EventSource","WebSocket","Manifest","Other"]

function typeFromUrl(url) {
  const ext = url.split('?')[0].split('.').reverse()[0].toLowerCase();
  const mapping = {
    'Script': ['js'],
    'Stylesheet': ['css'],
    'Image': ['png', 'gif', 'jpg', 'jpeg', 'webp'],
    'Document': ['html'],
    'Font': ['woff', 'ttf', 'woff2'],
    'Media': ['mp3', 'mp4', 'ogg', 'mpeg4', 'avi', 'mkv'],
  }

  return Object.keys(mapping).reduce((agg, key) => {
    if (mapping[key].includes(ext)) return key
    return agg
  }, null)
}

function inferType(response) {
  const type = response.request().resourceType
  // only try to infer type if 'Other' reported
  if (type === 'Other') return typeFromUrl(response.url) || "Other"
  return type
}

async function getTotalSize(responses) {
  return await responses.reduce(async (agg, r) => {
    const size = await getResponseSize(r)
    return await agg + parseInt(size)
  }, Promise.resolve(0))

}

async function getTotalHumanSize(responses) {
  const size = await getTotalSize(responses)  
  return humanSize(size)
}


function formatObject(obj) {
  return Object.keys(obj).reduce((agg, key) => agg + `${key} - ${obj[key]}\n`,'');
}

function humanSize(bytes) {
  if (bytes < 1000) return `${bytes} b`
  bytes /= 1000
  if (bytes < 1000) return `${bytes.toFixed(2)} kb`
  bytes /= 1000
  if (bytes < 1000) return `${bytes.toFixed(2)} mb`
  bytes /= 1000
  if (bytes < 1000) return `${bytes.toFixed(2)} gb`
}

async function getResponseSize(response) {
  const size = response.headers['content-length']
  if (size) return size
  const buffer = await response.buffer()
  return buffer.byteLength
}

function getStatusCodeObject(responses) {
  return responses.reduce((obj, response) => {
    const existing = obj[response.status] || 0
    obj[response.status] = existing + 1
    return obj
  }, {})
}

function getStatusCodeSummary(responses) {
  return formatObject(getStatusCodeObject(responses))
}

function getHostObject(responses) {
  return responses.reduce((obj, response) => {
    const u = new URL(response.url)
    const host = u.hostname
    if (!host) return obj
    const existing = obj[host] || 0
    obj[host] = existing + 1
    return obj
  }, {})
}

function getHostSummary(responses) {
  return formatObject(getHostObject(responses))
}

function getCookieSummary(cookies) {
  return cookies.reduce((agg, cookie) => {
    return agg + `[${cookie.domain}] ${cookie.name}: ${cookie.value}\n`
  }, '')
}

function getTypeSummaries(responses) {
  return Promise.all(TYPES.map(async type => {
    const rs = responses.filter(r => inferType(r) === type)
    const totalSize = await getTotalHumanSize(rs)
    return {
      type: type,
      size: totalSize,
      count: rs.length,
      text: await rs.reduce(async (agg, r) => {
        const size = await getResponseSize(r)
        return await agg + `${r.url} - [${r.status}] - ${size}\n`
      }, Promise.resolve(''))
    }
  }))
}

module.exports = {
  typeFromUrl,
  getTypeSummaries,
  getTotalSize,
  humanSize,
  getTotalHumanSize,
  getResponseSize,
  getStatusCodeSummary,
  getStatusCodeObject,
  getHostSummary,
  getHostObject,
  getCookieSummary,
}