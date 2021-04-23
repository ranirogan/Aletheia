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
from bs4 import BeautifulSoup
from typing import Optional
import logging

# Install using
# python -m spacy download en_core_web_sm
# Load out spacy model
nlp = spacy.load("en_core_web_md")

# Get our NLP models
nltk.download("punkt")
nltk.download("vader_lexicon")


app = Flask(__name__)
CORS(app)


@functools.lru_cache(maxsize=500)
def get_bias(source: str) -> Optional[str]:
    try:
        # Scrape the allsides website
        url = r"""https://www.allsides.com/media-bias/media-bias-ratings?field_featured_bias_rating_value=All
            &field_news_source_type_tid[1]=1&field_news_source_type_tid[2]=2&
            field_news_source_type_tid[3]=3&field_news_source_type_tid[4]=4&field_news_bias_nid_1[1]=1&
            field_news_bias_nid_1[2]=2&field_news_bias_nid_1[3]=3&title={}""".format(
            source
        )

        allsides = requests.get(url)

        # Run it through the parser
        soup = BeautifulSoup(allsides.text, "html.parser")

        # Grab this tag and the img url
        tag = soup.find("td", class_="views-field views-field-field-bias-image").find(
            "a"
        )["href"]

        # Grab the actual rating
        # Split the hypens into two words
        bias = tag.split("/")[-1].split("-")
        converted = " ".join(bias)

        return converted.title()

    except Exception as e:
        logging.error("Error getting source bias {}".format(e))
        # Any of the above may break
        # But its not critcal so we can return none
        return None


def check_paths() -> None:
    # We store these paths in /tmp
    # AWS cleans up temp every 24 hours
    # Make sure they're there
    for path in (TOP_DIRECTORY, MEMO_DIR, ANCHOR_DIRECTORY):
        try:
            os.mkdir(path)
        except FileExistsError:
            pass


def parse_ents(text: str, parsed):
    # Pull out special entities

    banned = ["DATE", "CARDINAL", "MONEY", "ORDINAL", "TIME", "QUANTITY", "PERCENT"]

    ents = [
        {"text": e.text, "label": e.label_, "count": text.count(e.text)}
        for e in parsed.ents
        # We've blacklisted all of these
        if e.label_ not in banned
    ]

    # Conver thtem into list for JSON
    ents = list({v["text"]: v for v in ents}.values())

    for ent in ents:
        # Check if wikipedia has any of these
        base = "https://en.wikipedia.org/w/api.php?action=opensearch&search={}&limit=1&namespace=0&format=json".format(
            ent["text"]
        )

        resp = requests.get(base)
        j = resp.json()
        # Weird wikipedia api response
        if len(j[3]) > 0:
            # Grab the link
            ent["wiki"] = j[3][0]
        else:
            ent["wiki"] = ""

    return ents


def get_similar_articles(article):
    # Get google news rss feed with article title
    url = "https://news.google.com/rss/search?q={}".format(
        urllib.parse.quote_plus(article.title)
    )
    feed = feedparser.parse(url)

    # Take the next 10 articles
    entries = feed.entries[1:11]
    entries = [{"title": entry.title, "url": entry.links[0].href} for entry in entries]

    for entry in entries:
        try:
            # Grab these articles and check their sentiment
            compare = Article(entry["url"])
            compare.download()
            compare.parse()
            sid = SentimentIntensityAnalyzer()
            entry["sediment"] = sid.polarity_scores(compare.text)
            entry["source_bias"] = get_bias(compare.meta_site_name)
        except Exception as e:
            # Probably a scraping error, move on
            logging.error("Error getting similar article info {}".format(e))

    return entries


@functools.lru_cache(maxsize=32)
def compute(url: str):
    check_paths()

    # Get the article from the URL
    article = Article(url)

    # Grab it from the server, pull out important parts
    article.download()
    article.parse()
    article.nlp()

    # Actual article text, used later
    text = article.text

    # Get the aritcle source (ie CNN)
    source = article.meta_site_name

    # Run sentiment on article text
    sid = SentimentIntensityAnalyzer()
    score = sid.polarity_scores(text)

    parsed = nlp(text)

    ents = parse_ents(text, parsed)
    entries = get_similar_articles(article)

    return jsonify(
        authors=article.authors,
        publish_date=article.publish_date,
        title=article.title,
        keywords=article.keywords,
        summary=article.summary,
        sentiment=score,
        entities=ents,
        similar=entries,
        source_bias=get_bias(source),
    )


@app.route("/", methods=["POST"])
def news():
    url = request.data.decode("utf-8")
    logging.info("Got request for {}".format(url))
    return compute(url)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
