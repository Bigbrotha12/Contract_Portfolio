# Purpose

Lambda function to validate and sign token bridge transaction between testnets. To be used only for demonstration purposes.

Available networks:
1. Goerli
2. Binance Testnet
3. Polygon Testnet

## Build instruction

In function folder, create updated zip file containing code and modules but excluding enclosing directory.
```
cd backend/demo_helper
zip -r <ZIP_FILE_NAME>.zip .
```

Load zip file to AWS Lambda, manually or via CLI
```
aws lambda update-function-code --function-name <FUNCTION_NAME> --zip-file fileb://<ZIP_FILE_PATH> --region <AWS_REGION>
```
