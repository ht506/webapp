import React, { useState, useEffect } from "react";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map(note =>
        typeof note === "string"
          ? { text: note, createdAt: new Date().toISOString() }
          : note
      );
    } catch {
      return [];
    }
  });
  const [noteText, setNoteText] = useState("");
  const [openedNoteIndex, setOpenedNoteIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const clearNotes = () => {
    setNotes([]);
    localStorage.removeItem("notes");
  };

  const openNewNoteModal = () => setShowModal(true);
  const closeNewNoteModal = () => setShowModal(false);

  const handleSubmit = () => {
    if (noteText.trim() === "") return;
    if (noteText.trim().split(/\s+/).length > 200) {
      alert("Please keep your note under 200 words.");
      return;
    }
    setNotes([
      ...notes,
      { text: noteText.trim(), createdAt: new Date().toISOString(), replies: [] },
    ]);
    setNoteText("");
    closeNewNoteModal();
  };

  const getRandomAnimationProps = (index) => {
    const duration = 5 + Math.random() * 5;
    const delay = (index * 2) % duration;
    return { duration, delay };
  };

  const openNoteThread = (index) => {
    setOpenedNoteIndex(index);
  };

  const closeNoteThread = () => {
    setOpenedNoteIndex(null);
  };

  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim() === "") return;
    const updatedNotes = [...notes];
    if (!updatedNotes[openedNoteIndex].replies) {
      updatedNotes[openedNoteIndex].replies = [];
    }
    updatedNotes[openedNoteIndex].replies.push({
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    });
    setNotes(updatedNotes);
    setReplyText("");
  };

  return (
    <>
      <style>{`
        @keyframes floatAround {
        0% { transform: translate(0, 0); }
        25% { transform: translate(10px, -10px); }
        50% { transform: translate(0, -20px); }
        75% { transform: translate(-10px, -10px); }
        100% { transform: translate(0, 0); }
      }
        
      .blurred {
        filter: blur(4px);
        transition: filter 0.3s ease;
      }

      .note-card {
        transition: 
          transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.5),
          box-shadow 0.3s ease;
        will-change: transform, z-index;
        transform-origin: center bottom;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        z-index: 1;
      }

      .note-card.floating {
        animation: floatAround var(--duration) ease-in-out infinite var(--delay);
      }

      .note-card:hover {
        animation: none;
        transform: translateY(-40px) scale(1.08);
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        z-index: 9999 !important; /* Force above all others */
        transition: 
          transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.5),
          box-shadow 0.3s ease;
      }
    `}</style>

      <div
        style={{
          background: "#111",
          color: "#fff",
          height: "100vh",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h1
          style={{
            fontSize: "1.2rem",
            textAlign: "center",
            marginBottom: "2rem",
            userSelect: "none",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={openNewNoteModal}
        >
          Say It
        </h1>

        <button
          onClick={clearNotes}
          style={{
            display: "block",
            margin: "1rem auto",
            padding: "0.5rem 1rem",
            background: "#264B9A",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear All Notes
        </button>

        <div
          style={{
            position: "relative",
            height: "70vh",
            pointerEvents: openedNoteIndex !== null ? "none" : "auto",
            transformStyle: "preserve-3d",
            perspective: "1000px", 
            isolation: "isolate",
          }}
          className={openedNoteIndex !== null ? "blurred" : ""}
        >
          {notes.map((note, index) => {
            const { duration, delay } = getRandomAnimationProps(index);
            return (
              <div
                key={index}
                className={`note-card ${openedNoteIndex === null ? 'floating' : ''}`}
                style={{
                  position: "absolute",
                  top: `${10 + (index * 10) % 60}%`,
                  left: `${10 + (index * 15) % 70}%`,
                  width: "250px",
                  height: "80px",
                  background: "#222",
                  borderRadius: "10px",
                  padding: "0.8rem",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  cursor: "default",
                  userSelect: "text",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  '--duration': `${duration}s`,
                  '--delay': `${delay}s`,
                  transformOrigin: "center bottom",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div style={{ flex: "1 1 auto" }}>{note.text}</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    marginTop: "0.5rem",
                    opacity: 0.6,
                    userSelect: "none",
                  }}
                >
                  {new Date(note.createdAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <button
                  onClick={() => openNoteThread(index)}
                  style={{
                    marginTop: "6px",
                    alignSelf: "flex-start",
                    background: "#264B9A",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.3rem 0.8rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: "#fff",
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                >
                  Open It
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal for adding new note */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={closeNewNoteModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#222",
                padding: "2rem",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <textarea
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note here..."
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "none",
                  padding: "0.75rem",
                  resize: "none",
                  fontSize: "1rem",
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: "0.6rem 1.2rem",
                  background: "#264B9A",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Modal for opened note thread */}
        {openedNoteIndex !== null && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1100,
              padding: "1rem",
            }}
            onClick={closeNoteThread}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#222",
                padding: "2rem",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 0 30px rgba(0,0,0,0.7)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "1rem",
              }}
            >
              <div style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem" }}>
                {notes[openedNoteIndex].text}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.6,
                  userSelect: "none",
                }}
              >
                {new Date(notes[openedNoteIndex].createdAt).toLocaleString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}
              </div>

              {/* Replies */}
              <div
                style={{
                  borderTop: "1px solid #444",
                  marginTop: "1rem",
                  width: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {notes[openedNoteIndex].replies && notes[openedNoteIndex].replies.length > 0 ? (
                  notes[openedNoteIndex].replies.map((reply, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "0.8rem",
                        fontSize: "0.9rem",
                        background: "#333",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        textAlign: "left",
                      }}
                    >
                      <div>{reply.text}</div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          opacity: 0.5,
                          marginTop: "0.2rem",
                          userSelect: "none",
                        }}
                      >
                        {new Date(reply.createdAt).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#bbb",
                      padding: "1rem",
                    }}
                  >
                    No replies yet.
                  </div>
                )}
              </div>

              {/* Reply input */}
              <textarea
                rows={3}
                placeholder="Pop It (Reply here)..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "none",
                  padding: "0.75rem",
                  resize: "none",
                  fontSize: "1rem",
                  marginTop: "1rem",
                }}
              />
              <button
                onClick={handleReplySubmit}
                style={{
                  padding: "0.6rem 1.2rem",
                  background: "#264B9A",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  width: "100%",
                }}
              >
                Pop It
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
