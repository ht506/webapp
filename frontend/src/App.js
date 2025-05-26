import React, { useState, useEffect } from "react";

function App() {
  const [userId] = useState(() => {
    // Generate or load a unique ID for this browser
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', Math.random().toString(36).substring(2, 10));
    }
    return localStorage.getItem('userId');
  });

  const [username] = useState(() => {
    // Generate a random username like "BlueDragon42"
    const adjectives = ['Red', 'Blue', 'Green', 'Happy', 'Clever', 'Swift'];
    const nouns = ['Dragon', 'Phoenix', 'Wolf', 'Owl', 'Fox', 'Eagle'];
    if (!localStorage.getItem('username')) {
      const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
        nouns[Math.floor(Math.random() * nouns.length)]}${
        Math.floor(Math.random() * 100)}`;
      localStorage.setItem('username', randomName);
    }
    return localStorage.getItem('username');
  });
  
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
        console.log("Loaded notes:", data);
        setNotes(data);
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

   useEffect(() => {
    const interval = setInterval(() => {
      fetch('https://webapp-backend-9ugp.onrender.com/notes')
        .then(res => res.json())
        .then(serverNotes => {
          setNotes(prevNotes => {
            // Merge server data with local UI state (like 'isNew')
            return serverNotes.map(serverNote => {
              const localNote = prevNotes.find(n => n.id === serverNote.id);
              return localNote ? { ...serverNote, isNew: localNote.isNew } : serverNote;
            });
          });
        })
        .catch(console.error);
    }, 3000);
    return () => clearInterval(interval);
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
          color: selectedColor,
          userId: userId,       // Add this line
          username: username    // Add this line
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
    const duration = 30 + Math.random() * 30; // Slower, smoother movement
    const delay = Math.random() * 10; // More random timing
    return { 
      duration,
      delay,
      startX: Math.random() * 100, // Random starting positions
      startY: Math.random() * 100,
      moveX: (Math.random() - 0.5) * 200, // Wider movement range
      moveY: (Math.random() - 0.5) * 200
    };
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
      const response = await fetch(`https://webapp-backend-9ugp.onrender.com/notes/${noteId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: replyText.trim(),
          userId: userId,       // ▼▼▼ ADD THIS LINE
          username: username    // ▼▼▼ ADD THIS LINE
        })
      });
      const newReply = await response.json();
  
      // 2. OPTION A: Optimistic UI Update (fast but might need backup sync)
      setNotes(prevNotes =>
        prevNotes.map((note, idx) =>
          idx === openedNoteIndex
            ? { ...note, replies: [...(note.replies || []), newReply] }
            : note
        )
      );
  
      // 2. OPTION B: Full Sync (slower but bulletproof - add this BELOW Option A)
      const updatedNotes = await fetch(
        "https://webapp-backend-9ugp.onrender.com/notes"
      ).then((res) => res.json());
      setNotes(updatedNotes);
  
      setReplyText("");
    } catch (error) {
      console.error("Failed to save reply:", error);
      // Optional: Revert optimistic update here if using Option A
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
        /* Smoother Floating Animation */
        @keyframes floatAround {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -15px) rotate(2deg); }
          50% { transform: translate(-10px, -25px) rotate(-1deg); }
          75% { transform: translate(-20px, 5px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
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

        .note-card-content {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .note-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 8px;
        }
        
        .note-card.floating {
          animation: floatAround 25s ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.5s);
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
        
        /* Minimalist Scrollbar */
        .reply-container {
          max-height: 300px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #444 #222;
          padding-right: 4px;
        }

        .reply-container::-webkit-scrollbar {
          width: 4px;
        }

        .reply-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .reply-container::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 2px;
        }
        
        /* Improved Reply Cards */
        .reply-card {
          min-height: 90px;
          padding: 12px 16px;
          margin: 10px 0;
          position: relative;
          border-radius: 12px;
        }
        
        .reply-card.you {
          background: #264B9A; /* Blue for your replies */
          align-self: flex-start;
          margin-left: 12px;
        }
        
        .reply-card.others {
          background: #2E7D32; /* Green for others */
          align-self: flex-end;
          margin-right: 12px;
        }
        
        /* Left arrow for your replies */
        .reply-card.you::after {
          content: '';
          position: absolute;
          left: -10px;
          bottom: 10px;
          border-width: 8px 10px 8px 0;
          border-style: solid;
          border-color: transparent #264B9A transparent transparent;
        }
        
        /* Right arrow for others' replies */
        .reply-card.others::after {
          content: '';
          position: absolute;
          right: -10px;
          bottom: 10px;
          border-width: 8px 0 8px 10px;
          border-style: solid;
          border-color: transparent transparent transparent #2E7D32;
        }
        
        .reply-username {
          font-weight: bold;
          font-size: 0.8rem;
          margin-bottom: 4px;
          color: white;
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

        /* Button Alignment Fix */
        .open-note-btn {
          align-self: flex-end;
          margin-top: auto;
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
            perspective: 1000, 
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
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={(e) => {
                  if (!e.target.closest('button, a')) {
                    openNoteThread(index);
                  }
                }}
              >
                {/* Username and Text Content */}
                <div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.8rem',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {note.username || 'Anonymous'}
                  </div>
                  <div style={{ 
                    flex: "1 1 auto",
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {note.text}
                  </div>
                </div>
              
                {/* Date and Button */}
                <div>
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
              </div>
            );
          })}
        </div>

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
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {notes[openedNoteIndex].username || 'Anonymous'}
                </div>
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
                <div className="reply-container">
                  {notes[openedNoteIndex].replies?.map((reply, idx) => (
                    <div 
                      key={idx} 
                      className={`reply-card ${
                        reply.userId === userId ? 'you' : 'others'
                      }`}
                    >
                      <div className="reply-username">
                        {reply.username || 'Anonymous'}
                      </div>
                      <div>{reply.text}</div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.5, marginTop: "0.2rem" }}>
                        {new Date(reply.createdAt).toLocaleString("en-US", {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
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
