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
  { id: 'dotation-prot', label: 'Dotation protection', icon: '📦', desc: 'Quantités jour / semaine / mois — filtres étage, appartement, slot' },
  { id: 'cuisine-a3', label: 'Tableau synthèse cuisine', icon: '🍽️', desc: 'Format A3 paysage — textures & régimes' },
  { id: 'falc', label: 'Tableau alimentation FALC', icon: '🥣', desc: 'Une page par appartement — texture, lieux, aide repas, PDJ, notes', hasApptFilter: true },
  { id: 'risques', label: 'Tableau des risques', icon: '⚠️', desc: 'Par résident et par type de risque' },
  { id: 'contentions', label: 'Tableau des contentions', icon: '🔒', desc: 'Barrières, grenouillère, coquille, ceinture — A3 portrait' },
  { id: 'cartes-soignants', label: 'Cartes résidents', icon: '👩‍⚕️', desc: '2 par page A4 paysage — filtre par soignant ou étage/appartement', hasCarteFilter: true },
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
    api.get('/repartition/configs')
      .then(async ({ data }) => {
        const details = await Promise.all(
          data.map(c => api.get(`/repartition/configs/${c.id}`).then(r => r.data).catch(() => c))
        );
        setCarteConfigs(details);
      })
      .catch(() => {});
  }, []);

  const loadCarteSoignants = (configId) => {
    setCarteConfigId(configId);
    setCarteSoignants([]);
    setCarteSelectedSoignants([]);
    if (!configId) return;
    api.get(`/repartition/configs/${configId}`)
      .then(({ data }) => {
        setCarteSoignants(data.soignants || []);
        setCarteSelectedSoignants((data.soignants || []).map(s => s.id));
      })
      .catch(() => toast.error('Erreur chargement soignants'));
  };

  const [filtreApptDetail, setFiltreApptDetail] = useState('');
  const [filtreSlotDetail, setFiltreSlotDetail] = useState('tout');
  const [filtreApptDotation, setFiltreApptDotation] = useState('');
  const [filtreSlotDotation, setFiltreSlotDotation] = useState('tout');
  const [filtreApptFalc, setFiltreApptFalc] = useState('');
  const [filtreEtageFalc, setFiltreEtageFalc] = useState('');
  const [carteConfigs, setCarteConfigs] = useState([]);
  const [carteConfigId, setCarteConfigId] = useState('');
  const [carteSoignants, setCarteSoignants] = useState([]);
  const [carteSelectedSoignants, setCarteSelectedSoignants] = useState([]);
  const [carteAppt, setCarteAppt] = useState('');
  const [carteEtage, setCarteEtage] = useState('');

  const handlePrint = (docId) => {
    if (docId === 'dotation-prot') {
      const today = new Date().toLocaleDateString('fr-FR');
      const slotLabel = { tout: 'Jour + Nuit', jour: 'Jour (Matin, Après-midi, Soir)', nuit: 'Nuit' };

      const apptLabel = (n) => {
        if (n === 1) return 'Appartement 1 — Rez-de-chaussée';
        if (n === 2) return 'Appartement 2 — 1er étage';
        if (n === 3) return 'Appartement 3 — 1er étage';
        if (n === 4) return 'Appartement 4 — 2ème étage';
        if (n === 5) return 'Appartement 5 — 2ème étage';
        return `Appartement ${n}`;
      };

      const slotsActifs = filtreSlotDotation === 'jour'
        ? ['prot_m', 'prot_am', 'prot_s']
        : filtreSlotDotation === 'nuit'
        ? ['prot_n']
        : ['prot_m', 'prot_am', 'prot_s', 'prot_n'];

      const fmt = (type, taille, slot) => {
        if (!type || type === 'Aucune' || type === '') return null;
        const couleur = slot === 'prot_s' ? 'Vert' : 'Jaune';
        if (type === 'Anaform' || type === 'Protection légère' || type === 'Pants') return type;
        return `${type}${taille ? ' ' + taille : ''} ${couleur}`;
      };

      const apptsFiltres = filtreApptDotation
        ? [parseInt(filtreApptDotation)]
        : [1, 2, 3, 4, 5];

      // Même filtres pour detail-prot
      const apptsFiltresDetail = apptsFiltres;
      const slotsActifsDetail = slotsActifs;

      // Calcul des dotations par appt
      const sections = apptsFiltres.map(appt => {
        const list = residents.filter(r => Math.floor(r.chambre / 100) === appt);
        // Compter par type de protection
        const counts = {};
        list.forEach(r => {
          slotsActifs.forEach(s => {
            const v = fmt(r[s], r.prot_taille, s);
            if (v) counts[v] = (counts[v] || 0) + 1;
          });
        });
        return { appt, counts, nbRes: list.length };
      });

      const totalGlobal = {};
      sections.forEach(({ counts }) => {
        Object.entries(counts).forEach(([k, v]) => {
          totalGlobal[k] = (totalGlobal[k] || 0) + v;
        });
      });

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Dotation protections — Arc-en-Ciel</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 9px; }
  h2 { font-size: 13px; font-weight: bold; margin: 0 0 4px 0; }
  h3 { font-size: 10px; margin: 10px 0 4px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  .meta { font-size: 9px; color: #777; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 8px; }
  th, td { border: 1px solid #ccc; padding: 3px 6px; text-align: left; }
  th { background: #f3f0eb; font-weight: bold; }
  td.num { text-align: center; }
  .total-row td { background: #f3f0eb; font-weight: bold; }
  .grand-total { margin-top: 12px; border-top: 2px solid #4A2C2A; padding-top: 8px; }
  .note { font-size: 8px; color: #aaa; margin-top: 4px; font-style: italic; }
  .doc-footer { font-size: 8px; color: #999; margin-top: 16px; text-align: right; }
</style>
</head><body>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
  <span>📦</span><h2>Dotation protections par appartement</h2>
</div>
<div class="meta">
  Arc-en-Ciel EHPAD — ${today} — Slot : ${slotLabel[filtreSlotDotation]}${filtreApptDotation ? ' — ' + apptLabel(parseInt(filtreApptDotation)) : ' — Tous les appartements'}
</div>`;

      sections.forEach(({ appt, counts, nbRes }) => {
        const entries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
        const totalJ = Object.values(counts).reduce((a, b) => a + b, 0);
        html += `<h3>${apptLabel(appt)} — ${nbRes} résident(s)</h3>
<table>
  <thead><tr>
    <th>Type de protection</th>
    <th class="num">Unités/jour</th>
    <th class="num">Unités/semaine</th>
    <th class="num">Unités/mois</th>
    <th class="num">Sachets/mois*</th>
  </tr></thead>
  <tbody>`;
        entries.forEach(([type, qteJ]) => {
          html += `<tr>
    <td>${type}</td>
    <td class="num">${qteJ}</td>
    <td class="num">${qteJ * 7}</td>
    <td class="num">${qteJ * 30}</td>
    <td class="num">—</td>
  </tr>`;
        });
        html += `<tr class="total-row">
    <td>TOTAL</td>
    <td class="num">${totalJ}</td>
    <td class="num">${totalJ * 7}</td>
    <td class="num">${totalJ * 30}</td>
    <td class="num">—</td>
  </tr></tbody></table>`;
      });

      if (apptsFiltres.length > 1) {
        const entries = Object.entries(totalGlobal).sort((a, b) => a[0].localeCompare(b[0]));
        const totalJ = Object.values(totalGlobal).reduce((a, b) => a + b, 0);
        html += `<div class="grand-total">
<h3 style="border-bottom:2px solid #4A2C2A;color:#4A2C2A">TOTAL ÉTABLISSEMENT</h3>
<table>
  <thead><tr>
    <th>Type de protection</th>
    <th class="num">Unités/jour</th>
    <th class="num">Unités/semaine</th>
    <th class="num">Unités/mois</th>
    <th class="num">Sachets/mois*</th>
  </tr></thead>
  <tbody>`;
        entries.forEach(([type, qteJ]) => {
          html += `<tr>
    <td>${type}</td>
    <td class="num">${qteJ}</td>
    <td class="num">${qteJ * 7}</td>
    <td class="num">${qteJ * 30}</td>
    <td class="num">—</td>
  </tr>`;
        });
        html += `<tr class="total-row">
    <td>TOTAL</td>
    <td class="num">${totalJ}</td>
    <td class="num">${totalJ * 7}</td>
    <td class="num">${totalJ * 30}</td>
    <td class="num">—</td>
  </tr></tbody></table></div>`;
      }

      html += `<div class="note">* Colonne Sachets/mois disponible après mise à jour du champ conditionnement dans l'app Stocks</div>
<div class="doc-footer">${today} — Dotation protections — Arc-en-Ciel</div>
</body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'risques') {
      const today = new Date().toLocaleDateString('fr-FR');
      const ALL_RISQUES = [
        { label: 'Fugue',                    emoji: '⚡' },
        { label: 'Chute',                    emoji: '🤕' },
        { label: 'Addiction',                emoji: '🚬' },
        { label: 'Dénutrition',              emoji: '🥗' },
        { label: 'Fausse route',             emoji: '🫁' },
        { label: 'Sexualité',                emoji: '❤️' },
        { label: 'Suicide',                  emoji: '🆘' },
        { label: 'Harcèlement / Abus de faiblesse', emoji: '⚠️' },
        { label: 'Radicalisation',           emoji: '🔴' },
      ];

      const list = [...residents].sort((a, b) => a.chambre - b.chambre);
      const totaux = {};
      ALL_RISQUES.forEach(r => { totaux[r.label] = 0; });
      list.forEach(r => {
        (r.risques || []).forEach(risk => { if (totaux[risk] !== undefined) totaux[risk]++; });
      });

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Tableau des risques — Arc-en-Ciel</title>
<style>
  @page { size: A3 portrait; margin: 10mm; }
  body { font-family: Arial, sans-serif; font-size: 7.5px; }
  h2 { font-size: 12px; font-weight: bold; margin: 0 0 1px 0; }
  .meta { font-size: 7px; color: #555; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; font-size: 7.5px; margin-bottom: 6px; }
  th, td { border: 1px solid #ccc; padding: 1px 3px; }
  th { background: #f3f0eb; font-weight: bold; text-align: left; }
  th.risque { text-align: center; height: 22px; padding: 2px 4px; font-size: 7px; vertical-align: middle; white-space: nowrap; }
  td.check { text-align: center; font-size: 9px; color: #c0392b; font-weight: bold; }
  td.num { text-align: center; }
  .total-row td { background: #f3f0eb; font-weight: bold; text-align: center; }
  .total-row td:first-child { text-align: left; }
  .sig-block { display: flex; gap: 10mm; margin-top: 5mm; }
  .sig-box { flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 5px 8px; min-height: 18mm; }
  .sig-title { font-size: 8px; font-weight: bold; color: #4A2C2A; margin-bottom: 4px; }
  .sig-line { border-bottom: 1px solid #bbb; margin-bottom: 8px; padding-bottom: 1px; font-size: 6px; color: #999; }
  .doc-footer { font-size: 6px; color: #999; margin-top: 4px; text-align: right; }
</style>
</head><body>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
  <span style="font-size:16px">⚠️</span><h2>Tableau des risques identifiés</h2>
</div>
<div class="meta">Arc-en-Ciel EHPAD · ${list.length} résidents · Mis à jour le ${today}</div>
<table>
  <thead>
    <tr>
      <th style="width:4%">Ch.</th>
      <th style="width:13%">Résident</th>
      ${ALL_RISQUES.map(r => `<th class="risque">${r.emoji}<br>${r.label.length > 8 ? r.label.substring(0,8)+'.' : r.label}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
    ${list.map(r => `<tr>
      <td>${r.chambre}</td>
      <td>${r.nom}${r.prenom ? ' ' + r.prenom[0] + '.' : ''}</td>
      ${ALL_RISQUES.map(risk => `<td class="check">${(r.risques||[]).includes(risk.label) ? '✓' : ''}</td>`).join('')}
    </tr>`).join('')}
    <tr class="total-row">
      <td colspan="2">Total</td>
      ${ALL_RISQUES.map(r => `<td>${totaux[r.label] || ''}</td>`).join('')}
    </tr>
  </tbody>
</table>
<div class="sig-block">
  <div class="sig-box">
    <div class="sig-title">Médecin coordonnateur</div>
    <div class="sig-line">Nom &amp; Signature</div>
    <div class="sig-line">Date</div>
  </div>
  <div class="sig-box">
    <div class="sig-title">IDE coordinatrice</div>
    <div class="sig-line">Nom &amp; Signature</div>
    <div class="sig-line">Date</div>
  </div>
</div>
<div class="doc-footer">${today} — Arc-en-Ciel — Tableau des risques</div>
</body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'contentions') {
      const today = new Date().toLocaleDateString('fr-FR');
      const CONT_KEYS = [
        { key: 'barrieres',    label: 'Barrières',     emoji: '🛏️' },
        { key: 'grenouillere', label: 'Grenouillère',  emoji: '🦵' },
        { key: 'coquille',     label: 'Coquille',      emoji: '🪑' },
        { key: 'ceinture',     label: 'Ceinture',      emoji: '🔒' },
      ];

      const list = [...residents].sort((a, b) => a.chambre - b.chambre);

      const totaux = { barrieres: 0, grenouillere: 0, coquille: 0, ceinture: 0 };
      list.forEach(r => {
        const c = r.contentions || {};
        CONT_KEYS.forEach(({ key }) => { if (c[key]) totaux[key]++; });
      });

      const hasContention = (r) => {
        const c = r.contentions || {};
        return CONT_KEYS.some(({ key }) => !!c[key]);
      };

      const withCont = list.filter(hasContention);

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Tableau des contentions — Arc-en-Ciel</title>
<style>
  @page { size: A3 portrait; margin: 10mm; }
  body { font-family: Arial, sans-serif; font-size: 8px; }
  h2 { font-size: 13px; font-weight: bold; margin: 0 0 2px 0; }
  .meta { font-size: 8px; color: #555; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 10px; }
  th, td { border: 1px solid #ccc; padding: 2px 5px; }
  th { background: #f3f0eb; font-weight: bold; text-align: left; }
  th.cont { text-align: center; white-space: nowrap; font-size: 8px; }
  td.val { text-align: center; font-size: 8px; color: #c0392b; font-weight: bold; }
  td.empty { text-align: center; color: #ddd; }
  .total-row td { background: #f3f0eb; font-weight: bold; }
  .total-row td:not(:first-child) { text-align: center; }
  .sig-block { display: flex; gap: 10mm; margin-top: 8mm; }
  .sig-box { flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 6px 10px; min-height: 20mm; }
  .sig-title { font-size: 9px; font-weight: bold; color: #4A2C2A; margin-bottom: 5px; }
  .sig-line { border-bottom: 1px solid #bbb; margin-bottom: 10px; padding-bottom: 1px; font-size: 7px; color: #999; }
  .doc-footer { font-size: 7px; color: #999; margin-top: 6px; text-align: right; }
</style>
</head><body>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
  <span style="font-size:16px">🔒</span><h2>Tableau des contentions</h2>
</div>
<div class="meta">Arc-en-Ciel EHPAD · ${list.length} résidents · ${withCont.length} avec contention · Mis à jour le ${today}</div>
<table>
  <thead>
    <tr>
      <th style="width:4%">Ch.</th>
      <th style="width:18%">Résident</th>
      ${CONT_KEYS.map(c => `<th class="cont">${c.emoji} ${c.label}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
    ${list.map(r => {
      const c = r.contentions || {};
      const hasCont = CONT_KEYS.some(({ key }) => !!c[key]);
      return `<tr${!hasCont ? ' style="color:#bbb"' : ''}>
      <td>${r.chambre}</td>
      <td>${r.nom}${r.prenom ? ' ' + r.prenom[0] + '.' : ''}</td>
      ${CONT_KEYS.map(({ key }) => c[key]
        ? `<td class="val">${c[key]}</td>`
        : `<td class="empty">—</td>`
      ).join('')}
    </tr>`;
    }).join('')}
    <tr class="total-row">
      <td colspan="2">Total résidents avec contention</td>
      ${CONT_KEYS.map(({ key }) => `<td>${totaux[key] || '—'}</td>`).join('')}
    </tr>
  </tbody>
</table>
<div class="sig-block">
  <div class="sig-box">
    <div class="sig-title">Médecin coordonnateur</div>
    <div class="sig-line">Nom &amp; Signature</div>
    <div class="sig-line">Date</div>
  </div>
  <div class="sig-box">
    <div class="sig-title">IDE coordinatrice</div>
    <div class="sig-line">Nom &amp; Signature</div>
    <div class="sig-line">Date</div>
  </div>
</div>
<div class="doc-footer">${today} — Arc-en-Ciel — Tableau des contentions</div>
</body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'cuisine-a3') {
      const today = new Date().toLocaleDateString('fr-FR');

      const TEXTURES = ['NORMALE', 'HACHEE', 'MIXEE'];
      const TEXTURE_LABEL = { NORMALE: 'Normale', HACHEE: 'Hachée', MIXEE: 'Mixée' };
      const TEXTURE_COLOR = { NORMALE: '#27ae60', HACHEE: '#f39c12', MIXEE: '#2980b9' };

      const APPT_GROUPS = [
        { label: 'RDC (Apt 1)',          appts: [1] },
        { label: '1er étage (Apt 2 & 3)', appts: [2, 3] },
        { label: '2ème étage (Apt 4 & 5)', appts: [4, 5] },
      ];

      const list = residents.filter(r => !r.archive);

      const getEtageGroup = (chambre) => {
        const appt = Math.floor(chambre / 100);
        return APPT_GROUPS.find(g => g.appts.includes(appt));
      };

      // Section 1 : synthèse par texture et étage
      const synthese = APPT_GROUPS.map(g => {
        const rg = list.filter(r => g.appts.includes(Math.floor(r.chambre / 100)));
        const row = { label: g.label, total: rg.length };
        TEXTURES.forEach(t => {
          const sub = rg.filter(r => r.texture === t);
          row[t] = sub.length;
          row[t + '_dr'] = sub.filter(r => (r.cno || []).includes('Double ration')).length;
        });
        return row;
      });
      const totSynth = { total: list.length };
      TEXTURES.forEach(t => {
        totSynth[t] = list.filter(r => r.texture === t).length;
        totSynth[t + '_dr'] = list.filter(r => r.texture === t && (r.cno || []).includes('Double ration')).length;
      });

      // Section 2 : combinaisons exactes
      const getCombKey = (r) => {
        const t = TEXTURE_LABEL[r.texture] || r.texture;
        const regs = (r.regimes || []).slice().sort().join('+');
        return regs ? `${t}+${regs}` : `${t} standard`;
      };

      // Collecter toutes les combinaisons uniques
      const allCombs = {};
      list.forEach(r => {
        const key = getCombKey(r);
        if (!allCombs[key]) allCombs[key] = { texture: r.texture, regimes: (r.regimes || []).slice().sort(), count: {} };
        APPT_GROUPS.forEach(g => { allCombs[key].count[g.label] = allCombs[key].count[g.label] || 0; });
      });
      list.forEach(r => {
        const key = getCombKey(r);
        const g = getEtageGroup(r.chambre);
        if (g) allCombs[key].count[g.label]++;
      });

      // Trier : par texture puis standard en premier
      const combKeys = Object.keys(allCombs).sort((a, b) => {
        const ta = allCombs[a].texture, tb = allCombs[b].texture;
        if (ta !== tb) return TEXTURES.indexOf(ta) - TEXTURES.indexOf(tb);
        const stdA = a.includes('standard') ? 0 : 1;
        const stdB = b.includes('standard') ? 0 : 1;
        return stdA - stdB;
      });

      // Double ration colonne séparée
      const drKey = 'Double ration';
      const drByGroup = {};
      APPT_GROUPS.forEach(g => {
        drByGroup[g.label] = list.filter(r =>
          g.appts.includes(Math.floor(r.chambre / 100)) && (r.cno || []).includes('Double ration')
        ).length;
      });

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Synthèse cuisine — Arc-en-Ciel</title>
<style>
  @page { size: A3 landscape; margin: 10mm; }
  body { font-family: Arial, sans-serif; font-size: 9px; display: flex; flex-direction: column; justify-content: center; min-height: 95vh; }
  h2 { font-size: 14px; font-weight: bold; margin: 0 0 2px 0; }
  h3 { font-size: 10px; font-weight: bold; margin: 12px 0 5px 0; color: #333; }
  .meta { font-size: 8px; color: #555; margin-bottom: 10px; }
  table { border-collapse: collapse; margin-bottom: 10px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: 8px; vertical-align: middle; }
  th { background: #f3f0eb; font-weight: bold; }
  td.num { text-align: center; }
  td.dr { text-align: center; color: #888; font-size: 7px; }
  .total-row td { background: #f3f0eb; font-weight: bold; }
  .total-row td:not(:first-child) { text-align: center; }
  .badge { display: inline-block; padding: 1px 5px; border-radius: 3px; color: white; font-size: 7px; font-weight: bold; margin-right: 2px; }
  .legend { display: flex; gap: 12px; margin-bottom: 6px; font-size: 7px; align-items: center; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
  .doc-footer { font-size: 7px; color: #999; margin-top: 8px; text-align: right; }
  .note { font-size: 7px; color: #888; font-style: italic; margin-top: 4px; }
</style>
</head><body>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
  <span style="font-size:16px">📊</span><h2>Récapitulatif Cuisine — Synthèse A3</h2>
</div>
<div class="meta">Arc-en-Ciel EHPAD — Mis à jour le ${today} — Format A3 paysage</div>

<h3>📊 Synthèse par texture et étage</h3>
<table style="width:100%">
  <thead><tr>
    <th>Étage</th>
    <th style="color:${TEXTURE_COLOR.NORMALE}">🟢 Normale</th>
    <th style="color:#aaa;font-size:7px">dont double ration</th>
    <th style="color:${TEXTURE_COLOR.HACHEE}">🟡 Hachée</th>
    <th style="color:#aaa;font-size:7px">dont double ration</th>
    <th style="color:${TEXTURE_COLOR.MIXEE}">🔵 Mixée</th>
    <th style="color:#aaa;font-size:7px">dont double ration</th>
    <th>TOTAL repas</th>
  </tr></thead>
  <tbody>
    ${synthese.map(row => `<tr>
      <td>${row.label}</td>
      <td class="num">${row.NORMALE || '—'}</td>
      <td class="dr">${row.NORMALE_dr || '—'}</td>
      <td class="num">${row.HACHEE || '—'}</td>
      <td class="dr">${row.HACHEE_dr || '—'}</td>
      <td class="num">${row.MIXEE || '—'}</td>
      <td class="dr">${row.MIXEE_dr || '—'}</td>
      <td class="num">${row.total}</td>
    </tr>`).join('')}
    <tr class="total-row">
      <td>TOTAL ÉTABLISSEMENT</td>
      <td>${totSynth.NORMALE}</td>
      <td class="dr">${totSynth.NORMALE_dr || '—'}</td>
      <td>${totSynth.HACHEE}</td>
      <td class="dr">${totSynth.HACHEE_dr || '—'}</td>
      <td>${totSynth.MIXEE}</td>
      <td class="dr">${totSynth.MIXEE_dr || '—'}</td>
      <td>${totSynth.total}</td>
    </tr>
  </tbody>
</table>

<h3>🍽 Détail par combinaison exacte — chaque résident compté une seule fois dans sa combinaison texture + régimes</h3>
<table style="width:100%">
  <thead><tr>
    <th>Étage</th>
    ${combKeys.map(k => {
      const c = allCombs[k];
      const color = TEXTURE_COLOR[c.texture] || '#666';
      const label = k.replace('standard','').replace(/\+/g,' +').trim() || 'standard';
      return `<th style="font-size:7px;text-align:center;color:${color}">${label}</th>`;
    }).join('')}
    <th style="font-size:7px;text-align:center;color:#888">Double ration</th>
    <th style="text-align:center">TOTAL repas</th>
  </tr></thead>
  <tbody>
    ${APPT_GROUPS.map(g => {
      const rowTotal = list.filter(r => g.appts.includes(Math.floor(r.chambre / 100))).length;
      return `<tr>
      <td>${g.label}</td>
      ${combKeys.map(k => `<td class="num">${allCombs[k].count[g.label] || '—'}</td>`).join('')}
      <td class="num">${drByGroup[g.label] || '—'}</td>
      <td class="num">${rowTotal}</td>
    </tr>`;
    }).join('')}
    <tr class="total-row">
      <td>TOTAL ÉTABLISSEMENT</td>
      ${combKeys.map(k => `<td>${Object.values(allCombs[k].count).reduce((a,b)=>a+b,0) || '—'}</td>`).join('')}
      <td>${Object.values(drByGroup).reduce((a,b)=>a+b,0) || '—'}</td>
      <td>${list.length}</td>
    </tr>
  </tbody>
</table>

<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background:${TEXTURE_COLOR.NORMALE}"></div> Normale</div>
  <div class="legend-item"><div class="legend-dot" style="background:${TEXTURE_COLOR.HACHEE}"></div> Hachée</div>
  <div class="legend-item"><div class="legend-dot" style="background:${TEXTURE_COLOR.MIXEE}"></div> Mixée</div>
  <span style="margin-left:8px">· "standard" = aucun régime particulier · "Double ration" est un modificateur de quantité comptabilisé séparément dans le tableau 1</span>
</div>
<div class="doc-footer">${today} — Arc-en-Ciel — Tableau repas cuisine</div>
</body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'falc') {
      const today = new Date().toLocaleDateString('fr-FR');

      const TEXTURE_EMOJI = { NORMALE: '🟢', HACHEE: '🟡', MIXEE: '🔵' };
      const TEXTURE_LABEL = { NORMALE: 'Normale', HACHEE: 'Hachée', MIXEE: 'Mixée' };

      const lieuIcon = (lieu) => {
        if (!lieu) return '—';
        if (lieu === 'Chambre') return '🛏 CHB';
        if (lieu === 'Salle') return '🍽 SALLE';
        return lieu;
      };

      const PDJ_EMOJI = {
        'Café': '☕', 'Café au lait': '☕ 🥛', 'Thé': '🍵', 'Lait': '🥛',
        'Chocolat au lait': '🍫', "Jus d'orange": "🍊", "Jus de pomme": "🍏",
        'Baguette': '🥖', 'Pain de mie': '🍞', 'Beurre': '🧈', 'Confiture': '🍓',
        'Blédine': '🫙',
      };

      const appts = filtreApptFalc
        ? [parseInt(filtreApptFalc)]
        : filtreEtageFalc === 'rdc' ? [1]
        : filtreEtageFalc === '1er' ? [2, 3]
        : filtreEtageFalc === '2eme' ? [4, 5]
        : [1, 2, 3, 4, 5];
      const apptLabel = (n) => {
        if (n === 1) return { title: 'Appartement 1 — Rez-de-chaussée', range: '101–112' };
        if (n === 2) return { title: 'Appartement 2 — 1er étage', range: '201–212' };
        if (n === 3) return { title: 'Appartement 3 — 1er étage', range: '301–312' };
        if (n === 4) return { title: 'Appartement 4 — 2ème étage', range: '401–412' };
        if (n === 5) return { title: 'Appartement 5 — 2ème étage', range: '501–512' };
        return { title: `Appartement ${n}`, range: '' };
      };

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Tableau alimentation ASH — Arc-en-Ciel</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  body { font-family: Arial, sans-serif; font-size: 9px; display: flex; flex-direction: column; justify-content: center; min-height: 95vh; }
  .page-break { page-break-after: always; }
  .header { background: linear-gradient(135deg, #3A2020, #5C3A37); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
  .header-title { font-size: 13px; font-weight: bold; }
  .header-sub { font-size: 9px; opacity: 0.8; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
  th, td { border: 1px solid #ddd; padding: 4px 6px; vertical-align: middle; }
  th { background: #f3f0eb; font-weight: bold; text-align: center; font-size: 8.5px; }
  th.left { text-align: left; }
  td.center { text-align: center; }
  td.lieu { text-align: center; white-space: nowrap; font-size: 8.5px; }
  td.aide { text-align: center; font-size: 8.5px; }
  .aide-required { outline: 2px solid #c0392b; }
  .texture-badge { font-size: 8.5px; white-space: nowrap; }
  .regimes { color: #c0392b; font-size: 8px; }
  .pdj-emojis { font-size: 11px; letter-spacing: 1px; }
  .pdj-text { font-size: 7.5px; color: #555; }
  .notes { font-size: 7.5px; color: #777; font-style: italic; }
  .footer { font-size: 7px; color: #999; margin-top: 5px; display: flex; justify-content: space-between; }
  .legend { font-size: 7px; color: #666; }
</style>
</head><body>`;

      appts.forEach((appt, idx) => {
        const info = apptLabel(appt);
        const list = residents
          .filter(r => Math.floor(r.chambre / 100) === appt)
          .sort((a, b) => a.chambre - b.chambre);

        html += `<div${idx < 4 ? ' class="page-break"' : ''}>
<div class="header">
  <div>
    <div class="header-title" style="text-align:center;width:100%">EHPAD Arc en Ciel — Habitudes alimentaires — ${info.title}</div>
    <div class="header-sub" style="text-align:center">Chambres ${info.range}</div>
  </div>
  <div class="header-sub" style="text-align:right;white-space:nowrap">Mise à jour le : ${today}</div>
</div>
<table>
  <thead><tr>
    <th class="left" style="width:3%">CH.</th>
    <th class="left" style="width:10%">RÉSIDENT</th>
    <th style="width:8%">TEXTURE</th>
    <th style="width:5%">🌅 PD</th>
    <th style="width:5%">☀️ DJ</th>
    <th style="width:5%">🌙 DÎNER</th>
    <th style="width:8%">🥄 AIDE REPAS</th>
    <th style="width:10%">🚫 RÉGIMES</th>
    <th style="width:14%">☀️ PETIT DÉJEUNER</th>
    <th style="width:14%">ℹ️ NOTES / ALLERGIE</th>
  </tr></thead>
  <tbody>`;

        list.forEach(r => {
          const texture = r.texture || 'NORMALE';
          const regimes = (r.regimes || []);
          const cno = (r.cno || []);
          const pdj = (r.pdj || []);
          const aideRequired = r.aide_repas && r.aide_repas !== 'Autonome';

          const pdJEmojis = pdj.map(p => PDJ_EMOJI[p] || '').filter(Boolean).join(' ');
          const pdJText = pdj.join(', ');

          const allRegimes = [...regimes, ...cno.filter(c => c === 'Double ration')];

          html += `<tr${aideRequired ? ' class="aide-required"' : ''}>
      <td>${r.chambre}</td>
      <td>${r.nom}<br><span style="color:#777">${r.prenom || ''}</span></td>
      <td class="center texture-badge">${TEXTURE_EMOJI[texture] || ''} ${TEXTURE_LABEL[texture] || texture}</td>
      <td class="lieu">${lieuIcon(r.lieu_pd)}</td>
      <td class="lieu">${lieuIcon(r.lieu_dj)}</td>
      <td class="lieu">${lieuIcon(r.lieu_d)}</td>
      <td class="aide">${r.aide_repas || 'Autonome'}</td>
      <td class="regimes">${allRegimes.length ? allRegimes.map(reg => `🚫 ${reg}`).join('<br>') : '—'}</td>
      <td>
        <div class="pdj-emojis">${pdJEmojis}</div>
        <div class="pdj-text">${pdJText}</div>
      </td>
      <td class="notes">${r.allergie || ''} ${r.partic_rep || ''}</td>
    </tr>`;
        });

        html += `</tbody></table>
<div class="footer">
  <span class="legend">Arc-en-Ciel EHPAD — Document interne ASH &nbsp;⬜ Encadré = Aide au repas requise</span>
  <span>${info.title} · ${list.length} résidents</span>
</div>
</div>`;
      });

      html += '</body></html>';

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'cartes-soignants') {
      const today = new Date().toLocaleDateString('fr-FR');
      const TEXTURE_EMOJI = { NORMALE: '🟢', HACHEE: '🟡', MIXEE: '🔵' };
      const TEXTURE_LABEL = { NORMALE: 'Normale', HACHEE: 'Hachée', MIXEE: 'Mixée' };
      const PDJ_EMOJI = {
        'Café': '☕', 'Café au lait': '☕', 'Thé': '🍵', 'Lait': '🥛',
        'Chocolat au lait': '🍫', "Jus d'orange": '🍊', 'Jus de pomme': '🍏',
        'Baguette': '🥖', 'Pain de mie': '🍞', 'Beurre': '🧈', 'Confiture': '🍓',
        'Blédine': '🫙',
      };

      const lieuIcon = (lieu) => {
        if (!lieu) return '🍽';
        if (lieu === 'Chambre') return '🛏';
        return '🍽';
      };

      const apptLabel = (chambre) => {
        const a = Math.floor(chambre / 100);
        if (a === 1) return 'RDC · Apt 1';
        if (a === 2) return '1er · Apt 2';
        if (a === 3) return '1er · Apt 3';
        if (a === 4) return '2ème · Apt 4';
        if (a === 5) return '2ème · Apt 5';
        return '';
      };

      // Déterminer les résidents à imprimer
      let residentsToPrint = [];

      if (carteConfigId && carteSoignants.length > 0 && carteSelectedSoignants.length > 0) {
        // Mode répartition : on prend les résidents des soignants sélectionnés
        const selectedSoignantData = carteSoignants.filter(s => carteSelectedSoignants.includes(s.id));
        const chambres = selectedSoignantData.flatMap(s => s.chambres_default || []);
        residentsToPrint = residents
          .filter(r => chambres.includes(r.chambre))
          .sort((a, b) => a.chambre - b.chambre);
      } else {
        // Mode étage/appt
        residentsToPrint = residents.filter(r => {
          const a = Math.floor(r.chambre / 100);
          if (carteAppt) return a === parseInt(carteAppt);
          if (carteEtage === 'rdc') return a === 1;
          if (carteEtage === '1er') return a === 2 || a === 3;
          if (carteEtage === '2eme') return a === 4 || a === 5;
          return true;
        }).sort((a, b) => a.chambre - b.chambre);
      }

      // Générer les paires (2 par page)
      const pairs = [];
      for (let i = 0; i < residentsToPrint.length; i += 2) {
        pairs.push([residentsToPrint[i], residentsToPrint[i+1] || null]);
      }

      const renderCarte = (r, soignantLabel) => {
        if (!r) return '<div style="flex:1"></div>';
        const texture = r.texture || 'NORMALE';
        const regimes = (r.regimes || []);
        const cno = (r.cno || []);
        const pdj = (r.pdj || []);
        const aideRepas = r.aide_repas || 'Autonome';
        const prots = [
          r.prot_m ? `Matin : ${r.prot_m}` : null,
          r.prot_am ? `AM : ${r.prot_am}` : null,
          r.prot_s ? `Soir : ${r.prot_s}` : null,
          r.prot_n ? `Nuit : ${r.prot_n}` : null,
        ].filter(Boolean);
        const hasProt = prots.some(p => !p.includes('Aucune') && !p.includes('undefined'));
        const hasProtheses = r.prot_dent || r.prot_aud || r.lunettes;

        return `<div style="flex:1;border:2px solid #3A6B4A;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;">
  <div style="background:linear-gradient(135deg,#2d5a3d,#3A6B4A);color:white;padding:8px 12px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:22px;font-weight:bold;background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:4px">${r.chambre}</span>
    <div>
      <div style="font-size:15px;font-weight:bold">${r.nom} ${r.prenom || ''}</div>
      <div style="font-size:11px;opacity:0.8">${apptLabel(r.chambre)}${soignantLabel ? ' · ' + soignantLabel : ''}</div>
    </div>
  </div>
  <div style="padding:10px;display:flex;gap:10px;font-size:11px;flex:1;">
    <div style="flex:1;border-right:1px solid #eee;padding-right:8px;">
      <div style="font-size:10px;font-weight:bold;color:#555;margin-bottom:6px;">🧼 NURSING</div>
      <div>Lieu : ${r.toilette || '—'}</div>
      <div>Mode dépl. : ${r.mode_depl || r.deplacement || '—'}</div>
      ${hasProt ? `<div style="margin-top:8px;font-size:10px;font-weight:bold;color:#555;">🩺 PROTECTIONS</div>${prots.map(p => `<div>${p}${r.prot_taille ? ' ' + r.prot_taille : ''}</div>`).join('')}` : ''}
      ${hasProtheses ? `<div style="margin-top:8px;font-size:10px;font-weight:bold;color:#555;">🦷 PROTHÈSES</div>${r.prot_dent ? '<div>🦷 Dentier</div>' : ''}${r.prot_aud ? '<div>👂 Auditif</div>' : ''}${r.lunettes ? '<div>👓 Lunettes</div>' : ''}` : ''}
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:bold;color:#555;margin-bottom:6px;">🍽 ALIMENTATION</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;">
        <span style="background:${texture === 'NORMALE' ? '#27ae60' : texture === 'HACHEE' ? '#f39c12' : '#2980b9'};color:white;padding:2px 8px;border-radius:10px;font-size:10px">${TEXTURE_EMOJI[texture]} ${TEXTURE_LABEL[texture]}</span>
        <span style="background:#eee;padding:2px 8px;border-radius:10px;font-size:10px">🥄 ${aideRepas}</span>
      </div>
      ${r.hydratation ? `<div>💧 ${r.hydratation}</div>` : ''}
      <div style="display:flex;gap:6px;margin:4px 0;">
        <span style="text-align:center;font-size:8px">${lieuIcon(r.lieu_pd)}<br><span style="font-size:7px;color:#888">PD</span></span>
        <span style="text-align:center;font-size:8px">${lieuIcon(r.lieu_dj)}<br><span style="font-size:7px;color:#888">DJ</span></span>
        <span style="text-align:center;font-size:8px">${lieuIcon(r.lieu_d)}<br><span style="font-size:7px;color:#888">DÎNER</span></span>
      </div>
      ${regimes.length || cno.length ? `<div style="color:#c0392b;font-size:10px">${[...regimes,...cno].map(x => '🚫 ' + x).join(' ')}</div>` : ''}
      ${pdj.length ? `<div style="margin-top:6px;font-size:10px;font-weight:bold;color:#555;">☀️ PETIT DÉJEUNER</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;">${pdj.map(p => `<span style="background:#f9f6f0;border:1px solid #ddd;border-radius:4px;padding:3px 7px;font-size:10px">${PDJ_EMOJI[p] || ''} ${p}</span>`).join('')}</div>` : ''}
      ${r.allergie || r.partic_rep ? `<div style="margin-top:6px;font-size:10px;color:#777;font-style:italic">${r.allergie || ''} ${r.partic_rep || ''}</div>` : ''}
    </div>
  </div>
</div>`;
      };

      // Trouver le label soignant pour chaque résident
      const getSoignantLabel = (r) => {
        if (!carteSoignants.length) return '';
        for (const s of carteSoignants) {
          if ((s.chambres_default || []).includes(r.chambre)) return s.label;
        }
        return '';
      };

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Cartes soignants — Arc-en-Ciel</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  body { font-family: Arial, sans-serif; margin: 0; }
  .page { display: flex; gap: 10px; height: calc(100vh - 16mm); page-break-after: always; }
  .page:last-child { page-break-after: avoid; }
  .header-bar { font-size: 8px; color: #999; display: flex; justify-content: space-between; margin-bottom: 4px; }
</style>
</head><body>`;

      pairs.forEach(([r1, r2]) => {
        const sl1 = getSoignantLabel(r1);
        const sl2 = r2 ? getSoignantLabel(r2) : '';
        html += `<div class="header-bar"><span>🌈 Arc-en-Ciel${carteConfigId ? ' — ' + (carteConfigs.find(c => c.id === carteConfigId)?.nom || '') : ''}</span><span>${today}</span></div>
<div class="page">
  ${renderCarte(r1, sl1)}
  ${renderCarte(r2, sl2)}
</div>`;
      });

      html += '</body></html>';

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
    }

    if (docId === 'detail-prot') {
      const slots = filtreSlotDetail === 'jour'
        ? ['prot_m', 'prot_am', 'prot_s']
        : filtreSlotDotation === 'nuit'
        ? ['prot_n']
        : ['prot_m', 'prot_am', 'prot_s', 'prot_n'];
      const slotHeaders = {
        prot_m: 'Matin', prot_am: 'Après-midi', prot_s: 'Soir', prot_n: 'Nuit'
      };
      const appts = filtreApptDetail ? [parseInt(filtreApptDetail)] : [1, 2, 3, 4, 5];
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
      ${slots.map(s => `<th>${slotHeaders[s]}</th>`).join('')}
      <th style="text-align:center">Total/j</th>
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
      win.onload = () => { win.print(); setTimeout(() => win.close(), 1000); };
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
              <div key={doc.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 ${doc.disabled ? 'opacity-50' : ''}`}>
                <div className="p-4 flex items-center justify-between gap-4">
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
                {doc.hasCarteFilter && !doc.disabled && (
                  <div className="px-4 pb-4 pt-3 flex flex-col gap-4 border-t border-gray-100">

                    {/* Section 1 : par étage/appt */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Par étage ou appartement</p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 shrink-0">Appt</span>
                          <div className="flex gap-1">
                            <button onClick={() => { setCarteAppt(''); setCarteEtage(''); setCarteConfigId(''); setCarteSoignants([]); setCarteSelectedSoignants([]); }}
                              className="px-3 h-7 rounded-lg text-xs font-bold text-white"
                              style={{ background: carteAppt === '' && carteEtage === '' && !carteConfigId ? '#C9A84C' : '#4A2C2A', opacity: (carteAppt !== '' || carteEtage !== '' || carteConfigId) ? 0.35 : 1 }}
                            >Tous</button>
                            {[1,2,3,4,5].map(a => (
                              <button key={a} onClick={() => { setCarteAppt(String(a)); setCarteEtage(''); setCarteConfigId(''); setCarteSoignants([]); setCarteSelectedSoignants([]); }}
                                className="w-8 h-7 rounded-lg text-xs font-bold text-white"
                                style={{ background: carteAppt === String(a) ? '#C9A84C' : '#4A2C2A', opacity: carteAppt && carteAppt !== String(a) ? 0.35 : 1 }}
                              >{a}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 shrink-0">Étage</span>
                          <div className="flex gap-1">
                            {[['rdc','RDC'],['1er','1er'],['2eme','2ème']].map(([val, label]) => (
                              <button key={val} onClick={() => { setCarteEtage(e => e === val ? '' : val); setCarteAppt(''); setCarteConfigId(''); setCarteSoignants([]); setCarteSelectedSoignants([]); }}
                                className="px-3 h-7 rounded-lg text-xs font-bold text-white"
                                style={{ background: carteEtage === val ? '#C9A84C' : '#4A2C2A', opacity: carteEtage && carteEtage !== val ? 0.35 : 1 }}
                              >{label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Séparateur */}
                    <div className="border-t border-dashed border-gray-200" />

                    {/* Section 2 : par soignant */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Par soignant</p>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">Répartition</span>
                        <div className="flex gap-1 flex-wrap">
                          {carteConfigs.map(c => (
                            <button key={c.id}
                              onClick={() => { loadCarteSoignants(c.id); setCarteAppt(''); setCarteEtage(''); }}
                              className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                              style={{ background: carteConfigId === c.id ? '#C9A84C' : '#4A2C2A', opacity: carteConfigId && carteConfigId !== c.id ? 0.35 : 1 }}
                            >{c.nom}</button>
                          ))}
                        </div>
                      </div>
                      {carteSoignants.length > 0 && (
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-500 shrink-0 mt-1">Soignants</span>
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => setCarteSelectedSoignants(carteSoignants.map(s => s.id))}
                              className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                              style={{ background: carteSelectedSoignants.length === carteSoignants.length ? '#C9A84C' : '#4A2C2A' }}
                            >Tous</button>
                            {carteSoignants.map(s => (
                              <button key={s.id}
                                onClick={() => setCarteSelectedSoignants([s.id])}
                                className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                                style={{ background: carteSelectedSoignants.includes(s.id) ? '#C9A84C' : '#4A2C2A', opacity: !carteSelectedSoignants.includes(s.id) ? 0.35 : 1 }}
                              >{s.label}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {doc.hasApptFilter && !doc.disabled && (
                  <div className="px-4 pb-4 pt-3 flex flex-wrap gap-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Appt</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFiltreApptFalc('')}
                          className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: filtreApptFalc === '' ? '#C9A84C' : '#4A2C2A', opacity: filtreApptFalc !== '' ? 0.35 : 1 }}
                        >Tous</button>
                        {[1,2,3,4,5].map(a => (
                          <button key={a}
                            onClick={() => { setFiltreApptFalc(f => f === String(a) ? '' : String(a)); setFiltreEtageFalc(''); }}
                            className="w-8 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreApptFalc === String(a) ? '#C9A84C' : '#4A2C2A', opacity: filtreApptFalc && filtreApptFalc !== String(a) ? 0.35 : 1 }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Étage</span>
                      <div className="flex gap-1">
                        {[['','Tous'],['rdc','RDC'],['1er','1er'],['2eme','2ème']].map(([val, label]) => (
                          <button key={val}
                            onClick={() => { setFiltreEtageFalc(val); setFiltreApptFalc(''); }}
                            className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreEtageFalc === val ? '#C9A84C' : '#4A2C2A', opacity: filtreEtageFalc !== val ? 0.35 : 1 }}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {doc.id === 'detail-prot' && !doc.disabled && (
                  <div className="px-4 pb-4 pt-3 flex flex-wrap gap-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Appt</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFiltreApptDetail('')}
                          className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: filtreApptDetail === '' ? '#C9A84C' : '#4A2C2A', opacity: filtreApptDetail !== '' ? 0.35 : 1 }}
                        >Tous</button>
                        {[1,2,3,4,5].map(a => (
                          <button key={a}
                            onClick={() => setFiltreApptDetail(f => f === String(a) ? '' : String(a))}
                            className="w-8 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreApptDetail === String(a) ? '#C9A84C' : '#4A2C2A', opacity: filtreApptDetail && filtreApptDetail !== String(a) ? 0.35 : 1 }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Slot</span>
                      <div className="flex gap-1">
                        {[['tout','Jour + Nuit'],['jour','Jour'],['nuit','Nuit']].map(([val, label]) => (
                          <button key={val}
                            onClick={() => setFiltreSlotDetail(val)}
                            className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreSlotDetail === val ? '#C9A84C' : '#4A2C2A', opacity: filtreSlotDetail !== val ? 0.35 : 1 }}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {doc.id === 'dotation-prot' && !doc.disabled && (
                  <div className="px-4 pb-4 pt-3 flex flex-wrap gap-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Appt</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFiltreApptDotation('')}
                          className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: filtreApptDotation === '' ? '#C9A84C' : '#4A2C2A', opacity: filtreApptDotation !== '' ? 0.35 : 1 }}
                        >Tous</button>
                        {[1,2,3,4,5].map(a => (
                          <button key={a}
                            onClick={() => setFiltreApptDotation(f => f === String(a) ? '' : String(a))}
                            className="w-8 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreApptDotation === String(a) ? '#C9A84C' : '#4A2C2A', opacity: filtreApptDotation && filtreApptDotation !== String(a) ? 0.35 : 1 }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Slot</span>
                      <div className="flex gap-1">
                        {[['tout','Jour + Nuit'],['jour','Jour'],['nuit','Nuit']].map(([val, label]) => (
                          <button key={val}
                            onClick={() => setFiltreSlotDotation(val)}
                            className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreSlotDotation === val ? '#C9A84C' : '#4A2C2A', opacity: filtreSlotDotation !== val ? 0.35 : 1 }}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer appSource="Résidents" />
    </div>
  );
}
