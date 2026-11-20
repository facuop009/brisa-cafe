import { INGREDIENTS, RECIPES, SUPPLIES, VESSELS, buy, peso, setPanel, unlocked, useGame } from '../engine'
import { Icon } from './Icon'

function Sheet({ title, panel, children, foot }) {
  return (
    <aside className="sheet" role="dialog" aria-label={title}>
      <header className="sheet__head">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" onClick={() => setPanel(panel)} aria-label="Cerrar">
          <Icon name="close" size={22} />
        </button>
      </header>
      <div className="sheet__body">{children}</div>
      {foot && <footer className="sheet__foot">{foot}</footer>}
    </aside>
  )
}

export function Inventory() {
  const g = useGame()
  return (
    <Sheet
      title="Inventario"
      panel="inventory"
      foot={
        <span className="sheet__money">
          <Icon name="coin" size={20} /> {peso(g.money)} disponibles
        </span>
      }
    >
      <ul className="supplies">
        {unlocked(SUPPLIES).map(([k, s]) => {
          const n = g.stock[k]
          return (
            <li key={k} className={`supply${n <= 2 ? ' is-low' : ''}`}>
              <Icon name={k} size={36} />
              <span className="supply__text">
                <b>{s.name}</b>
                <small>{n <= 2 ? `¡Quedan ${n}!` : `Quedan ${n}`}</small>
              </span>
              <button type="button" className="btn btn--buy" onClick={() => buy(k)} disabled={g.money < s.cost}>
                +{s.pack}
                <small>{peso(s.cost)}</small>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="sheet__note">Cada espresso usa granos; la leche y la espuma usan leche. El agua y el hielo son gratis.</p>
    </Sheet>
  )
}

export function Recipes() {
  useGame()
  return (
    <Sheet title="Recetas" panel="recipes">
      <ul className="recipes">
        {unlocked(RECIPES).map(([k, r]) => (
          <li key={k} className="recipe">
            <span className="recipe__top">
              <b>{r.name}</b>
              <span>{peso(r.price)}</span>
            </span>
            {r.pastry ? (
              <span className="recipe__row">
                <Icon name="lazo" size={26} /> De la vitrina, a la derecha de la barra
              </span>
            ) : (
              <span className="recipe__row">
                <span className="recipe__step">
                  <Icon name={r.vessel} size={26} />
                  {VESSELS[r.vessel].name}
                </span>
                {r.items.map((i) => (
                  <span key={i} className="recipe__step">
                    <Icon name={i} size={26} />
                    {INGREDIENTS[i].name}
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="sheet__note">El orden de los ingredientes no importa. Ojo: el cortado va en taza chica y el flat white en taza grande.</p>
    </Sheet>
  )
}
