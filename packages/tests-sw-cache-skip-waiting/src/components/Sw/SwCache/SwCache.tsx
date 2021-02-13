import React from 'react';

export function SwCache({data}: IProps) {
  return (<tr>
    <td className="cache-info_title">{data.title}</td>
    <td className="cache-info_version">{data.version}</td>
    <td className="cache-info_length">{data.length}</td>
  </tr>);
}

interface IProps {
  data: {
    title: string;
    version: string;
    length: number;
  }
}
