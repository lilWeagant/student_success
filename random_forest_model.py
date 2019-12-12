import pandas as pd
import numpy as np
import MySQLdb
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import cross_val_score
from sklearn.externals import joblib

conn = MySQLdb.connect(host='', user='', passwd='', db='')

query = "SELECT * FROM studentdata_view WHERE year >= 2007 AND year <2012;" #selects year
df = pd.read_sql(query, conn)
