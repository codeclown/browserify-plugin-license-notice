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

  const rows = [];

  bundler.on('dep', (row) => {
    rows.push(row);
  });

  bundler.on('end', () => {
    const licenseNotice = processRows(rows);
    if (opts.check) {
      performCheck(licenseNotice, fs.readFileSync(opts.out, 'utf8'));
    } else {
      fs.writeFileSync(opts.out, licenseNotice);
    }
  });
};
