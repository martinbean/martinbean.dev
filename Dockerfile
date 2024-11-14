FROM ruby:3.1.3

WORKDIR /usr/local/src

COPY Gemfile Gemfile.lock ./

RUN bundle install

EXPOSE 4000

ENTRYPOINT [ "bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--strict-front-matter", "--watch" ]
