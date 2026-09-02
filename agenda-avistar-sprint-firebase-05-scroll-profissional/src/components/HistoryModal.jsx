import React from 'react';
import { X } from 'lucide-react';

export default function HistoryModal({task,onClose}){return <div className="modal-backdrop"><div className="modal history-modal"><div className="modal-title"><div><h2>Histórico</h2><p>{task.title}</p></div><button onClick={onClose}><X/></button></div><div className="timeline">{[...(task.history||[])].reverse().map((h,i)=><div className="timeline-item" key={i}><div className="dot"/><div><strong>{h.text}</strong><span>{new Date(h.date).toLocaleString('pt-BR')}</span></div></div>)}</div></div></div>}
