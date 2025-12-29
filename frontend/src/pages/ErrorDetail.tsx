import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

type Props = {};

export const ErrorDetail = ({}: Props) => {
    const error = useRouteError();
    return (
        <div>
            {isRouteErrorResponse(error)
                ? 'Page not found'
                : (error as Error).message}
        </div>
    );
};
