import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  parseSheetJson,
  fetchSheetConfig,
  DEFAULT_SHEET_URL,
  DEFAULT_SHEET_CODES,
} from '../services/timetable';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DAYS = [
  { key: 1, label: 'Monday' },
  { key: 2, label: 'Tuesday' },
  { key: 3, label: 'Wednesday' },
  { key: 4, label: 'Thursday' },
  { key: 5, label: 'Friday' },
  { key: 6, label: 'Saturday' },
];

const STORAGE_KEYS = {
  day: 'classrooms_selectedDay2',
  time: 'classrooms_selectedTime2',
  slots: 'classrooms_timeSlots2',
};

const safeParse = (value, fallback) => {
  if (value == null) return fallback;
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
};

const getRoomType = (roomName) => {
  const name = roomName.toLowerCase();
  if (name.includes('lab') || name.includes('computer')) return 'Computer Lab';
  if (name.includes('lec') || name.includes('lecture')) return 'Lecture Hall';
  if (name.includes('phy') || name.includes('physics')) return 'Physics Lab';
  if (name.includes('sem') || name.includes('seminar')) return 'Seminar Room';
  if (name.includes('lib') || name.includes('library')) return 'Library Hall';
  if (name.includes('aud') || name.includes('auditorium')) return 'Auditorium';
  return 'Classroom';
};

const getRoomCapacity = (roomName) => {
  const match = roomName.match(/\((\d+)\)/);
  if (match) return parseInt(match[1], 10);
  const defaults = {
    'Computer Lab': 30,
    'Lecture Hall': 50,
    'Physics Lab': 25,
    'Seminar Room': 20,
    'Library Hall': 100,
    'Auditorium': 200,
  };
  return defaults[getRoomType(roomName)] ?? 40;
};

const getCleanRoomName = (roomName) => roomName.replace(/\s*\(\d+\)/, '').trim();

const getRoomFloor = (roomName) => {
  const name = roomName.toLowerCase();
  if (/(^|\s)g(round)?/i.test(name) || /ground/i.test(name)) return 'Ground Floor';
  if (name.includes('3')) return '3rd Floor';
  if (name.includes('2')) return '2nd Floor';
  if (name.includes('1')) return '1st Floor';
  return 'Unknown Floor';
};

const getRoomTypeIcon = (type) => {
  const icons = {
    'Computer Lab': 'fas fa-desktop',
    'Lecture Hall': 'fas fa-chalkboard-teacher',
    'Physics Lab': 'fas fa-flask',
    'Seminar Room': 'fas fa-users',
    'Library Hall': 'fas fa-book',
    'Auditorium': 'fas fa-theater-masks',
  };
  return icons[type] || 'fas fa-door-open';
};

const getRoomTypeColor = (type) => {
  const colors = {
    'Computer Lab': '#3498db',
    'Lecture Hall': '#e74c3c',
    'Physics Lab': '#f39c12',
    'Seminar Room': '#9b59b6',
    'Library Hall': '#27ae60',
    'Auditorium': '#e67e22',
  };
  return colors[type] || '#95a5a6';
};

const Classrooms = () => {
  const [selectedDay, setSelectedDay] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.day);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEYS.time), null);
    return saved || ['09:00-10:00'];
  });
  const [freeRooms, setFreeRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTimeSlots, setAllTimeSlots] = useState(() =>
    safeParse(localStorage.getItem(STORAGE_KEYS.slots), [])
  );
  const [searchText, setSearchText] = useState('');
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [configReady, setConfigReady] = useState(false);

  const sheetUrl = useRef(DEFAULT_SHEET_URL);
  const sheetsPageCodes = useRef(DEFAULT_SHEET_CODES);
  const mounted = useRef(true);
  const fetchSeq = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Persist selections
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.day, selectedDay.toString());
  }, [selectedDay]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.time, JSON.stringify(selectedTime));
  }, [selectedTime]);
  useEffect(() => {
    if (allTimeSlots.length > 0) {
      localStorage.setItem(STORAGE_KEYS.slots, JSON.stringify(allTimeSlots));
    }
  }, [allTimeSlots]);

  // Load sheet config once
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
      } catch (err) {
        console.log(err);
        sheetUrl.current = localStorage.getItem('url') || DEFAULT_SHEET_URL;
        sheetsPageCodes.current = safeParse(localStorage.getItem('cod'), DEFAULT_SHEET_CODES);
      }
      if (!cancelled) setConfigReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const findFreeRooms = useCallback(async (forceRefresh = false) => {
    if (!configReady) return;

    const seq = ++fetchSeq.current;
    const apply = (rooms) => {
      if (!mounted.current || seq !== fetchSeq.current) return;
      setFreeRooms(rooms);
      setFilteredRooms(rooms);
      setLoading(false);
    };

    const cacheKey = `classrooms_data_${selectedDay}_${selectedTime.join('_')}`;
    const readCache = () => {
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      if (!forceRefresh && cachedData && cacheTimestamp) {
        const parsed = safeParse(cachedData, null);
        // Never serve or cache empty results - a transient failure must
        // not mask a genuinely free room for 5 minutes.
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Date.now() - parseInt(cacheTimestamp, 10) < CACHE_DURATION
            ? parsed
            : null;
        }
      }
      return null;
    };

    setLoading(true);
    const cached = readCache();
    if (cached) {
      apply(cached);
      return;
    }

    const selectedDayData = DAYS.find((d) => d.key === selectedDay);
    const daySheet = sheetsPageCodes.current.find(
      (code) => code.name.toLowerCase() === selectedDayData?.label.toLowerCase()
    );

    if (!daySheet) {
      apply([]);
      return;
    }

    try {
      const response = await fetch(sheetUrl.current + daySheet.gid);
      const text = await response.text();
      const rows = parseSheetJson(text);

      // Time slots come from the header row.
      const timeSlots = [];
      if (rows[1] && rows[1].c) {
        rows[1].c.forEach((cell, colIndex) => {
          if (cell && cell.v && colIndex > 0) timeSlots.push(cell.v);
        });
      }
      setAllTimeSlots(timeSlots);

      // If the persisted selection doesn't exist in this sheet, fall back
      // to the first available slot so the view is never empty on load.
      const validSelections = selectedTime.filter((t) => timeSlots.includes(t));
      const chosenSelections = validSelections.length > 0 ? validSelections : (timeSlots[0] ? [timeSlots[0]] : []);
      if (chosenSelections.length === 0) {
        apply([]);
        return;
      }
      const timeColumnIndices = chosenSelections.map((selTime) =>
        rows[1].c.findIndex((cell, index) => cell && cell.v === selTime && index > 0)
      );

      // Mark lab slots occupied across their 3-column span.
      const occupiedSlots = new Map();
      rows.forEach((row, rowIndex) => {
        if (rowIndex <= 2 || !row.c || !row.c[0]?.v) return;
        const isLabRoom = getRoomType(row.c[0].v).toLowerCase().includes('lab');
        row.c.forEach((cell, colIndex) => {
          if (colIndex > 0 && cell && cell.v && cell.v.trim() !== '') {
            if (isLabRoom || cell.v.toLowerCase().includes('lab')) {
              for (let i = 0; i < 3; i++) {
                if (colIndex + i < row.c.length) {
                  occupiedSlots.set(`${rowIndex}-${colIndex + i}`, true);
                }
              }
            }
          }
        });
      });

      const freeRoomsList = [];
      rows.forEach((row, rowIndex) => {
        if (rowIndex <= 2 || !row.c || !row.c[0]?.v) return;
        const roomName = row.c[0].v;
        const roomType = getRoomType(roomName);
        const freeTimes = [];
        for (let t = 0; t < timeColumnIndices.length; t++) {
          const timeColumnIndex = timeColumnIndices[t];
          if (timeColumnIndex === -1) continue;
          const cell = row.c[timeColumnIndex];
          const hasRegularClass = cell && cell.v && cell.v.trim() !== '' && !cell.v.toLowerCase().includes('lab');
          if (!occupiedSlots.has(`${rowIndex}-${timeColumnIndex}`) && !hasRegularClass) {
            freeTimes.push(chosenSelections[t]);
          }
        }
        if (freeTimes.length > 0) {
          freeRoomsList.push({
            id: rowIndex,
            name: getCleanRoomName(roomName),
            originalName: roomName,
            type: roomType,
            capacity: getRoomCapacity(roomName),
            floor: getRoomFloor(roomName),
            freeTimes,
          });
        }
      });

      apply(freeRoomsList);
      if (freeRoomsList.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(freeRoomsList));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        } catch { /* storage full - non-fatal */ }
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
      // Fall back to any cached copy (ignore expiry) on failure.
      apply(safeParse(localStorage.getItem(cacheKey), []));
    }
  }, [selectedDay, selectedTime, configReady]);

  // Trigger a fetch once config is ready and whenever the selection changes.
  useEffect(() => {
    if (configReady) {
      findFreeRooms();
    }
  }, [configReady, findFreeRooms]);

  // Search filter
  const handleSearch = useCallback((searchValue) => {
    let filtered = [...freeRooms];
    const query = searchValue.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        room.floor.toLowerCase().includes(query)
      );
    }
    setFilteredRooms(filtered);
  }, [freeRooms]);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, freeRooms, handleSearch]);

  return (
    <div className="classrooms-container">
      <div className="box">
        <h1><i className="fas fa-door-open"></i> Free Classrooms</h1>
        <p>Find available classrooms for any day and time</p>

        <div className='all-days'>
          <div className="day-filter">
            {DAYS.map((day) => (
              <div
                key={day.key}
                role="button"
                tabIndex={0}
                aria-pressed={selectedDay === day.key}
                className={selectedDay === day.key ? 'day-filter-item active' : 'day-filter-item'}
                onClick={() => setSelectedDay(day.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDay(day.key); } }}
              >
                {day.label}
              </div>
            ))}
          </div>
        </div>

        <div className="search-box classroom-filter-box">
          <div className="search-row">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search rooms by name, type, or floor..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />

            <button
              className='filter-toggle-btn'
              onClick={() => setShowTimeFilter(!showTimeFilter)}
              title={showTimeFilter ? 'Hide Time Filter' : 'Show Time Filter'}
              aria-expanded={showTimeFilter}
            >
              <i className={`fas fa-clock ${showTimeFilter ? 'active' : ''}`}></i>
            </button>
          </div>

          {showTimeFilter && (
            <div className="time-row">
              <i className="fa fa-clock"></i>
              <div className="time-checkboxes">
                {allTimeSlots.length > 0 ? (
                  allTimeSlots.map((time) => (
                    <label key={time} style={{ marginRight: '10px' }}>
                      <input
                        type="checkbox"
                        value={time}
                        checked={selectedTime.includes(time)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTime((prev) => [...prev, time]);
                          } else {
                            setSelectedTime((prev) => prev.filter((t) => t !== time));
                          }
                        }}
                      />
                      {time}
                    </label>
                  ))
                ) : (
                  <span>Loading time slots...</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && freeRooms.length > 0 && (
        <div className="results-counter">
          <p>
            Showing {filteredRooms.length} of {freeRooms.length} free rooms
            {searchText && ` for "${searchText}"`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Finding available rooms...</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <div
                    className="room-icon"
                    style={{ color: getRoomTypeColor(room.type) }}
                  >
                    <i className={getRoomTypeIcon(room.type)}></i>
                  </div>
                  <div className="room-info">
                    <h3 className="room-name">{room.name}</h3>
                    <p className="room-type">{room.type}</p>
                  </div>
                  <div className="room-status">
                    <span className="status-badge free">FREE</span>
                  </div>
                </div>

                <div className="room-details">
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>Capacity: {room.capacity}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-day"></i>
                    <span>{DAYS.find((d) => d.key === selectedDay)?.label}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{(room.freeTimes || []).join(', ')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className={searchText ? 'fas fa-search' : 'fas fa-door-closed'}></i>
              <h3>
                {searchText
                  ? 'No matching rooms found'
                  : freeRooms.length === 0
                    ? 'No rooms available'
                    : 'No rooms match your filters'}
              </h3>
              <p>
                {searchText
                  ? `No rooms match "${searchText}". Try a different search term.`
                  : freeRooms.length === 0
                    ? 'All classrooms are occupied at this time. Try a different time slot.'
                    : 'Try adjusting your filters or search criteria.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Classrooms;
