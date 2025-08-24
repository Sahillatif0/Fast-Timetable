import React from 'react'

const DownloadPage = ({apk}) => {
  return (
    <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
        <a href={apk} download='FAST Timetable.apk' style={{textDecoration: 'none'}}>
            <div style={{
            padding: '40px 50px', 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px', 
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            transform: 'translateY(0)',
            minWidth: '280px'
            }}
            onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-8px)';
            e.target.style.boxShadow = '0 30px 60px rgba(0,0,0,0.15), 0 15px 30px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.05)';
            }}>
            <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}>
                <i className="fa fa-download" style={{fontSize: '32px', color: 'white'}}></i>
            </div>
            <h3 style={{
                margin: '0 0 8px 0', 
                fontSize: '24px', 
                color: '#2c3e50',
                fontWeight: '600',
                letterSpacing: '-0.5px'
            }}>Download APK</h3>
            <p style={{
                margin: '0 0 10px 0', 
                fontSize: '14px', 
                color: '#7f8c8d',
                fontWeight: '500'
            }}>Latest version</p>
            <div style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '25px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                marginTop: '5px'
            }}>
                Fast Timetable
            </div>
            </div>
        </a>
        </div>
  )
}

export default DownloadPage