import React, { createContext, useState } from 'react';

export const ClothingContext = createContext();

export const ClothingProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState({
    shirt: null,
    pant: null,
    skin: null,
  });

  return (
    <ClothingContext.Provider value={{ selectedItems, setSelectedItems }}>
      {children}
    </ClothingContext.Provider>
  );
};
