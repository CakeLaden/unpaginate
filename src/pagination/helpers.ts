export function fillUrlTemplate(template: string, page: number): string {
  return template.replaceAll("{page}", String(page));
}

export function nextParamUrl(
  currentUrl: string,
  param: string,
  step: number,
  start: number
): string {
  const u = new URL(currentUrl);
  const raw = u.searchParams.get(param);
  const current = raw === null ? start : Number.parseInt(raw, 10);
  const next = (Number.isNaN(current) ? start : current) + step;
  u.searchParams.set(param, String(next));
  return u.toString();
}
