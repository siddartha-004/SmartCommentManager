from transformers import RobertaForSequenceClassification, RobertaTokenizer
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


hate_model_path = "backend/my_roberta_model" 
hate_model = RobertaForSequenceClassification.from_pretrained(hate_model_path)
hate_tokenizer = RobertaTokenizer.from_pretrained(hate_model_path)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
hate_model.to(device)


spam_tokenizer = AutoTokenizer.from_pretrained("backend/roberta-spam")
spam_model = AutoModelForSequenceClassification.from_pretrained("backend/roberta-spam")
def predict_hate_speech(sentence):
    inputs = hate_tokenizer(sentence, padding=True, truncation=True, return_tensors="pt").to(device)
    outputs = hate_model(**inputs)
    predicted_class = outputs.logits.argmax(-1).item()
    return 1 if predicted_class == 1 else 0
    # return "Hate speech" if predicted_class == 1 else "Not hate speech"
def predict_spam_speech(sentence):
    inputs = spam_tokenizer(sentence, padding=True, truncation=True, return_tensors="pt").to(device)
    outputs = spam_model(**inputs)
    predicted_class = outputs.logits.argmax(-1).item()    
    return 2 if predicted_class == 1 else 0
    # return "Spam" if predicted_class == 1 else "Not spam"
def detecthateandspam(sentence):
    hate_predection = predict_hate_speech(sentence)
    spam_prediction = predict_spam_speech(sentence)
    if hate_predection+spam_prediction == 0:
        prediction = "Normal"
    elif hate_predection+spam_prediction == 1:
        prediction = "Hate speech"
    elif hate_predection+spam_prediction == 2:
        prediction = "Spam"
    else:
        prediction = "Hate speech and Spam"
    print(f"The sentence '{sentence}' is classified as: {prediction}")
    return hate_predection+spam_prediction