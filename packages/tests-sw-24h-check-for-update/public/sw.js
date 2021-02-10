
const version = 'v1'

self.addEventListener('install', event => {
  console.log(`${version} installing…`);
});

self.addEventListener('activate', event => {
  console.log(`${version} activate`);
});
