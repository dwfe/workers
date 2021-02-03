const {join} = require('path');
const {lstatSync, readdirSync} = require('fs');

function getWorkerEntries(path, filePattern, entries = {}) {
  if (!lstatSync(path).isDirectory())
    return entries;
  const fileNames = readdirSync(path);
  fileNames.forEach(fileName => {
    const filePath = join(path, fileName);
    if (lstatSync(filePath).isDirectory())
      getWorkerEntries(filePath, filePattern, entries);
    else if (fileName.includes(filePattern)) { // ЕСЛИ имя файла содержит паттерн для воркера
      const fileNameWithoutExt = fileName.split('.')[0];
      entries[fileNameWithoutExt] = filePath;
    }
  });
  return entries;
}

module.exports = {
  getWorkerEntries
}
