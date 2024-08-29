import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createApiGateway } from './apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    //s3 bucket
    const bucket = new s3.Bucket(this, 'FovusBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    
    //dynamoDB
    const table = new dynamodb.Table(this, 'FovusTable', {
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    const getSignedUrlLambda = new lambda.Function(this, 'GetSignedUrlHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.getSignedUrl',
      code: lambda.Code.fromAsset('lib/lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    });

    bucket.grantPut(getSignedUrlLambda)

    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'ApiGateway',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    })

    const getSignedUrlIntegration = new apigateway.LambdaIntegration(getSignedUrlLambda);
    api.root.addMethod('GET', getSignedUrlIntegration);
    /*

    const saveFileLambda = new lambda.Function(this, 'SaveFileHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.saveFile',
      code: lambda.Code.fromAsset('lib/lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName
      }
    });

    const api = createApiGateway(this, {
      apiName: 'upload',
      base: 'get-signed-url',
      getSignedUrl: getSignedUrlLambda,
      saveFile: saveFileLambda
    })

    bucket.grantReadWrite(getSignedUrlLambda)
    bucket.grantReadWrite(saveFileLambda)
    table.grantReadWriteData(saveFileLambda)
    */
  }
}
