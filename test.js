const utils = require('./utils')
const { runner, assert } = require('./test-runner')

runner();

test('plain css extension', () => {
	assert(utils.typeFromUrl('test.css') === 'Stylesheet')
})

test('unknown extension', () => {
	assert(utils.typeFromUrl('test.ham') === null)
})

test('strip query args', () => {
	assert(utils.typeFromUrl('test.css?version=123&name=test') === 'Stylesheet')
})
