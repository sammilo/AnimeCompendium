import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DetailView() {
	const { id } = useParams();
	const [anime, setAnime] = useState(null);

	useEffect(() => {
		fetch(`https://api.jikan.moe/v4/anime/${id}`)
			.then(res => res.json())
			.then(data => setAnime(data.data));
	}, [id]);

		if (!anime) return <div className="detail-loading">Loading...</div>;

		return (
			<div className="detail-background">
				<div className="detail-content">
					<h2>{anime.title}</h2>
					<h3 className="detail-description">{anime.synopsis}</h3>
					<div className="genre-container">
						<strong style={{ color: 'white' }}>Genres:</strong>
						<ul className="genre-list">
							{anime.genres.map(g => <li key={g.mal_id}>{g.name}</li>)}
						</ul>
					</div>
				</div>
			</div>
		);
}
