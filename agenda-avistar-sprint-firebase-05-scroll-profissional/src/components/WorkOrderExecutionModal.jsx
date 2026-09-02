import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, Clock3, Eraser, Save, Signature, Upload, X } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../firebase';

const checklistItems = [
  ['gps','GPS / posicionamento'],['alimentacao','Alimentação'],['ignicao','Ignição'],['comunicacao','Comunicação'],['bloqueio','Bloqueio / saída']
];

export default function WorkOrderExecutionModal({task,onClose,onSave}){
  const [notes,setNotes]=useState(task.technicianNotes||'');
  const [checklist,setChecklist]=useState(task.executionChecklist||{});
  const [beforeFiles,setBeforeFiles]=useState([]);
  const [afterFiles,setAfterFiles]=useState([]);
  const [saving,setSaving]=useState(false);
  const techCanvas=useRef(null); const clientCanvas=useRef(null);
  const started=Boolean(task.startedAt);
  const canFinish=useMemo(()=>checklistItems.every(([k])=>checklist[k]===true),[checklist]);

  useEffect(()=>{[techCanvas.current,clientCanvas.current].forEach(c=>{if(c){const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#1f2937';ctx.lineWidth=2;ctx.lineCap='round';}})},[]);

  function clearCanvas(refObj){const c=refObj.current;if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)}
  function canvasHasInk(c){if(!c)return false;const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=0;i<data.length;i+=4){if(data[i]<245||data[i+1]<245||data[i+2]<245)return true}return false}
  async function uploadFile(file,kind){const uid=auth.currentUser?.uid;if(!uid)throw new Error('Sessão inválida.');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const storageRef=ref(storage,`ordens_servico/${task.id}/${uid}/${kind}/${Date.now()}-${safe}`);await uploadBytes(storageRef,file,{contentType:file.type});return {url:await getDownloadURL(storageRef),name:file.name,uploadedAt:new Date().toISOString(),uploadedBy:auth.currentUser?.email||uid};}
  async function uploadSignature(canvas,kind){if(!canvasHasInk(canvas))return null;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const file=new File([blob],`${kind}.png`,{type:'image/png'});return uploadFile(file,kind)}
  async function save(finalize=false){
    if(finalize&&!canFinish)return alert('Conclua todos os itens do checklist antes de finalizar a O.S.');
    if(finalize&&(!canvasHasInk(techCanvas.current)||!canvasHasInk(clientCanvas.current)))return alert('As assinaturas do técnico e do cliente são obrigatórias para concluir.');
    setSaving(true);
    try{
      const newBefore=await Promise.all(beforeFiles.map(f=>uploadFile(f,'antes')));
      const newAfter=await Promise.all(afterFiles.map(f=>uploadFile(f,'depois')));
      const techSig=await uploadSignature(techCanvas.current,'assinatura-tecnico');
      const clientSig=await uploadSignature(clientCanvas.current,'assinatura-cliente');
      const now=new Date().toISOString();
      const patch={technicianNotes:notes,executionChecklist:checklist,beforePhotos:[...(task.beforePhotos||[]),...newBefore],afterPhotos:[...(task.afterPhotos||[]),...newAfter]};
      if(techSig)patch.technicianSignature=techSig;
      if(clientSig)patch.clientSignature=clientSig;
      if(!task.startedAt)patch.startedAt=now;
      if(finalize){patch.status='Concluída';patch.completedAt=now;}
      else if(task.status==='Aberta')patch.status='Em andamento';
      await onSave(task,patch,finalize?'O.S. concluída pelo técnico':'Execução da O.S. atualizada');
      onClose();
    }finally{setSaving(false)}
  }

  return <div className="modal-backdrop"><div className="modal execution-modal"><div className="modal-title"><div><h2>Executar O.S. {task.osNumber||''}</h2><p>{task.company} · {task.vehiclePlate||'Sem placa'} · {task.installer||''}</p></div><button onClick={onClose}><X/></button></div>
    <div className="execution-status"><Clock3 size={18}/><div><strong>{started?'Atendimento iniciado':'Aguardando início'}</strong><span>{task.startedAt?new Date(task.startedAt).toLocaleString('pt-BR'):'O horário será registrado no primeiro salvamento.'}</span></div></div>
    <section className="execution-section"><h3><CheckCircle2 size={18}/> Checklist técnico</h3><div className="execution-checklist">{checklistItems.map(([k,label])=><label key={k}><input type="checkbox" checked={checklist[k]===true} onChange={e=>setChecklist({...checklist,[k]:e.target.checked})}/><span>{label}</span></label>)}</div></section>
    <section className="execution-section"><h3><Save size={18}/> Observações do atendimento</h3><textarea rows="5" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Descreva diagnóstico, procedimento realizado, testes e resultado final..."/></section>
    <section className="execution-section"><h3><Camera size={18}/> Fotos</h3><div className="photo-grid"><label className="upload-box"><Upload/><strong>Antes do serviço</strong><span>{beforeFiles.length} arquivo(s) selecionado(s)</span><input type="file" accept="image/*" multiple onChange={e=>setBeforeFiles([...e.target.files])}/></label><label className="upload-box"><Upload/><strong>Depois do serviço</strong><span>{afterFiles.length} arquivo(s) selecionado(s)</span><input type="file" accept="image/*" multiple onChange={e=>setAfterFiles([...e.target.files])}/></label></div>{((task.beforePhotos?.length||0)+(task.afterPhotos?.length||0))>0&&<small className="stored-media">Já existem {(task.beforePhotos?.length||0)+(task.afterPhotos?.length||0)} foto(s) salvas nesta O.S.</small>}</section>
    <section className="execution-section"><h3><Signature size={18}/> Assinaturas</h3><div className="signature-grid"><SignaturePad title="Técnico responsável" canvasRef={techCanvas} onClear={()=>clearCanvas(techCanvas)}/><SignaturePad title="Cliente / responsável" canvasRef={clientCanvas} onClear={()=>clearCanvas(clientCanvas)}/></div></section>
    <div className="modal-actions"><button className="secondary" onClick={onClose}>Cancelar</button><button className="secondary" disabled={saving} onClick={()=>save(false)}><Save size={17}/> Salvar andamento</button><button className="primary" disabled={saving} onClick={()=>save(true)}><CheckCircle2 size={17}/> {saving?'Salvando...':'Concluir O.S.'}</button></div>
  </div></div>
}

function SignaturePad({title,canvasRef,onClear}){
  const drawing=useRef(false);
  function point(e){const c=canvasRef.current;const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*(c.width/r.width),y:(e.clientY-r.top)*(c.height/r.height)}}
  function down(e){const c=canvasRef.current;if(!c)return;drawing.current=true;const p=point(e);const ctx=c.getContext('2d');ctx.beginPath();ctx.moveTo(p.x,p.y);c.setPointerCapture?.(e.pointerId)}
  function move(e){if(!drawing.current||!canvasRef.current)return;const p=point(e);const ctx=canvasRef.current.getContext('2d');ctx.lineTo(p.x,p.y);ctx.stroke()}
  function up(){drawing.current=false}
  return <div className="signature-pad"><div className="signature-head"><strong>{title}</strong><button type="button" onClick={onClear}><Eraser size={15}/> Limpar</button></div><canvas ref={canvasRef} width="540" height="150" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}/><small>Assine com o mouse, caneta ou toque.</small></div>
}
