import json
import urllib.parse
import os
import tempfile
import shutil
import boto3
from dulwich import porcelain

BUCKET_NAME = os.environ['BUCKET_NAME']
ZIP_FILE_NAME = os.environ['ZIP_FILE_NAME']
USER = os.environ['USER']
PASS = os.environ['PASS']
REPOSITORY = os.environ['REPOSITORY']
BRANCH = os.environ['BRANCH']

def lambda_handler(event, context):
    body = json.loads(event["body"])
    content = body["content"]
    repository = content["repository"]["name"]
    projectKey = body["project"]["projectKey"]
    url = "https://pm1932.backlog.jp/git/" + projectKey + "/"
    branch = content["ref"][11:]

    print(f"repository:{repository} branch:{branch} uri:{url}")

    if repository == REPOSITORY and branch == BRANCH:
        # gitパスの生成
        site = urllib.parse.urlparse(url)
        userStr = urllib.parse.quote(USER)
        passStr = urllib.parse.quote(PASS)
        uri = site.scheme +"://" + userStr + ":" + passStr +"@" + site.netloc + site.path + repository + ".git"
        
        # 作業ディレクトリの生成
        tmpDir  = tempfile.mkdtemp()
        
        # clone/zip/upload
        try:
            porcelain.clone(uri, tmpDir)
            print("git clone success")
            
            zipFileName = tmpDir+ '/' + os.path.splitext(ZIP_FILE_NAME)[0]
            shutil.make_archive(zipFileName, 'zip', tmpDir )
            print("zip success")
            
            s3 = boto3.client('s3')
            s3.upload_file(zipFileName + '.zip', BUCKET_NAME, ZIP_FILE_NAME)
            print("s3 upload success")
        except Exception as e:
            print("ERROR" +  e)
        
        # 後始末
        shutil.rmtree(tmpDir)