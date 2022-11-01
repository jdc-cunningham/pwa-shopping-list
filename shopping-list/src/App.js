import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import './App.css';

const App = () => {
  const [offlineStorage, setOfflineStorage] = useState(null);

  // id, name
  const setupOfflineStorage = () => {
    const db = new Dexie("ShoppingList");

    db.version(1).stores({
      items: "++id,name",
    });

    setOfflineStorage(db);
  };

  useEffect(() => {
    if (!offlineStorage) return;

    offlineStorage.transaction('rw', offlineStorage.items, async() => {
      if (
        await offlineStorage.items.add({
          name: 'test'
        }).then((insertedId) => {
          console.log('inserted');
          return true;
        })
      ) {
        console.log('inserted');
      } else {
        alert('Failed to save item');
      }
    })
    .catch(e => {
      console.log('failed to save photos', e);
      alert('Failed to save photos to device');
    });
  }, [offlineStorage]);
 
  useEffect(() => {
    if (!offlineStorage) setupOfflineStorage();
  }, []);

  return (
    <div className="App">
      
    </div>
  );
}

export default App;
