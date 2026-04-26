import { useState } from 'react';
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
      const newManga = {
        id: manga.id,
        title: manga.attributes?.title?.en || 'Unknown Title',
        status: 'plan_to_read',
        lastChapter: 0,
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
          <p>Status: {selectedManga.status}</p>
          <p>Last Chapter: {selectedManga.lastChapter}</p>
        </div>
      )}
    </div>
  );
}

export default App;