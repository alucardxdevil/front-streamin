import React, { useEffect, useState } from 'react'
import { getStorage, ref, getMetadata } from 'firebase/storage';
// import { storage } from "firebase/app"
// import "firebase/storage"
import { useSelector } from 'react-redux';

const VideoDuration = () => {

  const { currentVideo } = useSelector((state) => state.video);
    const [duration, setDuration] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storage = getStorage();
        const videoRef = ref(storage, currentVideo.videoUrl);

        getMetadata(videoRef)
            .then((metadata) => {
                setDuration(metadata.duration);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    return (
        <div>
            {duration !== null ? (
                <h3>{duration}</h3>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );

  //   const { currentVideo } = useSelector((state) => state.video);

  //   const [duration, setDuration] = useState(null)
  //   const [error, setError] = useState(null)

  //   useEffect(() => {
  //       const storageRef = storage()
  //       const videoRef = storageRef.ref(currentVideo.videoUrl)

  //       videoRef
  //           .getMetadata()
  //           .then((metadata) => {
  //               setDuration(metadata.duration)
  //           })
  //           .catch((err) => {
  //               setError(err.message)
  //           })
  //   }, [])

  // return (
  //   <h3>{duration}</h3>
  // )
}

export default VideoDuration