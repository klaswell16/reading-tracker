import { useState, useEffect } from 'react';

function MangaSearch({ onAddManga }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', trimmed);
      const response = await fetch(`https://api.mangadex.org/manga?limit=10&title=${encodeURIComponent(trimmed)}&includes[]=cover_art`);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="search-section">
      <h2>Search Manga</h2>
      <div className="search-input-group">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter manga title"
          onKeyPress={(e) => e.key === 'Enter' && !loading && search(query)}
        />
        <button onClick={() => search(query)} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {loading && <div className="loading">Searching for manga...</div>}
      {results.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map(manga => {
            console.log('Rendering manga:', manga);
            const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
            console.log('Cover relationship:', coverRel);
            const coverUrl = coverRel?.attributes?.fileName
              ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
              : null;
            console.log('Cover URL:', coverUrl);
            const titleData = manga.attributes?.title || {};
            const title = titleData.en || Object.values(titleData)[0] || 'Untitled Manga';
            const descriptionData = manga.attributes?.description || {};
            const description = descriptionData.en || Object.values(descriptionData)[0] || 'No description';
            return (
              <li key={manga.id} className="manga-item">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="cover"
                    className="manga-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', coverUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="manga-cover">No Image</div>
                )}
                <div className="manga-info">
                  <h4>{title}</h4>
                  <p>{description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
                </div>
                <button className="add-button" onClick={() => onAddManga(manga)}>Add to List</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MangaSearch;