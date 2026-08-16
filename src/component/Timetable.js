import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Classes from './Classes';
import AddClassesPopup from './AddClassesPopup';
import Search from './Search';
import ToggleMyClasses from './ToggleMyClasses';
import {
  fetchSheetConfig,
  fetchAllDaySheets,
  loadCachedClasses,
  loadSavedClasses,
  saveCachedClasses,
  safeParse,
  sortByTime,
  DEFAULT_SHEET_URL,
  DEFAULT_SHEET_CODES,
} from '../services/timetable';

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getEffectiveDay = () => {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) return CLASS_DAYS[0]; // Sunday -> next class day is Monday
  const todayIndex = day - 1; // Monday=0 ... Saturday=5
  return CLASS_DAYS[now.getHours() >= 16 ? (todayIndex + 1) % CLASS_DAYS.length : todayIndex];
};

const Timetable = ({ loading, setLoading, showNotification }) => {
  const [data, setData] = useState([]);
  const [savedClasses, setSavedClasses] = useState(() => loadSavedClasses());
  const [Filter, setFilter] = useState(() => getEffectiveDay());
  const [showMyClasses, setShowMyClasses] = useState(true);
  const [showAddClassesPopup, setShowAddClassesPopup] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');

  const [startY, setStartY] = useState(0);
  const [isPulled, setIsPulled] = useState(false);

  const showMyRef = useRef(showMyClasses);
  const sheetUrl = useRef(DEFAULT_SHEET_URL);
  const sheetsPageCodes = useRef(DEFAULT_SHEET_CODES);
  const configLoaded = useRef(false);
  const mounted = useRef(true);
  const fetchSeq = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Roll the filter over to the next day once the clock passes 4pm.
  useEffect(() => {
    let lastDay = getEffectiveDay();
    const check = () => {
      const nextDay = getEffectiveDay();
      if (nextDay !== lastDay) {
        lastDay = nextDay;
        setFilter(nextDay);
      }
    };
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Filter + sort a full day-sheet payload against the saved classes / query.
  const buildView = useCallback((daySheets, sec, onlyMyClasses) => {
    const query = (sec || '').toLowerCase();
    return daySheets.map((day) => {
      const classes = day.classes.filter((cl) => {
        const val = cl.val.toLowerCase();
        if (showMyRef.current) {
          return savedClasses.some((each) => val.includes(String(each.val).toLowerCase()));
        }
        if (onlyMyClasses) return val.includes(query);
        return (
          val.includes(query) ||
          cl.location.toLowerCase().includes(query) ||
          cl.slot.toLowerCase().includes(query)
        );
      });
      return { ...day, classes: sortByTime(classes) };
    });
  }, [savedClasses]);

  const getAllData = useCallback(async (sec, onlyMyClasses) => {
    if (!configLoaded.current) return;
    const seq = ++fetchSeq.current;
    setLoading(true);

    const apply = (daySheets) => {
      if (!mounted.current || seq !== fetchSeq.current) return;
      setData(buildView(daySheets, sec, onlyMyClasses));
      setLoading(false);
    };

    try {
      const daySheets = await fetchAllDaySheets(sheetUrl.current, sheetsPageCodes.current);
      saveCachedClasses(daySheets);
      apply(daySheets);
    } catch (err) {
      console.error(err);
      const cached = loadCachedClasses();
      if (cached.length > 0) {
        apply(cached);
        showNotification('Network error: showing data from previous session', null);
      } else {
        showNotification('Network error', 'red');
        setLoading(false);
      }
    }
  }, [buildView, setLoading, showNotification]);

  // Apply cached day-sheets when the config fetch itself failed.
  const applyFromCache = useCallback((cached) => {
    const seq = ++fetchSeq.current;
    if (!mounted.current) return;
    setData(buildView(cached, '', true));
    setLoading(false);
    showNotification('Network error: showing data from previous session', null);
  }, [buildView, setLoading, showNotification]);

  // Load sheet config once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchSheetConfig();
        if (cancelled) return;
        sheetUrl.current = json.url || DEFAULT_SHEET_URL;
        sheetsPageCodes.current = json.codes.length > 0 ? json.codes : DEFAULT_SHEET_CODES;
        localStorage.setItem('url', sheetUrl.current);
        localStorage.setItem('cod', JSON.stringify(sheetsPageCodes.current));
      } catch {
        sheetUrl.current = localStorage.getItem('url') || DEFAULT_SHEET_URL;
        sheetsPageCodes.current = safeParse(localStorage.getItem('cod'), DEFAULT_SHEET_CODES);
      }
      configLoaded.current = true;
      if (!cancelled) {
        if (!sheetUrl.current || sheetsPageCodes.current.length === 0) {
          const cached = loadCachedClasses();
          if (cached.length > 0) {
            applyFromCache(cached);
          } else {
            showNotification('Network error', 'red');
            setLoading(false);
          }
        } else {
          getAllData('', true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [getAllData, loadCachedClasses, setLoading, showNotification]);

  // Pull-to-refresh handlers.
  const handleTouchStart = (event) => {
    if (window.scrollY === 0) setStartY(event.touches[0].clientY);
  };
  const handleTouchMove = (event) => {
    if (window.scrollY === 0) {
      const currentY = event.touches[0].clientY;
      if (currentY - startY > 50) setIsPulled(true);
    }
  };
  const handleTouchEnd = () => {
    if (isPulled && !loading) getAllData(searchTxt, searchTxt ? true : false);
    setIsPulled(false);
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  });

  const handleShowMyClasses = (val) => {
    setShowMyClasses(val);
    showMyRef.current = val;
    getAllData(val ? '' : searchTxt, val);
  };

  const toggleMyClasses = useMemo(() => (
    <ToggleMyClasses toggle={showMyClasses} setToggle={handleShowMyClasses} />
  ), [showMyClasses, searchTxt]);

  const dayFilters = useMemo(() => {
    if (data.length === 0) return null;
    const items = [];
    if (Filter === 'All' || data.length > 0) {
      items.push(
        <div
          key="all"
          role="button"
          tabIndex={0}
          aria-pressed={Filter === 'All'}
          className={Filter === 'All' ? 'day-filter-item active' : 'day-filter-item'}
          onClick={() => setFilter('All')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilter('All'); } }}
        >
          All
        </div>
      );
    }
    data.forEach((d, index) => {
      items.push(
        <div
          key={'day' + index}
          role="button"
          tabIndex={0}
          aria-pressed={Filter.toLowerCase() === d.sheet.toLowerCase()}
          className={Filter.toLowerCase() === d.sheet.toLowerCase() ? 'day-filter-item active' : 'day-filter-item'}
          onClick={() => setFilter(d.sheet)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilter(d.sheet); } }}
        >
          {d.sheet}
        </div>
      );
    });
    return items;
  }, [data, Filter]);

  return (
    <>
      <Search
        heading="Fast Timetable"
        searchHelpTxt="Search for your class, specific teacher, specific subject"
        example="e.g. bcs-3a, basit ali, coal"
        getData={getAllData}
        searchTxt={searchTxt}
        setSearchTxt={setSearchTxt}
      />
      {loading && <div className="loader"></div>}
      <ToggleMyClasses toggle={showMyClasses} setToggle={handleShowMyClasses} />
      <div className="all-days">
        <div className="day-filter">{dayFilters}</div>

        {showMyClasses && (
          <div
            className="empty-action-btn"
            role="button"
            tabIndex={0}
            onClick={() => setShowAddClassesPopup(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAddClassesPopup(true); } }}
          >
            <i className="fa fa-plus t-w"></i>
            Add My Classes
          </div>
        )}

        {showMyClasses && savedClasses.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">
              <i className="fa fa-calendar-plus"></i>
            </div>
            <h3>No Classes Added</h3>
            <p>Start by adding your classes to see your personalized timetable</p>
            <div
              className="empty-action-btn"
              role="button"
              tabIndex={0}
              onClick={() => setShowAddClassesPopup(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAddClassesPopup(true); } }}
            >
              <i className="fa fa-plus t-w"></i>
              Add Classes
            </div>
          </div>
        ) : (
          data
            .filter((d) => Filter === 'All' || Filter.toLowerCase() === d.sheet.toLowerCase())
            .map((d, index) => (
              <React.Fragment key={'day' + index}>
                <div className="day">{d.sheet}</div>
                <Classes data={d.classes} />
              </React.Fragment>
            ))
        )}
      </div>

      {showAddClassesPopup && (
        <AddClassesPopup
          setShowAddClassesPopup={setShowAddClassesPopup}
          savedClasses={savedClasses}
          setSavedClasses={setSavedClasses}
          getData={getAllData}
          showNotification={showNotification}
        />
      )}
    </>
  );
};

export default Timetable;
