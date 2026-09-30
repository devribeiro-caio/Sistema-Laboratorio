export const limparCnpj = (v = '') => String(v).replace(/\D/g, '');

export function cnpjValido(valor) {
  const c = limparCnpj(valor);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (base) => {
    let soma = 0, peso = base.length - 7;
    for (const d of base) { soma += d * peso--; if (peso < 2) peso = 9; }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12));
  const d2 = calc(c.slice(0, 12) + d1);
  return c.endsWith(`${d1}${d2}`);
}
