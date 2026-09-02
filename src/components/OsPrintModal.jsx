import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { formatDate } from '../utils/taskUtils';

function value(v){ return v || '-'; }

export default function OsPrintModal({task,onClose}){
  if(!task)return null;
  const print=()=>window.print();
  return <div className="modal-backdrop os-print-backdrop">
    <div className="modal os-print-modal">
      <div className="modal-title no-print">
        <div><h2>Ordem de Serviço</h2><p>Visualize, imprima ou salve a OS em PDF.</p></div>
        <button onClick={onClose}><X/></button>
      </div>
      <div className="os-document" id="os-document">
        <header className="os-doc-header">
          <div className="os-doc-brand"><div className="brand-mark">A</div><div><strong>AVISTAR</strong><span>ORDEM DE SERVIÇO</span></div></div>
          <div className="os-doc-number"><small>Número da O.S.</small><strong>{value(task.osNumber)}</strong><span>{task.status||'Aberta'}</span></div>
        </header>
        <div className="os-doc-meta">
          <div><small>Data do serviço</small><strong>{formatDate(task.serviceDate||task.dueDate)}</strong></div>
          <div><small>Tipo O.S.</small><strong>{value(task.osType||task.category)}</strong></div>
          <div><small>Prioridade</small><strong>{value(task.priority)}</strong></div>
          <div><small>Valor do serviço</small><strong>{value(task.serviceValue)}</strong></div>
        </div>

        <DocSection title="Cliente">
          <DocItem label="Nome" value={task.company}/><DocItem label="Responsável" value={task.responsible}/>
        </DocSection>
        <DocSection title="Veículo">
          <DocItem label="Placa" value={task.vehiclePlate}/><DocItem label="Marca" value={task.vehicleBrand}/><DocItem label="Modelo" value={task.vehicleModel}/>
        </DocSection>
        <DocSection title="Rastreador e conectividade">
          <DocItem label="ID / IMEI" value={task.trackerId}/><DocItem label="Marca" value={task.trackerBrand}/><DocItem label="Modelo" value={task.trackerModel}/><DocItem label="ICCID / SimCard" value={task.simCard}/><DocItem label="Número da linha" value={task.phoneNumber}/><DocItem label="Plataforma" value={task.platform}/>
        </DocSection>
        <DocSection title="Atendimento">
          <DocItem label="Técnico / Instalador" value={task.installer}/><DocItem label="Status" value={task.status}/><DocItem label="Prazo" value={`${formatDate(task.dueDate)} ${task.dueTime||''}`.trim()}/>
        </DocSection>
        <section className="os-doc-section os-doc-description"><h3>Descrição / Observações</h3><p>{task.description||'Sem observações registradas.'}</p></section>
        {task.technicianNotes&&<section className="os-doc-section os-doc-description"><h3>Relatório técnico da execução</h3><p>{task.technicianNotes}</p></section>}
        {task.executionChecklist&&<section className="os-doc-section"><h3>Checklist técnico</h3><div className="os-doc-grid">{Object.entries(task.executionChecklist).map(([k,v])=><DocItem key={k} label={k.replaceAll('_',' ')} value={v?'Aprovado':'Pendente'}/>)}</div></section>}
        {((task.beforePhotos?.length||0)+(task.afterPhotos?.length||0))>0&&<section className="os-doc-section"><h3>Evidências fotográficas</h3><div className="os-photo-evidence">{[...(task.beforePhotos||[]).map(x=>({...x,label:'Antes'})),...(task.afterPhotos||[]).map(x=>({...x,label:'Depois'}))].map((p,i)=><figure key={i}><img src={p.url} alt={p.label}/><figcaption>{p.label}</figcaption></figure>)}</div></section>}
        <section className="os-signatures">
          <div>{task.technicianSignature?.url?<img className="os-signature-image" src={task.technicianSignature.url} alt="Assinatura do técnico"/>:<span></span>}<strong>Técnico responsável</strong></div>
          <div>{task.clientSignature?.url?<img className="os-signature-image" src={task.clientSignature.url} alt="Assinatura do cliente"/>:<span></span>}<strong>Cliente / Responsável</strong></div>
        </section>
        <footer className="os-doc-footer">Documento gerado pela Agenda Avistar · {task.osNumber||'O.S. sem numeração'}</footer>
      </div>
      <div className="modal-actions no-print"><button type="button" className="secondary" onClick={onClose}>Fechar</button><button type="button" className="primary" onClick={print}><Printer size={18}/> Imprimir / Salvar PDF</button></div>
    </div>
  </div>
}

function DocSection({title,children}){return <section className="os-doc-section"><h3>{title}</h3><div className="os-doc-grid">{children}</div></section>}
function DocItem({label,value:val}){return <div><small>{label}</small><strong>{value(val)}</strong></div>}
