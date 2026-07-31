# CanchaConnect Multi-Environment Deployment & Repository Guide

## Environment S3 Deployment Buckets
* **Dev**: `canchaconnect-deployments-dev`
* **Staging**: `canchaconnect-deployments-staging`
* **Prod**: `canchaconnect-deployments-prod`

---

## 1. Package Backend Code for Lambda
```bash
cd backend
npm install
zip -r ../backend.zip . -x "server.js" "test/*" "*.git*"
cd ..
```

---

## 2. Dynamic Deployment Commands by Environment

### 🟢 Development (`dev`)
```bash
# 1. Upload Lambda zip to dev bucket
aws s3 cp backend.zip s3://canchaconnect-deployments-dev/backend.zip

# 2. Deploy CloudFormation Stack
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name CanchaConnectStack-dev \
  --parameter-overrides Environment=dev DeploymentBucket=canchaconnect-deployments-dev AllowedOrigin="*" \
  --capabilities CAPABILITY_IAM

# 3. Build & Deploy Angular UI
cd frontend && npm install && npm run build -- --configuration production && cd ..
aws s3 sync frontend/dist/cancha-connect-ui s3://canchaconnect-ui-dev-<ACCOUNT_ID>/ --delete
```

### 🟡 Staging (`staging`)
```bash
# 1. Upload Lambda zip to staging bucket
aws s3 cp backend.zip s3://canchaconnect-deployments-staging/backend.zip

# 2. Deploy CloudFormation Stack
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name CanchaConnectStack-staging \
  --parameter-overrides Environment=staging DeploymentBucket=canchaconnect-deployments-staging AllowedOrigin="https://staging.canchaconnect.com" \
  --capabilities CAPABILITY_IAM

# 3. Build & Deploy Angular UI
cd frontend && npm install && npm run build -- --configuration staging && cd ..
aws s3 sync frontend/dist/cancha-connect-ui s3://canchaconnect-ui-staging-<ACCOUNT_ID>/ --delete
```

### 🔴 Production (`prod`)
```bash
# 1. Upload Lambda zip to prod bucket
aws s3 cp backend.zip s3://canchaconnect-deployments-prod/backend.zip

# 2. Deploy CloudFormation Stack
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name CanchaConnectStack-prod \
  --parameter-overrides Environment=prod DeploymentBucket=canchaconnect-deployments-prod AllowedOrigin="https://canchaconnect.com" \
  --capabilities CAPABILITY_IAM

# 3. Build & Deploy Angular UI
cd frontend && npm install && npm run build -- --configuration production && cd ..
aws s3 sync frontend/dist/canchaconnect s3://canchaconnect-ui-prod-<ACCOUNT_ID>/ --delete
```

---

## 3. Git Repository Setup
```bash
git remote set-url origin https://github.com/cmat27/cancha-connect.git
```


