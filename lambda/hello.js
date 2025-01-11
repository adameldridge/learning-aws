exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({ message: "Hello, World!" }),
    };
};