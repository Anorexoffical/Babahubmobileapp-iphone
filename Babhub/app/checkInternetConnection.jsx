const checkInternetConnection = () => {
  return new Promise((resolve) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const request = fetch('https://www.google.com', { method: 'HEAD' });

    Promise.race([request, timeout])
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};