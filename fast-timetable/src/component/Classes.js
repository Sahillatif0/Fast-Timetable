import React from 'react'
import SingleClass from './SingleClass';
import { AdNative, useAds } from './ads';

const Classes = ({data}) => {
    const { getAdForPosition, settings } = useAds();
    
    const renderWithAds = () => {
        const elements = [];
        const adFrequency = settings.inlineAdFrequency;
        let adIndex = 0;

        data.forEach((cl, ind) => {
            elements.push(<SingleClass cl={cl} key={"singleclass"+ind}/>);
            
            if ((ind + 1) % adFrequency === 0 && ind < data.length - 1) {
                const ad = getAdForPosition('native-class');
                if (ad) {
                    elements.push(
                        <AdNative 
                            key={"ad-inline-"+ind+"-"+adIndex} 
                            ad={ad} 
                            variant="class" 
                        />
                    );
                }
                adIndex++;
            }
        });

        return elements;
    };

    return (
        <div className="class-box">
            {data.length > 0 ? renderWithAds() :
            <span className="enjoy">No classes. Enjoy 🎊</span> }
        </div>
    )
}

export default Classes