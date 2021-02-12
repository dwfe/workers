import React, {useCallback, useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [swInfo, setSwInfo] = useState([]as any);

  const onSwMessage = useCallback(
    ({data}: MessageEvent) => {
      if (data.type === 'INFO')
        setSwInfo(data.data)
    }, [setSwInfo]
  );

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onSwMessage);
    };
  }, [onSwMessage]);

  return (
    <div className="App">
      <header className="App-header">
        {
          swInfo?.caches?.map(({title, version, length}, i)=>{
            return (<div key={i}>
              <p><u><strong>{title}</strong></u></p>
              <p>version: <strong style={{color: 'lime'}}>{version}</strong></p>
              <p>length: <strong style={{color: 'lightblue'}}>{length}</strong></p>
            </div>);
          })
        }
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
