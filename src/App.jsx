import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

export default function App() {
  const [list, setList] = useState([])
  const [seasonAnime, setSeasonAnime] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Determine the current season based on the month
  const season = () => {
    if (currentMonth >= 3 && currentMonth <= 5) return 'spring'
    if (currentMonth >= 6 && currentMonth <= 8) return 'summer'
    if (currentMonth >= 9 && currentMonth <= 11) return 'fall'
    return 'winter'
  }

  // Since the API paginates results, we need to loop through 4 pages to display 100 anime
  const fetchSeasonAnime = async (year, pages=4) => {
    const seasons = ['winter', 'spring', 'summer', 'fall']
    let allSeasons = {}

    for (const s of seasons) {
      const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${s}`)
      const json = await response.json()

      const top25 = json.data
        .filter(a => a.popularity !== null) // Exclude anime without a popularity rank
        .slice(0, 25) // Get top 25

      allSeasons[s] = top25
      await new Promise(resolve => setTimeout(resolve, 1200)) // Respect rate limits
    }
    return allSeasons
  }

  useEffect(() => {
    const fetchAnime = async () => {
      const allSeasons= await fetchSeasonAnime(currentYear)
      setSeasonAnime(allSeasons)
      setList(allSeasons[season()] || []) // Set initial list to current season plus safety mechanism in case of empty data
    }
    fetchAnime().catch(console.error)
  }, [])

  // Dynamically filter anime by title based on user input
  const filteredList = list.filter(anime =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase()) 
  )

  return (
    <>
      <div className="list-container">
        <h1>The Yearly Anime Compendium</h1>
        <h2>Search for your next anime from this year's most popular releases!</h2>
        <h3>Current Season: {season().charAt(0).toUpperCase() + season().slice(1)} {currentYear}</h3>
        <div className="filter-buttons">
          <button onClick={() => setList(Object.values(seasonAnime).flat().sort((a,b) => a.popularity - b.popularity))}>All Year</button>
          <button onClick={() => setList(seasonAnime.winter || [])}>Winter</button>
          <button onClick={() => setList(seasonAnime.spring || [])}>Spring</button>
          <button onClick={() => setList(seasonAnime.summer || [])}>Summer</button>
          <button onClick={() => setList(seasonAnime.fall || [])}>Fall</button>
        </div>
        <input className="search-bar"
          type="text"
          placeholder="Search by title..."
          onChange={e => setSearchQuery(e.target.value)}
        />
        <ol className="anime-list">
          {filteredList.map(anime => (
            <li key={anime.mal_id} className="anime-row">
              <span className="anime-title">{anime.title}</span>
              <span className="anime-episodes">{anime.episodes || 'Ongoing'}</span>
              <span className="anime-score">{anime.score || 'Unrated'}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}