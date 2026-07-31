// IMPORTANT : ces composants sont definis au niveau module (hors de tout composant parent).
// Les definir a l'interieur d'un composant ferait perdre le focus a chaque frappe.

export function Select({ label, value, onChange, options, placeholder = '— non renseigné —' }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <select className="inp" value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input
        className="inp"
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <textarea
        className="inp"
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 pt-6">
      <input
        type="checkbox"
        id={`tg-${label}`}
        checked={!!value}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-amber-600"
      />
      <label htmlFor={`tg-${label}`} className="text-sm text-gray-700 cursor-pointer">{label}</label>
    </div>
  );
}

export function ChipGroup({ label, values, onChange, options }) {
  const list = values || [];
  const toggle = (opt, on) => onChange(on ? [...list, opt] : list.filter(v => v !== opt));
  return (
    <div>
      <label className="lbl">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <label key={o} className={`chip ${list.includes(o) ? 'chip-on' : 'chip-off'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={list.includes(o)}
              onChange={e => toggle(o, e.target.checked)}
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export function Section({ title, children, cols = 2 }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      {title && <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>}
      <div className={`grid gap-4 ${cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : ''}`}>
        {children}
      </div>
    </div>
  );
}
