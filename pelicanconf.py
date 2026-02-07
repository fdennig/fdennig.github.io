AUTHOR = 'Francis Dennig'
SITENAME = 'Francis Dennig'
SITEURL = ""

PATH = "content"

TIMEZONE = 'Europe/Rome'

DEFAULT_LANG = 'en'

# THEME = 'notmyidea'
THEME = 'themes/pelican-bootstrap3'
# BOOTSTRAP_THEME = 'slate'
BOOTSTRAP_THEME = 'simplex' #'readable' #'simplex'
# PADDED_SINGLE_COLUMN_STYLE = True

JINJA_ENVIRONMENT = {'extensions': ['jinja2.ext.i18n']}
PLUGINS = ['i18n_subsites']

ARTICLE_PATHS = ['posts', 'publications', 'reports']
ARTICLE_URL = '{category}/{slug}/'
ARTICLE_SAVE_AS = '{category}/{slug}/index.html'

PAGE_PATHS = ['pages']
PAGE_URL = 'pages/{slug}/'
PAGE_SAVE_AS = 'pages/{slug}/index.html'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Custom category names used in templates
POSTS_CATEGORY = 'posts'
PUBLICATIONS_CATEGORY = 'publications'
DISPLAY_CATEGORIES_ON_MENU = False
DISPLAY_PAGES_ON_MENU = False  # hide automatic pages so we control order

# Custom menu (add Posts category link)
MENUITEMS = [
    ('Home', '/'),
    ('Posts', '/category/posts.html'),          # category listing for posts
    ('Publications', '/pages/publications/'),   # publications page
    ('Reports', '/pages/reports/'),             # reports page
    ('About', '/#about'),
]

# Blogroll
LINKS = (
    ("Google Scholar", "https://scholar.google.com/citations?user=6Xi_RjYAAAAJ&hl=en"),
    ("ORCID", "https://orcid.org/0000-0001-7362-1009"),
    ("UNDP", "https://www.undp.org/romecentre/our-team"),
)

# Social widget
SOCIAL = (
    ("LinkedIn", "https://www.linkedin.com/in/dr-francis-dennig-95624765/"),
    ("GitHub", "https://github.com/fdennig"),
)

DEFAULT_PAGINATION = 10

THEME_TEMPLATES_OVERRIDES = ['templates']

# Static assets (create folder to silence watcher warning)
STATIC_PATHS = ['images', 'css', 'files', 'static']
CUSTOM_CSS = 'css/custom.css'

# Optional custom menu (uncomment to use)
# MENUITEMS = [
#     ('Home','/'),
#     ('Publications','/publications/'),
# ]

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

HOME_CTA_TEXT = "Explore my work"
HOME_CTA_URL = "/pages/publications/"