import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    loading: false,
    error: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true
        },
        loginSuccess: (state, action) => {
            state.loading = false
            state.currentUser = action.payload
        },
        loginFailure: (state) => {
            state.loading = false
            state.error = true
        },
        logout: (state) => {
            state.currentUser = null
            state.loading = false
            state.error = false
            state.token = null
            document.cookie = 'token.access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        },
        follows: (state, action) => {
            if (state.currentUser.followsProfile.includes(action.payload)) {
              state.currentUser.followsProfile.splice(
                state.currentUser.followsProfile.findIndex(
                  (channelId) => channelId === action.payload
                ),
                1
              );
            } else {
              state.currentUser.followsProfile.push(action.payload);
            }
          },
    }
})

export const {loginStart, loginSuccess, loginFailure, logout, follows} = userSlice.actions

export default userSlice.reducer