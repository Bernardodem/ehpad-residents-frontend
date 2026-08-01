import UserMenu from '../components/UserMenu';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Settings, RefreshCw, Archive } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

function ResidentCard({ resident }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: `${resident.chambre}` });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded shrink-0" style={{ background: '#4A2C2A' }}>{resident.chambre}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{resident.nom} {resident.prenom}</p>
          {resident.toilette && <p className="text-xs text-gray-400 truncate">{resident.toilette}</p>}
        </div>
      </div>
    </div>
  );
}

function SoignantColonne({ soignant, residents, onRemove, canEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: `soignant-${soignant.id}` });
  return (
    <div className="flex flex-col min-w-44 w-44 shrink-0">
      <div className="rounded-t-xl p-2 text-center text-white text-xs font-bold" style={{ background: '#4A2C2A' }}>
        {soignant.label} <span className="opacity-60">({residents.length})</span>
      </div>
      <div ref={setNodeRef}
        className={`flex-1 min-h-40 rounded-b-xl p-2 space-y-1.5 border-2 transition-colors ${isOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
        {residents.map(r => (
          <div key={r.chambre} className="relative group">
            <ResidentCard resident={r} />
            {canEdit && (
              <button onClick={() => onRemove(r.chambre)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center">×</button>
            )}
          </div>
        ))}
        {residents.length === 0 && (
          <div className="h-12 flex items-center justify-center text-xs text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">Déposer ici</div>
        )}
      </div>
    </div>
  );
}

function NonAffectesZone({ residents, filtres }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'non-affectes' });
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Non affectés ({residents.length})</p>
      {filtres}
      <div ref={setNodeRef}
        className={`min-h-12 rounded-xl p-2 space-y-1.5 border-2 transition-colors ${isOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
        {residents.map(r => <ResidentCard key={r.chambre} resident={r} />)}
        {residents.length === 0 && <p className="text-xs text-gray-300 text-center py-3">Tous les résidents sont affectés ✓</p>}
      </div>
    </div>
  );
}


const SAINTS = ["Marie","Basile","Genevieve","Odilon","Edouard","Melaine","Raymond","Lucien","Alix","Guillaume","Paulin","Tatiana","Yvette","Nina","Remi","Marcel","Roseline","Prisca","Marius","Sebastien","Agnes","Vincent","Barnard","Francois","Ananie","Paule","Angele","Thomas","Gildas","Martine","Marcelle","Ella","Theophane","Blaise","Veronique","Agathe","Gaston","Eugenie","Jacqueline","Apolline","Arnaud","Heloise","Felix","Beatrice","Valentin","Claude","Julienne","Alexis","Bernadette","Gabin","Aimee","Pierre-Damien","Isabelle","Lazare","Modeste","Romeo","Nestor","Honorine","Romain","Auguste","Aubin","Charles","Guenole","Casimir","Olive","Colette","Felicite","Jean","Francoise","Vivien","Rosine","Justine","Rodrigue","Mathilde","Louise","Benedicte","Patrice","Cyrille","Joseph","Herbert","Clemence","Lea","Victorien","Catherine","Humbert","Larissa","Habib","Gontran","Gwladys","Amedee","Benjamin","Hugues","Sandrine","Richard","Isidore","Irene","Marcellin","Jean-Baptiste","Julie","Gauthier","Fulbert","Stanislas","Jules","Ida","Maxime","Paterne","Benoit-Joseph","Anicet","Parfait","Emma","Odette","Anselme","Alexandre","Georges","Fidele","Marc","Alida","Zita","Valerie","Catherine","Robert","Jeremie","Boris","Philippe","Sylvain","Judith","Prudence","Gisele","Desire","Pacome","Solange","Estelle","Achille","Rolande","Matthias","Denise","Honore","Pascal","Eric","Yves","Bernardin","Constantin","Emile","Didier","Donatien","Sophie","Berenger","Augustin","Germain","Aymard","Ferdinand","Perrine","Justin","Blandine","Kevin","Clotilde","Igor","Norbert","Gilbert","Medard","Diane","Landry","Barnabe","Guy","Antoine","Elisee","Germaine","Jean-Francois","Herve","Leonce","Romuald","Silvere","Rodolphe","Alban","Audrey","Jean-Baptiste","Prosper","Anthelme","Fernand","Irenee","Pierre","Martial","Thierry","Martinien","Thomas","Florent","Antoine","Mariette","Raoul","Thibaut","Amandine","Ulrich","Benoit","Olivier","Henri","Camille","Donald","Carmen","Charlotte","Frederic","Arsene","Marina","Victor","Marie-Madeleine","Brigitte","Christine","Jacques","Anne","Nathalie","Samson","Marthe","Juliette","Ignace","Alphonse","Julien","Lydie","Jean-Marie","Abel","Octavien","Gaetan","Dominique","Amour","Laurent","Claire","Clarisse","Hippolyte","Evrard","Marie","Armel","Hyacinthe","Helene","Jean-Eudes","Bernard","Christophe","Fabrice","Rose","Barthelemy","Louis","Natacha","Monique","Augustin","Sabine","Fiacre","Aristide","Gilles","Ingrid","Gregoire","Rosalie","Raissa","Bertrand","Reine","Adrien","Alain","Ines","Adelphe","Apollinaire","Aime","Cyprien","Roland","Edith","Renaud","Nadege","Emilie","Davy","Matthieu","Maurice","Constant","Thecle","Hermann","Come","Vincent","Venceslas","Michel","Jerome","Therese","Leger","Gerard","Francois","Fleur","Bruno","Serge","Pelagie","Denis","Ghislain","Firmin","Wilfried","Geraud","Juste","Aurelie","Edwige","Baudouin","Luc","Rene","Adeline","Celine","Elodie","Jean","Florentin","Crepin","Dimitri","Emeline","Simon","Narcisse","Bienvenue","Quentin","Harold","Oceane","Hubert","Charles","Sylvie","Bertille","Carine","Geoffroy","Theodore","Leon","Martin","Christian","Brice","Sidoine","Albert","Marguerite","Elisabeth","Aude","Tanguy","Edmond","Rufus","Cecile","Clement","Flora","Catherine","Delphine","Severin","Jacques","Saturnin","Andre","Florence","Viviane","Xavier","Barbara","Gerald","Nicolas","Ambroise","Elfried","Pierre","Romaric","Daniel","Corentin","Lucie","Odile","Ninon","Alice","Gael","Gatien","Urbain","Theophile","Pierre","Francoise-Xaviere","Armand","Adele","Emmanuel","Etienne","Jean","Gaspard","David","Roger","Sylvestre"];

function getSaintDuJour() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  let day = Math.floor(diff / oneDay);
  const isBissextile = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
  if (!isBissextile && day >= 59) day++;
  return SAINTS[Math.min(day, SAINTS.length - 1)] || '';
}

