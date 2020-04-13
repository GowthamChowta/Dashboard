# import pandas as pd;
import sys
from sklearn.metrics import accuracy_score,roc_auc_score
import pandas as pd
# metric=

# print("hello")

filepath=sys.argv[1]
metric=sys.argv[2]

filepath='uploads/test_y_o.csv'
metric='acc'

data_act=pd.read_csv('dataFiles/y_test.csv')


def calculate_acc_score(filepath):
    data_pred=pd.read_csv(filepath)
    data_pred=data_pred['y']
    return (accuracy_score(data_act,data_pred))


def calculate_rocauc_score(filepath):
    data_pred=pd.read_csv(filepath)
    data_pred=data_pred['y']
    return (roc_auc_score(data_act,data_pred))

if(metric=='acc'):
    print(calculate_acc_score(filepath))

elif(metric=='roc'):
    print(calculate_rocauc_score(filepath))
