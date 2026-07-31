import UserMenu from '../components/UserMenu';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Settings, ChevronLeft, ChevronRight, RefreshCw, X, LogOut, Home } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Carte résident draggable
function ResidentCard({ resident, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: resident.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0 : 1 } : {};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded" style={{ background: '#4A2C2A' }}>{resident.chambre}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{resident.nom} {resident.prenom}</p>
          {resident.toilette && <p className="text-xs text-gray-400 truncate">{resident.toilette}</p>}
        </div>
      </div>
    </div>
  );
}

// Colonne soignant droppable
function SoignantColonne({ soignant, residents, onRemove, isManager }) {
  const { setNodeRef, isOver } = useDroppable({ id: soignant.id });

  return (
    <div className="flex flex-col min-w-48 w-48 shrink-0">
      <div className="rounded-t-xl p-2 text-center text-white text-xs font-bold" style={{ background: '#4A2C2A' }}>
        {soignant.label}
        <span className="ml-1 opacity-60">({residents.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-48 rounded-b-xl p-2 space-y-1.5 border-2 transition-colors ${isOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
      >
        {residents.map(r => (
          <div key={r.id} className="relative group">
            <ResidentCard resident={r} />
            {isManager && (
              <button onClick={() => onRemove(r.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center">
                ×
              </button>
            )}
          </div>
        ))}
        {residents.length === 0 && (
          <div className="h-16 flex items-center justify-center text-xs text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
            Déposer ici
          </div>
        )}
      </div>
    </div>
  );
}

// Zone non affectés droppable
function NonAffectesZone({ residents }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'non-affectes' });
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
        Non affectés ({residents.length})
      </p>
      <div ref={setNodeRef}
        className={`min-h-16 rounded-xl p-2 space-y-1.5 border-2 transition-colors ${isOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
        {residents.map(r => <ResidentCard key={r.id} resident={r} />)}
        {residents.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-4">Tous les résidents sont affectés</p>
        )}
      </div>
    </div>
  );
}

export default function RepartitionPage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [configId, setConfigId] = useState('');
  const [config, setConfig] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [affectations, setAffectations] = useState([]);
  const [nonAffectes, setNonAffectes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeResident, setActiveResident] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  useEffect(() => {
    api.get('/repartition/configs').then(({ data }) => {
      setConfigs(data);
      if (data.length > 0) setConfigId(data[0].id);
    }).catch(() => toast.error('Erreur chargement configs'));
  }, []);

  useEffect(() => {
    if (!configId) return;
    api.get(`/repartition/configs/${configId}`).then(({ data }) => setConfig(data));
  }, [configId]);

  useEffect(() => {
    if (!configId || !date) return;
    load();
  }, [configId, date]);

  const load = async () => {
    setLoading(true);
    try {
      const [aff, nonAff] = await Promise.all([
        api.get(`/repartition/affectations?config_id=${configId}&date=${date}`),
        api.get(`/repartition/non-affectes?config_id=${configId}&date=${date}`)
      ]);
      setAffectations(aff.data);
      setNonAffectes(nonAff.data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const initAffectations = async () => {
    try {
      await api.post('/repartition/affectations/init', { config_id: configId, date });
      await load();
      toast.success('Répartition initialisée depuis les défauts');
    } catch { toast.error('Erreur'); }
  };

  const affecter = async (residentId, soignantId) => {
    try {
      await api.patch(`/repartition/affectations/${residentId}`, { config_id: configId, date, soignant_id: soignantId });
      await load();
    } catch { toast.error('Erreur affectation'); }
  };

  const desaffecter = async (residentId) => {
    try {
      await api.patch(`/repartition/affectations/${residentId}`, { config_id: configId, date, soignant_id: null });
      await load();
    } catch { toast.error('Erreur'); }
  };

  const handleDragStart = ({ active }) => {
    const inAff = affectations.find(a => a.resident_id === active.id);
    const inNon = nonAffectes.find(r => r.id === active.id);
    setActiveResident(inAff ? { id: inAff.resident_id, chambre: inAff.chambre, nom: inAff.nom, prenom: inAff.prenom, toilette: inAff.toilette } : inNon);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveResident(null);
    if (!over) return;
    const residentId = active.id;
    const targetId = over.id;
    if (targetId === 'non-affectes') {
      await desaffecter(residentId);
    } else {
      await affecter(residentId, targetId);
    }
  };

  // Grouper les affectations par soignant
  const affParSoignant = (config?.soignants || []).reduce((acc, s) => {
    acc[s.id] = affectations.filter(a => a.soignant_id === s.id).map(a => ({
      id: a.resident_id, chambre: a.chambre, nom: a.nom, prenom: a.prenom, toilette: a.toilette
    }));
    return acc;
  }, {});

  const changeDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-20 shadow-md" style={{ background: 'linear-gradient(135deg, #3A2020, #4A2C2A)' }}>
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/residents')} className="text-white p-2 hover:bg-white/10 rounded-lg shrink-0">
              <ArrowLeft size={18} />
            </button>
            <span className="text-white font-bold text-sm">Répartition</span>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs px-2 py-1.5 rounded-lg bg-white/10 text-white border border-white/20"
              value={configId} onChange={e => setConfigId(e.target.value)}>
              {configs.map(c => <option key={c.id} value={c.id} style={{ color: '#333' }}>{c.nom}</option>)}
            </select>
            {isManager() && (
              <button onClick={() => setShowConfigModal(true)} className="p-2 rounded-lg text-white hover:bg-white/10">
                <Settings size={17} />
              </button>
            )}
            <a href="/" className="p-2 rounded-lg text-white hover:bg-white/10 inline-flex" title="Retour portail" className="p-2 rounded-lg text-white hover:bg-white/10 inline-flex items-center gap-1 text-xs font-medium">
              <Home size={15} /> Portail
            </a>
            <button onClick={() => { localStorage.removeItem('sso_token'); localStorage.removeItem('sso_user'); localStorage.removeItem('sso_apps'); window.location.href = '/'; }} className="p-2 rounded-lg text-white hover:bg-white/10" title="Déconnexion" className="p-2 rounded-lg text-white hover:bg-white/10 flex items-center gap-1 text-xs font-medium">
              <LogOut size={15} /> Se déconnecter
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          <button onClick={() => changeDate(-1)} className="text-white p-1 hover:bg-white/10 rounded"><ChevronLeft size={18} /></button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 flex-1 max-w-xs" />
          <button onClick={() => changeDate(1)} className="text-white p-1 hover:bg-white/10 rounded"><ChevronRight size={18} /></button>
          {isManager() && (
            <button onClick={initAffectations} className="text-white p-2 hover:bg-white/10 rounded-lg ml-auto" title="Initialiser depuis les défauts">
              <RefreshCw size={17} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : !config ? (
          <div className="text-center py-16 text-gray-400">
            <p>Aucune configuration.</p>
            {isManager() && <button onClick={() => setShowConfigModal(true)} className="mt-3 px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#4A2C2A' }}>Créer une configuration</button>}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="mb-4">
              <NonAffectesZone residents={nonAffectes} />
            </div>
            <div className="flex gap-3 pb-4 min-w-max">
              {config.soignants.map(s => (
                <SoignantColonne
                  key={s.id}
                  soignant={s}
                  residents={affParSoignant[s.id] || []}
                  onRemove={desaffecter}
                  isManager={isManager()}
                />
              ))}
            </div>
            <DragOverlay>
              {activeResident && (
                <div className="bg-white rounded-lg p-2 shadow-lg border border-amber-300 opacity-90 w-48">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded" style={{ background: '#4A2C2A' }}>{activeResident.chambre}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{activeResident.nom} {activeResident.prenom}</p>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {showConfigModal && (
        <ConfigModal
          configs={configs}
          onClose={() => setShowConfigModal(false)}
          onSaved={() => {
            api.get('/repartition/configs').then(({ data }) => { setConfigs(data); if (data.length > 0 && !configId) setConfigId(data[0].id); });
            setShowConfigModal(false);
          }}
        />
      )}
    </div>
  );
}

// Modal de gestion des configurations
function ConfigModal({ configs, onClose, onSaved }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nom: '', soignants: [] });
  const [loading, setLoading] = useState(false);

  const newConfig = () => {
    setSelected(null);
    setForm({ nom: '', soignants: [] });
  };

  const loadConfig = async (id) => {
    const { data } = await api.get(`/repartition/configs/${id}`);
    setSelected(data);
    setForm({ nom: data.nom, soignants: data.soignants.map(s => ({ ...s, chambres_default: s.chambres_default || [] })) });
  };

  const addSoignant = () => {
    const next = (form.soignants.length > 0 ? Math.max(...form.soignants.map(s => s.numero)) + 1 : 1);
    setForm(p => ({ ...p, soignants: [...p.soignants, { numero: next, label: `Soignant ${next}`, etage: '', chambres_default: [] }] }));
  };

  const updateSoignant = (idx, field, value) => {
    setForm(p => ({ ...p, soignants: p.soignants.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  };

  const removeSoignant = (idx) => setForm(p => ({ ...p, soignants: p.soignants.filter((_, i) => i !== idx) }));

  const updateChambres = (idx, value) => {
    const chambres = value.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c));
    updateSoignant(idx, 'chambres_default', chambres);
  };

  const save = async () => {
    if (!form.nom) { toast.error('Nom requis'); return; }
    setLoading(true);
    try {
      if (selected) {
        await api.patch(`/repartition/configs/${selected.id}`, form);
      } else {
        await api.post('/repartition/configs', form);
      }
      toast.success(selected ? 'Configuration modifiée' : 'Configuration créée');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setLoading(false); }
  };

  const deleteConfig = async () => {
    if (!window.confirm('Supprimer cette configuration ?')) return;
    try {
      await api.delete(`/repartition/configs/${selected.id}`);
      toast.success('Configuration supprimée');
      onSaved();
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Configurations de répartition</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="w-48 border-r border-gray-100 p-3 space-y-1 overflow-y-auto">
            {configs.map(c => (
              <button key={c.id} onClick={() => loadConfig(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selected?.id === c.id ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                style={selected?.id === c.id ? { background: '#4A2C2A' } : {}}>
                {c.nom}
              </button>
            ))}
            <button onClick={newConfig} className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-1">
              <Plus size={14} /> Nouvelle
            </button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div>
              <label className="lbl">Nom de la configuration</label>
              <input className="inp" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Ex: 8 soignants" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="lbl mb-0">Soignants</label>
                <button onClick={addSoignant} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{ background: '#4A2C2A' }}>
                  <Plus size={12} /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {form.soignants.map((s, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="lbl">N°</label>
                        <input className="inp" type="number" value={s.numero} onChange={e => updateSoignant(idx, 'numero', parseInt(e.target.value))} />
                      </div>
                      <div className="col-span-2">
                        <label className="lbl">Label</label>
                        <input className="inp" value={s.label} onChange={e => updateSoignant(idx, 'label', e.target.value)} placeholder="Ex: AS 4 – Volante" />
                      </div>
                    </div>
                    <div>
                      <label className="lbl">Étage</label>
                      <input className="inp" value={s.etage || ''} onChange={e => updateSoignant(idx, 'etage', e.target.value)} placeholder="Ex: RDC, 1er étage..." />
                    </div>
                    <div>
                      <label className="lbl">Chambres par défaut (séparées par des virgules)</label>
                      <input className="inp" value={(s.chambres_default || []).join(', ')} onChange={e => updateChambres(idx, e.target.value)} placeholder="Ex: 101, 102, 103..." />
                    </div>
                    <button onClick={() => removeSoignant(idx)} className="text-xs text-red-500 hover:text-red-700">Supprimer ce soignant</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div>
            {selected && <button onClick={deleteConfig} className="text-sm text-red-500 hover:text-red-700">Supprimer la configuration</button>}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#4A2C2A' }}>
              {loading ? 'Enregistrement...' : selected ? 'Modifier' : 'Créer'}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}
