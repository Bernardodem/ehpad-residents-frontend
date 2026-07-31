import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { Search, LogOut, Plus, X, Archive, RotateCcw, AlertTriangle, Scale, MoreVertical, DoorOpen } from 'lucide-react';

function etage(chambre) {
  const f = Math.floor(chambre / 100);
  if (f === 1) return 'Rez-de-chaussée';
  if (f === 2 || f === 3) return '1er étage';
  if (f === 4 || f === 5) return '2ème étage';
  return 'Autre';
}

function NouveauModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ chambre: '', nom: '', prenom: '' });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.chambre || !form.nom || !form.prenom) { toast.error('Tous les champs sont requis'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/residents', form);
      toast.success('Résident créé');
      onSaved(data.id);
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Nouveau résident</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="lbl">N° de chambre</label>
            <input className="inp" type="number" value={form.chambre} onChange={e => setForm(p => ({ ...p, chambre: e.target.value }))} />
          </div>
          <div>
            <label className="lbl">Nom</label>
            <input className="inp" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
          </div>
          <div>
            <label className="lbl">Prénom</label>
            <input className="inp" value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={save} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#4A2C2A' }}>
            {loading ? 'Création...' : 'Créer'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600">Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function ListePage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [changeChambre, setChangeChambre] = useState(null);
  const [nouvelleChambre, setNouvelleChambre] = useState('');
  const [chambresDisponibles, setChambresDisponibles] = useState([]);
  const [filtreEtage, setFiltreEtage] = useState('');
  const [filtreAppt, setFiltreAppt] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('archive', showArchives ? 'true' : 'false');
    if (search) params.set('search', search);
    api.get(`/residents?${params.toString()}`)
      .then(({ data }) => setResidents(data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, showArchives]);

  const archiverDepuisListe = async (id, e) => {
    e.stopPropagation();
    setMenuOpen(null);
    if (!window.confirm('Archiver ce résident ?')) return;
    try {
      await api.post(`/residents/${id}/archiver`);
      toast.success('Résident archivé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const changerChambre = async (e) => {
    e.preventDefault();
    if (!nouvelleChambre) return;
    const nouvChambre = parseInt(nouvelleChambre);
    const chambreInfo = chambresDisponibles.find(c => c.chambre === nouvChambre);
    const residentCourant = residents.find(r => r.id === changeChambre);

    if (chambreInfo && !chambreInfo.libre) {
      const occupant = residents.find(r => r.chambre === nouvChambre && !r.archive);
      const nomOccupant = occupant ? `${occupant.prenom} ${occupant.nom}` : 'un autre resident';
      const chambreActuelle = residentCourant?.chambre;
      const msg = `La chambre ${nouvChambre} est occupee par ${nomOccupant}.\n\nVoulez-vous echanger ?\n${residentCourant?.prenom} ${residentCourant?.nom} -> chambre ${nouvChambre}\n${nomOccupant} -> chambre ${chambreActuelle}`;
      if (!window.confirm(msg)) return;
      try {
        const chambreActuelleInt = parseInt(chambreActuelle);
        await api.patch(`/residents/${occupant.id}`, { chambre: 9999 });
        await api.patch(`/residents/${changeChambre}`, { chambre: nouvChambre });
        await api.patch(`/residents/${occupant.id}`, { chambre: chambreActuelleInt });
        toast.success('Echange effectue');
      } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de l echange'); return; }
    } else {
      try {
        await api.patch(`/residents/${changeChambre}`, { chambre: nouvChambre });
        toast.success('Chambre mise a jour');
      } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); return; }
    }
    setChangeChambre(null);
    setNouvelleChambre('');
    setChambresDisponibles([]);
    load();
  };

  const desarchiver = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/residents/${id}/desarchiver`);
      toast.success('Résident réintégré');
      load();
    } catch { toast.error('Erreur'); }
  };

  const ETAGES = ['Rez-de-chaussée', '1er étage', '2ème étage'];
  const APPTS = [1, 2, 3, 4, 5];

  const filtered = residents.filter(r => {
    if (filtreEtage && etage(r.chambre) !== filtreEtage) return false;
    if (filtreAppt) {
      const appt = Math.floor(r.chambre / 100);
      if (appt !== parseInt(filtreAppt)) return false;
    }
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const e = etage(r.chambre);
    (acc[e] = acc[e] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 shadow-md" style={{ background: 'linear-gradient(135deg, #3A2020, #4A2C2A)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="text-white font-bold text-sm">Résidents</span>
            <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Arc en Ciel</span>
          </div>
          <a href="/" className="p-2 rounded-lg text-white hover:bg-white/10 inline-flex">
            <LogOut size={18} />
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4" onClick={() => setMenuOpen(null)}>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex-1">
              <button onClick={() => setShowArchives(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${!showArchives ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                style={!showArchives ? { background: '#4A2C2A' } : {}}>
                Résidents
              </button>
              <button onClick={() => setShowArchives(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${showArchives ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                style={showArchives ? { background: '#4A2C2A' } : {}}>
                <Archive size={14} /> Archives
              </button>
            </div>
            {isManager() && !showArchives && (
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 whitespace-nowrap shrink-0" style={{ background: '#4A2C2A' }}>
                <Plus size={16} /> Nouveau
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="inp pl-9" placeholder="Rechercher un nom ou une chambre..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-8 mt-3 mb-4 flex-wrap justify-center">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 shrink-0">Étage</span>
              <div className="flex gap-2">
                {['Rez-de-chaussée', '1er étage', '2ème étage'].map(e => (
                  <button key={e} onClick={() => { setFiltreAppt(''); setFiltreEtage(f => f === e ? '' : e); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: filtreEtage === e ? '#C9A84C' : '#4A2C2A', opacity: filtreEtage && filtreEtage !== e ? 0.4 : 1 }}>
                    {e === 'Rez-de-chaussée' ? 'RDC' : e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 shrink-0">Appt</span>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(a => (
                  <button key={a} onClick={() => { setFiltreEtage(''); setFiltreAppt(f => f === a ? '' : a); }}
                    className="w-8 h-8 rounded-xl text-xs font-bold text-white shrink-0"
                    style={{ background: filtreAppt === a ? '#C9A84C' : '#4A2C2A', opacity: filtreAppt && filtreAppt !== a ? 0.4 : 1 }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {(filtreEtage || filtreAppt !== '') && (
              <button onClick={() => { setFiltreEtage(''); setFiltreAppt(''); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: '#4A2C2A' }}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : residents.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400">
            {showArchives ? 'Aucun résident archivé' : search ? 'Aucun résultat' : 'Aucun résident'}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([et, list]) => (
              <div key={et}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{et} ({list.length})</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {list.map(r => (
                    <div key={r.id} className="relative">
                      <button
                        onClick={() => navigate(`/fiche/${r.id}`)}
                        className="w-full bg-white rounded-xl p-3 text-left shadow-sm border-2 border-transparent hover:border-amber-500 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: '#4A2C2A' }}>
                            {r.chambre}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{r.nom} {r.prenom}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {r.toilette && <span className="text-xs text-gray-400">{r.toilette}</span>}
                              {(r.risques || []).length > 0 && (
                                <span className="text-xs text-red-600 flex items-center gap-0.5">
                                  <AlertTriangle size={11} /> {r.risques.length}
                                </span>
                              )}
                              {r.prot_jur_type && r.prot_jur_type !== 'Aucune' && (
                                <span className="text-xs text-purple-600 flex items-center gap-0.5">
                                  <Scale size={11} /> {r.prot_jur_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {showArchives && isManager() ? (
                          <button onClick={e => desarchiver(r.id, e)} className="p-2 rounded-lg text-green-600 hover:bg-green-50 shrink-0" title="Réintégrer">
                            <RotateCcw size={15} />
                          </button>
                        ) : isManager() && (
                          <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === r.id ? null : r.id); }}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 shrink-0">
                            <MoreVertical size={15} />
                          </button>
                        )}
                      </button>
                      {menuOpen === r.id && (
                        <div className="absolute right-0 top-12 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-36">
                          <button onClick={e => { e.stopPropagation(); setMenuOpen(null); setChangeChambre(r.id); setNouvelleChambre(String(r.chambre)); api.get('/residents/chambres/disponibles').then(({data}) => { setChambresDisponibles(data); const premierLibre = data.find(c => c.libre); if (premierLibre) setNouvelleChambre(String(premierLibre.chambre)); }); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <DoorOpen size={15} /> Changer de chambre
                          </button>
                          <button onClick={e => archiverDepuisListe(r.id, e)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Archive size={15} /> Archiver
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {changeChambre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setChangeChambre(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Changer de chambre</h2>
              <button onClick={() => setChangeChambre(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="mb-4">
              <label className="lbl">Nouveau numéro de chambre</label>
              <select className="inp" value={nouvelleChambre} onChange={e => setNouvelleChambre(e.target.value)}>
                <option value="">— Choisir —</option>
                {chambresDisponibles.filter(c => c.libre).length > 0 && (
                  <optgroup label="Chambres libres">
                    {chambresDisponibles.filter(c => c.libre).map(c => (
                      <option key={c.chambre} value={c.chambre}>{c.chambre}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Chambres occupées">
                  {chambresDisponibles.filter(c => !c.libre).map(c => (
                    <option key={c.chambre} value={c.chambre}>{c.chambre}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={changerChambre} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#4A2C2A' }}>Confirmer</button>
              <button onClick={() => setChangeChambre(null)} className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showNew && <NouveauModal onClose={() => setShowNew(false)} onSaved={id => navigate(`/fiche/${id}`)} />}
    </div>
  );
}
