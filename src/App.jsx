import { useState } from 'react'
import TextEditor from './TextEditor'
import { v4 as uuidv4 } from 'uuid'
import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidv4()}`}/>}
        ></Route>
        <Route path="/documents/:id" element={<TextEditor />}></Route>
      </Routes>
    </Router>
  )
}

export default App
