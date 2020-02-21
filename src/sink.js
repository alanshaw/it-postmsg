const { expose } = require('postmsg-rpc')
const getIterator = require('get-iterator')

module.exports = (id, options) => {
  return source => {
    const it = getIterator(source)

    const nextHandle = expose(`${id}_next`, async () => {
      try {
        const { value, done } = await it.next()

        if (done) {
          close()
          return { done }
        }

        return { value }
      } catch (err) {
        close()
        throw err
      }
    }, options)

    const returnHandle = expose(`${id}_return`, () => {
      close()
      return it.return ? it.return() : { done: true }
    }, options)

    const close = () => {
      nextHandle.close()
      returnHandle.close()
    }
  }
}
