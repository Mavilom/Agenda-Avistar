export const DRIVE_SYNC_KEY = 'agenda_avistar_drive_sync_v1';
export const SETTINGS_KEY = 'agenda_avistar_settings_v1';

export const categories = ['Atualizar planilha','Agendamento','Cobrança','Instalação','Manutenção','Troca de equipamento','Pendência do cliente','Financeiro','Relatório','Outro'];

export const SUPERVISOR_EDITABLE_FIELDS = new Set([
  'title','description','category','responsible','dueDate','dueTime',
  'priority','status','installer','technicianUid','installerEmail','serviceDate'
]);

export const TECHNICIAN_EDITABLE_FIELDS = new Set(['status','description','technicianNotes','executionChecklist','beforePhotos','afterPhotos','technicianSignature','clientSignature','startedAt','completedAt']);

export const emptyForm = { title:'', osNumber:'', clienteId:'', company:'', description:'', category:'Atualizar planilha', responsible:'', dueDate:'', dueTime:'09:00', priority:'Média', status:'Aberta', veiculoId:'', vehiclePlate:'', vehicleBrand:'', vehicleModel:'', equipamentoId:'', trackerId:'', trackerBrand:'', trackerModel:'', simCard:'', phoneNumber:'', installer:'', technicianUid:'', installerEmail:'', serviceDate:'', osType:'', serviceValue:'', platform:'' };
