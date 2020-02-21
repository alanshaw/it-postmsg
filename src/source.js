const { caller } = require('postmsg-rpc')

module.exports = (id, options) => {
  const nextFn = caller(`${id}_next`, options)

  return {
    [Symbol.asyncIterator] () {
      return this
    },
    async next () {
      const { value, done } = await nextFn()

      if (value && value.error) {
        throw Object.assign(new Error('stream error'), value.error)
      }

      return { value: value && value.value, done }
    },
    return: caller(`${id}_return`, options)
  }
}
