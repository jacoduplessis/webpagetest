const utils = require('./utils')
const { runner, assertEquals } = require('./test-runner')

runner();

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

test('get total size', () => {

	const responses = [
		{headers: {'content-length': 10}},
		{headers: {'content-length': 20}},
		{headers: {'content-length': 30}},
	]

	assertEquals(utils.getTotalSize(responses), 60)
})