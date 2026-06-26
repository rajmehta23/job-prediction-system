import pandas as pd
import numpy as np  
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report, confusion_matrix

import warnings 
warnings.filterwarnings("ignore")

data=pd.read_csv('job_prediction.csv')
# data.head()
# data.info()
# data.describe()
# data.isnull().sum()

x=data[['CGPA','Internships','Projects','Certifications','Aptitude','Communication']]
y=data['Placed']
x_train_multi,x_test_multi,y_train_multi,y_test_multi=train_test_split(x,y,test_size=0.4,random_state=42)
multi_model=LogisticRegression()
multi_model.fit(x_train_multi,y_train_multi)
y_pred_multi=multi_model.predict(x_test_multi)
print("Accuracy:", accuracy_score(y_test_multi, y_pred_multi))
cgpa = float(input("Enter CGPA: "))
internships = int(input("Enter Internships: "))
projects = int(input("Enter Projects: "))
certifications = int(input("Enter Certifications: "))
aptitude = int(input("Enter Aptitude Score: "))
communication = int(input("Enter Communication Score: "))

student = [[cgpa, internships, projects,
            certifications, aptitude, communication]]

prob = multi_model.predict_proba(student)[0][1]

print(f"\nPlacement Probability: {prob*100:.2f}%")

if prob >= 0.7:
    print("High chance of placement")
elif prob >= 0.4:
    print("Moderate chance of placement")
else:
    print("Low chance of placement")