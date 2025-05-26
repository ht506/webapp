from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={
    r"/notes*": {
        "origins": ["https://webapp-frontend-snlk.onrender.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Database configuration (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database models
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    color = db.Column(db.String(20), default='default')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    replies = db.relationship('Reply', backref='note', lazy=True)
    user_id = db.Column(db.String(50))
    username = db.Column(db.String(50))

class Reply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=False)
    user_id = db.Column(db.String(50))
    username = db.Column(db.String(50))

# Create tables
with app.app_context():
    db.create_all()

# API Endpoints
@app.route('/notes', methods=['GET'])
def get_notes():
    notes = Note.query.all()
    return jsonify([{
        'id': note.id,
        'text': note.text,
        'color': note.color,
        'createdAt': note.created_at.isoformat(),
        'replies': [{
            'id': reply.id,
            'text': reply.text,
            'createdAt': reply.created_at.isoformat()
        } for reply in note.replies]
    } for note in notes])

# For creating notes
@app.route('/notes', methods=['POST'])
def create_note():
    data = request.get_json()
    new_note = Note(
        text=data['text'],
        color=data.get('color', 'default'),
        user_id=data['userId'],
        username=data['username']
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify({
        'id': new_note.id,
        'text': new_note.text,
        'color': new_note.color,
        'userId': new_note.user_id,  # Add this
        'username': new_note.username,  # Add this
        'createdAt': new_note.created_at.isoformat(),
        'replies': []
    }), 201

@app.route('/notes/<int:note_id>/replies', methods=['POST'])
def add_reply(note_id):
    data = request.get_json()
    new_reply = Reply(
        text=data['text'],
        note_id=note_id,
        user_id=data['userId'],
        username=data['username']
    )
    db.session.add(new_reply)
    db.session.commit()
    return jsonify({
        'id': new_reply.id,
        'text': new_reply.text,
        'userId': new_reply.user_id,  # Add this
        'username': new_reply.username,  # Add this
        'createdAt': new_reply.created_at.isoformat()
    }), 201

if __name__ == '__main__':
    app.run(port=8002, debug=True)
