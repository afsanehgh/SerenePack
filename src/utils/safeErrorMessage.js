function safeErrorMessage(error) {
  return String(error.message || 'Unknown error').replace(
    /(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi,
    '$1[REDACTED]@',
  );
}

module.exports = safeErrorMessage;
