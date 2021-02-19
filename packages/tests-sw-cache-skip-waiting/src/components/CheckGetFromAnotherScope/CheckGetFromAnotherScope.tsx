import React, {useCallback} from 'react'
import './CheckGetFromAnotherScope.css'

export function CheckGetFromAnotherScope() {

  const onClick = useCallback(
    async () => {
      fetch('/banana/google.svg')
    }, []);

  return (<div className="check-get-from-another-scope">
    <p className="check-get-from-another-scope_title">Проверить запрос файла из другого scope</p>
    <button onClick={onClick}>Fetch</button>
  </div>);
}
