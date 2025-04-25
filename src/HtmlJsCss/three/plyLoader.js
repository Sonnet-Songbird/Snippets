import * as THREE from 'https://unpkg.com/three@0.160.0?module'
import {OrbitControls} from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module'
import {PLYLoader} from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/PLYLoader.js?module'
import Stats from 'https://unpkg.com/three@0.160.0/examples/jsm/libs/stats.module.js?module'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.SpotLight()
light.position.set(20, 20, 20)
scene.add(light)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 10, 50)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

function createMaterial() {
    return new THREE.MeshBasicMaterial({color: 0x888888})
}

function loadEnvMap(onSuccess, onFail) {
    const loader = new THREE.CubeTextureLoader()
    loader.load(
        [
            'img/px_50.png',
            'img/nx_50.png',
            'img/py_50.png',
            'img/ny_50.png',
            'img/pz_50.png',
            'img/nz_50.png',
        ],
        (texture) => {
            texture.mapping = THREE.CubeReflectionMapping
            onSuccess(texture)
        },
        undefined,
        () => {
            console.warn('⚠️ Cube texture loading failed. Using fallback material.')
            onFail()
        }
    )
}

function loadModel(material) {
    const loader = new PLYLoader()
    loader.load(
        'asset.ply',
        (geometry) => {
            geometry.computeVertexNormals()
            const mesh = new THREE.Mesh(geometry, material)
            mesh.rotateX(-Math.PI / 2)
            scene.add(mesh)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.error(error)
        }
    )
}

function initialize(material) {
    loadModel(material)

    const stats = new Stats()
    document.body.appendChild(stats.dom)

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    })

    function animate() {
        requestAnimationFrame(animate)
        controls.update()
        render()
        stats.update()
    }

    function render() {
        renderer.render(scene, camera)
    }

    animate()

    document.getElementById('snapshotButton').addEventListener('click', () => {
        const dataURL = renderer.domElement.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = dataURL
        a.download = 'snapshot.png'
        a.click()
    })
}

loadEnvMap(
    (envMap) => initialize(createMaterial(envMap)),
    () => initialize(createMaterial(null))
)
