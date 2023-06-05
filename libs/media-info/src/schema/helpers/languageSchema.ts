import z from 'zod'

export const languageSchema = z
  .string()
  .transform((e) => e.toLowerCase().split('-')[0]!)
  .transform((e) => iso639ConversionMap[e] ?? e)
  .pipe(
    z.enum([
      'ara',
      'bul',
      'cat',
      'cze',
      'dan',
      'dut',
      'eng',
      'enm',
      'est',
      'eus',
      'fil',
      'fin',
      'fra',
      'ger',
      'glg',
      'gre',
      'heb',
      'hin',
      'hrv',
      'hun',
      'ice',
      'ind',
      'ita',
      'jpn',
      'kan',
      'kor',
      'lav',
      'lit',
      'mal',
      'may',
      'nob',
      'nor',
      'pol',
      'por',
      'ron',
      'rus',
      'slk',
      'slv',
      'spa',
      'swe',
      'tam',
      'tel',
      'tha',
      'tur',
      'ukr',
      'unk',
      'vie',
      'zho',
      'zxx',
    ])
  )
  .default('unk')

const iso639ConversionMap: Record<string, string> = {
  aa: 'aar',
  ab: 'abk',
  af: 'afr',
  ak: 'aka',
  sq: 'alb',
  am: 'amh',
  ar: 'ara',
  an: 'arg',
  hy: 'hye',
  as: 'asm',
  av: 'ava',
  ae: 'ave',
  ay: 'aym',
  az: 'aze',
  ba: 'bak',
  bm: 'bam',
  eu: 'eus',
  be: 'bel',
  bn: 'ben',
  bh: 'bih',
  bi: 'bis',
  bo: 'tib',
  bs: 'bos',
  br: 'bre',
  bg: 'bul',
  my: 'mya',
  ca: 'cat',
  cs: 'cze',
  ch: 'cha',
  ce: 'che',
  zh: 'zho',
  cu: 'chu',
  cv: 'chv',
  kw: 'cor',
  co: 'cos',
  cr: 'cre',
  cy: 'wel',
  da: 'dan',
  de: 'ger',
  dv: 'div',
  nl: 'dut',
  dz: 'dzo',
  el: 'gre',
  en: 'eng',
  eo: 'epo',
  et: 'est',
  ee: 'ewe',
  fo: 'fao',
  fa: 'per',
  fj: 'fij',
  fi: 'fin',
  fr: 'fra',
  fy: 'fry',
  ff: 'ful',
  ka: 'geo',
  gd: 'gla',
  ga: 'gle',
  gl: 'glg',
  gv: 'glv',
  gn: 'grn',
  gu: 'guj',
  ht: 'hat',
  ha: 'hau',
  he: 'heb',
  hz: 'her',
  hi: 'hin',
  ho: 'hmo',
  hr: 'hrv',
  hu: 'hun',
  ig: 'ibo',
  is: 'ice',
  io: 'ido',
  ii: 'iii',
  iu: 'iku',
  ie: 'ile',
  ia: 'ina',
  id: 'ind',
  ik: 'ipk',
  it: 'ita',
  jv: 'jav',
  ja: 'jpn',
  kl: 'kal',
  kn: 'kan',
  ks: 'kas',
  kr: 'kau',
  kk: 'kaz',
  km: 'khm',
  ki: 'kik',
  rw: 'kin',
  ky: 'kir',
  kv: 'kom',
  kg: 'kon',
  ko: 'kor',
  kj: 'kua',
  ku: 'kur',
  lo: 'lao',
  la: 'lat',
  lv: 'lav',
  li: 'lim',
  ln: 'lin',
  lt: 'lit',
  lb: 'ltz',
  lu: 'lub',
  lg: 'lug',
  mk: 'mkd',
  mh: 'mah',
  ml: 'mal',
  mi: 'mri',
  mr: 'mar',
  ms: 'may',
  mg: 'mlg',
  mt: 'mlt',
  mn: 'mon',
  na: 'nau',
  nv: 'nav',
  nr: 'nbl',
  nd: 'nde',
  ng: 'ndo',
  ne: 'nep',
  nn: 'nno',
  nb: 'nob',
  no: 'nor',
  ny: 'nya',
  oc: 'oci',
  oj: 'oji',
  or: 'ori',
  om: 'orm',
  os: 'oss',
  pa: 'pan',
  pi: 'pli',
  pl: 'pol',
  pt: 'por',
  ps: 'pus',
  qu: 'que',
  rm: 'roh',
  ro: 'ron',
  rn: 'run',
  ru: 'rus',
  sg: 'sag',
  sa: 'san',
  si: 'sin',
  sk: 'slk',
  sl: 'slv',
  se: 'sme',
  sm: 'smo',
  sn: 'sna',
  sd: 'snd',
  so: 'som',
  st: 'sot',
  es: 'spa',
  sc: 'srd',
  sr: 'srp',
  ss: 'ssw',
  su: 'sun',
  sw: 'swa',
  sv: 'swe',
  ty: 'tah',
  ta: 'tam',
  tt: 'tat',
  te: 'tel',
  tg: 'tgk',
  tl: 'tgl',
  th: 'tha',
  ti: 'tir',
  to: 'ton',
  tn: 'tsn',
  ts: 'tso',
  tk: 'tuk',
  tr: 'tur',
  tw: 'twi',
  ug: 'uig',
  uk: 'ukr',
  ur: 'urd',
  uz: 'uzb',
  ve: 'ven',
  vi: 'vie',
  vo: 'vol',
  wa: 'wln',
  wo: 'wol',
  xh: 'xho',
  yi: 'yid',
  yo: 'yor',
  za: 'zha',
  zu: 'zul',
}
