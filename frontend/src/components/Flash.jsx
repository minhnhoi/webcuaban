import { useState } from 'react';

export default function Flash() {
  return null;
}

export function useFlash() {
  const [flash, setFlash] = useState(null);
  const node = flash ? (
    <div id="flash">
      <div className={'flash ' + (flash.type === 'error' ? 'error' : 'success')}>
        {(flash.type === 'error' ? '⚠️ ' : '✨ ') + flash.msg}
      </div>
    </div>
  ) : (
    <div id="flash" />
  );
  return [node, (type, msg) => setFlash({ type, msg })];
}
