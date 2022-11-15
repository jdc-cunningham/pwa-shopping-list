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
          checked: 'off'
        }).then((insertedId) => {
          return true;
        })
      ) {
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
  
  const checkItem = (item, checked) => {
    offlineStorage.transaction('rw', offlineStorage.items, async() => {
      if (
        await offlineStorage.items.put({
          id: item.id,
          name: item.name,
          checked,
        }).then((insertedId) => {
          return true;
        })
      ) {
        renderItems();
      } else {
        alert('Failed to update tag information');
      }
    })
    .catch(e => {
      alert('Failed to update tag information');
      console.log('tag info', e);
    });
  }

  const deleteItem = (item) => {
    offlineStorage.transaction('rw', offlineStorage.items, () => {
      offlineStorage.items.where("id").equals(item.id).delete().then((deleteCount) => {
        if (deleteCount) {
          renderItems();
        }
      })
    })
    .catch(e => {
      alert('Failed to delete item');
      console.log('delete item', e);
    });
  }

  useEffect(() => {
    if (offlineStorage) renderItems();
  }, [offlineStorage]);
 
  useEffect(() => {
    if (!offlineStorage) {
      setupOfflineStorage();
    } else {
      renderItems();
    }
  }, []);

  return (
    <div className="App">
      <div className="App__header">
        <button type="button" onClick={(e) => saveItem()}>+</button>
        <input type="text" placeholder="item name" value={itemName} onChange={(e) => setItemName(e.target.value)}/>
      </div>
      <div className="App__body">
        {items.map((item, index) => (
          <div key={index} className="App__body-row">
            <input type="checkbox" value={item.checked === "on"} onChange={(e) => checkItem(item, !e.target.value)}/>
            <p>{item.name}</p>
            <button type="button" onClick={(e) => deleteItem(item)}>X</button>
          </div>
        ))}
      </div>
      <div className="App__bottom-nav">
        <button className="reset-btn" type="button" onClick={(e) => resetDb()}>Reset</button>
      </div>
    </div>
  );
}

export default App;
