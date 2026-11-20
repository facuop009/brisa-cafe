import * as THREE from 'three'
import {
  oakCanvas,
  concreteCanvas,
  speckleCanvas,
  gravelCanvas,
  liquidCanvas,
  signCanvas,
  bagCanvas,
  ensoCanvas,
  norenCanvas,
  pastryCanvas,
  tileCanvas,
  toTexture,
} from './textures'

// One shared material library, built lazily once per page.
let lib = null

function texturedStandard(canvas, { repeat = [1, 1], bump = 0, ...rest }) {
  const map = toTexture(canvas, { repeat })
  const params = { map, ...rest }
  if (bump) {
    const b = toTexture(canvas, { repeat, srgb: false })
    params.bumpMap = b
    params.bumpScale = bump
  }
  return new THREE.MeshStandardMaterial(params)
}

export function getMaterials() {
  if (lib) return lib
  const m = {}

  m.oakFloor = texturedStandard(oakCanvas('floor'), { repeat: [4, 3], bump: 0.6, roughness: 0.62, metalness: 0 })
  m.oak = texturedStandard(oakCanvas('furniture'), { repeat: [1, 1], bump: 0.35, roughness: 0.55 })
  m.oakDark = texturedStandard(oakCanvas('dark'), { repeat: [1, 1], bump: 0.3, roughness: 0.5 })
  m.concreteWall = texturedStandard(concreteCanvas('wall'), { repeat: [1, 1], bump: 0.9, roughness: 0.86 })
  m.concrete = texturedStandard(concreteCanvas('block'), { repeat: [2, 1], bump: 0.6, roughness: 0.55 })
  m.plaster = texturedStandard(speckleCanvas('plaster', [232, 227, 218], 8), { repeat: [6, 4], roughness: 0.95 })
  m.linen = texturedStandard(speckleCanvas('linen', [232, 176, 178], 22, 256), { repeat: [4, 4], bump: 0.4, roughness: 0.95 })
  m.gravel = texturedStandard(gravelCanvas(), { repeat: [3, 6], bump: 1.2, roughness: 1 })
  m.stone = new THREE.MeshStandardMaterial({ color: '#77736c', roughness: 0.9 })
  m.tileYellow = new THREE.MeshPhysicalMaterial({ map: toTexture(tileCanvas(), { repeat: [6, 1] }), roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.15 })
  m.lacquerYellow = new THREE.MeshPhysicalMaterial({ color: '#f2c53d', roughness: 0.35, clearcoat: 0.6 })
  m.lacquerPink = new THREE.MeshPhysicalMaterial({ color: '#e7a1a8', roughness: 0.4, clearcoat: 0.4 })
  m.pavers = texturedStandard(speckleCanvas('pavers', [222, 205, 200], 18), { repeat: [80, 80], roughness: 0.9 })
  m.galvanised = new THREE.MeshStandardMaterial({ color: '#d4d6d6', metalness: 0.35, roughness: 0.42 })
  m.stem = new THREE.MeshStandardMaterial({ color: '#5d7440', roughness: 0.7 })
  m.petal = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 })
  m.dried = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })

  m.ceramicWhite = new THREE.MeshPhysicalMaterial({ color: '#f3efe8', roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 })
  m.ceramicCharcoal = new THREE.MeshPhysicalMaterial({ color: '#34302c', roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })
  m.ceramicSand = new THREE.MeshPhysicalMaterial({ color: '#cbb89c', roughness: 0.7, clearcoat: 0.2 })
  m.steel = new THREE.MeshStandardMaterial({ color: '#d7d6d2', metalness: 1, roughness: 0.22 })
  m.brushedSteel = new THREE.MeshStandardMaterial({ color: '#bdbab4', metalness: 1, roughness: 0.38 })
  m.blackMetal = new THREE.MeshStandardMaterial({ color: '#1f1d1b', metalness: 0.6, roughness: 0.45 })
  m.bronze = new THREE.MeshStandardMaterial({ color: '#4a3b33', metalness: 0.7, roughness: 0.4 })
  m.brass = new THREE.MeshStandardMaterial({ color: '#b8935a', metalness: 1, roughness: 0.3 })
  m.rubber = new THREE.MeshStandardMaterial({ color: '#141312', roughness: 0.8 })

  // Window and case glass: cheap transparent glass that still reflects the environment.
  m.glass = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.14,
    envMapIntensity: 1.4,
    depthWrite: false,
  })
  // Real refractive glass for close-up vessels.
  m.glassThick = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.03,
    transmission: 1,
    thickness: 0.02,
    ior: 1.5,
    transparent: true,
    envMapIntensity: 1.2,
  })
  m.ice = new THREE.MeshPhysicalMaterial({ color: '#f4f8fa', roughness: 0.12, transmission: 0.95, thickness: 0.05, ior: 1.31 })

  m.paperLamp = new THREE.MeshStandardMaterial({
    color: '#f6efe2',
    emissive: '#ffcf94',
    emissiveIntensity: 0.4,
    roughness: 0.9,
    side: THREE.DoubleSide,
  })
  m.bulbWarm = new THREE.MeshBasicMaterial({ color: '#ffd9a6', toneMapped: false })

  m.coffee = new THREE.MeshPhysicalMaterial({ color: '#2b170c', roughness: 0.08, clearcoat: 1 })
  m.coffeeGlass = new THREE.MeshPhysicalMaterial({ color: '#3a1d0c', roughness: 0.1, clearcoat: 1 })
  m.milk = new THREE.MeshStandardMaterial({ color: '#efe6d8', roughness: 0.4 })
  m.beans = new THREE.MeshStandardMaterial({ color: '#4a2c19', roughness: 0.55 })
  m.leaf = new THREE.MeshStandardMaterial({ color: '#7d8c5c', roughness: 0.65, side: THREE.DoubleSide })
  m.branch = new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.9 })
  m.paper = new THREE.MeshStandardMaterial({ color: '#f4f0e8', roughness: 0.95 })

  const surface = (kind) => {
    const t = toTexture(liquidCanvas(kind))
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.35, clearcoat: 0.5 })
  }
  m.surfCrema = surface('crema')
  m.surfLatte = surface('latte')
  m.surfHojicha = surface('hojicha')
  m.surfMatcha = surface('matcha')
  m.surfBlack = surface('black')

  m.pastry = texturedStandard(pastryCanvas(), { repeat: [2, 1], bump: 1.2, roughness: 0.75 })
  m.croissant = new THREE.MeshStandardMaterial({ color: '#c78a45', roughness: 0.6, map: m.pastry.map })

  const sign = toTexture(signCanvas())
  sign.wrapS = sign.wrapT = THREE.ClampToEdgeWrapping
  m.sign = new THREE.MeshStandardMaterial({ map: sign, transparent: true, metalness: 0.6, roughness: 0.4, color: '#c9a56b' })

  const bag = toTexture(bagCanvas())
  bag.wrapS = bag.wrapT = THREE.ClampToEdgeWrapping
  m.bagFront = new THREE.MeshStandardMaterial({ map: bag, roughness: 0.85 })
  m.kraft = new THREE.MeshStandardMaterial({ color: '#c4a47c', roughness: 0.9 })

  const enso = toTexture(ensoCanvas())
  enso.wrapS = enso.wrapT = THREE.ClampToEdgeWrapping
  m.scroll = new THREE.MeshStandardMaterial({ map: enso, roughness: 0.95 })

  const noren = toTexture(norenCanvas())
  noren.wrapS = noren.wrapT = THREE.ClampToEdgeWrapping
  m.noren = new THREE.MeshStandardMaterial({ map: noren, roughness: 1, side: THREE.DoubleSide })

  m.sky = new THREE.MeshBasicMaterial({ color: '#f3efe6', toneMapped: false })
  m.void = new THREE.MeshBasicMaterial({ color: '#17130f' })

  lib = m
  return m
}

// Returns a clone of an oak material whose texture repeat suits a given piece.
const oakCache = new Map()
export function oakFor(key, repeat, base = 'oak') {
  const id = `${base}-${key}`
  if (oakCache.has(id)) return oakCache.get(id)
  const src = getMaterials()[base]
  const mat = src.clone()
  mat.map = src.map.clone()
  mat.map.repeat.set(repeat[0], repeat[1])
  mat.map.needsUpdate = true
  if (src.bumpMap) {
    mat.bumpMap = src.bumpMap.clone()
    mat.bumpMap.repeat.set(repeat[0], repeat[1])
    mat.bumpMap.needsUpdate = true
  }
  oakCache.set(id, mat)
  return mat
}
