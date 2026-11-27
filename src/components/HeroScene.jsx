import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Mo hinh 3D don gian de tao diem nhan cho trang chu.
export default function HeroScene({ accentColor = '#e7bd3f' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })
    } catch {
      // Neu may khong ho tro WebGL, phan noi dung khac van hoat dong.
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.z = 5

    const light = new THREE.PointLight(accentColor, 3)
    light.position.set(3, 3, 4)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0xffffff, 1.4))

    // Mot khoi da dien va duong vien giup mo hinh de nhin hon.
    const geometry = new THREE.IcosahedronGeometry(1.35, 1)
    const material = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.35,
      roughness: 0.35,
      flatShading: true,
    })
    const model = new THREE.Mesh(geometry, material)
    scene.add(model)

    const edgeGeometry = new THREE.EdgesGeometry(geometry)
    const edgeMaterial = new THREE.LineBasicMaterial({ color: '#fff4cf' })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    model.add(edges)

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1)
      const height = Math.max(canvas.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const prefersLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationId = 0

    const animate = () => {
      animationId = window.requestAnimationFrame(animate)
      model.rotation.y += 0.0025
      model.rotation.x += 0.001
      renderer.render(scene, camera)
    }

    if (!prefersLessMotion) animate()

    return () => {
      window.cancelAnimationFrame(animationId)
      observer.disconnect()
      geometry.dispose()
      material.dispose()
      edgeGeometry.dispose()
      edgeMaterial.dispose()
      renderer.dispose()
    }
  }, [accentColor])

  return <canvas ref={canvasRef} className="hero-canvas" aria-label="Mô hình 3D minh họa thiết bị kiểm thử" />
}
