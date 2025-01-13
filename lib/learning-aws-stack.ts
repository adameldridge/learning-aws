import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class LearningAwsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Table
        const drumTable = new dynamodb.Table(this, 'DrumTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'DrumTable',
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        // Lambda - Get Drum
        const getDrumFunction = new lambdaNodejs.NodejsFunction(this, 'GetDrum', {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: path.join(__dirname, '../lambda/getDrum.ts'),
            handler: 'handler',
            environment: {
                TABLE_NAME: drumTable.tableName,
            }
        });

        drumTable.grantReadData(getDrumFunction);

        // Lambda - Post Drum
        const postDrumFunction = new lambdaNodejs.NodejsFunction(this, 'PostDrum', {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: path.join(__dirname, '../lambda/postDrum.ts'),
            handler: 'handler',
            environment: {
                TABLE_NAME: drumTable.tableName,
            }
        });

        drumTable.grantWriteData(postDrumFunction);


        // API Gateway
        const api = new apigateway.RestApi(this, 'DrumApi', {
            restApiName: 'Drums',
            description: 'API with multiple endpoints under the same root path',
        });
        
        const drumsResource = api.root.addResource('drums');

        // POST drums
        drumsResource.addMethod('POST', new apigateway.LambdaIntegration(postDrumFunction));

        // GET drums 
        const getDrumResource = drumsResource.addResource('{drumId}');
        getDrumResource.addMethod('GET', new apigateway.LambdaIntegration(getDrumFunction));
    }
}
