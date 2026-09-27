# Expense Ledger — AI Expense Classifier

A small full-stack app that classifies personal expense/income transactions
from plain text (e.g. "Paid electricity bill of 1200 rupees") using a
scikit-learn text classification model, with a human-in-the-loop correction
workflow so the system can improve from user feedback over time.

Built as a learning project to understand core ML concepts (text
vectorization, Naive Bayes classification) and connect them to a real,
usable full-stack application — this feeds into a larger e-commerce
dashboard project where automated expense categorization is one component.

## Features

- Classifies free-text transaction descriptions into a category (Food,
  Shopping, Travel, EMI, Investment, etc.), extracts the amount, and
  determines whether it's income or an expense.
- Confidence score shown alongside every prediction.
- Confirm/correct workflow — if the model gets it wrong, the user can pick
  the right category from a dropdown and optionally leave a note on what
  was wrong.
- Corrections are logged to a CSV and can be folded back into the training
  data via a retraining script, so accuracy improves over time instead of
  staying static.

## Tech stack

- **ML:** Python, scikit-learn (CountVectorizer + Multinomial Naive Bayes), pandas
- **Backend:** Flask (REST API serving predictions and handling corrections)
- **Frontend:** React (Vite)

## Project structure

```
expense-classifier-backend/
  app.py            - Flask API (classify, categories, correct endpoints)
  retrain.py         - combines original data + corrections, retrains the model
  requirements.txt
  expense_model.pkl  - trained model (not in repo, see setup below)
  vectorizer.pkl      - trained vectorizer (not in repo, see setup below)

src/ (frontend)
  App.jsx            - main UI: classify, confirm/correct, results
  App.css
```

## Setup

**1. Get the training data and trained model**

This repo does not include the training CSV or the trained `.pkl` files
(kept out of version control — see Notes below). To set these up:
- Download the training dataset (Indian Banking Transaction Text Dataset,
  Kaggle) and place it in `expense-classifier-backend/`.
- Train the model (see the Colab notebook used for this project, or run
  the equivalent pipeline locally), then save the outputs:
  ```python
  import joblib
  joblib.dump(model, 'expense_model.pkl')
  joblib.dump(vectorizer, 'vectorizer.pkl')
  ```
- Place both `.pkl` files in `expense-classifier-backend/`.

**2. Run the backend**
```bash
cd expense-classifier-backend
python -m venv venv
venv\Scripts\activate      # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
python app.py
```

**3. Run the frontend** (in a separate terminal)
```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

**4. (Optional) Retrain after collecting corrections**
```bash
cd expense-classifier-backend
python retrain.py
```
This combines the original training data with any corrections logged in
`corrections.csv`, retrains the model, and overwrites the `.pkl` files.
Restart the Flask server afterward to load the updated model.

## Notes on excluded files

`corrections.csv`, the original training CSV, and both `.pkl` model files
are intentionally excluded from this repo (via `.gitignore`):
- The training CSV is a third-party dataset, not something to redistribute.
- The `.pkl` files are generated artifacts, regenerable from the training
  step above.
- `corrections.csv` is live, user-generated data rather than source code.

## What I learned building this

- Core ML pipeline: text -> vectorization (Bag of Words) -> classification ->
  evaluation, and why dataset size/balance matters more than model choice
  at small scale.
- Why a classifier can only ever predict labels it was trained on — and
  designing around that limitation (confidence thresholds, human review)
  instead of expecting the model to "just know."
- Connecting a Python ML backend to a React frontend via a REST API,
  including debugging real issues like CORS and case-sensitive JSON key
  mismatches between frontend and backend.
- React state management fundamentals (useState, useEffect, controlled
  inputs) built up from scratch, one small feature at a time.
- Designing a human-in-the-loop feedback pipeline: logging corrections
  separately from training data, and retraining as a deliberate, reviewed
  step rather than automatically on every correction.

## Planned next steps

- An approval/review step for corrections before they're used in
  retraining, to guard against bad or inconsistent corrections corrupting
  the model.
- User authentication (login/signup), so corrections and expense records
  can be tied to individual users.
- A manual expense-entry page and a records/history page backed by a
  proper database.
- Free-text correction understanding (e.g. "this should be transport, not
  shopping") via an LLM call, as a more flexible alternative to the
  dropdown-based correction.
- Swapping CountVectorizer for multilingual sentence embeddings to handle
  slang and mixed-language (Hindi/Hinglish) input.
