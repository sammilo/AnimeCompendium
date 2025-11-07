import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { ResponsiveContainer } from 'recharts';
import { useRoutes } from "react-router"
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
    const cachedSeasons = localStorage.getItem('seasonAnime');
    if (cachedSeasons) {
      const allSeasons = JSON.parse(cachedSeasons);
      setSeasonAnime(allSeasons);
      setList(allSeasons[season()] || []);
    } else {
      const fetchAnime = async () => {
        const allSeasons = await fetchSeasonAnime(currentYear);
        setSeasonAnime(allSeasons);
        setList(allSeasons[season()] || []);
        localStorage.setItem('seasonAnime', JSON.stringify(allSeasons));
      };
      fetchAnime().catch(console.error);
    }
  }, []);

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
        <div className="list-charts">
          <div className="anime-list-container">
            <div className="anime-row anime-header">
              <span>Name</span>
              <span>Episodes</span>
              <span>Rating</span>
            </div>
            <ol className="anime-list">
            {filteredList.map(anime => (
              <li key={anime.mal_id} className="anime-row">
                <span className="anime-title">
                  <Link to={`/detail/${anime.mal_id}`}>{anime.title}</Link>
                </span>
                <span className="anime-episodes">{anime.episodes || 'Ongoing'}</span>
                <span className="anime-score">{anime.score || 'Unrated'}</span>
              </li> 
            ))}
            </ol>
          </div>
          <div className="highest-rated-chart">
            <h3 style={{textAlign: 'center'}}>Top 10 Highest Rated Anime of the Year</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={Object.values(seasonAnime)
                  .flat()
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map(anime => ({
                    name: anime.title.length > 15 ? anime.title.substring(0, 15) + '...' : anime.title,
                    score: anime.score || 0,
                    fullName: anime.title // Add full name for tooltip
                  }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3"  stroke="aliceblue" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={120}
                  stroke="aliceblue"
                />
                <YAxis 
                  domain={[0, 10]}
                  stroke="aliceblue"
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'aliceblue'}}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`Rating: ${value}`, null]}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullName || label}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar 
                  dataKey="score" 
                  fill="#5dc6fbff" 
                  activeBar={<Rectangle fill="#ffb05bff" />}
                  name="Rating"
                />
              </BarChart>
            </ResponsiveContainer>
            <h3 style={{textAlign: 'center', marginTop: '3rem'}}>Top 10 Most Popular Anime of the Year</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={Object.values(seasonAnime)
                  .flat()
                  .sort((a, b) => a.popularity - b.popularity)
                  .slice(0, 10)
                  .map(anime => ({
                    name: anime.title.length > 15 ? anime.title.substring(0, 15) + '...' : anime.title,
                    popularity: anime.popularity || 0,
                    fullName: anime.title
                  }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="aliceblue" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={120}
                  stroke="aliceblue"
                />
                <YAxis
                  domain={[1, 10]}
                  stroke="aliceblue"
                  label={{ value: 'Popularity Rank', angle: -90, position: 'insideLeft', fill: 'aliceblue' }}
                />
                <Tooltip
                  formatter={(value, name, props) => [`Popularity Rank: ${value}`, null]}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullName || label}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar
                  dataKey="popularity"
                  fill="#ffb05bff"
                  activeBar={<Rectangle fill="#5dc6fbff" />}
                  name="Popularity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}