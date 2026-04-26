import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function TrackingList({ user, onSelectManga, refreshTrigger }) {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setMangaList(userSnap.data().mangaList || []);
        }
      } catch (error) {
        console.error('Error fetching manga list:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [user, refreshTrigger]);

  const grouped = mangaList.reduce((acc, manga) => {
    if (!acc[manga.status]) acc[manga.status] = [];
    acc[manga.status].push(manga);
    return acc;
  }, {});

  return (
    <div className="manga-list">
      <h2>Your Manga List</h2>
      {loading ? (
        <div className="loading">Loading your manga list...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <h3>No manga in your list yet</h3>
          <p>Search and add some manga to get started!</p>
        </div>
      ) : (
        Object.keys(grouped).map(status => (
          <div key={status} className="status-section">
            <h3>{status.replace('_', ' ').toUpperCase()}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {grouped[status].map(manga => (
                <li key={manga.id} className="manga-item" onClick={() => onSelectManga(manga)}>
                  <div className="manga-info">
                    <h4>{manga.title}</h4>
                    <p>Last Chapter: {manga.lastChapter}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default TrackingList;