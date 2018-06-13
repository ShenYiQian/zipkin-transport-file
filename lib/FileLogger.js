const { jsonEncoder } = require('zipkin');
const path = require('path');
const fs = require('fs-extra');

module.exports = class FileLogger {
  constructor(options) {
    const optionDefaults = {
      filePath: path.join(__dirname, 'zipkin.log'),
      encodeType: 'STRING'
    };

    this.opts = Object.assign({}, optionDefaults, options || {});

    this.jsonEncoder = jsonEncoder.JSON_V1;

    this.strEncoder = (span) => {
      span.remoteEndpoint = span.remoteEndpoint || { serviceName: '', ipv4: '', port: 0 };
      let encode = `["${span.traceId}","${span.parentId || ''}","${span.id}","${span.name || ''}",${span.timestamp},${span.duration},"${span.localEndpoint.serviceName || ''}","${span.localEndpoint.ipv4 || ''}",${span.localEndpoint.port || ''},"${span.remoteEndpoint.serviceName || ''}","${span.remoteEndpoint.ipv4 || ''}",${span.remoteEndpoint.port || ''},"${span.kind}"`;

      if (span.annotations.length > 0) {
        encode = encode + ',[';
        span.annotations.map((ann) => {
          encode = encode + `{"value":"${ann.value}","timestamp":${ann.timestamp}},`
        });
        encode = encode.substr(0, encode.length-1);
        encode = encode + ']';
      } else {
        encode = encode + ',[]';
      }

      const keys = Object.keys(span.tags);
      if (keys.length > 0) { // don't write empty array
        encode = encode + ',{';
        keys.map(key => {
          encode = encode + `"${key}":"${span.tags[key]}",`;
        });
        encode = encode.substr(0, encode.length-1);
        encode = encode + '}';
      } else {
        encode = encode + ',{}';
      }

      encode = encode + ']\n';

      return encode;
    }

    this._writeStream = fs.createWriteStream(opts.filePath, {
      flags: 'a+',
      mode: '0666',
      encoding: 'utf8'
    });
  }

  logSpan(span) {
    setImmediate(() => {
      const data = this.opts.encodeType === 'STRING' ? this.strEncoder(span) : (this.jsonEncoder.encode(span) + '\n');
      this._writeStream.write(data);
    });
  }

  close() {
    return new Promise(resolve => this._writeStream.end());
  }
};
