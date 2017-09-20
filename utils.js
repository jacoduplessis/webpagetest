const {URL} = require('url')

const TYPES = ["Document", "Stylesheet", "Image", "Media", "Font", "Script", "TextTrack", "XHR", "Fetch", "EventSource", "WebSocket", "Manifest", "Other"]

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

function formatObject(obj) {
  return Object.keys(obj).reduce((agg, key) => agg + `${key} - ${obj[key]}\n`, '');
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
  if (typeof size !== 'undefined') return size
  return await response.encodedDataLength()
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

async function parseTypeResponses(responses) {

  return Promise.all(responses.map(async r => {
    const bytes = await getResponseSize(r)
    const size = parseInt(bytes)
    return Object.assign(r, {size})
  }))

}

async function getTypeSummary(type, responses) {

  const parsedResponses = await parseTypeResponses(responses)
  const totalSize = parsedResponses.reduce((agg, r) => agg + r.size, 0)
  const text = responses.reduce((agg, r) => {
    return agg + `${r.url} - [${r.status}] - ${r.size}\n`
  }, '')

  return {
    type,
    text,
    size: totalSize,
    count: responses.length,
  }
}

function getTypeSummaries(types, responses) {

  return Promise.all(types.map(async type => {
    const filteredResponses = responses.filter(r => inferType(r) === type)
    return await getTypeSummary(type, filteredResponses)
  }))
}

module.exports = {
  TYPES,
  typeFromUrl,
  getTypeSummary,
  getTypeSummaries,
  humanSize,
  getResponseSize,
  getStatusCodeSummary,
  getStatusCodeObject,
  getHostSummary,
  getHostObject,
  getCookieSummary,
}