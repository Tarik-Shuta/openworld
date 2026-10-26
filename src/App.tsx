import './App.css'
import {Canvas} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'

function App() {

  return (
    <>
      <div className="w-screen h-screen relative">

          <Canvas>
              <OrbitControls/>

              <ambientLight intensity={0.5}/>
              <directionalLight position={[10, 10, 10]} intensity={1.5}/>


              <mesh position={[0, -1, 0]}>
                  <boxGeometry args={[50, 1, 50]}/>
                  <meshStandardMaterial color={'orange'}/>
              </mesh>

          </Canvas>

          <div className="absolute top-0 left-0 pointer-events-none">

          </div>

      </div>
    </>
  )
}

export default App
