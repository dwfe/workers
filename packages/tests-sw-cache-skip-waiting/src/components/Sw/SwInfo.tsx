import React, {useCallback, useEffect, useState} from 'react';
import {SwCache} from '../SwCache/SwCache'


export function SwInfo() {
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
      <table>
        <caption>Кеш</caption>
        <tr>
          <th>Title</th>
          <th>Version</th>
          <th>Length</th>
        </tr>
        {
          info?.caches?.map((data, i) => <SwCache key={i} data={data}/>)
        }</table>
    </div>
  </div>);

}
