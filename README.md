# WordPressを構築するCDK
Backlogプロジェクトから直でリリースできるやつ

## How To Use
### 事前作業
- ドメインを取得しておく
    - ALBのDNS名で良ければいらない
- ACMが作成されていること
    - HTTPで良ければいらない

### ビルド (TypeScript)
1. `npm install` で必要なパッケージをインストールしておく
1. `npm run build` でコンパイルする

### ビルド (Python)
lambda functionとしてアップロードするのに必要なライブラリをインストールしてzipにする.
[ここ](https://github.com/pressmaninc/SlackArchivesChannel/tree/master/lambda)参照のこと.
1. `cd lambda`
1. `docker build -t e-learning-python-package-manager .` (ぶっちゃけコンテナ名は何でも良い)
1. `docker run -v "$PWD":/var/task e-learning-python-package-manager`

### デプロイ
1. `cdk.sample.json` をコピーして `cdk.json` を作成する
1. 必要なパラメータを追記していく
1. `cdk bootstrap` (既にCDKツールがデプロイされていれば不要)
1. `cdk deploy "*"` で全部インストール
1. 不要なStackがあるなら引数で必要なやつだけ指定してもOK

### 事後作業
1. 作成したRDSのパスワードを設定する (コンソールでやる)

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
