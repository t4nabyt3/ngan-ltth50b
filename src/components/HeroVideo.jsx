import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

const clips = ['/media/pager-hero.webm', '/media/pager-hero.mp4']

export default function HeroVideo() {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [showPlay, setShowPlay] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    let timer
    let attempt = 0
    let source = 0
    let enabled = false
    let waiting = false

    function play(index) {
      const currentAttempt = ++attempt
      source = index
      enabled = true
      video.defaultMuted = true
      video.muted = true
      video.autoplay = true
      if (video.getAttribute('src') !== clips[index] || video.error) video.src = clips[index]
      watch()
      video.play().catch((error) => {
        if (attempt !== currentAttempt) return
        if (error.name === 'NotAllowedError') stop()
        else failover()
      })
    }

    function stop() {
      attempt++
      enabled = false
      waiting = false
      clearTimeout(timer)
      video.autoplay = false
      video.pause()
      setShowPlay(true)
    }

    function failover() {
      if (!enabled) return
      if (source < clips.length - 1) play(source + 1)
      else stop()
    }

    function watch() {
      if (!enabled) return
      waiting = true
      const position = video.currentTime
      clearTimeout(timer)
      if (document.hidden) return
      timer = setTimeout(() => {
        if (document.hidden || (video.currentTime !== position && !video.paused)) return
        failover()
      }, 5000)
    }

    function markProgress() {
      if (!enabled || video.paused || video.currentTime === 0) return
      waiting = false
      clearTimeout(timer)
      setShowPlay(false)
    }

    function onVisibility() {
      if (!document.hidden && waiting) watch()
    }

    controlsRef.current = { play: () => play(source), pause: stop }
    video.addEventListener('error', failover)
    video.addEventListener('waiting', watch)
    video.addEventListener('pause', watch)
    video.addEventListener('timeupdate', markProgress)
    document.addEventListener('visibilitychange', onVisibility)
    // Leave the source unset during the development-only Effect rehearsal.
    const startup = requestAnimationFrame(() => play(0))

    return () => {
      attempt++
      cancelAnimationFrame(startup)
      clearTimeout(timer)
      video.removeEventListener('error', failover)
      video.removeEventListener('waiting', watch)
      video.removeEventListener('pause', watch)
      video.removeEventListener('timeupdate', markProgress)
      document.removeEventListener('visibilitychange', onVisibility)
      video.autoplay = false
      video.pause()
      controlsRef.current = null
    }
  }, [])

  return (
    <>
      <video ref={videoRef} muted loop playsInline preload="auto" poster="/media/pager-poster.png" aria-hidden="true" />
      <button
        className={showPlay ? 'hero-play' : 'hero-play hero-pause'}
        type="button"
        aria-label={showPlay ? 'Phát video' : 'Tạm dừng video'}
        onClick={() => showPlay ? controlsRef.current?.play() : controlsRef.current?.pause()}
      >
        {showPlay ? <><Play size={15} aria-hidden="true" /> Phát video</> : <Pause size={15} aria-hidden="true" />}
      </button>
    </>
  )
}
