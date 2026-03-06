#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { version } = require('../package.json');

program
  .name('treebuy-cli')
  .description('小樹購 CLI — treebuy.com 命令列工具')
  .version(version);

// 子指令
require('../src/commands/featured')(program);
require('../src/commands/search')(program);
require('../src/commands/schema')(program);

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
