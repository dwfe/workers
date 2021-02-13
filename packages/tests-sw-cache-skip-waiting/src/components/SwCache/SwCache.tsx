import React from 'react';
import './SwCache.css';

export function SwCache({data}: IProps) {
  return (<tr>
    <td><u><strong>{data.title}</strong></u></td>
    <td>version: <strong style={{color: 'lime'}}>{data.version}</strong></td>
    <td>length: <strong style={{color: 'lightblue'}}>{data.length}</strong></td>
  </tr>);
}

interface IProps {
  data: {
    title: string;
    version: string;
    length: number;
  }
}
