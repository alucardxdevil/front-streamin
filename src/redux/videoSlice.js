import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentVideo: null,
    loading: false,
    error: false
}

const ensureReactionArrays = (video) => {
    if (!video) return;
    if (!Array.isArray(video.likes)) video.likes = [];
    if (!Array.isArray(video.dislikes)) video.dislikes = [];
};

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        fetchStart: (state) => {
            state.loading = true
        },
        fetchSuccess: (state, action) => {
            state.loading = false
            state.currentVideo = action.payload
            ensureReactionArrays(state.currentVideo);
        },
        fetchFailure: (state) => {
            state.loading = false
            state.error = true
        },
        like: (state, action) => {
            ensureReactionArrays(state.currentVideo);
            const index = state.currentVideo.likes.findIndex(
                (userId) => userId === action.payload
            );
            if (index !== -1) {
                // Si el usuario ya ha dado like, lo quitamos
                state.currentVideo.likes.splice(index, 1);
            } else {
                // Si el usuario no ha dado like, lo añadimos
                state.currentVideo.likes.push(action.payload);
                // Verificamos si el usuario ha dado dislike previamente
                const dislikeIndex = state.currentVideo.dislikes.findIndex(
                (userId) => userId === action.payload
                );
                if (dislikeIndex !== -1) {
                // Si el usuario ha dado dislike previamente, lo quitamos
                state.currentVideo.dislikes.splice(dislikeIndex, 1);
                }
            }
        },
      dislike: (state, action) => {
        ensureReactionArrays(state.currentVideo);
        const index = state.currentVideo.dislikes.findIndex(
            (userId) => userId === action.payload
        );
        if (index !== -1) {
            state.currentVideo.dislikes.splice(index, 1);
        } else {
            state.currentVideo.dislikes.push(action.payload);
            const likeIndex = state.currentVideo.likes.findIndex(
                (userId) => userId === action.payload
            );
            if (likeIndex !== -1) {
                state.currentVideo.likes.splice(likeIndex, 1);
            }
        }
      },
    }
})

export const {fetchStart, fetchSuccess, fetchFailure, like, dislike} = videoSlice.actions

export default videoSlice.reducer