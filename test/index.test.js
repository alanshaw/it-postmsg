const test = require('ava')
const shortid = require('shortid')
const pipe = require('it-pipe')
const all = require('it-all')
const drain = require('it-drain')
const PostMessage = require('../')
const mockWindow = require('./helpers/mock-window')
const { getRandomInt } = require('./helpers/random')

test('should pull data over postMessage', async t => {
  const mainWin = mockWindow()
  const iframeWin = mockWindow()

  const id = shortid()
  const input = Array(getRandomInt(100, 500)).fill(0).map(shortid)

  pipe(
    input,
    PostMessage.sink(id, {
      addListener: iframeWin.addEventListener,
      removeListener: iframeWin.removeEventListener,
      postMessage: mainWin.postMessage
    })
  )

  const output = await all(
    PostMessage.source(id, {
      addListener: mainWin.addEventListener,
      removeListener: mainWin.removeEventListener,
      postMessage: iframeWin.postMessage
    })
  )

  t.deepEqual(output, input)
})

test('should clean up all listeners', async t => {
  const mainWin = mockWindow()
  const iframeWin = mockWindow()

  const id = shortid()
  const input = Array(getRandomInt(100, 500)).fill(0).map(shortid)

  pipe(
    input,
    PostMessage.sink(id, {
      addListener: iframeWin.addEventListener,
      removeListener: iframeWin.removeEventListener,
      postMessage: mainWin.postMessage
    })
  )

  await drain(
    PostMessage.source(id, {
      addListener: mainWin.addEventListener,
      removeListener: mainWin.removeEventListener,
      postMessage: iframeWin.postMessage
    })
  )

  t.is(mainWin.listeners.length, 0)
  t.is(iframeWin.listeners.length, 0)
})

test('should handle iframe error gracefully', async t => {
  const mainWin = mockWindow()
  const iframeWin = mockWindow()

  const id = shortid()
  const input = Array(getRandomInt(100, 500)).fill(0).map(shortid)
  const errIndex = getRandomInt(1, input.length)
  let index = 0

  pipe(
    input,
    async function * (source) {
      for await (const chunk of source) {
        index++
        if (index === errIndex) throw new Error('BOOM')
        yield chunk
      }
    },
    PostMessage.sink(id, {
      addListener: iframeWin.addEventListener,
      removeListener: iframeWin.removeEventListener,
      postMessage: mainWin.postMessage
    })
  )

  const err = await t.throwsAsync(drain(
    PostMessage.source(id, {
      addListener: mainWin.addEventListener,
      removeListener: mainWin.removeEventListener,
      postMessage: iframeWin.postMessage
    })
  ))

  t.is(err.message, 'BOOM')
  t.is(mainWin.listeners.length, 0)
  t.is(iframeWin.listeners.length, 0)
})

test('should handle main error gracefully', async t => {
  const mainWin = mockWindow()
  const iframeWin = mockWindow()

  const id = shortid()
  const input = Array(getRandomInt(100, 500)).fill(0).map(shortid)
  const errIndex = getRandomInt(1, input.length)
  let index = 0

  pipe(
    input,
    PostMessage.sink(id, {
      addListener: iframeWin.addEventListener,
      removeListener: iframeWin.removeEventListener,
      postMessage: mainWin.postMessage
    })
  )

  const err = await t.throwsAsync(pipe(
    PostMessage.source(id, {
      addListener: mainWin.addEventListener,
      removeListener: mainWin.removeEventListener,
      postMessage: iframeWin.postMessage
    }),
    async function * (source) {
      for await (const chunk of source) {
        index++
        if (index === errIndex) throw new Error('BOOM')
        yield chunk
      }
    },
    drain
  ))

  t.is(err.message, 'BOOM')
  t.is(mainWin.listeners.length, 0)
  t.is(iframeWin.listeners.length, 0)
})
