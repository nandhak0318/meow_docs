import React from 'react'
import { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useCallback } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['link', 'image', 'blockquote', 'code-block'],
  ['clean'],
]

const SAVE_INTERVAL_MS = 1000

export default function TextEditor() {
  const { id: documentID } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return
    wrapper.innerHTML = ''
    const editor = document.createElement('div')
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText('loading....')
    setQuill(q)
  }, [])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      console.log('saving change..')
      const data = quill.getContents()
      socket.emit('save-changes', { id: documentID, data })
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once('load-document', (document) => {
      quill.setContents(document)
      quill.enable()
    })
    socket.emit('get-document', documentID)
  }, [socket, quill, documentID])

  useEffect(() => {
    const s = io(import.meta.env.VITE_SERVER_URL)
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])
  useEffect(() => {
    if (socket == null || quill == null) return
    const handler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('recieve-change', handler)
    return () => {
      socket.off('recieve-change', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return
    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return
      socket.emit('text-change', delta)
    }
    quill.on('text-change', handler)
    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  return (
    <>
      <header>
        <nav className="nav">
          <h1>Meow_Docs</h1>
        </nav>
      </header>
      <div className="container" ref={wrapperRef} />
    </>
  )
}
