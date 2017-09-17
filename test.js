const utils = require('./utils')
const { runner, assertEquals } = require('./test-runner')

runner()

test('plain css extension', () => {
	assertEquals(utils.typeFromUrl('test.css'), 'Stylesheet')
})

test('unknown extension', () => {
	assertEquals(utils.typeFromUrl('test.ham'), null)
})

test('strip query args', () => {
	assertEquals(utils.typeFromUrl('test.css?version=123&name=test'), 'Stylesheet')
})

test('human size (b)', () => {
	assertEquals(utils.humanSize(100), '100 b')
})

test('human size (kb)', () => {
	assertEquals(utils.humanSize(1200), '1.20 kb')
})

test('human size (mb)', () => {
	assertEquals(utils.humanSize(1200*1000), '1.20 mb')
})

test('human size (gb)', () => {
	assertEquals(utils.humanSize(1200*1000*1000), '1.20 gb')
})

test('get total size', async (done) => {

	const responses = [
		{headers: {'content-length': 10}},
		{headers: {'content-length': 20}},
		{headers: {'content-length': 30}},
	]

	const size = await utils.getTotalSize(responses)
	assertEquals(size, 60)
	done()
})

test('get response size from header', async (done) => {
	const r = {
		headers: { 'content-length': 16}
	}
	const size = await utils.getResponseSize(r)
	assertEquals(size, 16)
	done()
})

test('get response size from buffer', async (done) => {
	const r = {
		headers: {},
		buffer() { return Promise.resolve(new Buffer(16)) }
	}
	const size = await utils.getResponseSize(r) 
	assertEquals(size, 16)
	done()
})

test('get total size with buffers and headers', async (done) => {
	const responses = [
		{headers: {'content-length': 10}},
		{headers: {'content-length': 20}},
		{headers: {}, buffer() { return Promise.resolve(new Buffer(50))}},
	]

	const size = await utils.getTotalSize(responses)
	assertEquals(size, 80)
	done()
})

test('cookie summary', () => {

	const cookies = [
		{domain: 'example.com', value: 'value', name: 'name'}
	]
	const summary = utils.getCookieSummary(cookies)
	const expected = "[example.com] name: value\n"

	assertEquals(summary, expected)
})

test('host object', () => {

	const responses = [
		{url: 'https://www.example.com'},
		{url: 'https://www.test.com?arg=1'},
		{url: 'http://www.test.com#home'},
	]
	const obj = utils.getHostObject(responses)
	const expected = {
		'www.example.com': 1,
		'www.test.com': 2
	}
	assertEquals(JSON.stringify(obj), JSON.stringify(expected))
})

test('status code object', () => {
	const responses = [
		{status: 200},
		{status: 300},
		{status: 400},
		{status: 200},
	]

	const obj = utils.getStatusCodeObject(responses)
	const expected = {
		200: 2,
		300: 1,
		400: 1,
	}
	assertEquals(JSON.stringify(obj), JSON.stringify(expected))

})

test('single type summary', async (done) => {
  const responses = [
		{url: 'style.css', status: 200, headers: {'content-length': 10}},
		{url: 'custom.css', status: 300, headers: {'content-length': 20}},
		{url: 'bootstrap.css', status: 400, headers: {}, buffer() { return Promise.resolve(new Buffer(50))}},
	]
  const type = 'Stylesheet'
  const summary = await utils.getTypeSummary(type, responses)
  const expected = {
    type,
    text: `style.css - [200] - 10\ncustom.css - [300] - 20\nbootstrap.css - [400] - 50\n`,
    size: '80 b',
    count: 3,
  }
  assertEquals(summary.type, expected.type)
  assertEquals(summary.text, expected.text)
  assertEquals(summary.size, expected.size)
  assertEquals(summary.count, expected.count)
  done()
})

test('combined type summaries', async (done) => {

  const responses = []
  const summaries = await utils.getTypeSummaries(utils.TYPES, responses)
  assertEquals(Array.isArray(summaries), true)
  done()
})