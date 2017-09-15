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
  return typeFromUrl(response.url) || response.request.resourceType
}

function getTotalSize(responses) {
  return responses.reduce((agg, r) => {
    return agg + parseInt(r.headers['content-length'] || 0)
  }, 0)
}

function formatObject(obj) {
  return Object.keys(obj).reduce((agg, key) => agg + `${key} - ${obj[key]}\n`,'');
}

module.exports = {
  TYPES,
  typeFromUrl,
  inferType,
  getTotalSize,
  formatObject
}