from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import torch
import h5py
from transformers import BertForSequenceClassification, BertTokenizer
import re
from hateandspam import detecthateandspam
from duplicatesclustering import detectduplicate


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///messages.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
class ClusteredQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)  


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False)


model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def load_state_dict_from_h5(model, h5_file_path):
    with h5py.File(h5_file_path, 'r') as f:
        state_dict = {key: torch.tensor(f[key][()]) for key in f.keys()}
    model.load_state_dict(state_dict, strict=False)
    return model

model = load_state_dict_from_h5(model, r"C:\Users\Siddartha Reddy\Downloads\question2.h5")


def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        prediction = torch.argmax(logits, dim=-1).item()
    return prediction

def striptxt(text):
    fragments = re.split(r'[,.!;:](?:\s+|$)|\b(and|but|or)\b', text)
    return [frag.strip() for frag in fragments if frag and not frag.isspace()]

@app.route("/api/check_spam",methods=['POST'])
def check():
    print("hello")
    data=request.json.get("text","")
    print(data)
    return str(detecthateandspam(data))


@app.route('/api/clustered_questions', methods=['GET'])
def get_clustered_questions():
    clustered_questions = ClusteredQuestion.query.all()
    return jsonify([{"id": q.id, "text": q.text} for q in clustered_questions])

@app.route('/api/classify', methods=['POST'])
def classify():
    print("hello")
    data = request.json.get("text", "")
    fragments = striptxt(data)
    ans = 0
    for fragment in fragments:
        ans |= predict(fragment)

    result_type = "question" if ans else "statement"

    new_message = Message(text=data, type=result_type)
    db.session.add(new_message)
    db.session.commit()
    if(result_type=="question"):
        lst = [q.text for q in ClusteredQuestion.query.all()]
        lst.append(new_message.text)
        print("classify",lst)
        lst = detectduplicate(lst)
        print("duplicate",lst)

        ClusteredQuestion.query.delete()  
        for question in lst:
            clustered_question = ClusteredQuestion(text=question)
            db.session.add(clustered_question)
        db.session.commit()
    
    return jsonify({"id": new_message.id, "text": new_message.text, "type": new_message.type})
@app.route('/api/clear_all', methods=['DELETE'])
def clear_all():
    try:
        db.session.query(Message).delete()  
        db.session.query(ClusteredQuestion).delete()  
        db.session.commit()
        return jsonify({"message": "All records cleared successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500







@app.route('/api/messages', methods=['GET'])
def get_messages():
    messages = Message.query.all()
    return jsonify([{"id": msg.id, "text": msg.text, "type": msg.type} for msg in messages])

@app.route('/api/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    message = ClusteredQuestion.query.get(message_id)
    if message:
        db.session.delete(message)
        db.session.commit()
        return jsonify({"message": "Message deleted successfully."})
    return jsonify({"error": "Message not found."}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  
    app.run(host='0.0.0.0', debug=True)
