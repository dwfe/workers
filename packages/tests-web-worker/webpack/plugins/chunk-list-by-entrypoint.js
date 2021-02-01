const defaultOpt = {
  filename: 'chunk_list_by_entrypoint.json'
}

// https://habr.com/ru/post/423693#kak-reshit-etu-problemu

module.exports = function ({filename} = defaultOpt) {
  this.apply = compiler => {

    compiler.hooks.emit.tap('Chunk list by Entrypoint', compilation => {
      const publicPath = compilation.compiler.options.output.publicPath || '';
      const data = {};

      for (let [key, value] of compilation.entrypoints.entries()) {
        const chunks = value.chunks.map(data => {
          const chunk = {
            id: data.id,
            name: data.name,
            files: data.files
          };
          // console.log(`chunk`, chunk)
          return chunk;
        });

        const files = [].concat(...chunks.filter(c => c !== null)
          .map(c => c.files.map(f => publicPath + f))); // publicPath + f
        const js = files.filter(f => /.js/.test(f) && !/.js.map/.test(f));
        const css = files.filter(f => /.css/.test(f) && !/.css.map/.test(f));
        const entrypoint = {};
        if (js.length) entrypoint["js"] = js;
        if (css.length) entrypoint["css"] = css;

        data[key] = entrypoint;
      }
      const json = JSON.stringify(data, null, 2);
      compilation.assets[filename] = {
        source: () => json,
        size: () => json.length
      };
    })
  }
}
