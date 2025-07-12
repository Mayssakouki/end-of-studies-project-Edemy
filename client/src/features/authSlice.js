import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: null, // user va contenir les infos de l'utilisateur (ex. : id, nom, email...)
  isAuthenticated: false, // Au départ, l'utilisateur n'est pas connecté (null) et isAuthenticated est false.
};

const authSlice = createSlice({
  //createSlice simplifie la gestion du state en générant automatiquement les actions et les reducers.
  name: "authSlice",
  initialState,
  reducers: {
    //Ce reducer est appelé quand l'utilisateur se connecte
    userLoggedIn: (state, action) => {
      state.user = action.payload.user; //Met à jour user avec les données reçues (action.payload.user).
      state.isAuthenticated = true; //Passe isAuthenticated à true (indiquant que l'utilisateur est connecté).
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false; //Remet user à null et isAuthenticated à false (déconnexion).
    },
    resetState: () => initialState, // Nouvelle action pour réinitialiser l'état
  },
});
export const { userLoggedIn, userLoggedOut, resetState } = authSlice.actions;
export default authSlice.reducer;
