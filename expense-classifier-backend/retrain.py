import pandas as pd
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

original=pd.read_csv('financial_transaction_train.csv')
corrections = pd.read_csv('corrections.csv')

original = original.rename(columns={"Transaction_Text":"text","Label":"category"})
corrections = corrections.drop(columns=["note"])

combined=pd.concat([original,corrections])
print(combined.shape)
print(combined['category'].unique())
print(combined.isnull().sum())

vectorizer = CountVectorizer()
X=vectorizer.fit_transform(combined['text'])
y=combined['category']

model=MultinomialNB()
model.fit(X,y)

joblib.dump(model,'expense_model.pkl')
joblib.dump(vectorizer,'vectorizer.pkl')

print("Retrained on",len(combined),"total rows")
print("Categories now:", model.classes_)