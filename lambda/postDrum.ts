import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB Client and Document Client
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the table name from the environment variables
const tableName = process.env.TABLE_NAME!;

// Define the interface for the request body
interface RequestBody {
    id: string;
    brand: string;
    type: string;
    diameter: number;
}

// Lambda handler
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Validate and parse the request body
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body is required' }),
            };
        }

    const body: RequestBody = JSON.parse(event.body);

    // Basic validation of required fields
    if (!body.brand || !body.type || !body.diameter) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'brand, type, and diameter are required' }),
        };
    }

    const id = uuidv4();

    // Prepare the parameters for DynamoDB
    const params = {
        TableName: tableName,
        Item: {
            id: id,
            brand: body.brand,
            type: body.type,
            diameter: body.diameter,
        },
    };

    // Write the item to DynamoDB
    await ddbDocClient.send(new PutCommand(params));

    // Return success response
    return {
        statusCode: 200,
        body: JSON.stringify({ id: id}),
    };
    } catch (error: any) {
        // Handle errors and return appropriate response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
