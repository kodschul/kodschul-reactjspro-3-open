import { configureStore } from "@reduxjs/toolkit";
import { counterReducer } from "./slices/counter";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage: storage,
};

const store = configureStore({
  reducer: {
    counter: persistReducer(persistConfig, counterReducer),
    users: persistReducer(persistConfig, counterReducer),
  },
});

export const persistor = persistStore(store);
export default store;
