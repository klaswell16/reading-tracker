import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function TrackingList({ user, onSelectManga, refreshTrigger }) {
  const [mangaList, setMangaList] = useState([]);

  useEffect(() => {
    const fetchList = async () => {
      if (!user) return;
      try {
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setMangaList(userSnap.data().mangaList || []);
        }
      } catch (error) {
        console.error('Error fetching manga list:', error);
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
    <div>
      <h2>Your Manga List</h2>
      {Object.keys(grouped).length === 0 ? (
        <p>No manga in your list yet. Search and add some!</p>
      ) : (
        Object.keys(grouped).map(status => (
          <div key={status}>
            <h3>{status.replace('_', ' ').toUpperCase()}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {grouped[status].map(manga => (
                <li key={manga.id} style={{ cursor: 'pointer', marginBottom: '10px' }} onClick={() => onSelectManga(manga)}>
                  {manga.title} - Last Chapter: {manga.lastChapter}
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