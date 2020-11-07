import Bot from './Bot';

if (process.argv.length === 3) {
  // eslint-disable-next-line no-new
  new Bot(process.argv[2]);
}
