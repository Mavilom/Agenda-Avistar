import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Bell, CalendarDays, CheckCircle2, Clock3, Download,
  FileText, Filter, LayoutDashboard, LogOut, Plus, Search,
  CloudUpload, Settings, Users, Building2, Car, Radio
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, query as firestoreQuery, setDoc, where } from 'firebase/firestore';
import { auth, db, firebaseConfigOk } from './firebase';
import Login from './components/Login';
import PendingAccess from './components/PendingAccess';
import Stat from './components/Stat';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import HistoryModal from './components/HistoryModal';
import DriveSyncModal from './components/DriveSyncModal';
import OsPrintModal from './components/OsPrintModal';
import WorkOrderExecutionModal from './components/WorkOrderExecutionModal';
import CalendarView from './pages/CalendarView';
import ReportView from './pages/ReportView';
import UsersView from './pages/UsersView';
import ClientesPage from './pages/ClientesPage';
import VeiculosPage from './pages/VeiculosPage';
import EquipamentosPage from './pages/EquipamentosPage';
import { DRIVE_SYNC_KEY, SETTINGS_KEY, SUPERVISOR_EDITABLE_FIELDS, TECHNICIAN_EDITABLE_FIELDS, emptyForm } from './constants/taskConfig';
import { cleanForFirestore, csvCell, deadlineInfo, formatDate, mergeAllowedFields, parseDeadline, uid } from './utils/taskUtils';
import { firebaseErrorMessage } from './utils/firebaseError';

