import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const ErrorDetail = () => {
    const error = useRouteError();
    return (
        <div>
            {isRouteErrorResponse(error)
                ? 'Page not found'
                : (error as Error).message}
        </div>
    );
};
