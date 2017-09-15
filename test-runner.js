/**
 * A Javascript test runner in 20 lines of code
 * Adapted from https://gist.github.com/donavon/26acb8b066f001be4914af8816f6054d


// Usage

// Sync test
test('1+1 equals 2', function () {
  assert(1+1 === 2, '1+1 should be 2');
});

// Async test
test('1+2 equals 3', function (done) {
  setTimeout(function () {
    assert(1+2 === 3, '1+2 should be 3');
    done();
  }, 200);
});


 */

 
function runner () {
  // The test queue:
  var tests = [];

  // Function to add tests:
  this.test = function test (name, cb) {
    tests.push({name: name, test: cb});
  };

  this.run = function run () {
    var i = 0, testToRun;
    (function next (err) {
      // Log status for last test run:
      if (testToRun) console[err ? 'error' : 'log'](err ? '✘' : '✔', testToRun.name);
      // Abort if last test failed or out of tests:
      if (err || !(testToRun = tests[i++])) return done(err);
      // Run test:
      try {
        testToRun.test.call(testToRun.test, next);
        if (!testToRun.test.length) next();
      } catch (err) {
        next(err);
      }
    })();
    function done (err) {
      // Show remaining tests as skipped:
      tests.slice(i).map(function (skippedTest) { console.log('-', skippedTest.name); });
      // We're finished:
      console[err ? 'error' : 'log']('\nTests ' + (err ? 'failed!\n' + err.stack : 'succeeded!'));
    }
  };
  
  this.autoRun = true;
  
  setTimeout(function () {
    if (autoRun) run();
  }, 1);

}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

module.exports = { runner, assert };