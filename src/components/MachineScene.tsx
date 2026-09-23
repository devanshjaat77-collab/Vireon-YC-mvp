import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ComponentId } from '../services/investigation'

type Props = { selected: ComponentId; onSelect: (part: ComponentId) => void }
type Point = [number, number, number]
const steel = new THREE.MeshStandardMaterial({ color: '#64767a', metalness: .88, roughness: .23 })
const darkSteel = new THREE.MeshStandardMaterial({ color: '#17282b', metalness: .8, roughness: .26 })
const painted = new THREE.MeshStandardMaterial({ color: '#244c50', metalness: .7, roughness: .3 })
const pipe = new THREE.MeshStandardMaterial({ color: '#46676b', metalness: .85, roughness: .18 })

function Pipe({ points, color = '#46676b', radius = .13 }: { points: Point[]; color?: string; radius?: number }) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', .08)
  return <mesh><tubeGeometry args={[curve, 36, radius, 10, false]} /><meshStandardMaterial color={color} metalness={.78} roughness={.18} /></mesh>
}
function Bolt({ position }: { position: Point }) { return <mesh position={position} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.055, .055, .055, 6]} /><meshStandardMaterial color="#9bb0b0" metalness={.9} roughness={.22} /></mesh> }
function Tag({ position, label, value, fault, onClick }: { position: Point; label: string; value: string; fault?: boolean; onClick: () => void }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onClick() }}>
    <mesh><sphereGeometry args={[.095, 16, 16]} /><meshStandardMaterial color={fault ? '#ff714f' : '#5ff0ca'} emissive={fault ? '#ff381b' : '#11b995'} emissiveIntensity={2.4} /></mesh>
    <Html distanceFactor={8} position={[.16, .16, 0]}><button className={`scene-label ${fault ? 'fault' : ''}`} onClick={onClick}><b>{label}</b><span>{value}</span></button></Html>
  </group>
}
function Motor({ selected, onSelect }: Props) {
  const fault = selected === 'Drive bearing'
  return <group position={[-1.95, .28, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={painted}><cylinderGeometry args={[.72, .72, 1.55, 32]} /></mesh>
    {[[-.62, .02], [-.3, .02], [.05, .02], [.4, .02], [.7, .02]].map(([x, z]) => <mesh key={x} position={[x, 0, z]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.735, .035, 8, 32]} /><meshStandardMaterial color="#71a2a1" metalness={.8} roughness={.25} /></mesh>)}
    <mesh position={[-.85, .08, 0]} rotation={[0, 0, Math.PI / 2]} material={darkSteel}><cylinderGeometry args={[.5, .5, .25, 24]} /></mesh>
    <mesh position={[-.93, .08, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.24, .24, .34, 20]} /><meshStandardMaterial color="#b6c6c5" metalness={.9} roughness={.18} /></mesh>
    <mesh position={[.12, .76, 0]}><boxGeometry args={[.55, .27, .7]} /><meshStandardMaterial color="#193336" metalness={.65} roughness={.28} /></mesh>
    <mesh position={[.12, .91, 0]}><boxGeometry args={[.36, .03, .48]} /><meshStandardMaterial color="#5be6c6" emissive="#168e78" emissiveIntensity={1.3} /></mesh>
    <mesh position={[.84, .08, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.5, .5, .22, 24]} /><meshStandardMaterial color={fault ? '#9b3d2e' : '#344f52'} emissive={fault ? '#5b1308' : '#000'} emissiveIntensity={1.2} /></mesh>
    <Tag position={[.84, .62, .4]} label="BRG-01" value={fault ? '9.2 mm/s' : '2.1 mm/s'} fault={fault} onClick={() => onSelect('Drive bearing')} />
    <Tag position={[.02, .84, -.45]} label="MTR-01" value="74°C" onClick={() => onSelect('Motor housing')} />
  </group>
}
function Pump({ selected, onSelect }: Props) {
  const selectedPump = selected === 'Pump casing'
  return <group position={[1.15, .23, 0]}>
    <mesh castShadow material={steel}><cylinderGeometry args={[.83, .83, .54, 32]} /></mesh>
    <mesh position={[0, 0, .32]} material={darkSteel}><cylinderGeometry args={[.63, .63, .12, 32]} /></mesh>
    <mesh position={[.56, .2, 0]} rotation={[0, 0, Math.PI / 2]} material={pipe}><cylinderGeometry args={[.28, .28, .65, 24]} /></mesh>
    <mesh position={[0, .75, 0]} material={pipe}><cylinderGeometry args={[.27, .27, .5, 24]} /></mesh>
    <mesh position={[-.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={darkSteel}><cylinderGeometry args={[.35, .35, .4, 24]} /></mesh>
    {[[.42,.42,.31],[-.42,.42,.31],[.42,-.42,.31],[-.42,-.42,.31]].map((p,i)=><Bolt key={i} position={p as Point}/>) }
    <mesh position={[.12, .02, -.36]}><boxGeometry args={[.4, .3, .14]} /><meshStandardMaterial color="#e3af38" metalness={.55} roughness={.3} /></mesh>
    <Tag position={[.1, .75, .35]} label="PMP-02" value={selectedPump ? 'CAVITATION' : '4.8 bar'} fault={selectedPump} onClick={() => onSelect('Pump casing')} />
  </group>
}
function Valve({ position, active, onClick }: { position: Point; active: boolean; onClick: () => void }) {
  return <group position={position} onClick={onClick}><mesh rotation={[0, 0, Math.PI / 2]} material={pipe}><cylinderGeometry args={[.22, .22, .36, 20]} /></mesh><mesh position={[0, .25, 0]}><cylinderGeometry args={[.22, .22, .06, 16]} /><meshStandardMaterial color="#d59635" metalness={.7} roughness={.22} /></mesh><mesh position={[0, .43, 0]}><cylinderGeometry args={[.04, .04, .32, 12]} /><meshStandardMaterial color="#d59635" /></mesh><Tag position={[0, .67, .18]} label="VLV-08" value={active ? 'RESTRICTED' : 'OPEN'} fault={active} onClick={onClick} /></group>
}
function Skid({ selected, onSelect }: Props) { return <group rotation={[0, -.36, 0]}>
  <mesh position={[0, -.55, 0]} receiveShadow><boxGeometry args={[6.6, .16, 3.1]} /><meshStandardMaterial color="#1b3033" metalness={.78} roughness={.28} /></mesh>
  {[-2.7, 2.7].flatMap(x => [-1.15, 1.15].map(z => [x, -.83, z] as Point)).map((p, i) => <mesh key={i} position={p}><boxGeometry args={[.35, .42, .35]} /><meshStandardMaterial color="#304548" metalness={.8} /></mesh>)}
  <Motor selected={selected} onSelect={onSelect} />
  <mesh position={[-.48, .28, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.22, .22, .85, 20]} /><meshStandardMaterial color="#c0d2d0" metalness={.92} roughness={.16} /></mesh>
  <mesh position={[.02, .28, 0]}><boxGeometry args={[.68, .82, 1.05]} /><meshStandardMaterial color="#1b2a2b" metalness={.82} roughness={.22} /></mesh>
  {[[-.2,.28,.57], [.2,.28,.57],[-.2,.28,-.57],[.2,.28,-.57]].map((p,i)=><Bolt key={i} position={p as Point}/>) }
  <Pump selected={selected} onSelect={onSelect} />
  <Pipe points={[[1.7, .43, 0], [2.35, .43, 0], [2.35, 1.8, 0], [1.1, 1.8, 0], [1.1, 1.25, 0]]} />
  <Pipe points={[[.55, -.02, 0], [.55, -.02, -1.05], [2.7, -.02, -1.05], [2.7, 1.05, -1.05]]} color="#38585d" />
  <Valve position={[2.35, 1.1, 0]} active={selected === 'Coolant valve'} onClick={() => onSelect('Coolant valve')} />
  <mesh position={[-2.6, 1.13, -1.1]}><boxGeometry args={[.9, .5, .25]} /><meshStandardMaterial color="#1a3537" metalness={.65} roughness={.24} /></mesh>
  {[[-2.85,1.13,-.95],[-2.6,1.13,-.95],[-2.35,1.13,-.95]].map((p,i)=><mesh key={i} position={p as Point}><sphereGeometry args={[.055,12,12]} /><meshStandardMaterial color={i===1?'#fc7658':'#5ce4c5'} emissive={i===1?'#f13b1e':'#0ca182'} emissiveIntensity={1.8} /></mesh>)}
  <Pipe points={[[-2.3, 1.08, -1.1], [-1.65, 1.08, -1.1], [-1.65, .86, -.65]]} color="#20363a" radius={.055} />
  <Tag position={[-2.65, 1.47, -.8]} label="PLC-7" value="LINKED" onClick={() => onSelect('Control cabinet')} />
  <Tag position={[2.6, 1.25, -1.05]} label="FLO-12" value="38 L/min" onClick={() => onSelect('Flow sensor')} />
</group> }
export default function MachineScene(props: Props) { return <Canvas shadows dpr={[1, 1.45]} camera={{ position: [6.6, 4.1, 8.7], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><color attach="background" args={['#081315']} /><fog attach="fog" args={['#081315', 9, 18]} /><ambientLight intensity={.45} /><hemisphereLight args={['#a8ebe0', '#091416', 1.15]} /><spotLight position={[2.5, 7, 5]} angle={.52} penumbra={.85} intensity={100} color="#c2fff2" castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[-4, 2, 2]} intensity={21} color="#378bff" /><Skid {...props} /><ContactShadows position={[0, -.99, 0]} opacity={.55} scale={10} blur={2.4} far={4} /><OrbitControls enablePan={false} minDistance={6} maxDistance={11} maxPolarAngle={Math.PI / 2.06} target={[0, .2, 0]} /><Environment preset="city" /></Canvas> }
