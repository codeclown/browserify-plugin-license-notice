const fs = require('fs');
const path = require('path');
const { diffStringsUnified } = require('jest-diff');

function readFile(root, fileWithoutExtension) {
  try {
    const files = fs.readdirSync(root);
    const match = files.find((file) => {
      return file.startsWith(fileWithoutExtension);
    });
    return match && fs.readFileSync(path.join(root, match), 'utf8');
  } catch (exception) {
    return null;
  }
}

function parseArbitraryLicenseFile(licenseNotation) {
  return licenseNotation.startsWith('SEE LICENSE IN ')
    ? licenseNotation.slice(15)
    : null;
}

function formatLicense(
  packageName,
  licenseNotation,
  licenseContents,
  noticeContents
) {
  let text = '';
  text += `Package: ${packageName}\n`;
  text += `Source: https://npmjs.com/package/${packageName}\n`;
  text += `License: ${licenseNotation}\n`;
  if (licenseContents) {
    text += `\n${licenseContents}\n`;
  }
  if (noticeContents) {
    if (licenseContents) {
      text += `\nNOTICE\n`;
    }
    text += `\n${licenseContents}\n`;
  }
  return text;
}

function resolveNpmPackageNameFromPath(filename) {
  // Local files
  if (filename.startsWith('.')) {
    return null;
  }
  // Browserify internals
  if (filename.startsWith('_')) {
    return null;
  }
  // Be cautious of org-level packages
  // Example: @babel/runtime/helpers/asyncToGenerator -> @babel/runtime
  // Example: dom-helpers/addClass -> dom-helpers
  const segments = filename.split(/\//g);
  const moduleName = segments
    .slice(0, filename.startsWith('@') ? 2 : 1)
    .join('/');
  return moduleName;
}

function processRows(rows) {
  const packageNames = new Set();
  for (let row of rows) {
    const fullImportPaths = Object.keys(row.deps);
    for (let importPath of fullImportPaths) {
      const moduleName = resolveNpmPackageNameFromPath(importPath);
      if (moduleName) {
        packageNames.add(moduleName);
      }
    }
  }

  const licenses = Array.from(packageNames.values())
    .sort()
    .map((packageName) => {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');

      const manifestPath = path.join(
        nodeModulesPath,
        packageName,
        'package.json'
      );
      const packageRoot = path.dirname(manifestPath);

      const licenseNotation = require(manifestPath).license;
      const arbitraryFilename = parseArbitraryLicenseFile(licenseNotation);

      const licenseContents =
        (arbitraryFilename ? readFile(packageRoot, arbitraryFilename) : null) ||
        readFile(packageRoot, 'LICENSE') ||
        readFile(packageRoot, 'LICENCE');

      const noticeContents = readFile(packageRoot, 'NOTICE');

      return formatLicense(
        packageName,
        licenseNotation,
        licenseContents,
        noticeContents
      );
    });

  const output = licenses.join('\n\n-----\n\n');

  return output;
}

function performCheck(expected, actual) {
  expected = expected.trim();
  actual = actual.trim();
  if (expected !== actual) {
    const diff = diffStringsUnified(actual, expected, {
      aAnnotation: 'File',
      bAnnotation: 'Generated',
      contextLines: 1,
      expand: false,
    });
    throw new Error(`Check failed! See diff below.\n${diff}`);
  }
}

module.exports = { processRows, performCheck };
