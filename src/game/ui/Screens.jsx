import { nextDay, pause, peso, quitToMenu, startGame, useGame } from '../engine'
import { Icon } from './Icon'

export function Settings({ settings, setSettings }) {
  const set = (patch) => setSettings({ ...settings, ...patch })
  return (
    <div className="settings">
      <label className="settings__row">
        <span>Gráficos</span>
        <select value={settings.quality} onChange={(e) => set({ quality: e.target.value })}>
          <option value="auto">Automático</option>
          <option value="low">Bajos (más batería)</option>
          <option value="medium">Medios</option>
          <option value="high">Altos</option>
        </select>
      </label>
      <label className="settings__row">
        <span>Ahorro de batería (30 fps)</span>
        <input type="checkbox" checked={settings.saver} onChange={(e) => set({ saver: e.target.checked })} />
      </label>
    </div>
  )
}

export function StartScreen({ device, settings, setSettings }) {
  const g = useGame()
  const touch = device !== 'desktop'
  return (
    <div className="screen screen--start">
      <div className="card">
        <p className="card__eyebrow">papoicito</p>
        <h1 className="card__title">Brisa Te amo</h1>
        <p className="card__lead">Espero te guste tu juegito, que tus clientes no se enojen ni te hagan enojar...</p>
        <div className="card__actions">
          {g.saved && g.saved.day > 1 ? (
            <>
              <button type="button" className="btn btn--primary btn--big" onClick={() => startGame(false)}>
                Seguir · Día {g.saved.day}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => startGame(true)}>
                Empezar de cero
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--big" onClick={() => startGame(true)}>
              Jugar
            </button>
          )}
        </div>
        <ul className="howto">
          {touch ? (
            <>
              <li>
                <b>Pulgar izquierdo</b> para caminar
              </li>
              <li>
                <b>Deslizá</b> la pantalla para mirar
              </li>
              <li>
                <b>Tocá</b> clientes, la barra o el piso para ir
              </li>
              <li>
                <b>Botón grande</b> para usar
              </li>
            </>
          ) : (
            <>
              <li>
                <kbd>WASD</kbd> caminar
              </li>
              <li>
                <b>Arrastrá</b> para mirar
              </li>
              <li>
                <b>Clic</b> en algo para ir
              </li>
              <li>
                <kbd>E</kbd> usar
              </li>
            </>
          )}
        </ul>
        <Settings settings={settings} setSettings={setSettings} />
      </div>
    </div>
  )
}

export function PauseScreen({ settings, setSettings }) {
  return (
    <div className="screen">
      <div className="card card--small">
        <h2 className="card__title card__title--small">Pausa</h2>
        <div className="card__actions">
          <button type="button" className="btn btn--primary btn--big" onClick={() => pause(false)}>
            Seguir
          </button>
          <button type="button" className="btn btn--ghost" onClick={quitToMenu}>
            Salir al inicio
          </button>
        </div>
        <Settings settings={settings} setSettings={setSettings} />
      </div>
    </div>
  )
}

export function SummaryScreen() {
  const g = useGame()
  const s = g.stats
  const net = s.earned - s.spent
  return (
    <div className="screen">
      <div className="card card--small">
        <p className="card__eyebrow">Fin del día {g.day}</p>
        <h2 className="card__title card__title--small">{s.lost === 0 && s.served > 0 ? '¡Día perfecto!' : 'Cerramos'}</h2>
        <dl className="summary">
          <div>
            <dt>Clientes atendidos</dt>
            <dd>{s.served}</dd>
          </div>
          <div>
            <dt>Se fueron enojados</dt>
            <dd>{s.lost}</dd>
          </div>
          <div>
            <dt>Ventas</dt>
            <dd>{peso(s.earned - s.tips)}</dd>
          </div>
          <div>
            <dt>Propinas</dt>
            <dd>{peso(s.tips)}</dd>
          </div>
          <div>
            <dt>Compras</dt>
            <dd>{s.spent ? `−${peso(s.spent)}` : peso(0)}</dd>
          </div>
          <div className="summary__total">
            <dt>Ganancia del día</dt>
            <dd>{peso(net)}</dd>
          </div>
        </dl>
        <p className="summary__money">
          <Icon name="coin" size={20} /> En caja: {peso(g.money)}
        </p>
        <div className="card__actions">
          <button type="button" className="btn btn--primary btn--big" onClick={nextDay}>
            Día {g.day + 1}
          </button>
          <button type="button" className="btn btn--ghost" onClick={quitToMenu}>
            Salir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
