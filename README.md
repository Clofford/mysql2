# Scraping/スクレイピング

## Overview/概要
This program is for scraping rakuten web site to get latest cd sales ranking
本プログラムは楽天の最新CDセールスランキングを取得するためのスクレイピングプログラムです。
AWS Lambdaで動作します。
APIが使えない場合のデータ取得の方法として考えました。

## How to use/使い方
Prepare Node.js environment on AWS Lambda to use this program.
Please register chrome-aws-lambda as "Layer" to apply Lambda

AWSのLambda上にNode.jsを準備して動かします。
Chrome-aws-lambdaをLayerとして登録して実行しようとする関数に適用してください。

## env の環境変数に必要な値

- mysql_host
- mysql_user
- mysql_dbname
- mysql_password

## 注意事項
過剰な実行はサイトに想定外の負荷を与えることになりかねないため、実行の際には注意してください。
