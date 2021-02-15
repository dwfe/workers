import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Sw} from '../Sw/Sw'
import {CheckCachePut} from '../CheckCachePut/CheckCachePut';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Sw/>
        <CheckCachePut/>
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