from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
import nltk
from newspaper import Article
from flask import Flask
from flask import request
from flask import jsonify
import spacy
import feedparser
import urllib.parse

# python -m spacy download en_core_web_sm
nlp = spacy.load("en_core_web_md")

nltk.download('punkt')
nltk.download('vader_lexicon')


app = Flask(__name__)


@app.route('/', methods=['POST'])
def news():
    url = request.data.decode('utf-8')
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()

    text = article.text

    sid = SentimentIntensityAnalyzer()
    score = sid.polarity_scores(text)

    parsed = nlp(text)
    ents = [{'text': e.text, 'label': e.label_,
             'count': text.count(e.text)} for e in parsed.ents]

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
