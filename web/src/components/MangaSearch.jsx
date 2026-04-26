import { useState } from 'react';

function MangaSearch({ onAddManga }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    try {
      console.log('Searching for:', query);
      const response = await fetch(`https://api.mangadex.org/manga?limit=10&title=${encodeURIComponent(query)}&includes[]=cover_art`);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API response:', data);
      setResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
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
          console.log('Rendering manga:', manga);
          const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
          console.log('Cover relationship:', coverRel);
          const coverUrl = coverRel?.attributes?.fileName
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
            : null;
          console.log('Cover URL:', coverUrl);
          const title = manga.attributes?.title?.en || 'No title';
          const description = manga.attributes?.description?.en || 'No description';
          return (
            <li key={manga.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="cover"
                  style={{ width: '50px', height: '70px', marginRight: '10px' }}
                  onError={(e) => {
                    console.error('Image failed to load:', coverUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ width: '50px', height: '70px', marginRight: '10px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image
                </div>
              )}
              <div>
                <h3>{title}</h3>
                <p>{description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
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