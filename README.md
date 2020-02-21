# it-postmsg

[![Build Status](https://travis-ci.org/alanshaw/it-postmsg.svg?branch=master)](https://travis-ci.org/alanshaw/it-postmsg)
[![dependencies Status](https://david-dm.org/alanshaw/it-postmsg/status.svg)](https://david-dm.org/alanshaw/it-postmsg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Streaming iterables over `window.postMessage`

It provides the two parts of a [duplex stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it): a source stream and a sink stream that can be used together to stream data over `window.postMessage`.

## Install

```sh
npm install it-postmsg
```

## Usage

To use `it-postmsg` you need two window objects. One of the window objects _has_ the data, the other _wants_ the data. Under the hood, `it-postmsg` uses [`postmsg-rpc`](https://github.com/tableflip/postmsg-rpc). If you're not familiar with it, it's a good idea to read up on how it works before continuing!

In the first window (the one that _has_ the data):

```js
const PostMessage = require('it-postmsg')
const pipe = require('it-pipe')

pipe(
  [/* your data */],
  PostMessage.sink('<stream ID>', {/* options passed to postmsg-rpc expose */})
)
```

In the second window (the one that _wants_ the data):

```js
const PostMessage = require('it-postmsg')
const pipe = require('it-pipe')

pipe(
  PostMessage.source('<stream ID>', {/* options passed to postmsg-rpc caller */}),
  async function logSink (source) {
    for await (const chunk of source) {
      console.log(chunk)
    }
  }
)
```

1. Window that _has_ the data calls `PostMessage.sink`, which **exposes** a function called `<stream ID>_next` & returns a [sink](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#sink-it)
2. Window that _wants_ the data calls `PostMessage.source`, which creates a **caller** function for "read" & returns a [source](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#source-it)
3. In the window that _wants_ the data, the `pipe(...)` pipeline starts the flow of data from the `PostMessage.source` stream
4. When data is requested from the `PostMessage.source` stream, it **calls** the **exposed** `<stream ID>_next` function
5. This causes the `PostMessage.sink` stream in the window that _has_ the data to retrieve the next item from the data array and return it all the way back to `logSink` in the window that _wants_ the data

See the [example](example) for complete code.

### Example

To build and run the [example](example), run the following in your terminal:

```sh
git clone https://github.com/alanshaw/it-postmsg.git
cd it-postmsg
npm install
npm run example
```

Then open your browser at `http://localhost:3000`

## API

### `PostMessage.sink(id, options)`

Creates a new [sink](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#sink-it) for writing data over `postMessage`.

* `id` - a unique ID for the stream. `postmsg-rpc` uses it to expose functions that `PostMessage.source` can read from.
* `options` - options passed directly to `postmsg-rpc` `expose`, see [docs here](https://github.com/tableflip/postmsg-rpc#exposefuncname-func-options)

### `PostMessage.source(id, options)`

Creates a new [source](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#source-it) for reading data over `postMessage`.

* `id` - a unique ID for the stream, note that it should be the _same_ ID used in `PostMessage.sink`
* `options` - options passed directly to `postmsg-rpc` `caller`, see [docs here](https://github.com/tableflip/postmsg-rpc#callerfuncname-options)

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/it-postmsg/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
