import React from 'react';
import { AlertTriangle, Bell, CalendarDays, CheckCircle2, Clock3, Filter, Plus, Search } from 'lucide-react';
import Stat from '../components/Stat';
import TaskList from '../components/TaskList';

export default function DemandasPage({
  session, stats, filtered, query, setQuery, statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter, onNew, onToggle, onEdit, onHistory,
  onRemove, canCreate, canEdit, canDelete
}) {
  return <>
    <header className="topbar"><div><h1>Agenda de Demandas</h1><p>Olá, {session?.email}. Demandas sincronizadas online pelo Firebase.</p></div>{canCreate&&<button className="primary" onClick={onNew}><Plus size={19}/> Nova demanda</button>}</header>
    <section className="stats-grid"><Stat label="Em aberto" value={stats.open} icon={<Clock3/>}/><Stat label="Vencidas" value={stats.late} icon={<AlertTriangle/>} danger/><Stat label="Para hoje" value={stats.today} icon={<CalendarDays/>}/><Stat label="Alta prioridade" value={stats.high} icon={<Bell/>}/><Stat label="Concluídas" value={stats.done} icon={<CheckCircle2/>}/></section>
    <section className="toolbar"><div className="search"><Search size={18}/><input placeholder="Buscar empresa, assunto, responsável..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filters"><Filter size={17}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todas</option><option>Aberta</option><option>Em andamento</option><option>Concluída</option></select><select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option>Todas</option><option>Alta</option><option>Média</option><option>Baixa</option></select></div></section>
    <TaskList tasks={filtered} onToggle={onToggle} onEdit={onEdit} onHistory={onHistory} onRemove={onRemove} canEdit={canEdit} canDelete={canDelete}/>
  </>;
}
