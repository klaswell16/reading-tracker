import { useState, useEffect } from 'react';

function MangaSearch({ onAddManga }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const minSearchLength = 2;

  const search = async (searchTerm, signal) => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < minSearchLength) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', trimmed);
      const response = await fetch(`https://api.mangadex.org/manga?limit=10&title=${encodeURIComponent(trimmed)}&includes[]=cover_art`, {
        signal,
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API response:', data);

      // Fetch chapter counts for each manga
      const mangaWithChapters = await Promise.all(
        (data.data || []).map(async (manga) => {
          try {
            const chaptersResponse = await fetch(`https://api.mangadex.org/manga/${manga.id}/aggregate`, {
              signal,
            });
            if (chaptersResponse.ok) {
              const chaptersData = await chaptersResponse.json();
              const totalChapters = Object.values(chaptersData.volumes || {}).reduce(
                (total, volume) => total + Object.keys(volume.chapters || {}).length,
                0
              );
              return { ...manga, totalChapters };
            }
          } catch (error) {
            console.warn('Failed to fetch chapters for manga:', manga.id, error);
          }
          return { ...manga, totalChapters: null };
        })
      );

      setResults(mangaWithChapters);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      search(query, controller.signal);
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
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
      {!loading && query.trim().length > 0 && results.length === 0 && (
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try a different title or check your spelling.</p>
        </div>
      )}
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
                  {manga.totalChapters !== null && (
                    <p className="chapter-count">Chapters: {manga.totalChapters}</p>
                  )}
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