export default function RepartitionPage() {
  const navigate = useNavigate();
  const { isManager, user } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [configId, setConfigId] = useState('');
  const [config, setConfig] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [nonAffectes, setNonAffectes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeResident, setActiveResident] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [filtreEtageNonAff, setFiltreEtageNonAff] = useState('');

  const logout = () => { localStorage.removeItem('sso_token'); localStorage.removeItem('sso_user'); localStorage.removeItem('sso_apps'); window.location.href = '/'; };

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
    load();
  }, [configId]);

  const load = async () => {
    if (!configId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/repartition/configs/${configId}/affectations`);
      setAffectations(data.affectations || []);
      setNonAffectes(data.non_affectes || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const reinitialiser = async () => {
    if (!window.confirm('Remettre tous les résidents en non-affectés pour cette configuration ?')) return;
    try {
      for (const a of affectations) {
        await api.patch(`/repartition/configs/${configId}/affectations/${a.chambre}`, { soignant_id: null });
      }
      await load();
      toast.success('Répartition réinitialisée');
    } catch { toast.error('Erreur'); }
  };

  const affecter = async (chambre, soignantId) => {
    try {
      await api.patch(`/repartition/configs/${configId}/affectations/${chambre}`, { soignant_id: soignantId });
      await load();
    } catch { toast.error('Erreur affectation'); }
  };

  const desaffecter = async (chambre) => {
    try {
      await api.patch(`/repartition/configs/${configId}/affectations/${chambre}`, { soignant_id: null });
      await load();
    } catch { toast.error('Erreur'); }
  };

  const handleDragStart = ({ active }) => {
    const chambre = parseInt(active.id);
    setActiveResident(affectations.find(a => a.chambre === chambre) || nonAffectes.find(r => r.chambre === chambre));
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveResident(null);
    if (!over) return;
    const chambre = parseInt(active.id);
    if (over.id === 'non-affectes') await desaffecter(chambre);
    else if (over.id.startsWith('soignant-')) await affecter(chambre, over.id.replace('soignant-', ''));
  };

  const affParSoignant = (config?.soignants || []).reduce((acc, s) => {
    acc[s.id] = affectations.filter(a => a.soignant_id === s.id);
    return acc;
  }, {});

  const soignantsByEtage = (config?.soignants || []).reduce((acc, s) => {
    const e = s.etage || 'Autre';
    (acc[e] = acc[e] || []).push(s);
    return acc;
  }, {});

  const nonAffectesFiltres = nonAffectes.filter(r => {
    if (!filtreEtageNonAff) return true;
    const appt = Math.floor(r.chambre / 100);
    return ({ 'RDC': [1], '1er étage': [2, 3], '2ème étage': [4, 5] }[filtreEtageNonAff] || []).includes(appt);
  });

  const filtresBtns = (
    <div className="flex justify-around mt-1 mb-2">
      {[['RDC','RDC'],['1er étage','1er'],['2ème étage','2ème']].map(([val, label]) => (
        <button key={val} onClick={() => setFiltreEtageNonAff(f => f === val ? '' : val)}
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: filtreEtageNonAff === val ? '#C9A84C' : '#4A2C2A', color: 'white', opacity: filtreEtageNonAff && filtreEtageNonAff !== val ? 0.4 : 1 }}>
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-4 pt-4">
        <div className="rounded-2xl px-5 py-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #3A2020, #5C3A37)' }}>
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center gap-3 min-w-0">
              <img src="https://monaec.fr/logo-aec.jpg" alt="Arc en Ciel" className="h-12 rounded-lg shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold truncate">Bonjour, {user?.prenom} 👋</h1>
                <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <br />Nous fêtons les {getSaintDuJour()}
                </p>
              </div>
            </div>
            <div className="text-center font-bold text-base">Répartition</div>
            <div className="flex justify-end">
              <UserMenu user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 mb-4 space-y-3">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <a href="/residents" className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center text-gray-500 hover:text-gray-700 no-underline">Résidents</a>
          <span className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center text-white" style={{ background: '#4A2C2A' }}>Répartition</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {configs.map(c => (
            <button key={c.id} onClick={() => setConfigId(c.id)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium"
              style={{ background: configId === c.id ? '#C9A84C' : '#4A2C2A', color: 'white' }}>
              {c.nom}
            </button>
          ))}
          {isManager() && (
            <button onClick={reinitialiser} className="ml-auto px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium flex items-center gap-2">
              <RefreshCw size={15} /> Réinitialiser la configuration
            </button>
          )}
          {isManager() && (
            <button onClick={() => setShowConfigModal(true)} className="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium flex items-center gap-2">
              <Settings size={15} /> Paramètres de configuration
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 px-4 py-4 overflow-x-auto max-w-5xl w-full mx-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : !config ? (
          <div className="text-center py-16 text-gray-400">
            <p>Aucune configuration.</p>
            {isManager() && <button onClick={() => setShowConfigModal(true)} className="mt-3 px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#4A2C2A' }}>Créer une configuration</button>}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 items-start">
              <div className="w-48 shrink-0" style={{ position: 'sticky', top: '1rem', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <NonAffectesZone residents={nonAffectesFiltres} filtres={filtresBtns} />
              </div>
              <div className="flex-1 space-y-6 pb-4">
                {Object.entries(soignantsByEtage).map(([etage, soignants]) => (
                  <div key={etage}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{etage}</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {soignants.map(s => (
                        <SoignantColonne key={s.id} soignant={s} residents={affParSoignant[s.id] || []} onRemove={desaffecter} canEdit={isManager()} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeResident && (
                <div className="bg-white rounded-lg p-2 shadow-lg border border-amber-300 opacity-90 w-44">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded" style={{ background: '#4A2C2A' }}>{activeResident.chambre}</span>
                    <p className="text-xs font-semibold text-gray-900">{activeResident.nom} {activeResident.prenom}</p>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {showConfigModal && (
        <ConfigModal configs={configs} onClose={() => setShowConfigModal(false)}
          onSaved={() => { api.get('/repartition/configs').then(({ data }) => { setConfigs(data); if (data.length > 0 && !configId) setConfigId(data[0].id); }); setShowConfigModal(false); }} />
      )}
    </div>
  );
}

function ConfigModal({ configs, onClose, onSaved }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nom: '', soignants: [] });
  const [loading, setLoading] = useState(false);

  const newConfig = () => { setSelected(null); setForm({ nom: '', soignants: [] }); };
  const loadConfig = async (id) => {
    const { data } = await api.get(`/repartition/configs/${id}`);
    setSelected(data);
    setForm({ nom: data.nom, soignants: data.soignants.map(s => ({ ...s, chambres_default: s.chambres_default || [] })) });
  };
  const addSoignant = () => {
    const next = form.soignants.length > 0 ? Math.max(...form.soignants.map(s => s.numero)) + 1 : 1;
    setForm(p => ({ ...p, soignants: [...p.soignants, { numero: next, label: `Soignant ${next}`, etage: '', chambres_default: [] }] }));
  };
  const updateSoignant = (idx, field, value) => setForm(p => ({ ...p, soignants: p.soignants.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  const removeSoignant = (idx) => setForm(p => ({ ...p, soignants: p.soignants.filter((_, i) => i !== idx) }));
  const updateChambres = (idx, value) => updateSoignant(idx, 'chambres_default', value.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c)));
  const save = async () => {
    if (!form.nom) { toast.error('Nom requis'); return; }
    setLoading(true);
    try {
      if (selected) await api.patch(`/repartition/configs/${selected.id}`, form);
      else await api.post('/repartition/configs', form);
      toast.success(selected ? 'Modifiée' : 'Créée');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setLoading(false); }
  };
  const deleteConfig = async () => {
    if (!window.confirm('Supprimer ?')) return;
    try { await api.delete(`/repartition/configs/${selected.id}`); toast.success('Supprimée'); onSaved(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Configurations de répartition</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="w-48 border-r border-gray-100 p-3 space-y-1 overflow-y-auto">
            {configs.map(c => (
              <button key={c.id} onClick={() => loadConfig(c.id)} className="w-full text-left px-3 py-2 rounded-lg text-sm"
                style={selected?.id === c.id ? { background: '#4A2C2A', color: 'white' } : { color: '#555' }}>{c.nom}</button>
            ))}
            <button onClick={newConfig} className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-700 hover:bg-amber-50">+ Nouvelle</button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div><label className="lbl">Nom</label><input className="inp" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Ex: 8 soignants" /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="lbl mb-0">Soignants</label>
                <button onClick={addSoignant} className="text-xs px-2 py-1 rounded text-white" style={{ background: '#4A2C2A' }}>+ Ajouter</button>
              </div>
              <div className="space-y-2">
                {form.soignants.map((s, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className="lbl">N°</label><input className="inp" type="number" value={s.numero} onChange={e => updateSoignant(idx, 'numero', parseInt(e.target.value))} /></div>
                      <div className="col-span-2"><label className="lbl">Label</label><input className="inp" value={s.label} onChange={e => updateSoignant(idx, 'label', e.target.value)} /></div>
                    </div>
                    <div><label className="lbl">Étage</label><input className="inp" value={s.etage || ''} onChange={e => updateSoignant(idx, 'etage', e.target.value)} placeholder="RDC, 1er étage..." /></div>
                    <div><label className="lbl">Chambres par défaut</label><input className="inp" value={(s.chambres_default || []).join(', ')} onChange={e => updateChambres(idx, e.target.value)} placeholder="101, 102, 103..." /></div>
                    <button onClick={() => removeSoignant(idx)} className="text-xs text-red-500">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div>{selected && <button onClick={deleteConfig} className="text-sm text-red-500">Supprimer la configuration</button>}</div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#4A2C2A' }}>{loading ? 'Enregistrement...' : selected ? 'Modifier' : 'Créer'}</button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}
