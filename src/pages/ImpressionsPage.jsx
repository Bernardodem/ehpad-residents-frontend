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
  { id: 'cuisine-a3', label: 'Tableau synthèse cuisine', icon: '🍽️', desc: 'Format A3 paysage — textures & régimes', disabled: true },
  { id: 'falc', label: 'Tableau alimentation FALC', icon: '🥣', desc: 'Simplifié pour les ASH', disabled: true },
  { id: 'risques', label: 'Tableau des risques', icon: '⚠️', desc: 'Par résident et par type de risque' },
  { id: 'contentions', label: 'Tableau des contentions', icon: '🔒', desc: 'Barrières, grenouillère, coquille, ceinture — A3 portrait' },
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

  const [filtreAppt, setFiltreAppt] = useState('');
  const [filtreSlot, setFiltreSlot] = useState('tout');

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

      const slotsActifs = filtreSlot === 'jour'
        ? ['prot_m', 'prot_am', 'prot_s']
        : filtreSlot === 'nuit'
        ? ['prot_n']
        : ['prot_m', 'prot_am', 'prot_s', 'prot_n'];

      const fmt = (type, taille, slot) => {
        if (!type || type === 'Aucune' || type === '') return null;
        const couleur = slot === 'prot_s' ? 'Vert' : 'Jaune';
        if (type === 'Anaform' || type === 'Protection légère' || type === 'Pants') return type;
        return `${type}${taille ? ' ' + taille : ''} ${couleur}`;
      };

      const apptsFiltres = filtreAppt
        ? [parseInt(filtreAppt)]
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
  Arc-en-Ciel EHPAD — ${today} — Slot : ${slotLabel[filtreSlot]}${filtreAppt ? ' — ' + apptLabel(parseInt(filtreAppt)) : ' — Tous les appartements'}
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
      win.onload = () => { win.print(); };
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
      win.onload = () => { win.print(); };
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
      win.onload = () => { win.print(); };
    }

    if (docId === 'detail-prot') {
      const slots = filtreSlot === 'jour'
        ? ['prot_m', 'prot_am', 'prot_s']
        : filtreSlot === 'nuit'
        ? ['prot_n']
        : ['prot_m', 'prot_am', 'prot_s', 'prot_n'];
      const slotHeaders = {
        prot_m: 'Matin', prot_am: 'Après-midi', prot_s: 'Soir', prot_n: 'Nuit'
      };
      const appts = filtreAppt ? [parseInt(filtreAppt)] : [1, 2, 3, 4, 5];
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
                {doc.id === 'detail-prot' && !doc.disabled && (
                  <div className="px-4 pb-4 pt-3 flex flex-wrap gap-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Appt</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFiltreAppt('')}
                          className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: filtreAppt === '' ? '#C9A84C' : '#4A2C2A', opacity: filtreAppt !== '' ? 0.35 : 1 }}
                        >Tous</button>
                        {[1,2,3,4,5].map(a => (
                          <button key={a}
                            onClick={() => setFiltreAppt(f => f === String(a) ? '' : String(a))}
                            className="w-8 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreAppt === String(a) ? '#C9A84C' : '#4A2C2A', opacity: filtreAppt && filtreAppt !== String(a) ? 0.35 : 1 }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Slot</span>
                      <div className="flex gap-1">
                        {[['tout','Jour + Nuit'],['jour','Jour'],['nuit','Nuit']].map(([val, label]) => (
                          <button key={val}
                            onClick={() => setFiltreSlot(val)}
                            className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreSlot === val ? '#C9A84C' : '#4A2C2A', opacity: filtreSlot !== val ? 0.35 : 1 }}
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
                          onClick={() => setFiltreAppt('')}
                          className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: filtreAppt === '' ? '#C9A84C' : '#4A2C2A', opacity: filtreAppt !== '' ? 0.35 : 1 }}
                        >Tous</button>
                        {[1,2,3,4,5].map(a => (
                          <button key={a}
                            onClick={() => setFiltreAppt(f => f === String(a) ? '' : String(a))}
                            className="w-8 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreAppt === String(a) ? '#C9A84C' : '#4A2C2A', opacity: filtreAppt && filtreAppt !== String(a) ? 0.35 : 1 }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 shrink-0">Slot</span>
                      <div className="flex gap-1">
                        {[['tout','Jour + Nuit'],['jour','Jour'],['nuit','Nuit']].map(([val, label]) => (
                          <button key={val}
                            onClick={() => setFiltreSlot(val)}
                            className="px-3 h-7 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: filtreSlot === val ? '#C9A84C' : '#4A2C2A', opacity: filtreSlot !== val ? 0.35 : 1 }}
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
