/**
 * Timetable data service.
 * Centralizes fetching, parsing and caching of the Google-Sheets-backed
 * timetable payloads used by App, Timetable and Classrooms.
 */

export const SHEET_CONFIG_URL = 'https://sahillatif0.github.io/mnoprs/abc.json';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1A1p89c0EsncL7GHHaAZOP5YdWnEVLFvMuBGjAQJSLo0/gviz/tq?tqx=out:json&gid=';

export const DEFAULT_SHEET_CODES = [
  { name: 'MONDAY', gid: '696071600' },
  { name: 'TUESDAY', gid: '1510874776' },
  { name: 'WEDNESDAY', gid: '834541199' },
  { name: 'THURSDAY', gid: '168974244' },
  { name: 'FRIDAY', gid: '1080238006' },
  { name: 'SATURDAY', gid: '985885879' },
];

/**
 * The config JSON can carry codes as an array of {name, gid} or an object
 * mapping {MONDAY: gid}. Normalize both to the array shape used downstream.
 */
export const normalizeSheetCodes = (codes) => {
  if (Array.isArray(codes)) return codes;
  if (codes && typeof codes === 'object') {
    return Object.entries(codes).map(([name, gid]) => ({ name, gid: String(gid) }));
  }
  return [];
};

// Google Sheets JSONP responses are wrapped as `/*O_o*/\n<json>*/`.
// Strip the prefix/suffix instead of relying on magic offsets.
const stripJsonpWrapper = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Invalid sheet response: no JSON object found');
  }
  return text.slice(start, end + 1);
};

export const parseSheetJson = (text) => {
  const json = JSON.parse(stripJsonpWrapper(text));
  if (!json.table || !Array.isArray(json.table.rows)) {
    throw new Error('Invalid sheet response: missing table.rows');
  }
  return json.table.rows;
};

export const safeParse = (value, fallback) => {
  if (value == null) return fallback;
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

export const fetchSheetConfig = async () => {
  const res = await fetch(SHEET_CONFIG_URL);
  const json = await res.json();
  if (!json.karachi) throw new Error('Missing karachi config in data response');
  const codes = normalizeSheetCodes(json.karachi.codes);
  return {
    url: json.karachi.url || DEFAULT_SHEET_URL,
    codes: codes.length > 0 ? codes : DEFAULT_SHEET_CODES,
  };
};

/**
 * Fetch and parse every day sheet in parallel.
 * Returns an array of `{ sheet, classes }` where each class is
 * `{ val, location, slot, time }` with `time` normalized to a sortable "HH:MM".
 */
export const fetchAllDaySheets = async (sheetUrl, sheetsPageCodes) => {
  const daySheets = await Promise.all(
    sheetsPageCodes.map(async (code) => {
      const res = await fetch(sheetUrl + code.gid);
      const text = await res.text();
      const rows = parseSheetJson(text);

      const classes = [];
      rows.forEach((row, rowIndex) => {
        if (rowIndex <= 2 || !Array.isArray(row.c)) return;
        const location = row.c[0]?.v || '';
        row.c.forEach((cell, colIndex) => {
          if (colIndex === 0 || !cell || !cell.v) return;
          const val = String(cell.v);
          let slot = rows[1]?.c?.[colIndex]?.v || '';
          if (val.toLowerCase().includes('lab')) {
            const endTime = rows[1]?.c?.[colIndex + 2]?.v?.split('-')[1];
            if (endTime) slot = `${slot.split('-')[0]}-${endTime}`;
          }
          classes.push({ val, location, slot, time: normalizeTime(slot) });
        });
      });

      return { sheet: code.name, classes };
    })
  );
  return daySheets;
};

/**
 * "9:00" or "09:00" -> "09:00". Slots before 7am are assumed to be PM
 * (FAST runs labs in the evening), so 5:00 -> 17:00.
 */
export const normalizeTime = (slot) => {
  if (!slot) return '';
  const time = slot.split('-')[0];
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return '';
  if (hour < 7) hour += 12;
  return `${String(hour).padStart(2, '0')}:${(minuteStr || '00').padStart(2, '0')}`;
};

export const sortByTime = (classes) =>
  [...classes].sort((a, b) => {
    if (a.time === b.time) return 0;
    return a.time < b.time ? -1 : 1;
  });

const CACHE_KEY = 'allClasses';
const SAVED_CLASSES_KEY = 'savedClasses';

export const loadCachedClasses = () => safeParse(localStorage.getItem(CACHE_KEY), []);

export const saveCachedClasses = (daySheets) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(daySheets));
  } catch {
    // Storage full or unavailable - non-fatal
  }
};

export const loadSavedClasses = () => safeParse(localStorage.getItem(SAVED_CLASSES_KEY), []);
