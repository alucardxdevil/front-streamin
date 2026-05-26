import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Card from './Card'
import { VideoCardList } from './VideoCardGrid'
import { useLanguage } from '../utils/LanguageContext'
import { uniqueRecommendations } from '../utils/recommendationVideos'

const Container = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  overflow: hidden;
`

const ScrollableCards = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 10px;
  min-height: 0;

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.text} ${({ theme }) => theme.soft};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.soft};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text};
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding-right: 0;
  }
`

const CardsList = styled(VideoCardList)`
  margin-top: 10px;
`

const Hr = styled.hr`
  margin: 6px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`

const Loading = styled.div`
  color: ${({ theme }) => theme.text};
  text-align: center;
  padding: 10px;
  font-size: 14px;
`

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`

const AdPlaceholder = styled.div`
  width: 100%;
  min-height: 220px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.bgLighter} 0%,
    ${({ theme }) => theme.soft} 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  background-size: 800px 100%;
  border: 1.5px dashed ${({ theme }) => theme.soft};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 20px 12px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.04) 50%,
      transparent 100%
    );
    background-size: 400px 100%;
    animation: ${shimmer} 2.5s infinite linear;
    border-radius: 14px;
    pointer-events: none;
  }

  @media (max-width: 1200px) {
    min-height: 200px;
  }

  @media (max-width: 768px) {
    min-height: 160px;
    border-radius: 10px;
  }
`

const AdLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.5;
  user-select: none;
`

const AdIcon = styled.div`
  font-size: 28px;
  opacity: 0.2;
  user-select: none;
`

const ITEMS_PER_PAGE = 10

export const Recommendation = ({ tags, currentPlayingVideoId }) => {
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()
  const poolRef = useRef([])
  const { t } = useLanguage()

  useEffect(() => {
    let cancelled = false

    const loadPool = async () => {
      if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        poolRef.current = []
        setVideos([])
        setPage(0)
        setHasMore(false)
        return
      }

      setLoading(true)
      setPage(0)

      try {
        const tagQuery = Array.isArray(tags) ? tags.join(',') : tags
        const res = await axios.get(`/videos/tags?tags=${tagQuery}`)
        if (cancelled) return

        poolRef.current = uniqueRecommendations(res.data, currentPlayingVideoId)
        const firstPage = poolRef.current.slice(0, ITEMS_PER_PAGE)
        setVideos(firstPage)
        setHasMore(poolRef.current.length > firstPage.length)
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching related videos:', error)
          poolRef.current = []
          setVideos([])
          setHasMore(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPool()
    return () => {
      cancelled = true
    }
  }, [tags, currentPlayingVideoId])

  useEffect(() => {
    if (page === 0) return

    const end = (page + 1) * ITEMS_PER_PAGE
    const nextSlice = poolRef.current.slice(0, end)
    setVideos(nextSlice)
    setHasMore(end < poolRef.current.length)
  }, [page])

  const lastCardElement = (node) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }

  return (
    <Container>
      <AdPlaceholder>
        <AdIcon>📢</AdIcon>
        <AdLabel>{t('adLabel')}</AdLabel>
      </AdPlaceholder>

      <ScrollableCards>
        <h3 style={{ color: 'white', justifyContent: 'center', display: 'flex' }}>
          {t('relatedVideos')}
        </h3>
        <Hr />
        <CardsList>
          {videos.map((video, index) => {
            const isLast = videos.length === index + 1
            return (
              <div ref={isLast ? lastCardElement : null} key={video._id}>
                <Card video={video} />
              </div>
            )
          })}
        </CardsList>
        {loading && <Loading>{t('loadingMoreVideos')}</Loading>}
        {!hasMore && !loading && videos.length > 0 && (
          <Loading>{t('noMoreRelatedVideos')}</Loading>
        )}
      </ScrollableCards>
    </Container>
  )
}
