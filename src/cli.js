#!/usr/bin/env node

const fs = require('fs');
const subarg = require('subarg');
const unpack = require('browser-unpack');
const { processRows, performCheck } = require('./core');

if (require.main === module) {
  try {
    main();
  } catch (exception) {
    console.error(exception.message);
    process.exit(1);
  }
}

function main() {
  const argv = subarg(process.argv.slice(2));

  const bundleFile = argv._[0];
  if (!bundleFile) {
    throw new Error('Expected argument: bundleFile');
  }

  let contents;
  try {
    contents = fs.readFileSync(bundleFile, 'utf8');
  } catch (error) {
    throw new Error(`Could not open file ${bundleFile}`);
  }

  const rows = unpack(contents);
  const licenseNotice = processRows(rows);

  if (argv.check) {
    performCheck(licenseNotice, fs.readFileSync(argv.check, 'utf8'));
  } else {
    console.log(licenseNotice);
  }
}