export default function App(){
  const [session,setSession]=useState(null); const [authLoading,setAuthLoading]=useState(true);
  const [userProfile,setUserProfile]=useState(null); const [profileLoading,setProfileLoading]=useState(true);
  const [tasks,setTasks]=useState([]); const [dataLoading,setDataLoading]=useState(true); const [form,setForm]=useState(emptyForm); const [editingId,setEditingId]=useState(null);
  const [modalOpen,setModalOpen]=useState(false); const [historyTask,setHistoryTask]=useState(null); const [query,setQuery]=useState('');
  const [statusFilter,setStatusFilter]=useState('Todas'); const [priorityFilter,setPriorityFilter]=useState('Todas');
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7)); const [view,setView]=useState('lista'); const [toast,setToast]=useState('');
  const [report,setReport]=useState({start:'',end:'',company:'Todas',status:'Todas',priority:'Todas'});
  const [syncOpen,setSyncOpen]=useState(false);
  const [printTask,setPrintTask]=useState(null);
  const [executionTask,setExecutionTask]=useState(null);
  const [syncing,setSyncing]=useState(false);
  const [driveConfig,setDriveConfig]=useState(()=>{try{return JSON.parse(localStorage.getItem(DRIVE_SYNC_KEY))||{webAppUrl:'',autoSync:true}}catch{return{webAppUrl:'',autoSync:true}}});

  useEffect(()=>{
    if(!firebaseConfigOk || !auth){setAuthLoading(false);return;}
    return onAuthStateChanged(auth,user=>{setSession(user);setAuthLoading(false)});
  },[]);

  useEffect(()=>{
    let cancelled=false;
    async function loadProfile(){
      if(!session){setUserProfile(null);setProfileLoading(false);return;}
      setProfileLoading(true);
      try{
        const ref=doc(db,'usuarios',session.uid);
        const snap=await getDoc(ref);
        if(cancelled)return;
        if(snap.exists()){
          const profile={id:snap.id,...snap.data()};
          setUserProfile(profile);
          await setDoc(ref,{lastLogin:new Date().toISOString()},{merge:true});
        }
        else{
          const pending={
            nome:session.displayName||session.email?.split('@')[0]||'Usuário',
            email:session.email||'',
            perfil:'tecnico',
            status:'pendente',
            empresa:'Avistar',
            createdAt:new Date().toISOString(),
            lastLogin:new Date().toISOString()
          };
          await setDoc(ref,pending);
          if(!cancelled)setUserProfile({id:session.uid,...pending});
        }
      }catch(err){console.error('Erro ao carregar perfil:',err);if(!cancelled)setToast(firebaseErrorMessage(err,'carregar o perfil'));}
      finally{if(!cancelled)setProfileLoading(false);}
    }
    loadProfile();
    return()=>{cancelled=true};
  },[session]);

  useEffect(()=>{
    if(!session||userProfile?.status!=='ativo'){
      setTasks([]);setDataLoading(false);return;
    }
    setDataLoading(true);

    // Administrador e Supervisor podem consultar a coleção inteira.
    if(userProfile?.perfil!=='tecnico'){
      const unsub=onSnapshot(collection(db,'demandas'),snap=>{
        setTasks(snap.docs.map(d=>({id:d.id,...d.data()})));
        setDataLoading(false);
      },err=>{
        console.error('Erro ao carregar demandas:',err);
        setToast('Falha ao carregar dados do Firebase.');
        setDataLoading(false);
      });
      return unsub;
    }

    // Técnico só consulta demandas atribuídas a ele. Isso é necessário porque
    // as regras do Firestore não permitem que o técnico leia demandas de terceiros.
    let byUid=[]; let byEmail=[];
    const merge=()=>{
      const map=new Map();
      [...byUid,...byEmail].forEach(item=>map.set(item.id,item));
      setTasks([...map.values()]);
      setDataLoading(false);
    };
    const normalizeTask=(d)=>({
      id:d.id,
      title:'', company:'', category:'Outro', responsible:'', priority:'Baixa',
      status:'Aberta', dueDate:'', dueTime:'', description:'', history:[],
      ...d.data()
    });
    const qUid=firestoreQuery(collection(db,'demandas'),where('technicianUid','==',session.uid));
    const onError=err=>{
      console.error('Erro ao carregar demandas do técnico:',err);
      setToast(firebaseErrorMessage(err,'carregar as demandas do técnico'));
      setDataLoading(false);
    };
    const unsubUid=onSnapshot(qUid,snap=>{byUid=snap.docs.map(normalizeTask);merge();},onError);
    let unsubEmail=()=>{};
    if(session.email){
      const qEmail=firestoreQuery(collection(db,'demandas'),where('installerEmail','==',session.email));
      unsubEmail=onSnapshot(qEmail,snap=>{byEmail=snap.docs.map(normalizeTask);merge();},onError);
    }
    return()=>{unsubUid();unsubEmail();};
  },[session,userProfile?.status,userProfile?.perfil]);
  useEffect(()=>{if(!session)return; let notified = {}; try { notified = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { notified = {}; } const check=()=>{const now=new Date();tasks.forEach(task=>{if(task.status==='Concluída')return;const deadline=parseDeadline(task);if(!deadline)return;const diff=deadline-now,key=`${task.id}-${task.dueDate}-${task.dueTime}`,should=diff<=0||(diff>0&&diff<=3600000);if(should&&!notified[key]){const text=diff<=0?`Prazo vencido: ${task.title}`:`Vence em menos de 1 hora: ${task.title}`;if('Notification'in window&&Notification.permission==='granted')new Notification('Agenda Avistar',{body:text});setToast(text);notified[key]=true;localStorage.setItem(SETTINGS_KEY,JSON.stringify(notified));}})};check();const i=setInterval(check,60000);return()=>clearInterval(i)},[tasks,session]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t)},[toast]);
  const isAdmin=userProfile?.perfil==='admin';
  const isSupervisor=userProfile?.perfil==='supervisor';
  const isTechnician=userProfile?.perfil==='tecnico';

  // O perfil Técnico usa uma área operacional reduzida: somente suas O.S. ativas
  // e o calendário. Se uma rota administrativa estiver selecionada, volta para Demandas.
  useEffect(()=>{
    if(!isTechnician)return;
    if(!['lista','calendario'].includes(view))setView('lista');
    if(statusFilter==='Concluída')setStatusFilter('Todas');
  },[isTechnician,view,statusFilter]);

  const canEdit=isAdmin||isSupervisor;
  const canDelete=isAdmin;

  const visibleTasks=useMemo(()=>{
    if(!session)return [];
    if(isTechnician){
      const finalStatuses=new Set(['concluída','concluida','cancelada','encerrada','finalizada','faturada']);
      return tasks.filter(task=>{
        const assigned=task.technicianUid===session.uid || task.installerEmail===session.email;
        const status=String(task.status||'Aberta').trim().toLowerCase();
        return assigned && !finalStatuses.has(status);
      });
    }
    return tasks;
  },[tasks,isTechnician,session]);

  const stats=useMemo(()=>{
    const active=visibleTasks.filter(t=>t.status!=='Concluída');
    return{
      open:active.length,
      late:active.filter(t=>deadlineInfo(t).kind==='late').length,
      today:active.filter(t=>deadlineInfo(t).kind==='today').length,
      high:active.filter(t=>t.priority==='Alta').length,
      done:visibleTasks.length-active.length
    };
  },[visibleTasks]);

  const filtered=useMemo(()=>visibleTasks
    .filter(t=>`${t.title} ${t.company} ${t.description} ${t.responsible} ${t.vehiclePlate||''} ${t.trackerId||''} ${t.phoneNumber||''} ${t.installer||''} ${t.platform||''}`.toLowerCase().includes(query.toLowerCase()))
    .filter(t=>statusFilter==='Todas'||t.status===statusFilter)
    .filter(t=>priorityFilter==='Todas'||t.priority===priorityFilter)
    .sort((a,b)=>{
      if(a.status==='Concluída'&&b.status!=='Concluída')return 1;
      if(b.status==='Concluída'&&a.status!=='Concluída')return-1;
      return(parseDeadline(a)?.getTime()||Infinity)-(parseDeadline(b)?.getTime()||Infinity);
    }),
  [visibleTasks,query,statusFilter,priorityFilter]);

  const monthTasks=useMemo(()=>visibleTasks.filter(t=>t.dueDate?.startsWith(month)),[visibleTasks,month]);
  const companies=useMemo(()=>['Todas',...Array.from(new Set(visibleTasks.map(t=>t.company).filter(Boolean))).sort()],[visibleTasks]);
  const reportTasks=useMemo(()=>visibleTasks
    .filter(t=>
      (!report.start||t.dueDate>=report.start)&&
      (!report.end||t.dueDate<=report.end)&&
      (report.company==='Todas'||t.company===report.company)&&
      (report.status==='Todas'||t.status===report.status)&&
      (report.priority==='Todas'||t.priority===report.priority)
    )
    .sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')),
  [visibleTasks,report]);

  const reportStats=useMemo(()=>({
    total:reportTasks.length,
    open:reportTasks.filter(t=>t.status!=='Concluída').length,
    late:reportTasks.filter(t=>deadlineInfo(t).kind==='late').length,
    done:reportTasks.filter(t=>t.status==='Concluída').length
  }),[reportTasks]);

