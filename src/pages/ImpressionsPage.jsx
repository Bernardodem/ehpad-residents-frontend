import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { Home, Printer, Users } from 'lucide-react';
import UserMenu from '../components/UserMenu';
import Footer from '../components/Footer';

function couleur(slot) {
  return slot === 'prot_s' ? 'Vert' : 'Jaune';
}

function formatProt(type, taille, slot) {
  if (!type || type === 'Aucune' || type === '' || type === '—') return null;
  if (type === 'Anaform' || type === 'Protection légère' || type === 'Pants') return type;
  return `${type}${taille ? ' ' + taille : ''} ${couleur(slot)}`;
}

function apptLabel(n) {
  if (n === 1) return 'Appartement 1 — Rez-de-chaussée';
  if (n === 2) return 'Appartement 2 — 1er étage';
  if (n === 3) return 'Appartement 3 — 1er étage';
  if (n === 4) return 'Appartement 4 — 2ème étage';
  if (n === 5) return 'Appartement 5 — 2ème étage';
  return `Appartement ${n}`;
}

function DetailProtectionsDoc({ residents }) {
  const today = new Date().toLocaleDateString('fr-FR');
  const appts = [1, 2, 3, 4, 5];
  const slots = ['prot_m', 'prot_am', 'prot_s', 'prot_n'];

  return (
    <div id="print-detail-prot">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body > *:not(#print-detail-prot) { display: none !important; }
          .page-break { page-break-after: always; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th, td { border: 1px solid #ccc; padding: 3px 5px; text-align: left; }
          th { background: #f3f0eb; font-weight: bold; }
          .total-row td { background: #f3f0eb; font-weight: bold; }
          h2 { font-size: 13px; font-weight: bold; margin: 0 0 4px 0; }
          h3 { font-size: 10px; margin: 0 0 6px 0; color: #555; }
          .doc-date { font-size: 9px; color: #777; margin-bottom: 8px; }
          .doc-footer { font-size: 8px; color: #999; margin-top: 6px; text-align: right; }
        }
        @media screen { #print-detail-prot { display: none; } }
      `}</style>
      {appts.map((appt, idx) => {
        const list = residents
          .filter(r => Math.floor(r.chambre / 100) === appt)
          .sort((a, b) => a.chambre - b.chambre);
        const totals = slots.map(s =>
          list.reduce((acc, r) => acc + (formatProt(r[s], r.prot_taille, s) ? 1 : 0), 0)
        );
        const totalJ = totals.reduce((a, b) => a + b, 0);
        return (
          <div key={appt} className={idx < 4 ? 'page-break' : ''}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span>👤</span><h2>Détail des protections par résident</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span>🏢</span><h3>{apptLabel(appt)} — Arc-en-Ciel EHPAD</h3>
            </div>
            <div className="doc-date">{today}</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Ch.</th>
                  <th style={{ width: '14%' }}>Nom</th>
                  <th style={{ width: '12%' }}>Prénom</th>
                  <th style={{ width: '17%' }}>Matin</th>
                  <th style={{ width: '17%' }}>Après-midi</th>
                  <th style={{ width: '17%' }}>Soir</th>
                  <th style={{ width: '12%' }}>Nuit</th>
                  <th style={{ width: '6%', textAlign: 'center' }}>Total/j</th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => {
                  const vals = slots.map(s => formatProt(r[s], r.prot_taille, s));
                  const total = vals.filter(Boolean).length;
                  return (
                    <tr key={r.id}>
                      <td>{r.chambre}</td>
                      <td>{r.nom}</td>
                      <td>{r.prenom}</td>
                      {vals.map((v, i) => <td key={i}>{v || '—'}</td>)}
                      <td style={{ textAlign: 'center' }}>{total || '—'}</td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td colSpan={3}>TOTAL — {list.length} résident(s)</td>
                  {totals.map((t, i) => <td key={i}>{t}</td>)}
                  <td style={{ textAlign: 'center' }}>{totalJ}</td>
                </tr>
              </tbody>
            </table>
            <div className="doc-footer">{today} — Détail protections par appartement — Arc-en-Ciel</div>
          </div>
        );
      })}
    </div>
  );
}

const DOCS = [
  { id: 'detail-prot', label: 'Détail protections par appartement', icon: '🩲', desc: '5 pages A4 — une par appartement' },
  { id: 'dotation-prot', label: 'Dotation protections par appartement', icon: '📦', desc: 'Quantités jour / semaine / mois', disabled: true },
  { id: 'cuisine-a3', label: 'Tableau synthèse cuisine', icon: '🍽️', desc: 'Format A3 paysage — textures & régimes', disabled: true },
  { id: 'falc', label: 'Tableau alimentation FALC', icon: '🥣', desc: 'Simplifié pour les ASH', disabled: true },
  { id: 'risques', label: 'Tableau des risques', icon: '⚠️', desc: 'Par résident et par type', disabled: true },
  { id: 'contentions', label: 'Tableau des contentions', icon: '🔒', desc: 'Barrières, grenouillère, coquille, ceinture', disabled: true },
  { id: 'cartes-soignants', label: 'Cartes soignants', icon: '👩‍⚕️', desc: 'Pleine page ou 2/page, unitaire ou global', disabled: true },
];

export default function ImpressionsPage() {
  const { user, isRealAdmin, viewAs, setViewAs } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(null);

  useEffect(() => {
    api.get('/residents?archive=false')
      .then(({ data }) => setResidents(data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (docId) => {
    if (docId === 'detail-prot') {
      const slots = ['prot_m', 'prot_am', 'prot_s', 'prot_n'];
      const appts = [1, 2, 3, 4, 5];
      const today = new Date().toLocaleDateString('fr-FR');

      const apptLabel = (n) => {
        if (n === 1) return 'Appartement 1 — Rez-de-chaussée';
        if (n === 2) return 'Appartement 2 — 1er étage';
        if (n === 3) return 'Appartement 3 — 1er étage';
        if (n === 4) return 'Appartement 4 — 2ème étage';
        if (n === 5) return 'Appartement 5 — 2ème étage';
        return `Appartement ${n}`;
      };

      const fmt = (type, taille, slot) => {
        if (!type || type === 'Aucune' || type === '') return null;
        if (type === 'Anaform' || type === 'Protection légère' || type === 'Pants') return type;
        const couleur = slot === 'prot_s' ? 'Vert' : 'Jaune';
        return `${type}${taille ? ' ' + taille : ''} ${couleur}`;
      };

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Détail protections — Arc-en-Ciel</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 9px; }
  .page-break { page-break-after: always; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 6px; }
  th, td { border: 1px solid #ccc; padding: 3px 5px; text-align: left; }
  th { background: #f3f0eb; font-weight: bold; }
  .total-row td { background: #f3f0eb; font-weight: bold; }
  h2 { font-size: 13px; font-weight: bold; margin: 0 0 4px 0; }
  h3 { font-size: 10px; margin: 0 0 4px 0; color: #555; }
  .doc-date { font-size: 9px; color: #777; margin-bottom: 6px; }
  .doc-footer { font-size: 8px; color: #999; margin-top: 6px; text-align: right; }
</style>
</head><body>`;

      appts.forEach((appt, idx) => {
        const list = residents
          .filter(r => Math.floor(r.chambre / 100) === appt)
          .sort((a, b) => a.chambre - b.chambre);
        const totals = slots.map(s =>
          list.reduce((acc, r) => acc + (fmt(r[s], r.prot_taille, s) ? 1 : 0), 0)
        );
        const totalJ = totals.reduce((a, b) => a + b, 0);

        html += `<div${idx < 4 ? ' class="page-break"' : ''}>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    <span>👤</span><h2>Détail des protections par résident</h2>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    <span>🏢</span><h3>${apptLabel(appt)} — Arc-en-Ciel EHPAD</h3>
  </div>
  <div class="doc-date">${today}</div>
  <table>
    <thead><tr>
      <th style="width:5%">Ch.</th>
      <th style="width:14%">Nom</th>
      <th style="width:12%">Prénom</th>
      <th style="width:17%">Matin</th>
      <th style="width:17%">Après-midi</th>
      <th style="width:17%">Soir</th>
      <th style="width:12%">Nuit</th>
      <th style="width:6%;text-align:center">Total/j</th>
    </tr></thead>
    <tbody>`;

        list.forEach(r => {
          const vals = slots.map(s => fmt(r[s], r.prot_taille, s));
          const total = vals.filter(Boolean).length;
          html += `<tr>
        <td>${r.chambre}</td>
        <td>${r.nom}</td>
        <td>${r.prenom}</td>
        ${vals.map(v => `<td>${v || '—'}</td>`).join('')}
        <td style="text-align:center">${total || '—'}</td>
      </tr>`;
        });

        html += `<tr class="total-row">
        <td colspan="3">TOTAL — ${list.length} résident(s)</td>
        ${totals.map(t => `<td>${t}</td>`).join('')}
        <td style="text-align:center">${totalJ}</td>
      </tr>
    </tbody>
  </table>
  <div class="doc-footer">${today} — Détail protections par appartement — Arc-en-Ciel</div>
</div>`;
      });

      html += '</body></html>';

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {printing === 'detail-prot' && <DetailProtectionsDoc residents={residents} />}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 pb-4">
        <div className="rounded-2xl px-5 py-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #3A2020, #5C3A37)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://monaec.fr/logo-aec.jpg" alt="Arc en Ciel" className="h-10 rounded-lg shrink-0" />
              <div>
                <h1 className="text-base font-bold">Impressions</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Documents à imprimer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="p-2 rounded-lg text-white hover:bg-white/10" title="Retour au portail">
                <Home size={18} />
              </a>
              <UserMenu user={user} onLogout={() => { localStorage.removeItem('sso_token'); localStorage.removeItem('sso_user'); localStorage.removeItem('sso_apps'); window.location.href = '/'; }} isRealAdmin={isRealAdmin} viewAs={viewAs} setViewAs={setViewAs} />
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-4">
          <a href="/residents" className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 text-center no-underline">Résidents</a>
          <a href="/residents/repartition" className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 no-underline">
            <Users size={14} /> Répartition
          </a>
          <button className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2" style={{ background: '#4A2C2A' }}>
            <Printer size={14} /> Impressions
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : (
          <div className="space-y-2">
            {DOCS.map(doc => (
              <div key={doc.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 ${doc.disabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{doc.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                  </div>
                </div>
                <button
                  disabled={doc.disabled}
                  onClick={() => handlePrint(doc.id)}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 shrink-0 disabled:cursor-not-allowed"
                  style={{ background: doc.disabled ? '#ccc' : '#4A2C2A' }}
                >
                  <Printer size={14} />
                  {doc.disabled ? 'Bientôt' : 'Imprimer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer appSource="Résidents" />
    </div>
  );
}
