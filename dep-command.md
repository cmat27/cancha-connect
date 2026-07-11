canchaconnect-deployments-dev
cd to backend
zip code:

zip code excluding files
zip -r backend.zip . -x "backend/server.js" "node_modules/_" ".git/_"

upload to s3

aws s3 cp backend.zip s3://canchaconnect-deployments-dev/backend.zip

deploy s3 to env
aws lambda update-function-code \
 --function-name CanchaConnect-processor-lambda \
 --s3-bucket canchaconnect-deployments-dev \
 --s3-key backend.zip \
 --publish

Repo

git remote add origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/canchaconnect-app
