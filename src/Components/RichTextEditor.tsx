import React, {useCallback} from 'react'
import {
  DraftHandleValue,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  SelectionState,
  getDefaultKeyBinding,
} from 'draft-js'
import 'draft-js/dist/Draft.css'

interface RichTextEditorProps {
  editorState: EditorState
  setEditorState: (editorState: EditorState) => void
}

const styleMap = {
  COLOR_RED: {
    color: 'rgba(255, 0, 0, 1.0)',
  },
}

const handleHashtagToHeading = (
  editorState: EditorState,
  setEditorState: (arg: EditorState) => void
) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const currentBlockKey = selection.getStartKey()
  const currentBlock = contentState.getBlockForKey(currentBlockKey)
  const blockText = currentBlock.getText()

  if (blockText.startsWith('#')) {
    const newContentState = Modifier.replaceText(
      contentState,
      selection.merge({anchorOffset: 0, focusOffset: 1}),
      ''
    )

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'change-block-type'
    )

    setEditorState(RichUtils.toggleBlockType(newEditorState, 'header-one'))
    return 'handled'
  }
  return 'not-handled'
}

const handleAsteriskToStyle = (
  editorState: EditorState,
  setEditorState: (editorState: EditorState) => void,
  style: string,
  asteriskCount: number
) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const currentBlock = contentState.getBlockForKey(selection.getStartKey())
  const blockText = currentBlock.getText()
  const asteriskIndex = blockText.indexOf('*'.repeat(asteriskCount))

  if (asteriskIndex !== -1) {
    const targetRange = selection.merge({
      anchorOffset: asteriskIndex,
      focusOffset: asteriskIndex + asteriskCount,
    })

    const newContentState = Modifier.replaceText(contentState, targetRange, '')

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      'change-inline-style'
    )

    const entireBlockSelection = SelectionState.createEmpty(
      currentBlock.getKey()
    ).merge({
      anchorOffset: 0,
      focusOffset: currentBlock.getLength() - asteriskCount,
    })

    newEditorState = EditorState.forceSelection(
      newEditorState,
      entireBlockSelection
    )

    newEditorState = RichUtils.toggleInlineStyle(newEditorState, style)

    setEditorState(newEditorState)
    return 'handled'
  }

  return 'not-handled'
}

const handleInsertCodeBlock = (
  editorState: EditorState,
  setEditorState: (arg: EditorState) => void
) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const currentBlockKey = selection.getStartKey()
  const currentBlock = contentState.getBlockForKey(currentBlockKey)
  const blockText = currentBlock.getText()

  if (blockText.startsWith('```')) {
    const newContentState = Modifier.replaceText(
      contentState,
      selection.merge({anchorOffset: 0, focusOffset: 3}),
      ''
    )

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'change-block-type'
    )

    setEditorState(RichUtils.toggleBlockType(newEditorState, 'code-block'))
    return 'handled'
  }
  return 'not-handled'
}

const handleKeyCommand = (
  editorState: EditorState,
  setEditorState: (editorState: EditorState) => void
) => {
  return (command: PropertyKey) => {
    switch (command) {
      case 'hashtag-to-heading':
        return handleHashtagToHeading(editorState, setEditorState)
      case 'asterisk-to-bold':
        return handleAsteriskToStyle(editorState, setEditorState, 'BOLD', 1)
      case 'asterisk-to-red':
        return handleAsteriskToStyle(
          editorState,
          setEditorState,
          'COLOR_RED',
          2
        )
      case 'asterisk-to-underline':
        return handleAsteriskToStyle(
          editorState,
          setEditorState,
          'UNDERLINE',
          3
        )
      case 'insert-code-block':
        return handleInsertCodeBlock(editorState, setEditorState)

      default:
        return 'not-handled'
    }
  }
}

const keyBindingFn =
  (editorState: {getSelection: () => any; getCurrentContent: () => any}) =>
  (e: React.KeyboardEvent<{}>) => {
    if (e.code === 'Space' && !e.shiftKey) {
      const selection = editorState.getSelection()
      const currentBlockKey = selection.getStartKey()
      const contentState = editorState.getCurrentContent()
      const currentBlock = contentState.getBlockForKey(currentBlockKey)
      const blockText = currentBlock.getText()

      if (blockText.startsWith('#') && selection.getStartOffset() === 1) {
        return 'hashtag-to-heading'
      }
      if (blockText.startsWith('*') && selection.getStartOffset() === 1) {
        return 'asterisk-to-bold'
      }
      if (blockText.startsWith('**') && selection.getStartOffset() === 2) {
        return 'asterisk-to-red'
      }
      if (blockText.startsWith('***') && selection.getStartOffset() === 3) {
        return 'asterisk-to-underline'
      }
      if (blockText.startsWith('```') && selection.getStartOffset() === 3) {
        return 'insert-code-block'
      }
    }
    return getDefaultKeyBinding(e)
  }

const RichTextEditor = ({editorState, setEditorState}: RichTextEditorProps) => {
  const onChange = useCallback(
    (newEditorState: EditorState) => setEditorState(newEditorState),
    [setEditorState]
  )

  const blockStyleFn = (block: {getType: () => any}) => {
    switch (block.getType()) {
      case 'code-block':
        return 'codeBlockStyle'
      default:
        return ''
    }
  }

  const handleReturn = (
    e: React.KeyboardEvent,
    editorState: EditorState
  ): DraftHandleValue => {
    const contentState = editorState.getCurrentContent()
    const selectionState = editorState.getSelection()
    const currentBlockKey = selectionState.getStartKey()
    const currentBlock = contentState.getBlockForKey(currentBlockKey)
    const blockType = currentBlock.getType()

    const toggleBlockTypes = ['header-one', 'code-block']

    if (toggleBlockTypes.includes(blockType)) {
      let newContentState = Modifier.splitBlock(contentState, selectionState)
      const blockKeyAfterSplit = newContentState
        .getSelectionAfter()
        .getStartKey()
      newContentState = Modifier.setBlockType(
        newContentState,
        SelectionState.createEmpty(blockKeyAfterSplit),
        'unstyled'
      )
      const newSelectionState = SelectionState.createEmpty(blockKeyAfterSplit)
      let newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-block-type'
      )
      newEditorState = EditorState.forceSelection(
        newEditorState,
        newSelectionState
      )
      setEditorState(newEditorState)
      return 'handled'
    }
    return 'not-handled'
  }

  return (
    <Editor
      editorState={editorState}
      onChange={onChange}
      placeholder='Write something!'
      customStyleMap={styleMap}
      handleKeyCommand={handleKeyCommand(editorState, setEditorState)}
      keyBindingFn={keyBindingFn(editorState)}
      blockStyleFn={blockStyleFn}
      handleReturn={handleReturn}
    />
  )
}

export default RichTextEditor
