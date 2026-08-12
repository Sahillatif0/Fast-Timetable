import React from 'react'
import PropTypes from 'prop-types'

const Search = ({heading, searchHelpTxt,example, getData, searchTxt, setSearchTxt}) => {
    const handleKeyPress = (e) => {
        if(e.key==='Enter')
            getData(searchTxt.trim(), false);
    }
  return (
    <div className={heading==='Events'?"box events-box":"box"}>
        <h1>{heading}</h1>
        <p>{searchHelpTxt}</p>
        <div className={heading==='Events'?"search-box events-search-box":"search-box"}>
            <i className="fa fa-magnifying-glass"></i>
            <input type="text" placeholder={example} value={searchTxt} onKeyDown={handleKeyPress} onChange={(e)=>setSearchTxt(e.target.value)}/>
            <button className='search-button' onClick={()=>{getData(searchTxt.trim(), false)}} >Search</button>
        </div>

    </div>
  )
}

Search.propTypes = {
  heading: PropTypes.string.isRequired,
  searchHelpTxt: PropTypes.string.isRequired,
  example: PropTypes.string.isRequired,
  getData: PropTypes.func.isRequired,
  searchTxt: PropTypes.string.isRequired,
  setSearchTxt: PropTypes.func.isRequired,
};

export default Search