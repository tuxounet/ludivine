
import os
import sys
import nltk


def addhistory(command):
    file_object = open('sample.txt', 'a')
    file_object.write(command + "\n")
    file_object.close()


def corpus(query):

    nltk.download("punkt")
    from nltk.corpus.reader.plaintext import PlaintextCorpusReader

    corpus = PlaintextCorpusReader(os.getcwd(), "corpus.txt")
    paragraphs = corpus.paras()
    sentences = corpus.sents()
    words = corpus.words()
    print("paragraphs", len(paragraphs))
    print("sentences", len(sentences))
    print("words", len(words))

    words_freq_dist = nltk.FreqDist(words)
    top_words = words_freq_dist.most_common(10)
    print("top words", top_words)

    for word in query:
        print("frequency for", word,  words_freq_dist.get(word))


def tokenize(query):
    from nltk.tokenize import RegexpTokenizer
    tokenizer = RegexpTokenizer(r'\w+')
    tokens_without_punct = tokenizer.tokenize(query)
    tokens_lowercase = [word.lower() for word in tokens_without_punct]
    print("tokens_lowercase", tokens_lowercase)
    return tokens_lowercase


def cleanup(tokens):
    nltk.download("stopwords")
    stops = nltk.corpus.stopwords.words('french')
    tokens_fulls = list(filter(lambda token: token not in stops, tokens))
    print("tokens_fulls", tokens_fulls)


print('Number of arguments:', len(sys.argv), 'arguments.')
print('Argument List:', str(sys.argv))

query = sys.argv
del query[0]
command = " ".join(query)
print("command", command)


addhistory(command)
corpus(query)
tokens = tokenize(command)
cleanup(tokens)
