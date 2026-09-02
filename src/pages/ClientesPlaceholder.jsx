import React from 'react';
import { Building2 } from 'lucide-react';

export default function ClientesPlaceholder() {
  return <>
    <header className="topbar"><div><h1>Clientes</h1><p>Base preparada para a Sprint 07.1 — Cadastro Mestre de Clientes.</p></div></header>
    <section className="report-table-card"><div className="empty"><Building2 size={38}/><h3>Módulo preparado</h3><p>A próxima etapa adicionará cadastro, edição, busca, status e auditoria de clientes.</p></div></section>
  </>;
}
