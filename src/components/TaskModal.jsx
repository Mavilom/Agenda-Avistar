import React, { useEffect, useMemo, useState } from 'react';
import { Link2, LockKeyhole, X } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { categories, SUPERVISOR_EDITABLE_FIELDS, TECHNICIAN_EDITABLE_FIELDS } from '../constants/taskConfig';

export default function TaskModal({form,setForm,editing,isAdmin,isSupervisor,isTechnician,onClose,onSubmit}){
  const [clientes,setClientes]=useState([]);
  const [veiculos,setVeiculos]=useState([]);
  const [equipamentos,setEquipamentos]=useState([]);
  const [technicians,setTechnicians]=useState([]);
  const [masterError,setMasterError]=useState('');

  const set=(k,v)=>setForm(prev=>({...prev,[k]:v}));
  const supervisorLocked=editing&&isSupervisor;
  const technicianLocked=editing&&isTechnician;
  const lockedForSupervisor=(field)=>supervisorLocked&&!SUPERVISOR_EDITABLE_FIELDS.has(field);
  const lockedForTechnician=(field)=>technicianLocked&&!TECHNICIAN_EDITABLE_FIELDS.has(field);
  const isFieldLocked=(field)=>!isAdmin&&(lockedForSupervisor(field)||lockedForTechnician(field));
  const demandLocked=editing&&!isAdmin;

  useEffect(()=>{
    const fail=()=>setMasterError('Não foi possível carregar os cadastros mestres. Você ainda pode editar os demais campos.');
    const unsubs=[
      onSnapshot(collection(db,'clientes'),snap=>setClientes(snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status!=='inativo').sort((a,b)=>(a.nome||'').localeCompare(b.nome||''))),fail),
      onSnapshot(collection(db,'veiculos'),snap=>setVeiculos(snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status!=='inativo').sort((a,b)=>(a.placa||'').localeCompare(b.placa||''))),fail),
      onSnapshot(collection(db,'equipamentos'),snap=>setEquipamentos(snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status!=='baixado').sort((a,b)=>(a.imei||'').localeCompare(b.imei||''))),fail)
    ];
    // Apenas Admin/Supervisor precisam da lista de técnicos para atribuição.
    if(!isTechnician){
      unsubs.push(onSnapshot(collection(db,'usuarios'),snap=>{
        setTechnicians(snap.docs.map(d=>({id:d.id,...d.data()}))
          .filter(x=>x.status==='ativo'&&x.perfil==='tecnico')
          .sort((a,b)=>(a.nome||a.email||'').localeCompare(b.nome||b.email||'')));
      },fail));
    }
    return()=>unsubs.forEach(fn=>fn());
  },[isTechnician]);

  // Resolve vínculos de demandas antigas criadas antes da Sprint 03.
  useEffect(()=>{
    if(form.clienteId||!form.company||!clientes.length)return;
    const found=clientes.find(c=>(c.nome||'').trim().toLowerCase()===String(form.company||'').trim().toLowerCase());
    if(found)setForm(prev=>({...prev,clienteId:found.id}));
  },[clientes,form.clienteId,form.company,setForm]);

  useEffect(()=>{
    if(form.veiculoId||!form.vehiclePlate||!veiculos.length)return;
    const plate=form.vehiclePlate.replace(/[^A-Z0-9]/gi,'').toUpperCase();
    const found=veiculos.find(v=>(v.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase()===plate);
    if(found)setForm(prev=>({...prev,veiculoId:found.id,clienteId:prev.clienteId||found.clienteId||''}));
  },[veiculos,form.veiculoId,form.vehiclePlate,setForm]);

  useEffect(()=>{
    if(form.equipamentoId||!form.trackerId||!equipamentos.length)return;
    const found=equipamentos.find(e=>(e.imei||'').trim()===String(form.trackerId||'').trim());
    if(found)setForm(prev=>({...prev,equipamentoId:found.id,veiculoId:prev.veiculoId||found.veiculoId||''}));
  },[equipamentos,form.equipamentoId,form.trackerId,setForm]);

  const vehiclesForClient=useMemo(()=>{
    if(!form.clienteId)return [];
    return veiculos.filter(v=>v.clienteId===form.clienteId);
  },[veiculos,form.clienteId]);

  const equipmentForVehicle=useMemo(()=>{
    if(!form.veiculoId)return [];
    const vehicle=veiculos.find(v=>v.id===form.veiculoId);
    return equipamentos.filter(e=>e.veiculoId===form.veiculoId || (!!vehicle?.placa && e.placa===vehicle.placa));
  },[equipamentos,veiculos,form.veiculoId]);

  function equipmentPatch(eq){
    return {
      equipamentoId:eq?.id||'',
      trackerId:eq?.imei||'',
      trackerBrand:eq?.marca||'',
      trackerModel:eq?.modelo||'',
      simCard:eq?.iccid||'',
      phoneNumber:eq?.linha||''
    };
  }

  function chooseClient(id){
    const client=clientes.find(c=>c.id===id);
    setForm(prev=>({
      ...prev,
      clienteId:id,
      company:client?.nome||'',
      responsible:client?.responsavel||prev.responsible||'',
      veiculoId:'',vehiclePlate:'',vehicleBrand:'',vehicleModel:'',
      ...equipmentPatch(null)
    }));
  }

  function chooseVehicle(id){
    const vehicle=veiculos.find(v=>v.id===id);
    const linked=equipamentos.filter(e=>e.veiculoId===id || (!!vehicle?.placa && e.placa===vehicle.placa));
    const automatic=linked.length===1?linked[0]:null;
    setForm(prev=>({
      ...prev,
      veiculoId:id,
      vehiclePlate:vehicle?.placa||'',
      vehicleBrand:vehicle?.marca||'',
      vehicleModel:vehicle?.modelo||'',
      ...equipmentPatch(automatic)
    }));
  }

  function chooseEquipment(id){
    const eq=equipamentos.find(e=>e.id===id);
    setForm(prev=>({...prev,...equipmentPatch(eq)}));
  }

  function chooseTechnician(id){
    const tech=technicians.find(t=>t.id===id);
    setForm(prev=>({
      ...prev,
      technicianUid:tech?.id||'',
      installerEmail:tech?.email||'',
      installer:tech?.nome||tech?.email||''
    }));
  }

  const selectedClient=clientes.find(c=>c.id===form.clienteId);
  const selectedVehicle=veiculos.find(v=>v.id===form.veiculoId);
  const selectedEquipment=equipamentos.find(e=>e.id===form.equipamentoId);

  return <div className="modal-backdrop"><div className="modal modal-large"><div className="modal-title"><div><h2>{editing?'Editar demanda':'Nova demanda'}</h2><p>Preencha os dados completos da pendência e da ordem de serviço.</p></div><button onClick={onClose}><X/></button></div>
  {demandLocked&&<div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',marginBottom:16,borderRadius:10,background:'rgba(245,158,11,.12)',border:'1px solid rgba(245,158,11,.35)'}}><LockKeyhole size={19}/><div><strong>{isSupervisor?'Demanda bloqueada para dados técnicos':'Edição operacional do técnico'}</strong><div style={{fontSize:13,opacity:.8}}>{isSupervisor?'Você pode atualizar apenas os campos operacionais. Dados de cliente, veículo, rastreador, conectividade, O.S. e plataforma são exclusivos do Administrador.':'Você pode atualizar somente o status e as observações.'}</div></div></div>}
  <form onSubmit={onSubmit}>
    <div className="form-section-title">Demanda</div>
    <Field label="Título" full locked={isFieldLocked('title')}><input value={form.title} disabled={isFieldLocked('title')} onChange={e=>set('title',e.target.value)} required/></Field>
    <Field label="Cliente cadastrado" full locked={isFieldLocked('company')}>
      <select value={form.clienteId||''} disabled={isFieldLocked('company')} onChange={e=>chooseClient(e.target.value)}>
        <option value="">Selecione o cliente...</option>
        {!form.clienteId&&form.company&&<option value="">Registro antigo: {form.company}</option>}
        {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}{c.cnpj?` - ${c.cnpj}`:''}</option>)}
      </select>
      {selectedClient&&<MasterHint>Responsável: {selectedClient.responsavel||'-'} · {selectedClient.cidade||''}{selectedClient.uf?`/${selectedClient.uf}`:''}</MasterHint>}
    </Field>
    <Field label="Responsável" locked={isFieldLocked('responsible')}><input value={form.responsible} disabled={isFieldLocked('responsible')} onChange={e=>set('responsible',e.target.value)}/></Field><Field label="Categoria" locked={isFieldLocked('category')}><select value={form.category} disabled={isFieldLocked('category')} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Prioridade" locked={isFieldLocked('priority')}><select value={form.priority} disabled={isFieldLocked('priority')} onChange={e=>set('priority',e.target.value)}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field><Field label="Data do prazo" locked={isFieldLocked('dueDate')}><input type="date" value={form.dueDate} disabled={isFieldLocked('dueDate')} onChange={e=>set('dueDate',e.target.value)}/></Field><Field label="Horário" locked={isFieldLocked('dueTime')}><input type="time" value={form.dueTime} disabled={isFieldLocked('dueTime')} onChange={e=>set('dueTime',e.target.value)}/></Field><Field label="Status" locked={isFieldLocked('status')}><select value={form.status} disabled={isFieldLocked('status')} onChange={e=>set('status',e.target.value)}><option>Aberta</option><option>Em andamento</option><option>Concluída</option></select></Field>

    <div className="form-section-title">Veículo</div>
    <Field label="Veículo cadastrado" full locked={isFieldLocked('vehiclePlate')}>
      <select value={form.veiculoId||''} disabled={isFieldLocked('vehiclePlate')||!form.clienteId} onChange={e=>chooseVehicle(e.target.value)}>
        <option value="">{form.clienteId?'Selecione o veículo...':'Selecione primeiro o cliente'}</option>
        {vehiclesForClient.map(v=><option key={v.id} value={v.id}>{v.placa} - {v.marca||''} {v.modelo||''}{v.frota?` · Frota ${v.frota}`:''}</option>)}
      </select>
      {selectedVehicle&&<MasterHint>Dados carregados automaticamente do cadastro do veículo.</MasterHint>}
    </Field>
    <Field label="Placa" locked={isFieldLocked('vehiclePlate')}><input value={form.vehiclePlate} disabled readOnly/></Field><Field label="Marca" locked={isFieldLocked('vehicleBrand')}><input value={form.vehicleBrand} disabled readOnly/></Field><Field label="Modelo" locked={isFieldLocked('vehicleModel')}><input value={form.vehicleModel} disabled readOnly/></Field>

    <div className="form-section-title">Rastreador</div>
    <Field label="Equipamento vinculado" full locked={isFieldLocked('trackerId')}>
      <select value={form.equipamentoId||''} disabled={isFieldLocked('trackerId')||!form.veiculoId} onChange={e=>chooseEquipment(e.target.value)}>
        <option value="">{form.veiculoId?(equipmentForVehicle.length?'Selecione o equipamento...':'Nenhum equipamento vinculado a este veículo'):'Selecione primeiro o veículo'}</option>
        {equipmentForVehicle.map(e=><option key={e.id} value={e.id}>{e.imei} - {e.marca||''} {e.modelo||''}{e.status?` · ${e.status}`:''}</option>)}
      </select>
      {selectedEquipment&&<MasterHint>ICCID: {selectedEquipment.iccid||'-'} · Linha: {selectedEquipment.linha||'-'}</MasterHint>}
    </Field>
    <Field label="ID do equipamento" locked={isFieldLocked('trackerId')}><input value={form.trackerId} disabled readOnly/></Field><Field label="Marca" locked={isFieldLocked('trackerBrand')}><input value={form.trackerBrand} disabled readOnly/></Field><Field label="Modelo" locked={isFieldLocked('trackerModel')}><input value={form.trackerModel} disabled readOnly/></Field>
    <div className="form-section-title">Conectividade</div>
    <Field label="SimCard / ICCID" locked={isFieldLocked('simCard')}><input value={form.simCard} disabled readOnly/></Field><Field label="Número da linha" locked={isFieldLocked('phoneNumber')}><input value={form.phoneNumber} disabled readOnly/></Field>
    <div className="form-section-title">Técnico / O.S.</div>
    <Field label="Número da O.S." locked><input value={form.osNumber||'Gerado automaticamente ao salvar'} disabled readOnly/></Field>
    <Field label="Técnico responsável" locked={isFieldLocked('installer')}>
      {isTechnician?<input value={form.installer||form.installerEmail||''} disabled readOnly/>:
      <select value={form.technicianUid||''} disabled={isFieldLocked('installer')} onChange={e=>chooseTechnician(e.target.value)}>
        <option value="">Selecione o técnico...</option>
        {technicians.map(t=><option key={t.id} value={t.id}>{t.nome||t.email}{t.email?` - ${t.email}`:''}</option>)}
      </select>}
      {!!form.installerEmail&&<MasterHint>Usuário vinculado: {form.installerEmail}</MasterHint>}
    </Field><Field label="Data do serviço" locked={isFieldLocked('serviceDate')}><input type="date" value={form.serviceDate} disabled={isFieldLocked('serviceDate')} onChange={e=>set('serviceDate',e.target.value)}/></Field><Field label="Tipo O.S." locked={isFieldLocked('osType')}><input value={form.osType} disabled={isFieldLocked('osType')} onChange={e=>set('osType',e.target.value)}/></Field><Field label="Valor do serviço" locked={isFieldLocked('serviceValue')}><input placeholder="Ex.: R$ 150,00" value={form.serviceValue} disabled={isFieldLocked('serviceValue')} onChange={e=>set('serviceValue',e.target.value)}/></Field>
    <div className="form-section-title">Sistema</div>
    <Field label="Plataforma" locked={isFieldLocked('platform')}><input value={form.platform} disabled={isFieldLocked('platform')} onChange={e=>set('platform',e.target.value)}/></Field><Field label="Descrição/observações" full locked={isFieldLocked('description')}><textarea rows="4" value={form.description} disabled={isFieldLocked('description')} onChange={e=>set('description',e.target.value)}/></Field>
    {masterError&&<div className="master-error">{masterError}</div>}
    <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Salvar demanda</button></div>
  </form></div></div>
}
function Field({label,full,locked,children}){return <div className={`field ${full?'full':''}`}><label style={{display:'flex',alignItems:'center',gap:6}}>{locked&&<LockKeyhole size={14}/>} {label}</label>{children}</div>}
function MasterHint({children}){return <small className="master-hint"><Link2 size={13}/>{children}</small>}
