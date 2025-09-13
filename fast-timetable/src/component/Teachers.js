import React, { useState, useEffect } from 'react';

const Teachers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load faculty data from faculty.json
    useEffect(() => {
        const loadFacultyData = async () => {
            try {
                const response = await fetch('https://server-timetable2.vercel.app/faculty');
                const facultyData = await response.json();
                setTeachers(facultyData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading faculty data:', error);
                setLoading(false);
            }
        };

        loadFacultyData();
    }, []);

    if (loading) {
        return (
            <div className="teachers-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading faculty data...</p>
                </div>
            </div>
        );
    }

    const filteredTeachers = teachers.filter(teacher => {
        // Text search filter
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (teacher.office && teacher.office.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
    });


    return (
        <div className="teachers-container">
            <div className="box">
                <h1><i className="fas fa-chalkboard-teacher"></i> Faculty Directory</h1>
                <p>Search for faculty members by name, designation, office, or email address</p>
                
                <div className="search-box">
                    <i className="fa fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="e.g. Dr. Abdul Aziz, Professor, Office 101, Computer Science"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className='search-button' onClick={() => {/* Search is already reactive */}}>Search</button>
                </div>
            </div>

            <div className="teachers-grid">
                {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher, index) => (
                        <div key={index} className="teacher-card">
                            <div className="teacher-image">
                                {teacher.imageUrl ? (
                                    <img src={teacher.imageUrl} alt={teacher.name} />
                                ) : (
                                    <div className="teacher-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                )}
                            </div>
                            
                            <div className="teacher-info">
                                <h3 className="teacher-name">{teacher.name}</h3>
                                <p className="teacher-designation">{teacher.designation}</p>
                                <p className="teacher-email">
                                    <i className="fas fa-envelope"></i> {teacher.email}
                                </p>
                                <p className="teacher-office">
                                    <i className="fas fa-building"></i> Office: {teacher.office ? teacher.office : 'N/A'}
                                </p>
                                {teacher.profileUrl && (
                                    <p className="teacher-profile">
                                        <a href={teacher.profileUrl} target="_blank" rel="noopener noreferrer">
                                            <i className="fas fa-external-link-alt"></i> View Profile
                                        </a>
                                    </p>
                                )}
                                
                                <div className="teacher-contact">
                                    {teacher.extension && (
                                        <p className="teacher-extension">
                                            <i className="fas fa-phone"></i> Ext: {teacher.extension}
                                        </p>
                                    )}
                                    <a 
                                        href={`mailto:${teacher.email}`}
                                        className="email-btn"
                                        title="Send Email"
                                    >
                                        <i className="fas fa-envelope"></i> Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <i className="fas fa-search"></i>
                        <p>No teachers found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Teachers;
