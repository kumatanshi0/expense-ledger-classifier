from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re

app = Flask(__name__)
CORS(app)

vectorizer = joblib.load('vectorizer.pkl')
model = joblib.load('expense_model.pkl')

print("Model loaded successfully")
print(model.classes_) 


def extract_amount(text):
    text = text.replace(",", "")
    numbers = re.findall(r'\d+', text)  # findall returns ALL matches, not just first
    if numbers:
        amounts = [int(n) for n in numbers]  # convert each to int
        return max(amounts)  # pick the largest - usually the actual money amount
    return None

def determine_type_and_category(text, ml_category):
    income_keywords = ["salary", "bonus", "income", "interest", "dividend", "received", "credited"]
    electricity_keyword= ["electricity bill","light bill","bill"]
    text_lower = text.lower()
    
    for keyword in income_keywords:
        if keyword in text_lower:
            return "Income", keyword.capitalize()  # override category too
    
    for keyword in electricity_keyword:
        if keyword in text_lower:
            return "Expense", keyword.capitalize()
    
    return "Expense", ml_category  # fall back to ML prediction

def extract_account(text):
    known_banks = ["HDFC", "SBI", "ICICI", "Axis"]
    for bank in known_banks:
        if bank.lower() in text.lower():
            return bank
    return None

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    text = data.get('text', '')

    vector = vectorizer.transform([text])
    ml_category = str(model.predict(vector)[0])
    amount = extract_amount(text)
    txn_type, category = determine_type_and_category(text, ml_category)
    account = extract_account(text)
    result = {"Category": category, "Amount": amount, "Type": txn_type}
    if account:
        result["Account"] = account
    return result

@app.route('/categories', methods=['GET'])
def get_categories():
    categories= model.classes_
    return jsonify({"categories": list(categories)})   

if __name__ == '__main__':
    app.run(debug=True, port=5000)