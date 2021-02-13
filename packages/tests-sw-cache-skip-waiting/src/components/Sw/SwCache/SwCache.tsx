import React from 'react';

export function SwCache({data}: IProps) {
  return (<tr>
    <td className="cache-info_scope">{data.cacheName.scope}</td>
    <td className="cache-info_title">{data.cacheName.title}</td>
    <td className="cache-info_version">{data.cacheName.version}</td>
    <td className="cache-info_length">{data.length}</td>
  </tr>);
}

interface IProps {
  data: {
    cacheName: {
      scope: string;
      title: string;
      version: string;
    },
    length: number;
  }
}
