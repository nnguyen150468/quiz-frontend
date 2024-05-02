import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  let errorMessage: string;
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data;
  } else {
    errorMessage = "There is an error :(";
  }

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}
