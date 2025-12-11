"use client";

import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState, useRef } from "react";

interface Note {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
}

const COLORS = [
  "bg-yellow-200",
  "bg-green-200",
  "bg-pink-200",
  "bg-blue-200",
  "bg-purple-200",
];

export default function StickyNotes() {
  const constraintsRef = useRef(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      text: "Drag me around!",
      x: 100,
      y: 100,
      color: "bg-yellow-200",
      rotation: -2,
    },
    {
      id: 2,
      text: "Double click to delete",
      x: 400,
      y: 200,
      color: "bg-pink-200",
      rotation: 3,
    },
  ]);

  const addNote = () => {
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "",
        x: Math.random() * (window.innerWidth - 300),
        y: Math.random() * (window.innerHeight - 300),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 10 - 5,
      },
    ]);
  };

  const updateNoteText = (id: number, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (confirmDeleteId === id) setConfirmDeleteId(null);
  };

  return (
    <div
      className="min-h-screen bg-[#dccbb4] relative overflow-hidden"
      ref={constraintsRef}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <button
        onClick={addNote}
        className="fixed bottom-8 right-8 bg-slate-800 text-white rounded-full p-4 shadow-xl z-50 hover:bg-slate-700 transition-colors"
      >
        <Plus className="w-8 h-8" />
      </button>

      {notes.map((note) => (
        <motion.div
          key={note.id}
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          initial={{ x: note.x, y: note.y, rotate: note.rotation, scale: 0 }}
          animate={{ scale: 1 }}
          whileDrag={{
            scale: 1.1,
            boxShadow: "10px 10px 20px rgba(0,0,0,0.2)",
            zIndex: 100,
          }}
          className={`absolute w-64 h-64 p-6 ${note.color} shadow-lg cursor-move flex flex-col group`}
        >
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start if possible, though drag is on parent
              if (!note.text.trim()) {
                deleteNote(note.id);
              } else {
                setConfirmDeleteId(note.id);
              }
            }}
            className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-20"
            title="Delete Note"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Confirmation Overlay */}
          {confirmDeleteId === note.id && (
            <div className="absolute inset-0 bg-black/60 rounded flex flex-col items-center justify-center p-4 z-30 text-center animate-in fade-in duration-200 backdrop-blur-sm">
              <p className="text-white font-bold mb-4 font-sans text-lg">
                Are you sure?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  No
                </button>
              </div>
            </div>
          )}

          <div className="w-full h-8 bg-black/10 absolute top-0 left-0" />
          {/* Tape or header */}
          <textarea
            value={note.text}
            onChange={(e) => updateNoteText(note.id, e.target.value)}
            className="w-full h-full bg-transparent resize-none focus:outline-none font-handwriting text-xl text-slate-800 mt-4 leading-relaxed"
            spellCheck={false}
            placeholder="Type something..."
          />
          <div className="absolute bottom-2 right-2 text-xs text-black/20 select-none">
            ID: {note.id.toString().slice(-4)}
          </div>
        </motion.div>
      ))}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap");
        .font-handwriting {
          font-family: "Kalam", cursive;
        }
      `}</style>
    </div>
  );
}
