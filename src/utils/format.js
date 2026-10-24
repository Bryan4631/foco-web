// Fecha de hoy en formato YYYY-MM-DD (hora local, no UTC)
export const hoy = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// "2026-10-28" -> "28/10/2026"
export const fmtFecha = (f) => {
  if (!f) return '—';
  const [y, m, d] = String(f).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// Acepta "08:00", "08:00:00" o "2000-01-01T08:00:00.000Z" y devuelve "08:00"
export const fmtHora = (h) => {
  if (!h) return '';
  const s = String(h);
  return s.includes('T') ? s.slice(11, 16) : s.slice(0, 5);
};
