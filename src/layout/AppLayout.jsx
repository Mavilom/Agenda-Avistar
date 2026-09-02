import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Bell, CalendarDays, CloudUpload, Download, FileText, LayoutDashboard,
  LogOut, Settings, Users, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';

export default function AppLayout({
  onSyncAll,
  syncing,
  onConfigureDrive,
  onEnableNotifications,
  onExportData
}) {
  const { session, logout } = useAuth();
  const { isAdmin, isTechnician } = usePermissions();

  const navClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">A</div><div><strong>Agenda</strong><span>AVISTAR</span></div></div>
        <nav>
          <NavLink to="/dashboard" className={navClass}><LayoutDashboard size={19}/> Dashboard</NavLink>
          <NavLink to="/demandas" className={navClass}><FileText size={19}/> Demandas</NavLink>
          <NavLink to="/calendario" className={navClass}><CalendarDays size={19}/> Calendário</NavLink>
          <NavLink to="/relatorios" className={navClass}><FileText size={19}/> Relatórios</NavLink>
          <NavLink to="/clientes" className={navClass}><Building2 size={19}/> Clientes</NavLink>
          {isAdmin && <NavLink to="/usuarios" className={navClass}><Users size={19}/> Usuários</NavLink>}
        </nav>
        <div className="sidebar-footer">
          {!isTechnician && <button onClick={onSyncAll}><CloudUpload size={18}/> {syncing ? 'Sincronizando...' : 'Sincronizar Drive'}</button>}
          {isAdmin && <button onClick={onConfigureDrive}><Settings size={18}/> Configurar Drive</button>}
          <button onClick={onEnableNotifications}><Bell size={18}/> Ativar notificações</button>
          <button onClick={onExportData}><Download size={18}/> Fazer backup</button>
          <button onClick={logout}><LogOut size={18}/> Sair</button>
        </div>
      </aside>
      <main>
        <Outlet context={{ session }} />
      </main>
    </div>
  );
}
