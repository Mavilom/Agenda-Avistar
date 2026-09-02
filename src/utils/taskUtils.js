export function parseDeadline(task){ return task.dueDate?new Date(`${task.dueDate}T${task.dueTime||'23:59'}:00`):null; }
export function deadlineInfo(task){
  if(task.status==='Concluída') return {label:'Concluída',kind:'done'};
  const deadline=parseDeadline(task); if(!deadline) return {label:'Sem prazo',kind:'neutral'};
  const now=new Date(), diff=deadline-now, today=now.toISOString().slice(0,10);
  if(diff<0) return {label:'Prazo vencido',kind:'late'};
  if(task.dueDate===today) return {label:'Vence hoje',kind:'today'};
  const days=Math.ceil(diff/86400000); return {label:days===1?'Vence amanhã':`Vence em ${days} dias`,kind:'ok'};
}
export function formatDate(date){ return date?new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`)):'Sem prazo'; }
export function uid(){ return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function csvCell(v){ return `"${String(v??'').replaceAll('"','""')}"`; }

export function cleanForFirestore(value){
  if(Array.isArray(value)) return value.map(cleanForFirestore);
  if(value && typeof value === 'object'){
    return Object.fromEntries(
      Object.entries(value)
        .filter(([,item])=>item !== undefined)
        .map(([key,item])=>[key,cleanForFirestore(item)])
    );
  }
  return value;
}

export function mergeAllowedFields(original, edited, allowedFields){
  const result={...original};
  allowedFields.forEach(field=>{
    if(Object.prototype.hasOwnProperty.call(edited,field)) result[field]=edited[field];
  });
  return result;
}

