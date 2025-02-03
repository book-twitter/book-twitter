const winston = require('winston');
const TransportStream = require('winston-transport');
const colors = require('colors');

class CustomConsoleTransport extends TransportStream {
  constructor(opts) {
    super(opts);
    this.name = opts.name || 'customConsole';
  }

  log(info, callback) {
    const { level, message } = info;
    switch (level) {  
      case 'error':
        console.log('['.gray + 'ERROR'.red + ']'.gray + ' ' + message.white);
        break;
      case 'warn':
        console.log('['.gray + 'WARN'.yellow + ']'.gray + ' ' + message.white);
        break;
      case 'info':
        console.log('['.gray + 'INFO'.blue + ']'.gray + ' ' + message.white);
        break;
      case 'silly':
        console.log('['.gray + 'SILLY'.cyan + ']'.gray + ' ' + message.white);
        break;
      case 'debug':
        console.log('['.gray + 'DEBUG'.cyan + ']'.gray + ' ' + message.white);
        break;
      default:
        console.log('['.gray + 'SUCCESS'.green + ']'.gray + ' ' + message.white);
        break;
    }

    callback();
  }
}

module.exports = CustomConsoleTransport;