import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/notas'
const VACIA = { titulo: '', descripcion: '' }

async function request(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.status === 204 ? null : res.json()
}

function App() {
  const [notas, setNotas] = useState([])
  const [form, setForm] = useState(VACIA)
  const [editandoId, setEditandoId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    try {
      setNotas(await request(API_URL))
      setError('')
    } catch {
      setError('No se pudo conectar con la API. ¿Está arrancado el backend en el puerto 8081?')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const cancelar = () => {
    setForm(VACIA)
    setEditandoId(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.descripcion.trim()) return

    setGuardando(true)
    try {
      const editando = editandoId !== null
      await request(editando ? `${API_URL}/${editandoId}` : API_URL, {
        method: editando ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      cancelar()
      await cargar()
    } catch {
      setError('No se pudo guardar la nota.')
    } finally {
      setGuardando(false)
    }
  }

  const editar = (nota) => {
    setEditandoId(nota.id)
    setForm({ titulo: nota.titulo, descripcion: nota.descripcion })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar esta nota?')) return
    try {
      await request(`${API_URL}/${id}`, { method: 'DELETE' })
      if (id === editandoId) cancelar()
      await cargar()
    } catch {
      setError('No se pudo eliminar la nota.')
    }
  }

  return (
    <main className="app">
      <header className="header">
        <h1>
          Mis <span>notas</span>
        </h1>
        <span className="counter">
          {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
        </span>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <form className="form" onSubmit={guardar}>
        <h2 className="form-title">{editandoId !== null ? 'Editar nota' : 'Nueva nota'}</h2>
        <input
          className="field"
          name="titulo"
          value={form.titulo}
          onChange={cambiar}
          placeholder="Título"
          aria-label="Título"
          required
        />
        <textarea
          className="field"
          name="descripcion"
          value={form.descripcion}
          onChange={cambiar}
          placeholder="Escribe tu nota…"
          aria-label="Descripción"
          required
        />
        <div className="actions">
          {editandoId !== null && (
            <button type="button" className="btn" onClick={cancelar}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {editandoId !== null ? 'Guardar cambios' : 'Añadir nota'}
          </button>
        </div>
      </form>

      {cargando ? (
        <p className="state">Cargando notas…</p>
      ) : notas.length === 0 ? (
        <p className="state">Todavía no tienes notas. ¡Escribe la primera!</p>
      ) : (
        <ul className="grid">
          {notas.map((nota) => (
            <li
              key={nota.id}
              className="note"
              style={{ '--tape': `var(--tape-${nota.id % 5})` }}
            >
              <h3>{nota.titulo}</h3>
              <p>{nota.descripcion}</p>
              <div className="note-actions">
                <button className="btn btn-small" onClick={() => editar(nota)}>
                  Editar
                </button>
                <button className="btn btn-small btn-danger" onClick={() => borrar(nota.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
