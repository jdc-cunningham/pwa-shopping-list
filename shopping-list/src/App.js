import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import './css-reset.css';
import './App.css';

const App = () => {
  const [offlineStorage, setOfflineStorage] = useState(null);
  const [itemName, setItemName] = useState('');
  const [items, setItems] = useState([]);

  // id, name
  const setupOfflineStorage = () => {
    const db = new Dexie("ShoppingList");

    db.version(1).stores({
      items: "++id,name,checked",
    });

    setOfflineStorage(db);
  };

  const saveItem = () => {
    if (!offlineStorage) return;

    offlineStorage.transaction('rw', offlineStorage.items, async() => {
      if (
        await offlineStorage.items.add({
          name: itemName,
          checked: 'false'
        }).then((insertedId) => {
          console.log('inserted');
          return true;
        })
      ) {
        console.log('inserted');
        setItemName('');
        renderItems();
      } else {
        alert('Failed to save item');
      }
    })
    .catch(e => {
      console.log('failed to save photos', e);
      alert('Failed to save photos to device');
    });
  }

  const renderItems = () => {
    offlineStorage.items.toArray().then((items) => {
      setItems(items);
    });
  }

  const resetDb = () => {
    offlineStorage.delete().then(() => {
      setOfflineStorage(null);
    })
    .catch((err) => {
      alert('failed to reset');
    })
  }

  useEffect(() => {
    if (items) {
      console.log(items);
    }
  }, [items]);
 
  useEffect(() => {
    if (!offlineStorage) setupOfflineStorage();
  }, []);

  return (
    <div className="App">
      <div className="App__header">
        <button type="button" onClick={(e) => saveItem()}>+</button>
        <input type="text" placeholder="item name" value={itemName} onChange={(e) => setItemName(e.target.value)}/>
      </div>
      <div className="App__body">

      </div>
      <button className="reset-btn" type="button" onClick={(e) => resetDb()}>Reset</button>
    </div>
  );
}

export default App;
