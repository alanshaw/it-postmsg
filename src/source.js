const { caller } = require('postmsg-rpc')

module.exports = (id, options) => {
  return {
    [Symbol.asyncIterator] () {
      return this
    },
    next: caller(`${id}_next`, options),
    return: caller(`${id}_return`, options)
  }
}
