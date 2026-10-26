import './App.css'
import {useRef, useState, type RefObject} from 'react'
import {Canvas, useFrame} from '@react-three/fiber'
import {Physics,RigidBody} from '@react-three/rapier'
import {KeyboardControls, PointerLockControls, useKeyboardControls} from "@react-three/drei";
import {Ecctrl, type EcctrlHandle} from 'ecctrl'

function FirstPersonCamera({controller}: {controller: RefObject<EcctrlHandle | null>}) {
    useFrame(({camera}) => {
        const body = controller.current?.body
        if (!body) return

        const {x, y, z} = body.translation()
        camera.position.set(x, y + 1.4, z)
    })

    return null
}

function CharacterKeyboardInput({controller}: {controller: RefObject<EcctrlHandle | null>}) {
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

    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
    ];

  return (
    <>
      <div
          ref={setSceneElement}
          className="w-screen h-screen relative"
          tabIndex={0}
          onPointerDown={(event) => {
              if (event.target instanceof HTMLCanvasElement) {
                  sceneElement?.focus()
              }
          }}
      >

          <KeyboardControls map={keyboardMap} domElement={sceneElement ?? undefined}>

          <Canvas>

              <PointerLockControls selector="canvas" />
              <FirstPersonCamera controller={character} />
              <CharacterKeyboardInput controller={character} />

              <ambientLight intensity={0.5}/>
              <directionalLight position={[10, 10, 10]} intensity={1.5}/>


              <Physics debug>
                  <Ecctrl ref={character}>
                      <mesh visible={false}>
                          <capsuleGeometry args={[0.3, 0.7]} />
                          <meshStandardMaterial color="hotpink" />
                      </mesh>
                  </Ecctrl>


              <RigidBody type="fixed">
                  <mesh position={[0, -1, 0]}>
                      <boxGeometry args={[50, 1, 50]}/>
                      <meshStandardMaterial color={'lightgreen'}/>
                  </mesh>

              </RigidBody>
              </Physics>
          </Canvas>
          </KeyboardControls>

          <div className="absolute top-0 left-0 pointer-events-none">

          </div>

      </div>
    </>
  )
}

export default App
