import { useState } from 'react';

function MangaSearch({ onAddManga }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(`https://api.mangadex.org/manga?limit=10&title=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div>
      <h2>Search Manga</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter manga title"
        onKeyPress={(e) => e.key === 'Enter' && search()}
      />
      <button onClick={search}>Search</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map(manga => {
          const coverRel = manga.relationships.find(r => r.type === 'cover_art');
          const coverUrl = coverRel ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg` : '';
          return (
            <li key={manga.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '50px', height: '70px', marginRight: '10px' }} />}
              <div>
                <h3>{manga.attributes.title.en || 'No title'}</h3>
                <p>{manga.attributes.description.en ? manga.attributes.description.en.substring(0, 100) + '...' : 'No description'}</p>
                <button onClick={() => onAddManga(manga)}>Add to List</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MangaSearch;