from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
import nltk
from newspaper import Article
from newspaper.settings import TOP_DIRECTORY, MEMO_DIR, ANCHOR_DIRECTORY
from flask import Flask
from flask import request
from flask import jsonify
import os
import spacy
import requests
import feedparser
import urllib.parse
import functools
from flask_cors import CORS

# python -m spacy download en_core_web_sm
nlp = spacy.load("en_core_web_md")

nltk.download('punkt')
nltk.download('vader_lexicon')


app = Flask(__name__)
CORS(app)


@functools.lru_cache(maxsize=32)
def compute(url):
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()

    text = article.text

    sid = SentimentIntensityAnalyzer()
    score = sid.polarity_scores(text)

    parsed = nlp(text)
    ents = [{'text': e.text, 'label': e.label_,
             'count': text.count(e.text)} for e in parsed.ents if e.label_ != 'DATE' and e.label_ != 'CARDINAL']
    ents = list({v['text']: v for v in ents}.values())

    for ent in ents:
        base = "https://en.wikipedia.org/w/api.php?action=opensearch&search={}&limit=1&namespace=0&format=json".format(
            ent['text'])
        resp = requests.get(base)
        j = resp.json()
        if len(j[3]) > 0:
            ent['wiki'] = j[3][0]
        else:
            ent['wiki'] = ''

    url = "https://news.google.com/rss/search?q={}".format(
        urllib.parse.quote_plus(article.title))
    feed = feedparser.parse(url)
    entries = feed.entries[1:11]
    entries = [{'title': entry.title, 'url': entry.links[0].href}
               for entry in entries]

    for entry in entries:
        try:
            compare = Article(entry['url'])
            compare.download()
            compare.parse()
            sid = SentimentIntensityAnalyzer()
            entry['sediment'] = sid.polarity_scores(compare.text)
        except:
            print('Error getting article')

    return jsonify(
        authors=article.authors,
        publish_date=article.publish_date,
        title=article.title,
        keywords=article.keywords,
        summary=article.summary,
        sentiment=score,
        entities=ents,
        similar=entries
    )


@app.route('/', methods=['POST'])
def news():
    for path in (TOP_DIRECTORY, MEMO_DIR, ANCHOR_DIRECTORY):
        try:
            os.mkdir(path)
        except FileExistsError:
            pass

    url = request.data.decode('utf-8')
    return compute(url)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
