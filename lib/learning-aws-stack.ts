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

        // Create DynamoDB Table
        const drumTable = new dynamodb.Table(this, 'DrumTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'DrumTable',
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove table on stack delete (for dev/test only)
        });

        //  Create Lambda Function
        const getDrumFunction = new lambdaNodejs.NodejsFunction(this, 'GetDrum', {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: path.join(__dirname, '../lambda/getDrum.ts'), // Path to the Lambda function code
            handler: 'handler'
        });

        // Grant Lambda Permissions to Read from DynamoDB
        drumTable.grantReadData(getDrumFunction);

        // Define the API Gateway resource
        const api = new apigateway.LambdaRestApi(this, 'DrumAPI', {
            handler: getDrumFunction,
            proxy: false,
        });
            
        // Define the '/hello' resource with a GET method
        const resource = api.root.addResource('drums').addResource('{drumId}');
        resource.addMethod('GET');
    }
}
