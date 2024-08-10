import React, { useEffect, useRef, useState } from 'react'
import {useContext} from 'react'
import { NoteContext } from '../context/NoteContext'
import { bodyParser, setNewOffset, setZIndex } from '../utils'
import { autoGrow } from '../utils'
import { db } from "../appwrite/databases";
import Spinner from '../icons/Spinner'
import DeleteButton from './DeleteButton';
const NoteCard = ({ note, setNotes }) => {
  const { setSelectedNote } = useContext(NoteContext);
  const [position, setPosition] = useState(JSON.parse(note.position))
  const [saving, setSaving] = useState(false)
  const keyUpTimer = useRef(null)
  let mouseStartPos = { x: 0, y: 0 }
  const cardRef = useRef(null)
  const colors = JSON.parse(note.colors)
  const body = bodyParser(note.body)
  const textAreaRef = useRef(null)
  useEffect(() => {
    autoGrow(textAreaRef)
    setZIndex(cardRef.current);
  }, [])
  const mouseDown = (e) => {
    if (e.target.className === "card-header") {
      setZIndex(cardRef.current)
      mouseStartPos = { x: e.clientX, y: e.clientY }
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    }
  }
  const mouseMove = (e) => {
    let mouseMoveDir = { x: mouseStartPos.x - e.clientX, y: mouseStartPos.y - e.clientY }
    mouseStartPos = { x: e.clientX, y: e.clientY }
    const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
    setPosition(newPosition)
  }
  const mouseUp = () => {
    document.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('mouseup', mouseUp)
    const newPosition = setNewOffset(cardRef.current);
    saveData('position', newPosition);
  }
  const saveData = async (key, value) => {
    const payload = { [key]: JSON.stringify(value) };
    try {
        await db.notes.update(note.$id, payload);
    } catch (error) {
        console.error(error);
    }
    setSaving(false)
  };
  const handleKeyUp = () => {
    setSaving(true)
    if(keyUpTimer.current) {
        clearTimeout(keyUpTimer.current)
    }
    keyUpTimer.current = setTimeout(() => {
        saveData('body', textAreaRef.current.value);
        setSaving(false)
    } , 2000)
  }
    return (
    <div
        className='card'
        style={{
            backgroundColor: colors.colorBody,
            left: `${position.x}px`,
            top: `${position.y}px`,
        }}
        ref={cardRef}
    >
        <div
            className='card-header'
            style={{
                backgroundColor: colors.colorHeader,
            }}
            onMouseDown={mouseDown}
        >{
          saving && (
              <div className="card-saving">
                  <Spinner color={colors.colorText} />
                  <span style={{ color: colors.colorText }}>Saving...</span>
              </div>
          )
      }<DeleteButton noteId={note.$id} setNotes={setNotes} /></div>
        <div 
            className='card-body'
        >
            <textarea
            style={{
                color: colors.colorText,
            }}
            ref={textAreaRef}
            defaultValue={body}
            onKeyUp={handleKeyUp}
            onFocus={() => {
              setZIndex(cardRef.current)
              setSelectedNote(note)
            }}
            onInput={() => autoGrow(textAreaRef)}
            ></textarea>
        </div>    
    </div>
  )
}

export default NoteCard