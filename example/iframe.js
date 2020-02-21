const pipe = require('it-pipe')
const shortid = require('shortid')
const log = require('./log')
const { getRandomInt } = require('./random')
const PostMessage = require('../')

log('iframe ready')

const streamId = `stream-${shortid()}`
const postMessage = window.parent.postMessage.bind(window.parent)

pipe(
  Array(getRandomInt(5, 50)).fill(0).map(shortid),
  async function * (source) {
    for await (const chunk of source) {
      const delay = getRandomInt(500, 2000)

      log(`chunk requested, responding in ${delay}ms`)

      await new Promise(resolve => setTimeout(resolve, delay))

      log('responding with', chunk)
      yield chunk
    }
  },
  PostMessage.sink(streamId, { postMessage })
)

log('sending stream identifier', streamId)

window.parent.postMessage({ streamId }, '*')
