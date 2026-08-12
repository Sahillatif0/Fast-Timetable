import React from 'react'

const DownloadPage = ({apk}) => {
  return (
    <div className="download-page">
        <a href={apk} download='FAST Timetable.apk' className="download-page-link">
            <div className="download-page-card">
            <div className="download-page-icon">
                <i className="fa fa-download"></i>
            </div>
            <h3 className="download-page-title">Download APK</h3>
            <p className="download-page-subtitle">Latest version</p>
            <div className="download-page-badge">
                Fast Timetable
            </div>
            </div>
        </a>
        </div>
  )
}

export default DownloadPage
