import React, { useState, useEffect, useRef } from 'react';

const Classrooms = () => {
    const [selectedDay, setSelectedDay] = useState(1); 
    const [selectedTime, setSelectedTime] = useState('09:00-10:00');
    const [freeRooms, setFreeRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [showTimeFilter, setShowTimeFilter] = useState(false);
    
    const sheetUrl = useRef('');
    const sheetsPageCodes = useRef([]);
    const fetchedData = useRef(false);

    const days = [
        { key: 1, label: 'Monday' },
        { key: 2, label: 'Tuesday' },
        { key: 3, label: 'Wednesday' },
        { key: 4, label: 'Thursday' },
        { key: 5, label: 'Friday' },

    ];

    // Initialize data source (same as timetable)
    useEffect(() => {
        const fetchSheetData = async () => {
            try {
                const response = await fetch("https://server-timetable2.vercel.app/data");
                const text = await response.text();
                const json = JSON.parse(text);
                sheetUrl.current = json.karachi.url;
                sheetsPageCodes.current = json.karachi.codes;
                localStorage.setItem('url', json.karachi.url);
                localStorage.setItem('cod', JSON.stringify(json.karachi.codes));
            } catch (err) {
                console.log(err);
                sheetUrl.current = localStorage.getItem('url');
                sheetsPageCodes.current = JSON.parse(localStorage.getItem('cod'));
            }
        };
        
        const initializeData = async () => {
            await fetchSheetData();
            fetchedData.current = true;
        };
        
        initializeData();
    }, []);

    // Fetch free rooms data from the same source as timetable
    const findFreeRooms = async () => {
        if (!fetchedData.current) return;
        
        setLoading(true);
        
        try {
            const selectedDayData = days.find(d => d.key === selectedDay);
            const daySheet = sheetsPageCodes.current.find(code => 
                code.name.toLowerCase() === selectedDayData.label.toLowerCase()
            );
            
            if (!daySheet) {
                setFreeRooms([]);
                setLoading(false);
                return;
            }

            const response = await fetch(sheetUrl.current + daySheet.gid);
            const text = await response.text();
            const json = JSON.parse(text.substr(47).slice(0, -2));
            const rows = json.table.rows;
            
            // Extract time slots from column headers (row 1)
            const timeSlots = [];
            if (rows[1] && rows[1].c) {
                rows[1].c.forEach((cell, colIndex) => {
                    if (cell && cell.v && colIndex > 0) {
                        timeSlots.push(cell.v);
                    }
                });
            }
            setAllTimeSlots(timeSlots);
            
            // Set default time slot if none selected and time slots are available
            if (timeSlots.length > 0 && selectedTime === '09:00-10:00' && !timeSlots.includes(selectedTime)) {
                setSelectedTime(timeSlots[0]);
                return; // Return early, useEffect will trigger again with new time
            }
            
            // Find the column index for the selected time slot
            const timeColumnIndex = rows[1].c.findIndex((cell, index) => 
                cell && cell.v === selectedTime && index > 0
            );
            
            if (timeColumnIndex === -1) {
                setFreeRooms([]);
                setLoading(false);
                return;
            }

            const freeRoomsList = [];
            const occupiedSlots = new Map(); 
            
            rows.forEach((row, rowIndex) => {
                if (rowIndex > 2 && row.c && row.c[0] && row.c[0].v) {
                    const roomName = row.c[0].v;
                    const roomType = getRoomType(roomName);
                    const isLabRoom = roomType.toLowerCase().includes('lab');
                    
                    row.c.forEach((cell, colIndex) => {
                        if (colIndex > 0 && cell && cell.v && cell.v.trim() !== '') {
                            const sessionContent = cell.v.toLowerCase();
                            const isLabSession = isLabRoom || sessionContent.includes('lab');
                            
                            if (isLabSession) {
                                for (let i = 0; i < 3; i++) {
                                    const occupiedSlotIndex = colIndex + i;
                                    if (occupiedSlotIndex < row.c.length) {
                                        const key = `${rowIndex}-${occupiedSlotIndex}`;
                                        occupiedSlots.set(key, true);
                                    }
                                }
                            }
                        }
                    });
                }
            });
            
            // Second pass: Check for free rooms
            rows.forEach((row, rowIndex) => {
                if (rowIndex > 2 && row.c && row.c[0] && row.c[0].v) {
                    const roomName = row.c[0].v;
                    const roomType = getRoomType(roomName);
                    
                    // Check if the time slot is marked as occupied by any lab session
                    const key = `${rowIndex}-${timeColumnIndex}`;
                    const isOccupiedByLab = occupiedSlots.has(key);
                    
                    // For any room, also check if there's a regular (non-lab) class at this exact time
                    const cell = row.c[timeColumnIndex];
                    const hasRegularClass = cell && cell.v && cell.v.trim() !== '' && !cell.v.toLowerCase().includes('lab');
                    
                    // Room is free if it's not occupied by lab sessions AND doesn't have regular classes
                    const isFree = !isOccupiedByLab && !hasRegularClass;
                    
                    // If the room is free, add it to the list
                    if (isFree) {
                        freeRoomsList.push({
                            id: rowIndex,
                            name: getCleanRoomName(roomName),
                            originalName: roomName,
                            type: roomType,
                            capacity: getRoomCapacity(roomName),
                            floor: getRoomFloor(roomName)
                        });
                    }
                }
            });
            
            setFreeRooms(freeRoomsList);
            setFilteredRooms(freeRoomsList);
        } catch (err) {
            console.error('Error fetching room data:', err);
            setFreeRooms([]);
            setFilteredRooms([]);
        }
        
        setLoading(false);
    };

    // Search functionality
    const handleSearch = (searchValue) => {
        let filtered = [...freeRooms];

        // Apply search filter
        if (searchValue.trim()) {
            filtered = filtered.filter(room => 
                room.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                room.type.toLowerCase().includes(searchValue.toLowerCase()) ||
                room.floor.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        setFilteredRooms(filtered);
    };

    // Update search when text changes
    useEffect(() => {
        handleSearch(searchText);
    }, [searchText, freeRooms]);

    // Helper functions to determine room properties based on name
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
        // Extract capacity from braces in room name (e.g., "Room A (50)" -> 50)
        const capacityMatch = roomName.match(/\((\d+)\)/);
        if (capacityMatch) {
            return parseInt(capacityMatch[1]);
        }
        
        // Fallback to default capacities based on room type
        const type = getRoomType(roomName);
        switch (type) {
            case 'Computer Lab': return 30;
            case 'Lecture Hall': return 50;
            case 'Physics Lab': return 25;
            case 'Seminar Room': return 20;
            case 'Library Hall': return 100;
            case 'Auditorium': return 200;
            default: return 40;
        }
    };

    // Clean room name by removing capacity braces
    const getCleanRoomName = (roomName) => {
        return roomName.replace(/\s*\(\d+\)/, '').trim();
    };

    const getRoomFloor = (roomName) => {
        const name = roomName.toLowerCase();
        if (name.includes('g') || name.includes('ground')) return 'Ground Floor';
        if (name.includes('1') || name.includes('first')) return '1st Floor';
        if (name.includes('2') || name.includes('second')) return '2nd Floor';
        if (name.includes('3') || name.includes('third')) return '3rd Floor';
        return '1st Floor'; // default
    };

    useEffect(() => {
        let interval = setInterval(() => {
            if (fetchedData.current) {
                findFreeRooms();
                clearInterval(interval);
            }
        }, 500);
        
        return () => clearInterval(interval);
    }, [selectedDay, selectedTime]);

    // Re-fetch when day or time changes and data is ready
    useEffect(() => {
        if (fetchedData.current) {
            findFreeRooms();
        }
    }, [selectedDay, selectedTime]);

    const getRoomTypeIcon = (type) => {
        switch (type) {
            case 'Computer Lab': return 'fas fa-desktop';
            case 'Lecture Hall': return 'fas fa-chalkboard-teacher';
            case 'Physics Lab': return 'fas fa-flask';
            case 'Seminar Room': return 'fas fa-users';
            case 'Library Hall': return 'fas fa-book';
            case 'Auditorium': return 'fas fa-theater-masks';
            default: return 'fas fa-door-open';
        }
    };

    const getRoomTypeColor = (type) => {
        switch (type) {
            case 'Computer Lab': return '#3498db';
            case 'Lecture Hall': return '#e74c3c';
            case 'Physics Lab': return '#f39c12';
            case 'Seminar Room': return '#9b59b6';
            case 'Library Hall': return '#27ae60';
            case 'Auditorium': return '#e67e22';
            default: return '#95a5a6';
        }
    };

    return (
        <div className="classrooms-container">
            <div className="box">
                <h1><i className="fas fa-door-open"></i> Free Classrooms</h1>
                <p>Find available classrooms for any day and time</p>
                
                {/* Day filter like in timetable */}
                <div className='all-days'>
                    <div className="day-filter">
                        {days.map((day) => (
                            <div 
                                key={day.key} 
                                className={selectedDay === day.key ? "day-filter-item active" : "day-filter-item"} 
                                onClick={() => setSelectedDay(day.key)}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search and Filter Section */}
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
                            title={showTimeFilter ? "Hide Time Filter" : "Show Time Filter"}
                        >
                            <i className={`fas fa-clock ${showTimeFilter ? 'active' : ''}`}></i>
                        </button>
                    </div>
                    
                    {showTimeFilter && (
                        <div className="time-row">
                            <i className="fa fa-clock"></i>
                            <select 
                                value={selectedTime} 
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="time-selector"
                            >
                                {allTimeSlots.length > 0 ? (
                                    allTimeSlots.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Loading time slots...</option>
                                )}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Counter */}
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
                        filteredRooms.map(room => (
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
                                        <i className="fas fa-building"></i>
                                        <span>{room.floor}</span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fas fa-calendar-day"></i>
                                        <span>{days.find(d => d.key === selectedDay)?.label}</span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fas fa-clock"></i>
                                        <span>{selectedTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <i className={searchText ? "fas fa-search" : "fas fa-door-closed"}></i>
                            <h3>
                                {searchText 
                                    ? "No matching rooms found" 
                                    : freeRooms.length === 0 
                                        ? "No rooms available" 
                                        : "No rooms match your filters"
                                }
                            </h3>
                            <p>
                                {searchText 
                                    ? `No rooms match "${searchText}". Try a different search term.`
                                    : freeRooms.length === 0 
                                        ? "All classrooms are occupied at this time. Try a different time slot."
                                        : "Try adjusting your filters or search criteria."
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Classrooms;
