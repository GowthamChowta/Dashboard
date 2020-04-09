# import pandas as pd;
import sys
from sklearn.metrics import accuracy_score
import pandas as pd
# metric=

# print("hello")

path=sys.argv[1]
data_act=pd.read_csv('dataFiles/assign1.csv')


def calculate_score(filepath):
    data_pred=pd.read_csv(filepath)
    data_pred=data_pred['y']
    return (accuracy_score(data_act,data_pred))

print(calculate_score(path))
