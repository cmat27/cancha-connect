CanchaConnect API ⚽️

A serverless backend for managing local soccer tournaments, teams, and player registrations. Built with Node.js 24, AWS Lambda, API Gateway, and DynamoDB.

Architecture Highlights

Compute: AWS Lambda (Node.js 24.x) using the "Monolithic Lambda / Router" pattern.

API: Amazon API Gateway (HTTP API v2) for fast, cost-effective routing.

Database: Amazon DynamoDB utilizing a Single-Table Design for high performance.

Infrastructure as Code: AWS CloudFormation (template.yaml).

Prerequisites

Before deploying or developing locally, ensure you have the following installed:

Node.js (v24.0.0 or higher)

AWS CLI (Configured with your AWS credentials using aws configure)

zip command-line utility

Project Structure

cancha-connect/
│
├── infrastructure/ # CloudFormation templates
│ └── template.yaml # Main IaC definition
│
├── backend/ # Node.js Application Code
│ ├── src/  
│ │ ├── handlers/ # Controller layer (HTTP parsing)
│ │ ├── services/ # Core business logic
│ │ ├── data/ # DynamoDB Repository layer
│ │ ├── utils/ # Shared helpers (Response formatting)
│ │ └── index.js # Main API router / entry point
│ └── package.json  
│
└── README.md # You are here

Deployment Instructions

To deploy this project to your AWS account, follow these exact steps from the root of the project directory.

1. Create a Deployment Bucket (One-time setup)

AWS CloudFormation requires an S3 bucket to store your zipped Lambda code before it deploys the infrastructure.

aws s3 mb s3://canchaconnect-deployments-dev

(Note: S3 bucket names must be globally unique. If this fails, append your name or numbers to the end of the bucket name and update template.yaml to match).

2. Zip the Backend Code

Navigate into the backend folder, install dependencies, and zip the contents.

cd backend
npm install
zip -r ../backend.zip .
cd ..

3. Upload the Code to S3

Copy the zipped code to your deployment bucket so CloudFormation can access it.

aws s3 cp backend.zip s3://canchaconnect-deployments-dev/backend.zip

4. Deploy the CloudFormation Stack

Run the deployment command pointing to your infrastructure template. This provisions the DynamoDB table, IAM Roles, Lambda function, and API Gateway.

aws cloudformation deploy \
 --template-file infrastructure/template.yaml \
 --stack-name CanchaConnectStack \
 --capabilities CAPABILITY_IAM

Once completed, the CLI will output the live ApiEndpoint URL which you can use to interact with your API.

\*\*NOTES
##Development api
https://9g2g4hc3bc.execute-api.us-east-1.amazonaws.com/

##Run the following command to deploy the stack:
aws cloudformation deploy \
 --template-file template.yaml \
 --stack-name CanchaConnectStack \
 --capabilities CAPABILITY_IAM

##Once the deployment finishes, run this command to get your live API URL:
aws cloudformation describe-stacks \
 --stack-name CanchaConnectStack \
 --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
 --output text
