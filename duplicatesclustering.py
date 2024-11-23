from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer("backend/stsb-distilbert-base-quora-duplicate-questions")
def detectduplicate(sentences):
    if(sentences==[]):
        return []
    if(len(sentences)==1):
        return sentences
    print(sentences)
    embeddings = model.encode(sentences)

    similarities = cosine_similarity(embeddings)
    print(similarities)


    printed=[]
    lst=[]
    binary_similarities = (similarities > 0.75).astype(int)
    for i in range(len(similarities)):
        for j in range(len(similarities)):
            if i != j and binary_similarities[i][j] ==1 and i not in printed:
                printed.append(i)
                printed.append(j)
                lst.append(sentences[i])
                print(" 1:", sentences[i])

    for i in range(len(similarities)):
        if i not in printed:
            lst.append(sentences[i])
            print(" 2:", sentences[i])
    return lst
