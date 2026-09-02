import React from 'react';

export default function Stat({label,value,icon,danger}){return <div className={`stat ${danger?'danger':''}`}><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>}
