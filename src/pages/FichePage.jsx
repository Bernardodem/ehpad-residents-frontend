import UserMenu from '../components/UserMenu';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Archive, Printer, LogOut, Home } from 'lucide-react';
import { Select, Input, TextArea, Toggle, ChipGroup, Section } from '../components/Fields';
import * as K from '../constants';


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

export default function FichePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, user } = useAuth();
  const [tab, setTab] = useState('nursing');
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/residents/${id}`)
      .then(({ data }) => setForm(data))
      .catch(() => { toast.error('Résident introuvable'); navigate('/'); });
  }, [id]);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setDirty(true);
  };

  const setContention = (key, value) => {
    setForm(p => ({ ...p, contentions: { ...(p.contentions || {}), [key]: value } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.updated_by;
      delete payload.archive; delete payload.archive_date;
      await api.patch(`/residents/${id}`, payload);
      toast.success('Fiche enregistrée');
      setDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const archiver = async () => {
    if (!window.confirm(`Archiver ${form.prenom} ${form.nom} ? La fiche sera conservée dans les archives.`)) return;
    try {
      await api.post(`/residents/${id}/archiver`);
      toast.success('Résident archivé');
      navigate('/');
    } catch { toast.error('Erreur'); }
  };

  if (!form) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  const ro = !isManager();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-4 no-print">
        <div className="rounded-2xl px-5 py-4 mb-4 text-white grid grid-cols-3 items-center" style={{ background: 'linear-gradient(135deg, #3A2020, #5C3A37)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="text-white p-2 hover:bg-white/10 rounded-lg shrink-0">
              <ArrowLeft size={18} />
            </button>
            <img src="https://monaec.fr/logo-aec.jpg" alt="Arc en Ciel" className="h-12 rounded-lg shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">Bonjour, {user?.prenom} 👋</h1>
              <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                <br />Nous fêtons les {getSaintDuJour()}
              </p>
            </div>
          </div>
          <div className="text-center min-w-0">
            <p className="font-bold text-base truncate">{form.prenom} {form.nom}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Chambre {form.chambre}</p>
          </div>
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button onClick={() => window.print()} className="p-2 rounded-lg text-white hover:bg-white/10">
              <Printer size={17} />
            </button>
            {isManager() && (
              <button onClick={archiver} className="p-2 rounded-lg text-white hover:bg-white/10" title="Archiver">
                <Archive size={17} />
              </button>
            )}
            <UserMenu user={user} onLogout={() => { localStorage.removeItem('sso_token'); localStorage.removeItem('sso_user'); localStorage.removeItem('sso_apps'); window.location.href = '/'; }} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 no-print">
        <div className="flex gap-1 overflow-x-auto bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {K.TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={tab === t.id ? { background: '#4A2C2A' } : {}}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <fieldset disabled={ro} className={ro ? 'opacity-70' : ''}>

          {tab === 'nursing' && (
            <div className="space-y-4">
              <Section title="Toilette et transfert">
                <Select label="Toilette" value={form.toilette} onChange={v => set('toilette', v)} options={K.TOILETTE} />
                <Select label="Transfert" value={form.transfert} onChange={v => set('transfert', v)} options={K.TRANSFERT} />
              </Section>

              <Section title="Protections">
                <Select label="Matin" value={form.prot_m} onChange={v => set('prot_m', v)} options={K.PROTECTIONS} placeholder="—" />
                <Select label="Après-midi" value={form.prot_am} onChange={v => set('prot_am', v)} options={K.PROTECTIONS} placeholder="—" />
                <Select label="Soir" value={form.prot_s} onChange={v => set('prot_s', v)} options={K.PROTECTIONS} placeholder="—" />
                <Select label="Nuit" value={form.prot_n} onChange={v => set('prot_n', v)} options={K.PROTECTIONS} placeholder="—" />
                <Select label="Taille" value={form.prot_taille} onChange={v => set('prot_taille', v)} options={K.PROT_TAILLES} placeholder="—" />
                <Toggle label="MAE" value={form.mae} onChange={v => set('mae', v)} />
              </Section>

              <Section title="Contentions">
                {K.CONTENTION_TYPES.map(ct => (
                  <Select
                    key={ct.key}
                    label={ct.label}
                    value={(form.contentions || {})[ct.key]}
                    onChange={v => setContention(ct.key, v)}
                    options={K.CONTENTION_MOMENTS}
                    placeholder="Non"
                  />
                ))}
                <Select label="Bas de contention" value={form.bas_contention} onChange={v => set('bas_contention', v)} options={K.OUI_NON} placeholder="Non" />
                <Select label="Bandes de contention" value={form.bandes_contention} onChange={v => set('bandes_contention', v)} options={K.OUI_NON} placeholder="Non" />
              </Section>

              <Section title="Appareillages">
                <Select label="Prothèse dentaire" value={form.prot_dent} onChange={v => set('prot_dent', v)} options={K.PROT_DENT} placeholder="Aucune" />
                <Select label="Prothèse auditive" value={form.prot_aud} onChange={v => set('prot_aud', v)} options={K.PROT_AUD} placeholder="Aucune" />
                <Toggle label="Lunettes" value={form.lunettes} onChange={v => set('lunettes', v)} />
              </Section>
            </div>
          )}

          {tab === 'alimentation' && (
            <div className="space-y-4">
              <Section title="Texture et régimes">
                <Select label="Texture" value={form.texture} onChange={v => set('texture', v)} options={K.TEXTURES} />
                <Select label="Hydratation" value={form.hydratation} onChange={v => set('hydratation', v)} options={K.HYDRATATION} />
                <Select label="Aide au repas" value={form.aide_repas} onChange={v => set('aide_repas', v)} options={K.AIDE_REPAS} placeholder="—" />
                <Input label="Allergie" value={form.allergie} onChange={v => set('allergie', v)} placeholder="Aucune allergie connue" />
              </Section>

              <Section cols={1}>
                <ChipGroup label="Régimes" values={form.regimes} onChange={v => set('regimes', v)} options={K.REGIMES} />
              </Section>

              <Section title="Lieux des repas" cols={3}>
                <Select label="Petit-déjeuner" value={form.lieu_pd} onChange={v => set('lieu_pd', v)} options={K.LIEUX_REPAS} placeholder="—" />
                <Select label="Déjeuner" value={form.lieu_dj} onChange={v => set('lieu_dj', v)} options={K.LIEUX_REPAS} placeholder="—" />
                <Select label="Dîner" value={form.lieu_d} onChange={v => set('lieu_d', v)} options={K.LIEUX_REPAS} placeholder="—" />
              </Section>

              <Section cols={1}>
                <ChipGroup label="CNO (compléments nutritionnels)" values={form.cno} onChange={v => set('cno', v)} options={K.CNO_MOMENTS} />
                <ChipGroup label="Composition du petit-déjeuner" values={form.pdj} onChange={v => set('pdj', v)} options={K.PDJ} />
                <TextArea label="Particularités des repas" value={form.partic_rep} onChange={v => set('partic_rep', v)} />
              </Section>
            </div>
          )}

          {tab === 'deplacements' && (
            <div className="space-y-4">
              <Section title="Mobilité">
                <Select label="Aide au déplacement" value={form.deplacement} onChange={v => set('deplacement', v)} options={K.DEPLACEMENTS} placeholder="Aucun" />
                <Select label="Mode de déplacement" value={form.mode_depl} onChange={v => set('mode_depl', v)} options={K.MODE_DEPL} />
                <Select label="Installation pour la sieste" value={form.install_sieste} onChange={v => set('install_sieste', v)} options={K.INSTALL_SIESTE} placeholder="Non" />
                <Input label="Poids (kg)" value={form.poids} onChange={v => set('poids', v)} type="number" />
              </Section>
            </div>
          )}

          {tab === 'risques' && (
            <div className="space-y-4">
              <Section cols={1}>
                <ChipGroup label="Risques identifiés" values={form.risques} onChange={v => set('risques', v)} options={K.RISQUES} />
              </Section>
              {(form.risques || []).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    {(form.risques || []).length} risque{(form.risques || []).length > 1 ? 's' : ''} identifié{(form.risques || []).length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-700">
                    Ces risques doivent faire l'objet d'une surveillance renforcée et être tracés dans le projet d'accompagnement personnalisé.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'juridique' && (
            <div className="space-y-4">
              <Section title="Mesure de protection">
                <Select label="Type de mesure" value={form.prot_jur_type} onChange={v => set('prot_jur_type', v)} options={K.PROT_JURIDIQUE} placeholder="Aucune" />
              </Section>

              {form.prot_jur_type && form.prot_jur_type !== 'Aucune' && (
                <>
                  <Section title="Tuteur / Curateur">
                    <Input label="Nom" value={form.prot_jur_tuteur_nom} onChange={v => set('prot_jur_tuteur_nom', v)} />
                    <Input label="Téléphone" value={form.prot_jur_tuteur_tel} onChange={v => set('prot_jur_tuteur_tel', v)} type="tel" />
                    <Input label="Email" value={form.prot_jur_tuteur_email} onChange={v => set('prot_jur_tuteur_email', v)} type="email" />
                  </Section>

                  <Section title="Durée de la mesure">
                    <Input label="Date de début" value={form.prot_jur_date_debut ? form.prot_jur_date_debut.split('T')[0] : ''} onChange={v => set('prot_jur_date_debut', v)} type="date" />
                    <Input label="Date de fin" value={form.prot_jur_date_fin ? form.prot_jur_date_fin.split('T')[0] : ''} onChange={v => set('prot_jur_date_fin', v)} type="date" />
                  </Section>

                  {form.prot_jur_date_fin && new Date(form.prot_jur_date_fin) < new Date() && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-800">Mesure de protection expirée</p>
                      <p className="text-xs text-red-700 mt-1">
                        La mesure a pris fin le {new Date(form.prot_jur_date_fin).toLocaleDateString('fr-FR')}. Vérifiez son renouvellement.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'particularites' && (
            <div className="space-y-4">
              <Section cols={1}>
                <TextArea
                  label="Particularités de soins"
                  value={form.partic_soins}
                  onChange={v => set('partic_soins', v)}
                  rows={6}
                  placeholder="Informations complémentaires utiles aux équipes soignantes..."
                />
              </Section>
              <Section title="Identité" >
                <Input label="Nom" value={form.nom} onChange={v => set('nom', v)} />
                <Input label="Prénom" value={form.prenom} onChange={v => set('prenom', v)} />
                <Input label="Chambre" value={form.chambre} onChange={v => set('chambre', v)} type="number" />
              </Section>
            </div>
          )}

        </fieldset>
      </main>

      {isManager() && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 no-print">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: '#4A2C2A' }}
            >
              <Save size={17} />
              {saving ? 'Enregistrement...' : dirty ? 'Enregistrer les modifications' : 'Aucune modification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
