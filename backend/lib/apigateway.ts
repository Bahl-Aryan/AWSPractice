import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

type ApiGatewayProps = {
    apiName: string,
    base: string,
    getSignedUrl: IFunction,
    saveFile: IFunction,
}

export const createApiGateway = (
    scope: Construct,
    props: ApiGatewayProps
) => {
    const api = new RestApi(scope, props.apiName, {
        restApiName: props.apiName,
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: Cors.ALL_METHODS,
            allowHeaders: Cors.DEFAULT_HEADERS
        }
    })

    const baseResource = api.root.addResource(props.base);

    const saveFileResource = api.root.addResource('save-file');

    const getSignedUrlIntegration = new LambdaIntegration(props.getSignedUrl)
    const saveFileIntegration = new LambdaIntegration(props.saveFile)
    baseResource.addMethod('POST', getSignedUrlIntegration, {
        methodResponses: [{
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Headers': true,
            },
        }],
    })
    saveFileResource.addMethod('POST', saveFileIntegration, {
        methodResponses: [{
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Headers': true,
            },
        }],
    })
    return api;
}