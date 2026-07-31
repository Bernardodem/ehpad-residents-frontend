export const TOILETTE = ['Aide partielle', 'Aide totale', 'Binôme', 'Binôme (transfert)', 'Binôme (SB)', 'Autonome', 'Stimulation'];
export const TRANSFERT = ['Autonome', 'Aide', 'Rail de transfert', 'Lève-malade', 'Alité'];
export const OUI_NON = ['Oui'];
export const PROTECTIONS = ['Aucune', 'Complète', 'Pants', 'Anaform', 'Protection légère'];
export const PROT_TAILLES = ['S', 'M', 'L', 'XL', 'XXL'];
export const PROT_DENT = ['Aucune', 'Haut', 'Bas', 'Haut & Bas'];
export const PROT_AUD = ['Aucune', 'Droite', 'Gauche', 'Bilatérale'];

export const TEXTURES = ['NORMALE', 'HACHEE', 'MIXEE'];
export const HYDRATATION = ['Eau plate', 'Eau gazeuse', 'Eau gélifiée'];
export const AIDE_REPAS = ['Autonome', 'Aide pour découper', 'Aide totale'];
export const REGIMES = ['Double ration', 'Sans porc', 'Sans viande', 'Sans poisson', 'Sans alcool', 'Sans fibres'];
export const LIEUX_REPAS = ['Chambre', 'Salle'];
export const CNO_MOMENTS = ['Matin', 'Midi', 'Après-midi', 'Soir'];
export const PDJ = ['Café', 'Café au lait', 'Chocolat au lait', 'Lait', 'Thé', "Jus d'orange", 'Jus de pomme', 'Baguette', 'Blédine', 'Pain de mie', 'Beurre', 'Confiture'];

export const DEPLACEMENTS = ['Aucun', 'Déambulateur', 'Canne', 'Fauteuil standard', 'Fauteuil confort', 'Fauteuil coquille'];
export const MODE_DEPL = ['Seul', 'Accompagné', 'Variable'];
export const INSTALL_SIESTE = ['Oui au lit', 'Oui au fauteuil'];

export const RISQUES = ['Fugue', 'Chute', 'Addiction', 'Dénutrition', 'Fausse route', 'Sexualité', 'Suicide', 'Harcèlement / Abus de faiblesse', 'Radicalisation'];

export const CONTENTION_MOMENTS = ['Jour', 'Nuit', '24h/24'];
export const CONTENTION_TYPES = [
  { key: 'barrieres', label: 'Barrières de lit' },
  { key: 'grenouillere', label: 'Grenouillère' },
  { key: 'coquille', label: 'Fauteuil coquille' },
  { key: 'ceinture', label: 'Ceinture' }
];

export const PROT_JURIDIQUE = ['Aucune', 'Tutelle', 'Curatelle simple', 'Curatelle renforcée'];

export const TABS = [
  { id: 'nursing', label: 'Nursing', icon: '🛁' },
  { id: 'alimentation', label: 'Alimentation', icon: '🍽️' },
  { id: 'deplacements', label: 'Déplacements', icon: '🚶' },
  { id: 'risques', label: 'Risques', icon: '⚠️' },
  { id: 'juridique', label: 'Protection juridique', icon: '⚖️' },
  { id: 'particularites', label: 'Particularités', icon: '📝' }
];
