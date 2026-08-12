import React, { useState, useEffect, useCallback } from 'react';

const UpdateNotification = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [updates, setUpdates] = useState([]);
    const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const STORAGE_KEY = 'fast_timetable_notifications_seen';

    // Check which updates user hasn't seen
    const checkUnseenUpdates = useCallback((updatesArray) => {
        const seenNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Find the first unseen update
        const unseenUpdateIndex = updatesArray.findIndex(update => 
            !seenNotifications.includes(update.id)
        );
        
        if (unseenUpdateIndex !== -1) {
            setCurrentUpdateIndex(unseenUpdateIndex);
            setShowNotification(true);
        }
    }, [STORAGE_KEY]);

    // Fetch updates from API
    const fetchUpdates = useCallback(async () => {
        try {
            setLoading(true);
            // Replace this URL with your actual API endpoint
            const response = await fetch(process.env.REACT_APP_DATA_API+'/updates'); // Update this to your backend URL
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                setUpdates(data);
                checkUnseenUpdates(data);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
            // Fallback to local updates if API fails
            const fallbackUpdate = {
                id: '1.0.0',
                version: '2.0.0',
                title: '🎉 New Features & Improvements',
                features: [
                    '🏫 Free Classrooms Feature - Find available rooms instantly',
                    '👨‍🏫 Faculty Directory - Search and contact teachers',
                    '📱 Improved Mobile Experience - Better touch interface',
                ],
                highlights: [
                ]
            };
            setUpdates([fallbackUpdate]);
            checkUnseenUpdates([fallbackUpdate]);
        } finally {
            setLoading(false);
        }
    }, [checkUnseenUpdates]);

    // Mark current update as seen and show next if available
    const markCurrentAsSeen = () => {
        const currentUpdate = updates[currentUpdateIndex];
        if (!currentUpdate) return;

        const seenNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        seenNotifications.push(currentUpdate.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seenNotifications));
    };

    // Show next unseen update or close if none
    const showNextUnseen = () => {
        const seenNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Find next unseen update after current
        const nextUnseenIndex = updates.findIndex((update, index) => 
            index > currentUpdateIndex && !seenNotifications.includes(update.id)
        );
        
        if (nextUnseenIndex !== -1) {
            setCurrentUpdateIndex(nextUnseenIndex);
        } else {
            setShowNotification(false);
        }
    };

    // Handle "Got it!" - mark as seen and show next update
    const handleGotIt = () => {
        markCurrentAsSeen();
        showNextUnseen();
    };

    // Handle dismiss - just close current, will show again next time
    const handleDismiss = () => {
        showNextUnseen();
    };

    useEffect(() => {
        // Fetch updates when component mounts
        fetchUpdates();
    }, [fetchUpdates]);

    // Don't render anything while loading or if no updates or no notification to show
    if (loading || !updates.length || !showNotification) {
        return null;
    }

    const currentUpdate = updates[currentUpdateIndex];
    const seenNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const totalUnseen = updates.filter(update => !seenNotifications.includes(update.id)).length;
    const unseenUpdates = updates.filter(update => !seenNotifications.includes(update.id));
    const currentPosition = unseenUpdates.findIndex(update => update.id === currentUpdate.id) + 1;

    return (
        <>
            {showNotification && currentUpdate && (
                <div className="update-notification-overlay">
                    <div className="update-notification-modal">
                        {/* Header */}
                        <div className="update-notification-header">
                            <div className="update-icon">
                                <i className="fas fa-sparkles"></i>
                            </div>
                            <div className="update-title">
                                <h2>{currentUpdate.title}</h2>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <span className="version-badge">v{currentUpdate.version}</span>
                                    {totalUnseen > 1 && (
                                        <span className="version-badge" style={{background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', borderColor: 'rgba(255, 193, 7, 0.25)'}}>
                                            {currentPosition} of {totalUnseen}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                className="close-btn"
                                onClick={handleDismiss}
                                title="Close (will show again)"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="update-notification-content">
                            <div className="features-section">
                                <h3><i className="fas fa-star"></i> What's New</h3>
                                <ul className="features-list">
                                    {currentUpdate.features.map((feature, index) => (
                                        <li key={index} className="feature-item" style={{'--index': index}}>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {currentUpdate.highlights && currentUpdate.highlights.length > 0 && (
                                <div className="highlights-section">
                                    <h3><i className="fas fa-bolt"></i> Key Highlights</h3>
                                    <ul className="highlights-list">
                                        {currentUpdate.highlights.map((highlight, index) => (
                                            <li key={index} className="highlight-item" style={{'--index': index}}>
                                                <i className="fas fa-check-circle"></i>
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="update-notification-footer">
                            <button 
                                className="dismiss-btn"
                                onClick={handleDismiss}
                            >
                                <i className="fas fa-clock"></i>
                                Later
                            </button>
                            <button 
                                className="got-it-btn"
                                onClick={handleGotIt}
                            >
                                <i className="fas fa-check"></i>
                                {totalUnseen > 1 ? 'Next' : 'Got it!'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateNotification;