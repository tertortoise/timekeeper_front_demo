const apiDomain = `http://localhost:8080`

export enum fetchMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}


export const fetchData = async <T>(
    url: string,
    fetchOptions?: RequestInit,
    body?: T
): Promise<void> => {

    const headers = new Headers();
    headers.set('Accept', 'application/json');

    const options: RequestInit = {
        method: fetchMethods.POST,
    }
    if (!fetchOptions) {
        options.method = fetchMethods.GET;
    } else if (fetchOptions?.method === 'POST' || fetchOptions?.method === 'PUT') {
        headers.set('Content-Type','application/json;charset=UTF-8');
    }
    if (options.headers) {
        options.headers = headers;
    }

    if (body) {
        try {
            options.body = JSON.stringify(body);
        } catch (e) {
            //TEMP change to throw Error
            throw new Error('error serializing fetch request body');
        }
    }

    const response = await fetch(`${apiDomain}/${url}`, options);
    const json = await response.json();

    if (json?.status?.statusCode === 200) {
        return json.data;
    } else {
        const message = json?.status?.message ?? 'error fetching data'
        throw new Error(message);
    }

}