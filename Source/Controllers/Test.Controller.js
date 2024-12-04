export const TestGetRequest = async (Request, Response) => {
    fetch('https://freetestapi.com/api/v1/currencies')
        .then(response => response.json())
        .then(async (json) => {
            return Response.json(
                {
                    message: `Worker ${process.pid} is handling the task...!`,
                    data: json
                }
            );
        });
}

export const TestPostRequest = async (Request, Response) => {
    const { data } = Request.body;

    return Response.json(
        {
            message: `Worker ${process.pid} is handling the task...!`,
            data: data
        }
    );
}