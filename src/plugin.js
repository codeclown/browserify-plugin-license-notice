const fs = require('fs');
const through = require('through2');
const { processRows, performCheck } = require('./core');

module.exports = function licenseNoticePlugin(bundler, opts) {
  opts = Object.assign(
    {
      out: 'THIRD_PARTY_LICENSES',
      check: false,
    },
    opts
  );

  // This is a very simple Browserify-plugin. We push a new transformation
  // into the bundler, but in that transformation we don't actually transform
  // anything. We just collect the individual rows into an array. When the
  // bundler is finished, we call `writeNotice()`. For more information, see:
  // https://github.com/browserify/browserify-handbook#compiler-pipeline

  const rows = [];

  bundler.pipeline.get('deps').push(
    through.obj(
      function write(row, enc, next) {
        rows.push(row);
        next();
      },
      function end(cb) {
        const licenseNotice = processRows(rows);
        if (opts.check) {
          performCheck(licenseNotice, fs.readFileSync(opts.out, 'utf8'));
        } else {
          fs.writeFileSync(opts.out, licenseNotice);
        }
        cb();
      }
    )
  );
};