if(!firebaseConfigOk)return <div className="login-page"><div className="login-card"><div className="login-brand"><div className="brand-mark">A</div><div><strong>Agenda Avistar</strong><span>CONFIGURAÇÃO FIREBASE</span></div></div><div className="login-copy"><h1>Configuração do Firebase não encontrada</h1><p>Copie o arquivo <strong>.env</strong> da versão que já funciona no Firebase para a raiz desta sprint e reinicie o Vite.</p></div><div className="sync-help"><strong>Arquivo necessário</strong><span>.env</span><small>Ele deve conter VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_MESSAGING_SENDER_ID e VITE_FIREBASE_APP_ID.</small></div></div></div>;
  if(authLoading||profileLoading)return <div className="app-loading">Carregando...</div>;
  if(!session)return <Login/>;
  if(userProfile?.status!=='ativo')return <PendingAccess profile={userProfile} onLogout={()=>signOut(auth)}/>;
  async function logout(){await signOut(auth)}
  function openNew(){setForm({...emptyForm,dueDate:new Date().toISOString().slice(0,10),serviceDate:new Date().toISOString().slice(0,10)});setEditingId(null);setModalOpen(true)}
  function openEdit(task){setForm({...task});setEditingId(task.id);setModalOpen(true)}
  async function sendToDrive(payload){
    if(!driveConfig.webAppUrl) throw new Error('Configure a URL do Google Apps Script.');
    await fetch(driveConfig.webAppUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  }
  async function syncOne(task,action='upsert'){
    try{await sendToDrive({action,task,source:'Agenda Avistar',sentAt:new Date().toISOString()});setToast('Demanda enviada para a planilha do Drive.')}catch(err){setToast(err.message||'Falha ao sincronizar com o Drive.')}
  }
  async function syncAll(){
    if(!driveConfig.webAppUrl){setSyncOpen(true);setToast('Configure a integração com o Drive.');return;}
    setSyncing(true);
    try{await sendToDrive({action:'syncAll',tasks,source:'Agenda Avistar',sentAt:new Date().toISOString()});setToast(`${tasks.length} demanda(s) enviada(s) para o Drive.`)}catch(err){setToast(err.message||'Falha ao sincronizar com o Drive.')}finally{setSyncing(false)}
  }
  function saveDriveConfig(config){localStorage.setItem(DRIVE_SYNC_KEY,JSON.stringify(config));setDriveConfig(config);setSyncOpen(false);setToast('Configuração do Drive salva.');}
  function createOsNumber(){const d=new Date();const y=d.getFullYear();const pad=n=>String(n).padStart(2,'0');return `OS-${y}-${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;}
  async function submit(e){
    e.preventDefault();
    if(!String(form.title||'').trim()){
      setToast('Informe o título da demanda.');
      return;
    }

    if(!session?.uid){
      setToast('Sua sessão não está válida. Saia e entre novamente.');
      return;
    }

    const now=new Date().toISOString();
    const currentTask=editingId ? tasks.find(t=>t.id===editingId) : null;
    let saved;

    if(editingId){
      if(!currentTask){
        setToast('A demanda não foi encontrada. Atualize a página e tente novamente.');
        return;
      }

      let permittedData;
      if(isAdmin){
        permittedData={...currentTask,...form};
      }else if(isSupervisor){
        permittedData=mergeAllowedFields(currentTask,form,SUPERVISOR_EDITABLE_FIELDS);
      }else if(isTechnician){
        permittedData=mergeAllowedFields(currentTask,form,TECHNICIAN_EDITABLE_FIELDS);
      }else{
        setToast('Seu perfil não possui permissão para editar demandas.');
        return;
      }

      saved={
        ...permittedData,
        id:editingId,
        locked:currentTask.locked!==false,
        updatedAt:now,
        updatedBy:session.email||session.uid,
        ownerUid:currentTask.ownerUid||session.uid,
        history:[...(currentTask.history||[]),{date:now,text:'Demanda atualizada',user:session.email||session.uid}]
      };
    }else{
      if(!(isAdmin||isSupervisor)){
        setToast('Seu perfil não possui permissão para criar demandas.');
        return;
      }
      saved={
        ...form,
        osNumber:form.osNumber||createOsNumber(),
        id:uid(),
        locked:true,
        createdAt:now,
        updatedAt:now,
        createdBy:session.email||session.uid,
        updatedBy:session.email||session.uid,
        ownerUid:session.uid,
        history:[{date:now,text:'Demanda criada e bloqueada',user:session.email||session.uid}]
      };
    }

    const safeSaved=cleanForFirestore(saved);

    try{
      await setDoc(doc(db,'demandas',safeSaved.id),safeSaved);
      if(driveConfig.autoSync&&driveConfig.webAppUrl) void syncOne(safeSaved);
      setModalOpen(false);
      setEditingId(null);
      setForm({...emptyForm});
      setToast('Demanda salva com sucesso no Firebase.');
    }catch(err){
      setToast(firebaseErrorMessage(err,'salvar'));
    }
  }
  async function saveExecution(task,patch,historyText){
    const now=new Date().toISOString();
    const payload=cleanForFirestore({
      ...patch,
      updatedAt:now,
      updatedBy:session.email||session.uid,
      history:[...(task.history||[]),{date:now,text:historyText,user:session.email||session.uid}]
    });
    try{
      await setDoc(doc(db,'demandas',task.id),payload,{merge:true});
      setToast(historyText);
    }catch(err){
      setToast(firebaseErrorMessage(err,'atualizar a execução da O.S.'));
      throw err;
    }
  }

  async function toggleDone(task){
    const status=task.status==='Concluída'?'Aberta':'Concluída';
    const now=new Date().toISOString();
    const updated=cleanForFirestore({
      ...task,
      status,
      ownerUid:task.ownerUid||session.uid,
      updatedAt:now,
      updatedBy:session.email||session.uid,
      history:[...(task.history||[]),{date:now,text:status==='Concluída'?'Demanda concluída':'Demanda reaberta',user:session.email||session.uid}]
    });

    try{
      await setDoc(doc(db,'demandas',task.id),updated);
      if(driveConfig.autoSync&&driveConfig.webAppUrl) void syncOne(updated);
      setToast(status==='Concluída'?'Demanda concluída.':'Demanda reaberta.');
    }catch(err){
      setToast(firebaseErrorMessage(err,'atualizar'));
    }
  }
  async function removeTask(id){
    if(!confirm('Deseja excluir esta demanda?')) return;
    try{
      await deleteDoc(doc(db,'demandas',id));
      if(driveConfig.autoSync&&driveConfig.webAppUrl) void syncOne({id},'delete');
      setToast('Demanda excluída.');
    }catch(err){
      setToast(firebaseErrorMessage(err,'excluir'));
    }
  }
  async function enableNotifications(){if(!('Notification'in window))return setToast('Este navegador não suporta notificações.');const result=await Notification.requestPermission();setToast(result==='granted'?'Notificações ativadas.':'Permissão de notificação não concedida.')}
  function exportData(){const blob=new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'});downloadBlob(blob,`agenda-avistar-${new Date().toISOString().slice(0,10)}.json`)}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
  function exportReportCSV(){const headers=['Número O.S.','Prazo','Hora','Cliente','Demanda','Categoria','Responsável','Prioridade','Status','Situação','Placa','Marca do veículo','Modelo do veículo','ID do equipamento','Marca do rastreador','Modelo do rastreador','SimCard','Número da linha','Instalador','Data do serviço','Tipo O.S.','Valor do serviço','Plataforma','Descrição'];const rows=reportTasks.map(t=>[t.osNumber||'',formatDate(t.dueDate),t.dueTime,t.company,t.title,t.category,t.responsible,t.priority,t.status,deadlineInfo(t).label,t.vehiclePlate,t.vehicleBrand,t.vehicleModel,t.trackerId,t.trackerBrand,t.trackerModel,t.simCard,t.phoneNumber,t.installer,formatDate(t.serviceDate),t.osType,t.serviceValue,t.platform,t.description]);const csv='\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(';')).join('\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),`relatorio-demandas-${new Date().toISOString().slice(0,10)}.csv`)}

  return <div className="app-shell"><aside className="sidebar">
    <div className="brand"><div className="brand-mark">A</div><div><strong>Agenda</strong><span>AVISTAR</span></div></div>
    <nav>
      <button className={view==='lista'?'active':''} onClick={()=>setView('lista')}><LayoutDashboard size={19}/> {isTechnician?'Minhas O.S.':'Demandas'}</button>
      {!isTechnician&&<button className={view==='clientes'?'active':''} onClick={()=>setView('clientes')}><Building2 size={19}/> Clientes</button>}
      {!isTechnician&&<button className={view==='veiculos'?'active':''} onClick={()=>setView('veiculos')}><Car size={19}/> Veículos</button>}
      {!isTechnician&&<button className={view==='equipamentos'?'active':''} onClick={()=>setView('equipamentos')}><Radio size={19}/> Equipamentos</button>}
      <button className={view==='calendario'?'active':''} onClick={()=>setView('calendario')}><CalendarDays size={19}/> Calendário</button>
      {!isTechnician&&<button className={view==='relatorios'?'active':''} onClick={()=>setView('relatorios')}><FileText size={19}/> Relatórios</button>}
      {isAdmin&&<button className={view==='usuarios'?'active':''} onClick={()=>setView('usuarios')}><Users size={19}/> Usuários</button>}
    </nav>
    <div className="sidebar-footer">
      {!isTechnician&&<button onClick={syncAll}><CloudUpload size={18}/> {syncing?'Sincronizando...':'Sincronizar Drive'}</button>}
      {isAdmin&&<button onClick={()=>setSyncOpen(true)}><Settings size={18}/> Configurar Drive</button>}
      <button onClick={enableNotifications}><Bell size={18}/> Ativar notificações</button>
      {!isTechnician&&<button onClick={exportData}><Download size={18}/> Fazer backup</button>}
      <button onClick={logout}><LogOut size={18}/> Sair</button>
    </div>
  </aside><main>
    <header className="topbar"><div><h1>{view==='usuarios'?'Administração de Usuários':view==='relatorios'?'Relatórios de Demandas':view==='calendario'?'Calendário de Demandas':view==='clientes'?'Clientes':view==='veiculos'?'Veículos':view==='equipamentos'?'Equipamentos':isTechnician?'Minhas O.S. abertas':'Agenda de Demandas'}</h1><p>Olá, {session.email}. Dados sincronizados online pelo Firebase.</p></div>{view==='lista'&&canEdit&&<button className="primary" onClick={openNew}><Plus size={19}/> Nova demanda</button>}</header>
    {(view==='lista'||view==='calendario')&&<section className="stats-grid"><Stat label="Em aberto" value={stats.open} icon={<Clock3/>}/><Stat label="Vencidas" value={stats.late} icon={<AlertTriangle/>} danger/><Stat label="Para hoje" value={stats.today} icon={<CalendarDays/>}/><Stat label="Alta prioridade" value={stats.high} icon={<Bell/>}/>{!isTechnician&&<Stat label="Concluídas" value={stats.done} icon={<CheckCircle2/>}/>}</section>}

    {view==='lista'&&<><section className="toolbar"><div className="search"><Search size={18}/><input placeholder="Buscar empresa, assunto, responsável..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filters"><Filter size={17}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todas</option><option>Aberta</option><option>Em andamento</option>{!isTechnician&&<option>Concluída</option>}</select><select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option>Todas</option><option>Alta</option><option>Média</option><option>Baixa</option></select></div></section><TaskList tasks={filtered} onToggle={toggleDone} onEdit={openEdit} onHistory={setHistoryTask} onRemove={removeTask} onPrint={setPrintTask} onExecute={isTechnician?setExecutionTask:null} canEdit={canEdit} canDelete={canDelete} canToggle={!isTechnician}/></>}
    {view==='clientes'&&<ClientesPage canEdit={canEdit} canDelete={canDelete} userEmail={session.email||session.uid}/>}
    {view==='veiculos'&&<VeiculosPage canEdit={canEdit} canDelete={canDelete} userEmail={session.email||session.uid}/>}
    {view==='equipamentos'&&<EquipamentosPage canEdit={canEdit} canDelete={canDelete} userEmail={session.email||session.uid}/>}
    {view==='calendario'&&<CalendarView month={month} setMonth={setMonth} tasks={monthTasks} onEdit={isTechnician?setExecutionTask:openEdit}/>} 
    {view==='relatorios'&&<ReportView report={report} setReport={setReport} companies={companies} tasks={reportTasks} stats={reportStats} onCSV={exportReportCSV}/>} {view==='usuarios'&&isAdmin&&<UsersView currentUid={session.uid}/>} 
  </main>
  {modalOpen&&<TaskModal form={form} setForm={setForm} editing={!!editingId} isAdmin={isAdmin} isSupervisor={isSupervisor} isTechnician={isTechnician} onClose={()=>setModalOpen(false)} onSubmit={submit}/>} 
  {printTask&&<OsPrintModal task={printTask} onClose={()=>setPrintTask(null)}/>} 
  {executionTask&&<WorkOrderExecutionModal task={executionTask} onClose={()=>setExecutionTask(null)} onSave={saveExecution}/>} 
  {historyTask&&<HistoryModal task={historyTask} onClose={()=>setHistoryTask(null)}/>} {syncOpen&&isAdmin&&<DriveSyncModal config={driveConfig} onClose={()=>setSyncOpen(false)} onSave={saveDriveConfig}/>} {toast&&<div className="toast"><Bell size={18}/>{toast}</div>}
  </div>
}
