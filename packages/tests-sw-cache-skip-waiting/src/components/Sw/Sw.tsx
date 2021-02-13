import React, {useCallback, useEffect, useState} from 'react';
import {SwCache} from './SwCache/SwCache'
import './Sw.css'


export function Sw() {
  const [info, setInfo] = useState({} as any);

  const onSwMessage = useCallback(
    ({data}: MessageEvent) => {
      if (data?.type === 'INFO')
        setInfo(data.data)
    }, [setInfo]
  );

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onSwMessage);
    };
  }, [onSwMessage]);

  return (<div className="sw-info">
    <div className="cache-info">
      <table className="cache-info_table">
        <caption>Кеш</caption>
        <thead>
        <tr>
          <th>scope</th>
          <th>title</th>
          <th>version</th>
          <th>length</th>
        </tr>
        </thead>
        <tbody>
        {
          info?.caches?.map((data, i) => <SwCache key={i} data={data}/>)
        }
        </tbody>
      </table>
    </div>
  </div>);
}
