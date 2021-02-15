import React, {useCallback} from 'react';
import './CheckCachePut.css';

const pathname = '/google.svg';
const pathname_QUERY = '/google.svg?hello=world';
const pathname_QUERY_HASH = '/google.svg?hello=world#123';

export function CheckCachePut() {

  const cacheFile = useCallback(
    async type => {
      switch (type) {
        case 'pathname':
          console.log(`pathname:`, pathname)
          await fetch(pathname)
          break;
        case 'pathname_QUERY':
          console.log(`pathname_QUERY:`, pathname_QUERY)
          await fetch(pathname_QUERY)
          break;
        case 'pathname_QUERY_HASH':
          console.log(`pathname_QUERY_HASH:`, pathname_QUERY_HASH)
          await fetch(pathname_QUERY_HASH)
          break;
        case 'GET_pathname':
          console.log(`GET_pathname:`, pathname)
          await fetch(pathname, {
            method: 'GET'
          })
          break;
        case 'GET_pathname_QUERY':
          console.log(`GET_pathname_QUERY:`, pathname_QUERY)
          await fetch(pathname_QUERY, {
            method: 'GET'
          })
          break;
        case 'GET_pathname_QUERY_HASH':
          console.log(`GET_pathname_QUERY_HASH:`, pathname_QUERY_HASH)
          await fetch(pathname_QUERY_HASH, {
            method: 'GET'
          })
          break;
        case 'POST_pathname':
          console.log(`POST_pathname:`, pathname)
          await fetch(pathname, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({a: 1, b: 'Textual content'})
          })
          break;
        case 'POST_pathname_QUERY':
          console.log(`POST_pathname_QUERY:`, pathname_QUERY)
          await fetch(pathname_QUERY, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({hello: 2, world: 'content'})
          })
          break;
        case 'POST_pathname_QUERY_HASH':
          console.log(`POST_pathname_QUERY_HASH:`, pathname_QUERY_HASH)
          await fetch(pathname_QUERY_HASH, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({world: 3, hello: 'content'})
          })
          break;
        default:
          throw new Error(`CheckCachePut - unknown type '${type}'`)
      }
    }, []);

  return (<div className="check-cache-put">
    <p className="check-cache-put_title">Проверить какой ключ у <code>cache.put</code></p>
    <button onClick={() => cacheFile('pathname')}>pathname</button>&nbsp;
    <button onClick={() => cacheFile('pathname_QUERY')}>pathname_QUERY</button>&nbsp;
    <button onClick={() => cacheFile('pathname_QUERY_HASH')}>pathname_QUERY_HASH</button>
    <br/>
    <button onClick={() => cacheFile('GET_pathname')}>GET_pathname</button>&nbsp;
    <button onClick={() => cacheFile('GET_pathname_QUERY')}>GET_pathname_QUERY</button>&nbsp;
    <button onClick={() => cacheFile('GET_pathname_QUERY_HASH')}>GET_pathname_QUERY_HASH</button>
    <br/>
    <button onClick={() => cacheFile('POST_pathname')}>POST_pathname</button>&nbsp;
    <button onClick={() => cacheFile('POST_pathname_QUERY')}>POST_pathname_QUERY</button>&nbsp;
    <button onClick={() => cacheFile('POST_pathname_QUERY_HASH')}>POST_pathname_QUERY_HASH</button>
  </div>);
}

