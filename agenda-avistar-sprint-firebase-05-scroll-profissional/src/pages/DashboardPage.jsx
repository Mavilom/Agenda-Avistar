import React from 'react';
import { AlertTriangle, Bell, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import Stat from '../components/Stat';

export default function DashboardPage({ stats, session }) {
  return <>
    <header className="topbar"><div><h1>Dashboard Operacional</h1><p>Olá, {session?.email}. Visão geral das demandas da Agenda Avistar.</p></div></header>
    <section className="stats-grid">
      <Stat label="Em aberto" value={stats.open} icon={<Clock3/>}/>
      <Stat label="Vencidas" value={stats.late} icon={<AlertTriangle/>} danger/>
      <Stat label="Para hoje" value={stats.today} icon={<CalendarDays/>}/>
      <Stat label="Alta prioridade" value={stats.high} icon={<Bell/>}/>
      <Stat label="Concluídas" value={stats.done} icon={<CheckCircle2/>}/>
    </section>
    <section className="report-table-card">
      <div className="report-title"><div><h2>Centro de controle</h2><p>Os próximos módulos serão adicionados nesta área sem alterar a estrutura principal.</p></div><strong>Sprint 07.0</strong></div>
    </section>
  </>;
}
