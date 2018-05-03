const THRIFT = require('zipkin-encoder-thrift');
const path = require('path');
const fs = require('fs-extra');

module.exports = class FileLogger {
  constructor(options) {
    const optionDefaults = {
      filePath: path.join(__dirname, 'zipkin.log')
    };

    const opts = Object.assign({}, optionDefaults, options || {});

    this._writeStream = fs.createWriteStream(opts.filePath, {
      flags: 'a+',
      mode: '0666',
      encoding: 'utf-8'
    });
  }

  logSpan(span) {
    const data = THRIFT.encode(span);

    this._writeStream.write(data + '\n');
  }

  close() {
    return new Promise(resolve => this._writeStream.end());
  }
};
