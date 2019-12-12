import pandas as pd
import numpy as np
import MySQLdb
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import cross_val_score
from sklearn.externals import joblib

conn = MySQLdb.connect(host='', user='', passwd='', db='')

query = "SELECT * FROM studentdata_view WHERE year >= 2007 AND year <2012;" #selects all students admitted between 2007 and 2011
df = pd.read_sql(query, conn) #loads records into a Pandas Data Frame

X = df[[ALL COURSE COLUMNS AND ADMISSION GPA]]
Y = df['persister']

#model parameters were tested using a brute-force method
model = RandomForestClassifier(n_estimators = 50, criterion = 'gini', max_leaf_nodes = 860, max_depth = 33, min_samples_split = 9, min_samples_leaf = 9, max_features = 'sqrt', oob_score=0 ,class_weight= None) #92%
scores = cross_val_score(model, X, y, scoring='accuracy', cv=10)
#print("Random Forest Classifier")
print "Cross validation scores: ", scores
print "Average training score: ", scores.mean()

model.fit(X, y)

#test_score = model.score(X_test, y_test)

#print "Test scores: ", test_score

print "saving model"
filename = 'randomforest_model.sav'

joblib.dump(model, filename)
print "model saved"
