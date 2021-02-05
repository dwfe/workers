
const version = '#222222222222222222222222222222'

self.addEventListener('install', event => {
  console.log(`${version} installing…`);
});

self.addEventListener('activate', event => {
  console.log(`${version} activate`);
});
