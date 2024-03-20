import {useState} from 'react'
import {EditorState, convertFromRaw, convertToRaw} from 'draft-js'

// Components
import Button from './Components/Button'
import RichTextEditor from './Components/RichTextEditor'
import Title from './Components/Title'

// Style
import './Styles/app.scss'

const loadEditorStateFromLocalStorage = () => {
  const savedContent = localStorage.getItem('editorContent')
  return savedContent
    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
    : EditorState.createEmpty()
}

const saveEditorStateToLocalStorage = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent()
  localStorage.setItem(
    'editorContent',
    JSON.stringify(convertToRaw(contentState))
  )
}

const App = () => {
  const [editorState, setEditorState] = useState(
    loadEditorStateFromLocalStorage
  )

  const handleSave = () => {
    saveEditorStateToLocalStorage(editorState)
  }

  return (
    <div className='editor-container'>
      <div className='editor-container-header'>
        <Title name='Kirankumar Gonti' />
        <Button onClick={handleSave} label='Save' />
      </div>
      <div className='editor-container-body'>
        <RichTextEditor
          editorState={editorState}
          setEditorState={setEditorState}
        />
      </div>
    </div>
  )
}

export default App
