const log = require('./log')
const PostMessage = require('../')

const iframe = document.querySelector('iframe')
const postMessage = iframe.contentWindow.postMessage.bind(iframe.contentWindow)

window.addEventListener('message', async msg => {
  if (!msg.data || !msg.data.streamId) return
  log('got stream identifier', msg.data.streamId)

  for await (const chunk of PostMessage.source(msg.data.streamId, { postMessage })) {
    log('got chunk', chunk)
  }

  log('done')
})

log('main ready')
