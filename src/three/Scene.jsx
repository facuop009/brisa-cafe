import { Building } from './Room'
import { Neighborhood } from './Neighborhood'
import { EspressoBar } from './EspressoBar'
import { Lighting } from './Lighting'
import { Florist } from './Florist'
import { Chair, Stool, RoundTable, LongTable, Bench, OliveTree } from './Furniture'
import { Cup, Board, CardamomKnot, Croissant, Plate, MatchaBowl, HandPour, ColdDrip } from './Tableware'
import {
  STOOLS, WINDOW_BAR, WINDOW_STOOLS, CAFE_TABLES, LONG_TABLE, LONG_TABLE_CHAIRS, LOUNGE_BENCH, LOUNGE_TABLES, LEVEL,
} from './layout'
import { getMaterials, oakFor } from './materials'

function Book({ position, rotation = 0, color = '#2f3a36' }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.16, 0.025, 0.23]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}

function TableGroup({ t, children }) {
  return (
    <group>
      <RoundTable position={[t.x, 0, t.z]}>{children}</RoundTable>
      {t.chairs.map(([x, z, r], k) => (
        <Chair key={k} position={[x, 0, z]} rotation={r} />
      ))}
    </group>
  )
}

/* Ground floor: the espresso bar and a window bar. */
function Cafe() {
  const m = getMaterials()
  const len = WINDOW_BAR.z1 - WINDOW_BAR.z0
  return (
    <group>
      <EspressoBar />
      {STOOLS.map(([x, z]) => (
        <Stool key={x} position={[x, 0, z]} />
      ))}
      {/* window bar: an oak ledge facing the slats */}
      <mesh material={oakFor('windowbar', [2.4, 0.2])} position={[WINDOW_BAR.x, 1.0, (WINDOW_BAR.z0 + WINDOW_BAR.z1) / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.045, len]} />
      </mesh>
      {[WINDOW_BAR.z0 + 0.2, WINDOW_BAR.z1 - 0.2].map((z) => (
        <mesh key={z} material={m.lacquerYellow} position={[WINDOW_BAR.x + 0.05, 0.5, z]} castShadow>
          <boxGeometry args={[0.3, 0.98, 0.05]} />
        </mesh>
      ))}
      {WINDOW_STOOLS.map(([x, z]) => (
        <Stool key={z} position={[x, 0, z]} />
      ))}
      <group position={[WINDOW_BAR.x, 1.022, -1.95]}>
        <Cup size={1.4} surface="surfLatte" />
      </group>
      <group position={[WINDOW_BAR.x - 0.05, 1.022, 0.65]}>
        <Cup size={1} surface="surfCrema" />
      </group>
      {CAFE_TABLES.map((t, i) => (
        <TableGroup key={i} t={t}>
          <group position={[-0.12, 0, -0.06]}>
            <Cup size={1.4} surface="surfLatte" />
          </group>
          <group position={[0.14, 0, 0.1]}>
            <Plate />
            <group position={[0, 0.006, 0]}>
              <CardamomKnot />
            </group>
          </group>
        </TableGroup>
      ))}
      <OliveTree position={[5.2, 0, -3.95]} />
    </group>
  )
}

/* First floor: the quiet room with the long table. */
function Lounge() {
  const m = getMaterials()
  const len = LOUNGE_BENCH.x1 - LOUNGE_BENCH.x0
  return (
    <group>
      <group position={[(LOUNGE_BENCH.x0 + LOUNGE_BENCH.x1) / 2, 0, LOUNGE_BENCH.z]} rotation={[0, -Math.PI / 2, 0]}>
        <Bench x={0} z0={-len / 2} z1={len / 2} />
      </group>
      <LongTable position={[LONG_TABLE.x, 0, LONG_TABLE.z]} len={LONG_TABLE.len} width={LONG_TABLE.width}>
        <Board position={[0.12, 0, -1.15]} rotation={[0, 0.1, 0]}>
          <Cup size={1.4} surface="surfLatte" />
          <group position={[0.08, 0, 0.03]}>
            <CardamomKnot />
          </group>
        </Board>
        <group position={[-0.2, 0, -1.0]}>
          <Cup size={1} surface="surfCrema" />
        </group>
        <group position={[0.18, 0, 0.35]} rotation={[0, 0.6, 0]}>
          <HandPour />
        </group>
        <group position={[0.15, 0, 0.55]}>
          <Cup size={1.4} surface="surfBlack" material={m.ceramicCharcoal} />
        </group>
        <Book position={[-0.22, 0.0125, 0.45]} rotation={0.25} color="#d9577f" />
        <group position={[-0.15, 0, 1.75]}>
          <Plate />
          <group position={[0, 0.006, 0]}>
            <Croissant />
          </group>
        </group>
        <group position={[0.2, 0, 1.65]}>
          <MatchaBowl />
        </group>
      </LongTable>
      {LONG_TABLE_CHAIRS.map(([x, z, r], i) => (
        <Chair key={i} position={[x, 0, z]} rotation={r} />
      ))}
      <TableGroup t={LOUNGE_TABLES[0]}>
        <Cup size={1.4} surface="surfHojicha" material={m.ceramicSand} />
        <Book position={[0.18, 0.0125, 0.1]} rotation={-0.4} color="#f2c53d" />
      </TableGroup>
      <TableGroup t={LOUNGE_TABLES[1]}>
        <group position={[0.05, 0, 0]}>
          <ColdDrip />
        </group>
      </TableGroup>
      <TableGroup t={LOUNGE_TABLES[2]}>
        <group position={[-0.12, 0, -0.08]}>
          <Cup size={1.4} surface="surfLatte" />
        </group>
        <group position={[0.14, 0, 0.1]}>
          <Cup size={1} surface="surfCrema" />
        </group>
      </TableGroup>
      <OliveTree position={[5.2, 0, -3.95]} />
    </group>
  )
}

export function Scene({ shadowMapSize }) {
  return (
    <group>
      <Lighting shadowMapSize={shadowMapSize} />
      <Building />
      <Neighborhood />
      <Cafe />
      <group position={[0, LEVEL, 0]}>
        <Lounge />
      </group>
      <group position={[0, 2 * LEVEL, 0]}>
        <Florist />
      </group>
    </group>
  )
}
