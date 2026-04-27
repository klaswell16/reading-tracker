import { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import MangaSearch from './components/MangaSearch';
import TrackingList from './components/TrackingList';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [selectedManga, setSelectedManga] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      setSelectedManga(null);
    }
  }, [user]);

  const getCoverUrl = (manga) => {
    const coverRel = manga.relationships?.find((r) => r.type === 'cover_art');
    const fileName = coverRel?.attributes?.fileName;
    return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : null;
  };

  const handleAddManga = async (manga) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }
    try {
      console.log('Adding manga:', manga);
      const userDoc = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      const mangaList = userSnap.exists() ? userSnap.data().mangaList || [] : [];

      const isDuplicate = mangaList.some((item) => item.id === manga.id);
      if (isDuplicate) {
        console.log('Manga already in list, skipping duplicate:', manga.id);
        return;
      }

      const titleData = manga.attributes?.title || {};
      const title = titleData.en || Object.values(titleData)[0] || 'Untitled Manga';
      const newManga = {
        id: manga.id,
        title: title,
        status: 'plan_to_read',
        lastChapter: 0,
        coverUrl: getCoverUrl(manga),
        links: {}
      };
      mangaList.push(newManga);
      await setDoc(userDoc, { mangaList }, { merge: true });
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
      console.log('Manga added successfully');
    } catch (error) {
      console.error('Error adding manga:', error);
    }
  };

  const updateMangaInList = async (mangaId, updates) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      const userDoc = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      const mangaList = userSnap.exists() ? userSnap.data().mangaList || [] : [];
      const updatedList = mangaList.map((m) => (m.id === mangaId ? { ...m, ...updates } : m));
      await setDoc(userDoc, { mangaList: updatedList }, { merge: true });
      setRefreshTrigger((prev) => prev + 1);
      if (selectedManga?.id === mangaId) {
        setSelectedManga((prev) => (prev ? { ...prev, ...updates } : prev));
      }
    } catch (error) {
      console.error('Error updating manga:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedManga) return;
    await updateMangaInList(selectedManga.id, { status: newStatus });
  };

  const handleDeleteManga = async () => {
    if (!user || !selectedManga) return;

    try {
      const userDoc = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      const mangaList = userSnap.exists() ? userSnap.data().mangaList || [] : [];
      const filteredList = mangaList.filter((m) => m.id !== selectedManga.id);
      await setDoc(userDoc, { mangaList: filteredList }, { merge: true });
      setRefreshTrigger((prev) => prev + 1);
      setSelectedManga(null);
    } catch (error) {
      console.error('Error deleting manga:', error);
    }
  };

  return (
    <div className="App">
      <h1>Manga Tracker</h1>
      <Auth onUserChange={setUser} />
      {user && (
        <div className="main-content">
          <MangaSearch onAddManga={handleAddManga} />
          <TrackingList user={user} onSelectManga={setSelectedManga} refreshTrigger={refreshTrigger} />
        </div>
      )}
      {selectedManga && (
        <div className="selected-manga">
          <h2>Selected: {selectedManga.title}</h2>
          <p>Last Chapter: {selectedManga.lastChapter}</p>
          <div className="selected-actions">
            <label>
              Status:
              <select value={selectedManga.status} onChange={(e) => handleStatusChange(e.target.value)}>
                <option value="plan_to_read">Plan to Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <button className="delete-button" onClick={handleDeleteManga}>Delete from List</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;