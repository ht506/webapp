import React, { useState, useEffect } from "react";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For loading animation
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    dob: ''
  });
  const [notes, setNotes] = useState([]); // Simple empty array
  const [noteText, setNoteText] = useState("");
  const [openedNoteIndex, setOpenedNoteIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState('default'); // For color selection

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch('https://webapp-backend-9ugp.onrender.com/notes');
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  const clearNotes = () => {
    setNotes([]);
    localStorage.removeItem("notes");
  };

  const openNewNoteModal = () => setShowModal(true);
  const closeNewNoteModal = () => setShowModal(false);

  const handleSubmit = async () => {
    if (noteText.trim() === "") return;

    try {
      const response = await fetch('https://webapp-backend-9ugp.onrender.com/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: noteText.trim(),
          color: selectedColor
        })
      });
      const newNote = await response.json();
      
      setNotes([...notes, { ...newNote, isNew: true }]);
      setNoteText("");
      closeNewNoteModal();
      
      setTimeout(() => {
        setNotes(prevNotes => prevNotes.map(note => 
          note.id === newNote.id ? {...note, isNew: false} : note
        ));
      }, 2000);
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note to server");
    }
  };

  // Color options for notes
  const colorOptions = [
    { value: 'default', name: 'Default', bg: '#222', text: '#fff' },
    { value: 'blue', name: 'Blue', bg: '#264B9A', text: '#fff' },
    { value: 'green', name: 'Green', bg: '#2E7D32', text: '#fff' },
    { value: 'yellow', name: 'Yellow', bg: '#F9A825', text: '#000' },
    { value: 'red', name: 'Red', bg: '#C62828', text: '#fff' }
  ];

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

  const handleReplySubmit = async () => {
    if (replyText.trim() === "") return;

    try {
      const noteId = notes[openedNoteIndex].id;
      const response = await fetch(`http://localhost:8002/notes/${noteId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText.trim() })
      });
      const newReply = await response.json();

      setNotes(prevNotes => 
        prevNotes.map((note, idx) => 
          idx === openedNoteIndex
            ? { ...note, replies: [...(note.replies || []), newReply] }
            : note
        )
      );
      setReplyText("");
    } catch (error) {
      console.error("Failed to save reply:", error);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Registration data:', registerForm);
    setIsRegistering(false);
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
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(0,0,0,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        [style*="position: 'fixed'"] > div {
          animation: modalFadeIn 0.3s ease-out forwards;
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
          box-shadow: 0 6px 12px rgba(0,0,0,0.2); /* Enhanced drop shadow */
          cursor: pointer;
        }

        .note-card * {
          cursor: pointer;
        }

        .note-card button {
          pointer-events: auto;  
        }
        
        .note-card.floating {
          animation: floatAround var(--duration) ease-in-out infinite var(--delay);
        }
        
        .note-card:hover {
          animation: none;
          transform: translateY(-40px) scale(1.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          z-index: 9999 !important;
        }
        
        .note-card.is-new {
          animation: pulse 1.5s ease-out;
        }
        
        .loading-card {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .color-option {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin: 0 4px;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .color-option.selected {
          border-color: #fff;
          transform: scale(1.1);
        }

        .top-right-links {
          position: fixed;
          top: 2rem;
          right: 2rem;
          display: flex;
          gap: 1.5rem;
          z-index: 100;
        }

        .top-right-link {
          color: #fff;
          font-size: 0.9rem;
          opacity: 0.7;
          cursor: pointer;
          transition: opacity 0.2s ease;
          user-select: none;
        }

        .top-right-link:hover {
          opacity: 1;
          text-decoration: underline;
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
        <div className="top-right-links">
          <div 
            className="top-right-link" 
            onClick={() => setIsRegistering(true)}
          >
            Sign Up
          </div>
          <div 
            className="top-right-link"
            onClick={() => window.location.href = '/blog'}
          >
            Blog
          </div>
        </div>
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
            const colorConfig = colorOptions.find(c => c.value === note.color) || colorOptions[0];
            
            return (
              <div
                key={index}
                className={`note-card ${openedNoteIndex === null ? 'floating' : ''} ${
                  note.isNew ? 'is-new' : ''} ${
                  isLoading ? 'loading-card' : ''}`}
                style={{
                  position: "absolute",
                  top: `${10 + (index * 10) % 60}%`,
                  left: `${10 + (index * 15) % 70}%`,
                  width: "250px",
                  height: "80px",
                  background: colorConfig.bg,
                  color: colorConfig.text,
                  borderRadius: "10px",
                  padding: "0.8rem",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  userSelect: "text",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  '--duration': `${duration}s`,
                  '--delay': `${delay}s`,
                  transformOrigin: "center bottom",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  animationDelay: `${index * 0.1}s` // Stagger loading animation
                }}
                onClick={(e) => {
                  // Only open if click wasn't on the button or a link
                  if (!e.target.closest('button, a')) {
                    openNoteThread(index);
                  }
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
                    background: colorConfig.bg,
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.8rem",
                    color: colorConfig.text,
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
              
              {/* Color selection */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {colorOptions.map(color => (
                  <div
                    key={color.value}
                    className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                    style={{ background: color.bg }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              
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
        {/* Registration Modal */}
        {isRegistering && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000
            }}
            onClick={() => setIsRegistering(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#222',
                padding: '2rem 1.5rem', // Changed from 2rem to 2rem top/bottom, 1.5rem left/right
                borderRadius: '12px',
                width: '90%', // Changed from 100% to 90% of parent
                maxWidth: '400px',
                boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                margin: '0 20px', // Horizontal margin only
              }}
            >
              <h2 style={{ 
                marginBottom: '1.5rem', 
                textAlign: 'center',
                padding: '0 0.5rem' // Added horizontal padding to title
              }}>
                Create Account
              </h2>
              
              <form onSubmit={handleRegisterSubmit}>
                {/* Input Field Wrapper - Added padding here */}
                <div style={{ 
                  padding: '0 0.8rem', // Added horizontal padding
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem' // Space between form elements
                }}>
                  {/* Email Input */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      paddingLeft: '0.2rem' // Small label indent
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#333',
                        color: '#fff',
                        boxSizing: 'border-box' // Ensures padding doesn't affect width
                      }}
                    />
                  </div>

                  {/* Repeat similar structure for other fields */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#333',
                        color: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Password Input */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#333',
                        color: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#333',
                        color: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={registerForm.dob}
                      onChange={handleRegisterChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#333',
                        color: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#264B9A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      marginBottom: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
