import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Initialize DynamoDB Document Client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.drumId;

        if (!id) {
            return { statusCode: 400, body: "Missing 'id' in request"};
        }

        const getParams = { TableName: "DrumTable", Key: { id }};
        const result = await ddbDocClient.send(new GetCommand(getParams));

        if (!result.Item) {
            return { statusCode: 404, body: "Item not found" };
        }

        return { statusCode: 200, body: JSON.stringify(result.Item)};
    } catch (error) {
        console.error("Error reading from DynamoDB:", error);
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};
