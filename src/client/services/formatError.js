function formatError(error) {
  const response = error.response;
  if (response && response.data) {
    const { message, errors, requestId } = response.data;
    const details = Array.isArray(errors)
      ? errors
          .map(({ field, message: detail }) => `${field}: ${detail}`)
          .join('; ')
      : '';
    const requestReference = requestId ? ` (reference: ${requestId})` : '';
    return `${message || 'The request failed.'}${details ? ` ${details}` : ''}${requestReference}`;
  }

  if (error.code === 'ECONNREFUSED') {
    return 'Cannot reach the API. Start the server and try again.';
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The API request timed out. Check the server and try again.';
  }

  return 'The request could not be completed. Check your connection and try again.';
}

module.exports = formatError;
