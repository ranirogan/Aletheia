from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
import nltk
from newspaper import Article
from flask import Flask
from flask import request
from flask import jsonify
import spacy

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
    ents = [{'text': e.text, 'label': e.label_} for e in parsed.ents]

    return jsonify(
        authors=article.authors,
        publish_date=article.publish_date,
        title=article.title,
        keywords=article.keywords,
        summary=article.summary,
        sentiment=score,
        entities=ents
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
