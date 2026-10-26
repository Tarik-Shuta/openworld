import './App.css'
import * as THREE from 'three'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { EcctrlCameraControls, type EcctrlCameraControlsHandle } from 'ecctrl/camera'

function ThirdPersonCamera({
    controller,
    cameraControls,
}: {
    controller: RefObject<EcctrlHandle | null>
    cameraControls: RefObject<EcctrlCameraControlsHandle | null>
}) {
    const initialized = useRef(false)
    const cameraPosition = useRef(new THREE.Vector3())
    const targetPosition = useRef(new THREE.Vector3())
    const preferredDistance = useRef(6.32)
    const adjustedDistance = useRef(6.32)

    useFrame((_, delta) => {
        const body = controller.current?.body
        const controls = cameraControls.current
        if (!body || !controls) return

        const { x, y, z } = body.translation()

        if (!initialized.current) {
            controls.setLookAt(x, y + 3, z + 6, x, y + 1, z, false)
            initialized.current = true
            return
        }

        controls.moveTo(x, y + 1, z, true)

        const camera = controls.getPosition(cameraPosition.current)
        const target = controls.getTarget(targetPosition.current)
        const offsetY = camera.y - target.y
        const currentDistance = camera.distanceTo(target)
        const minimumCameraY = -0.2

        let allowedDistance = preferredDistance.current
        if (offsetY < 0) {
            const directionY = offsetY / currentDistance
            const distanceBeforeGround = (target.y - minimumCameraY) / -directionY
            allowedDistance = Math.min(allowedDistance, distanceBeforeGround)
        }

        adjustedDistance.current = THREE.MathUtils.damp(
            adjustedDistance.current,
            Math.max(0.5, allowedDistance),
            10,
            delta,
        )
        controls.dollyTo(adjustedDistance.current, false)
    })

    return null
}

function PointerLockCameraInput({
    cameraControls,
}: {
    cameraControls: RefObject<EcctrlCameraControlsHandle | null>
}) {
    const { gl } = useThree()

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== gl.domElement) return

            cameraControls.current?.rotate(
                -event.movementX * 0.002,
                -event.movementY * 0.002,
                false,
            )
        }

        document.addEventListener('mousemove', handleMouseMove)
        return () => document.removeEventListener('mousemove', handleMouseMove)
    }, [cameraControls, gl])

    return null
}

function CharacterKeyboardInput({ controller }: { controller: RefObject<EcctrlHandle | null> }) {
    const [, getKeys] = useKeyboardControls()

    useFrame(() => {
        controller.current?.setMovement({
            forward: getKeys().forward,
            backward: getKeys().backward,
            leftward: getKeys().leftward,
            rightward: getKeys().rightward,
            jump: getKeys().jump,
        })
    })

    return null
}

function App() {
    const [sceneElement, setSceneElement] = useState<HTMLDivElement | null>(null)
    const character = useRef<EcctrlHandle | null>(null)
    const cameraControls = useRef<EcctrlCameraControlsHandle | null>(null)

    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
    ]

    return (
        <div
            ref={setSceneElement}
            className="w-screen h-screen relative"
            tabIndex={0}
            onPointerDown={(event) => {
                if (event.target instanceof HTMLCanvasElement) {
                    sceneElement?.focus()
                    if (document.pointerLockElement !== event.target) {
                        event.target.requestPointerLock()
                    }
                }
            }}
        >
            <KeyboardControls map={keyboardMap} domElement={sceneElement ?? undefined}>
                <Canvas>
                    <color attach="background" args={['lightblue']} />
                    <ThirdPersonCamera controller={character} cameraControls={cameraControls} />
                    <EcctrlCameraControls
                        ref={cameraControls}
                        makeDefault
                        smoothTime={0.15}
                        minPolarAngle={0.05}
                        maxPolarAngle={Math.PI - 0.05}
                        minDistance={0.5}
                        maxDistance={8}
                    />
                    <PointerLockCameraInput cameraControls={cameraControls} />
                    <CharacterKeyboardInput controller={character} />

                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1.5} />

                    <Physics>
                        <Ecctrl ref={character}>
                            <mesh>
                                <capsuleGeometry args={[0.3, 0.7]} />
                                <meshStandardMaterial color="hotpink" />
                            </mesh>
                        </Ecctrl>

                        <RigidBody type="fixed">
                            <mesh position={[0, -1, 0]}>
                                <boxGeometry args={[50, 1, 50]} />
                                <meshStandardMaterial color="lightgreen" />
                            </mesh>
                        </RigidBody>
                    </Physics>
                </Canvas>
            </KeyboardControls>
        </div>
    )
}

export default App
