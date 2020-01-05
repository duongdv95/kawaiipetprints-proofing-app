const serverless = require('serverless-http')
const binaryMimeTypes = require('./binaryMimeTypes')

const server = require('./server')
module.exports.server = serverless(server, {
  binary: binaryMimeTypes
})