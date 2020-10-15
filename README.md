# browserify-plugin-license-notice

Extract third-party licenses to a file. Two options:

- use the plugin during the build process<br>`browserify --plugin browserify-plugin-license-notice`
- run the CLI tool against an already generated bundle<br> `browserify-bundle-license-notice dist/bundle.js`

Format of the generated file:

```
Package: @babel/runtime
Source: https://npmjs.com/package/@babel/runtime
License: MIT

MIT License

Copyright (c) 2014-present Sebastian McKenzie and other contributors

Permission is hereby granted, [... shortened ...]

-----

Package: capital-case
Source: https://npmjs.com/package/capital-case
License: MIT

The MIT License (MIT)

Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com)

Permission is hereby granted, [... shortened ...]

-----
```

## Installation

```bash
npm install --save-dev browserify-plugin-license-notice
yarn add --dev browserify-plugin-license-notice
```

## Usage

### Command Line

By default will write into file `THIRD_PARTY_LICENSES`.

```bash
browserify -p browserify-plugin-license-notice
```

Filename can be configured.

```bash
browserify -p [ browserify-plugin-license-notice --out licenses.txt ]
```

Also supported "CI mode", where the script will throw an error if a difference is detected to already existing file.

```bash
browserify -p [ browserify-plugin-license-notice --check ]
```

### Stand-alone CLI utility

Also included is a CLI utility which generates a license notice from an already bundled file.

```bash
browserify-bundle-license-notice dist/bundle.js > THIRD_PARTY_LICENSES
```

It also supports "CI mode", which fails if the existing file is out-dated.

```bash
browserify-bundle-license-notice dist/bundle.js --check THIRD_PARTY_LICENSES
```

### Browserify API

Use the plugin programmatically like this:

```javascript
const browserify = require('browserify');
const licenseNotice = require('browserify-plugin-license-notice');

browserify({ debug: true })
  .plugin(licenseNotice, {
    // configuration as usual
  })
  .bundle()
  .pipe(fs.createWriteStream('bundle.js', 'utf8'));
```

## Options

#### `out` (string)

Path of the file to write.

#### `check` (boolean)

If true, the plugin will throw if a difference is detected between the output and an already existing file. Use this as a CI step to ensure that the licenses file is up-to-date in your version control.

## License

[MIT](./LICENSE)
