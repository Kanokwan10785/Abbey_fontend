import React, { createContext, useState } from 'react';

export const ClothingContext = createContext();

export const ClothingProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState({
    shirt: null,
    pant: null,
    skin: { image: require('../../assets/image/Clothing-Item/Skin/K00.png'), name: 'K00' },
  });

  return (
    <ClothingContext.Provider value={{ selectedItems, setSelectedItems }}>
      {children}
    </ClothingContext.Provider>
  );
};
